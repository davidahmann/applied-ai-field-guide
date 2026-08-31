# FDE Product Boundaries and Capability Transfer

**Review date:** 2026-08-10

**Scope:** field contribution boundaries, product feedback, receiving-team capability, and responsible reuse

**Decision:** admit three directly inspectable practitioner sources; retain the remaining supplied profiles and social posts as leads only

## Why this review exists

The repository already requires outcome-led discovery, separate pilot gates, exercised handoff, and governed field learning. This review tested whether a supplied list of FDE practitioners added implementation detail that was missing from those controls.

The useful gap was not another definition of FDE. It was the boundary between a field delivery and the product, platform, or customer system that must own the result.

## Admitted evidence

| Evidence | Why admitted | Portable contribution | Claim limit |
| --- | --- | --- | --- |
| [R26-70](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-70), PagerDuty / Doug McClure | First-party operating report with concrete organizational and engineering changes | Contribution zones; normal product engineering path; explicit disposition for field-built work; no unsupported parallel stack | One vendor's retrospective, not a universal org chart or speed target |
| [R26-71](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-71), Legion Intelligence / Nick Weir | Directly inspectable position paper with falsifiable operating questions | Capability-transfer evidence; declining target-specific dependency; product-gap escalation; contract and reuse-rights decision | Vendor thesis; intentionally critical of large FDE organizations |
| [R26-72](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-72), Nasser Ghanemzadeh | Practitioner-authored working guide with an explicit end-to-end engagement and handoff | One accountable delivery path from bounded workflow through code, evaluation, and maintainable handoff | Practitioner synthesis and commercial positioning, not an outcome study |

Aaron Levie's supplied applied-AI post was already admitted and implemented through the [operational-redesign note](2026-08-08--operational-redesign-and-applied-ai-practice.md). Its workflow-specific product surfaces, model-routing, change-management, and domain-expertise lessons remain relevant but did not justify a duplicate control.

## Leads not promoted into core guidance

The supplied references to Niles Lawrence, Pauline Brunet, Jerry Liu, Brian Bohan, Vas M., and Peter Inge were useful discovery leads. The reviewed material did not provide a directly inspectable primary artifact or sufficiently concrete new mechanism beyond the guide's existing value, evaluation, workflow-redesign, and handoff requirements. Their popularity or job title is not evidence, so no normative claim was added from those references.

## Portable decisions

### 1. Classify the contribution before building

Every field change should name one destination:

- customer or business-unit configuration;
- target-owned extension in the target's normal repository and runtime;
- shared product or platform capability owned by product engineering;
- time-bounded experiment with a destruction or retirement date;
- prohibited or deferred work.

The classification determines contribution rights, security review, release path, support owner, on-call obligation, reuse rights, and exit evidence. It does not grant authority by itself.

### 2. Reject the shadow product

A field-owned service outside normal architecture, security, release, telemetry, support, and lifecycle ownership can make a pilot move quickly while creating a second product nobody is equipped to run. If such an asset is temporarily necessary, record its owner, time limit, supported scope, migration or retirement path, and blocking production gate.

### 3. Measure transfer rather than document delivery

Handoff evidence should show that the receiving team can make a representative change, evaluate it, release it, recover it, support users, and retire it. Portfolio review should track target-specific intervention and unresolved parallel infrastructure alongside outcomes, adoption, safety, and full cost. Lower FDE involvement is not success if hidden customer work, risk, or degraded outcomes replace it.

### 4. Clear rights before reuse

Before field work becomes shared product, platform, or public guidance, record who funded and owns it; relevant contract, intellectual-property, license, confidentiality, and attribution constraints; what was sanitized; and who approved the destination. Recurrence across customers does not authorize transfer of customer evidence.

## Repository impact

| Artifact | Change |
| --- | --- |
| [FDE and applied-AI synthesis](../library/10-fde-and-production-agent-synthesis.md) | Add an owned contribution-path decision and shadow-product boundary |
| [Delivery and adoption plan](../templates/delivery-and-adoption-plan.md) | Add the contribution-zone and destination record before implementation |
| [Field-learning register](../templates/field-learning-register.md) | Add reuse-rights clearance and field-asset disposition |
| [Customer handoff](../templates/customer-enablement-handoff.md) | Add capability-transfer and dependency-reduction evidence |
| [Portfolio review](../templates/fde-portfolio-review.md) | Add unresolved shadow-product and target-specific intervention signals |
| [Pattern catalog](../patterns/pattern-catalog.json) | Add an owned field-contribution pattern and a field-owned shadow-product anti-pattern |

## What this does not establish

- FDE team size, customer-to-engineer ratio, or a universal organization design
- that all customer-specific work belongs in the vendor's shared product
- that falling field hours proves value or maturity
- contractual ownership, reuse permission, or intellectual-property rights without target-specific review
- that a practitioner field report independently proves business outcomes
