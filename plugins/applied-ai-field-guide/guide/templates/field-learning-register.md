# Field-Learning Register

Use one record per candidate learning. Store source evidence in its governed system; link only the minimum sanitized evidence needed for triage and validation.

## Register identity

| Field | Value |
| --- | --- |
| Register owner | — |
| Product/platform triage owner | — |
| Customer confidentiality approver | — |
| Review cadence | — |
| Evidence retention policy | — |

## Index

| Learning ID | Short claim | Class | Recurrence | Confidentiality | Destination | Destination owner | Disposition | Validation status | Review due |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — | — |

## Learning record

### Identity and observation

| Field | Value |
| --- | --- |
| Learning ID and revision | — |
| First / last observed | — |
| Reporting workflow, release, segment, and environment | — |
| Operational decision or invariant affected | — |
| Sanitized candidate claim | — |
| Class | Customer configuration / reusable pattern / platform gap / model limitation / operating problem / non-viable use case |
| Reporter and triage owner | — |

### Recurrence and evidence

| Field | Value |
| --- | --- |
| Recurrence class | One case / repeated within segment / cross-segment / cross-workflow / cross-customer |
| Occurrence count and eligible denominator | — |
| Time window and query/source revision | — |
| Affected and unaffected slices | — |
| Supporting evidence links and digests | — |
| Counter-evidence and alternative explanations | — |
| First divergent state or violated invariant | — |
| Sanitized replay/regression case | — |
| Comparable deployment or workflow cohort | — |
| Observed workflow variant and comparator | — |
| Variant class | Policy-required / segment-specific / role-specific / system-constrained / accidental dysfunction |
| Standardization eligibility | Ineligible / comparable cohort / candidate after remediation |
| Local constraints and validation that must remain | Policy / data / security / evaluation / release / adoption / support / ownership |
| Target-specific delivery and support effort | — |
| Customer-specific effort ratio and prior comparable result | — |
| Existing governed artifact reused, exact version, and prior scope | — |
| Target revalidation, residual differences, and resulting disposition | — |
| Recurrence confidence and reviewer | — |

### Confidentiality and portability

| Field | Value |
| --- | --- |
| Source classification | Public / internal / confidential / restricted |
| Customer-specific data, policy, or workflow detail present | — |
| Sanitization or abstraction performed | — |
| Confidentiality approver and date | — |
| Permitted audience and destination | Customer only / product team / shared repository / public |
| Reuse constraints and prohibited transfer | — |
| Portable scope boundary | — |

### Ownership and reuse rights

| Field | Value |
| --- | --- |
| Customer-funded or jointly developed work | Yes / no / mixed / unknown |
| Contract and statement-of-work reference | — |
| Intellectual-property owner and permitted uses | — |
| License, attribution, confidentiality, or publication constraints | — |
| Evidence and code that must remain target-specific | — |
| Sanitized reusable subject and provenance | — |
| Reuse decision owner, legal/contract reviewer when required, and date | — |
| Reuse status | Cleared / restricted / pending / prohibited |

Do not move raw customer data, proprietary policy, credentials, identifiers, or confidential workflow detail into a shared or public destination. A cross-customer recurrence label records independently reviewed evidence; it does not authorize evidence transfer between customers.

### Destination and disposition

| Field | Value |
| --- | --- |
| Destination | Customer configuration / target-owned extension / product backlog / platform backlog / pattern / blueprint / template / tool contract / evaluation suite / model-routing policy / operating procedure / temporary-asset retirement record |
| Destination owner | — |
| Disposition | Investigate / configure / fix / productize / standardize / defer / reject / retire |
| Decision, rationale, and approver | — |
| Target artifact, issue, or release | — |
| Productization and ongoing maintenance cost | — |
| Expected effect on future delivery time, support load, quality, safety, or full cost | — |
| Required artifact owner and lineage update | — |
| Due date or reconsideration trigger | — |
| Existing parallel or shadow asset, owner, and deadline | None / — |

### Validation and closure

| Field | Value |
| --- | --- |
| Validation hypothesis | — |
| Representative and negative cases | — |
| Independent holdout or comparison | — |
| Acceptance and guardrail thresholds | — |
| Affected-route evaluation and security regression | — |
| Pilot/canary segment, soak, and rollback trigger | — |
| Observed outcome and uncertainty | — |
| Validation owner / reviewer / date | — |
| Status | Proposed / triaged / validating / accepted / implemented / rejected / deferred / retired |
| Closure evidence and next recurrence query | — |

An accepted learning changes production only through its destination's normal architecture, security, review, compatible-release, evaluation, approval, support, and rollback gates. The learning record is evidence for a decision; it is not release authorization. Recurrence does not establish ownership, license, confidentiality clearance, or reuse permission.

A lower customer-specific effort ratio is useful only when outcomes, adoption, safety, supportability, and full cost remain healthy across comparable contexts. Template reuse, copied customer policy, or skipped local validation does not establish product leverage.

Standardization is a field-learning disposition, not permission to flatten variation. Preserve policy-required, segment-specific, role-specific, and system-constrained differences. Repair accidental dysfunction before treating the result as a reusable pattern, and retain every target's normal validation and release gates.

Evidence: [R26-37](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-37), [R26-45](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-45), [R26-54](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-54), [R26-70](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-70), and [R26-71](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-71).
