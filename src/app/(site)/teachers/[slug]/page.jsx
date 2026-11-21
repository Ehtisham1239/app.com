import { ContentImage } from "@/components/site/content-image";
import { teacherInitial } from "@/components/site/teacher-initial";
import { PageHero } from "@/components/site/chrome";
import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, Languages, Sparkles } from "@/components/site/icons";
import { getPublishedSlugs, getTeacher, getTeachers } from "@/lib/site-data";
import { teacherCourses } from "@/lib/teacher-courses";
import { truncate } from "@/lib/format";
import { teacherDescription } from "@/lib/teacher-description";
import { teacherPerson } from "@/lib/teacher-schema";
import { safeJsonLd, breadcrumbSchema } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { teachers } = await getPublishedSlugs();
  return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = await getTeacher(slug);
  if (!t) return { title: "Teacher not found" };
  return contentMetadata({ title: `${t.display_name} — ${t.headline || "Quran teacher"}` }, { path: `/teachers/${t.slug}`, description: truncate(teacherDescription(t), 158) });
}

export default async function TeacherPage({ params }) {
  const { slug } = await params;
  const t = await getTeacher(slug);
  if (!t) notFound();
  const person = teacherPerson(t, SITE_URL);
  const courses = teacherCourses(t);
  // Every other public teacher, so each profile is linked from all the rest.
  const others = (await getTeachers()).filter((x) => x.slug && x.slug !== t.slug);
  const first = t.display_name.split(" ").slice(-1)[0];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Teachers", path: "/teachers" }, { name: t.display_name, path: `/teachers/${t.slug}` }], SITE_URL)) }} />
      {person && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({ "@context": "https://schema.org", ...person }) }} />}
      <PageHero path={`/teachers/${t.slug}`} art="teachers" eyebrow="Meet your teacher" title={t.display_name} intro={t.headline}>
        <Link href="/teachers" className="mt-5 inline-block text-sm text-leaf-700 underline">All teachers</Link>
        <div className="mt-5 flex items-center gap-4">{t.photo_url ? <span className="teacher-profile-portrait block size-20 shrink-0 overflow-hidden border-4 border-white"><ContentImage src={t.photo_url} alt={t.display_name} sizes="80px" className="block size-full object-cover object-[50%_30%]" /></span> : <span className="teacher-profile-portrait grid size-20 shrink-0 place-items-center overflow-hidden border-4 border-white bg-white font-serif text-2xl font-bold text-leaf-700" aria-hidden="true">{teacherInitial(t.display_name)}</span>}<div className="flex flex-wrap gap-2 text-sm">{t.years_experience ? <span>{t.years_experience}+ years teaching</span> : null}{t.languages?.map(l => <span key={l} className="rounded-full bg-white px-3 py-1">{l}</span>)}</div></div>
      </PageHero>
      <div className="page-wrap grid gap-10 py-16 lg:grid-cols-[1fr_18rem]">
        <div className="prose-oqc">
          {t.bio
            ?.split(/\n{2,}/)
            .filter(Boolean)
            .map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
          {t.qualifications && (
            <>
              <h2>Qualifications</h2>
              <p>{t.qualifications}</p>
            </>
          )}
          <h2>How lessons with {first} work</h2>
          <p>Every lesson is live and one-to-one over video, so {first} listens to each learner read and corrects mistakes as they happen. You agree regular class times with our coordinator, and lessons can be arranged for children or adults{t.languages?.length ? `, taught in ${t.languages.join(", ").replace(/,([^,]*)$/, " or$1")}` : ""}.</p>
          <p>To learn with {first}, book a free trial and write “{t.display_name}” in the notes. The trial lasts 3 days and the Weekend plan is excluded. The coordinator confirms availability, timings and fees before you enrol.</p>
          {courses.length > 0 && (
            <>
              <h2>Courses {first} teaches</h2>
              <ul>{courses.map((c) => <li key={c.href}><Link href={c.href}>{c.label}</Link></li>)}</ul>
            </>
          )}
        </div>
        <aside className="space-y-4">
          {t.specialties?.length > 0 && (
            <div className="surface p-6">
              <h2 className="flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wider text-gold-700">
                <Sparkles className="size-4" aria-hidden="true" /> Specialties
              </h2>
              <ul className="mt-3 space-y-1.5 text-[0.95rem] text-ink">
                {t.specialties.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="surface p-6">
            <h2 className="flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wider text-gold-700">
              {t.languages?.length ? <Languages className="size-4" aria-hidden="true" /> : <Award className="size-4" aria-hidden="true" />} Learn with {t.display_name.split(" ").slice(-1)[0]}
            </h2>
            <p className="mt-2 text-[0.93rem] text-ink-soft">Request this teacher in your free-trial booking notes.</p>
            <Link href="/free-trial" className="btn btn-primary mt-4 w-full">
              Book a free trial <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/trial-video" className="mt-3 block text-center text-sm text-leaf-700 underline">Watch the 15-second trial guide</Link>
          </div>
          {others.length > 0 && (
            <nav className="surface p-6" aria-labelledby="other-teachers">
              <h2 id="other-teachers" className="font-sans text-sm font-bold uppercase tracking-wider text-gold-700">Other teachers</h2>
              <ul className="mt-3 space-y-1.5 text-[0.95rem]">
                {others.map((o) => <li key={o.slug}><Link href={`/teachers/${o.slug}`} className="text-leaf-700 underline-offset-2 hover:underline">{o.display_name}</Link>{o.headline ? <span className="text-ink-soft"> · {o.headline.trim()}</span> : null}</li>)}
              </ul>
            </nav>
          )}
        </aside>
      </div>
    </>
  );
}
