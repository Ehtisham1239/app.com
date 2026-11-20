// Verses shown in the site-wide ayah band. Arabic is the Uthmani text from Quran.com
// (api.quran.com/api/v4, fetched 19 Nov 2026); "part" marks an excerpt of a longer verse.
// Meanings are plain-English renderings for orientation, not a published translation.
// 20:114 is left out because the footer already shows it on every page.
export const AYAT = [
  { ref: "54:17", ar: "وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ", en: "We have made the Qur’an easy to remember, so is there anyone who will take heed?" },
  { ref: "73:4", part: true, ar: "وَرَتِّلِ ٱلْقُرْءَانَ تَرْتِيلًا", en: "…and recite the Qur’an slowly and distinctly." },
  { ref: "55:1–2", ar: "ٱلرَّحْمَـٰنُ ۝ عَلَّمَ ٱلْقُرْءَانَ", en: "The Most Merciful — He taught the Qur’an." },
  { ref: "13:28", part: true, ar: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", en: "Truly, in the remembrance of Allah hearts find rest." },
  { ref: "38:29", ar: "كِتَـٰبٌ أَنزَلْنَـٰهُ إِلَيْكَ مُبَـٰرَكٌ لِّيَدَّبَّرُوٓا۟ ءَايَـٰتِهِۦ وَلِيَتَذَكَّرَ أُو۟لُوا۟ ٱلْأَلْبَـٰبِ", en: "A blessed Book We have sent down to you, so that they may reflect on its verses and people of understanding take heed." },
  { ref: "17:9", part: true, ar: "إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ", en: "This Qur’an guides to the way that is most upright." },
];

// One verse per day (UTC), the same for every page that day, so cached pages agree.
export function ayahForDate(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  return AYAT[((day % AYAT.length) + AYAT.length) % AYAT.length];
}
