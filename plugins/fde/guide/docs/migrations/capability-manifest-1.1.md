# Capability Manifest 1.1 Migration

Capability-manifest Schema `1.1.0` binds one exact tool contract and canonical authority decision to build and registry evidence.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Add `artifacts.tool_contract` with URI, tool ID, tool version, Schema version, and exact file digest.
3. Add `artifacts.executable_uri`; candidate manifests may use `null`, while approved manifests require a resolvable executable whose digest equals both the artifact and provenance subject.
4. Add the canonical `authority.digest` and bind it into the registry record.
5. Bind the attestation subject to both executable and tool-contract digests.
6. Bind registry decision, capability ID/version, executable digest, tool-contract digest, and authority digest; recompute `decision_digest`.
7. Make authority a truthful projection of the tool contract: caller mode, scopes, data classes, effect ceiling, credential mode, egress, destinations, and tenant binding.

## Gate

Repository validation proves structure, exact bytes, identity, and digest relationships. Production admission MUST independently authenticate publisher, signature, builder, registry decision, and trust policy and fail closed when that verifier is unavailable.
