import process from "node:process";

const HIGHLEVEL_ORIGIN = "https://services.leadconnectorhq.com";
const EMAIL = /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/;
const INTERNATIONAL_PHONE = /^\+[1-9]\d{6,14}$/;
const trim = (value) => typeof value === "string" ? value.trim() : "";

export function highLevelConfig(environment = process.env) {
  const token = trim(environment.GHL_PRIVATE_INTEGRATION_TOKEN);
  const locationId = trim(environment.GHL_LOCATION_ID);
  if (!token || !locationId) return null;
  const pipelineId = trim(environment.GHL_ADMISSIONS_PIPELINE_ID);
  const stageId = trim(environment.GHL_ADMISSIONS_STAGE_ID);
  if (Boolean(pipelineId) !== Boolean(stageId)) return null;
  return pipelineId ? { token, locationId, pipelineId, stageId } : { token, locationId };
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

  const result = await highLevelRequest("/contacts/upsert", config, fetchImpl, payload);
  if (!result.ok) return result;
  const contactId = trim(result.data?.contact?.id);
  return contactId ? { ok: true, contactId } : invalidResponse();
}

function invalidResponse() {
  return { ok: false, reason: "invalid_provider_response", retryable: true };
}

async function highLevelRequest(path, config, fetchImpl, payload) {
  try {
    const response = await fetchImpl(HIGHLEVEL_ORIGIN + path, {
      method: payload ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Version: "v3",
        Accept: "application/json",
        ...(payload ? { "Content-Type": "application/json" } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      return { ok: false, reason: "provider_rejected", status: response.status, retryable };
    }
    return { ok: true, data: await response.json() };
  } catch {
    return { ok: false, reason: "provider_unavailable", retryable: true };
  }
}

async function ensureOpenOpportunity(contactId, reference, config, fetchImpl) {
  const { locationId, pipelineId, stageId } = config;
  const filters = new URLSearchParams({ locationId, pipelineId, contactId, status: "open", limit: "1" });
  const searchPath = `/opportunities/search?${filters}`;
  const find = async () => {
    const result = await highLevelRequest(searchPath, config, fetchImpl);
    if (!result.ok) return result;
    const opportunities = result.data?.opportunities;
    if (!Array.isArray(opportunities)) return invalidResponse();
    if (!opportunities.length) return { ok: true, opportunityId: null };
    const opportunity = opportunities[0];
    return opportunity?.contactId === contactId && opportunity?.pipelineId === pipelineId
      && opportunity?.status === "open" && trim(opportunity.id)
      ? { ok: true, opportunityId: opportunity.id } : invalidResponse();
  };

  const existing = await find();
  if (!existing.ok || existing.opportunityId) return existing;
  const created = await highLevelRequest("/opportunities/", config, fetchImpl, {
    locationId, pipelineId, contactId, pipelineStageId: stageId, status: "open",
    name: `OQC admissions ${reference}`,
  });
  if (!created.ok) {
    // A concurrent submission can win the create. Verify that the opportunity
    // exists before treating a conflict as success.
    if (created.status === 400 || created.status === 409) {
      const concurrent = await find();
      if (concurrent.ok && concurrent.opportunityId) return concurrent;
    }
    return created;
  }
  const opportunityId = trim(created.data?.opportunity?.id);
  return opportunityId ? { ok: true, opportunityId } : invalidResponse();
}

// Only call this after the submission proof has been validated by the database.
export async function syncHighLevelAdmission(lead, kind, {
  config = highLevelConfig(), fetchImpl = fetch,
} = {}) {
  if (kind !== "trial" && kind !== "contact") return { ok: false, reason: "not_an_admission" };
  const name = kind === "contact"
    ? lead.name
    : trim(lead.guardian_name) || (lead.age_band === "adult" ? lead.learner_name : undefined);
  const reference = trim(lead.reference);
  if (config?.pipelineId && !/^(TR|MSG)-\d{4}-\d{5,7}$/.test(reference)) {
    return { ok: false, reason: "invalid_reference", retryable: false };
  }
  const result = await upsertHighLevelContact({ email: lead.email, phone: lead.phone, name }, { config, fetchImpl });
  if (!result.ok || !config.pipelineId) return result;
  const opportunity = await ensureOpenOpportunity(result.contactId, reference, config, fetchImpl);
  return opportunity.ok ? { ...result, opportunityId: opportunity.opportunityId } : opportunity;
}

export function enabledHighLevelConfig(environment = process.env) {
  return environment.GHL_ADMISSIONS_SYNC === "true" ? highLevelConfig(environment) : null;
}
