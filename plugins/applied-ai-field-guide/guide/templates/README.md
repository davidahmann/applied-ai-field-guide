# Working Templates

Copy the smallest set needed for one workflow, replace the example values with evidence from the target environment, and keep the artifacts together under version control. A valid template is a structural starting point, not production evidence.

## Validate as the decision matures

The repository uses one canonical schema per governed artifact. The `starter` profile checks only the decision-bearing fields needed now while retaining the canonical schema's types and closed-object rules; it does not create a second “lite” contract. The `complete` profile requires the full canonical structure and semantic invariants.

```bash
npm run validate:artifact -- ./path/to/workflow-start.json --profile starter --type workflow-charter
npm run validate:artifact -- ./path/to/workflow-charter.json --profile complete
```

Supported progressive types are `workflow-charter`, `engagement-reframe`, and `data-context-manifest`. Use `--json` for machine-readable results. Run `npm test` before treating a repository change as complete. Passing artifact validation proves structure and declared invariants only; it does not supply missing field evidence, authority, acceptance, or release approval.

### Why progressive profiles stop at JSON contracts

Starter profiles apply only to closed, machine-readable contracts whose canonical JSON Schema can retain type and unknown-field rules while requiring a smaller decision-bearing subset. The Markdown delivery, readiness, and handoff templates are collaborative working records: their tables carry target evidence, exercises, dissent, owners, and narrative decisions that cannot be made true by structural validation. Converting them to JSON merely for symmetry would create worse human artifacts and another contract surface to maintain.

Use their minimum viable sections progressively instead:

| Decision | Start with | Add before the next gate |
| --- | --- | --- |
| Plan a pilot | Delivery contract, pilot graduation contract, adoption measurement contract, and adoption design | Funnel diagnosis, cohort sequence, capacity, artifact lineage, and prototype debt |
| Assess rollout readiness | Assessment identity, status contract, applicable readiness rows, and blocking gaps | Target-system tests, operating evidence, rollout decision, and restoration evidence |
| Start transfer | Ownership, pilot transfer plan, open capability gaps, and temporary support boundary | Receiving-team-led exercises, immutable artifact lineage, post-exit support, and acceptance decision |

Repository tests verify that these canonical sections, control references, and links remain present. That is a structural guardrail, not evidence that a target team filled the record, exercised the path, or accepted the decision. Keep these documents in the pilot packet from the start and deepen the same files; do not create separate “starter” Markdown copies.

For a first workflow conversation, start with these twelve decision-bearing fields. This is the same workflow-charter object you will extend later, so no conversion or parallel “lite” artifact is required.

```json
{
  "workflow_id": "invoice_exception_resolution",
  "owners": {
    "operational": "accounts-payable",
    "risk": "finance-controls",
    "receiving_service_owner": "accounts-payable-service"
  },
  "functional_requirement": {
    "user": "accounts-payable reviewer",
    "decision": "select the policy-covered resolution",
    "accepted_outcome": "approved resolution matches ledger readback"
  },
  "scope": {
    "initial_segment": "domestic price-variance exceptions",
    "out_of_scope": ["payment execution"]
  },
  "outcome": { "verifier": "finance controls manager" },
  "stop_conditions": ["source authority cannot be verified"],
  "decision": { "disposition": "discover" }
}
```

Run it with `--profile starter`. As evidence matures, add fields from the canonical [workflow-charter template](workflow-charter.json) and switch to `--profile complete`. The same progressive path works for a contradicted [engagement reframe](engagement-reframe.json) and a decision-bound [data-context manifest](data-context-manifest.json); validation errors name the next missing decision field.

## Engagement and value

| Template | Decision it supports |
| --- | --- |
| [Field-observation log](field-observation-log.md) | What people actually do, including exceptions and workarounds |
| [Engagement reframe](engagement-reframe.json) | Whether field evidence justifies a scoped change to the inherited brief and which dependent work must be reviewed or superseded |
| [Workflow discovery pack](discovery-pack.md) | Whether the workflow is bounded, owned, verifiable, and ready |
| [Workflow charter](workflow-charter.json) | Whether to discover, pilot, defer, do not build, promote, pause, or retire the workflow |
| [AI Value Engineering Scorecard](ai-value-engineering-scorecard.json) | Whether the four hard gates and twelve factors support a bounded pilot or lifecycle decision |
| [Value case](value-case.md) | Whether measured outcome improvement justifies full delivery and operating cost |
| [Data-readiness assessment](data-readiness-assessment.md) | Whether the four data planes and decision-critical sources are fit, affordable, and owned for the bounded workflow |
| [Data-context manifest](data-context-manifest.json) | Which exact sources, quality evidence, preparation, labels, outputs, economics, and monitors are bound to design and release |
| [Intelligence selection record](intelligence-selection-record.md) | Which rules, optimization, ML, retrieval, foundation-model, agent, and human options were considered for a consequential decision |

## Solution and assurance

| Template | Decision it supports |
| --- | --- |
| [Operational ontology](operational-ontology.json) | Which objects, states, rules, actions, permissions, and evidence define the domain |
| [System-map manifest](system-map-manifest.json) | Which versioned software and operational relationships help navigation and impact review when system complexity justifies it |
| [Change-impact assessment](change-impact-assessment.json) | Which material-change impacts, owners, validation, review, rollout, and rollback evidence are required |
| [Agent system](agent-system.json) | Where deterministic software, model judgment, tools, people, state, and operations meet when an agent workflow is selected |
| [Behavior bundle](behavior-bundle.json) | Which exact model-route, prompt, harness, context, tool membership, and guardrail bytes the agent uses |
| [Tool contract](tool-contract.json) | Which data and effects a capability exposes and how it is authorized, contained, and verified |
| [Capability manifest](capability-manifest.json) | Which exact capability build is admitted, with what provenance, authority, assurance, and lifecycle |
| [Threat model](threat-model.json) | Which abuses and failures must be prevented, detected, recovered, and tested |
| [Evaluation case](evaluation-case.json) | Which representative condition must succeed, fail safely, or escalate, and who authorizes the expected result |
| [Evaluation report](evaluation-report.json) | Which model- or agent-system claim was tested under which versions, trials, limits, and contamination controls |
| [Handoff envelope](handoff-envelope.json) | What verified state, evidence, remaining work, authority, and budget one worker may pass to another |
| [Architecture decision record](architecture-decision-record.md) | Why a consequential design choice was accepted and how it can be reversed |

## Executable support skeletons

| Skeleton | Fail-closed role |
| --- | --- |
| [Authorization policy](authorization-policy.mjs) | Deny every request until an implementation supplies an explicit policy decision |
| [Evaluation runner](evaluation-runner.mjs) | Refuse to claim an executed trial until a real runner replaces the skeleton |
| [Evaluation world](evaluation-world.mjs) | Represent the canonical template as not executed |
| [Reference runtime](reference-runtime.mjs) | Refuse workflow execution until an implementation replaces the skeleton |
| [Operator surface](operator-surface.mjs) | Refuse to imply that an adoption plan is an implemented review interface |
| [Operations bundle](operations-bundle.mjs) | Refuse health, kill-switch, or rollback claims until controllers are wired |

## Delivery and operation

| Template | Decision it supports |
| --- | --- |
| [Delivery and adoption plan](delivery-and-adoption-plan.md) | How the vertical slice, acceptance, rollout, enablement, and ownership transfer will run |
| [Solution release](solution-release.json) | Which compatible model- or agent-system artifact bundle is approved for which segment and rollout |
| [Production service readiness](production-service-readiness.md) | Which target-specific service boundaries are required, designed, tested, operational, unresolved, or inapplicable before rollout or handoff |
| [Service enablement and handoff](customer-enablement-handoff.md) | Whether the accountable operating team can operate, change, recover, and retire the service |
| [Production service review](production-service-review.md) | Whether named workflow and service owners can continue, expand, constrain, pause, improve, or retire the live workflow |
| [Applied AI workflow portfolio review](workflow-portfolio-review.md) | How to map decision rights and shared-versus-workflow capabilities, then compare proof gates, accepted value, economics, reuse, and capacity without overriding service gates |
| [Field-learning register](field-learning-register.md) | Which recurring field signal becomes a customer fix, platform change, documented pattern, or rejected proposal |

The current evaluation-report and solution-release JSON contracts are model/agent release profiles. A deterministic, optimization, or classical-ML-only system should use the target software release process with equivalent versioned data, model/code, policy, evaluation, operations, rollout, rollback, and ownership evidence; do not invent an agent system merely to satisfy these templates.

Follow the full sequence in the [delivery playbooks](../playbooks/README.md). JSON artifacts declare a local schema and are checked by `npm run validate`.
