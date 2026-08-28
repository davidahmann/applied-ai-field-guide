# Independent Behavior Monitoring

Use an independent monitor for high-impact autonomous workflows when observable intent and action data can identify dangerous divergence quickly enough to contain it. Monitoring supplements authorization and cannot grant authority.

Control: `OPS-006`.

## Inputs

Prefer privacy-minimized structured data:

- User-approved objective and workflow/segment ID
- Actor, tenant, resource, and capability identifiers or protected hashes
- Tool name, typed parameters, effect class, and target
- Policy decision, obligations, approval, and current revisions
- State transition, budget, and stop reason
- External effect receipt and readback status

Do not require hidden model reasoning. Do not feed the monitor unrestricted retrieved content or the agent's self-justification as trusted evidence.

## Decisions

| Monitor result | Runtime behavior |
| --- | --- |
| Within declared intent and policy | Continue; authorization still decides the action |
| Ambiguous or incomplete | Pause affected action and request human review |
| Material intent/action mismatch | Deny or contain through deterministic control |
| Exfiltration, evaluator manipulation, destructive or cross-tenant attempt | Trigger configured kill switch and incident route |
| Monitor unavailable | Apply declared degraded mode; never auto-authorize because monitoring failed |

## Calibration

Measure false-positive and false-negative rates by risk slice, alert latency, containment latency, reviewer agreement, alert volume, and operator burden. Include known-safe, known-unsafe, near-boundary, obfuscated, high-volume, and monitor-injection cases.

No universal model or threshold is assumed. A monitor that operators routinely ignore is not an effective control.

## Isolation

- Separate monitor prompt/model/configuration from the monitored agent.
- Deny the agent write access to monitor policy, fixtures, thresholds, and alert routes.
- Keep the monitor outside the tool/result channel it evaluates when feasible.
- Version monitor changes and evaluate them independently.
- Route containment through trusted policy, gateway, workflow, identity, or egress controls.
- Retain only the evidence needed for calibration, incident response, and audit.

## Operating-efficiency signals

Efficiency monitoring is diagnostic, not an authorization or quality signal. When model-mediated work is material, retain privacy-minimized counters for repeated searches, unnecessary turns, requests per turn, input and output volume, oversized tool results, model-visible polling, loaded-but-unused tool schemas, cache misses, route selection, retries, and budget exhaustion. Reconcile these signals with accepted outcomes, safety, reliability, latency, reviewer load, and full service cost before changing the route.

Keep **cost per accepted outcome** as the decision measure. Use the factor chain below only to locate a spend change, not to redefine value:

```text
users × sessions/user × turns/session × requests/turn × tokens/request × price/token
```

Progressive tool loading and trusted code-mediated batching MAY reduce zero-value model turns. The code path remains bounded by tool contracts, current authorization, egress, result limits, cancellation, audit, and source-of-truth verification. A cheaper session that increases errors, review, recovery, or rejected outcomes is not an improvement. [R26-77](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-77)

## Scored observations

When an automated or human scorer reviews production runs, bind every grade to the eligible population, sample and exclusions, source run and release graph, scorer claim, rubric, version and digest, label or reference authority, uncertainty, cost, and review date. Include relevant human comments, corrections, overrides, and task outcomes only when their collection and reuse are purpose-bound, classified, minimized, and permitted. A human interaction is evidence about the workflow; it is not anonymous ground truth.

Scorers inform diagnosis and evaluation. They MUST NOT grant action authority, prove source-of-truth completion, or directly update prompts, skills, policies, thresholds, graders, or deployed behavior. Monitor scorer disagreement, calibration, false-positive and false-negative behavior, coverage, drift, latency, cost, and reviewer burden. Fail or abstain according to the declared evaluation contract when the scorer, required evidence, or sampling process is unavailable or invalid. [R26-81](../research/2026-08-28--warp-self-improving-software-factories.md#r26-81)

## Trace-derived improvement

Recurring trace papercuts MAY produce a sanitized failure record, replay case, and candidate prompt, skill, route, tool, or context change. Production traces MUST NOT directly rewrite prompts, skills, labels, graders, policies, thresholds, or deployed code. Apply purpose and confidentiality review, contamination controls, independent evaluation, change approval, canary, rollback, and the normal release authority before adoption. `FDE-004`, `EVA-004`, `EVA-006`, `OPS-007`.

## Release cases

- Benign action at the policy boundary
- Agent rationale attempting to influence the monitor
- Untrusted tool output instructing the monitor to allow an effect
- Allowed-domain exfiltration with an attacker credential
- Destructive or cross-tenant action hidden in a normal tool call
- False success followed by missing source-of-truth effect
- Monitor timeout, outage, and delayed result
- High alert volume producing approval or alert fatigue
- Repeated-search or polling loop that exhausts budget without improving evidence
- Oversized or unused tool context that raises cost while the accepted outcome is unchanged
- Trace-derived skill candidate attempting to alter its evaluator, approval, or release gate
- Scorer sampling that omits a consequential failure slice or treats reviewer comments as anonymous ground truth

Evidence: [OpenAI monitoring](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-04), [Anthropic approval and monitoring](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-50), [capability-aware containment](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-49), [Uber production AI operations](../research/2026-08-28--uber-production-ai-operating-lessons.md#r26-77), and [Warp configuration improvement](../research/2026-08-28--warp-self-improving-software-factories.md#r26-81).
