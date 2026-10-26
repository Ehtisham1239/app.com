"use client";

import Link, { useLinkStatus } from "next/link";
import { useState } from "react";

function PendingNavigation() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 bg-gold-500 motion-safe:animate-pulse" role="status"><span className="sr-only">Loading page…</span></span>;
}

// Native Next.js pending state gives feedback on slow navigation while keeping
// the complete server-rendered page available to readers without JavaScript.
export function NavigationLink({ children, prefetch, onPointerEnter, onFocus, ...props }) {
  const [intent, setIntent] = useState(false);
  // Navigation lists should not download every destination's JS on first paint.
  // Hover/focus restores Next's own prefetch/cache behavior for the chosen link.
  const enabledPrefetch = prefetch === false ? false : intent ? (prefetch ?? null) : false;
  return <Link {...props} prefetch={enabledPrefetch}
    onPointerEnter={event => { setIntent(true); onPointerEnter?.(event); }}
    onFocus={event => { setIntent(true); onFocus?.(event); }}
  >{children}<PendingNavigation /></Link>;
}
