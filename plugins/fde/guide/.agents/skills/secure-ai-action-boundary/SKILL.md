---
name: secure-ai-action-boundary
description: Secure model-visible reads and real-world actions at trusted software boundaries. Use for tool or MCP contracts, identity and tenant scoping, capability provenance, credentials and egress, approval, idempotency, readback, action authorization, or negative security tests.
---

# Secure an AI Action Boundary

Treat prompts and model reasoning as untrusted proposals. Authorization, secrets, state, effects, and proof of completion belong in trusted services.

## Read first

1. Read the [tool-contract schema](../../../schemas/tool-contract.schema.json), [capability-manifest schema](../../../schemas/capability-manifest.schema.json), and [capability supply-chain guide](../../../operations/capability-supply-chain.md).
2. Use the [transactional-write blueprint](../../../blueprints/transactional-write-agent.md) for consequential effects and the [invoice example](../../../examples/invoice-exception/README.md) for executable behavior.
3. If the target is a browser, desktop client, terminal emulator, or other visual interface, read the [computer-use action-boundary blueprint](../../../blueprints/computer-use-action-boundary.md) and preserve its API-first admission, session, drift, evidence-retention, and independent-readback rules.
4. If the target design uses a solution artifact, resolve it through the [solution portfolio](../../../solutions/README.md) and read only the selected business-flow pattern and optional vertical profile. Treat their domain, action, and customer-specific decisions as threat inputs, not authorization policy.
5. Apply `TOL-001` through `TOL-006`, `IAM-001` through `IAM-003`, `SEC-001` through `SEC-007`, and `REL-001`, `REL-003`, and `REL-005` from the [control catalog](../../../controls/control-catalog.json).

## Workflow

1. Inventory every disclosure and effect, including deviations from the selected flow or profile. Classify data, operation, target resource, tenant, credential, destination, and maximum consequence.
2. Split read, stage, commit, administrative, and destructive operations into narrow typed contracts with owners and closed failure taxonomies.
3. Bind the current user or workload identity, tenant, target resource, scopes, policy revision, and approval when required. Recheck at the action boundary and fail closed.
4. Keep secrets behind a broker. Deny egress by default and bind allowed traffic to exact protocol, operation, destination, address, credential provenance, account, tenant, and limits.
5. Admit the exact capability build by publisher, digests, provenance, interface, authority, sandbox, assurance, owner, lifecycle, and disable path.
6. Key side effects to a stable business operation in the service. Recheck current state before commit and verify consequential results through source-of-truth readback.
7. Add positive and negative tests for missing identity, cross-tenant access, stale policy, revoked scope, duplicate retry, forged evidence, capability disablement, egress escape, and unknown effects.

## Output contract

Return a boundary and authority matrix, typed contracts, capability manifests, threat-to-control mapping, denial and recovery behavior, and executable regressions.

Do not treat read-only access as low risk, expose raw credentials to a model, authorize from model output, or accept natural-language success as effect evidence.
