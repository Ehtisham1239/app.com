// Cookie-authenticated mutations must not accept a cross-site browser request.
//
// Behind a reverse proxy (Hostinger runs `next start` behind its CDN) `request.url`
// carries the internal address, e.g. http://localhost:3000, not the public one, so
// comparing Origin against it alone rejects every same-site browser request. The
// public host the browser actually used arrives as X-Forwarded-Host / Host, which a
// cross-site page cannot set on the victim's request, so it is accepted as well.
function hostsOf(request) {
  const hosts = new Set();
  try { hosts.add(new URL(request.url).host.toLowerCase()); } catch { /* ignore */ }
  for (const name of ['x-forwarded-host', 'host']) {
    const value = request.headers.get(name);
    if (value) hosts.add(value.split(',')[0].trim().toLowerCase());
  }
  hosts.delete('');
  return hosts;
}

export function permitsMutation(request) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  if (!origin) return true; // Non-browser clients still require an authenticated staff session.
  let parsed;
  try { parsed = new URL(origin); } catch { return false; }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  return hostsOf(request).has(parsed.host.toLowerCase());
}
