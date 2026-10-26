// The staff portal already needs per-request rendering. Give it a strict script
// policy without turning the cacheable public website into dynamic pages.
export function staffContentSecurityPolicy(nonce, apiUrl, development = false) {
  if (!/^[A-Za-z0-9+/]{22}==$/.test(nonce)) throw Error("Invalid CSP nonce");
  const api = new URL(apiUrl);
  if (api.protocol !== "https:" || api.username || api.password) throw Error("Invalid API origin");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    // React/Tiptap/Sonner use inline style attributes and generated styles.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${api.origin} wss://${api.host}`,
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
