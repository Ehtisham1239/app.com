// /login exists only because the old WordPress site had a sign-in page and Google still
// knows the address. It used to redirect to /admin/login, which robots.txt blocks, so
// Search Console reported "Indexed, though blocked by robots.txt". Serving a small
// crawlable noindex page lets Google read the noindex and drop the URL, and staff still
// reach the real sign-in with one click. Not in the sitemap; /admin stays disallowed.
export const dynamic = "force-static";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>Staff sign-in | Online Quran College</title>
</head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.6">
<h1>Sign in</h1>
<p>Online Quran College staff can sign in to the staff portal here.</p>
<p><a href="/admin/login">Staff sign-in</a></p>
<p>Parents can view progress in the <a href="/parents">parent portal</a>. New families can <a href="/free-trial">request a free trial</a>.</p>
</body>
</html>`;

export function GET() {
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
