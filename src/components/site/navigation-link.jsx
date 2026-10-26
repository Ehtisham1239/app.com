"use client";

import Link, { useLinkStatus } from "next/link";

function PendingNavigation() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 bg-gold-500 motion-safe:animate-pulse" role="status"><span className="sr-only">Loading page…</span></span>;
}

// Native Next.js pending state gives feedback on slow navigation while keeping
// the complete server-rendered page available to readers without JavaScript.
export function NavigationLink({ children, ...props }) {
  return <Link {...props}>{children}<PendingNavigation /></Link>;
}
