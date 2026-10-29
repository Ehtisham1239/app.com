# Architecture and blueprint workflow

## Establish requirements

Translate the idea into actors, desired outcomes, use cases, and non-goals. Separate required capabilities from proposed extras. For each critical workflow, define a successful outcome and at least one failure/denial case. Trace requirements to implementation and tests with a compact acceptance table.

Collect only decision-relevant constraints: tenancy, roles, expected data volumes, concurrency, growth, latency and availability expectations, retention, privacy, recovery needs, offline use, integrations, team skills, hosting and cost. Mark uncertain quantities as assumptions to validate. Do not fabricate compliance obligations or benchmark results.

Distinguish functional requirements, operating constraints, and quality goals. Make goals measurable where practical, e.g. “p95 API latency below the agreed threshold at a specified workload,” rather than “fast and scalable.” Identify which measurements are still needed.

## Choose a design

- Inspect the existing system and reuse compatible conventions. For a new system, compare at most two or three plausible stacks using deployment fit, team skills, maintainability, security, ecosystem, operational burden, and cost. Verify current support and critical API compatibility.
- Prefer clear modules and one deployable service initially. Introduce queues, caches, search indexes, event buses, or microservices only to solve an identified requirement. Explain consistency and operational tradeoffs.
- Define client, API, business logic, persistence, integration, background work, and external trust boundaries. Draw a compact topology diagram only when it clarifies a meaningful relationship.
- Define ownership and interfaces between modules. Identify operations needing transactions, idempotency, retries, deduplication, concurrency control, or compensating actions.
- Separate browser-safe public configuration from server secrets. Plan distinct development, staging, and production environments where justified. Design observability and failure handling with the interfaces.

## Data and contract design

Specify entities, identifiers, relationships, uniqueness, required fields, lifecycle states, timestamps, tenant ownership, retention, and deletion behavior. Define money precision, currency, time zones, and date semantics where relevant. Enforce invariants in durable storage as well as application logic.

Define API inputs/outputs, validation, authentication, action/resource authorization, pagination, filtering, sorting, error semantics, idempotency, rate limits, and versioning. Avoid exposing internal exceptions or private fields. Model state transitions and audit requirements explicitly for workflows such as enrollment, payments, approvals, or certificates.

For integrations, specify timeouts, retryable errors, backoff, webhook signature verification, replay handling, failure queues, and a reconciliation path. Establish the authoritative system for every shared data item.

## Blueprint deliverable

For a substantial blueprint, include:

1. Problem, users, scope, non-goals, assumptions, and acceptance criteria.
2. Module/role/workflow inventory and dependencies.
3. Architecture choice with tradeoffs, boundaries, and key decision records.
4. Entity model and major API/event contracts.
5. UI journeys, navigation, responsive/accessibility requirements, and state behavior.
6. Security model and threat-informed controls; AI design only if requested or needed.
7. Implementation milestones in dependency order, each yielding a usable slice.
8. Test strategy, measurable quality budgets, migration/release/rollback approach.
9. Operations, maintenance, cost assumptions, risks, and unresolved decisions.

Use the matching template and omit irrelevant sections. If the user requested development, proceed into implementation after the necessary design; do not end with only a blueprint.
