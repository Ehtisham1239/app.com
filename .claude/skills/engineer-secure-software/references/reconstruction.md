# Authorized reverse engineering and reconstruction

## Set the reconstruction contract

Identify whether the request is for UI similarity, workflow parity, interoperability, migration, source comprehension, protocol analysis, or full replacement. Record permitted assets and access. For a UI-only change, preserve existing backend/API/domain behavior; do not silently expand into a new ERP implementation.

Use only owned/licensed/supplied materials or explicitly authorized systems. Avoid copying third-party proprietary source, private data, or protected assets without rights. Do not circumvent authentication, license checks, payment gates or access controls. If authorization for an intrusive operation is unresolved, continue passive analysis and isolate that operation.

## Discover observable behavior

Prefer available specialist tools/skills, including ERP discovery when relevant. Reuse authorized signed-in browser sessions through supported capabilities. If blocked by login, obtain supported user handoff rather than guessing credentials or exploiting the gate.

Create an evidence inventory:

| Item | Capture |
| --- | --- |
| Roles/navigation | Visible modules, routes, permissions and role differences |
| Screens | Layout, typography, colors, spacing, responsive/RTL behavior |
| Controls | Buttons, menus, tabs, search, filters, sorting, pagination, keyboard behavior |
| Forms | Fields, defaults, required rules, formats, dependencies, error/success states |
| Workflows | Entry conditions, steps, transitions, outputs, exceptions |
| Interfaces | Authorized API/schema/export observations and integrations |
| Outputs | Reports, print views, certificates, downloads and notifications |

Use read-only views and synthetic data first. Do not click destructive controls, issue invoices, contact people or change real records merely to discover behavior. Inspect supplied code and documentation where available. For an unknown state, mark it unobserved and define how to verify it; do not invent hidden implementation from a screenshot.

## Build the replacement model

Map observed screens and journeys to modules, routes, entities, states and contracts. Link each critical behavior to an evidence item and a parity check. Separate observed facts, inferred design choices and deliberate improvements.

Preserve requested branding and business semantics. For exact UI work capture representative viewport dimensions and states. Reuse established design tokens/components and document intentional deviations. Screen similarity alone does not prove functional parity.

For authorized binary/protocol/source analysis, inspect static metadata, interfaces and call relationships first. Use isolated execution, synthetic inputs and least privilege for dynamic analysis. Record tool versions, observed behavior and uncertainty. Use clean interface specifications and independent implementation when replacing software; do not claim ownership of supplied third-party code.

## Implement and verify parity

Build critical journeys first and compare against the source evidence. Check validation, role restrictions, state transitions, persistence, filters/reports, language and responsive states. For migrations, reconcile counts, identifiers, relationships and business invariants using authorized exports and safe fixtures.

Maintain a parity matrix with source evidence, replacement behavior, status and discrepancy. Label unavailable roles/screens/integrations as unverified. Report visual parity separately from workflow, data and operational parity. Never declare a full clone from one dashboard image or a few successful clicks.
