import Link from "next/link";
import { PageHero } from "@/components/site/chrome";
import { contentMetadata } from "@/lib/seo-metadata";
import { organizationFacts } from "@/lib/org-facts";
import { breadcrumbSchema, safeJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const revalidate = 300;
export const metadata = contentMetadata({ title: "Online Quran College at a Glance: Courses, Trial and Contact", seo_noindex: false }, { path: "/at-a-glance", description: "Everything about Online Quran College in one page: live one-to-one courses, how the 3-day free trial works, teachers, countries served online, answers and contact details." });

const card = "rounded-2xl border border-line bg-white p-6 shadow-sm";
const chip = "rounded-full border border-line px-4 py-2 hover:bg-leaf-50";

export default async function Page() {
  const f = await organizationFacts(), c = f.contact;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema([{ name: "At a glance", path: "/at-a-glance" }], SITE_URL)) }} />
    <PageHero immersive path="/at-a-glance" eyebrow="At a glance" title={`${f.name} in one page`} intro={f.description || "Live one-to-one online Quran learning for children and adults."} />
    <div className="page-wrap py-12">
      <nav aria-label="On this page" className="flex flex-wrap gap-3 text-sm font-semibold text-leaf-700">
        {[["how", "How it works"], ["courses", "Courses"], ["trial", "Free trial and packages"], ["teachers", "Teachers"], ["countries", "Countries"], ["faq", "Questions"], ["contact", "Contact"]].map(([id, label]) => <a key={id} className={chip} href={`#${id}`}>{label}</a>)}
      </nav>
      <section id="how" aria-labelledby="how-h" className="scroll-mt-28 py-10">
        <h2 id="how-h" className="text-3xl">How it works</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">{f.steps.map((s, i) => <li key={s.title} className={card}><span className="text-sm font-bold text-gold-600">Step {i + 1}</span><h3 className="mt-2 text-xl">{s.title}</h3><p className="mt-2 text-ink-soft">{s.text}</p></li>)}</ol>
        {f.benefits.length > 0 && <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{f.benefits.map(b => <li key={b.title} className="rounded-2xl bg-leaf-50 p-5"><strong className="text-leaf-900">{b.title}</strong><span className="mt-1 block text-sm text-ink-soft">{b.text}</span></li>)}</ul>}
      </section>
      <section id="courses" aria-labelledby="courses-h" className="scroll-mt-28 py-10">
        <h2 id="courses-h" className="text-3xl">Courses</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{f.courses.map(row => <li key={row.path} className={card}><h3 className="text-xl"><Link className="hover:underline" href={row.path} prefetch={false}>{row.title}</Link></h3><p className="mt-2 text-ink-soft">{row.summary}</p><p className="mt-3 text-sm font-semibold text-leaf-700">{[row.age, row.level].filter(Boolean).join(" · ")}</p>{row.duration && <p className="mt-1 text-sm text-ink-soft">{row.duration}</p>}</li>)}</ul>
      </section>
      <section id="trial" aria-labelledby="trial-h" className="scroll-mt-28 py-10">
        <h2 id="trial-h" className="text-3xl">Free trial and packages</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">A 3-day free trial is available, with no card needed; the Weekend plan is excluded. A coordinator confirms the lesson time, teacher and the fee and payment currency before enrolment.{f.familyDiscount ? ` Each additional child from the same family receives ${f.familyDiscount}% off the monthly fee.` : ""}</p>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">{f.plans.map(p => <li key={p.name} className={card}><h3 className="text-xl">{p.name}</h3>{p.tagline && <p className="text-sm text-ink-soft">{p.tagline}</p>}<ul className="mt-3 space-y-1 text-sm text-ink-soft">{p.features.map(x => <li key={x}>✓ {x}</li>)}</ul></li>)}</ul>
        <p className="mt-6 flex flex-wrap gap-3"><Link className="btn-primary" href="/free-trial" prefetch={false}>Book a free trial</Link><Link className={chip} href="/pricing" prefetch={false}>See fees</Link></p>
      </section>
      {f.teachers.length > 0 && <section id="teachers" aria-labelledby="teachers-h" className="scroll-mt-28 py-10">
        <h2 id="teachers-h" className="text-3xl">Teachers</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">Share a teacher preference when you book, for example a female teacher; Admissions confirms availability for the course, language and time.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{f.teachers.map(t => <li key={t.path} className={card}><Link className="text-lg font-semibold hover:underline" href={t.path} prefetch={false}>{t.name}</Link>{t.headline && <p className="mt-1 text-sm text-ink-soft">{t.headline}</p>}</li>)}</ul>
      </section>}
      <section id="countries" aria-labelledby="countries-h" className="scroll-mt-28 py-10">
        <h2 id="countries-h" className="text-3xl">Countries served online</h2>
        <p className="mt-4 max-w-3xl text-ink-soft">Lessons are live and online and arranged in the learner’s time zone. Country pages describe online coverage, not local offices.</p>
        <p className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-leaf-700">{f.markets.map(m => <Link key={m.path} className={chip} href={m.path} prefetch={false}>{m.name}</Link>)}<Link className={chip} href="/locations" prefetch={false}>All countries and cities</Link></p>
      </section>
      <section id="faq" aria-labelledby="faq-h" className="scroll-mt-28 py-10">
        <h2 id="faq-h" className="text-3xl">Questions</h2>
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">{f.faqs.slice(0, 12).map(q => <details key={q.question} className="group p-5"><summary className="cursor-pointer font-semibold">{q.question}</summary><p className="mt-3 text-ink-soft">{q.answer}</p></details>)}</div>
        <p className="mt-4"><Link className="font-semibold text-leaf-700 hover:underline" href="/faq" prefetch={false}>All questions and answers</Link></p>
      </section>
      <section id="contact" aria-labelledby="contact-h" className="scroll-mt-28 rounded-3xl bg-leaf-900 p-8 text-white">
        <h2 id="contact-h" className="text-3xl text-white">Contact {f.name}</h2>
        <ul className="mt-5 space-y-2 text-white/90">{c.email && <li>Email: <a className="underline" href={`mailto:${c.email}`}>{c.email}</a></li>}{c.phone && <li>Phone: <a className="underline" href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}>{c.phone}</a></li>}{c.whatsapp && <li>WhatsApp: <a className="underline" href={`https://wa.me/${c.whatsapp}`}>message us</a></li>}{c.hours && <li>Class slots: {c.hours}</li>}</ul>
        <p className="mt-6 text-sm text-white/70">Assistants and apps can read the same facts as plain text in <a className="underline" href="/llms-full.txt">llms-full.txt</a>.</p>
      </section>
    </div>
  </>;
}
