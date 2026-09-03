# FDE Interaction Workflow Ergonomics

**Review date:** 2026-08-30

**Scope:** post-interaction evidence capture, engagement isolation, situation-first task entry, reviewed append semantics, and derived readouts

**Decision:** admit one directly inspectable open-source implementation as product-workflow evidence; adapt its strongest interaction patterns through the Guide's existing field, evidence, and authority contracts without adopting its thirty-method taxonomy, client-local storage convention, trust scores, or product surface

<a id="r26-84"></a>
## R26-84 — FDEOps repository and operating documentation

- **Date:** Repository and documentation reviewed 2026-08-30
- **Type / tier:** Directly inspectable open-source implementation and documentation; B for implemented interaction behavior, C for unverified outcome claims
- **Source:** [suboss87/FDEOps](https://github.com/suboss87/FDEOps), including the [usage guide](https://github.com/suboss87/FDEOps/blob/Main/docs/USAGE.md), [skill reference](https://github.com/suboss87/FDEOps/blob/Main/docs/skills-reference.md), [schema](https://github.com/suboss87/FDEOps/blob/Main/docs/schema.md), and [routing-evaluation fixtures](https://github.com/suboss87/FDEOps/tree/Main/evals)
- **License:** MIT at review time; no source code or method text is copied into the Guide

FDEOps implements a local operating workspace for forward-deployed work. Its documentation shows a useful sequence after meetings and artifact intake: retain raw input separately, propose structured changes, require user confirmation before apply, preserve dated records, and expose status or receipts from those records. It also binds one workspace to one engagement and gives users situation-shaped phrases rather than requiring internal method names.

## Portable findings

1. **Close the loop after every consequential interaction.** Stage the source record, propose cited changes, preview them, obtain named review, and append a dated receipt. Preserve corrections, rejections, and deferred items rather than silently rewriting earlier state.
2. **Keep source and conclusion separate.** Raw or minimally transformed evidence stays distinguishable from derived claims, decisions, risks, commitments, and next moves. A capture receipt proves the review event, not the truth or authority of every conclusion.
3. **Bind work to one engagement context.** Customer, tenant, workflow, environment, evidence store, classification, retention, and record identity should be explicit. Ambiguity stops capture or retrieval instead of causing cross-engagement context blending.
4. **Enter through the situation.** A user should be able to say that the brief is wrong, a stakeholder conflict appeared, or a release needs review. Task-interface descriptions should distinguish the intended route without requiring the user to learn a method catalog.
5. **Derive status from governed records.** A sponsor view or receipt is useful when it freezes an evidence cutoff and points back to current records. It becomes dangerous when maintained as an independent narrative or treated as approval.
6. **Evaluate routing claims honestly.** Representative and confusing prompts can test task-interface boundaries, but documentation lint cannot prove how every host or model will route. Retain host, model, skill revisions, cases, errors, and adjudication when running a real routing evaluation.

## Claim limits

- Repository structure and documented behavior are inspectable; customer value, operating adoption, decision quality, and commercial outcomes are not independently established.
- One local client folder is an implementation choice, not a portable data-governance rule. Target storage, access, deletion, residency, backup, and audit requirements remain customer-specific.
- Thirty methods, six stages, one broad router, trust traffic lights, fixed staleness windows, and a CLI/dashboard surface would duplicate or distort the Guide's current method if adopted wholesale.
- A receipt, status page, or trust score cannot authorize a decision, prove source truth, establish customer acceptance, or replace production release evidence.
- Natural-language examples improve discoverability but do not establish correct host routing without a model- and version-bound evaluation.

## Repository impact

| Artifact | Bounded change |
| --- | --- |
| [Field engagement and reframing](../playbooks/00-field-engagement-and-reframing.md) | Add one-engagement context isolation and a reviewed post-interaction append loop |
| [Field observation log](../templates/field-observation-log.md) and [discovery pack](../templates/discovery-pack.md) | Record the interaction boundary and capture receipt without creating a new artifact system |
| [Production service review](../templates/production-service-review.md) | Add a receipt-derived current sponsor view with an evidence cutoff |
| [Reframe skill](../.agents/skills/reframe-ai-engagement/SKILL.md) and public task routes | Use situation-first cues and preserve the same canonical method |
| [Worked invoice engagement](../examples/invoice-exception/engagement/README.md) | Provide a ten-minute path through the existing complete case |

Disposition: `configure`. Adapt the interaction ergonomics while keeping the Guide's existing controls, schemas, chronology, and authority model. Do not build another FDE workspace, router, CLI, storage convention, lifecycle, or trust-score system. Revisit by 2027-02-28 or sooner after a material repository redesign, security issue, or independently inspectable usage evidence.
