import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { PageHero } from "@/components/site/chrome";
export const metadata = contentMetadata({ title: "Teaching & Careers Enquiries", seo_noindex: false }, { path: "/careers", description: "Contact Online Quran College about teaching opportunities, the application process and current requirements. Ask about vacancies before sending documents." });
export default function CareersPage() {
  return <><PageHero path="/careers" eyebrow="Careers" title="Teaching & careers enquiries" intro="Interested in teaching Quran online? Contact the college to ask about current opportunities and the application process." />
    <section className="page-wrap max-w-3xl space-y-6 py-16"><h2 className="text-2xl">Before you apply</h2><p>Ask our team whether a suitable role is currently available, which subjects and teaching languages are needed, and what the assessment process involves. This page is an enquiry point and does not advertise an open vacancy.</p><h2 className="text-2xl">What to include in your first enquiry</h2><p>Introduce your teaching interests, subjects, languages and general availability. Ask the team how to provide qualifications and experience securely. Please do not send identity documents, financial details or sensitive student information through the general contact form.</p><Link href="/contact" className="btn btn-primary">Ask about teaching opportunities</Link></section></>;
}
