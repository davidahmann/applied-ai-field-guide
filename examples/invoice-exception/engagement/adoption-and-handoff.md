# Worked Adoption and Handoff Plan

This record is intentionally incomplete. It shows what must be fixed before a pilot begins and what the receiving team must exercise before delivery-team exit. No exercise below has been run in a customer environment.

## Adoption contract to freeze before pilot entry

| Field | Predeclared definition |
| --- | --- |
| Eligible denominator | Domestic price-variance exceptions meeting policy revision 8 and source-quality requirements; exclude duplicate, cross-tenant, payment-execution, and unsupported-policy cases |
| Exposure | Eligible case rendered in the persistent review queue with cited evidence |
| Completion | Reviewer approves, edits, rejects, or explicitly escalates the proposal |
| Accepted outcome | Approved correction matches ledger readback and the verified proposal digest |
| Target | At least 60% of eligible cases exposed and 80% of exposed cases independently accepted in the named pilot window |
| Guardrails | Zero prohibited or unverified effects; correction or rejection below 20%; abandonment below 10%; reviewer wait and support load within named capacity |
| Sources | Queue eligibility query, review-surface events, approval record, effect receipt, ledger readback, support queue, and time study—each with a fixed revision |
| Owner | Accounts-payable service owner; finance controls manager verifies acceptance |

The actual target dates, source queries, event schemas, timezone, late-event policy, identity-deduplication rule, baseline status, and reviewer-capacity limit remain open. That blocks pilot entry.

## Receiving-team exercises

| Capability | Required demonstration | Current state |
| --- | --- | --- |
| Explain scope and limits | Receiving owner leads a review of the recommendation-only boundary | Not run |
| Reproduce adoption | Run numerator, denominator, exclusions, and guardrail queries from authoritative sources | Not run |
| Add an evaluation case | Author one representative exception and one negative authority case | Not run |
| Release and rollback | Promote an isolated compatible candidate and restore the prior release | Not run |
| Contain and reconcile | Use the kill switch, identify affected effects, and verify ledger state | Not run |
| Support an operator | Resolve a pilot support case and classify the learning | Not run |
| Retire the service | Tabletop identity, tools, schedules, state, evidence, users, and manual fallback | Not run |

## Exit decision

`handoff_blocked`. Documentation and passing fixture tests are not exercised operating capability. The delivery team must not exit into a production handoff, and the service must not claim bounded production, until the receiving team leads the required paths with inspectable evidence.
