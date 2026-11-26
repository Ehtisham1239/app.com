// Extract only image URLs used by the .hero background-image declarations.
// This keeps CSS-backed hero artwork in the public-page quality audit without
// misclassifying a decorative background as an informative <img> requiring alt text.
export function heroBackgroundUrls(css) {
  const rule = String(css || "").match(/(?:^|})\s*\.hero\s*\{([^}]*)\}/i)?.[1] || "";
  const declarations = [...rule.matchAll(/background-image\s*:\s*([^;]+)/gi)].map((match) => match[1]).join(" ");
  return [...declarations.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)]
    .map((match) => match[2].trim())
    .filter((value) => value && !/^data:/i.test(value));
}
