export function isAdminAuthorized(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return true;
  }

  const provided = req.headers.get("x-admin-password");
  return provided === expected;
}
