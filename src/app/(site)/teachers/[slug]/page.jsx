import { PageHero } from "@/components/site/chrome";
import { contentMetadata } from "@/lib/seo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, Languages, Sparkles } from "@/components/site/icons";
import { getPublishedSlugs, getTeacher } from "@/lib/site-data";
import { truncate } from "@/lib/format";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { teachers } = await getPublishedSlugs();
  return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = await getTeacher(slug);
  if (!t) return { title: "Teacher not found" };
  return contentMetadata({ title: `${t.display_name} — ${t.headline || "Quran teacher"}` }, { path: `/teachers/${t.slug}`, description: truncate(t.bio || t.headline || "", 158) });
}

export default async function TeacherPage({ params }) {
  const { slug } = await params;
  const t = await getTeacher(slug);
  if (!t) notFound();
  return (
    <>
      <PageHero path={`/teachers/${t.slug}`} art="teachers" eyebrow="Meet your teacher" title={t.display_name} intro={t.headline}>
        <Link href="/teachers" className="mt-5 inline-block text-sm text-white/80 underline">All teachers</Link>
        <div className="mt-5 flex items-center gap-4">{t.photo_url && <img src={t.photo_url} alt={t.display_name} width={80} height={80} className="size-20 rounded-2xl object-cover" />}<div className="flex flex-wrap gap-2 text-sm">{t.years_experience ? <span>{t.years_experience}+ years teaching</span> : null}{t.languages?.map(l => <span key={l} className="rounded-full bg-white/10 px-3 py-1">{l}</span>)}</div></div>
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
          </div>
        </aside>
      </div>
    </>
  );
}
