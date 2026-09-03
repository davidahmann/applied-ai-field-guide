import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  embeddedToolSchemaErrors,
  changeImpactAssessmentSemanticErrors,
  evaluationCaseSemanticErrors,
  evaluationReportSemanticErrors,
  expectedEvaluationOutputDigest,
  ontologyIdentityErrors,
  patternCatalogErrors,
  solutionReleaseSemanticErrors,
  systemMapManifestSemanticErrors,
  toolContractSemanticErrors,
  valueScorecardSemanticErrors,
} from "../scripts/contract-invariants.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pairs = [
  ["artifact-catalog.schema.json", "catalog.json"],
  ["ai-value-engineering-scorecard.schema.json", "templates/ai-value-engineering-scorecard.json"],
  ["control-catalog.schema.json", "controls/control-catalog.json"],
  ["change-impact-assessment.schema.json", "templates/change-impact-assessment.json"],
  ["operational-ontology.schema.json", "templates/operational-ontology.json"],
  ["agent-system.schema.json", "templates/agent-system.json"],
  ["tool-contract.schema.json", "templates/tool-contract.json"],
  ["evaluation-case.schema.json", "templates/evaluation-case.json"],
  ["threat-model.schema.json", "templates/threat-model.json"],
  ["pattern-catalog.schema.json", "patterns/pattern-catalog.json"],
  ["workflow-charter.schema.json", "templates/workflow-charter.json"],
  ["evaluation-report.schema.json", "templates/evaluation-report.json"],
  ["engagement-reframe.schema.json", "templates/engagement-reframe.json"],
  ["solution-release.schema.json", "templates/solution-release.json"],
  ["system-map-manifest.schema.json", "templates/system-map-manifest.json"],
];

test("the AI value scorecard preserves factor identity and hard-gate decisions", async () => {
  const fixture = await json("templates/ai-value-engineering-scorecard.json");
  assert.deepEqual(valueScorecardSemanticErrors(fixture, "fixture"), []);

  const reordered = structuredClone(fixture);
  [reordered.factors[0], reordered.factors[1]] = [reordered.factors[1], reordered.factors[0]];
  assert.ok(valueScorecardSemanticErrors(reordered, "fixture").some((error) => error.includes("canonical ordered factor")));

  const unsupportedPass = structuredClone(fixture);
  unsupportedPass.factors[0].score = 2;
  assert.ok(valueScorecardSemanticErrors(unsupportedPass, "fixture").some((error) => error.includes("without evidence")));

  const gateBypass = structuredClone(fixture);
  gateBypass.decision.disposition = "pilot";
  assert.ok(valueScorecardSemanticErrors(gateBypass, "fixture").some((error) => error.includes("hard gate")));

  const evidenceFreeGate = structuredClone(fixture);
  evidenceFreeGate.hard_gates.owned_outcome.status = "pass";
  assert.ok(valueScorecardSemanticErrors(evidenceFreeGate, "fixture").some((error) => error.includes("cannot pass without evidence")));
});


async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

for (const [schemaName, fixturePath] of pairs) {
  test(`${schemaName} accepts its canonical template`, async () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const validate = ajv.compile(await json(`schemas/${schemaName}`));
    const fixture = await json(fixturePath);
    assert.equal(validate(fixture), true, JSON.stringify(validate.errors));
  });

  test(`${schemaName} rejects missing required data and unknown fields`, async () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    const schema = await json(`schemas/${schemaName}`);
    const validate = ajv.compile(schema);
    const fixture = structuredClone(await json(fixturePath));
    const removable = schema.required.find((field) => field !== "$schema");
    delete fixture[removable];
    fixture.uncontrolled_field = true;
    assert.equal(validate(fixture), false);
    assert.ok(validate.errors.some((error) => error.keyword === "required"));
    assert.ok(validate.errors.some((error) => error.keyword === "additionalProperties"));
  });
}

test("artifact catalog rejects paths that can escape the repository", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/artifact-catalog.schema.json"));
  const fixture = await json("catalog.json");
  fixture.artifacts[0].path = "../outside.md";
  assert.equal(validate(fixture), false);
});

test("agent-system schema requires an operations trace contract", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/agent-system.schema.json"));
  const fixture = await json("templates/agent-system.json");
  delete fixture.operations.trace_contract;
  assert.equal(validate(fixture), false);
  assert.ok(validate.errors.some((error) => error.keyword === "required" && error.params.missingProperty === "trace_contract"));
});

test("agent-system schema requires a workflow charter", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/agent-system.schema.json"));
  const fixture = await json("templates/agent-system.json");
  delete fixture.charter_uri;
  assert.equal(validate(fixture), false);
  assert.ok(validate.errors.some((error) => error.keyword === "required" && error.params.missingProperty === "charter_uri"));
});

test("workflow-charter schema requires the operational requirement, stop conditions, service owner, and risk readiness", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/workflow-charter.schema.json"));
  const fixture = await json("templates/workflow-charter.json");
  delete fixture.functional_requirement;
  delete fixture.stop_conditions;
  delete fixture.owners.receiving_service_owner;
  delete fixture.readiness.risk;
  assert.equal(validate(fixture), false);
  for (const field of ["functional_requirement", "stop_conditions"]) {
    assert.ok(validate.errors.some((error) => error.keyword === "required" && error.params.missingProperty === field));
  }
  assert.ok(validate.errors.some((error) => error.keyword === "required" && error.params.missingProperty === "receiving_service_owner"));
  assert.ok(validate.errors.some((error) => error.keyword === "required" && error.params.missingProperty === "risk"));
});

test("workflow-charter value cases cannot silently omit expected residual loss", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/workflow-charter.schema.json"));
  const fixture = await json("templates/workflow-charter.json");
  delete fixture.value_case.annual_expected_residual_loss_usd;
  assert.equal(validate(fixture), false);
  assert.ok(validate.errors.some(
    (error) => error.keyword === "required" && error.params.missingProperty === "annual_expected_residual_loss_usd",
  ));
  fixture.value_case.annual_expected_residual_loss_usd = -1;
  assert.equal(validate(fixture), false);
  fixture.value_case.annual_expected_residual_loss_usd = null;
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors));
});

test("workflow-charter measured baselines require a numeric value and observation date", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/workflow-charter.schema.json"));
  const fixture = await json("templates/workflow-charter.json");
  fixture.outcome.primary_metric.baseline.status = "measured";
  fixture.outcome.primary_metric.baseline.value = null;
  fixture.outcome.primary_metric.baseline.as_of = null;
  assert.equal(validate(fixture), false);
  fixture.outcome.primary_metric.baseline.value = 0.61;
  fixture.outcome.primary_metric.baseline.as_of = "2026-08-07";
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors));
});

test("workflow-charter pilot and production decisions require role-separated approval and readiness evidence", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/workflow-charter.schema.json"));
  const pilot = await json("templates/workflow-charter.json");
  pilot.status = "pilot";
  pilot.decision.disposition = "pilot";
  assert.equal(validate(pilot), false);
  pilot.decision.approvers = [
    { role: "operational", principal: "workflow-owner", approved_at: "2026-08-07T16:00:00Z" },
    { role: "risk", principal: "risk-owner", approved_at: "2026-08-07T16:05:00Z" },
  ];
  assert.equal(validate(pilot), true, JSON.stringify(validate.errors));

  const production = structuredClone(pilot);
  production.status = "production";
  production.decision.disposition = "promote";
  assert.equal(validate(production), false);
  production.outcome.primary_metric.baseline = {
    status: "measured",
    value: 0.61,
    source: "target-environment measurement",
    as_of: "2026-08-07",
  };
  for (const dimension of ["workflow", "context", "verifier", "integration", "adoption", "operations", "risk"]) {
    production.readiness[dimension].score = 3;
  }
  production.decision.approvers.unshift({
    role: "technical",
    principal: "delivery-lead",
    approved_at: "2026-08-07T15:55:00Z",
  });
  assert.equal(validate(production), true, JSON.stringify(validate.errors));
});

test("agent-system actor modes, behavior versions, and source contracts fail closed", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/agent-system.schema.json"));
  const fixture = await json("templates/agent-system.json");

  delete fixture.behavior.prompt_bundle;
  delete fixture.context.sources[0].revision;
  assert.equal(validate(fixture), false);

  const interactive = await json("templates/agent-system.json");
  interactive.actor_identity.mode = "interactive_delegated";
  interactive.actor_identity.audit_attribution = "agent_only";
  assert.equal(validate(interactive), false);
  interactive.actor_identity.caller_binding = {
    binding_type: "user_session",
    subject_claim: "sub",
    tenant_claim: "tenant_id",
    session_id_claim: "sid",
    max_session_age_seconds: 3600,
  };
  interactive.actor_identity.audit_attribution = "user_and_agent";
  assert.equal(validate(interactive), true, JSON.stringify(validate.errors));

  interactive.autonomy.level = "execute_bounded";
  interactive.controls.propagate_caller_authorization = false;
  assert.equal(validate(interactive), false);
});

test("agent-system outcomes, segments, owners, and economics stay aligned with their workflow charters", async () => {
  for (const [charterPath, agentPath] of [
    ["templates/workflow-charter.json", "templates/agent-system.json"],
    ["examples/invoice-exception/workflow-charter.json", "examples/invoice-exception/agent-system.json"],
  ]) {
    const charter = await json(charterPath);
    const agent = await json(agentPath);
    assert.equal(charter.functional_requirement.accepted_outcome, charter.outcome.accepted_event);
    assert.equal(agent.outcome.accepted_event, charter.outcome.accepted_event);
    assert.equal(agent.outcome.primary_metric, charter.outcome.primary_metric.metric_id);
    assert.equal(agent.outcome.baseline, charter.outcome.primary_metric.baseline.value);
    assert.equal(agent.outcome.target, charter.outcome.primary_metric.target);
    const operators = { eq: "==", lte: "<=", gte: ">=" };
    assert.deepEqual(
      agent.outcome.guardrails,
      charter.outcome.guardrail_metrics.map((metric) => `${metric.metric_id} ${operators[metric.operator]} ${metric.threshold}`),
    );
    assert.deepEqual(agent.autonomy.segments, [charter.scope.initial_segment]);
    assert.equal(agent.owners.technical, charter.owners.technical);
    assert.equal(agent.owners.operational, charter.owners.operational);
    assert.equal(agent.owners.risk, charter.owners.risk);
    assert.equal(agent.economics.max_cost_per_accepted_outcome_usd, charter.value_case.max_cost_per_accepted_outcome_usd);
  }
});

test("the current release contracts are scoped honestly when an agent is not selected", async () => {
  const [catalog, evaluationSchema, releaseSchema, templateGuide] = await Promise.all([
    json("controls/control-catalog.json"),
    json("schemas/evaluation-report.schema.json"),
    json("schemas/solution-release.schema.json"),
    readFile(path.join(root, "templates", "README.md"), "utf8"),
  ]);
  const deliveryControl = catalog.controls.find((control) => control.id === "DEL-001");
  assert.match(deliveryControl.requirement, /When model or agent behavior is selected/);
  assert.match(deliveryControl.requirement, /equivalent target software-release evidence/);
  assert.match(evaluationSchema.title, /agent/i);
  assert.match(releaseSchema.title, /agent/i);
  assert.match(templateGuide, /model\/agent release profiles/);
  assert.match(templateGuide, /do not invent an agent system/i);
});

test("evaluation schema rejects an agent-controlled pass signal", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/evaluation-case.schema.json"));
  const fixture = await json("templates/evaluation-case.json");
  fixture.evaluator_boundary.agent_can_emit_pass_signal = true;
  assert.equal(validate(fixture), false);
});

test("evaluation cases bind reference answers to independent, current authority", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/evaluation-case.schema.json"));
  const fixture = await json("templates/evaluation-case.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors));
  assert.deepEqual(evaluationCaseSemanticErrors(fixture, "fixture"), []);

  const missing = structuredClone(fixture);
  delete missing.reference_authority.source_revision;
  assert.equal(validate(missing), false);
  assert.ok(validate.errors.some(
    (error) => error.keyword === "required" && error.params.missingProperty === "source_revision",
  ));

  const selfApproved = structuredClone(fixture);
  selfApproved.reference_authority.approved_by = selfApproved.reference_authority.label_author;
  assert.ok(evaluationCaseSemanticErrors(selfApproved, "fixture").some((error) => error.includes("different principals")));

  const stale = structuredClone(fixture);
  stale.reference_authority.review_due = "2026-01-01";
  assert.ok(evaluationCaseSemanticErrors(stale, "fixture").some((error) => error.includes("review_due")));

  const futureApproved = structuredClone(fixture);
  futureApproved.reference_authority.approved_at = "2026-08-08T00:00:00Z";
  assert.ok(evaluationCaseSemanticErrors(futureApproved, "fixture").some((error) => error.includes("after last_reviewed")));
});

test("system maps remain derived navigation context rather than authority", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/system-map-manifest.schema.json"));
  const fixture = await json("templates/system-map-manifest.json");
  fixture.usage.prohibited_purposes = ["authorization", "effect_authorization"];
  assert.equal(validate(fixture), false);
  assert.ok(validate.errors.some((error) => error.keyword === "contains"));
});

test("material change assessments require complete coverage and accountable review", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/change-impact-assessment.schema.json"));
  const fixture = await json("templates/change-impact-assessment.json");
  fixture.impact_summary.scope_coverage = "partial";
  fixture.promotion.approval_required = false;
  fixture.promotion.review_roles = ["technical"];
  assert.equal(validate(fixture), false);
  assert.ok(validate.errors.some((error) => error.keyword === "const"));
  assert.ok(validate.errors.some((error) => error.keyword === "contains"));
});

test("system maps and impact assessments bind only declared evidence elements", async () => {
  const map = await json("templates/system-map-manifest.json");
  assert.deepEqual(systemMapManifestSemanticErrors(map, "map"), []);
  const missingSource = structuredClone(map);
  missingSource.relations[0].source_refs = ["missing_source"];
  assert.ok(systemMapManifestSemanticErrors(missingSource, "map").some((error) => error.includes("missing source")));

  const assessment = await json("templates/change-impact-assessment.json");
  assert.deepEqual(changeImpactAssessmentSemanticErrors(assessment, map, "assessment"), []);
  const missingElement = structuredClone(assessment);
  missingElement.impacted_elements[0].element_id = "missing_node";
  assert.ok(changeImpactAssessmentSemanticErrors(missingElement, map, "assessment").some((error) => error.includes("missing mapped element")));
});

test("evaluation reports reject mutable graders, cross-trial state, and missing trial semantics", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/evaluation-report.schema.json"));
  const fixture = await json("templates/evaluation-report.json");
  fixture.suite.agent_can_modify = true;
  fixture.contamination_controls.answer_key_access = true;
  fixture.contamination_controls.cross_trial_state = true;
  fixture.trials.aggregation = "pass_at_k";
  fixture.trials.k = null;
  assert.equal(validate(fixture), false);
});

test("evaluation reports bind a frozen human-AI policy to held-out qualification evidence", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/evaluation-report.schema.json"));
  const fixture = await json("templates/evaluation-report.json");
  const qualification = fixture.deployment_qualification;
  qualification.status = "qualified";
  qualification.rationale = "The frozen terminal policy clears the declared reliability bound on disjoint held-out cases.";
  qualification.oversight_policy.frozen_before_qualification = true;
  qualification.execution_mode = "terminal_replay";
  qualification.operating_point = {
    target_reliability: 0.95,
    observed_reliability: 0.98,
    reliability_lower_bound: 0.96,
    confidence: 0.95,
    confidence_method: "one-sided exact binomial bound",
    autonomous_coverage: 0.7,
    human_review_burden: 0.3,
    routing_signal_quality: "Measured precision and recall on the qualification partition",
    expected_cost_per_case: 1.25,
    currency: "USD",
  };
  qualification.review_path = {
    effectiveness_basis: "measured",
    effectiveness: 0.99,
    reviewer_population: "qualified target-workflow reviewers",
    capacity_source: "representative queue and burst exercise",
    latency_target_ms: 900000,
  };
  fixture.evaluator.output.digest = expectedEvaluationOutputDigest(fixture);

  assert.equal(validate(fixture), true, JSON.stringify(validate.errors));
  assert.deepEqual(evaluationReportSemanticErrors(fixture, "fixture"), []);

  const weakBound = structuredClone(fixture);
  weakBound.deployment_qualification.operating_point.reliability_lower_bound = 0.94;
  assert.ok(evaluationReportSemanticErrors(weakBound, "fixture").some((error) => error.includes("lower confidence bound")));

  const hiddenLoad = structuredClone(fixture);
  hiddenLoad.deployment_qualification.operating_point.human_review_burden = 0.2;
  assert.ok(evaluationReportSemanticErrors(hiddenLoad, "fixture").some((error) => error.includes("must sum to 1")));

  const trajectoryMismatch = structuredClone(fixture);
  trajectoryMismatch.deployment_qualification.oversight_policy.trajectory_invariant = false;
  assert.equal(validate(trajectoryMismatch), false);

  const tunedOnHoldout = structuredClone(fixture);
  tunedOnHoldout.deployment_qualification.evidence_partitions.disjoint = false;
  assert.equal(validate(tunedOnHoldout), false);
});

test("approved solution releases require technical, operational, and risk approvals", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/solution-release.schema.json"));
  const fixture = await json("templates/solution-release.json");
  fixture.release_status = "approved";
  assert.equal(validate(fixture), false);
});

test("evaluation-report semantics reject contradictory results and non-independent repeated trials", async () => {
  const fixture = await json("templates/evaluation-report.json");
  assert.deepEqual(evaluationReportSemanticErrors(fixture, "fixture"), []);
  fixture.trials.count = 3;
  fixture.trials.independent = false;
  fixture.results[0].pass = true;
  fixture.suite.holdout_isolated = false;
  fixture.decision.status = "accept";
  const errors = evaluationReportSemanticErrors(fixture, "fixture");
  assert.ok(errors.some((error) => error.includes("independent")));
  assert.ok(errors.some((error) => error.includes("pass flag")));
  assert.ok(errors.some((error) => error.includes("cannot accept")));
});

test("solution-release semantics bind approvals and migration state", async () => {
  const fixture = await json("templates/solution-release.json");
  assert.deepEqual(solutionReleaseSemanticErrors(fixture, "fixture"), []);
  fixture.artifacts.push(structuredClone(fixture.artifacts[0]));
  fixture.compatibility.migration_required = true;
  fixture.approvals.push({
    role: "technical",
    principal: "technical-owner",
    bound_release_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    approved_at: "2026-08-07T17:00:00Z",
  });
  const errors = solutionReleaseSemanticErrors(fixture, "fixture");
  assert.ok(errors.some((error) => error.includes("duplicates artifact role")));
  assert.ok(errors.some((error) => error.includes("not bound")));
  assert.ok(errors.some((error) => error.includes("no migration procedure")));
});

test("ontology schema rejects an undeclared effect class", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/operational-ontology.schema.json"));
  const fixture = await json("templates/operational-ontology.json");
  fixture.actions[0].side_effect = "model_defined";
  assert.equal(validate(fixture), false);
});

test("tool schema requires fail-closed authorization", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixture = await json("templates/tool-contract.json");
  fixture.authorization.fail_mode = "open";
  assert.equal(validate(fixture), false);
});

test("tool schema accepts canonical query, staged-write, commit-write, and irreversible contracts", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixtures = [
    await json("examples/invoice-exception/tools/read-invoice.json"),
    await json("templates/tool-contract.json"),
    await json("examples/invoice-exception/tools/commit-resolution.json"),
  ];
  const irreversible = structuredClone(fixtures[2]);
  irreversible.side_effects.class = "irreversible";
  irreversible.side_effects.compensation = null;
  fixtures.push(irreversible);

  for (const fixture of fixtures) {
    assert.equal(validate(fixture), true, `${fixture.tool_id}: ${JSON.stringify(validate.errors)}`);
  }
});

test("query tools cannot declare effects, approvals, idempotency keys, or postcondition writes", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixture = await json("examples/invoice-exception/tools/read-invoice.json");
  fixture.side_effects = { class: "staged", resources: ["invoice"], compensation: "discard" };
  fixture.approval = { required: true, role: "approver", proposal_digest_required: true, expires_seconds: 300 };
  fixture.execution.idempotency = { required: true, key_fields: ["invoice_id"], enforced_by: "ledger" };
  fixture.observability.postcondition_readback = true;
  assert.equal(validate(fixture), false);
});

test("staged writes require caller and tenant binding, a digest, idempotency, compensation, and readback", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixture = await json("templates/tool-contract.json");
  fixture.output_schema.required = fixture.output_schema.required.filter((field) => field !== "proposal_digest");
  fixture.authorization.caller_context_required = false;
  fixture.authorization.tenant_binding = false;
  fixture.execution.idempotency.required = false;
  fixture.execution.idempotency.key_fields = [];
  fixture.side_effects.resources = [];
  fixture.side_effects.compensation = null;
  fixture.approval = { required: true, role: "approver", proposal_digest_required: true, expires_seconds: 300 };
  fixture.observability.postcondition_readback = false;
  assert.equal(validate(fixture), false);
});

test("commit writes require caller and tenant binding, digest-bound approval, idempotency, effect semantics, and readback", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixture = await json("examples/invoice-exception/tools/commit-resolution.json");
  fixture.authorization.caller_context_required = false;
  fixture.authorization.tenant_binding = false;
  fixture.approval = { required: false, role: null, proposal_digest_required: false, expires_seconds: null };
  fixture.execution.idempotency.required = false;
  fixture.execution.idempotency.key_fields = [];
  fixture.side_effects.class = "staged";
  fixture.observability.postcondition_readback = false;
  assert.equal(validate(fixture), false);
});

test("compute and administrative side effects require generic effect controls", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const base = await json("examples/invoice-exception/tools/read-invoice.json");

  for (const kind of ["compute", "administrative"]) {
    const valid = structuredClone(base);
    valid.kind = kind;
    valid.execution.idempotency = { required: true, key_fields: ["tenant_id", "invoice_id"], enforced_by: "effect-service" };
    valid.side_effects = { class: "reversible", resources: ["work-item"], compensation: "restore prior revision" };
    valid.observability.postcondition_readback = true;
    assert.equal(validate(valid), true, `${kind}: ${JSON.stringify(validate.errors)}`);

    const invalid = structuredClone(valid);
    invalid.authorization.caller_context_required = false;
    invalid.authorization.tenant_binding = false;
    invalid.execution.idempotency = { required: false, key_fields: [], enforced_by: "effect-service" };
    invalid.side_effects.resources = [];
    invalid.observability.postcondition_readback = false;
    assert.equal(validate(invalid), false);
  }
});

test("every non-read effect requires brokered allowlisted network access", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const base = await json("examples/invoice-exception/tools/read-invoice.json");
  base.kind = "administrative";
  base.execution.idempotency = { required: true, key_fields: ["tenant_id", "invoice_id"], enforced_by: "effect-service" };
  base.side_effects = { class: "reversible", resources: ["work-item"], compensation: "restore prior revision" };
  base.observability.postcondition_readback = true;
  assert.equal(validate(base), true, JSON.stringify(validate.errors));

  for (const mutation of [
    (network) => { network.egress = "none"; },
    (network) => { network.destinations = []; },
    (network) => { network.allowed_operations = []; },
    (network) => { network.allowed_methods = []; },
    (network) => { network.address_resolution_policy = "deny"; },
    (network) => { network.target_account_binding = false; },
    (network) => { network.tenant_binding = false; },
    (network) => { network.credential_broker = null; },
  ]) {
    const invalid = structuredClone(base);
    mutation(invalid.network);
    assert.equal(validate(invalid), false);
  }
});

test("read-capable tools declare bounded data exposure and governed approval", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixture = await json("examples/invoice-exception/tools/read-invoice.json");

  for (const mutation of [
    (dataAccess) => { dataAccess.classifications = []; },
    (dataAccess) => { dataAccess.scope_fields = []; },
    (dataAccess) => { dataAccess.max_records = 0; },
    (dataAccess) => { dataAccess.max_response_bytes = 0; },
  ]) {
    const invalid = structuredClone(fixture);
    mutation(invalid.data_access);
    assert.equal(validate(invalid), false);
  }
});

test("tool semantic checks bind data scope and network capability to the contract", async () => {
  const fixture = await json("examples/invoice-exception/tools/read-invoice.json");
  assert.deepEqual(toolContractSemanticErrors(fixture, "fixture"), []);

  fixture.data_access.scope_fields.push("undeclared_scope");
  fixture.network.allowed_operations = ["different_operation"];
  fixture.network.tenant_binding = false;
  const errors = toolContractSemanticErrors(fixture, "fixture");
  assert.ok(errors.some((error) => error.includes("undeclared_scope")));
  assert.ok(errors.some((error) => error.includes("allowed_operations")));
  assert.ok(errors.some((error) => error.includes("tenant binding")));
});

test("irreversible effects are commit-only, approval-gated, and non-compensable", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(await json("schemas/tool-contract.schema.json"));
  const fixture = await json("examples/invoice-exception/tools/commit-resolution.json");
  fixture.side_effects.class = "irreversible";
  assert.equal(validate(fixture), false);

  fixture.side_effects.compensation = null;
  fixture.kind = "administrative";
  assert.equal(validate(fixture), false);
});

test("all embedded tool schemas compile and malformed input, output, or error schemas fail", async () => {
  const fixture = await json("templates/tool-contract.json");
  assert.deepEqual(embeddedToolSchemaErrors(fixture, "fixture"), []);

  for (const field of ["input_schema", "output_schema", "error_schema"]) {
    const malformed = structuredClone(fixture);
    malformed[field] = { type: "not-a-json-schema-type" };
    const errors = embeddedToolSchemaErrors(malformed, "fixture");
    assert.equal(errors.length, 1);
    assert.match(errors[0], new RegExp(`${field} schema compilation failed`));
  }
});

test("ontology identity keys resolve to declared attributes", async () => {
  const fixture = await json("templates/operational-ontology.json");
  assert.deepEqual(ontologyIdentityErrors(fixture, "fixture"), []);

  fixture.entities[0].identity_keys = ["missing_identity"];
  assert.deepEqual(
    ontologyIdentityErrors(fixture, "fixture"),
    ["fixture entity work_item identity key missing_identity is not declared as an attribute"],
  );
});

test("pattern catalogs require unique IDs, defined evidence, and ordered current review dates", async () => {
  const fixture = await json("patterns/pattern-catalog.json");
  const evidenceIds = new Set(fixture.patterns.flatMap((pattern) => pattern.evidence).filter((id) => !id.startsWith("internal-")));
  const reviewDate = new Date("2026-08-14T12:00:00Z");
  assert.deepEqual(patternCatalogErrors(fixture, evidenceIds, "fixture", reviewDate), []);

  fixture.patterns[1].id = fixture.patterns[0].id;
  fixture.patterns[0].evidence = ["R26-99"];
  fixture.patterns[0].reviewed_at = "2026-08-15";
  fixture.patterns[1].review_due = "2026-08-06";
  const errors = patternCatalogErrors(fixture, evidenceIds, "fixture", reviewDate);
  assert.ok(errors.some((error) => error.includes("duplicates pattern ID")));
  assert.ok(errors.some((error) => error.includes("references missing evidence")));
  assert.ok(errors.some((error) => error.includes("reviewed_at is in the future")));
  assert.ok(errors.some((error) => error.includes("review_due precedes reviewed_at")));
  assert.ok(errors.some((error) => error.includes("review is overdue")));
});
