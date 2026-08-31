# Data Quality and Drift Operating Contract

Operate the data dependencies of a workflow as a product with owners, objectives, incidents, changes, and retirement—not as a one-time cleanup.

## Service objectives

Define objectives by decision-critical source and eligible segment:

- schema and permission compatibility;
- freshness and correction latency;
- completeness, validity, uniqueness, and cross-source consistency;
- population and segment coverage;
- representativeness or label agreement where applicable;
- preparation, lineage, index, and feature-pipeline success;
- output-record reconciliation and correction; and
- cost per accepted outcome, including data acquisition and remediation.

Avoid a single “data quality score.” Each threshold needs a decision use, evidence, window, owner, and failure response.

## Detection and response

| Signal | Immediate response | Owner decision |
| --- | --- | --- |
| Source or schema revision changed | Invalidate affected admission and run compatibility tests | Admit, constrain, migrate, or rollback |
| Permission or tenant policy changed | Deny before return; revoke caches and derived access | Restore narrow access or pause route |
| Freshness or correction window breached | Stop, refresh, or mark outcome unknown | Resume, replay, or rebaseline |
| Critical quality threshold failed | Constrain affected segment and open remediation | Repair, add human review, choose smaller mechanism, or stop |
| Coverage or representativeness shifted | Hold expansion and segment the evaluation | Resample, relabel, constrain, or retire |
| Label disagreement increased | Stop treating the label as accepted authority | Adjudicate and version the case set |
| Preparation or lineage failed | Reject the derived output | Rerun exact version, rollback, or repair provenance |
| Output cannot reconcile to source outcome | Mark the effect or outcome unknown | Investigate, correct, replay, or compensate |

## Change contract

Treat a change to source semantics, keys, joins, corrections, schema, access, preparation code, parser, OCR, index, embedding, feature, label definition, population, or outcome linkage as a system change. Update the data-context manifest, impact assessment, evaluation evidence, release record, rollback plan, and service review at the scope implied by the change.

## Rebaseline and retirement

Rebaseline only when the population, process, source semantics, or accepted-outcome definition changes materially and the owner approves the new comparison. Preserve the prior baseline and explain the discontinuity. Retire unused sources, derived views, indexes, labels, outputs, permissions, and monitors with verified deletion or deactivation evidence.

Controls: `CTX-006`, `CTX-007`, `CTX-008`, `CTX-009`, `OPS-001`, `OPS-002`, `OPS-005`, `REL-002`, `REL-004`.
