import { locationFromCmsSlug, locationPath } from "@/lib/locations";
import { contentMetadata } from "@/lib/seo-metadata";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { CmsPage } from "@/components/site/cms-page";
import { getPage, getPublishedSlugs, getRedirect } from "@/lib/site-data";
import { truncate, stripHtml } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { pages } = await getPublishedSlugs();
  return pages.filter((p) => !locationFromCmsSlug(p.slug)).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const location = locationFromCmsSlug(slug);
  if (location) permanentRedirect(locationPath(location.country, location.city));
  const page = await getPage(slug);
  if (!page) return { title: "Page not found" };
  const description = page.seo_description || page.excerpt || truncate(stripHtml(page.body_html ?? ""), 158);
  return contentMetadata(page, { path: `/${page.slug}`, description });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const location = locationFromCmsSlug(slug);
  if (location) permanentRedirect(locationPath(location.country, location.city));
  const page = await getPage(slug);
  if (!page) {
    const r = await getRedirect(`/${slug}`);
    if (r?.to_path) {
      if (r.status_code === 301 || r.status_code === 308) permanentRedirect(r.to_path);
      redirect(r.to_path);
    }
    notFound();
  }
  return <CmsPage page={page} />;
}
