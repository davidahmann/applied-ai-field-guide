# Handoff Envelope 1.1 Migration

Version 1.1.0 makes consume-time parent authority, lineage, replay, and aggregate budget enforcement explicit.

## Breaking changes

- Set `schema_version` to `1.1.0`.
- Add top-level `parent_handoff_id`. Root delegations set both parent handoff fields to `null`; nested delegations bind the exact parent handoff ID and canonical envelope digest.
- Add `authority.parent_authority_id` as the lookup key for the authoritative parent grant or consumed parent handoff.
- Add `authority.parent_state_revision` and include it in `parent_authority_digest`.
- Add immutable `principal` identity to both `producer` and `recipient` participants.
- Recompute `parent_authority_digest`, `envelope_digest`, and the attestation subject after migration.

## Consumer changes

Before making context or capabilities available, the consumer must:

1. Resolve the authoritative current parent state by authority ID and expected lineage; nested state must name a consumed parent handoff. Fail if the resolver or record is unavailable.
2. Match the parent state revision, authority digest, active status, producer participant, and—for nested delegation—the exact parent handoff ID and digest.
3. Resolve and authenticate the active current recipient, then exactly match principal, system, role, run, and actor mode to the envelope.
4. Verify the envelope attestation with a trusted verifier.
5. In one durable atomic compare-and-swap transaction, recheck parent and recipient revisions, claim both `handoff_id` and nonce, and reserve the child budget against aggregate sibling reservations.
6. Admit work only from a newly committed claim. `already_claimed`, replay conflict, budget exhaustion, stale state, malformed claim receipts, and unknown outcomes do not admit execution.

The claim ledger must survive process restarts and concurrent consumers. It must bind the parent authority and revision; recipient principal, revision, system, role, run, and actor mode; envelope digest; both replay keys; and requested-budget digest. A repeated identical request returns `already_claimed`; it does not return a second successful admission. A failed transaction has no partial replay or budget state. An unknown transaction outcome stays blocked until the durable claim is reconciled.

Historical 1.0.0 envelopes must not be accepted by a 1.1.0 consumer without an explicit migration and a new attestation. Adding placeholder lineage or authority fields does not establish trust.
