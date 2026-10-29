# Project lifecycle and continuity

## Intake and source of truth

Classify the work as a new product, existing-system change, repair, audit, reconstruction, migration or release. Inspect the actual project and available evidence. Establish which source, archive, deployment, documentation and design are authoritative; do not assume the newest filename contains the newest code.

For new work, extract actors, outcomes, required workflows, supported platforms and constraints from the request. State a small number of reversible assumptions and make progress. Ask only when an unknown materially changes the architecture, business rule, access scope or irreversible decision. Retrieve available user/project context before requesting information already supplied.

For existing work, establish the current behavior and baseline checks, preserve unrelated edits and identify the smallest boundary to change. Avoid re-planning a finished module or replacing the stack without evidence.

## Scope, priorities and delivery order

Define the accepted scope, non-goals, observable acceptance criteria and important failure/denial cases. Separate essential workflows from optional improvements and unresolved decisions. Record relevant privacy, accessibility, localization, licensing and operating requirements without inventing legal obligations.

Break substantial work into dependency-ordered milestones that each deliver a usable vertical slice. Identify data/contracts/permissions before dependent screens. Include migration, verification and release tasks in the estimate; mark estimates as assumptions until the project is inspected. Do not claim an invented completion percentage.

Keep a compact backlog: outcome, priority, dependencies, acceptance evidence, status and blocker. Implement the highest-value coherent slice first, then complete the remaining accepted scope. Do not stop after a demonstration when the user asked for the complete product. Treat new optional ideas as proposals rather than silently expanding scope.

## Product and UX discovery

Inventory roles, navigation, screen types, forms, reports, notifications and critical journeys. Trace each journey through its entry conditions, state transitions, permission checks and outcomes. Cover loading, empty, validation, success, error, denied and interrupted states where relevant.

Use supplied branding, assets, language and existing design systems. Define responsive behavior, typography, spacing, design tokens and reusable components. Treat Urdu/RTL, keyboard access and mixed-direction content as requirements when supplied. Avoid disconnected screens and decorative controls that do not perform their displayed action.

For a new flow, use a lightweight wireframe/prototype only when it resolves a real uncertainty; do not make it a compulsory approval gate. For a faithful rebuild, use the Reconstruction reference and distinguish observed behavior from inference.

## Implementation and change management

Read the relevant Architecture, Implementation, Testing and Security references before substantial work. Build coherent slices including domain behavior, durable data, permissions and UI where applicable. Keep mock integrations clearly labeled and replace them when real integration is part of the acceptance criteria.

Preserve project conventions for branches, reviews, dependency locks, migrations and documentation. Record consequential architectural decisions with their tradeoffs. Review changes for unrelated edits, secret exposure and accidental behavior changes. Do not merge, publish or deploy beyond the user's authorization.

Define completion by acceptance evidence. A scaffold, screenshot, generated blueprint, passing build or temporary demo is a milestone rather than proof that an integrated application works. Missing source/access is a blocker, not a reason to invent code or verification results.

## Milestone checkpoints and resumption

Use the project's established tracking files or tools; create one compact checkpoint only when longer work needs it. Include source revision, environment, completed acceptance items, evidence paths/results, known issues, open decisions and next action. Exclude credentials, real personal data and stale claims of active background work.

On resumption, inspect current source/deployment and reconcile differences before trusting the checkpoint. Preserve prior authorization and decisions that still apply. Update the plan when new evidence changes the implementation rather than replaying completed work.

## Documentation and handoff

Provide documentation proportional to the product: reproducible setup with supported runtime/package commands, configuration variable names, test/build commands, architecture and API contracts, migration/release/rollback instructions, and operations/recovery guidance. Document role setup and relevant administrator/user workflows where needed. Store secrets through supported mechanisms, never in examples or shared files.

Verify documented commands against the actual project where feasible. Distinguish generated documentation from commands that ran. Include package/source/build outputs requested by the user and preserve them through the correct project/artifact workflow. Do not fabricate ownership, licenses, deployment URLs or access credentials.

End with delivered behavior, validation evidence, deployment/operations state, residual risks and the exact remaining action if blocked. State handoff complete only for artifacts and access actually supplied; do not claim stakeholder acceptance without an actual review.
