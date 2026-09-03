# Evaluation Case 1.1 Migration

Evaluation Case 1.1 makes expected-result and reference-label authority explicit. The change is breaking because every governed evaluation case now requires `reference_authority`.

## Required changes

1. Set `schema_version` to `1.1.0`.
2. Add the reference basis: source of truth, deterministic policy, expert judgment, observed outcome, or synthetic invariant.
3. Bind the source ID, revision, owner, and data classification.
4. Record separate label-author and approver principals plus approval time.
5. Record the adjudication method, disagreement process, and next review date.
6. Add `EVA-007` to the case control set.
7. Recompute evaluation-suite, report, output, behavior-bundle, agent-system, and release digests when the case belongs to a bound model or agent release.

## Migration behavior

The label author and approver must be different principals. The approval cannot postdate the case's `last_reviewed` date, and `review_due` cannot precede it. Expert-judgment cases use an expert-review method; synthetic cases use synthetic-invariant review.

If the source, policy, expected outcome, or adjudication changes, create a new case revision, rerun the affected baseline and candidate, and invalidate release evidence that depended on the old expected result. Do not preserve an old answer as authoritative merely to maintain score comparability.

## Rollback

Pin the prior repository release and Evaluation Case Schema 1.0 while preparing the full case and release graph. Do not translate missing ownership, approval, or source revision into placeholder values.
