# Agent Incident Runbook

## Severity

| Severity | Trigger | Immediate posture |
| --- | --- | --- |
| SEV-0 | Cross-tenant effect, credential exposure, uncontrolled privileged action | Pause all agent write paths; revoke affected workload identities and credentials; deny affected egress |
| SEV-1 | Unauthorized/duplicate effect, evaluator compromise, repeated readback mismatch | Disable affected capability and segment |
| SEV-2 | Material quality regression, stale decision source, cost runaway | Pause affected workflow; preserve read-only diagnostics |
| SEV-3 | Isolated recoverable failure within SLO | Standard queue and owner response |

## First 15 minutes

```text
1. Freeze new writes and pause affected queues.
2. Disable affected capability bundle at the tool gateway.
3. Revoke or downscope workload identities and short-lived credentials.
4. Deny affected egress destinations.
5. Preserve content-minimized forensic identifiers and artifact digests.
6. Read back affected systems of record.
7. Assign incident commander, service owner, operational owner, security owner, communications owner, and recorder.
```

## Kill-switch matrix

| Scope | Control | Verification |
| --- | --- | --- |
| All new runs | Ingress/workflow pause | Queue depth stops increasing |
| External writes | Tool-gateway deny rule | Synthetic commit is denied |
| One capability | Tool registry disable | Tool unavailable to agent |
| One tenant/segment | Policy deny rule | Scoped synthetic request denied |
| Identity | Identity-provider revoke/downscope | Token exchange denied |
| Egress | Proxy deny rule | Destination blocked and logged |
| Model/provider | Router disable | Traffic shifts or stops |

## Evidence manifest

| Required | Content |
| --- | --- |
| Run identity | Run/workflow/event IDs; tenant and principal hashes |
| Versions | System, model, prompt, tool, policy, ontology, schema, runtime |
| Decisions | Policy decision IDs, approval IDs, obligations, denials |
| Effects | Idempotency hashes, service receipts, proposal/effect digests |
| Sources | Source IDs, revisions, freshness, trust labels |
| State | Transition sequence, checkpoints, lease/fencing tokens |
| Economics | Model, tool, compute, retry, wait, reviewer cost |
| Evaluator | Fixture, grader, report versions and integrity status |
| Customer impact | Affected user segments, interrupted decisions, support cases, and required notices |

## Impact query

```text
affected_runs = runs(
  system_version in suspect_versions
  OR tool_version in suspect_versions
  OR policy_version in suspect_versions
  OR source_revision in suspect_revisions
  OR effect_id in suspect_effects
)

affected_objects = source_of_truth_readback(affected_runs.effect_receipts)
```

## Recovery sequence

1. Classify owning layer: workflow requirement, data/context, identity, tool, policy, state, loop, concurrency, evaluator, runtime, UX/adoption, or operations.
2. Compare effect receipts to current source-of-truth state.
3. Execute only preapproved compensation using a separate authorized path.
4. Add incident fixture and independent regression case.
5. Validate fix across adjacent slices and negative controls.
6. Restore read-only shadow mode.
7. Restore staged writes with full review.
8. Restore prior autonomy only after release gates pass.

Route the resulting change through [change management](change-management.md). Record whether the lesson is a customer configuration, reusable repository pattern, platform gap, model limitation, operating problem, or evidence that the use case should be constrained or retired.

## Closure gate

- [ ] Containment verified independently.
- [ ] Affected runs, tenants, objects, and effects enumerated.
- [ ] Source-of-truth state reconciled.
- [ ] Credentials, identities, and policies rotated or restored.
- [ ] Root cause assigned to an owning layer and version.
- [ ] Regression case fails on the defective version and passes on the candidate.
- [ ] Runbook, control, schema, or blueprint updated.
- [ ] Error budget and autonomy decision recorded.
- [ ] Customer impact, notifications, support actions, and adoption impact recorded.
- [ ] Service and operational owners accepted the recovery and follow-up plan.
- [ ] Re-enable approvals recorded with artifact digests.
