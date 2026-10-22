import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL, SUPABASE_CONFIGURED } from "@/lib/config";

// Called by the admin panel after a save so the public website shows the change straight away
// instead of after the 5-minute cache. Only signed-in, active admins may trigger it.
export async function POST() {
  if (!SUPABASE_CONFIGURED) return NextResponse.json({ error: "CMS connection is pending." }, { status: 503 });
  const store = await cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: { getAll: () => store.getAll(), setAll() {} },
  });
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data: staff } = await supabase.rpc("is_staff");
  if (staff !== true) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  return NextResponse.json({ ok: true });
}
