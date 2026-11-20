// International phone numbers for admin replies (WhatsApp, call).
// Families often type a local number ("0757 …") even though the form asks for the country code.
// wa.me needs the full international number, so the lead's country supplies the calling code.

// ITU calling codes for every country the trial and contact forms offer (src/lib/constants.js).
export const CALLING_CODES = {
  "United Kingdom": "44", "United States": "1", Canada: "1", Australia: "61", "New Zealand": "64",
  "Hong Kong": "852", "United Arab Emirates": "971", Ireland: "353", Germany: "49", Norway: "47",
  Sweden: "46", Denmark: "45", Finland: "358", Netherlands: "31", Belgium: "32", France: "33",
  Switzerland: "41", Italy: "39", Spain: "34", Iceland: "354", Singapore: "65", Malaysia: "60",
  "Saudi Arabia": "966", Qatar: "974", Kuwait: "965", Bahrain: "973", Oman: "968", Pakistan: "92",
  India: "91", Bangladesh: "880", "South Africa": "27", Nigeria: "234", Kenya: "254", Egypt: "20",
  Turkey: "90", Japan: "81", China: "86", Indonesia: "62", Brazil: "55", Mexico: "52",
  Portugal: "351", Austria: "43", Poland: "48", Czechia: "420", Slovakia: "421", Hungary: "36",
  Romania: "40", Bulgaria: "359", Greece: "30", Croatia: "385", Slovenia: "386", Estonia: "372",
  Latvia: "371", Lithuania: "370", Luxembourg: "352", Malta: "356", Cyprus: "357", Albania: "355",
  "Bosnia and Herzegovina": "387", Serbia: "381", Montenegro: "382", "North Macedonia": "389",
  Kosovo: "383", Moldova: "373", Ukraine: "380", Belarus: "375", Russia: "7", Andorra: "376",
  Liechtenstein: "423", Monaco: "377", "San Marino": "378", "Vatican City": "39",
};

// National trunk prefixes dropped before the calling code. Italy, San Marino and Vatican City keep
// their leading 0 in international form, so they have none.
const TRUNK = { Hungary: ["06"], Russia: ["8"], Belarus: ["80", "8"], Lithuania: ["8", "0"] };
const KEEP_ZERO = new Set(["Italy", "San Marino", "Vatican City"]);

/**
 * @returns {{ digits: string, code: string|null, added: boolean }|null}
 *   digits: international number without "+"; added: the calling code came from the lead's country
 *   (staff should check it); null when there is no usable number.
 */
export function internationalPhone(phone, country) {
  const raw = String(phone || "").trim();
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.length < 6) return null;
  if (raw.startsWith("+")) return { digits, code: null, added: false };
  if (digits.startsWith("00")) return { digits: digits.slice(2), code: null, added: false };
  const code = CALLING_CODES[country];
  if (!code) return { digits, code: null, added: false };
  // Already written with the calling code but without "+": the national part alone would be too short.
  if (digits.startsWith(code) && digits.length - code.length >= 8 && !(code === "1" && digits.length === 10)) {
    return { digits, code, added: false };
  }
  const trunk = TRUNK[country] || (KEEP_ZERO.has(country) ? [] : ["0"]);
  const prefix = trunk.find((p) => digits.startsWith(p));
  if (prefix) digits = digits.slice(prefix.length);
  return { digits: code + digits, code, added: true };
}

// Wall-clock label for a family's IANA zone, e.g. "Europe/Brussels" → "Brussels time".
export function localTimeLabel(timeZone) {
  if (!timeZone || timeZone === "UTC") return "your local time";
  return `${timeZone.split("/").pop().replace(/_/g, " ")} time`;
}

/** First WhatsApp message to a free-trial family, in their own time zone. */
export function trialReplyText(t) {
  const hello = `Assalamu alaikum${t.guardian_name ? ` ${t.guardian_name}` : ""}`;
  const learner = t.learner_name && t.learner_name !== t.guardian_name ? ` for ${t.learner_name}` : "";
  return `${hello}, this is Online Quran College about your 3-day free trial request${learner} (${t.reference}). `
    + `Which days and times suit you in ${localTimeLabel(t.timezone)}? We will confirm a teacher and send the class link.`;
}
