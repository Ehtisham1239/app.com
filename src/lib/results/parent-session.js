// Parent portal session cookie. The token is random (64 hex characters); the
// database stores only its SHA-256 and enforces the idle and absolute expiry.
export const PARENT_COOKIE = "oqc_parent";
export const PARENT_SESSION_SECONDS = 8 * 60 * 60;

export function validToken(token) {
  return typeof token === "string" && /^[0-9a-f]{64}$/.test(token);
}

export function parentCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: PARENT_SESSION_SECONDS, priority: "high" };
}
