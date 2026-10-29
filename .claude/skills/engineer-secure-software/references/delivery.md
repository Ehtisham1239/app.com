# Implementation, verification, and operations

## Existing code and new builds

Inspect project instructions, current changes, package manager, versions, generated files, tests, migrations, and deployment bindings. Establish a baseline with appropriate existing checks before substantial edits; distinguish pre-existing failures. Never treat successful compilation as proof of working business behavior.

Implement one end-to-end slice first. Keep interfaces small, state ownership clear, and domain rules separate from presentation. Use established dependencies and repository patterns. Avoid speculative abstractions, new frameworks, or broad formatting changes unrelated to the task. Complete persistence and authorization when required; label temporary stubs.

For frontend work, preserve approved branding, language, design tokens, and business behavior. Cover keyboard and focus behavior, labels, contrast, responsive layouts, image dimensions, loading, empty, success, failure, and permission states. Honor RTL and mixed-direction content. Check representative mobile and desktop sizes visually when tools allow. For UI-only tasks, preserve API contracts and domain semantics.

For mobile/desktop work, include platform permissions, secure credential storage, lifecycle/reconnection behavior, packaging/signing constraints, and supported OS targets as relevant. Do not claim device verification from browser checks.

## Debugging and review

Reproduce a defect using the smallest realistic input. Inspect the path from user action through network, server, data, and response. Form a falsifiable hypothesis, inspect supporting evidence, fix the root cause, and rerun the reproduction plus nearby regression checks.

When logs are needed, bound the time range and redact secrets and personal data. Never silently swallow errors or disable authentication, type checks, constraints, or failing tests to manufacture a passing result.

For code reviews, lead with actionable findings ranked by demonstrated impact. Include location, trigger, consequence, and recommended repair. Distinguish confirmed defects from questions. Avoid inventing findings when none are supported.

## Verification by risk

Use [Testing and quality](testing-quality.md) for unit-test design, layer selection, test environments, failure diagnosis, and CI/release gates. Apply it to the changed behavior rather than creating an unrelated test suite.

Select relevant checks instead of writing tests that merely mirror code:

| Change | Evidence to obtain |
| --- | --- |
| Domain rule or bug | Boundary/error cases and regression reproduction |
| API/data operation | Validation, persistence, transaction behavior, denial paths |
| Authentication/roles/tenancy | Allowed action and forbidden cross-role/object/tenant action |
| UI flow | Real interaction, key states, keyboard/mobile where relevant |
| Integration/webhook/job | Timeout, retry, duplicate/replay and failure handling |
| Migration | Fixture/dry run, invariants, compatibility and recovery |
| AI behavior | Representative evaluations, adversarial/abstention cases, tool boundaries |

Run project-required checks and appropriate lint/type/build/tests. Add meaningful unit tests for changed business rules and bug regressions; exercise critical paths through real boundaries using safe test accounts or synthetic data. Mark mocked dependencies. Add automated coverage for meaningful regressions and durable behavior; use focused manual checks for low-impact reversible presentation edits. Stop expanding verification once relevant checks pass unless new evidence justifies more work.

Record the command/action, environment/revision, result, and limitations. A check that could not run is blocked, not passed. Compare performance using a stated workload and baseline; report p50/p95, throughput, resource use or bundle/Web Vitals only when measured.

## Database migrations and data integrity

Review migration tooling and deployed schema before changes. Prefer expand → backfill → validate → switch → contract for live systems when feasible. Account for transactions, locks, old clients, nullability, duplicates, indexes, data volume, and retry safety.

For potentially destructive work, prepare a concrete scope, backup/recovery plan, dry-run evidence, and any required decision before executing. Verify restore/recovery where feasible. Treat irreversible data transformations separately from application rollback; never promise that redeploying old code restores deleted data.

## Release and deployment

Identify the actual app, environment, branch/revision, provider, domain, and existing deployment workflow. Use the relevant deployment skill and configured access. Prepare configuration names, health checks, migration order, smoke tests, and rollback steps. Do not print environment variable values.

When deployment is authorized, deploy once the necessary gates pass. Observe completion and verify the served revision, URLs, critical interactions, authorization, storage, and error logs where accessible. Do not substitute a preview URL for the user's requested production domain. Report blocked domain or credential steps precisely.

## Operations and handoff

Add appropriate structured logs, request correlation, health/readiness signals, actionable alerts, retention, and cost visibility. Use privacy-preserving telemetry. Define owners and responses for likely failure modes, backup/recovery, dependency updates, and credential rotation when relevant.

Provide a concise handoff: changed behavior, validation, deployment state, migration/rollback caveats, remaining issues and setup actions. For longer projects preserve acceptance status and next steps in the project's existing documentation convention. Never create future monitoring or scheduled execution by merely promising it.
