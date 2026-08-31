---
name: qualify-ai-workflow
description: Qualify a candidate AI-enabled workflow before value modeling or solution design. Use for field discovery, workflow observation, boundary and readiness assessment, value-modeling eligibility, or a charter decision that needs an owner, baseline, accepted outcome, verifier, adoption path, and risk ceiling.
---

# Qualify an AI Workflow

Turn a proposed use case into an evidence-backed workflow decision. Do not select a model, framework, or agent topology during this skill.

## Read first

1. Read [Field Engagement and Accountable Reframing](../../../playbooks/00-field-engagement-and-reframing.md), the [12 Factors of AI Value Engineering](../../../library/14-twelve-factors-ai-value-engineering.md), and the [Discovery and Value playbook](../../../playbooks/01-discovery-and-value.md).
2. Use the [field-observation log](../../../templates/field-observation-log.md), [discovery pack](../../../templates/fde-discovery-pack.md), [engagement-reframe record](../../../templates/engagement-reframe.json), [workflow-charter template](../../../templates/workflow-charter.json), and [data-readiness assessment](../../../templates/data-readiness-assessment.md).
3. Only after observing and bounding the target work, compare it with the [business-flow index](../../../solutions/business-flows/README.md). Read only one matching pattern, or record `none`; treat it as a hypothesis rather than field evidence or design approval.
4. Apply `FDE-001` through `FDE-003`, `FDE-005`, `VAL-001`, `VAL-003`, `CTX-001`, and `CTX-006` through `CTX-008` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Preserve the inherited workflow story and source passages as hypotheses. Separately name the sponsor, process knower, operator, disposition authority, owner, and verifier; never infer one role from another.
2. Find or verify the process knower through a recent case, exception queue, workaround, escalation, or recovery path. Inspect representative normal and exceptional work and record its population limits.
3. Compare consequential `sold`, `stated`, `observed`, `system_enforced`, and `policy_authorized` claims. Preserve conflicts; when one changes the boundary, invoke `$reframe-ai-engagement` before chartering.
4. Name the user, interface, trigger, decision, inputs, permitted action, accepted outcome, safe fallback, and next accountable field move.
5. Record the baseline as measured or explicitly unmeasured. Define the eligible population, measurement window, target, attribution method, and guardrails.
6. Separate operational, knowledge/context, evaluation/training, and telemetry/feedback uses. Identify source ownership, authority, time semantics, access, quality unknowns, preparation, output obligations, adoption, service ownership, and maximum tolerable effect.
7. Assess factors 1–6 and preliminary hard-gate blockers. Record one business-flow pattern or `none` without importing its objects, policies, or measures as observations.
8. Keep technical feasibility, operator acceptance, adoption, business value, economics, and production readiness separate. Give each gate an owner and stop condition.
9. Decide `discover`, `defer`, or `do_not_build`. State whether the current boundary is ready for value modeling, plus the evidence required to change the decision.

## Output contract

Return:

- a completed discovery summary, current field brief, and workflow-charter draft;
- the functional-requirement tuple and workflow boundary;
- baseline, target, verifier, guardrails, and adoption hypothesis;
- role map, representative case, consequential claim comparison or explicit no-conflict finding, preliminary factor gates, data-readiness assessment, blockers, risk ceiling, selected pattern or `none`, and next field move;
- one explicit decision with rationale.

Do not invent observations, measurements, approvals, or source access. Stop before solution design when the outcome, verifier, owner, accessible context, adoption path, or risk ceiling remains materially unresolved.
