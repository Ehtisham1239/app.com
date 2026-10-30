import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { publicDb } from "@/lib/supabase/public";
import { permitsMutation } from "@/lib/request-origin";
import { PARENT_COOKIE, parentCookieOptions, validToken } from "@/lib/results/parent-session";

export const dynamic = "force-dynamic";

const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });

// The browser signs in with public.parent_sign_in (so the database's per-IP limit
// sees the parent's address) and hands the token here to keep it in an httpOnly
// cookie. The token is accepted only if the database confirms a live session.
export async function POST(request) {
  if (!permitsMutation(request)) return reply({ ok: false }, 403);
  if (!publicDb) return reply({ ok: false }, 503);
  let token;
  try { ({ token } = await request.json()); } catch { return reply({ ok: false }, 400); }
  if (!validToken(token)) return reply({ ok: false }, 400);
  const { data, error } = await publicDb.rpc("parent_session_active", { p_token: token });
  if (error) return reply({ ok: false }, 503);
  if (data !== true) return reply({ ok: false }, 401);
  const store = await cookies();
  store.set(PARENT_COOKIE, token, parentCookieOptions());
  return reply({ ok: true });
}

export async function DELETE(request) {
  if (!permitsMutation(request)) return reply({ ok: false }, 403);
  const store = await cookies();
  const token = store.get(PARENT_COOKIE)?.value;
  // Clear this browser's credential even if the database is temporarily down.
  // The server token remains subject to its short idle/absolute expiry.
  if (publicDb && validToken(token)) await publicDb.rpc("parent_sign_out", { p_token: token }).catch(() => {});
  store.set(PARENT_COOKIE, "", { ...parentCookieOptions(), maxAge: 0 });
  return reply({ ok: true });
}

export async function GET(request) {
  if (!permitsMutation(request)) return reply({ ok: false }, 403);
  const token = (await cookies()).get(PARENT_COOKIE)?.value;
  if (!validToken(token)) return reply({ ok: false }, 401);
  if (!publicDb) return reply({ ok: false }, 503);
  const { data, error } = await publicDb.rpc("parent_session_active", { p_token: token });
  if (error) return reply({ ok: false }, 503);
  return reply({ ok: data === true }, data === true ? 200 : 401);
}
