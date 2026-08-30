# Capability Supply Chain

## Admission contract

Every tool, MCP server, skill, CLI, or code package entering an agent runtime MUST have a manifest that validates against the [`capability-manifest` schema](../schemas/capability-manifest.schema.json) and satisfy TOL-006 and SEC-007. Start from the [`capability-manifest` template](../templates/capability-manifest.json), then replace every illustrative value with evidence for the exact build being admitted.

SLSA defines how to verify artifact provenance against a trusted builder, signed envelope, subject digest, source, and build expectations ([R26-58](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-58)). The in-toto Attestation Framework defines authenticated, typed statements bound to immutable subjects ([R26-59](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-59)). Applying those mechanisms to tools, MCP servers, skills, prompts, and agent-runtime authority is the policy defined by this repository; neither specification is itself an agent-capability admission standard.

```text
source commit
  -> isolated, reproducible build
  -> dependency and license scan
  -> SBOM + build attestation
  -> artifact, instruction, and schema digests
  -> signature verification
  -> threat model + negative evaluation
  -> authority review
  -> registry admission
  -> segment-scoped enablement
```

## Registry decision

| Gate | MUST prove | Failure behavior |
| --- | --- | --- |
| Publisher | Verified publisher and reviewed source repository | Reject |
| Build | Pinned source commit, verified subject digest and build attestation, SBOM | Reject |
| Interface | Input/output schemas and instructions match their digests | Reject |
| Authority | Scopes, data classes, effects, egress, identity, tenant binding | Reject |
| Runtime | Sandbox, resource, network, and harness compatibility | Reject |
| Assurance | Threat model, negative cases, owner approvals | Reject |
| Lifecycle | Review due, disable procedure, rollback or retirement path | Reject |

The registry MUST fail closed when signature, publisher, policy, or provenance validation is unavailable. It MUST verify the attestation signature and subject digest against an independently managed root of trust and expected source/build policy; a manifest's self-declared `verified` fields are not evidence. Cached decisions MUST be short-lived and bound to the exact artifact digest.

## Runtime enforcement

- The gateway resolves `capability_id + version` to an immutable artifact digest.
- The runtime intersects manifest authority, agent authority, caller authority, tenant policy, and current segment policy.
- Instructions remain untrusted data unless admitted as a versioned instruction artifact.
- A capability cannot alter its manifest, registry decision, evaluator, CI, approval, or merge authority.
- Each invocation records capability ID/version/digest, actor, tenant, policy decision, data class, effect class, and result.

## Disable and recovery

1. Deny new invocations by capability digest.
2. Revoke brokered credentials and workload identities.
3. Stop or drain active work according to effect state.
4. Reconcile unknown or partial effects from source-of-truth receipts.
5. Locate every solution release referencing the digest.
6. Roll back, replace, or retire each affected release.
7. Add the failure to the capability suite before re-admission.

## Lifecycle review and retirement

Review use, accepted-outcome contribution, current owner, authority, credentials, dependency support, evaluation status, incidents, cost, and every referencing release by an owned due date. Inventory size, elapsed time, or inactivity may trigger this review; they are not universal retirement thresholds. A rarely invoked emergency capability can remain necessary, while a frequently invoked route can still require immediate disablement.

Retire or constrain a capability when its owner is missing, authority or credentials cannot be kept current, dependencies are unsupported, evaluation or safety falls below the target's approved threshold, value no longer justifies its risk and cost, or every dependent release has migrated. Inactive capabilities MUST NOT retain unowned active credentials or silently remain eligible for new releases. [R26-83](../research/2026-08-26--agentic-operating-maturity-field-report.md#r26-83)

## Negative release tests

- Spoofed publisher or unsigned artifact is rejected.
- Changed instructions, executable, or schemas invalidate admission.
- Registry or signature-validation outage fails closed.
- Capability requests a scope, data class, effect, destination, or actor mode outside its manifest.
- Retired or past-review capability cannot enter a new solution release.
- Disabled digest is denied even when name and semantic version are unchanged.
