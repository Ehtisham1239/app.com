export const PUBLIC_AUDIT_ORIGINS = [
  'https://www.onlinequrancollege.com',
  'https://project-umber-three-93.vercel.app',
  'https://appcom-online-quran-college.vercel.app',
];

export function auditOrigin(value = PUBLIC_AUDIT_ORIGINS[0]) {
  const url = new URL(value);
  const local = url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || (!local && !PUBLIC_AUDIT_ORIGINS.includes(url.origin))) {
    throw Error('Use the approved OQC canonical origin, existing Vercel origin or a local QA server; omit credentials, paths, query strings and fragments.');
  }
  return url;
}
