# Worked Intelligence Selection

The engagement does not select “an agent” for the workflow. It assigns the smallest sufficient mechanism to each consequential step.

| Decision step | Selected mechanism | Why | Fallback and verifier |
| --- | --- | --- | --- |
| Check tenant, identity, revision, and required fields | Deterministic software | Closed invariants with exact failure states | Deny and return to the existing queue; contract tests verify behavior |
| Retrieve the active policy and cited invoice evidence | Governed retrieval | The reviewer needs current, attributable sources | Mark evidence insufficient; source revisions and permissions are verified |
| Suggest a resolution and assemble an evidence packet | One typed model-assisted proposal, only if target evaluation justifies it | Language interpretation may help on variable exception evidence | No proposal or manual review; reviewer checks cited evidence |
| Validate proposal shape and policy constraints | Deterministic software | A model must not define its own allowed action | Reject invalid proposal; schema and invariant tests verify behavior |
| Approve the correction | Human review | Policy assigns accountability to a designated reviewer | Existing manual queue; approval is bound to identity, policy, expiry, and proposal digest |
| Commit and deduplicate the approved correction | Deterministic transaction service | Exact authority, idempotency, and readback are software responsibilities | Stop, reconcile, or compensate; ledger readback verifies completion |
| Decide whether the service continues or expands | Human service review over measured evidence | Value, adoption, risk, and ownership are organizational decisions | Continue shadow, constrain, pause, or stop |

## Why not a multi-agent system

The workflow has no demonstrated permission, context, ownership, specialization, or latency boundary that requires multiple agents. A coded workflow is easier to inspect and recover. The current teaching runtime therefore uses a deterministic proposal fixture so the action boundary can be tested without presenting model capability as proven.

Before admitting a model-assisted proposal, a target team must evaluate representative normal, exception, missing-evidence, conflicting-evidence, adversarial, and recovery cases. The model route remains replaceable; approval, authorization, commit, and readback remain below it.
