import { countryDestination } from "@/lib/geo-routing";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, SUPABASE_CONFIGURED } from "@/lib/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot"];

// Refreshes the admin session cookie and keeps the admin panel behind sign-in.
export async function proxy(request) {
  let response = NextResponse.next({ request });
  if (request.nextUrl.pathname === "/") {
    const global = request.nextUrl.searchParams.get("view") === "global";
    const destination = countryDestination({ pathname: request.nextUrl.pathname, country: process.env.VERCEL === "1" ? request.headers.get("x-vercel-ip-country") : null,
      seen: Boolean(request.cookies.get("oqc_region_seen")?.value), global, userAgent: request.headers.get("user-agent") || "", method: request.method,
      prefetch: request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch" });
    if (destination) {
      const url = request.nextUrl.clone(); url.pathname = destination;
      response = NextResponse.redirect(url, 307);
    }
    if (destination || global) {
      response.cookies.set("oqc_region_seen", "1", { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    // A cached mobile homepage must not mask a desktop regional redirect.
    response.headers.set("Vary", "Cookie, X-Vercel-IP-Country, User-Agent");
    // Keep normal homepage HTML cacheable; only personalised responses are private.
    if (destination || global) {
      response.headers.set("Cache-Control", "private, no-store");
    }
    return response;
  }

  if (!SUPABASE_CONFIGURED) {
    if (!PUBLIC_ADMIN_PATHS.includes(request.nextUrl.pathname)) return NextResponse.redirect(new URL("/admin/login", request.url));
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
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
    return NextResponse.redirect(url);
  }
  if (path === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/auth/:path*"],
};
