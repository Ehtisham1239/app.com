import { contentMetadata } from "@/lib/seo-metadata";
import { Suspense } from "react";
import { PageHero } from "@/components/site/chrome";
import { VerifyCertificate } from "@/components/site/verify-certificate";

export const metadata = contentMetadata({ title: "Verify a Certificate", seo_noindex: true }, { path: "/verify-certificate", description: "Check that an Online Quran College certificate is genuine using its certificate number." });

export default function VerifyPage() {
  return (
    <>
      <PageHero path="/verify-certificate" eyebrow="Certificates" title="Verify a certificate" intro="Every certificate we issue carries a unique number. Enter it below to confirm the student’s name, course and issue date." />
      <section className="page-wrap max-w-3xl py-16">
        <Suspense fallback={<div className="surface h-40 animate-pulse" />}>
          <VerifyCertificate />
        </Suspense>
      </section>
    </>
  );
}
