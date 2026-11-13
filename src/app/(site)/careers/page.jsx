import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { PageHero } from "@/components/site/chrome";
import { ContactForm } from "@/components/site/contact-form";

export const metadata = contentMetadata(
  { title: "Careers & Opportunities | Online Quran College" },
  { path: "/careers", description: "Register your interest in online Quran teaching, e-learning support or partnerships with Online Quran College Limited." },
);

export default function CareersPage() {
  return (
    <>
      <PageHero immersive path="/careers" eyebrow="Online Quran College Limited" title="Careers & Opportunities" intro="Register your interest in teaching or supporting live online Quran education." />
      <section className="page-wrap grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-2xl">Work with an e-learning provider</h2>
          <p>Online Quran College Limited provides live online Quran education. We welcome enquiries from Quran and Arabic teachers, e-learning support professionals and education partners.</p>
          <p>Tell us the kind of work you’re interested in, your relevant experience, the languages you work in and your availability. We’ll contact you if there is a suitable opening. Please keep identity documents and certificates for a later stage.</p>
          <Link href="https://www.linkedin.com/company/online-quran-college-ltd/" className="btn btn-outline">Find us on LinkedIn</Link>
        </div>
        <ContactForm id="careers-form" careerSubject="Careers & Opportunities" consentText="I agree that Online Quran College Limited may contact me about my careers enquiry." />
      </section>
    </>
  );
}
