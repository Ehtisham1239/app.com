import process from "node:process";

const CONTACT_UPSERT_URL = "https://services.leadconnectorhq.com/contacts/upsert";
const EMAIL = /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/;
const INTERNATIONAL_PHONE = /^\+[1-9]\d{6,14}$/;
const trim = (value) => typeof value === "string" ? value.trim() : "";

export function highLevelConfig(environment = process.env) {
  const token = trim(environment.GHL_PRIVATE_INTEGRATION_TOKEN);
  const locationId = trim(environment.GHL_LOCATION_ID);
  return token && locationId ? { token, locationId } : null;
}

// Accept only the adult contact details needed for admissions. The caller owns
// lead authorization, field selection, and durable delivery.
export async function upsertHighLevelContact(contact, {
  config = highLevelConfig(), fetchImpl = fetch,
} = {}) {
  if (!config) return { ok: false, reason: "not_configured", retryable: false };
  const email = trim(contact?.email).toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) {
    return { ok: false, reason: "invalid_contact", retryable: false };
  }

  const payload = { locationId: config.locationId, email };
  const name = trim(contact.name);
  const phone = trim(contact.phone).replace(/[\s().-]/g, "");
  if (name) payload.name = name;
  if (INTERNATIONAL_PHONE.test(phone)) payload.phone = phone;

  try {
    const response = await fetchImpl(CONTACT_UPSERT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Version: "v3",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      return { ok: false, reason: "provider_rejected", status: response.status, retryable };
    }
    const result = await response.json();
    const contactId = trim(result?.contact?.id);
    return contactId
      ? { ok: true, contactId }
      : { ok: false, reason: "invalid_provider_response", retryable: true };
  } catch {
    return { ok: false, reason: "provider_unavailable", retryable: true };
  }
}

// Only call this after the submission proof has been validated by the database.
export async function syncHighLevelAdmission(lead, kind, options = {}) {
  if (kind !== "trial" && kind !== "contact") return { ok: false, reason: "not_an_admission" };
  const name = kind === "contact"
    ? lead.name
    : trim(lead.guardian_name) || (lead.age_band === "18+" ? lead.learner_name : undefined);
  return upsertHighLevelContact({ email: lead.email, phone: lead.phone, name }, options);
}

export function enabledHighLevelConfig(environment = process.env) {
  return environment.GHL_ADMISSIONS_SYNC === "true" ? highLevelConfig(environment) : null;
}
