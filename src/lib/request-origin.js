// Cookie-authenticated mutations must not accept a cross-site browser request.
export function permitsMutation(request) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  if (!origin) return true; // Non-browser clients still require an authenticated staff session.
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
