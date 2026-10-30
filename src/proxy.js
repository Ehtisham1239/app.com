import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, SUPABASE_CONFIGURED } from "@/lib/config";
import { staffContentSecurityPolicy } from "@/lib/staff-csp";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot"];

// Refreshes the admin session cookie and keeps the admin panel behind sign-in.
export async function proxy(request) {
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const csp = staffContentSecurityPolicy(nonce, SUPABASE_URL, process.env.NODE_ENV === "development");
  const next = () => {
    // Re-read headers after cookie refresh so refreshed sessions are forwarded.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);
    return NextResponse.next({ request: { headers: requestHeaders } });
  };
  const secure = result => {
    // A refreshed session must survive a redirect as well as a normal response.
    if (result !== response) response.cookies.getAll().forEach(cookie => result.cookies.set(cookie));
    result.headers.set("Content-Security-Policy", csp);
    result.headers.set("X-Frame-Options", "DENY");
    result.headers.set("Cache-Control", "private, no-store, max-age=0");
    return result;
  };
  let response = next();

  // Parent portal: strict CSP, no framing, never cached. It has its own session cookie.
  if (request.nextUrl.pathname === "/parents" || request.nextUrl.pathname.startsWith("/parents/")) {
    const result = secure(response);
    result.headers.set("X-Robots-Tag", "noindex, nofollow");
    result.headers.set("Referrer-Policy", "no-referrer");
    return result;
  }

  if (!SUPABASE_CONFIGURED) {
    if (!PUBLIC_ADMIN_PATHS.includes(request.nextUrl.pathname)) return secure(NextResponse.redirect(new URL("/admin/login", request.url)));
    return secure(response);
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = next();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const path = request.nextUrl.pathname;
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
  if (path.startsWith("/admin") && !isPublicAdminPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = path === "/admin" ? "" : `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return secure(NextResponse.redirect(url));
  }
  if (path === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return secure(NextResponse.redirect(url));
  }
  return secure(response);
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*", "/parents", "/parents/:path*"],
};
