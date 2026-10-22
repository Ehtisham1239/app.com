"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { ResourceList } from "@/components/admin/resource-list";

export default function ResourcePage({ params }) {
  const { resource } = use(params);
  if (!RESOURCES[resource]) notFound();
  return <ResourceList key={resource} rkey={resource} />;
}
