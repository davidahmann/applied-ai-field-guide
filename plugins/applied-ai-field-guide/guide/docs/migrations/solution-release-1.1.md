# Solution Release 1.1 Migration

Solution-release Schema `1.1.0` adds behavior-bundle and capability-manifest artifacts to the compatible release unit.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Add every distinct behavior bundle referenced by the agent as a `behavior_bundle` artifact.
3. Add every capability manifest referenced by the agent as a `capability_manifest` artifact.
4. Keep the release artifact sets equal to the agent references; every capability must bind a tool contract already present in the release.
5. Approved and later lifecycle states require every bound capability manifest to have an approved, unexpired structural decision; external trust verification remains a deployment-gate responsibility.
6. Recompute all file digests and the canonical solution-release digest after the complete graph is frozen.

## Rollback

Pin a release using Solution-release Schema `1.0.0` until the complete dependency graph is migrated. Never approve a mixed graph in which tool contracts, capability manifests, or behavior bytes were versioned independently.
