# Implementation patterns by boundary

Use only patterns justified by the project. Reuse the established framework and its specialist guidance; verify current APIs and deployment limitations before introducing new dependencies. Keep changes reviewable and avoid speculative abstractions.

## Frontend and client state

Separate remote/server state, local UI state and persisted preferences. Make state ownership explicit, handle stale requests and cancellation, and avoid duplicate submissions. Validate user input for usability while enforcing the same business constraints on the server. Use accessible semantic controls and intentional focus/error feedback.

Build responsive routes/components from a shared design system. Keep displayed permissions aligned with server authorization. Handle loading, empty, offline/reconnecting, permission-denied and retry states when applicable. Bound lists with pagination or virtualization when measurements warrant it. Optimize images, rendering and bundles based on evidence rather than arbitrary rewrites.

## APIs and domain behavior

Keep transport validation, authentication/authorization, domain decisions and persistence responsibilities clear. Use typed or schema-validated contracts supported by the stack. Return consistent safe errors; preserve status codes and client compatibility. Enforce object/tenant ownership from the authenticated context rather than trusting caller-supplied IDs.

Represent workflows with valid transitions and invariants. Validate all affected resources before irreversible side effects. Use transactions for atomic database changes, idempotency for repeatable writes and optimistic/pessimistic concurrency control where needed. Do not promise atomicity across separate external systems without a designed reconciliation/compensation strategy.

## Identity and permissions

Reuse maintained authentication libraries/providers. Cover enrollment/invitation, login/logout, verification/reset and session expiry/revocation as required. Keep credentials and privileged provider calls server-side; apply least privilege and appropriate administrative account protection.

Define a role/action/resource matrix and enforce it at every server boundary, including downloads, background jobs and administrative actions. For multi-tenant systems, derive tenant scope from trusted membership, propagate it through queries/storage/jobs, and test cross-tenant denial. Design audited privileged workflows without leaking sensitive data in audit records.

## Data, queries and storage

Use schema constraints, unique keys, indexes and transactions to enforce durable invariants. Inspect query plans and realistic data volumes before optimizing; address inefficient pagination, N+1 queries and overfetching when relevant. Select cache keys and invalidation rules that preserve tenant separation and consistency.

Define timestamps/time zones, integer/decimal money semantics, identifier generation, retention and deletion. Avoid hard-coded environment IDs or silently mixing test/production records. Use expand/contract migrations when compatibility is required. Reconcile imports/exports with counts and business invariants rather than file existence alone.

For files, enforce size/type/name rules, private access, path containment and download authorization. Handle multipart/incomplete uploads and retention where applicable. Avoid trusting supplied content types or allowing uploaded content to execute in privileged contexts.

## Jobs, events and integrations

Use background execution for tasks that exceed request lifetimes or need durable retry. Define event/job schemas, ownership, timeout, idempotency, retry/backoff, maximum attempts, cancellation, ordering and failed-item recovery. Design around the actual delivery semantics; do not assume exactly-once execution.

Keep external adapters narrow and configurable. Verify webhook signatures against raw payloads where required, prevent replays and reconcile provider state. Use sandboxes for test email/payment/messaging operations. Handle rate limits and partial failures without duplicate charges, sends or records. Do not introduce a broker or scheduler when ordinary application execution is sufficient.

## Mobile, desktop and offline behavior

Fit the product to supported devices and OS lifecycle constraints. Use platform-appropriate secure storage and explicit permissions. Define local persistence, queued writes, sync/conflict behavior, reconnection and upgrade compatibility when offline use is required. Do not put server secrets or privileged trust decisions in distributed clients.

Verify actual packaging, signing, distribution and update requirements with current platform guidance. Report emulator/simulator/browser evidence separately from physical-device checks and store/distribution approval. Do not claim signed distributables or an app-store release from source compilation alone.

## Refactoring, modernization and performance

Use characterization tests around important existing behavior before replacing boundaries. Migrate incrementally through stable interfaces when feasible; preserve public contracts and data compatibility. Remove obsolete paths only after replacement evidence and retention requirements permit it.

Measure the relevant bottleneck under a defined workload. Consider query shape, I/O, cache behavior, bundle size, allocation and concurrency before adding infrastructure. Record before/after measurements and regressions. Keep safe rollback paths for changes that alter persistence, dependencies or public interfaces.
