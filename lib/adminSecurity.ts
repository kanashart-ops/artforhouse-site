import { createHash } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_TRACKED_CLIENTS = 1000;
type Attempt = { failures: number; expiresAt: number };
const attempts = new Map<string, Attempt>();

export function sameOriginAdminMutation(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(req.url).origin) return false;
    } catch {
      return false;
    }
  }

  const fetchSite = req.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
}

function clientKey(req: Request): string {
  // Best-effort per-instance throttling. Configure Vercel WAF for global limits.
  const forwarded =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const address = forwarded.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

export function getLoginDelay(req: Request): number {
  const key = clientKey(req);
  const entry = attempts.get(key);
  if (!entry) return 0;
  if (entry.expiresAt <= Date.now()) {
    attempts.delete(key);
    return 0;
  }
  return entry.failures >= MAX_FAILURES
    ? Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000))
    : 0;
}

export function recordFailedLogin(req: Request): void {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (entry.expiresAt <= now) attempts.delete(key);
  }
  const key = clientKey(req);
  const previous = attempts.get(key);
  const failures = previous && previous.expiresAt > now
    ? previous.failures + 1
    : 1;

  if (!attempts.has(key) && attempts.size >= MAX_TRACKED_CLIENTS) {
    const oldest = attempts.keys().next().value;
    if (oldest !== undefined) attempts.delete(oldest);
  }
  attempts.set(key, { failures, expiresAt: now + WINDOW_MS });
}

export function clearFailedLogins(req: Request): void {
  attempts.delete(clientKey(req));
}
