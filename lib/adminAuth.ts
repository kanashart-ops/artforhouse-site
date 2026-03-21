import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "artforhouse-admin-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

type AdminSessionPayload = {
  username: string;
  expiresAt: number;
};

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  return {
    username,
    password,
    isConfigured: Boolean(username && password),
  };
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "artforhouse-dev-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function encodeSession(payload: AdminSessionPayload) {
  const serialized = JSON.stringify(payload);
  const encoded = Buffer.from(serialized, "utf8").toString("base64url");
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

function decodeSession(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  if (!safeEqual(sign(encoded), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (!payload.username || typeof payload.expiresAt !== "number") {
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return decodeSession(token);
}

export function getAdminAuthConfig() {
  const credentials = getAdminCredentials();

  return {
    requiresLogin: credentials.isConfigured || isProduction(),
    username: credentials.username ?? "admin",
  };
}

export function validateAdminLogin(username: string, password: string) {
  const credentials = getAdminCredentials();

  if (!credentials.isConfigured) {
    return !isProduction();
  }

  return username === credentials.username && password === credentials.password;
}

export async function createAdminSession(username: string) {
  const payload: AdminSessionPayload = {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(payload.expiresAt),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthorized(req?: Request) {
  const credentials = getAdminCredentials();

  if (!credentials.isConfigured) {
    return !isProduction();
  }

  const session = await getSessionFromCookies();
  if (session?.username === credentials.username) {
    return true;
  }

  const providedPassword = req?.headers.get("x-admin-password");

  return Boolean(providedPassword && providedPassword === credentials.password);
}
