import { NextResponse } from "next/server";
import { currencyForCountry } from "@/lib/fx";

export const dynamic = "force-dynamic";

// Visitor country from Vercel's edge header, used only to preselect a display
// currency. Nothing is stored and no cookie is set.
export function GET(request) {
  const raw = request.headers.get("x-vercel-ip-country") || "";
  const country = /^[A-Z]{2}$/.test(raw) ? raw : null;
  return NextResponse.json({ country, currency: currencyForCountry(country) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
