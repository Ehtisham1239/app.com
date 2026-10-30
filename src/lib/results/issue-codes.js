// Credentials are returned once. Persist each completed chunk in component
// memory before requesting the next, so a later outage cannot discard them.
export async function issueCodeChunks({ ids = null, rpc, onChunk }) {
  let remaining = ids === null ? null : [...new Set(ids)];
  for (let i = 0; i < 100; i++) {
    if (remaining?.length === 0) return { more: false };
    const current = remaining === null ? null : remaining.slice(0, 20);
    let response;
    try { response = await rpc("guardian_issue_codes_chunk", { p_guardian_ids: current }); }
    catch (error) { error.remainingIds = remaining; throw error; }
    if (response.error || !Array.isArray(response.data)) {
      const error = new Error("Some access codes could not be issued. Save the codes already shown, then retry the remaining parents.");
      error.remainingIds = remaining; throw error;
    }
    if (response.data.length) onChunk(response.data);
    if (remaining !== null) remaining = remaining.slice(20);
    else if (response.data.length < 20) return { more: false };
  }
  return { more: true, remainingIds: remaining };
}
