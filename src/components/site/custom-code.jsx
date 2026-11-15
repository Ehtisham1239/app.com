import { SITE_URL } from "@/lib/config";
import { safeJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/site-data";
import { customCodeFromSettings, pageSchemaNodes, parseHeadCode } from "@/lib/custom-code";

const REACT_ATTRS = { crossorigin: "crossOrigin", referrerpolicy: "referrerPolicy", hreflang: "hrefLang" };

function props(attrs) {
  const out = {};
  for (const [name, value] of Object.entries(attrs)) out[REACT_ATTRS[name] || name] = value === true ? true : value;
  return out;
}

/**
 * CMS head code for public pages. React 19 places <meta>, <link> and async <script src> tags in
 * the document <head>; inline scripts render at the very start of the page body (before any
 * content). Only elements accepted by parseHeadCode are emitted.
 */
export function CustomHeadCode({ value, seo }) {
  const { elements } = parseHeadCode(value?.head_code, seo);
  if (!elements.length) return null;
  return elements.map(({ tag, attrs, content }, index) => {
    const key = `oqc-custom-${tag}-${index}`;
    if (tag === "meta") return <meta key={key} {...props(attrs)} />;
    if (tag === "link") return <link key={key} {...props(attrs)} />;
    if (attrs.src !== undefined) return <script key={key} {...props(attrs)} />;
    return <script key={key} {...props(attrs)} dangerouslySetInnerHTML={{ __html: content }} />;
  });
}

/** Page-level JSON-LD saved in Website settings → SEO code & schema, rendered in the initial HTML. */
export async function CmsPageSchema({ path }) {
  const settings = await getSettings();
  const nodes = pageSchemaNodes(customCodeFromSettings(settings), path, SITE_URL);
  if (!nodes.length) return null;
  const data = nodes.length === 1 ? { "@context": "https://schema.org", ...nodes[0] } : { "@context": "https://schema.org", "@graph": nodes };
  return <script type="application/ld+json" data-oqc-schema="page" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
