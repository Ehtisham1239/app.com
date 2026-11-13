import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { PageHero } from "@/components/site/chrome";
import { getSettings } from "@/lib/site-data";
import { ContactForm } from "@/components/site/contact-form";

export const metadata = contentMetadata(
  { title: "Careers & Opportunities | Online Quran College" },
  { path: "/careers", description: "Register your interest in online Quran teaching, e-learning support or partnerships with Online Quran College Limited." },
);

const roles = [
  {
    title: "Online Quran Teacher",
    qualification: "Relevant Quran or Tajweed training and experience teaching the subject you apply for.",
    skills: "Clear recitation, patient correction, lesson planning and confidence teaching on video.",
    responsibilities: "Assess the learner’s starting level, deliver one-to-one lessons and record progress.",
    success: "Consistent attendance, timely feedback and documented progress against agreed learning goals.",
  },
  {
    title: "Admissions and Learner Support Coordinator",
    qualification: "Experience in admissions, customer support or education operations.",
    skills: "Clear written English, scheduling across time zones and accurate CRM recordkeeping.",
    responsibilities: "Follow up on enquiries, match learners with suitable courses and teachers, and coordinate trial bookings.",
    success: "Timely first replies, accurate booking records and clear handovers after trials.",
  },
  {
    title: "E-learning Operations Lead",
    qualification: "Experience coordinating an online teaching team or education service.",
    skills: "Team coaching, workflow design, reporting and handling escalations.",
    responsibilities: "Support teachers and coordinators, review service quality and resolve recurring scheduling or handover issues.",
    success: "Fewer unresolved handovers, reliable lesson coverage and regular quality reviews.",
  },
];

export default async function CareersPage() {
  const forms = (await getSettings())["site.forms"] ?? {};
  const consent = forms.careers_consent?.trim() || "I agree that Online Quran College Limited may contact me about my careers enquiry.";
  return (
    <>
      <PageHero immersive path="/careers" eyebrow="Online Quran College Limited" title="Careers & Opportunities" intro="Register your interest in teaching or supporting live online Quran education." />
      <section aria-labelledby="role-profiles" className="page-wrap pt-12 sm:pt-16">
        <h2 id="role-profiles" className="text-2xl">Role profiles</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">Use these profiles to decide where your experience fits. The hiring team confirms current openings and next steps.</p>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {roles.map((role) => (
            <article key={role.title} className="surface min-w-0 p-6">
              <h3 className="text-xl">{role.title}</h3>
              <dl className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                <div><dt className="font-semibold text-ink">Qualifications and experience</dt><dd>{role.qualification}</dd></div>
                <div><dt className="font-semibold text-ink">Required skills</dt><dd>{role.skills}</dd></div>
                <div><dt className="font-semibold text-ink">Key responsibilities</dt><dd>{role.responsibilities}</dd></div>
                <div><dt className="font-semibold text-ink">How we measure success</dt><dd>{role.success}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className="page-wrap grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-2xl">Work with an e-learning provider</h2>
          <p>Online Quran College Limited provides live online Quran education. We welcome enquiries from Quran and Arabic teachers, e-learning support professionals and education partners.</p>
          <p>Tell us which role interests you, your relevant experience, the languages you work in and your availability, including your time zone. We’ll contact you if there is a suitable opening. Please keep identity documents and certificates for a later stage.</p>
          <Link href="https://www.linkedin.com/company/online-quran-college-ltd/" className="btn btn-outline">Find us on LinkedIn</Link>
        </div>
        {forms.careers_form_hidden === true ? (
          <div id="careers-form" className="surface scroll-mt-28 p-6">
            <h2 className="text-2xl">Careers registration</h2>
            <p className="mt-2 text-ink-soft">Online registration is currently closed. Check back for updates.</p>
          </div>
        ) : (
          <ContactForm id="careers-form" careerSubject="Careers & Opportunities" consentText={consent} />
        )}
      </section>
    </>
  );
}
