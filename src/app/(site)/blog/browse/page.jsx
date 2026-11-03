import { BlogIndex, blogIndexMetadata } from "@/components/site/blog-index";
import { blogParams } from "@/lib/blog-seo";

export const revalidate = 300;

// Filtered and paged article lists. Visitors reach this through /blog?page=… or
// /blog?category=… (a rewrite keeps that address); canonical links point to those URLs.
export async function generateMetadata({ searchParams }) { return blogIndexMetadata(blogParams(await searchParams)); }
export default async function BlogBrowsePage({ searchParams }) { return <BlogIndex filters={blogParams(await searchParams)} />; }
