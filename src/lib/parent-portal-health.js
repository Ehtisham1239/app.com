// Pure summary for the Parent Portal overview. Inputs come straight from Supabase:
// guardians (with student_guardians), guardian_access_status rows, optional students
// (with student_guardians) and the pending access-request count.
export function portalHealth({ guardians = [], status = [], students = null, pendingRequests = 0 }) {
  const byId = new Map(status.map((s) => [s.guardian_id, s]));
  const withoutCode = [], neverSignedIn = [];
  let withCode = 0, signedIn = 0, locked = 0;
  for (const g of guardians) {
    const s = byId.get(g.id);
    if (!s) { withoutCode.push(g); continue; }
    withCode += 1;
    if (s.locked) locked += 1;
    if (s.last_sign_in) signedIn += 1;
    else neverSignedIn.push({ ...g, issued_at: s.issued_at });
  }
  const studentsWithoutParent = Array.isArray(students) ? students.filter((s) => !(s.student_guardians || []).length) : null;
  return { total: guardians.length, withCode, withoutCode, signedIn, neverSignedIn, locked, pendingRequests, studentsWithoutParent };
}

// Message a coordinator can paste into WhatsApp or email after issuing a code.
export function parentSignInMessage({ name, clientId, code, portalUrl }) {
  return [
    `Assalamu alaikum ${String(name || "").trim() || "parent"},`,
    "",
    "Your Online Quran College parent portal is ready. Sign in to see your child's published results, lesson plans and certificates:",
    portalUrl,
    "",
    `Client ID: ${clientId}`,
    `Access code: ${code}`,
    "",
    "Please keep this code private. If you lose it, ask us for a new one.",
  ].join("\n");
}
