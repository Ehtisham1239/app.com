// Landing content for the five indexed country hubs. The USA copy lives in us-hub.js; the
// others share one pattern with country-specific time zones, currency and further reading.
// Same rules as the USA copy: no office, branch, licence, guarantee, response time or price
// in the text. Fee figures come from the live plans (feeAnswer) in the page.
import { US_HUB, usHubFaqs } from "./us-hub.js";
import { UK_HUB } from "./uk-hub.js";
import { MARKET_ARTICLES } from "./market-guides.js";

const SHARED_READING = [
  { label: "Tajweed rules for beginners, with examples", href: "/blog/tajweed-rules-for-beginners" },
  { label: "Online Tafseer classes: what you learn", href: "/blog/online-tafseer-classes-what-you-learn" },
  { label: "How long does it take to learn Noorani Qaida?", href: "/blog/how-long-to-learn-noorani-qaida" },
];

const PATHS = (place) => [
  { title: "Quran classes for kids", text: "Children start with Noorani Qaida or Quran reading at their level. A parent sets up the lesson and can sit nearby.", href: "/learn/quran-for-kids", link: "Parent learning guide" },
  { title: `Online Quran classes for adults in ${place}`, text: "Begin from the Arabic letters or return after a break, at a pace that fits work and family.", href: "/learn/quran-for-adults", link: "Adult beginner guide" },
  { title: "Quran classes for new Muslims", text: "Start from the first letters, study meaning in a language you understand and ask questions freely.", href: "/learn/quran-for-reverts", link: "Guide for reverts" },
  { title: "Learning with a female teacher", text: "Sisters, girls and young children can ask for a female teacher when booking.", href: "/learn/female-quran-teacher", link: "Female teacher guide" },
];

const STEPS = (zone) => [
  { title: "Tell us the learner and the time", text: `Request a free trial with the learner's age, current reading level and the days that suit you in ${zone}.` },
  { title: "Meet the teacher online", text: "A coordinator agrees the class time and proposes a female or male teacher for your course. Lessons are live and one-to-one, so the teacher hears every letter." },
  { title: "Choose a monthly package", text: "After the 3-day trial on an eligible plan (the Weekend plan is excluded), pick the number of classes a week that fits school and work." },
];

const FAQS = (place, languages) => () => [
  { question: `Are lessons taught in ${languages}?`, answer: `Teachers explain in English, and some also teach in Arabic or Urdu. Tell the coordinator which language helps the learner understand, and the teacher's language is confirmed before lessons begin.` },
  { question: `Can new Muslims in ${place} start from the beginning?`, answer: "Yes. Reverts usually start with Noorani Qaida to learn the Arabic letters and sounds, and can add Quran translation lessons to study meaning. Questions are welcome in every one-to-one lesson." },
  { question: `Do you offer online Tafseer classes in ${place}?`, answer: "Yes. The Quran translation and Tafseer course explains the meaning and context of the verses. Ask the coordinator which surahs you would start with and which Tafseer works the teacher uses." },
];

// Kids and Hifz answers for the main markets (3 Nov 2026). Competitor country pages in AU and the
// USA lead with children's classes and memorisation; these say only what OQC offers today.
export const KIDS_HIFZ_FAQS = (place) => [
  { question: `Are online Quran classes suitable for kids in ${place}?`, answer: "Yes. Children usually start with Noorani Qaida or Quran reading at their level in short one-to-one lessons. A parent books the class, can sit nearby, and can ask for a female teacher." },
  { question: `Do you offer online Hifz classes in ${place}?`, answer: "Yes. The Hifz course covers new memorisation with daily revision, planned around school. The teacher sets the pace from the learner's reading level, and the coordinator confirms a teacher and time before lessons begin." },
];

function hub(slug, { place, currency, zone, languages = "English" }) {
  const article = MARKET_ARTICLES[slug];
  return {
    place,
    currency,
    feeQuestion: `How much do online Quran classes cost in ${place}?`,
    stepsHeading: `How online Quran classes work in ${place}`,
    steps: STEPS(zone),
    pathsHeading: `Learn Quran online in ${place}: kids, adults and new Muslims`,
    paths: PATHS(place),
    reading: [...(article ? [{ label: article.label, href: article.path }] : []), ...SHARED_READING],
    faqs: FAQS(place, languages),
  };
}

export const COUNTRY_HUBS = {
  "united-states": { ...US_HUB, place: "the USA", currency: "USD", faqs: () => [...KIDS_HIFZ_FAQS("the USA"), ...usHubFaqs()] },
  // The UK hub already has its own learning-paths section and FAQs (uk-hub.js).
  "united-kingdom": { ...hub("united-kingdom", { place: "the UK", currency: "GBP", zone: "UK time" }), feeQuestion: UK_HUB.feeQuestion, paths: null, faqs: null },
  canada: hub("canada", { place: "Canada", currency: "CAD", zone: "your Canadian time zone (Eastern, Central, Mountain, Pacific or Atlantic)" }),
  australia: (() => { const h = hub("australia", { place: "Australia", currency: "AUD", zone: "your Australian time zone (Sydney, Melbourne, Brisbane, Adelaide or Perth time)" }); return { ...h, faqs: () => [...KIDS_HIFZ_FAQS("Australia"), ...h.faqs()] }; })(),
  "united-arab-emirates": hub("united-arab-emirates", { place: "the UAE", currency: "AED", zone: "Gulf Standard Time", languages: "English, Arabic or Urdu" }),
};
