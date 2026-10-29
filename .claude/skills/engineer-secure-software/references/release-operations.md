# Release, operations and maintenance

## Establish the target and access

Resolve the exact project, provider, environment, branch/revision, domain, audience and deployment workflow from evidence. Reuse existing deployment and runtime skills/tools. Verify capabilities before promising a release. Do not create paid resources, change DNS/access, rotate credentials or affect unrelated services beyond authorization.

Reuse configured identities through supported selectors without printing credentials. Distinguish missing access, network restrictions, incorrect target and actual application failures. Complete independent code/configuration documentation and tests when live access is blocked, then specify the exact missing capability and affected check.

## Reproducible build and configuration

Use supported runtimes, lockfiles and repeatable build commands. Keep local/staging/production configuration separate and validate required variable names/types at startup without exposing values. Avoid embedding secrets in browser bundles, image layers, logs or generated artifacts.

Use CI with least-privilege identities and protected production settings as the project requires. Preserve provenance linking the source revision, migration set, built artifact and deployed release. Prefer promoting the tested artifact when supported; otherwise verify that the deployed build used the intended source/configuration. Use infrastructure as code only where useful and consistent with the project.

## Release sequence

1. Check the accepted scope, current revision and required quality/security gates. Distinguish existing failures and blocked dependencies from passed checks; do not bypass required gates to obtain a release.
2. Confirm configuration, access, health checks and data compatibility. Prepare migration ordering, backup/recovery evidence, rollout stop conditions and rollback instructions appropriate to the change.
3. Apply the authorized release to the intended environment using its actual workflow. Observe deployment completion; do not treat submission/queued status as success.
4. Verify served revision, intended domain/routing, TLS/access configuration, startup health and critical journeys. Include persistent writes/readback, role/tenant denial and relevant integration behavior with synthetic data where safe.
5. Inspect bounded post-release errors and relevant metrics. Use staged rollout/canaries/feature flags where justified; define a measurable stop/revert condition and do not claim monitoring exists until configured and verified.
6. Record release evidence, residual gaps and recovery actions. Distinguish local verification, staging verification, successful deployment and verified production behavior.

Never label a preview as the requested production domain or a fallback stub as a live integration. A build with zero discovered tests does not establish functional correctness. If an essential gate fails, diagnose and repair within scope or report the release blocked.

## Reliability and observability

Agree service objectives against real product needs: availability, latency, error rate, freshness and recovery. State workload and measurement window; do not invent SLO compliance from a single smoke check. Set RPO/RTO assumptions for sensitive data and validate recovery feasibility.

Implement appropriate health/readiness signals, structured logs, request/job correlation, metrics and traces. Avoid logging secrets or unnecessary personal data. Choose actionable alerts with thresholds, routing and a response owner/runbook when available. Follow messaging authorization rules before contacting recipients or creating notifications.

Verify that relevant signals are emitted and an alert path can be tested safely. Distinguish a proposed dashboard/alert from one deployed and receiving data. Monitor storage/queue saturation, dependency errors, certificate/runtime expiry and capacity when relevant. Bound retention and control telemetry/model/cloud costs against agreed budgets.

## Backup, restore and rollback

Define protected assets, backup frequency/retention, encryption, access isolation and recovery dependencies. Test restore in an isolated environment and verify usable data and business invariants. Backup existence is not recovery evidence.

Separate code rollback from database rollback and external side effects. Ensure old code remains schema-compatible or prepare a forward repair. For destructive changes, preserve a concrete recovery plan and any required decision before execution. Never restore over current production data without understanding loss since the backup and applicable authorization.

## Incidents and troubleshooting

Start with observed symptoms, affected environment/time window and recent changes. Establish user impact, contain within scope and preserve evidence. Inspect client/API/data/dependency boundaries to distinguish causes; do not blame a provider without supporting evidence.

Prefer a known reversible mitigation or rollback when safe. Use a written verification condition for recovery, then confirm critical journeys and ongoing health. For suspected compromise, follow the Security reference and secure credential/session handling. Do not erase logs, expose evidence or contact third parties without authorization.

After recovery, record the timeline, root cause/confidence, contributing factors, verified corrective action and prevention owner. Keep operational communications factual. Do not confuse incident mitigation with a permanent fix.

## Maintenance and final handoff

Document verified setup/build/test/release commands, configuration names, service ownership, monitoring, recovery and likely failure responses. Provide administrator/end-user instructions relevant to the delivered workflows and preserve access boundaries. Include actual source/artifacts requested by the user through the correct storage workflow.

Review runtime/dependency support, reachable vulnerabilities, secret/certificate rotation, database growth, backup restoration and cost budgets as maintenance tasks. Schedule recurring work only when requested and an actual automation is created; do not imply autonomous monitoring from a handoff document.

State what is operational now, what is only documented/proposed and what remains blocked. End completion claims at the defined acceptance boundary rather than promising universal reliability or indefinite maintenance.
