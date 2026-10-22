"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";
export function CampaignAttribution() {
  const path = usePathname();
  useEffect(() => { captureAttribution(); }, [path]);
  return null;
}
