# Trace Event 1.2 Migration

Trace-event Schema `1.2.0` replaces invoice-specific state details with a workflow-neutral, hash-first vocabulary.

## Required changes

1. Set `schema_version` to `1.2.0` on new state-transition events.
2. Replace raw source revision labels with `source_revisions[]` entries containing a stable `source_id` and `revision_digest`.
3. Replace policy and approval fields with `decision_references[]` entries containing a `decision_type` and UUID.
4. Replace proposal or other workflow artifact fields with `artifact_references[]`; hash the artifact identifier separately from its content.
5. Replace effect and receipt fields with one `effect_reference` containing the effect UUID and signed receipt digest.
6. Put a closed failure code and optional validation codes under `error`.
7. Remove raw domain identifiers, payloads, prompts, credentials, retrieved text, and customer records from trace details.

## Extension rule

The shared `details` object remains closed. A workflow that needs another evidence shape must define a versioned closed event schema or a separately versioned event type with its own retention and redaction policy. Do not add free-form maps or arbitrary string values to the shared contract.

## Compatibility

Version 1.2 is breaking. Consumers must support both 1.1 and 1.2 during a bounded migration window or translate 1.1 details into the 1.2 hashed references. A translator must not invent missing digests or decision identities.
