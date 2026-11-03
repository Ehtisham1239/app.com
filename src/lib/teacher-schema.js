// Person data for public teacher profiles. Only fields the teacher's public profile already
// shows are used; private ones (email, phone, employee code, timezone, shift) never are.
// Teachers appear only after Admissions marks them public in the CMS.
const list = (v) => (Array.isArray(v) ? v : String(v || "").split(/[,\n]/)).map((x) => String(x).trim()).filter(Boolean);

export function teacherPerson(t, siteUrl) {
  if (!t?.slug || !t?.display_name) return null;
  const quals = list(t.qualifications);
  return {
    "@type": "Person",
    "@id": `${siteUrl}/teachers/${t.slug}#person`,
    name: t.display_name,
    url: `${siteUrl}/teachers/${t.slug}`,
    jobTitle: t.headline || "Quran teacher",
    worksFor: { "@id": `${siteUrl}/#organization` },
    ...(t.photo_url ? { image: t.photo_url } : {}),
    ...(list(t.languages).length ? { knowsLanguage: list(t.languages) } : {}),
    ...(list(t.specialties).length ? { knowsAbout: list(t.specialties) } : {}),
    ...(quals.length ? { hasCredential: quals.map((name) => ({ "@type": "EducationalOccupationalCredential", name })) } : {}),
  };
}

export function teacherListSchema(teachers, siteUrl) {
  const people = (teachers || []).map((t) => teacherPerson(t, siteUrl)).filter(Boolean);
  if (!people.length) return null;
  return { "@context": "https://schema.org", "@type": "ItemList", name: "Online Quran College teachers", itemListElement: people.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) };
}
