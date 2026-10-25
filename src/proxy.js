import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, SUPABASE_CONFIGURED } from "@/lib/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot"];

// Refreshes the admin session cookie and keeps the admin panel behind sign-in.
export async function proxy(request) {
  let response = NextResponse.next({ request });

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
  matcher: ["/admin/:path*", "/auth/:path*"],
};
