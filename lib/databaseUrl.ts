export function normalizeDatabaseUrl(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");
    const hasCompatFlag = url.searchParams.has("uselibpqcompat");

    if (sslMode === "require" && !hasCompatFlag) {
      url.searchParams.set("uselibpqcompat", "true");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}
