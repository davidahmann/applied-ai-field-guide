# Durable Recovery Lab: One Effect, an Interrupted Process, and Readback

This 20-minute fictional lab asks a narrow operational question: after a process stops at the worst possible moment, how does the next process know whether it may retry, reconcile, or escalate?

It extends the [invoice exception reference](../README.md), but it is a separate local exercise. The reference runtime uses in-memory fixtures to make the controlled-write boundary readable. This lab persists a tiny local operation record so you can inspect a restart and an ambiguous external effect. Neither artifact is a deployment design or production evidence.

## Run it

You need Node.js 22 and a local clone. The lab uses only a disposable directory under the operating system's temporary folder. It makes no network calls, reads no credentials, and leaves no state behind after the demonstration.

```bash
npm ci --ignore-scripts
npm run test:durable-recovery
node examples/invoice-exception/durable-recovery/run-lab.mjs
```

The demonstration persists intent, simulates an interruption after an external effect and before the first process receives a receipt, starts a fresh process over the same local state, then reads back the effect. Expect one stored effect and a `reconciled_existing_effect` result. The process did not “know” the result from memory; it used the recorded operation identity and simulated system-of-record readback.

## The decision rule

```text
persist stable operation identity before effect
  -> effect outcome known? verify readback, then complete
  -> effect outcome ambiguous? read back before retry
  -> no effect and authority or policy changed? escalate
  -> readback unavailable? keep pending and escalate; never blindly retry
```

| Case | What the test proves in this fixture | Safe disposition |
| --- | --- | --- |
| Duplicate delivery after completion | The same stable operation ID returns the existing receipt | `existing_verified_effect` |
| Interruption after effect | A fresh process finds one existing effect through readback | `reconciled_existing_effect` |
| Interruption before effect, then policy drift | No new effect is attempted after the old authorization is no longer current | `approval_or_policy_changed_before_effect` |
| Readback unavailable | The pending record blocks a blind retry | `readback_unavailable_escalate` |
| Tenant or scope mismatch | No operation may produce an effect | `denied` |

The source is deliberately small:

- [durable-recovery.mjs](durable-recovery.mjs) persists operation intent, a simulated effect ledger, and a short audit record with temp-file-and-rename writes.
- [run-lab.mjs](run-lab.mjs) performs the restart scenario in a disposable directory.
- [durable-recovery.test.mjs](durable-recovery.test.mjs) owns the failure assertions; it is not called by the candidate world.

## What to carry into a real service

Keep the shape, not this storage code. A target service needs a stable business-operation identity; durable, transactionally appropriate workflow and business state; current service-side authorization; idempotency enforced by the effect system; concurrency and ordering behavior; source-of-truth readback; audit retention; cancellation; backpressure; migration; backup and restore; incident ownership; and tested recovery objectives.

This lab's JSON file has no lock, fsync, replication, corruption handling, retention policy, tenancy enforcement below the simulated request check, or competing-worker protection. An atomic rename does not prove a durable commit or exactly-once processing. The simulated effect ledger is not an external system of record. Do not copy this code into a production service.

Use [Enterprise Integration and Scale Reality](../../../library/17-enterprise-integration-and-scale-reality.md) to map those missing seams, [Evaluation Corpus and Review Loops](../../../library/09-evaluation-corpus-and-review-loops.md) to build target cases, and [production release gates](../../../operations/release-gates.md) before asserting recovery readiness.
