import { HatchiumChat } from "@/components/site/hatchium-chat";
import { safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { CampaignAttribution } from "@/components/site/campaign-attribution";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { TopBar, WhatsAppFloat } from "@/components/site/chrome";
import { getCourses, getMenus, getSettings } from "@/lib/site-data";
import { whatsappLink } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = settings["site.seo"] || {};
  const code = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{1,250}$/.test(value.trim()) ? value.trim() : undefined;
  return { verification: { google: code(seo.google_verification), other: code(seo.bing_verification) ? { "msvalidate.01": code(seo.bing_verification) } : undefined } };
}

export default async function SiteLayout({ children }) {
  const [settings, menus, courses] = await Promise.all([getSettings(), getMenus(), getCourses()]);
  const contact = settings["site.contact"] ?? {};
  const chat = settings["site.chat"] ?? {};
  const chatEnabled = Boolean(chat.enabled && /^[A-Za-z0-9_-]{10,200}$/.test(chat.widget_key || ""));
  const wa = whatsappLink(contact.whatsapp, "Assalamu alaikum, I would like to book a free trial class.");
  const brandName = settings["site.identity"]?.name ?? "Online Quran College";
  const header = (menus.header ?? []).map(({ label, href, opens_new_tab }) => ({ label, href, opens_new_tab }));
  if (!header.some((item) => item.href === "/locations")) header.splice(3, 0, { label: "Areas", href: "/locations" });
  const courseLinks = courses.map(({ slug, title, age_group }) => ({ slug, title, age_group }));
  const footerMenus = {
    ...menus,
    footer_courses: menus.footer_courses?.length ? menus.footer_courses : courseLinks.map((c) => ({ label: c.title, href: `/courses/${c.slug}` })),
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        Skip to content
      </a>
      <TopBar announcement={settings["site.announcement"]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: brandName, url: SITE_URL, inLanguage: "en-GB" }) }} />
      <CampaignAttribution />
      <SiteHeader menu={header} courses={courseLinks} whatsappHref={wa} brandName={brandName} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} menus={footerMenus} />
      <WhatsAppFloat href={wa} chatEnabled={chatEnabled} />
      <HatchiumChat enabled={chatEnabled} widgetKey={chat.widget_key} />
    </>
  );
}
