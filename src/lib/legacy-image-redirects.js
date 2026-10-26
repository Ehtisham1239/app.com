// Preserve published responsive URLs when superseded image derivatives are
// removed. Map URLs already have their own two historical redirect patterns.
export function legacyImageRedirects(manifest) {
  const routes = new Map();
  for (const image of manifest) {
    const current = image.url.match(/^\/images\/learning\/([a-z0-9-]+)-1200\.webp$/)?.[1];
    if (!current) continue;
    for (const previous of image.previous_urls || []) {
      const old = previous.match(/^\/images\/learning\/([a-z0-9-]+)-1200\.webp$/)?.[1];
      if (!old || old === current || old.startsWith('map-')) continue;
      const source = `/images/learning/${old}-:width(400|800|1200).:format(webp|avif)`;
      routes.set(source, { source, destination: `/images/learning/${current}-:width.:format`, permanent: true });
    }
  }
  return [...routes.values()];
}
