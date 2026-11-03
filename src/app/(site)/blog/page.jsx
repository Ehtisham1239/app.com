import { BlogIndex, blogIndexMetadata } from "@/components/site/blog-index";

export const revalidate = 300;

// The first page has no query string, so it is served from the static cache.
// /blog?page= and /blog?category= are rewritten to /blog/browse (next.config.mjs).
const FIRST = { page: 1, category: "" };
export function generateMetadata() { return blogIndexMetadata(FIRST); }
export default function BlogPage() { return <BlogIndex filters={FIRST} />; }
