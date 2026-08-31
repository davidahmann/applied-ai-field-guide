# Customer Enablement and Production Handoff

Open this record at pilot entry. Handoff is complete only when the receiving team demonstrates the operating capability; documentation delivery alone is insufficient.

## Ownership

| Responsibility | Primary | Backup | Escalation | Evidence exercised |
| --- | --- | --- | --- | --- |
| Business outcome and scope | — | — | — | — |
| Product/workflow roadmap | — | — | — | — |
| Service and on-call | — | — | — | — |
| Architecture and release | — | — | — | — |
| Agent harness and behavior configuration | — | — | — | — |
| Data and context quality | — | — | — | — |
| Tools and integrations | — | — | — | — |
| Identity, policy, and risk | — | — | — | — |
| Evaluation and model behavior | — | — | — | — |
| Adoption instrumentation and value measurement | — | — | — | — |
| User support and training | — | — | — | — |

## Pilot transfer plan

| Capability | FDE leads | Paired operation | Receiving team leads | Exit evidence | Gap owner / due |
| --- | --- | --- | --- | --- | --- |
| Harness, model route, prompt, context policy, and guardrails | — | — | — | — | — |
| Tool, identity, authorization, egress, and effect controls | — | — | — | — | — |
| Evaluation cases, graders, fixtures, and reports | — | — | — | — | — |
| Adoption event, denominator query, guardrails, and rebaseline | — | — | — | — | — |
| Operator workflow, access, training, support, and adoption diagnosis | — | — | — | — | — |
| Release, canary, rollback, and dependency lifecycle | — | — | — | — | — |
| Alerts, incidents, reconciliation, and support | — | — | — | — | — |

## Capability evidence

| Capability | Demonstration | Pass evidence | Date | Approver |
| --- | --- | --- | --- | --- |
| Explain scope, limits, and architecture | Design review led by receiving team | Questions and risks resolved | — | — |
| Add a representative evaluation case | Case authored and run independently | Valid fixture, grader, and expected result | — | — |
| Change the harness safely | Version one behavior component and run affected-route tests | Compatible manifest, evaluation, canary, and rollback evidence | — | — |
| Reproduce adoption measurement | Run numerator and eligible-denominator queries from declared sources | Result matches dashboard and exclusions are explained | — | — |
| Enable one representative cohort | Receiving team grants access, runs workflow-native training, and supports first use | Users reach the final surface through the owned path; access and support evidence is retained | — | — |
| Diagnose an adoption break | Trace one weak funnel transition through representative cases and reason codes | Owning layer, response, due date, and follow-up measure are accepted | — | — |
| Release a compatible change | Branch, review, promotion, and canary | Release evidence and healthy soak | — | — |
| Roll back behavior | Trigger simulated rollback | Prior version restored and verified | — | — |
| Respond to an alert | Game day from detection to containment | Alert, owner, kill switch, and readback work | — | — |
| Reconcile an external effect | Source-of-truth comparison | Affected state identified and corrected | — | — |
| Manage access and policy | Joiner/mover/leaver and policy change | Least privilege and audit verified | — | — |
| Support an operator | Ticket triage and feedback loop | Resolution and backlog classification | — | — |
| Review value and adoption | Monthly service review led by owner | Decision and follow-up actions recorded | — | — |
| Retire the workflow | Tabletop decommission | Identity, tools, state, audit, and users covered | — | — |

## Capability-transfer and dependency evidence

Measure whether the receiving team can operate and change the service without hidden delivery-team work. Falling FDE involvement is useful only while accepted outcomes, adoption, safety, reliability, and full cost remain healthy.

| Measure or exercise | Baseline | Exit target | Observed result and window | Evidence source | Owner / decision |
| --- | ---: | ---: | ---: | --- | --- |
| Representative changes completed by the receiving team without delivery-team intervention | — | — | — | — | — |
| Routine support cases resolved without delivery-team intervention | — | — | — | — | — |
| Delivery-team hours per accepted outcome or compatible change | — | — | — | — | — |
| Unresolved target-specific or parallel production assets | — | 0 or approved time-bounded exceptions | — | — | — |
| Product/platform gaps with an accepted owner and disposition | — | — | — | — | — |

Document temporary support with a scope, owner, expiry, and exit exercise. Do not manufacture self-sufficiency by shifting unmeasured work or risk to operators. `ADP-002`, `FDE-004`, `OPS-003`.

## Knowledge and assets

- [ ] Workflow charter, value case, current-state map, and decision log
- [ ] Architecture, domain model, tool and policy contracts, and data lineage
- [ ] Threat model, evaluation suites, reference worlds, and known limitations
- [ ] Release manifest, environments, dependency lifecycle, and rollback procedure
- [ ] Dashboards, alerts, SLOs, runbooks, kill switches, and reconciliation queries
- [ ] User guide, training material, support intake, and escalation routes
- [ ] Backlog classified as customer configuration, reusable pattern, platform gap, model limitation, operating problem, or retirement candidate
- [ ] Every field-built production asset has a target, product/platform, or retirement owner and normal change path
- [ ] Reuse rights and transfer constraints are recorded for customer-funded, jointly developed, or confidential work

## Artifact ownership and lineage

| Artifact/release role | Authoritative URI | Version or digest | Upstream lineage | Current change owner | Receiving owner | Promotion path | Access/retention | Last verified |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Workflow charter and value/adoption contract | — | — | — | — | — | — | — | — |
| Data, domain, and context contracts | — | — | — | — | — | — | — | — |
| Harness and behavior bundle | — | — | — | — | — | — | — | — |
| Tool, identity, and policy contracts | — | — | — | — | — | — | — | — |
| Evaluation suite and release evidence | — | — | — | — | — | — | — | — |
| User surface, telemetry, runbooks, and support assets | — | — | — | — | — | — | — | — |

Every production row resolves to an immutable version or digest and names both the upstream inputs and the path used to promote a change.

## Post-exit support and re-entry contract

| Field | Value |
| --- | --- |
| Receiving-team support hours, channel, severity, and response target | — |
| Temporary delivery-team support scope and maximum hours | — |
| Temporary support owner and expiry | — |
| Escalation and succession path | — |
| First post-exit service review | — |
| Re-entry trigger and approving owner | New workflow evidence / severe incident / material policy or dependency change / other |
| Explicitly excluded delivery-team work | Routine operation / ordinary support / unowned backlog / other |

Re-entry is a scoped decision, not a reset to permanent embedded delivery. Preserve the receiving team's ownership, name the new evidence or event, bound the work, and set the next exit exercise.

## Acceptance decision

Record accepted, accepted with dated conditions, or not accepted. Include remaining gaps, temporary FDE support, final service owner, next service review, and rollback or retirement trigger.
