# Evaluation Corpus and Review Loops

An agent evaluation set is a product and operational asset, not a folder of prompts. It should tell you which real workflow decision is being tested, what conditions make it difficult, how success is checked, and who will act on a failure.

This page applies the simulator-design patterns reviewed in [S21](05-source-index.md#s21) to production agents, alongside the trajectory and evaluator-integrity guidance in [Production, Evaluation, and Governance](04-production-evaluation-and-governance.md).

## Test decisions, not trivia

The best production cases are scenario-shaped. Each represents a decision or action inside a realistic world, rather than a bare question whose answer can be memorized.

| Include | Why it matters |
| --- | --- |
| Desired outcome and business consequence | Keeps evaluation tied to value, not eloquence |
| Inputs, evidence, and source revisions | Makes the case replayable and exposes stale-context failures |
| Constraints: authority, policy, cost, time, or uncertainty | Tests the choice the agent makes under real operating conditions |
| Expected trajectory and artifact/outcome | Separates valid reasoning and actions from a plausible final answer |
| A verifier or review rubric | Makes the acceptance rule inspectable |
| Plausible bad paths | Ensures the case can catch a consequential failure, not only confirm happy paths |

The expected result can be a range, a rubric, or an approval decision. It does not need to prescribe hidden reasoning. It does need to define observable evidence: a source-of-truth readback, a reconciliation, a safe refusal, a bounded escalation, or a reviewable artifact.

## Give every case a durable contract

Use structured records rather than anonymous prompt strings. Keep any sensitive fixture outside the record, in the controlled test environment it references.

```yaml
id: reimburse-duplicate-write-004
workflow: expense reimbursement
slice:
  stakes: financial-write
  condition: tool-timeout-and-retry
  authority: employee-approver
world:
  fixture_revision: reimbursement-snapshot-2026-08-07
  evidence_sources: [expense-policy-v18, approved-request-882]
expected:
  artifact: "one staged reimbursement request"
  required_trace: [validate-policy, create-with-idempotency-key, readback]
  forbidden_effects: [duplicate-payment, approval-bypass]
verifier: "payment-service idempotency record plus source-of-truth readback"
grader: deterministic
owner: payments-platform
reference_authority:
  basis: source_of_truth
  source_revision: payment-policy-v18
  label_author: payments-evaluation-author
  approved_by: payments-policy-owner
  adjudication_method: deterministic_reconciliation
  review_due: 2027-02-07
last_reviewed: 2026-08-07
```

At minimum, track: case ID, workflow, behavioral slice, fixture/source revision, risk level, expected artifact or effect, verification method, and reference authority. Reference authority includes the evidence basis, source owner and revision, classification, label author, independent approver and approval time, adjudication and disagreement process, and review due date. Version the fixture, tool schema, policy, prompt, model route, and grader separately so a changed score can be diagnosed rather than guessed at. `EVA-007`.

## Design the test distribution explicitly

A global pass rate hides the failures that matter. Build a slice matrix before filling the corpus, then make its coverage part of the release gate.

| Axis | Example slices |
| --- | --- |
| Workflow path | common path, known exception, novel exception, recovery |
| Stakes | read-only, reversible write, financial/legal/security effect |
| Evidence quality | complete, conflicting, stale, missing, adversarial |
| Authority | authorized, over-broad request, expired permission, delegated action |
| System behavior | tool timeout, retry, duplicate event, partial failure, cancellation |
| User collaboration | accept, reject, edit, escalate, pause/resume |

Oversample rare, high-consequence conditions. For each required slice, set the evaluator type and a separate acceptance threshold; an average cannot compensate for a prohibited action or a high-value error.

## Lint the evaluation corpus itself

Just as a codebase needs tests, the corpus needs automated quality checks. Fail CI when a case is malformed or a change alters protected coverage without an explicit decision.

- Unique case IDs and unique behavioral scenarios; detect near-duplicates as well as identical prompts.
- Required metadata, source/fixture revision, reference owner, independent approval, adjudication, and review date are present and current.
- The slice matrix still meets its declared coverage and risk quotas.
- Expected outcomes, trace assertions, and grade references resolve correctly.
- Cases do not leak a shortcut through answer labels, fixture names, tool descriptions, static test-only IDs, or predictable ordering.
- The agent cannot modify the fixtures, grader, pass signal, tests, or telemetry that declares success.
- A representative negative control actually fails the case; a test that never detects a known bad behavior is not a test.

Keep public and private cases separate when appropriate, but do not confuse secrecy with quality. The stronger defense is a versioned, independently controlled evaluator that checks trajectories and real effects.

## Turn review into a learning loop

There are two connected loops: the agent’s controlled improvement loop and the human operator’s review loop.

1. **Diagnose:** group failures by slice, owning layer, and business severity—not only by model or prompt.
2. **Explain:** show the proposed action, evidence, relevant policy or verifier, observed effect, and the rejected alternative.
3. **Target:** prioritize the smallest failure cluster with material impact; name its owner and intended correction.
4. **Retest:** evaluate against an independent holdout or replay world from the same slice, plus the original regression.
5. **Promote carefully:** run offline, shadow or canary, then expand only when the declared quality and safety thresholds still hold.

“The agent changed its answer on the failing example” is not evidence of improvement. A correction earns trust only when it preserves adjacent behavior and clears an independent retest.

## Design the review surface for informed intervention

For consequential work, an approval button alone is not human oversight. The reviewer needs a compact evidence packet:

- The requested outcome, risk level, and action about to occur
- The relevant sources and their freshness/provenance
- The proposed artifact or staged diff
- Checks that passed, checks that remain uncertain, and the postcondition to read back
- The policy and authority decision, including any denied alternatives
- Clear controls to approve, edit, reject, escalate, or pause

This mirrors the feedback structure of a strong practice system: show not only whether a decision is acceptable, but the constraint that governs it and why the nearby option fails. It helps reviewers calibrate their judgment and creates labeled evidence for the next regression case—without delegating final accountability to the model.

## Release gate

- [Evaluation-case Schema](../schemas/evaluation-case.schema.json)
- [Evaluation-case template](../templates/evaluation-case.json)
- [Production release gates](../operations/release-gates.md)
- [Repository validator](../scripts/validate-repository.mjs)

## References

- [S21](05-source-index.md#s21) — Internal exam-prep design review
- [Production, Evaluation, and Governance](04-production-evaluation-and-governance.md)
- [Production Implementation Playbook](07-production-implementation-playbook.md)
