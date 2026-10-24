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
  return {
    title: `${t.display_name} — ${t.headline || "Quran teacher"}`,
    description: truncate(t.bio || t.headline || "", 158),
    alternates: { canonical: `/teachers/${t.slug}` },
  };
}

export default async function TeacherPage({ params }) {
  const { slug } = await params;
  const t = await getTeacher(slug);
  if (!t) notFound();
  return (
    <>
      <section className="relative overflow-hidden bg-mushaf-900 text-white">
        <div className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden="true" />
        <div className="page-wrap relative grid items-center gap-10 py-14 sm:py-20 md:grid-cols-[16rem_1fr]">
          <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-mushaf-950 ring-4 ring-gold-400/40">
            {t.photo_url ? (
              <img src={t.photo_url} alt={t.display_name} className="size-full object-cover" />
            ) : (
              <div className="pattern-girih flex size-full items-center justify-center">
                <span className="brand-mark block size-28 text-gold-500 opacity-80" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <Link href="/teachers" className="text-sm text-white/60 hover:text-white">
              ← All teachers
            </Link>
            <h1 className="mt-4 text-[2.5rem] text-white sm:text-[3.2rem]">{t.display_name}</h1>
            <p className="mt-2 text-[1.15rem] font-medium text-gold-300">{t.headline}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {t.years_experience ? <span className="rounded-full bg-white/10 px-3 py-1">{t.years_experience}+ years teaching</span> : null}
              {t.languages?.map((l) => (
                <span key={l} className="rounded-full bg-white/10 px-3 py-1">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
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
