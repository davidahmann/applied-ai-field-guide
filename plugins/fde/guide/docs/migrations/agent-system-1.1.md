# Agent System 1.1 Migration

Agent-system Schema `1.1.0` makes actor mode, authority scope, credential lifetime, caller binding, behavioral versions, and source contracts explicit. Agent records valid only against Schema `1.0.0` fail current repository validation until migrated.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Replace `controls.agent_identity` with top-level `actor_identity`:
   - Select `interactive_delegated`, `unattended_workload`, or `mixed`.
   - Declare the agent principal, credential TTL, authority scope, and audit attribution.
   - Interactive or mixed execution requires a typed caller binding and `user_and_agent` attribution.
   - Unattended execution requires a null caller binding and `agent_only` attribution.
3. Add `behavior` versions and SHA-256 digests for the model route, prompt bundle, harness, context policy, tool bundle, and guardrail policy.
4. Add `revision` and a versioned, digested `schema_contract` to every context source.
5. Set `controls.propagate_caller_authorization` to `true` for interactive or mixed execution and for `execute_reversible`, `execute_bounded`, or `coordinate` autonomy.
6. Reconcile outcome metric, baseline, target, guardrails, segment, owners, and economics with the referenced workflow charter. The charter remains the business-outcome source of truth.

## Migration gate

Run:

```bash
npm run test:contracts
npm run validate
```

Behavioral digests must identify real immutable inputs in a production record. The canonical template values are structural examples and do not prove that a component was built, evaluated, or released.

## Rollback

Release tags before this migration retain Schema `1.0.0`. Pin the prior repository release while updating the record and runtime identity/context contracts together; do not restore an unstructured identity string as the production authority source.
