// Short verses for the page heroes (one per page). Arabic is the Uthmani text from Quran.com
// (api.quran.com/api/v4, fetched 19 Nov 2026), cut by word position so no letter is retyped;
// "part" marks an excerpt. Meanings are plain-English renderings, not a published translation.
export const HERO_AYAT = {
  hifz: { ref: "75:17", part: false, ar: "إِنَّ عَلَيْنَا جَمْعَهُۥ وَقُرْءَانَهُۥ", en: "Upon Us is its gathering and its recitation." },
  recite: { ref: "20:27\u201328", part: false, ar: "وَٱحْلُلْ عُقْدَةً مِّن لِّسَانِى ۝ يَفْقَهُوا۟ قَوْلِى", en: "…and untie the knot from my tongue, so that they understand my speech." },
  ask: { ref: "20:25\u201326", part: true, ar: "رَبِّ ٱشْرَحْ لِى صَدْرِى ۝ وَيَسِّرْ لِىٓ أَمْرِى", en: "My Lord, open my heart for me and make my task easy for me." },
  reflect: { ref: "47:24", part: true, ar: "أَفَلَا يَتَدَبَّرُونَ ٱلْقُرْءَانَ", en: "Will they not reflect on the Qur’an?" },
  pen: { ref: "96:4\u20135", part: false, ar: "ٱلَّذِى عَلَّمَ بِٱلْقَلَمِ ۝ عَلَّمَ ٱلْإِنسَـٰنَ مَا لَمْ يَعْلَمْ", en: "He who taught by the pen — taught people what they did not know." },
  ease: { ref: "94:5\u20136", part: false, ar: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", en: "So truly with hardship comes ease; truly with hardship comes ease." },
  know: { ref: "39:9", part: true, ar: "هَلْ يَسْتَوِى ٱلَّذِينَ يَعْلَمُونَ وَٱلَّذِينَ لَا يَعْلَمُونَ", en: "Are those who know equal to those who do not know?" },
  rank: { ref: "58:11", part: true, ar: "يَرْفَعِ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟ مِنكُمْ وَٱلَّذِينَ أُوتُوا۟ ٱلْعِلْمَ دَرَجَـٰتٍ", en: "Allah raises in rank those of you who believe and those given knowledge." },
  capacity: { ref: "2:286", part: true, ar: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا", en: "Allah does not burden a soul beyond what it can bear." },
  remember: { ref: "2:152", part: true, ar: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ", en: "So remember Me; I will remember you." },
};

// Pages get a verse that fits them; everything else gets a stable verse from its path.
const BY_PREFIX = [
  [/^\/(courses\/hifz|blog\/(how-long-does-hifz|is-my-child-ready-for-hifz|hifz-|sabaq|memorization|online-hifz))/, "hifz"],
  [/^\/(courses\/(tajweed|quran-nazara|noorani)|blog\/(tajweed|makharij|common-tajweed|importance-of-reciting))/, "recite"],
  [/^\/(free-trial|contact|trial-video)/, "ask"],
  [/^\/(courses\/quran-translation|blog\/(online-tafseer|quran-translation|arabic-for))/, "reflect"],
  [/^\/(teachers|about|careers)/, "pen"],
  [/^\/(pricing|faq)/, "capacity"],
  [/^\/(learn|quran-study|free-quran)/, "know"],
  [/^\/blog\/?$/, "reflect"],
];
const ROTATION = ["rank", "ease", "remember", "know", "pen", "reflect", "capacity"];

export function heroAyahFor(path = "/") {
  const hit = BY_PREFIX.find(([re]) => re.test(path));
  if (hit) return HERO_AYAT[hit[1]];
  let h = 0;
  for (const c of String(path)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return HERO_AYAT[ROTATION[h % ROTATION.length]];
}
