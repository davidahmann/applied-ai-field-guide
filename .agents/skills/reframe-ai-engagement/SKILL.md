---
name: reframe-ai-engagement
description: Reframe an inherited AI delivery engagement when field evidence materially contradicts the sold brief or current boundary. Use when sponsor claims, operator practice, policy, system behavior, or accepted scope conflict and a scoped human disposition is needed without rewriting history.
---

# Reframe an AI Engagement

Turn a consequential field contradiction into a bounded decision that keeps delivery moving. Do not silently rewrite the brief, infer authority, or treat this engagement disposition as production approval.

## Read first

1. Read [Field Engagement and Accountable Reframing](../../../playbooks/00-field-engagement-and-reframing.md) and the [engagement-reframe schema](../../../schemas/engagement-reframe.schema.json).
2. Use the [engagement-reframe record](../../../templates/engagement-reframe.json), [field-observation log](../../../templates/field-observation-log.md), and [discovery pack](../../../templates/fde-discovery-pack.md).
3. Read the [worked invoice engagement](../../../examples/invoice-exception/engagement/README.md) only as a teaching case, never as customer evidence.
4. Apply `FDE-001`, `FDE-002`, `FDE-005`, `CTX-001`, `CTX-004`, and `DEL-002` from the [control catalog](../../../controls/control-catalog.json).
5. If the reframe may affect a recurring solution, resolve the [solution portfolio](../../../solutions/README.md) and read only the selected context after the disposition; it is not target evidence or authority.

## Workflow

1. Preserve the inherited claim, exact source, revision, commercial status, and limitations without improving its wording.
2. Separately verify the sponsor, process knower, operator, disposition authority, and verifier. A person may hold several roles only with separate evidence or authority bases.
3. Inspect one actual or sanitized recent representative case and a material exception. Record population scope, source passages, owners, dates, digests, and limitations.
4. Classify consequential claims as `sold`, `stated`, `observed`, `system_enforced`, or `policy_authorized`. No class universally outranks another or grants authority.
5. Bound the conflict: affected workflow, outcome, human authority, data, acceptance evidence, economics, downstream work, and safe behavior while unresolved.
6. Prepare one cited reframe with inclusions, exclusions, retained authority, safe fallback, affected work, required decision, and next field move under each outcome.
7. Obtain a scoped `continue_discovery`, `bounded_kickoff`, `defer`, or `stop` disposition from the verified disposition authority. Bind the authority basis, exact passage, scope, rationale, and time.
8. Preserve chronology and propagate only dependency-linked changes. Leave unrelated revisions and digests unchanged; route stale work for review.

## Output contract

Return:

- a current field brief with roles, representative evidence, limitations, and next move;
- the competing claims, cited conflict, safe fallback, and decision brief;
- a schema-valid engagement-reframe record with scoped human disposition or explicit missing authority;
- the affected downstream list with `no_change`, `review_required`, or `supersede` and preserved chronology;
- the current boundary and evidence required to reconsider it.

Stop if the relevant evidence, process knower, or disposition authority cannot be established. Do not invent observations, approvals, acceptance, or target-system authority.
