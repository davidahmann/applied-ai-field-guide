# Delivery and Adoption Plan

## Delivery contract

| Field | Value |
| --- | --- |
| Workflow charter and version | — |
| Initial segment and maximum effect | — |
| Accepted outcome and verifier | — |
| Delivery lead | — |
| Operational/product owner | — |
| Technical and service owner | — |
| Risk and data owners | — |
| Target pilot and production dates | — |
| Pilot graduation decision and evidence-cutoff dates | — |
| Pilot adoption owner and instrumentation-ready date | — |
| Receiving harness owner and paired-operation start | — |
| Primary sponsor / independent backup / succession trigger | — |
| Continuation mechanism, owner, and decision date | External renewal / internal funding or sponsorship / other |
| Stop conditions | — |

## Requirement-to-release trace

| Requirement | Domain/state | Context/logic | Tool/effect | Security | UX/artifact | Eval | Telemetry | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — |

## Field contribution boundary

Classify each material field-built asset before implementation. The classification does not authorize the change; it binds the work to an owner and the destination's normal engineering, security, release, support, and lifecycle path.

| Asset or change | Contribution path | Contribution rights | Authoritative repo/runtime | Required review and release path | Production/support owner | Reuse-rights decision | Migration, exit, or retirement evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | Customer configuration / target-owned extension / shared product or platform / time-bounded experiment / prohibited or deferred | Independent / collaborative / destination-owner only / none | — | — | — | Cleared / restricted / pending / prohibited | — |

For product or platform work, use the destination team's normal codebase, architecture, security, testing, release, telemetry, on-call, and maintenance standards. A temporary parallel service is a potential shadow product and MUST name its production ceiling, expiry, migration or destruction path, and blocking gate. `FDE-004`, `DEL-001`, `OPS-003`.

## Milestones

| Milestone | Demonstrable vertical slice | Entry evidence | Exit evidence | Owner |
| --- | --- | --- | --- | --- |
| Discovery complete | Charter and observed cases | Sponsor and operator access | Approved bounded workflow | — |
| Architecture complete | End-to-end design and threat paths | Charter | Contracts, tests, rollback design | — |
| Sandbox complete | Representative trigger through verified simulated effect | Versioned fixtures | Contracts and negative cases pass | — |
| Shadow complete | Real inputs, no production effect | Trace and reviewer capacity | Outcome, safety, cost, UX thresholds | — |
| Canary complete | Named segment and reversible/staged effect | On-call and rollback | SLO, adoption, value, recovery evidence | — |
| Bounded production | Supported service | Customer ownership exercised | Review cadence and expansion decision | — |

## Pilot graduation contract

Freeze this contract before pilot work begins. A pilot graduates only when each applicable gate passes independently; a strong technical result or composite score cannot average away failed adoption, value, economics, safety, or operating ownership.

| Gate | Named segment and threshold | Evidence source and cutoff | Decision owner | If the gate fails |
| --- | --- | --- | --- | --- |
| Technical performance | — | — | — | Revise / stop |
| Operator acceptance | — | — | — | Redesign workflow or surface / stop |
| Adoption | — | — | — | Remove friction / narrow segment / stop |
| Business-value evidence | — | — | — | Extend measurement once with reason / defer / stop |
| Full economics | — | — | — | Reduce cost or scope / defer / stop |
| Production readiness | — | — | — | Hold release / remediate / stop |

| Graduation field | Value |
| --- | --- |
| Approved pilot start and maximum duration | — |
| Allowed evidence extension and approver | None / one bounded extension with reason and date |
| Resulting charter or release decision | — |
| Graceful exit, state disposition, and restart conditions | — |

Control: `FDE-003`.

## Adoption measurement contract

Freeze this contract before pilot entry. Changes to the denominator, event definition, window, or source create a new measurement revision and require a documented rebaseline.

| Adoption metric | Eligible denominator and exclusions | Baseline value / as-of / status | Target | Guardrail and limit | Measurement window | Authoritative event/query source and revision | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — |

Record the identity-deduplication rule, late-event policy, timezone, missing-data behavior, and segment keys used to calculate the metric.

## Adoption funnel and friction review

Use one cohort, window, and metric revision across the funnel. Every count must reconcile to its authoritative event/query source; do not infer a missing stage from downstream activity.

| Funnel stage | Declared event or query | Eligible count / reached count / rate | Leading failure reasons from representative cases | Owner and dated response |
| --- | --- | --- | --- | --- |
| Eligible opportunity | — | — | Eligibility, source quality, policy, or segment exclusions | — |
| Exposed in the usable surface | — | — | Routing, access, integration, latency, or missing context | — |
| Completed or explicitly dispositioned | — | — | Workflow placement, surface friction, trust, training, or fallback | — |
| Independently accepted | — | — | Evidence, behavior, correction, rejection, policy, or authority | — |
| Verified business effect | — | — | Wrong bottleneck, weak baseline, downstream rework, or attribution | — |
| Sustained net value | — | — | Reviewer load, support, recovery, incidents, or full cost | — |

Define bounded reason codes from observed cases and preserve an open-text escape hatch. Sample non-use and abandonment; do not classify silence as user resistance without checking access, routing, data, timing, and the current manual path.

## Adoption rehearsal and cohort sequence

| Step | Representative users and cases | Entry evidence | Exercise | Exit evidence or stop condition | Owner |
| --- | --- | --- | --- | --- | --- |
| Observe current work | — | Recent cases and process knower | Trace the current artifact, waits, workarounds, escalation, and recovery | Current path and operator burden are evidenced | — |
| Access and surface rehearsal | — | Final role and representative fixture | Sign in, find the case, inspect evidence, correct, reject, escalate, and resume | Critical action or access friction is resolved | — |
| Assisted shadow | — | Frozen adoption contract and instrumentation | Operator uses the surface while the current path remains authoritative | Funnel events reconcile and no blocking safety or workflow gap remains | — |
| Operator-led bounded cohort | — | Support capacity and rollback ready | Operators lead; delivery team observes and records reason codes | Thresholds and guardrails pass, or cohort is constrained/stopped | — |
| Receiving-team-led cohort | — | Named service, training, access, and support owners | Receiving team enables users, supports cases, reproduces metrics, and leads review | Exercised capability supports handoff decision | — |

## Review and support capacity

| Capacity | Forecast demand and burst | Available capacity and hours | Queue/wait limit | Overflow or degraded path | Owner | Evidence and decision |
| --- | ---: | ---: | --- | --- | --- | --- |
| Domain review | — | — | — | — | — | — |
| User support and training | — | — | — | — | — | — |
| Incident and reconciliation | — | — | — | — | — | — |

Do not expand a cohort when adoption success would exceed review, support, or recovery capacity. A named person is not capacity evidence; exercise the forecast peak, wait limit, overflow path, and escalation.

## Adoption design

| User group | Eligible segment | Current job and artifact | New surface | Benefit | New responsibility | Training | Feedback channel | Adoption contract row |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — | — | — |

The production surface must expose evidence, state, uncertainty, alternatives, and permitted actions. Users must be able to correct, pause, reject, escalate, and resume work without losing the audit trail.

## Stakeholder value and productization boundary

| Audience | Outcome or workday benefit | New responsibility | Acceptance evidence | Customer-specific or reusable | Owner |
| --- | --- | --- | --- | --- | --- |
| Executive or operational sponsor | | | | Customer-specific | |
| Operator or domain expert | | | | Customer-specific | |
| Product or applied-AI team | | | | Reusable only after governed validation | |

Keep confidential workflow context, local policy, identities, and evidence with the owning organization. A repeated field signal may become a shared pattern or product candidate only after sanitization, recurrence review, a named destination, independent validation, and the normal compatible-release gate. Record that decision in the [field-learning register](field-learning-register.md). `FDE-004`, `DEL-002`.

## Sponsor, owner, and continuation resilience

| Role or decision | Primary | Independent backup | Last evidence-backed review | Succession or escalation trigger | Next decision date |
| --- | --- | --- | --- | --- | --- |
| Business outcome and continuation | — | — | — | — | — |
| Operational ownership | — | — | — | — | — |
| Technical/service ownership | — | — | — | — | — |
| Risk acceptance | — | — | — | — | — |

For an external engagement, continuation may be a deployment, renewal, or expansion decision. For an internal team, it may be sponsorship, funding, or roadmap commitment. Record it as organizational context; it does not prove accepted outcomes or realized value.

## Pilot adoption and harness handoff

Open this workstream at pilot entry. The receiving team pairs on the actual harness, evaluation, release, support, and adoption paths before bounded production.

| Capability | Pilot exercise | FDE/delivery owner | Receiving owner | Start / customer-led date | Evidence | Blocking gate |
| --- | --- | --- | --- | --- | --- | --- |
| Harness configuration and bounded run | Trace one representative run from admission to terminal state | — | — | — | — | — |
| Behavior change | Review a model, prompt, context-policy, tool-bundle, or guardrail diff | — | — | — | — | — |
| Evaluation and case authoring | Add and execute a representative and a negative case | — | — | — | — | — |
| Adoption instrumentation | Reproduce numerator, denominator, exclusions, and guardrail from source | — | — | — | — | — |
| Release and rollback | Promote an isolated compatible release and restore the prior version | — | — | — | — | — |
| Alert, containment, and reconciliation | Run a game day using the production route and source-of-truth readback | — | — | — | — | — |
| User support and feedback triage | Resolve a pilot support case and classify the resulting learning | — | — | — | — | — |
| Adoption diagnosis and response | Diagnose one funnel break from representative cases and deliver the owned product, access, training, or operating response | — | — | — | — | — |

Controls: `FDE-003`, `ADP-002`, `DEL-001`, `OPS-007`.

## Artifact ownership and lineage

| Artifact/release role | Authoritative URI | Version or digest | Upstream inputs and revisions | Producing path | Change owner | Receiving owner | Access/retention | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Workflow charter and value contract | — | — | — | — | — | — | — | — |
| Domain/data/context contract | — | — | — | — | — | — | — | — |
| Agent harness and behavior bundle | — | — | — | — | — | — | — | — |
| Tool, identity, and policy contracts | — | — | — | — | — | — | — | — |
| Evaluation suite and report | — | — | — | — | — | — | — | — |
| User surface and support assets | — | — | — | — | — | — | — | — |
| Runtime, telemetry, runbooks, and release manifest | — | — | — | — | — | — | — | — |

Each production release resolves these rows to immutable versions or digests; aliases such as `latest` do not establish lineage.

## Prototype-debt register

| Shortcut or parallel asset | Risk | Authoritative destination | Production disposition | Owner | Deadline | Blocking gate |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | Migrate / replace / accept as governed target asset / destroy / retire | — | — | — |

## Dependencies

| Dependency | Owner | Contract/version | Change notice | Failure mode | Degraded behavior | Exit path |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

## Customer enablement

| Capability | Learn | Pair | Customer leads | Evidence |
| --- | --- | --- | --- | --- |
| Architecture and contracts | — | — | — | — |
| Evaluation and case authoring | — | — | — | — |
| Harness and behavior change | — | — | — | — |
| Adoption measurement and rebaseline | — | — | — | — |
| Release and rollback | — | — | — | — |
| Monitoring and support | — | — | — | — |
| Incident and reconciliation | — | — | — | — |
| Access, policy, and dependency management | — | — | — | — |

## Decision log

| Date | Decision | Evidence | Alternatives | Owner | Revisit trigger |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |
