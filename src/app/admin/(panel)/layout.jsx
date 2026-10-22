"use client";

import { AccessProvider } from "@/lib/admin/access";
import { Shell } from "@/components/admin/shell";

export default function PanelLayout({ children }) {
  return (
    <AccessProvider>
      <Shell>{children}</Shell>
    </AccessProvider>
  );
}
