// CMS-managed SEO code (Website settings → "SEO code & schema").
//
// Three parts, all rendered on the server so they are in the initial HTML:
//   head_code    — verification <meta>, <link> hints and <script> tags for the public site <head>.
//   schema       — site-wide JSON-LD. Organization/WebSite nodes MERGE into the built-in graph
//                  (same @id), so the site never publishes two organizations or two websites.
//   page_schemas — JSON-LD for individual paths ("/pricing", or "/blog/*" for a section).
//
// The admin form validates with these same functions, and the public render parses again and
// emits only allowlisted elements: a value written straight to the database cannot inject
// arbitrary HTML.
//
// Two settings rows, so access follows risk (migration 20261115120000_seo_custom_code.sql):
//   site.custom_schema — schema + page_schemas. JSON-LD is escaped and cannot run, so anyone with
//                        settings:update (Marketing/SEO) may edit it.
//   site.head_code     — head_code. Scripts run on every public page, so saving it needs
//                        seo_code:update (Super Admin and Administrator), enforced by a
//                        restrictive database policy, not only by the admin screen.

export const SCHEMA_KEY = "site.custom_schema";
export const HEAD_CODE_KEY = "site.head_code";
export const HEAD_CODE_PERMISSION = "seo_code:update";

/** Combine the two stored rows into the shape the helpers below read. */
export function customCodeFromSettings(settings = {}) {
  const schema = isRecord(settings[SCHEMA_KEY]) ? settings[SCHEMA_KEY] : {};
  const head = isRecord(settings[HEAD_CODE_KEY]) ? settings[HEAD_CODE_KEY] : {};
  return { schema: schema.schema, page_schemas: schema.page_schemas, head_code: head.head_code };
}

export const LIMITS = { headCode: 20_000, schema: 50_000, pageSchema: 30_000, pageEntries: 100 };

export const EMPTY_CUSTOM_CODE = Object.freeze({ head_code: "", schema: "", page_schemas: [] });

// Tags the site already installs (owner decisions in AGENTS.md). Adding them again double-counts.
const ALREADY_INSTALLED = [
  { re: /GTM-W7CMZS53/i, label: "Google Tag Manager (GTM-W7CMZS53) is already installed from the Google Analytics & tags section" },
  { re: /googletagmanager\.com\/gtm\.js/i, label: "Google Tag Manager is managed in the Google Analytics & tags section; a second container loader would double-count" },
  { re: /googletagmanager\.com\/gtag\/js|G-57TGPTDNT4/i, label: "GA4 runs through the GTM container; a direct gtag.js tag would double-count page views" },
  { re: /clarity\.ms|zdo7gxbgkn/i, label: "Microsoft Clarity is already installed in the document head" },
];

// Meta names/properties Next.js metadata already writes on every page.
const RESERVED_META = new Set([
  "description", "robots", "googlebot", "viewport", "theme-color", "application-name", "format-detection", "keywords",
  "og:title", "og:description", "og:url", "og:site_name", "og:locale", "og:type", "og:image", "og:image:width", "og:image:height", "og:image:alt",
  "twitter:card", "twitter:title", "twitter:description", "twitter:image",
]);
const VERIFICATION_META = { "google-site-verification": "google_verification", "msvalidate.01": "bing_verification" };

const ALLOWED_LINK_REL = new Set(["preconnect", "dns-prefetch", "me", "author", "publisher", "alternate", "license", "help"]);
const ATTRS = {
  meta: new Set(["name", "property", "content"]),
  link: new Set(["rel", "href", "type", "sizes", "hreflang", "media", "title", "crossorigin", "referrerpolicy"]),
  script: new Set(["src", "async", "defer", "type", "id", "crossorigin", "referrerpolicy", "integrity"]),
};
const ALLOWED_SCRIPT_TYPES = new Set(["", "text/javascript", "module"]);

// Page-specific types belong in page-level schema; built-in identity types merge instead of repeating.
const PAGE_ONLY_TYPES = new Set(["WebPage", "FAQPage", "BreadcrumbList", "Article", "BlogPosting", "NewsArticle", "AboutPage", "ContactPage", "CollectionPage", "ItemPage", "QAPage", "ProfilePage", "VideoObject"]);
const ORGANIZATION_TYPES = new Set(["Organization", "EducationalOrganization"]);
const WEBSITE_TYPES = new Set(["WebSite"]);

const isRecord = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const typesOf = (node) => (Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]).filter((t) => typeof t === "string");

/* ----------------------------------------------------------------------------------------------
 * Head code: a strict parser for a small subset of HTML (meta, link, script and comments).
 * ---------------------------------------------------------------------------------------------- */

function parseAttributes(source) {
  const attrs = {};
  const re = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let rest = source.replace(re, (_, name, dq, sq, uq) => {
    attrs[name.toLowerCase()] = dq ?? sq ?? uq ?? true;
    return "";
  });
  rest = rest.replace(/\//g, "").trim();
  return { attrs, leftover: rest };
}

function checkUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) return `${label} is missing.`;
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return null;
  try { if (new URL(url).protocol === "https:") return null; } catch { /* fall through */ }
  return `${label} must be an https:// address or a path starting with /.`;
}

function validateElement(tag, attrs, content, seo) {
  for (const name of Object.keys(attrs)) {
    if (name.startsWith("on")) return `<${tag}>: event-handler attributes (${name}) are not allowed.`;
    if (!ATTRS[tag].has(name) && !(tag === "script" && name.startsWith("data-"))) return `<${tag}>: the "${name}" attribute is not allowed.`;
  }
  if (tag === "meta") {
    const key = String(attrs.name || attrs.property || "").toLowerCase();
    if (!key) return "<meta>: add a name or property attribute.";
    if (typeof attrs.content !== "string" || !attrs.content.trim()) return `<meta ${key}>: add a content value.`;
    if (RESERVED_META.has(key)) return `<meta ${key}> is already set by the website's page metadata; edit it in Search engines or on the page instead.`;
    const field = VERIFICATION_META[key];
    if (field && typeof seo?.[field] === "string" && seo[field].trim() && seo[field].trim() === attrs.content.trim()) return `<meta ${key}> repeats the verification code already saved in Search engines. Keep only one.`;
    return null;
  }
  if (tag === "link") {
    const rel = String(attrs.rel || "").toLowerCase().trim();
    if (!rel.split(/\s+/).every((r) => ALLOWED_LINK_REL.has(r))) return `<link rel="${rel}"> is not allowed here (canonical, icons and stylesheets are managed by the website). Allowed: ${[...ALLOWED_LINK_REL].join(", ")}.`;
    return checkUrl(attrs.href, `<link rel="${rel}"> href`);
  }
  // script
  const installed = ALREADY_INSTALLED.find(({ re }) => re.test(`${attrs.src || ""} ${content}`));
  if (installed) return `${installed.label}.`;
  const type = String(attrs.type || "").toLowerCase().trim();
  if (type === "application/ld+json") return "Put JSON-LD in the Site-wide schema or Page schema fields, not in head code, so it is validated and never duplicated.";
  if (!ALLOWED_SCRIPT_TYPES.has(type)) return `<script type="${type}"> is not allowed.`;
  if (attrs.src !== undefined) {
    if (content.trim()) return "<script>: use either src or inline code, not both.";
    const urlError = checkUrl(attrs.src, "<script> src");
    if (urlError) return urlError;
    if (!attrs.async && !attrs.defer && type !== "module") return "<script src>: add async or defer so the script does not block the page from loading.";
    return null;
  }
  if (!content.trim()) return "<script>: empty script.";
  if (/<!--|<script/i.test(content)) return "<script>: inline code cannot contain \"<!--\" or \"<script\".";
  return null;
}

/**
 * Parse CMS head code into allowlisted elements.
 * @returns {{ elements: Array<{tag: string, attrs: Record<string,string|true>, content: string}>, errors: string[] }}
 */
export function parseHeadCode(input, seo = {}) {
  const source = typeof input === "string" ? input : "";
  const elements = [];
  const errors = [];
  if (!source.trim()) return { elements, errors };
  if (source.length > LIMITS.headCode) return { elements, errors: [`Head code is too long (maximum ${LIMITS.headCode.toLocaleString("en-GB")} characters).`] };

  let i = 0;
  const seen = new Set();
  while (i < source.length) {
    const ws = /^\s+/.exec(source.slice(i));
    if (ws) { i += ws[0].length; continue; }
    const rest = source.slice(i);
    if (rest.startsWith("<!--")) {
      const end = rest.indexOf("-->", 4);
      if (end < 0) { errors.push("An HTML comment is not closed with -->."); break; }
      i += end + 3;
      continue;
    }
    const open = /^<(meta|link|script)\b([^>]*)>/i.exec(rest);
    if (!open) {
      const snippet = rest.slice(0, 40).replace(/\s+/g, " ");
      errors.push(`Only <meta>, <link> and <script> tags are allowed in head code. Found: "${snippet}${rest.length > 40 ? "…" : ""}"`);
      break;
    }
    const tag = open[1].toLowerCase();
    const { attrs, leftover } = parseAttributes(open[2]);
    if (leftover) { errors.push(`<${tag}>: could not read "${leftover.slice(0, 30)}".`); break; }
    i += open[0].length;
    let content = "";
    if (tag === "script") {
      const close = /<\/script\s*>/i.exec(source.slice(i));
      if (!close) { errors.push("A <script> tag is not closed with </script>."); break; }
      content = source.slice(i, i + close.index);
      i += close.index + close[0].length;
    }
    const error = validateElement(tag, attrs, content, seo);
    if (error) { errors.push(error); continue; }
    const key = tag === "meta" ? `meta:${String(attrs.name || attrs.property).toLowerCase()}:${attrs.content}` : tag === "link" ? `link:${attrs.rel}:${attrs.href}` : `script:${attrs.src || content.trim()}`;
    if (seen.has(key)) { errors.push(`Duplicate <${tag}> removed: ${key.split(":").slice(1, 3).join(" ").slice(0, 80)}.`); continue; }
    seen.add(key);
    elements.push({ tag, attrs, content });
  }
  return { elements, errors };
}

/* ----------------------------------------------------------------------------------------------
 * JSON-LD
 * ---------------------------------------------------------------------------------------------- */

/** Parse JSON-LD text (object, array or {"@graph": [...]}) into a flat node list without @context. */
export function parseSchemaJson(input, { label = "Schema", maxLength = LIMITS.schema } = {}) {
  const text = typeof input === "string" ? input.trim() : "";
  if (!text) return { nodes: [], errors: [] };
  if (text.length > maxLength) return { nodes: [], errors: [`${label} is too long (maximum ${maxLength.toLocaleString("en-GB")} characters).`] };
  if (/^<script/i.test(text)) return { nodes: [], errors: [`${label}: paste only the JSON, without the <script> tag.`] };
  let data;
  try { data = JSON.parse(text); } catch (error) { return { nodes: [], errors: [`${label} is not valid JSON: ${error.message}`] }; }
  const list = Array.isArray(data) ? data : isRecord(data) && Array.isArray(data["@graph"]) ? data["@graph"] : [data];
  const nodes = [];
  const errors = [];
  list.forEach((raw, index) => {
    const where = list.length > 1 ? `${label} item ${index + 1}` : label;
    if (!isRecord(raw)) return errors.push(`${where} must be a JSON object.`);
    const context = raw["@context"];
    if (context !== undefined && !(typeof context === "string" && /^https?:\/\/schema\.org\/?$/.test(context))) return errors.push(`${where}: @context must be "https://schema.org".`);
    const types = typesOf(raw);
    if (!types.length || !types.every((t) => /^[A-Za-z][A-Za-z0-9]*$/.test(t))) return errors.push(`${where}: add a schema.org "@type", e.g. "Course".`);
    if (raw["@id"] !== undefined && typeof raw["@id"] !== "string") return errors.push(`${where}: @id must be a text URL.`);
    const { "@context": _ignored, ...node } = raw;
    nodes.push(node);
  });
  return { nodes, errors };
}

const idsFor = (siteUrl) => ({ organization: `${siteUrl}/#organization`, website: `${siteUrl}/#website` });

function identityTarget(node, siteUrl) {
  const ids = idsFor(siteUrl);
  if (node["@id"] === ids.organization || (!node["@id"] && typesOf(node).some((t) => ORGANIZATION_TYPES.has(t)))) return "organization";
  if (node["@id"] === ids.website || (!node["@id"] && typesOf(node).some((t) => WEBSITE_TYPES.has(t)))) return "website";
  return null;
}

/** Validate site-wide schema text; returns nodes ready for mergeSiteGraph. */
export function validateSiteSchema(input, siteUrl) {
  const { nodes, errors } = parseSchemaJson(input, { label: "Site-wide schema" });
  const ok = [];
  for (const node of nodes) {
    const types = typesOf(node);
    const pageOnly = types.find((t) => PAGE_ONLY_TYPES.has(t));
    if (pageOnly) { errors.push(`${pageOnly} describes one page; add it under Page schema for that page instead.`); continue; }
    const target = identityTarget(node, siteUrl);
    if (!target && types.some((t) => ORGANIZATION_TYPES.has(t) || WEBSITE_TYPES.has(t))) {
      errors.push(`A second ${types.join("/")} with a different @id would duplicate the website's identity. Remove its @id (or use ${idsFor(siteUrl)[types.some((t) => WEBSITE_TYPES.has(t)) ? "website" : "organization"]}) so it merges.`);
      continue;
    }
    ok.push(node);
  }
  return { nodes: ok, errors };
}

/** Validate one page-level schema entry. */
export function validatePageSchema(input, siteUrl, path = "") {
  const label = `Page schema${path ? ` for ${path}` : ""}`;
  const { nodes, errors } = parseSchemaJson(input, { label, maxLength: LIMITS.pageSchema });
  const ok = [];
  const typeCounts = new Map();
  for (const node of nodes) {
    if (identityTarget(node, siteUrl) || typesOf(node).some((t) => ORGANIZATION_TYPES.has(t) || WEBSITE_TYPES.has(t))) {
      errors.push(`${label}: Organization and WebSite details belong in Site-wide schema (they apply to every page).`);
      continue;
    }
    if (path && typeof node["@id"] === "string" && node["@id"] === `${siteUrl}${path === "/" ? "" : path}#webpage`) {
      errors.push(`${label}: ${node["@id"]} is the page's built-in WebPage; give your node a different @id.`);
      continue;
    }
    for (const t of typesOf(node)) typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    ok.push(node);
  }
  for (const [type, count] of typeCounts) if (count > 1 && (type === "FAQPage" || type === "BreadcrumbList")) errors.push(`${label}: only one ${type} is allowed per page.`);
  return { nodes: ok, errors };
}

/** Normalise a page path entered in the CMS. Returns "" when invalid. */
export function normalizePagePath(input) {
  let path = typeof input === "string" ? input.trim() : "";
  if (!path) return "";
  try { if (/^https?:\/\//i.test(path)) path = new URL(path).pathname; } catch { return ""; }
  path = path.split(/[?#]/)[0];
  if (!path.startsWith("/") || path.startsWith("//") || /\s/.test(path)) return "";
  const wildcard = path.endsWith("/*");
  let base = wildcard ? path.slice(0, -2) : path;
  base = base.replace(/\/+$/, "") || "/";
  if (!/^\/[A-Za-z0-9\-._~/%]*$/.test(base)) return "";
  if (wildcard) return base === "/" ? "" : `${base}/*`;
  return base;
}

export function pathMatches(pattern, path) {
  const target = normalizePagePath(path);
  if (!pattern || !target) return false;
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2);
    return target.startsWith(`${base}/`);
  }
  return pattern === target;
}

function uniqueArray(values) {
  const seen = new Set();
  return values.filter((value) => { const key = JSON.stringify(value); if (seen.has(key)) return false; seen.add(key); return true; });
}

/** CMS values override built-in scalars; arrays (sameAs, areaServed …) are combined without repeats. */
function mergeNode(base, extra) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    if (key === "@id") continue;
    if (key === "@type") { merged["@type"] = uniqueArray([...typesOf(base), ...typesOf(extra)]); continue; }
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(base[key]) || Array.isArray(value)) {
      merged[key] = uniqueArray([...(Array.isArray(base[key]) ? base[key] : base[key] === undefined ? [] : [base[key]]), ...(Array.isArray(value) ? value : [value])]);
    } else merged[key] = value;
  }
  if (Array.isArray(merged["@type"]) && merged["@type"].length === 1) merged["@type"] = merged["@type"][0];
  return merged;
}

/**
 * Merge validated site-wide CMS nodes into the built-in @graph: Organization/WebSite nodes extend
 * the existing nodes; other nodes are appended once (repeated @id values are skipped).
 */
export function mergeSiteGraph(graph, customNodes, siteUrl) {
  const ids = idsFor(siteUrl);
  const out = graph.map((node) => ({ ...node }));
  const seenIds = new Set(out.map((n) => n["@id"]).filter(Boolean));
  for (const node of customNodes || []) {
    const target = identityTarget(node, siteUrl);
    if (target) {
      const index = out.findIndex((n) => n["@id"] === ids[target]);
      if (index >= 0) { out[index] = mergeNode(out[index], node); continue; }
    }
    if (node["@id"] && seenIds.has(node["@id"])) continue;
    if (node["@id"]) seenIds.add(node["@id"]);
    out.push(node);
  }
  return out;
}

/** Normalise the stored setting so the public site and admin form read the same shape. */
export function normalizeCustomCode(value) {
  const v = isRecord(value) ? value : {};
  const pages = Array.isArray(v.page_schemas) ? v.page_schemas : [];
  return {
    head_code: typeof v.head_code === "string" ? v.head_code : "",
    schema: typeof v.schema === "string" ? v.schema : "",
    page_schemas: pages.filter(isRecord).slice(0, LIMITS.pageEntries).map((p) => ({
      path: typeof p.path === "string" ? p.path : "",
      schema: typeof p.schema === "string" ? p.schema : "",
      enabled: p.enabled !== false,
      note: typeof p.note === "string" ? p.note.slice(0, 200) : "",
    })),
  };
}

/** Full validation used by the admin form before saving. */
export function customCodeErrors(value, { siteUrl, seo } = {}) {
  const v = normalizeCustomCode(value);
  const errors = [...parseHeadCode(v.head_code, seo).errors, ...validateSiteSchema(v.schema, siteUrl).errors];
  if (Array.isArray(value?.page_schemas) && value.page_schemas.length > LIMITS.pageEntries) errors.push(`Up to ${LIMITS.pageEntries} page schema entries are allowed.`);
  const paths = new Set();
  v.page_schemas.forEach((entry, index) => {
    const path = normalizePagePath(entry.path);
    if (!path) { errors.push(`Page schema ${index + 1}: enter a page path such as /pricing or /blog/* (a full https://www.onlinequrancollege.com/... address also works).`); return; }
    if (paths.has(path)) errors.push(`Page schema ${index + 1}: ${path} is listed twice; combine them into one entry.`);
    paths.add(path);
    if (!entry.schema.trim()) { errors.push(`Page schema ${index + 1} (${path}): paste the JSON-LD.`); return; }
    errors.push(...validatePageSchema(entry.schema, siteUrl, path.endsWith("/*") ? "" : path).errors);
  });
  return errors;
}

/** Nodes for one public path from the stored setting (invalid entries are skipped, never rendered). */
export function pageSchemaNodes(value, path, siteUrl) {
  const v = normalizeCustomCode(value);
  const nodes = [];
  for (const entry of v.page_schemas) {
    if (!entry.enabled) continue;
    const pattern = normalizePagePath(entry.path);
    if (!pathMatches(pattern, path)) continue;
    const result = validatePageSchema(entry.schema, siteUrl, pattern.endsWith("/*") ? "" : pattern);
    if (result.errors.length) continue;
    nodes.push(...result.nodes);
  }
  return nodes;
}
