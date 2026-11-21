"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ON = ["/free-trial", "/contact"];

export function MobileActionBar({ chatEnabled }) {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 0.8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return null;
  return (
    <>
      <div aria-hidden="true" className="h-[4.5rem] lg:hidden" />
      <div
        data-shown={shown}
        className={`mobile-action-bar fixed inset-x-0 bottom-0 z-30 border-t border-leaf-100 bg-white/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-6px_20px_rgb(13_74_28/0.08)] backdrop-blur lg:hidden ${chatEnabled ? "pr-[5.25rem]" : ""}`}
      >
        <div className="flex gap-2">
          <Link href="/free-trial" className="btn btn-primary min-h-11 flex-1 justify-center px-3 text-[0.95rem]">Book free trial</Link>
        </div>
      </div>
    </>
  );
}
