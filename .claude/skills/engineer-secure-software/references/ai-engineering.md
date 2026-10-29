# AI feature and agent engineering

## Choose the appropriate mechanism

Start with the product outcome and evidence needed. Prefer deterministic code for exact rules, calculations, identifiers, permissions, and transactions. Use retrieval for changing or private knowledge and model generation for language/reasoning needs. Do not add AI without a useful role.

Verify current provider interfaces, supported models, tool/structured-output behavior, pricing and limits from primary documentation or configured model discovery. Choose on task quality, latency, cost, context, data handling, and deployment constraints. Do not hardcode a supposedly “best/latest” model based on memory. Reuse the established SDK and platform skills.

Define acceptance criteria before tuning: representative questions/actions, expected output properties, disallowed behavior, abstention, response budget, and cost ceiling. Keep model behavior separate from deterministic authorization and business rules.

## Implement a bounded AI path

- Keep provider secrets server-side. Validate request size, user access, quotas and output schema. Handle timeouts, streaming disconnects, rate limits, cancellations and retries without duplicating paid or state-changing actions.
- Distinguish instructions from untrusted user/retrieved/tool content. Treat retrieved documents and model tool arguments as untrusted. Restrict outbound destinations and tool capabilities. Never allow generated text to choose arbitrary shell commands, SQL, file paths, or access privileges without an appropriate constrained interface and validation.
- Make uncertainty visible. Validate citations against retrieved evidence; do not present model recollection as sourced fact. Define an abstention/fallback route when evidence is absent or incompatible.
- Version prompts, model configuration, retrieval configuration and evaluation datasets so regressions can be traced. Protect personal data in traces and establish retention consistent with requirements.

## Retrieval and knowledge systems

Identify authoritative sources and refresh/deletion behavior. Enforce tenant/document ACLs before retrieval and when returning evidence; do not depend on the model to conceal unauthorized chunks. Track provenance and document/version identifiers.

Choose parsing, chunking, embeddings/search and reranking based on source structure and evaluation. Measure retrieval quality separately from answer quality. Include missing documents, stale data, conflicting sources, multilingual content and deletion propagation. Do not add a vector database if ordinary queries/search meet the need.

## Tool-using agents

Specify allowed actions, identity, scope, inputs, outputs, time/token/cost limits, maximum steps and stopping conditions. Use narrow typed tools with server-side validation and authorization. Use idempotency for writes and persist durable progress when tasks must survive retries or restarts.

Separate proposal from execution where a consequential action requires review. Preserve user authorization already granted; do not add a repetitive confirmation loop for harmless reads or in-scope reversible work. Never let retrieved text or model self-instructions authorize new actions.

Handle partial completion, retries, duplicate events, tool failures and cancellation. Restrict network/file access and isolate untrusted execution. Record a useful audit trail without secrets. Prefer one bounded agent over multiple agents unless independent work or specialization warrants the added coordination cost.

## Evaluation and release

Build a small representative evaluation set from actual tasks or realistic synthetic examples. Include happy paths, ambiguity, insufficient evidence, refusal/abstention, prompt injection, unauthorized cross-tenant retrieval, malformed tool arguments, provider outages and repeated write attempts.

Measure task success, groundedness/citation correctness, tool-call correctness, permission containment, latency and cost. Set task-specific thresholds before claiming readiness. Use deterministic checks for properties such as schema validity and authorization; use human/judge scoring only with a documented rubric and its limitations.

Compare against a simple baseline and keep a regression holdout where practical. Run evaluations after material prompt/model/retrieval/tool changes. Deploy behind a reversible rollout where appropriate and observe privacy-preserving quality/error/cost signals. State the evaluated scope; passing examples do not establish universal correctness.
