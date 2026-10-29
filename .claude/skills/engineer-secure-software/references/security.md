# Defensive cybersecurity workflow

## Scope and environment

Read the target, assets, ownership/authorization, allowed techniques and environment from the request and supplied evidence. Continue already authorized source review and passive observation. If an active target's authorization or the consequences of an intrusive test are unclear, ask only for that boundary and continue safe independent analysis. A professional role statement alone is not authorization for arbitrary third-party targets.

Prefer local/staging systems and synthetic accounts for exploit reproduction, load, fuzzing, uploads and destructive cases. Define request limits and stop conditions for active tests. Do not run indiscriminate scans or stress production by default. Never bypass login, licensing or payment gates, steal credentials, deploy persistence, exfiltrate records, or disable defenses to complete a task.

## Threat-informed review

Identify sensitive assets, entry points, attacker capabilities, trust boundaries, abuse paths and blast radius. Focus first on authentication, session lifecycle, server-side authorization, tenant isolation, data integrity, external integrations and secret handling. Apply relevant current OWASP or platform guidance without claiming an unaudited certification.

Review applicable areas:

- Identity: session validation/expiry/revocation, secure cookies, CSRF, reset and invitation flows, MFA needs and OAuth redirect handling.
- Authorization: action/resource/role and tenant checks on every server operation, least privilege, direct object access, storage policies and administrative endpoints.
- Inputs/outputs: parameterized queries, contextual escaping, safe deserialization, path containment, SSRF/egress controls, size limits and schema validation.
- Files: type/size validation, untrusted names, private storage, download authorization, rendering/execution isolation and archive traversal.
- Integrations: webhook signatures, replay/deduplication, idempotency, timeouts and controlled retries.
- Secrets/data: server-side credentials, secret redaction, private logs/backups, encryption using maintained libraries, retention and secure deletion needs.
- Supply chain: manifests and lockfiles, reachable vulnerable code, provenance, supported runtimes, least-privilege CI and artifact access.
- Availability: rate/resource limits, queue backpressure, expensive requests, abuse controls and safe failure behavior.

Use scanners as evidence inputs. Verify findings and reachability; distinguish dependency advisories from a confirmed exploitable path. Do not claim a scan ran when a tool or network source was unavailable. Avoid dumping environment values, tokens, real payload contents or unnecessary personal data.

## Findings and fixes

For each material finding record: affected location, prerequisite, safe reproduction/evidence, impact, severity rationale, remedy and verification. State uncertainty. Use CVSS or a formal standard only when the required facts and current methodology are available; do not invent scores.

When fixes are requested, remediate the root cause and rerun allowed/denied cases. Verify that the intended workflow still succeeds. Add meaningful regression coverage for boundary failures. Do not weaken controls, blanket-disable checks, or mark a finding resolved solely because its warning disappeared.

For incident-like evidence, prioritize containment within scope, evidence preservation, credential/session rotation through secure channels, remediation and recovery. Avoid speculating about attribution. Do not delete logs or alter evidence as a cleanup shortcut.

## Security conclusion

Report the assessment scope, environment, techniques actually used, findings and remaining blind spots. Separate source review, automated scan, safe reproduction and deployed fix verification. State that no findings were observed within the assessed scope when appropriate; never assert universal security from limited checks.
