# FDE and Applied-AI Portfolio Review

Use this review above the individual [production service reviews](production-service-review.md) when a delivery organization operates more than one customer or internal workflow. It compares investment, continuation, capacity, and reuse without allowing a portfolio average to override a workflow's value, safety, release, or retirement gate.

For an external provider, continuation may mean a paid deployment, renewal, or expansion decision. For an internal team, it may mean continued sponsorship, funding, or roadmap commitment. These are operating signals—not proof that value occurred.

## Review identity and cohort

| Field | Value |
| --- | --- |
| Portfolio and review period | — |
| Portfolio owner and decision forum | — |
| Operating model | External delivery / internal applied-AI team / mixed |
| Evidence cutoff and source revisions | — |
| Included workflows and cohort rule | — |
| Exclusions and comparability limits | — |
| Decision required | Invest / continue / transfer / standardize / productize / constrain / exit |

Freeze stage definitions, cohort boundaries, time windows, currencies, and cost-allocation rules before comparing workflows. Preserve prior definitions when they change.

## Stage flow and pilot graduation

| Workflow | Accountable owner | Current stage | Stage entered | Next gate and date | Graduation evidence | Blocker or stop reason |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | Qualify / discover / charter / build / prove / launch / operate / retire | — | — | — | — |

| Cohort measure | Eligible denominator | Current | Prior comparable cohort | Definition / source | Owner |
| --- | ---: | ---: | ---: | --- | --- |
| Qualified workflows entering pilot | — | — | — | Passed owner, verifier, value, adoption, and risk gates | — |
| Pilots reaching bounded production | — | — | — | Passed each declared graduation gate; no composite-score override | — |
| Pilots stopped, deferred, or redesigned | — | — | — | Preserve reason and evidence; stopping weak work is a valid result | — |
| Time to first accepted outcome | — | — | — | Approved pilot start to first independently accepted outcome | — |
| Time to first accepted value | — | — | — | Approved pilot start to first accepted outcome with measured attributable business effect | — |

Do not call the first accepted outcome “value” until its business effect and attribution are measured. Do not interpret conversion as quality without reviewing which candidates were admitted, stopped, or excluded.

## Outcome, adoption, and continuation

| Workflow | Accepted outcome and segment | Realized net value / confidence | Adoption / guardrail | Service health | Continuation mechanism, owner, and date | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | Renewal / funding / sponsorship / mandate | — |

Record sponsor or business-owner continuity separately from system health. A signed renewal, committed budget, active sponsor, or enthusiastic reference can support continuation planning, but none independently verifies an accepted outcome or realized value.

## Full delivery economics

Agree the accounting boundary with the owning finance or portfolio role. Include discovery, unpaid or allocated pilot work, implementation, change, assurance, travel, tooling, support, incidents, recovery, and ongoing maintenance where they belong. Keep booked contract value, recognized revenue, internal allocation, contribution, and profit distinct.

| Measure | Cohort and period | Current | Prior | Definition / allocation | Guardrail | Owner |
| --- | --- | ---: | ---: | --- | --- | --- |
| Full delivery cost per workflow | — | — | — | — | — | — |
| Full operating cost per accepted outcome | — | — | — | — | — | — |
| Realized net value to full-cost ratio | — | — | — | — | — | — |
| External delivery contribution, if applicable | — | — | — | Recognized revenue minus declared directly attributable cost; not profit | — | — |
| Customer-specific effort ratio | — | — | — | Target-specific delivery and support effort / total comparable effort | — | — |
| Delivery-team interventions per compatible change or accepted outcome | — | — | — | Count hands-on field actions separately from ordinary receiving-team operation | — | — |
| Unresolved parallel production assets | — | — | — | Field-owned services without an accepted target, product/platform, or retirement owner | 0 or approved time-bounded exceptions | — |
| Supported-workflow load per delivery/operator capacity | — | — | — | Include severity, support window, and on-call burden | — | — |

A falling customer-specific effort ratio is useful only when accepted outcomes, adoption, safety, supportability, and full cost remain healthy. Capacity gains that depend on hidden operator or customer work are not improvements.

## Workflow variation and standardization eligibility

Inventory the variation before treating several workflows as one reusable deployment. Classify each material difference as `policy-required`, `segment-specific`, `role-specific`, `system-constrained`, or `accidental dysfunction`. The first four may require a retained branch or separate cohort; the last is a candidate for repair, not a behavior to encode because it recurs.

| Workflow / target | Comparable decision and accepted outcome | Observed variation | Variation class | Source, owner, and consequence | Standardization eligibility | Local validation retained |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | Policy-required / segment-specific / role-specific / system-constrained / accidental dysfunction | — | Ineligible / comparable cohort / after remediation | Policy / data / evaluation / release / adoption / ownership |

Cluster only workflows whose decision, accepted outcome, policy boundary, source semantics, effect class, and operating conditions are genuinely comparable. A shared pattern may reduce delivery work; it does not erase target-specific policy, data, security, evaluation, release, adoption, support, or ownership gates.

Allocate the next unit of attention to the first unresolved hard gate or binding constraint in each workflow—not to the lowest composite or average maturity score. Portfolio scoring may help sort questions, but it cannot make an unverified target ready or turn unlike variants into one deployment.

## Reuse and field-to-product learning

| Candidate | Comparable recurrence | Current target-specific effort | Reused governed artifact and validation | Ownership and reuse-rights status | Productization cost and owner | Expected future effect | Decision |
| --- | --- | ---: | --- | --- | ---: | --- | --- |
| — | — | — | — | Cleared / restricted / pending / prohibited | — | Delivery time / support load / quality / safety / cost | — |

Use the [field-learning register](field-learning-register.md) for evidence, confidentiality, ownership, reuse rights, portability, and release disposition. Count reuse only when the artifact was actually used and validated in the target context. Reusing a template, copying customer policy, or avoiding necessary local work is not product leverage.

## Sponsor resilience and operating capacity

| Workflow | Primary sponsor or business owner | Independent backup | Receiving service owner | Last owner-led review or exercise | Delivery-team dependency | Action |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | None / time-bounded / material | — |

| Capacity signal | Current | Guardrail | Decision |
| --- | ---: | ---: | --- |
| Unowned workflows | — | 0 | — |
| Workflows dependent on one sponsor or one delivery engineer | — | — | — |
| Open high-severity support or control debt | — | — | — |
| Delivery, travel, review, or on-call load above the declared limit | — | — | — |

## Decisions and actions

| Decision/action | Evidence | Affected workflows | Owner | Due | Verification |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — |

An expansion decision starts a new target-specific value, design, evaluation, release, adoption, and ownership decision. A productization decision starts the normal field-learning and compatible-release path. A portfolio decision never authorizes a production effect or replaces the individual workflow's service review.

Controls: `FDE-003`, `FDE-004`, `VAL-001`, `VAL-002`, `VAL-003`, `ADP-002`, `OPS-004`, `OPS-006`, `CST-001`.
