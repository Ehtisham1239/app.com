// Initial for a teacher avatar when there is no photo: skips honorifics such as "Ustadha".
const HONORIFIC = /^(ustadh?a?|ustaz|sheikh?a?|shaykh|qari|hafiz[ae]?|mufti|maulana|dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i;
export const teacherInitial = (name = "") => (String(name).trim().replace(HONORIFIC, "").charAt(0) || "O").toUpperCase();
