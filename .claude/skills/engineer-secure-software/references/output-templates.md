# Reusable engineering output formats

Adapt to the repository and requested format. Omit empty or irrelevant sections. Keep short changes short. Use exact paths/revisions only when known; leave unknowns explicit. Do not create every document for every request.

## Acceptance and evidence matrix

| Requirement / journey | Expected behavior | Implementation location | Check + environment | Status / gap |
| --- | --- | --- | --- | --- |
| Concrete actor and action | Observable outcome, including denial if relevant | Actual module or planned location | Action/command and observed result | Planned / implemented / verified / blocked |

## Architecture decision record

- Decision and context.
- Constraints and evidence.
- Options considered, selected option and reason.
- Consequences, failure modes and cost/operational tradeoffs.
- Revisit trigger and unresolved assumptions.

## Milestone and continuation record

- Agreed scope/non-goals and current authoritative revision/environment.
- Completed acceptance items and links to actual evidence.
- Remaining milestone outcomes, dependencies and status.
- Known defects, blocked checks, open decisions and affected gates.
- Exact next action; applicable existing authorization and unresolved consequential decisions.

Keep one current record in the project's established convention. Exclude secrets and do not imply that a recorded future action is already scheduled.

## Blueprint outline

- Product outcome, users, scope and non-goals.
- Assumptions, constraints and acceptance criteria.
- Modules, roles and critical workflows.
- Architecture boundaries, data model and API/integration contracts.
- UI/accessibility/localization requirements.
- Security model and AI design/evaluation where applicable.
- Delivery milestones and dependencies.
- Verification, migration, deployment and rollback.
- Operations, risks and open decisions.

## Security finding

- Title and severity with rationale.
- Location, affected boundary and prerequisites.
- Observed evidence / safe reproduction and assessment environment.
- Impact and confidence; separate confirmed facts from inference.
- Remediation and relevant regression check.
- Status: open / implemented / verified; remaining limitations.

## Reconstruction parity matrix

| Role / screen / workflow | Source evidence | Replacement expectation | Verification | Gap / intentional deviation |
| --- | --- | --- | --- | --- |
| Specific case | Supplied artifact or observation | Observable behavior | Actual comparison or unverified | Concrete difference |

## Release evidence

- Intended project, environment, revision and domain.
- Acceptance status and checks actually run, with results.
- Migration/configuration actions; name secrets without their values.
- Deployment state and served revision evidence.
- Smoke-tested journeys, denial paths and persistent data checks.
- Rollback/recovery actions and data caveats.
- Remaining blockers, owner or exact user action needed.

## Test and quality report

| Layer / acceptance criterion | Command or interaction | Revision / environment | Observed result | Gap / next action |
| --- | --- | --- | --- | --- |
| Relevant unit, integration, contract, E2E or nonfunctional check | Exact executed check | Actual test context | Pass / fail / skipped / blocked; counts only if known | Specific unverified behavior or remedy |

Summarize regressions fixed, meaningful boundary/denial cases, measured coverage when available, mocked dependencies, flaky or pre-existing failures, and release-critical gates. State separately what was tested locally, in staging, and after deployment. Do not present this template as evidence that tests ran.

## Concise handoff

State the delivered outcome first. Explain the consequential change and purpose. Summarize meaningful validation, exact deployment state and material limitations. Provide links to actual deliverables when available. Avoid fictional metrics, unsupported percentages and generic promises to keep working later.

For a full project, include verified setup/configuration names, run/test/build/release commands, roles/admin workflows, architecture/contracts, migration/rollback/recovery steps, monitoring state and residual maintenance tasks as applicable. Separate delivered operating capabilities from proposals and access-dependent blockers.
