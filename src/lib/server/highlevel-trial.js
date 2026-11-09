// Country and region vocabulary agreed with the admissions workflow.
const REGION_COUNTRIES = {
  "uk ireland": [
    ["united kingdom", "GB"],
    ["ireland", "IE"],
  ],
  "north america": [
    ["united states", "US"],
    ["canada", "CA"],
    ["mexico", "MX"],
  ],
  "oceania": [
    ["australia", "AU"],
    ["new zealand", "NZ"],
  ],
  "gulf": [
    ["united arab emirates", "AE"],
    ["saudi arabia", "SA"],
    ["qatar", "QA"],
    ["kuwait", "KW"],
    ["bahrain", "BH"],
    ["oman", "OM"],
  ],
  "south asia": [
    ["pakistan", "PK"],
    ["india", "IN"],
    ["bangladesh", "BD"],
  ],
  "asia": [
    ["hong kong", "HK"],
    ["singapore", "SG"],
    ["malaysia", "MY"],
    ["japan", "JP"],
    ["china", "CN"],
    ["indonesia", "ID"],
  ],
  "africa": [
    ["south africa", "ZA"],
    ["nigeria", "NG"],
    ["kenya", "KE"],
    ["egypt", "EG"],
  ],
  "latin america": [
    ["brazil", "BR"],
  ],
  "europe": [
    ["turkey", "TR"],
    ["germany", "DE"],
    ["france", "FR"],
    ["netherlands", "NL"],
    ["belgium", "BE"],
    ["switzerland", "CH"],
    ["austria", "AT"],
    ["luxembourg", "LU"],
    ["italy", "IT"],
    ["spain", "ES"],
    ["portugal", "PT"],
    ["greece", "GR"],
    ["malta", "MT"],
    ["cyprus", "CY"],
    ["norway", "NO"],
    ["sweden", "SE"],
    ["denmark", "DK"],
    ["finland", "FI"],
    ["iceland", "IS"],
    ["poland", "PL"],
    ["czechia", "CZ"],
    ["slovakia", "SK"],
    ["hungary", "HU"],
    ["romania", "RO"],
    ["bulgaria", "BG"],
    ["croatia", "HR"],
    ["slovenia", "SI"],
    ["estonia", "EE"],
    ["latvia", "LV"],
    ["lithuania", "LT"],
    ["albania", "AL"],
    ["bosnia and herzegovina", "BA"],
    ["serbia", "RS"],
    ["montenegro", "ME"],
    ["north macedonia", "MK"],
    ["kosovo", ""],
    ["moldova", "MD"],
    ["ukraine", "UA"],
    ["belarus", "BY"],
    ["russia", "RU"],
    ["andorra", "AD"],
    ["liechtenstein", "LI"],
    ["monaco", "MC"],
    ["san marino", "SM"],
    ["vatican city", "VA"],
  ],
  "other": [
    ["other", ""],
  ],
};

const MARKETS = new Map(Object.entries(REGION_COUNTRIES).flatMap(([region, countries]) =>
  countries.map(([name, code]) => [name, { region, code }])));

const AGE_GROUPS = {
  child_4_7: "Child (4 to 7)",
  child_8_12: "Child (8 to 12)",
  teen_13_17: "Teen (13 to 17)",
  adult: "Adult (18+)",
};
const TEACHERS = { female: "Female teacher", male: "Male teacher", any: "No preference" };
const COURSES = new Map([
  ["Not sure yet", "Not sure yet"],
  ["Noorani Qaida", "Noorani Qaida"],
  ["Quran Reading with Tajweed (Nazara)", "Quran Reading with Tajweed (Nazara)"],
  ["Hifz ul Quran", "Hifz ul Quran"],
  ["Arabic Language", "Arabic Language"],
  ["Quran Translation & Tafseer", "Quran Translation & Tafseer"],
  ["Hadith & Islamic Studies", "Hadith & Islamic Studies"],
  ["Hadith Translation", "Hadith & Islamic Studies"],
]);
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
// The trial form records a package chosen on /pricing as the first notes line
// ("Package of interest: Package 2"). It reaches HighLevel as a tag, so no new
// custom field is needed in the CRM.
const PACKAGE_NOTE = /^Package of interest: ([A-Za-z0-9 &'()-]{1,40})$/m;
const string = value => typeof value === "string" ? value.trim() : "";

// Contact form and USA landing page leads reach HighLevel with a source and
// the same website, form, country and region tags as the Free Trial Form, so
// admissions can filter every website lead the same way. No custom fields are
// written for these forms, so the CRM needs no new fields.
const WEBSITE_FORMS = {
  contact: { source: "Website: Contact Form", tag: "form: contact" },
  usa: { source: "Website: USA Landing Page", tag: "form: usa landing page" },
};
export function websiteFormProperties(form, country) {
  const known = WEBSITE_FORMS[form];
  if (!known) return null;
  const name = string(country).toLowerCase();
  const market = MARKETS.get(name);
  return {
    source: known.source,
    tags: ["website lead", known.tag, ...(market ? [`country: ${name}`, `region: ${market.region}`] : [])],
  };
}

export function trialContact(lead, siteUrl) {
  const [firstName, ...last] = string(lead.learner_name).split(/\s+/);
  const name = string(lead.country).toLowerCase();
  const market = MARKETS.get(name) || MARKETS.get("other");
  const countryTag = MARKETS.has(name) ? name : "other";
  const selectedPackage = PACKAGE_NOTE.exec(string(lead.notes))?.[1].trim().toLowerCase();
  const attribution = lead.utm;
  const page = new URL("/free-trial", siteUrl);
  const submittedQuery = new URLSearchParams(string(attribution?.ghl_trial_query));
  for (const key of UTM_KEYS) {
    const value = string(submittedQuery.get(key)).slice(0, 120);
    if (value) page.searchParams.set(key, value);
  }
  const fields = {
    age_group: Object.hasOwn(AGE_GROUPS, lead.age_band) ? AGE_GROUPS[lead.age_band] : undefined,
    course_interested_in: COURSES.get(string(lead.course)),
    teacher_preference_mf: attribution?.ghl_teacher_selected === true && Object.hasOwn(TEACHERS, lead.teacher_gender_pref)
      ? TEACHERS[lead.teacher_gender_pref] : undefined,
    contact_consent: ["Yes, agreed to be contacted"],
    form_name: "Free Trial Form",
    page_url: page.href,
  };
  if (attribution?.attribution_method !== "search_referrer") {
    for (const key of UTM_KEYS) fields[key] = string(attribution?.[key]).slice(0, 120);
  }
  return {
    properties: {
      ...(firstName ? { firstName } : {}),
      ...(last.length ? { lastName: last.join(" ") } : {}),
      ...(market.code ? { country: market.code } : {}),
      source: "Website: Free Trial Form",
      tags: ["website lead", "form: free trial", `country: ${countryTag}`, `region: ${market.region}`,
        ...(selectedPackage ? [`package: ${selectedPackage}`] : [])],
    },
    fields: Object.entries(fields).filter(([, value]) => value),
  };
}
