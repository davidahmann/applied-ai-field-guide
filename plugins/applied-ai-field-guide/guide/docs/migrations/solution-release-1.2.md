# Solution Release 1.2 Migration

`solution-release` schema 1.2 changes the required `data_context` artifact from a duplicate agent-system document to a dedicated `data-context-manifest` 1.0 document.

## Migrate

1. Create a manifest from `templates/data-context-manifest.json` for the release workflow.
2. Record all four data planes, decision-critical sources and quality, preparation lineage, label authority, output records, economics, and operations.
3. Ensure every source declared by `agent-system.context.sources` has an exact matching source in the manifest for owner, source-of-truth status, revision, schema ID/version/digest, freshness, classification, and trust.
4. Point the release's singleton `data_context` artifact to the manifest and bind its exact file digest, version `1.0.0`, and schema version `1.0.0`.
5. Set the release schema version to `1.2.0`, bump the release version, recompute its canonical digest, and refresh approvals or lifecycle evidence where applicable.

The manifest does not replace the agent-system context projection. It is the broader workflow data contract; the agent projection remains the exact subset exposed to the runtime.
