# Evaluation Report 1.1 Migration

Evaluation Report 1.1 adds an optional `deployment_qualification` section for a release claim that depends on a specific human-AI oversight policy. It does not make deployment qualification mandatory for deterministic regressions or evaluations that do not claim a deployable human-AI operating point.

## Migrate from 1.0

1. Change `schema_version` to `1.1.0`.
2. If the report does not evaluate a human-AI oversight policy, omit `deployment_qualification` or record `status: not_applicable` with a concrete rationale.
3. If the release claim depends on oversight or routing, bind the exact policy, disjoint development and qualification evidence, sampling unit and dependence, execution mode, reliability target and lower confidence bound, autonomous coverage, review burden, reviewer effectiveness basis, total operating cost, risk constraints, assumptions, and requalification triggers.
4. Select the policy on development evidence, freeze it, and qualify it on held-out evidence. Use saved terminal trajectories only when the intervention cannot change the trajectory; otherwise rerun or simulate the policy in the loop.
5. Recompute the evaluator summary digest when no raw output URI is bound, then rerun schema and semantic validation.

## Compatibility and rollback

The new section is optional, so a 1.0 report can be migrated without inventing qualification evidence. Do not translate an autonomous benchmark score into `qualified`. Roll back by retaining the immutable 1.0 report and issuing a new report version; never rewrite an already approved report in place.
