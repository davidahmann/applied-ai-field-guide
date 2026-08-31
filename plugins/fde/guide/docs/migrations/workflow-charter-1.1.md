# Workflow Charter 1.1 Migration

Workflow-charter Schema `1.1.0` makes the operational requirement, receiving service ownership, risk readiness, stop conditions, and approval evidence explicit. Charters valid only against Schema `1.0.0` fail current repository validation until migrated.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Add `owners.receiving_service_owner`.
3. Add `functional_requirement` with `user`, `interface`, `decision`, non-empty `inputs`, `action`, and `accepted_outcome`.
4. Add `readiness.risk` with a score and supporting evidence.
5. Add non-empty `stop_conditions` that terminate, constrain, or redesign the pilot when falsified.
6. Replace string approvers with records containing `role`, `principal`, and `approved_at`.
7. For a pilot status or decision, include separate operational and risk approvers.
8. For a production status or promotion decision:
   - Use a measured primary-metric baseline with a numeric value and `as_of` date.
   - Set workflow, context, verifier, integration, adoption, operations, and risk readiness to at least `3` with evidence.
   - Include technical, operational, and risk approvals from distinct principals.

The JSON Schema enforces distinct approval roles and unique records. Repository semantic validation must additionally reject one principal occupying multiple required approval roles.

## Migration gate

Run:

```bash
npm run test:contracts
npm run validate
```

Do not promote an unmeasured or illustrative baseline by changing its label. Collect target-environment evidence, preserve its source and denominator, and obtain new approvals against the revised charter.

## Rollback

Release tags before this migration retain Schema `1.0.0`. Pin the prior repository release while migrating existing charters; do not weaken Schema `1.1.0` to accept incomplete approval or readiness evidence.
