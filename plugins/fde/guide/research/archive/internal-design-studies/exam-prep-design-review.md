# Exam-Prep Design Review

**Reviewed:** 2026-08-07

**Material:** internal scenario-based agent-architecture exam simulator; source files are not included

**Status:** internal design reference; not an external source of truth

## What was reviewed

The application is a scenario-based agent-architecture exam simulator. Its question bank is structured across architecture, prompting and context, integration, evaluation, governance, lifecycle, and developer enablement. The implementation also includes a question-bank audit, immediate practice feedback, domain-level diagnosis, a missed-question review queue, and separate retest forms.

No question text, answer key, or source training material is copied into this repository. This note preserves only the transferable system-design patterns.

## Transferable patterns

1. **Evaluate decisions under constraints, not recall in isolation.** The useful unit is a realistic situation with a desired outcome, constraints, plausible alternatives, and an explicit reason one choice is safer or more effective.
2. **Treat the evaluation corpus as production code.** Each case needs a stable ID, slice or domain, risk, expected outcome, grading method, provenance, and review date. Automated checks should reject missing metadata, duplicate cases, broken answer references, or a distribution that silently loses a critical slice.
3. **Design against evaluator shortcuts.** The simulator checks that correct answers are not systematically revealed by response position, wording length, or repetition. In agent evaluation, apply the same principle to fixture leakage, static identifiers, test-only affordances, and agent access to the evaluator.
4. **Close the learning loop deliberately.** A diagnostic establishes a baseline; targeted review explains the governing principle and rejected alternative; an independent retest checks whether behavior improved. Do not treat an unreviewed correction to a single case as durable learning.
5. **Give reviewers counterfactual feedback.** “Pass/fail” is weak. Review is more useful when it shows the evidence, the relevant constraint, why the proposed action was accepted or rejected, and what action would have been safe.

## Limits

The implementation is an educational product, so its interaction and scoring mechanics are not automatically appropriate for a production agent. Production systems still need live-source provenance, authorization, privacy controls, trajectory evaluation, postcondition readback, and incident ownership. This material complements rather than replaces the primary evidence in the source ledger.
