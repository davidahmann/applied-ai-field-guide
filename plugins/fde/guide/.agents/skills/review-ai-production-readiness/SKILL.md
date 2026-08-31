---
name: review-ai-production-readiness
description: Review a specific AI-system release for production readiness. Use for architecture review, launch gate, customer security review, audit evidence, autonomy expansion, canary approval, rollback decision, or a prioritized gap assessment against this guide's controls.
---

# Review AI Production Readiness

Review one declared release and its claimed authority or autonomy. A green test suite is evidence for exercised behavior, not certification of production readiness.

## Read first

1. Read the [control catalog](../../../controls/control-catalog.json), [release gates](../../../operations/release-gates.md), and [production service readiness template](../../../templates/production-service-readiness.md). When model or agent behavior is selected, also read the [solution-release contract](../../../schemas/solution-release.schema.json).
2. Resolve guide artifacts through [catalog.json](../../../catalog.json). Resolve model/agent candidate artifacts through the solution-release manifest; for a deterministic, optimization, or classical-ML-only system, use its target-software release record and equivalent architecture, test, provenance, deployment, rollback, and operating evidence without placeholder agent artifacts.
3. Use the target workflow charter, value case, data-context manifest, system design, tools, threat model, adoption plan, operations evidence, and rollback plan. Require a behavior bundle, capability manifest, and evaluation report only when they apply; otherwise require the target software equivalents.
4. If the release claims a solution artifact, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected business-flow pattern and optional vertical profile. Verify customer-specific gaps and non-claims; a design accelerator is not release evidence.

## Workflow

1. State the exact release, workflow segment, actor mode, authority ceiling, environment, and decision being reviewed.
2. Check value and ownership, architecture and state, solution-profile deviations, data planes and decision fit, preparation and labels, output ownership, context, identity and authorization, tool and capability boundaries, security, reliability, evaluation, human review, adoption, operations, cost, change, and retirement.
3. For each readiness dimension and applicable control, use the template's bounded status vocabulary, evidence, owner, and expiry or review date. Treat `unresolved` as a gap and never infer `tested` or `operational` evidence from intent, architecture prose, or model output alone.
4. Separate release blockers from time-bounded remediation, improvement, and accepted residual risk. Name the approving principal for every accepted risk.
5. For a model/agent release, decide `hold`, `reject`, or approve the declared `shadow`, `canary`, `bounded_segment`, or `full_segment` rollout strategy, then state any permitted manifest status change. Otherwise decide against the target software's declared rollout and lifecycle vocabulary. Bind either decision to exact artifact versions and digests.
6. Define rollout scope, stop triggers, rollback evidence, support ownership, and the evidence required for the next authority, autonomy, or segment expansion.

## Output contract

Return an answer-first review decision, applicable release-record type, declared rollout strategy, lifecycle implication, scope, control matrix, critical evidence gaps, owners and deadlines, residual risks, rollout limits, rollback triggers, and re-review conditions.

Do not call this guide an external standard or certification. Do not approve an undefined release, unevaluated artifact drift, missing service owner, or consequential effect without independent readback evidence.
