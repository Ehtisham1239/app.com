# Testing and quality engineering

## Select the strategy

Inspect project instructions, acceptance criteria, test scripts, framework configuration, fixtures, coverage settings and CI before adding tooling. Reuse the established runner and package manager. For an untested project, choose a maintained stack-compatible runner after checking current primary documentation as needed; introduce only dependencies necessary for the requested work.

Map changed behavior and major risks to observable checks. Prefer many fast behavioral unit tests, focused integration tests and a small set of critical end-to-end journeys when that distribution suits the architecture. Do not force a fixed ratio or a universal coverage target. Scale to risk, including financial calculations, permissions, data loss, concurrency and external side effects.

Establish a baseline, distinguish existing failures, and define the relevant completion gates before implementation. Preserve required existing checks. Use synthetic data and isolated environments; do not test destructive behavior against real customer records.

## Unit tests

- Test one meaningful behavior through a stable public interface. Use clear arrange → act → assert structure and names describing the condition and expected result.
- Cover normal inputs, empty/missing/null values where valid, boundaries, invalid input, errors and state transitions. For domain rules, include relevant time zones, precision/rounding, duplicates, permissions and off-by-one cases.
- Assert externally observable results, invariants, errors and side effects. Avoid tautologies, implementation copies, private-method coupling and snapshots that conceal the actual behavior being checked.
- Keep tests deterministic, independent and order-insensitive. Control clocks, random seeds and external resources; test asynchronous completion, cancellation and errors explicitly. Avoid arbitrary sleeps and leaking global state.
- Mock unstable or expensive external boundaries, such as providers or clocks, with explicit contracts. Do not mock the subject under test or every internal collaborator until no actual logic is exercised. Pair mocks with integration/contract checks when boundary compatibility matters.
- For a reproducible defect, add a regression that fails for the original behavior and passes after the fix where feasible. Confirm the failure is caused by the intended defect, not broken setup. Use test-first development when it clarifies the contract; do not force ceremony on trivial presentation edits.
- Keep fixtures small and synthetic. Parameterize genuinely equivalent cases. Use property-based or mutation testing selectively for complex invariants or suspiciously shallow coverage; do not add costly tools without a specific benefit.

## Integration, API and contracts

Verify actual module boundaries, database constraints/transactions, queries, caches, storage, queues and service adapters as affected. Use isolated databases or schemas, deterministic setup and reliable cleanup. Mark any dependency replaced by a mock; a mocked database test does not verify the deployed database engine.

For API contracts, check request/response schemas, validation, status codes, authentication, resource/role/tenant authorization, errors, pagination and relevant compatibility. Include direct forbidden access and verify persisted state, not only a success status. Test idempotency, duplicate/replayed webhooks, rollback, race conditions, retry limits, timeouts and partial failure when applicable.

Use provider sandboxes or verified fixtures for external services. Keep contract checks separate from live paid/sending operations. Do not send emails, create charges or modify third-party records merely to run tests without applicable authorization.

## End-to-end, UI and acceptance

Exercise representative user journeys across UI → API → permissions → durable data → response using safe accounts. Include role-specific success/denial, empty/loading/error states, refresh/persistence and recovery from interrupted work where relevant. Use stable semantic selectors and controlled fixtures; avoid tests tied to incidental DOM structure.

Select target browsers, devices, viewports and operating systems from supported product requirements and user usage when known. Verify responsive layouts, Urdu/RTL/mixed text, keyboard access, focus, labels, contrast and accessible error feedback. Combine appropriate automated accessibility checks with manual interaction; automated checks alone do not prove accessibility conformance.

Use visual regression when layout fidelity is required. Fix viewport, fonts, animations and data; review screenshot differences intentionally rather than updating baselines blindly. Distinguish real-device tests from emulation. Use acceptance criteria and authorized user review for business acceptance without claiming stakeholder sign-off that did not occur.

## Other quality dimensions

| Category | Apply when relevant; establish evidence |
| --- | --- |
| Smoke and sanity | Check startup, health, authentication and the critical changed path after build/deploy/fix |
| Regression | Check affected workflows, adjacent invariants and known prior defects |
| Security | Verify denied access, tenant isolation, input/output handling, sessions, secrets and abuse limits; use the Security reference |
| Performance | Define workload, data size, concurrency, baseline and budget; measure latency, throughput, resource use and error rate |
| Load/stress/soak | Use authorized isolated environments, resource caps and stop conditions; test overload and recovery without stressing production by default |
| Resilience | Inject bounded dependency failures, disconnects, timeouts and retries; check graceful failure and recovery |
| Migration/data | Verify constraints, backfill, count/business-invariant reconciliation, compatibility and rollback/recovery on fixtures |
| Backup/restore | Restore an authorized test backup and verify usable data; backup existence alone is insufficient |
| Compatibility | Check supported clients, API/schema versions, upgrades, OS/device capabilities and integration contracts |
| AI | Evaluate grounding, citations, abstention, prompt injection, tool authorization, provider failure, latency/cost and regression; use the AI reference |
| Static/build checks | Run applicable lint, type, compilation, dependency/secret scanning; distinguish these from behavioral tests |
| Exploratory/usability | Inspect uncertain workflows and edge cases; record concrete observations and reproducible defects |

## CI/CD and quality gates

Place fast deterministic checks early in the existing pipeline; run integration/E2E and deployment smoke checks at appropriate stages. Reuse available environments and credentials securely. Avoid introducing new services or paid testing infrastructure without a need and authorization.

Enforce relevant project gates on changes: required tests, lint/type/build, meaningful regression coverage, necessary security checks and release-critical journeys. Preserve established coverage thresholds, inspect changed-line and branch gaps when useful, and explain uncovered high-risk behavior. Do not invent percentages or raise global thresholds simply to appear rigorous.

Keep reports bounded and redacted. Record runner exit codes and actual test outcomes; zero discovered tests is not a passing behavioral suite. Surface skipped, quarantined and blocked tests. Diagnose flaky failures, isolate root causes and record ownership if unresolved; retries can diagnose but must not silently erase failures. Do not remove a required gate, loosen an assertion, hide a failure with unconditional success, or change product requirements to make checks pass.

## Resolve failures and report

Classify failures as product defects, test defects, environment problems, unavailable dependencies or pre-existing failures using evidence. Repair within scope, run the focused failure again, then relevant regression/project-required checks. Broaden checks only when changed behavior or failures justify it.

Report the tested revision/environment, exact commands or interactions, pass/fail counts when actually available, skipped/blocked cases, measured coverage if collected, remaining risks and deployment verification state. Tie important acceptance criteria to evidence. Do not call a release verified while its critical gates remain failing or blocked; distinguish code completion from unavailable integration verification.
