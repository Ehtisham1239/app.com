const WEB_PAGE_TYPES = new Set([
  "AboutPage",
  "CheckoutPage",
  "CollectionPage",
  "ContactPage",
  "FAQPage",
  "ItemPage",
  "MedicalWebPage",
  "ProfilePage",
  "QAPage",
  "SearchResultsPage",
  "WebPage",
]);

export function isWebPageIdentity(node, canonicalUrl) {
  const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
  if (!types.some((type) => WEB_PAGE_TYPES.has(type))) return false;
  if (typeof node?.url !== "string") return false;
  try {
    return new URL(node.url).href === new URL(canonicalUrl).href;
  } catch {
    return false;
  }
}
