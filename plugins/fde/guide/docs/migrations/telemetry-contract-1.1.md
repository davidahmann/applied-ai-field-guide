# Telemetry contracts 1.1 migration

Trace-event consumers should continue to the [Trace Event 1.2 migration](trace-event-1.2.md) after completing this release-binding step. Effect-receipt consumers should then follow the [Effect receipt 1.2 migration](effect-receipt-1.2.md).

## Scope

`trace-event.schema.json` and `effect-receipt.schema.json` now reject arbitrary payload capture and bind runtime evidence to an exact release, actor mode, component set, tenant/account scope, policy revision, and source-of-truth readback.

## Required changes

1. Set `schema_version` to `1.1.0` on new trace events and effect receipts.
2. Emit trace/span identity, event time, release digest, component versions, actor mode, and retention class.
3. Map state details to the closed `details` vocabulary. Store only identifiers, hashes, revision labels, and error codes; never raw prompts, credentials, unrestricted retrieved content, or customer records.
4. Replace the effect receipt string with a service-issued receipt object containing its issuer, digest, and signature.
5. Add tenant/account and actor hashes, policy and source revisions, structured readback evidence, and compensation state.
6. Update exporters and consumers before enabling the 1.1 producer. Reject unknown fields at ingestion.

## Compatibility

Version 1.1 is intentionally breaking. Consumers MUST support both versions during a bounded migration window or deploy a versioned translation layer. A translation MUST NOT invent a signature, readback, component version, or identity binding that the original event did not contain.
