import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  evaluationReportSemanticErrors,
  expectedEvaluationEnvironmentDigest,
  expectedEvaluationOutputDigest,
  expectedEvaluationSandboxDigest,
  expectedSolutionReleaseDigest,
  solutionReleaseSemanticErrors,
  toolContractSemanticErrors,
} from "../scripts/contract-invariants.mjs";

const execFileAsync = promisify(execFile);
const sourceRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const validator = path.join(sourceRoot, "scripts", "validate-repository.mjs");

async function json(repositoryPath, repositoryRoot = sourceRoot) {
  return JSON.parse(await readFile(path.join(repositoryRoot, repositoryPath), "utf8"));
}

async function schemaValidator(schemaName) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(await json(`schemas/${schemaName}`));
}

function bindReleaseDigest(release) {
  release.release_digest = expectedSolutionReleaseDigest(release);
  for (const approval of release.approvals ?? []) approval.bound_release_digest = release.release_digest;
  if (release.deployment_evidence) release.deployment_evidence.release_digest = release.release_digest;
  if (release.rollback_evidence) release.rollback_evidence.release_digest = release.release_digest;
  if (release.retirement_evidence) release.retirement_evidence.release_digest = release.release_digest;
  return release;
}

function lifecycleEvidenceSubject(referenceKind, evidence) {
  if (referenceKind === "deployment_evidence") {
    const { verification_uri: _uri, verification_digest: _digest, ...subject } = evidence;
    return subject;
  }
  const { evidence_uri: _uri, evidence_digest: _digest, ...subject } = evidence;
  return subject;
}

function lifecycleSubjectDigest(referenceKind, subject) {
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  };
  return `sha256:${createHash("sha256")
    .update(`production-agent-engineering/canonical-json/v1/${referenceKind}\0`)
    .update(JSON.stringify(canonical(subject)))
    .digest("hex")}`;
}

function acceptedEvaluation(report) {
  report.objective = "capability";
  report.system.environment.sandbox = {
    component_id: "unit-test-container",
    version: "1.0.0",
    image_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    isolation: "container",
    cpu_limit: 1,
    memory_limit_mb: 512,
    filesystem: "ephemeral",
    max_wall_time_ms: 90000,
    network_enforced: true,
    wall_time_enforced: true,
    digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  };
  report.system.environment.network_mode = "denied";
  report.contamination_controls.external_network = "denied";
  report.system.environment.sandbox.digest = expectedEvaluationSandboxDigest(report.system.environment.sandbox);
  report.system.environment.environment_digest = expectedEvaluationEnvironmentDigest(report.system.environment);
  report.trials.count = 1;
  report.population.evaluated_cases = 1;
  report.population.excluded_cases = 0;
  report.population.case_coverage[0].evaluated_cases = 1;
  report.resource_usage = {
    turns: 1,
    tool_calls: 1,
    total_tokens: 100,
    wall_time_ms: 1000,
    cost_usd: 0.01,
    peak_parallel_workers: 1,
  };
  report.results[0].value = 0.97;
  report.results[0].pass = true;
  report.results[0].uncertainty = {
    method: "wilson",
    lower: 0.95,
    upper: 0.99,
    confidence: 0.95,
  };
  report.decision.status = "accept";
  report.decision.rationale = "The point estimate and its declared uncertainty interval meet the release threshold.";
  report.evaluator.output.uri = "evaluation-output.json";
  report.evaluator.output.schema_version = null;
  report.evaluator.output.digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  return report;
}

async function runValidator(repositoryRoot) {
  try {
    const result = await execFileAsync(process.execPath, [validator], {
      env: { ...process.env, REPOSITORY_VALIDATION_ROOT: repositoryRoot },
      maxBuffer: 4 * 1024 * 1024,
    });
    return { exitCode: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    return { exitCode: error.code, output: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

function transformJson(transform) {
  return (body) => {
    const document = JSON.parse(body);
    transform(document);
    return `${JSON.stringify(document, null, 2)}\n`;
  };
}

async function mutateFile(repositoryRoot, repositoryPath, transform, expectedFailure) {
  const target = path.join(repositoryRoot, repositoryPath);
  const original = await readFile(target, "utf8");
  try {
    await writeFile(target, transform(original));
    const result = await runValidator(repositoryRoot);
    assert.notEqual(result.exitCode, 0, result.output);
    assert.match(result.output, expectedFailure);
  } finally {
    await writeFile(target, original);
  }
}

async function sha256Path(target, metadata = null) {
  metadata ??= await stat(target);
  const hash = createHash("sha256");
  if (metadata.isFile()) {
    hash.update(await readFile(target));
    return `sha256:${hash.digest("hex")}`;
  }
  hash.update("directory\0");
  async function appendDirectory(directory, prefix = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const name = path.posix.join(prefix, entry.name);
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        hash.update(`directory\0${name}\0`);
        await appendDirectory(child, name);
      } else if (entry.isFile()) {
        hash.update(`file\0${name}\0`);
        hash.update(await readFile(child));
        hash.update("\0");
      } else {
        throw new Error(`unsupported fixture entry ${name}`);
      }
    }
  }
  await appendDirectory(target);
  return `sha256:${hash.digest("hex")}`;
}

async function createApprovedReleaseFixture(repositoryRoot) {
  const releaseDirectory = path.join(repositoryRoot, "releases", "invoice-exception-pilot");
  await mkdir(releaseDirectory, { recursive: true });

  const exampleDirectory = path.join(repositoryRoot, "examples", "invoice-exception");
  const agent = await json("examples/invoice-exception/agent-system.json", repositoryRoot);
  const charter = await json("examples/invoice-exception/workflow-charter.json", repositoryRoot);
  const suiteDirectory = path.join(exampleDirectory, "evals");
  const fixturePath = path.join(suiteDirectory, "authorized-commit.json");
  const runnerPath = path.join(exampleDirectory, "run-evals.mjs");
  const graderPath = runnerPath;
  const runtimePath = path.join(exampleDirectory, "reference-loop.mjs");
  const worldPath = path.join(exampleDirectory, "invoice-world-fixture.mjs");
  const policyPath = path.join(exampleDirectory, "authorization-policy.mjs");
  const agentPath = path.join(exampleDirectory, "agent-system.json");
  const ontologyPath = path.join(exampleDirectory, "ontology.json");
  const packageLockPath = path.join(repositoryRoot, "package-lock.json");
  const traceSchemaPath = path.join(repositoryRoot, "schemas", "trace-event.schema.json");
  const effectSchemaPath = path.join(repositoryRoot, "schemas", "effect-receipt.schema.json");

  const report = {
    $schema: "../../schemas/evaluation-report.schema.json",
    schema_version: "1.1.0",
    report_id: "invoice_exception_pilot_report",
    version: "1.0.0",
    owner: "evaluation-preparer",
    generated_at: "2026-08-07T17:00:00Z",
    claim: "The invoice exception agent meets every declared outcome and guardrail threshold for the pilot segment.",
    objective: "regression",
    population: {
      eligible_population: charter.outcome.primary_metric.eligible_population,
      segments: [charter.scope.initial_segment],
      eligible_cases: 10,
      evaluated_cases: 10,
      excluded_cases: 0,
      case_coverage: [{
        slice: charter.scope.initial_segment,
        eligible_cases: 10,
        evaluated_cases: 10,
        rationale: "All eligible pilot cases were evaluated under the immutable replay suite.",
      }],
    },
    system: {
      agent_system_uri: "../../examples/invoice-exception/agent-system.json",
      system_version: agent.version,
      system_digest: await sha256Path(agentPath),
      component_manifest: [
        ["model_route", "model_route"],
        ["prompt_bundle", "prompt_bundle"],
        ["tool_bundle", "tool_bundle"],
        ["context_policy", "context_policy"],
        ["guardrail_bundle", "guardrail_policy"],
      ].map(([role, behaviorKey]) => ({
        role,
        component_id: `invoice-${role.replaceAll("_", "-")}`,
        version: agent.behavior[behaviorKey].version,
        digest: agent.behavior[behaviorKey].digest,
      })),
      environment: {
        runtime: {
          component_id: "invoice-reference-runtime",
          uri: "../../examples/invoice-exception/reference-loop.mjs",
          version: null,
          schema_version: null,
          digest: await sha256Path(runtimePath),
        },
        harness: {
          component_id: "invoice-agent-harness",
          version: agent.behavior.harness.version,
          digest: agent.behavior.harness.digest,
        },
        sandbox: {
          component_id: "isolated-test-sandbox",
          version: "1.0.0",
          image_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          isolation: "container",
          cpu_limit: 1,
          memory_limit_mb: 512,
          filesystem: "ephemeral",
          max_wall_time_ms: agent.workflow.time_budget_ms,
          digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        },
        world: {
          component_id: "invoice-replay-world",
          uri: "../../examples/invoice-exception/invoice-world-fixture.mjs",
          version: null,
          schema_version: null,
          digest: await sha256Path(worldPath),
        },
        policy: {
          component_id: "invoice-authorization-policy",
          uri: "../../examples/invoice-exception/authorization-policy.mjs",
          version: null,
          schema_version: null,
          digest: await sha256Path(policyPath),
        },
        dependencies: [
          {
            component_id: "node-dependency-lock",
            uri: "../../package-lock.json",
            version: (await json("package-lock.json", repositoryRoot)).version,
            schema_version: null,
            digest: await sha256Path(packageLockPath),
          },
          {
            component_id: "invoice-ontology",
            uri: "../../examples/invoice-exception/ontology.json",
            version: (await json("examples/invoice-exception/ontology.json", repositoryRoot)).version,
            schema_version: (await json("examples/invoice-exception/ontology.json", repositoryRoot)).schema_version,
            digest: await sha256Path(ontologyPath),
          },
          ...await Promise.all(agent.tools.map(async (tool) => {
            const contractPath = path.resolve(exampleDirectory, tool.contract_uri);
            const contract = JSON.parse(await readFile(contractPath, "utf8"));
            return {
              component_id: `tool-${tool.tool_id}`,
              uri: `../../examples/invoice-exception/${tool.contract_uri.replace(/^\.\//, "")}`,
              version: contract.version,
              schema_version: contract.schema_version,
              digest: await sha256Path(contractPath),
            };
          })),
          {
            component_id: "trace-event-contract",
            uri: "../../schemas/trace-event.schema.json",
            version: null,
            schema_version: null,
            digest: await sha256Path(traceSchemaPath),
          },
          {
            component_id: "effect-receipt-contract",
            uri: "../../schemas/effect-receipt.schema.json",
            version: null,
            schema_version: null,
            digest: await sha256Path(effectSchemaPath),
          },
        ],
        environment_digest: "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        network_mode: "replayed",
      },
    },
    suite: {
      uri: "../../examples/invoice-exception/evals/",
      version: null,
      schema_version: "1.1.0",
      digest: await sha256Path(suiteDirectory),
      fixture_uri: "../../examples/invoice-exception/evals/authorized-commit.json",
      fixture_revision: null,
      fixture_schema_version: "1.1.0",
      fixture_digest: await sha256Path(fixturePath),
      holdout_isolated: true,
      agent_can_modify: false,
    },
    evaluator: {
      grader: {
        component_id: "invoice-evaluation-graders",
        uri: "../../examples/invoice-exception/run-evals.mjs",
        version: null,
        schema_version: null,
        digest: await sha256Path(graderPath),
      },
      runner: {
        component_id: "invoice-evaluation-runner",
        uri: "../../examples/invoice-exception/run-evals.mjs",
        version: null,
        schema_version: null,
        digest: await sha256Path(runnerPath),
      },
      output: {
        component_id: "invoice-pilot-output",
        uri: "evaluation-output.json",
        version: null,
        schema_version: null,
        digest: "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      },
      minimum_confidence: 0.95,
    },
    resource_budgets: {
      max_turns: agent.workflow.max_steps,
      max_tool_calls: 48,
      max_total_tokens: 100000,
      max_wall_time_ms: agent.workflow.time_budget_ms,
      max_cost_usd: agent.economics.max_cost_per_run_usd,
      max_parallel_workers: 1,
    },
    resource_usage: {
      turns: 8,
      tool_calls: 16,
      total_tokens: 20000,
      wall_time_ms: 45000,
      cost_usd: 0.2,
      peak_parallel_workers: 1,
    },
    trials: {
      count: 3,
      independent: true,
      state_reset_between_trials: true,
      aggregation: "mean",
      k: null,
      quantile: null,
    },
    results: [
      {
        metric: "accepted_outcome_rate",
        slice: charter.scope.initial_segment,
        value: 0.97,
        unit: "ratio",
        threshold: { operator: "gte", value: 0.95 },
        pass: true,
        uncertainty: { method: "bootstrap", lower: 0.95, upper: 0.99, confidence: 0.95 },
      },
      {
        metric: "unauthorized_effect_rate",
        slice: charter.scope.initial_segment,
        value: 0,
        unit: "ratio",
        threshold: { operator: "eq", value: 0 },
        pass: true,
        uncertainty: { method: "deterministic", lower: 0, upper: 0, confidence: 1 },
      },
      {
        metric: "duplicate_effect_rate",
        slice: charter.scope.initial_segment,
        value: 0,
        unit: "ratio",
        threshold: { operator: "eq", value: 0 },
        pass: true,
        uncertainty: { method: "deterministic", lower: 0, upper: 0, confidence: 1 },
      },
      {
        metric: "postcondition_failure_rate",
        slice: charter.scope.initial_segment,
        value: 0,
        unit: "ratio",
        threshold: { operator: "lte", value: 0.001 },
        pass: true,
        uncertainty: { method: "bootstrap", lower: 0, upper: 0.0005, confidence: 0.95 },
      },
    ],
    contamination_controls: {
      answer_key_access: false,
      cross_trial_state: false,
      external_network: "replayed",
      known_exposures: [],
      reference_solution_reviewed: false,
    },
    limitations: ["This fixture proves contract wiring and does not assert production performance."],
    decision: {
      status: "accept",
      rationale: "Every bound outcome and guardrail result satisfies its uncertainty-aware threshold.",
      decided_by: "independent-evaluation-authority",
      authority_role: "independent-release-evaluator",
      decided_at: "2026-08-07T17:30:00Z",
      independent_from_candidate: true,
    },
    control_ids: ["EVA-001", "EVA-002", "EVA-003", "EVA-005", "EVA-006"],
  };
  report.system.environment.sandbox.digest = expectedEvaluationSandboxDigest(report.system.environment.sandbox);
  report.system.environment.environment_digest = expectedEvaluationEnvironmentDigest(report.system.environment);
  const suiteCases = await Promise.all((await readdir(suiteDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map(async (name) => json(`examples/invoice-exception/evals/${name}`, repositoryRoot)));
  report.population.eligible_cases = suiteCases.length;
  report.population.evaluated_cases = suiteCases.length;
  report.population.case_coverage[0].eligible_cases = suiteCases.length;
  report.population.case_coverage[0].evaluated_cases = suiteCases.length;
  const rawOutput = {
    report_id: report.report_id,
    report_version: report.version,
    summary_digest: expectedEvaluationOutputDigest(report),
    suite_digest: report.suite.digest,
    fixture_digest: report.suite.fixture_digest,
    system_digest: report.system.system_digest,
    grader_digest: report.evaluator.grader.digest,
    runner_digest: report.evaluator.runner.digest,
    environment_digest: report.system.environment.environment_digest,
    population: report.population,
    resource_usage: report.resource_usage,
    trials: report.trials,
    results: report.results,
    contamination_controls: report.contamination_controls,
    cases: suiteCases.map((evaluationCase) => ({
      case_id: evaluationCase.case_id,
      status: "pass",
      trial_count: report.trials.count,
    })),
  };
  const rawOutputPath = path.join(releaseDirectory, "evaluation-output.json");
  await writeFile(rawOutputPath, `${JSON.stringify(rawOutput, null, 2)}\n`);
  report.evaluator.output.digest = await sha256Path(rawOutputPath);
  const evaluationPath = path.join(releaseDirectory, "evaluation-report.json");
  await writeFile(evaluationPath, `${JSON.stringify(report, null, 2)}\n`);

  async function artifact(role, uri, version, schemaVersion, changeSummary) {
    return {
      role,
      uri,
      version,
      schema_version: schemaVersion,
      digest: await sha256Path(path.resolve(releaseDirectory, uri)),
      change_summary: changeSummary,
    };
  }

  const toolArtifacts = [];
  for (const tool of agent.tools) {
    const toolPath = path.resolve(exampleDirectory, tool.contract_uri);
    const toolDocument = JSON.parse(await readFile(toolPath, "utf8"));
    toolArtifacts.push(await artifact(
      "tool_contract",
      `../../examples/invoice-exception/${tool.contract_uri.replace(/^\.\//, "")}`,
      toolDocument.version,
      toolDocument.schema_version,
      `Bind the ${tool.tool_id} capability contract.`,
    ));
  }

  const release = {
    $schema: "../../schemas/solution-release.schema.json",
    schema_version: "1.0.0",
    release_id: "invoice_exception_pilot_release",
    version: "1.0.0",
    release_status: "approved",
    release_digest: "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    owner: "release-manager",
    created_at: "2026-08-07T17:45:00Z",
    workflow_charter_uri: "../../examples/invoice-exception/workflow-charter.json",
    agent_system_uri: "../../examples/invoice-exception/agent-system.json",
    evaluation_report_uri: "evaluation-report.json",
    target_segments: [charter.scope.initial_segment],
    autonomy_level: agent.autonomy.level,
    artifacts: [
      await artifact("workflow_charter", "../../examples/invoice-exception/workflow-charter.json", charter.version, charter.schema_version, "Bind the approved pilot workflow."),
      await artifact("data_context", "../../examples/invoice-exception/data-context-manifest.json", "1.0.0", "1.0.0", "Bind the evaluated data-context manifest."),
      await artifact("domain_model", "../../examples/invoice-exception/ontology.json", (await json("examples/invoice-exception/ontology.json", repositoryRoot)).version, (await json("examples/invoice-exception/ontology.json", repositoryRoot)).schema_version, "Bind the operational domain model."),
      await artifact("agent_system", "../../examples/invoice-exception/agent-system.json", agent.version, agent.schema_version, "Bind the evaluated agent system."),
      ...toolArtifacts,
      await artifact("security_policy", "../../examples/invoice-exception/authorization-policy.mjs", null, null, "Bind the evaluated authorization policy."),
      await artifact("threat_model", "../../examples/invoice-exception/threat-model.json", null, "1.0.0", "Bind threats and negative tests."),
      await artifact("evaluation", "evaluation-report.json", report.version, report.schema_version, "Bind the accepted evaluation decision."),
      await artifact("runtime", "../../examples/invoice-exception/reference-loop.mjs", null, null, "Bind the evaluated executable runtime."),
      await artifact("user_surface", "../../examples/invoice-exception/README.md", null, null, "Bind the pilot review surface."),
      await artifact("operations", "../../operations/incident-runbook.md", null, null, "Bind the incident and recovery route."),
    ],
    compatibility: {
      environment_id: "invoice-pilot-replay",
      migration_required: false,
      migrations: [],
      known_incompatibilities: [],
      verification: ["Validate all artifact hashes and execute the immutable replay suite."],
    },
    rollout: {
      strategy: "shadow",
      traffic_percent: 0,
      soak_seconds: 86400,
      success_criteria: ["Every outcome and guardrail threshold remains satisfied."],
      rollback_criteria: ["Any unauthorized, duplicate, or mismatched effect stops the pilot."],
      kill_switch: "invoice-agent-write-deny",
      rollback_owner: "incident-commander",
      service_owner: charter.owners.receiving_service_owner,
    },
    approvals: [
      { role: "technical", principal: "technical-release-approver", bound_release_digest: "", approved_at: "2026-08-07T18:00:00Z" },
      { role: "operational", principal: "operational-release-approver", bound_release_digest: "", approved_at: "2026-08-07T18:01:00Z" },
      { role: "risk", principal: "risk-release-approver", bound_release_digest: "", approved_at: "2026-08-07T18:02:00Z" },
      { role: "service", principal: charter.owners.receiving_service_owner, bound_release_digest: "", approved_at: "2026-08-07T18:03:00Z" },
    ],
    deployment_evidence: null,
    rollback_evidence: null,
    retirement_evidence: null,
    control_ids: ["DEL-001", "DEL-002", "EVA-006", "ADP-002", "OPS-007"],
  };
  bindReleaseDigest(release);
  await writeFile(path.join(releaseDirectory, "solution-release.json"), `${JSON.stringify(release, null, 2)}\n`);

  const catalogPath = path.join(repositoryRoot, "catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const exampleEntry = catalog.artifacts.find((entry) => entry.path === "examples/invoice-exception/README.md");
  exampleEntry.tags = [...new Set([...exampleEntry.tags, "adoption"])];
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

  return { releaseDirectory, report, release, rawOutput };
}

test("evaluation acceptance requires complete coverage, bounded resources, and threshold-safe uncertainty", async () => {
  const validate = await schemaValidator("evaluation-report.schema.json");
  const report = acceptedEvaluation(await json("templates/evaluation-report.json"));
  assert.equal(validate(report), true, JSON.stringify(validate.errors));
  assert.deepEqual(evaluationReportSemanticErrors(report, "report"), []);

  report.results[0].uncertainty.lower = 0.94;
  assert.ok(evaluationReportSemanticErrors(report, "report").some((error) => error.includes("uncertainty interval crosses")));

  report.results[0].uncertainty.lower = 0.95;
  report.results[0].uncertainty.confidence = 0.9;
  assert.ok(evaluationReportSemanticErrors(report, "report").some((error) => error.includes("below the minimum confidence")));

  report.results[0].uncertainty = null;
  assert.ok(evaluationReportSemanticErrors(report, "report").some((error) => error.includes("requires a declared uncertainty")));

  const uncovered = acceptedEvaluation(await json("templates/evaluation-report.json"));
  uncovered.population.segments.push("unevaluated-production-segment");
  uncovered.population.eligible_cases = 2;
  uncovered.population.excluded_cases = 1;
  uncovered.population.case_coverage.push({
    slice: "unevaluated-production-segment",
    eligible_cases: 1,
    evaluated_cases: 0,
    rationale: "This slice is intentionally untested to exercise the acceptance boundary.",
  });
  uncovered.evaluator.output.digest = expectedEvaluationOutputDigest(uncovered);
  const uncoveredErrors = evaluationReportSemanticErrors(uncovered, "report");
  assert.ok(uncoveredErrors.some((error) => error.includes("has no evaluated cases")));
  assert.ok(uncoveredErrors.some((error) => error.includes("has no declared result")));

  report.decision.status = "inconclusive";
  report.population.case_coverage[0].evaluated_cases = 2;
  report.resource_usage.turns = report.resource_budgets.max_turns + 1;
  const errors = evaluationReportSemanticErrors(report, "report");
  assert.ok(errors.some((error) => error.includes("evaluates more cases")));
  assert.ok(errors.some((error) => error.includes("case-coverage totals")));
  assert.ok(errors.some((error) => error.includes("resource usage turns exceeds")));
});

test("evaluation decisions are independent and trial aggregation is explicit", async () => {
  const report = await json("templates/evaluation-report.json");
  report.decision.decided_by = report.owner;
  report.trials.count = 2;
  const errors = evaluationReportSemanticErrors(report, "report");
  assert.ok(errors.some((error) => error.includes("decision authority")));
  assert.ok(errors.some((error) => error.includes("single-pass aggregation")));
});

test("accepted evaluations reject contamination and derived environment drift", async () => {
  const contaminated = acceptedEvaluation(await json("templates/evaluation-report.json"));
  contaminated.contamination_controls.known_exposures = ["The candidate author reviewed the hidden expected outcome."];
  assert.ok(evaluationReportSemanticErrors(contaminated, "report").some((error) => error.includes("contaminated evaluation")));

  contaminated.contamination_controls.known_exposures = [];
  contaminated.contamination_controls.reference_solution_reviewed = true;
  assert.ok(evaluationReportSemanticErrors(contaminated, "report").some((error) => error.includes("reference solution")));

  const drifted = await json("templates/evaluation-report.json");
  drifted.system.environment.sandbox.memory_limit_mb += 1;
  const errors = evaluationReportSemanticErrors(drifted, "report");
  assert.ok(errors.some((error) => error.includes("sandbox digest")));
  assert.ok(errors.some((error) => error.includes("environment_digest")));
});

test("solution releases support multiple distinct tool contracts and bind canonical identity", async () => {
  const validate = await schemaValidator("solution-release.schema.json");
  const release = await json("templates/solution-release.json");
  const secondTool = structuredClone(release.artifacts.find((artifact) => artifact.role === "tool_contract"));
  secondTool.uri = "second-tool-contract.json";
  secondTool.digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  release.artifacts.push(secondTool);
  bindReleaseDigest(release);

  assert.equal(validate(release), true, JSON.stringify(validate.errors));
  assert.deepEqual(solutionReleaseSemanticErrors(release, "release"), []);

  release.artifacts.at(-1).uri = release.artifacts.find((artifact) => artifact.role === "tool_contract").uri;
  bindReleaseDigest(release);
  assert.ok(solutionReleaseSemanticErrors(release, "release").some((error) => error.includes("duplicates artifact tool_contract")));

  release.artifacts.at(-1).uri = "second-tool-contract.json";
  release.workflow_charter_uri = "different-workflow-charter.json";
  bindReleaseDigest(release);
  assert.ok(solutionReleaseSemanticErrors(release, "release").some((error) => error.includes("workflow_charter_uri")));

  release.workflow_charter_uri = release.artifacts.find((artifact) => artifact.role === "workflow_charter").uri;
  bindReleaseDigest(release);
  release.target_segments.push("digest-mutation");
  assert.ok(solutionReleaseSemanticErrors(release, "release").some((error) => error.includes("canonical release payload")));
});

test("release approvals and lifecycle evidence bind distinct accountable principals", async () => {
  const validate = await schemaValidator("solution-release.schema.json");
  const release = await json("templates/solution-release.json");
  release.release_status = "deployed";
  release.approvals = [
    { role: "technical", principal: "technical-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:00:00Z" },
    { role: "operational", principal: "operational-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:01:00Z" },
    { role: "risk", principal: "risk-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:02:00Z" },
    { role: "service", principal: "service-owner", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:03:00Z" },
  ];
  release.deployment_evidence = {
    deployed_at: "2026-08-07T18:00:00Z",
    environment_id: release.compatibility.environment_id,
    release_digest: release.release_digest,
    rollout_strategy: release.rollout.strategy,
    observed_traffic_percent: release.rollout.traffic_percent,
    verification_uri: "deployment-verification.json",
    verification_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    source_of_truth_readback: true,
  };
  bindReleaseDigest(release);

  assert.equal(validate(release), true, JSON.stringify(validate.errors));
  assert.deepEqual(solutionReleaseSemanticErrors(release, "release"), []);

  release.approvals[1].principal = release.approvals[0].principal;
  release.deployment_evidence.observed_traffic_percent = 10;
  const errors = solutionReleaseSemanticErrors(release, "release");
  assert.ok(errors.some((error) => error.includes("not independent")));
  assert.ok(errors.some((error) => error.includes("traffic does not match")));

  release.release_status = "retired";
  assert.equal(validate(release), false);
  assert.ok(validate.errors.some((error) => error.keyword === "type" || error.keyword === "oneOf"));

  release.approvals[1].principal = "operational-approver";
  release.deployment_evidence.observed_traffic_percent = release.rollout.traffic_percent;
  release.retirement_evidence = {
    retired_at: "2026-08-08T18:00:00Z",
    reason: "The bounded workflow was withdrawn after an approved service transition.",
    release_digest: release.release_digest,
    identity_revoked: true,
    capabilities_disabled: true,
    schedules_disabled: true,
    audit_retention_confirmed: true,
    state_disposition: "Retain audit evidence and archive non-operational state.",
    evidence_uri: "retirement-evidence.json",
    evidence_digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  };
  bindReleaseDigest(release);
  assert.equal(validate(release), true, JSON.stringify(validate.errors));
  assert.deepEqual(solutionReleaseSemanticErrors(release, "release"), []);

  release.retirement_evidence.release_digest = "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  assert.ok(solutionReleaseSemanticErrors(release, "release").some((error) => error.includes("retirement evidence is not bound")));
});

test("rollout strategy constrains traffic semantics", async () => {
  const validate = await schemaValidator("solution-release.schema.json");
  const release = await json("templates/solution-release.json");
  release.rollout.strategy = "canary";
  release.rollout.traffic_percent = 0;
  bindReleaseDigest(release);
  assert.equal(validate(release), false);

  release.rollout.traffic_percent = 10;
  bindReleaseDigest(release);
  assert.equal(validate(release), true, JSON.stringify(validate.errors));
});

test("staged-write idempotency is anchored to a stable business operation", async () => {
  const tool = await json("templates/tool-contract.json");
  assert.deepEqual(toolContractSemanticErrors(tool, "tool"), []);
  tool.execution.idempotency.key_fields = ["tenant_id", "source_revision"];
  assert.ok(toolContractSemanticErrors(tool, "tool")
    .some((error) => error.includes("stable business_operation_id")));
});

test("repository validation rejects release and evaluation integrity bypasses", async (t) => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "production-agent-release-integrity-"));
  const repositoryRoot = path.join(temporaryRoot, "repository");

  try {
    await cp(sourceRoot, repositoryRoot, {
      recursive: true,
      filter(source) {
        const topLevel = path.relative(sourceRoot, source).split(path.sep)[0];
        return ![".git", "coverage", "node_modules", "site-dist"].includes(topLevel);
      },
    });
    await execFileAsync("git", ["init", "--quiet"], { cwd: repositoryRoot });
    await execFileAsync("git", ["add", "--all"], { cwd: repositoryRoot });
    await symlink(path.join(sourceRoot, "node_modules"), path.join(repositoryRoot, "node_modules"), "dir");

    const baseline = await runValidator(repositoryRoot);
    assert.equal(baseline.exitCode, 0, baseline.output);

    const approvedFixture = {
      releaseDirectory: path.join(repositoryRoot, "examples", "invoice-exception"),
    };
    await t.test("the committed review release binds output from the executable runner", async () => {
      const execution = await execFileAsync(process.execPath, ["examples/invoice-exception/run-evals.mjs"], {
        cwd: repositoryRoot,
        maxBuffer: 4 * 1024 * 1024,
      });
      const observed = JSON.parse(execution.stdout);
      const committed = await json("examples/invoice-exception/evaluation-output.json", repositoryRoot);
      assert.equal(observed.status, "passed");
      assert.deepEqual(
        observed.cases.map(({ case_id: caseId, status, tool_calls: toolCalls }) => ({ caseId, status, toolCalls })),
        committed.runner_output.cases.map(({ case_id: caseId, status, tool_calls: toolCalls }) => ({ caseId, status, toolCalls })),
      );
      const result = await runValidator(repositoryRoot);
      assert.equal(result.exitCode, 0, result.output);
    });

    await t.test("raw output must bind aggregate observations and the canonical report summary", async () => {
      const rawPath = path.join(approvedFixture.releaseDirectory, "evaluation-output.json");
      const reportPath = path.join(approvedFixture.releaseDirectory, "evaluation-report.json");
      const releasePath = path.join(approvedFixture.releaseDirectory, "solution-release.json");
      const originals = await Promise.all([rawPath, reportPath, releasePath].map((target) => readFile(target, "utf8")));
      try {
        const rawOutput = JSON.parse(originals[0]);
        rawOutput.results[0].value = 0.99;
        await writeFile(rawPath, `${JSON.stringify(rawOutput, null, 2)}\n`);

        const report = JSON.parse(originals[1]);
        report.evaluator.output.digest = await sha256Path(rawPath);
        await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

        const release = JSON.parse(originals[2]);
        release.artifacts.find((artifact) => artifact.role === "evaluation").digest = await sha256Path(reportPath);
        bindReleaseDigest(release);
        await writeFile(releasePath, `${JSON.stringify(release, null, 2)}\n`);

        const result = await runValidator(repositoryRoot);
        assert.notEqual(result.exitCode, 0, result.output);
        assert.match(result.output, /raw evaluator output does not bind the complete evaluated report/);
      } finally {
        await Promise.all([rawPath, reportPath, releasePath].map((target, index) => writeFile(target, originals[index])));
      }
    });

    await t.test("data context must bind the evaluated agent context contract", async () => {
      await mutateFile(
        repositoryRoot,
        "examples/invoice-exception/solution-release.json",
        transformJson((release) => {
          const dataContext = release.artifacts.find((artifact) => artifact.role === "data_context");
          const userSurface = release.artifacts.find((artifact) => artifact.role === "user_surface");
          Object.assign(dataContext, structuredClone(userSurface), {
            role: "data_context",
            change_summary: "Attempt to substitute an unrelated document for governed context.",
          });
          bindReleaseDigest(release);
        }),
        /data_context artifact does not bind the agent system source, schema, revision, trust, and freshness context/,
      );
    });

    await t.test("unversioned executable artifacts require an explicit null version", async () => {
      await mutateFile(
        repositoryRoot,
        "examples/invoice-exception/evaluation-report.json",
        transformJson((report) => { report.evaluator.runner.version = "9.9.9"; }),
        /evaluator\.runner\.uri version 9\.9\.9 does not match .* version <none>/,
      );
    });

    await t.test("evaluator dependency closure includes local data contracts", async () => {
      await mutateFile(
        repositoryRoot,
        "examples/invoice-exception/evaluation-report.json",
        transformJson((report) => {
          report.system.environment.dependencies = report.system.environment.dependencies
            .filter((dependency) => dependency.component_id !== "trace-event-contract");
        }),
        /evaluator dependency closure omits schemas\/trace-event\.schema\.json/,
      );
    });

    await t.test("grader artifacts cannot be replaced by an input case", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/evaluation-report.json",
        transformJson((report) => {
          report.evaluator.grader.uri = report.suite.fixture_uri;
          report.evaluator.grader.version = report.suite.fixture_revision;
          report.evaluator.grader.schema_version = report.suite.fixture_schema_version;
          report.evaluator.grader.digest = report.suite.fixture_digest;
        }),
        /evaluator\.grader\.uri is not an executable evaluator artifact/,
      );
    });

    await t.test("a review release cannot self-promote candidate capabilities", async () => {
      await mutateFile(
        repositoryRoot,
        "examples/invoice-exception/solution-release.json",
        transformJson((release) => {
          release.release_status = "approved";
          release.approvals = [
            { role: "technical", principal: "technical-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T19:00:00Z" },
            { role: "operational", principal: "operational-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T19:01:00Z" },
            { role: "risk", principal: "risk-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T19:02:00Z" },
            { role: "service", principal: release.rollout.service_owner, bound_release_digest: release.release_digest, approved_at: "2026-08-07T19:03:00Z" },
          ];
          bindReleaseDigest(release);
        }),
        /approved release includes non-approved capability/,
      );
    });

    await t.test("lifecycle evidence must be structured and bound to the release", async () => {
      await mutateFile(
        repositoryRoot,
        "examples/invoice-exception/solution-release.json",
        transformJson((release) => {
          release.deployment_evidence = {
            deployed_at: "2026-08-07T19:00:00Z",
            environment_id: release.compatibility.environment_id,
            release_digest: release.release_digest,
            rollout_strategy: release.rollout.strategy,
            observed_traffic_percent: release.rollout.traffic_percent,
            verification_uri: "../../README.md",
            verification_digest: release.artifacts.find((artifact) => artifact.role === "user_surface").digest,
            source_of_truth_readback: true,
          };
          bindReleaseDigest(release);
        }),
        /review status cannot contain deployment evidence/,
      );
    });

    await t.test("artifact byte digests", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/solution-release.json",
        transformJson((release) => { release.artifacts[0].digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }),
        /artifacts\.0\.digest does not match/,
      );
    });

    await t.test("canonical release digest", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/solution-release.json",
        transformJson((release) => { release.target_segments.push("unbound-segment"); }),
        /release_digest does not match the canonical release payload/,
      );
    });

    await t.test("duplicate JSON object keys", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/solution-release.json",
        (body) => body.replace(
          '  "release_id": "bounded_workflow_release",',
          '  "release_id": "shadowed_release",\n  "release_id": "bounded_workflow_release",',
        ),
        /duplicate object key "release_id"/,
      );
    });

    await t.test("suite byte digest", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/evaluation-report.json",
        transformJson((report) => { report.suite.digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }),
        /suite\.digest does not match/,
      );
    });

    await t.test("evaluated system version", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/evaluation-report.json",
        transformJson((report) => { report.system.system_version = "9.9.9"; }),
        /system\.system_version 9\.9\.9 does not match/,
      );
    });

    await t.test("accepted evaluation gate", async () => {
      await mutateFile(
        repositoryRoot,
        "templates/solution-release.json",
        transformJson((release) => {
          release.release_status = "approved";
          release.approvals = [
            { role: "technical", principal: "technical-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:00:00Z" },
            { role: "operational", principal: "operational-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:01:00Z" },
            { role: "risk", principal: "risk-approver", bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:02:00Z" },
            { role: "service", principal: release.rollout.service_owner, bound_release_digest: release.release_digest, approved_at: "2026-08-07T17:03:00Z" },
          ];
        }),
        /approved release requires an accepted evaluation report/,
      );
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
