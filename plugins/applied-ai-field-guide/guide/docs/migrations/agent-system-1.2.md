# Agent System 1.2 Migration

Agent-system Schema `1.2.0` replaces self-asserted behavior hashes and ungoverned tool references with resolvable behavior-bundle and capability-manifest bindings.

## Required changes

1. Set `schema_version` to `1.2.0`.
2. For every behavior component, add `component_id`, repository-relative `uri`, `schema_version`, semantic `version`, and the SHA-256 digest of the exact behavior-bundle file.
3. Put the model route, prompt bundle, harness, context policy, complete tool membership, and guardrail policy in a governed `behavior-bundle.json`.
4. Add a `capability` object to every tool reference with the exact manifest URI, capability ID, version, manifest-file digest, and canonical authority digest.
5. Ensure the behavior bundle's tool members equal the agent's tool-contract and capability-manifest bindings.
6. Include the behavior bundle and capability manifests in evaluation dependencies and solution-release artifacts.

## Gate

Repository validation resolves every referenced file, checks exact bytes and declared identity, derives tool-bundle membership, and rejects disabled, retired, missing, placeholder, or drifted dependencies. Production admission still verifies signatures and registry authority against an external trust root.

## Rollback

Pin a repository release whose Agent-system Schema is `1.1.0` while preparing all new immutable artifacts together. Do not translate a missing behavior or capability artifact into a placeholder digest.
