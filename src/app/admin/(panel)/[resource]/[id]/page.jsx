"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { ResourceForm } from "@/components/admin/resource-form";

export default function ResourceItemPage({ params }) {
  const { resource, id } = use(params);
  if (!RESOURCES[resource]) notFound();
  return <ResourceForm key={`${resource}-${id}`} rkey={resource} id={id} />;
}
