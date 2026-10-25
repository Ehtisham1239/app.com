import { getPosts, getPublishedSlugs } from "@/lib/site-data";
import { shouldIncludeInSitemap } from "@/lib/seo";
import { articleFeed } from "@/lib/blog-seo";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-static";
export const revalidate = 300;

export async function GET() {
  const [posts, published] = await Promise.all([getPosts(50), getPublishedSlugs()]);
  const eligible = new Set(published.posts.filter(post => shouldIncludeInSitemap(post, `/blog/${post.slug}`, SITE_URL)).map(post => post.slug));
  return new Response(articleFeed(posts.filter(post => eligible.has(post.slug)), SITE_URL), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
