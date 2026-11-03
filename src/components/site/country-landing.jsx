import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarCheck2, GraduationCap, Users } from "@/components/site/icons";
import { TeacherCard, Testimonials } from "@/components/site/sections";

// Landing sections for a country hub (USA first): direct fee answer, how it works, learning
// paths, the public teachers, independent reviews and further reading. Content comes from the
// country's hub file; prices come from the live plans. Reviews: published CMS testimonials only
// (each one a real website review with recorded permission), plus a text link to Trustpilot,
// because a live Trustpilot display needs an official TrustBox or approved API. No rating schema.
const STEP_ICONS = [CalendarCheck2, Users, GraduationCap];

export function CountryLanding({ hub, fee, teachers = [], trialHref, trustpilotProfile, testimonials = [] }) {
  if (!hub) return null;
  return (
    <>
      {fee && (
        <section aria-labelledby="hub-fee" className="rounded-3xl border border-gold-100 bg-gold-50 p-6 sm:p-8">
          <h2 id="hub-fee" className="text-2xl">{fee.question}</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink">{fee.answer}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href={`/pricing?currency=${hub.currency || "USD"}`}>See all packages</Link>
            <Link className="btn btn-outline" href={trialHref}>Book a free trial</Link>
          </div>
        </section>
      )}

      <section aria-labelledby="hub-steps">
        <h2 id="hub-steps" className="text-2xl">{hub.stepsHeading}</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {hub.steps.map((step, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <li key={step.title} className="surface flex gap-4 p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mushaf-900 text-gold-300" aria-hidden="true"><Icon className="size-5" /></span>
                <div><h3 className="text-lg">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p></div>
              </li>
            );
          })}
        </ol>
      </section>

      {hub.paths?.length > 0 && <section aria-labelledby="hub-paths" className="rounded-3xl border border-line bg-leaf-50/50 p-6 sm:p-8">
        <h2 id="hub-paths" className="text-2xl">{hub.pathsHeading}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {hub.paths.map((path) => (
            <article key={path.href} className="surface flex flex-col p-5">
              <h3 className="text-xl">{path.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{path.text}</p>
              <Link prefetch={false} className="mt-4 inline-flex items-center gap-1.5 font-semibold text-leaf-700 underline underline-offset-4" href={path.href}>{path.link} <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>}

      {teachers.length > 0 && (
        <section aria-labelledby="hub-teachers">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="hub-teachers" className="text-2xl">Meet some of our teachers</h2>
              <p className="mt-2 max-w-2xl text-sm text-ink-soft">Each profile lists the teacher’s specialism, qualifications and languages. Ask for a female or male teacher when you book.</p>
            </div>
            <Link className="font-semibold text-leaf-700 underline" href="/teachers">All teachers</Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.slice(0, 3).map((t) => <TeacherCard key={t.id} teacher={t} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="hub-reviews" className="space-y-5">
        {testimonials.length > 0 && <>
          <h2 id="hub-reviews" className="text-2xl">What families say</h2>
          <Testimonials items={testimonials.slice(0, 3)} />
          <p className="text-xs text-ink-faint">Reviews sent through our website and shown with the reviewer’s permission (first name only), unedited.</p>
        </>}
        <div className="surface flex flex-wrap items-center justify-between gap-5 p-6">
          <div className="max-w-2xl">
            {testimonials.length > 0 ? <h3 className="text-xl">Independent reviews</h3> : <h2 id="hub-reviews" className="text-xl">Independent reviews</h2>}
            <p className="mt-2 text-sm text-ink-soft">Read what families say on Trustpilot. If you already learn with us, every honest review helps other families choose.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="btn btn-outline" href={trustpilotProfile} target="_blank" rel="noopener noreferrer">Read reviews on Trustpilot <ArrowUpRight className="size-4" aria-hidden="true" /></a>
            <Link className="btn btn-ghost" href="/reviews">Share your experience</Link>
          </div>
        </div>
      </section>

      <nav aria-labelledby="hub-reading">
        <h2 id="hub-reading" className="text-2xl">Further reading</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {hub.reading.map(({ label, href }) => (
            <li key={href}><Link href={href} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 font-semibold text-leaf-700 hover:border-gold-300 hover:bg-gold-50"><ArrowRight className="size-4 shrink-0" aria-hidden="true" />{label}</Link></li>
          ))}
        </ul>
      </nav>
    </>
  );
}
