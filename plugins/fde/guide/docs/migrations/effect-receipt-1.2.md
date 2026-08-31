# Effect receipt 1.2 migration

Version 1.2 binds source-of-truth verification to one fresh readback request so that a signed response from an earlier run cannot prove completion for a later retry.

## Required changes

1. Set `schema_version` to `1.2.0` for emitted effect receipts.
2. Add `readback.run_id`, `readback.readback_request_id`, and `readback.requested_at`.
3. Include the same three values in the canonical signed readback-attestation subject.
4. Reject an attestation whose request ID does not match the active readback, whose verification time predates the request or committed effect, or whose verification time is in the future of the trusted verifier clock.

## Compatibility

Version 1.2 is breaking for receipt consumers. During a bounded migration, retain the complete version 1.1 receipt separately; do not synthesize the missing request binding for historical evidence.
