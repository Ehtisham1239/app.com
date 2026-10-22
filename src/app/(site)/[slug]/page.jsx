import { notFound, permanentRedirect, redirect } from "next/navigation";
import { CmsPage } from "@/components/site/cms-page";
import { getPage, getPublishedSlugs, getRedirect } from "@/lib/site-data";
import { truncate, stripHtml } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { pages } = await getPublishedSlugs();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page not found" };
  const description = page.seo_description || page.excerpt || truncate(stripHtml(page.body_html ?? ""), 158);
  return {
    title: page.seo_title ? { absolute: page.seo_title } : page.title,
    description,
    alternates: { canonical: page.canonical_url || `/${page.slug}` },
    openGraph: { title: page.title, description, url: `/${page.slug}`, images: page.cover_url ? [page.cover_url] : undefined },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
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
