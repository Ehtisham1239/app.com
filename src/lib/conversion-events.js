// A first-party success signal only: no network transport, cookies or personal form values.
// Call after a successful form RPC. A future analytics adapter needs its own approved configuration.
export function announceLeadSaved({ formType, country, reference, honeypot = "" } = {}) {
  if (typeof window === "undefined" || !["trial", "contact"].includes(formType) || honeypot) return false;
  const prefix = formType === "trial" ? "TR-" : "MSG-";
  if (typeof reference !== "string" || !reference.startsWith(prefix) || reference === `${prefix}RECEIVED`) return false;
  const market = country === "United States" ? "USA" : country === "Australia" ? "Australia" : "Other";
  try {
    window.dispatchEvent(new CustomEvent("oqc:lead-saved", { detail: { event: "generate_lead", form_type: formType, market } }));
    return true;
  } catch { return false; } // Optional instrumentation must never interrupt a saved enquiry.
}
