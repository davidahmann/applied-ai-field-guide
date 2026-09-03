# Production AI Security and Action Boundaries

Production AI security is primarily a software-boundary problem. Models and agents can propose work, but trusted services decide what may be read, called, changed, and accepted as complete.

This chapter routes the guide's security controls into one implementation sequence. The [control catalog](../controls/control-catalog.json), target-system policy, and applicable law remain authoritative.

## Start with the action path

Map each consequential path from actor to verified outcome:

```text
actor or workload
  -> authenticated session
  -> model-visible context
  -> proposed tool call
  -> policy decision point
  -> credential broker and egress gateway
  -> target service
  -> effect receipt
  -> source-of-truth readback
```

For every boundary, record the identity, tenant, permitted resource, data class, operation, destination, credential source, policy revision, failure behavior, and evidence produced. A prompt is not an authorization record. A tool call is not proof that an effect occurred.

## Keep authority below the model

The model runtime must not mint or widen authority. At each tool boundary, trusted software intersects:

- the authenticated caller or workload identity;
- tenant and account scope;
- the system's declared capability ceiling;
- the exact admitted capability build;
- current policy and deployment-segment policy;
- approval scope and freshness when approval is required.

Fail closed when identity, policy, capability provenance, or verification is unavailable. Delegation attenuates the parent's authority, budget, data scope, and lifetime; it never creates new authority. These requirements are captured in `IAM-001` through `IAM-003`, `TOL-003`, `TOL-006`, and the [handoff contract](../schemas/handoff-envelope.schema.json).

## Treat reads as consequential

Read-only does not mean low risk. A read tool can expose customer data, secrets, broad search results, internal URLs, or cross-tenant records without changing the source system.

Every read-capable tool should declare and enforce:

| Boundary | Required decision |
| --- | --- |
| Data | Classification, fields, source revision, retention, and redaction |
| Scope | Caller, tenant, account, project, resource, and row-level constraints |
| Volume | Result cardinality, response size, pagination, and time bounds |
| World | Closed approved sources or open-world network access |
| Evidence | Policy decision, source, freshness, and disclosed-resource references |

Authorize before disclosure, not after the result has entered model context. Exercise true cross-tenant, revoked-scope, oversized-result, stale-source, and policy-unavailable cases. `TOL-005` defines the minimum project control.

## Make tool contracts narrow and typed

A model-visible tool is an execution boundary. Prefer specialized tools for common operations and retain a sandboxed escape hatch only when the workflow requires it.

A production [tool contract](../schemas/tool-contract.schema.json) should bind:

- one explicit operation and effect class;
- a closed input and output schema;
- caller, tenant, account, and resource fields;
- required scopes and the policy decision point;
- data exposure and retention constraints;
- exact network destinations and credential mode;
- idempotency, approval, readback, and failure semantics;
- time, cost, response, and retry limits.

Validate actual requests, responses, and errors against the contract at runtime. A correct schema file does not prove that the gateway enforces it.

### Treat computer use as its own action boundary

When no adequate governed API exists, a browser or desktop workflow may be the smallest viable integration. It is not a generic escape hatch. Record why the API path is unavailable, bind one isolated session to the current actor or workload, tenant, target account, resource, operation, destination policy, and effect ceiling, and retain an API or adapter migration trigger.

Page content, DOM and accessibility state, OCR, screenshots, downloads, and confirmation messages remain untrusted data. Separate observe, prepare, stage, commit, and readback capabilities; deny arbitrary navigation, redirects, uploads, downloads, clipboard access, and credential exposure; classify and expire recordings; stop on interface drift; and verify consequential results through an independent target-system path. See the [computer-use action-boundary blueprint](../blueprints/computer-use-action-boundary.md). `CTX-002`, `TOL-003`, `SEC-001`, `SEC-006`, `REL-003`.

## Admit capabilities, not names

A trusted tool name can still resolve to changed or compromised code. Bind runtime admission to an exact [capability manifest](../schemas/capability-manifest.schema.json) containing the build digest, provenance, authority ceiling, compatibility, assurance decision, and lifecycle status.

The runtime must verify the manifest and compute effective authority as the intersection of the admitted manifest, tool contract, caller policy, tenant policy, handoff, and release. Candidate, disabled, retired, unverifiable, or digest-mismatched capabilities do not run. See the [capability supply-chain operating contract](../operations/capability-supply-chain.md) and `SEC-007`.

## Deny network access by default

An allowed hostname alone does not bound capability. Redirects, server-side fetches, package registries, public credentials, metadata services, and real external accounts can create paths beyond the intended destination.

Allowed egress should bind:

- destination and resolved address;
- protocol, method, path, or named operation;
- redirect and server-fetch policy;
- credential provenance, target account, actor, and tenant;
- request and response limits;
- logging, denial, and incident behavior.

Keep long-lived credentials out of model and sandbox context. Prefer short-lived, operation-bound credentials issued by a trusted broker. Isolate general-purpose execution by filesystem, process, network, time, and compute policy. `SEC-001` through `SEC-006` define the project controls.

## Separate proposal, authorization, effect, and proof

For a write path, preserve four distinct records:

1. **Proposal:** what the model or rule recommends.
2. **Authorization:** why the current actor may attempt the exact operation now.
3. **Effect receipt:** what the target service says it committed.
4. **Readback:** what the system of record now shows against the expected business postcondition.

Use a service-enforced idempotency key tied to the stable business operation, not mutable model output or a retry attempt. Recheck identity, authority, current source revision, policy, approval freshness, and duplicate state at the commit boundary. After a consequential effect, perform source-of-truth readback. A timeout after an effect is an `effect_unknown` state that requires reconciliation; it is not safe to retry blindly or declare failure. See `REL-001`, `REL-003`, `REL-005`, the [transactional-write blueprint](../blueprints/transactional-write-agent.md), and the [invoice reference implementation](../examples/invoice-exception/README.md).

## Test denials and degraded states

Positive examples establish only the happy path. Security evaluation should include:

- cross-tenant and cross-account requests;
- missing, revoked, or rotated caller scopes;
- stale, mismatched, expired, or future-dated approvals;
- prompt injection in retrieved and tool-returned content;
- destination, redirect, credential, and metadata-service escape attempts;
- unapproved, retired, altered, or unverifiable capability builds;
- duplicate delivery, timeout after effect, and stale readback replay;
- policy, identity, registry, broker, and verifier outages;
- telemetry payloads containing secret-like or disallowed raw values.

Map each material threat to an executable case, expected denial or recovery state, telemetry assertion, owner, and release gate. Keep evaluators, fixtures, merge authority, and production credentials outside the system being evaluated.

## Operate the boundary

Monitor policy denials, data exposure, tool errors, egress attempts, duplicate suppression, approval age, effect-unknown reconciliation, readback mismatch, and capability lifecycle changes. Provide independent kill switches for new work, writes, workload identities, egress, and capability bundles.

An incident is not closed until external state is reconciled, affected authority is contained, evidence is preserved, and the failure is represented by a replayable regression case. Use the [incident runbook](../operations/incident-runbook.md), [telemetry contract](../operations/telemetry-contract.md), and [release gates](../operations/release-gates.md).

## Production review checklist

- [ ] Every actor and workload has an unambiguous authenticated identity.
- [ ] Read and write scopes are enforced before data disclosure or effect creation.
- [ ] Tenant, account, resource, and deployment-segment bindings are explicit.
- [ ] Tools use closed contracts and actual runtime envelopes are validated.
- [ ] Browser or desktop fallback is justified, session-bound, drift-aware, and independently verified when used.
- [ ] Exact capability builds are verified, admitted, compatible, and revocable.
- [ ] Credentials are brokered and egress is operation-bound and denied by default.
- [ ] Approvals bind the exact proposal and remain current at the effect boundary.
- [ ] Side effects are duplicate-safe by stable business-operation identity.
- [ ] Consequential outcomes have service receipts and source-of-truth readback.
- [ ] Adversarial, outage, timeout, replay, and cross-tenant cases run before release.
- [ ] Telemetry excludes secrets and supports detection, containment, and recovery.
- [ ] Kill switches, rollback, ownership, and regression closure are exercised.

The objective is not to make model behavior inherently trustworthy. It is to build a system in which untrusted or mistaken behavior cannot silently exceed its authority, disclose uncontrolled data, or claim an outcome without independent evidence.
