import { HatchiumChat } from "@/components/site/hatchium-chat";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { CampaignAttribution } from "@/components/site/campaign-attribution";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { TopBar } from "@/components/site/chrome";
import { getCourses, getMenus, getSettings } from "@/lib/site-data";
import { WebsiteAnalytics } from "@/components/site/analytics";
import { analyticsConfig, cookielessAnalyticsConfig } from "@/lib/analytics";
import { verificationCode } from "@/lib/search-settings";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = settings["site.seo"] || {};
  return { verification: { google: verificationCode(seo.google_verification), other: verificationCode(seo.bing_verification) ? { "msvalidate.01": verificationCode(seo.bing_verification) } : undefined } };
}

// Only what the site settings state: a full street address when one is saved,
// otherwise the country (no invented street, city or postcode).
const COUNTRY_CODES = { "united kingdom": "GB", "uk": "GB", "united states": "US", "usa": "US", "canada": "CA", "australia": "AU", "pakistan": "PK" };
function orgAddress(contact = {}) {
  const a = contact.address;
  if (a && typeof a === "object") return { "@type": "PostalAddress", ...a };
  const country = COUNTRY_CODES[String(contact.location || "").trim().toLowerCase()];
  return country ? { "@type": "PostalAddress", addressCountry: country } : null;
}

export default async function SiteLayout({ children }) {
  const [settings, menus, courses] = await Promise.all([getSettings(), getMenus(), getCourses()]);
  const chat = settings["site.chat"] ?? {};
  const chatEnabled = Boolean(chat.enabled && /^[A-Za-z0-9_-]{10,200}$/.test(chat.widget_key || ""));
  const analytics = cookielessAnalyticsConfig(analyticsConfig(settings["site.analytics"]));
  const identity = settings["site.identity"] || {};
  const contact = settings["site.contact"] || {};
  const brandName = settings["site.identity"]?.name ?? "Online Quran College";
  const header = (menus.header ?? []).map(({ label, href, opens_new_tab }) => ({ label, href, opens_new_tab }));
  if (!header.some((item) => item.href === "/locations")) header.splice(3, 0, { label: "Areas", href: "/locations" });
  const courseLinks = courses.map(({ slug, title, age_group }) => ({ slug, title, age_group }));
  const footerMenus = {
    ...menus,
    footer_company: [...(menus.footer_company || []), ...[{ label: "Learning guides", href: "/learn" }, { label: "Careers", href: "/careers" }].filter(link => !(menus.footer_company || []).some(item => item.href === link.href))],
    footer_courses: menus.footer_courses?.length ? menus.footer_courses : courseLinks.map((c) => ({ label: c.title, href: `/courses/${c.slug}` })),
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        Skip to content
      </a>
      <TopBar announcement={settings["site.announcement"]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: brandName, url: SITE_URL, inLanguage: "en-GB", publisher: { "@id": `${SITE_URL}/#organization` } }, { "@type": ["EducationalOrganization", "Organization"], "@id": `${SITE_URL}/#organization`, name: brandName, legalName: identity.legal_name, url: SITE_URL, logo: `${SITE_URL}/brand/logo.webp`, image: [`${SITE_URL}/brand/logo.webp`, `${SITE_URL}/brand/hero.webp`], ...(orgAddress(contact) ? { address: orgAddress(contact) } : {}), description: identity.description, email: contact.email, telephone: contact.phone, ...((contact.email || contact.phone) ? { contactPoint: { "@type": "ContactPoint", contactType: "Admissions enquiries", email: contact.email, telephone: contact.phone, url: `${SITE_URL}/contact` } } : {}), ...(/^\d{4}$/.test(identity.established || "") ? { foundingDate: identity.established } : {}), sameAs: Object.values(settings["site.social"] || {}).filter(u => typeof u === "string" && u.startsWith("http")) }] }) }} />
      <CampaignAttribution />
      <SiteHeader menu={header} courses={courseLinks} brandName={brandName} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} menus={footerMenus} />
      <HatchiumChat enabled={chatEnabled} widgetKey={chat.widget_key} />
      {/* Vercel Speed Insights: cookieless real-visit Core Web Vitals per route. */}
      <SpeedInsights />
      {analytics.enabled && <WebsiteAnalytics config={analytics} />}
    </>
  );
}
