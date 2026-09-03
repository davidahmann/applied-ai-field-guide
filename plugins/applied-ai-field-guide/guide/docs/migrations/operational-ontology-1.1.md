# Operational ontology 1.1 migration

## Scope

Version 1.1 makes the domain model operational: every entity declares stewardship and layer, every modeled state change has a guarded transition, every action names its decision contract and permitted transitions, and every outcome can be reconciled to a source of truth.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Add `layer` and `stewardship` to every entity.
3. Add `lifecycle_transitions`; use `absent` only for creation transitions.
4. Add `permitted_transitions`, `decision_contract`, and `feedback` to every action.
5. Add owner, source-of-truth status, revision contract, and schema contract to every evidence type.
6. Run repository validation. It rejects unknown transition, state, entity, policy, and evidence references.

## Compatibility

Version 1.1 is breaking because the new governance and transition fields are required. Consumers must continue reading 1.0 during a bounded migration window or translate 1.0 records into a separately reviewed 1.1 artifact.
