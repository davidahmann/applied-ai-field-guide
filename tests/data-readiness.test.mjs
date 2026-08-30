import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { dataContextManifestSemanticErrors } from "../scripts/governance-invariants.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readJson = async (repositoryPath) => JSON.parse(await readFile(path.join(root, repositoryPath), "utf8"));
const readText = async (repositoryPath) => readFile(path.join(root, repositoryPath), "utf8");

const manifest = await readJson("templates/data-context-manifest.json");
const invoiceManifest = await readJson("examples/invoice-exception/data-context-manifest.json");
const schema = await readJson("schemas/data-context-manifest.schema.json");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

test("the canonical data-context manifest is structurally and semantically valid", () => {
  assert.equal(validate(manifest), true, JSON.stringify(validate.errors));
  assert.deepEqual(dataContextManifestSemanticErrors(manifest), []);
});

test("the transactional reference carries an operable data-context contract", () => {
  assert.equal(validate(invoiceManifest), true, JSON.stringify(validate.errors));
  assert.deepEqual(dataContextManifestSemanticErrors(invoiceManifest), []);
  assert.equal(invoiceManifest.status, "conditionally_ready");
  assert.equal(invoiceManifest.decision.disposition, "constrain");
  assert.ok(invoiceManifest.quality_contract.unresolved_conditions.length > 0);
  assert.deepEqual(
    invoiceManifest.data_planes.map(({ plane_id }) => plane_id).sort(),
    ["evaluation_training", "knowledge_context", "operational", "telemetry_feedback"],
  );
  assert.ok(invoiceManifest.label_contracts.length > 0);
  assert.ok(invoiceManifest.operations.monitors.length >= 2);
});

test("model and agent releases bind an exact data-context manifest", async () => {
  const releases = await Promise.all([
    readJson("templates/solution-release.json"),
    readJson("examples/invoice-exception/solution-release.json"),
  ]);
  for (const release of releases) {
    const contextArtifact = release.artifacts.find(({ role }) => role === "data_context");
    assert.ok(contextArtifact, `${release.release_id} omits data_context`);
    assert.match(contextArtifact.uri, /data-context-manifest\.json$/);
    assert.equal(contextArtifact.schema_version, "1.0.0");
    assert.match(contextArtifact.digest, /^sha256:[a-f0-9]{64}$/);
  }
});

test("all four data planes are explicit and membership is bidirectional", () => {
  const candidate = structuredClone(manifest);
  candidate.data_planes[0].source_ids = ["decision_policy"];
  assert.match(dataContextManifestSemanticErrors(candidate).join("\n"), /disagree on membership|not registered by plane/);
});

test("preparation inputs must resolve in source or preceding-output order", () => {
  const candidate = structuredClone(manifest);
  candidate.preparation.steps[0].inputs = ["future_output"];
  assert.match(dataContextManifestSemanticErrors(candidate).join("\n"), /unavailable input future_output/);
});

test("label authority is independent and source-bound", () => {
  const candidate = structuredClone(manifest);
  candidate.label_contracts.push({
    label_id: "accepted_case",
    definition: "Source-bound accepted result",
    source_id: "missing_suite",
    owner: "same-person",
    independent_approver: "same-person",
    source_revision: "suite-1",
    adjudication: "Independent disagreement review",
    agreement_measure: "Pairwise agreement",
    reviewed_at: "2026-08-12T12:00:00Z",
  });
  const errors = dataContextManifestSemanticErrors(candidate).join("\n");
  assert.match(errors, /unknown source missing_suite/);
  assert.match(errors, /self-approved/);
});

test("ready status requires measured critical quality, coverage, approvals, and no open conditions", () => {
  const candidate = structuredClone(manifest);
  candidate.status = "ready";
  candidate.decision.disposition = "continue";
  const errors = dataContextManifestSemanticErrors(candidate).join("\n");
  assert.match(errors, /lacks passing completeness evidence/);
  assert.match(errors, /cannot be ready with unresolved conditions/);
  assert.match(errors, /lacks passing coverage evidence/);
});

test("operating monitors and economic decisions resolve to governed sources and options", () => {
  const candidate = structuredClone(manifest);
  candidate.operations.monitors[0].source_id = "missing_source";
  candidate.economics.selected_option = "missing_option";
  const errors = dataContextManifestSemanticErrors(candidate).join("\n");
  assert.match(errors, /monitor .* unknown source missing_source/);
  assert.match(errors, /selects unknown economic option missing_option/);
});

test("compiled context guidance is source-bounded, privacy-tested, and change-aware", async () => {
  const [research, index, sourceIndex, blueprint, library, monitoring, changes, catalogText] = await Promise.all([
    readText("research/2026-08-18--healthcare-claims-context-and-evaluation.md"),
    readText("research/README.md"),
    readText("library/05-source-index.md"),
    readText("blueprints/data-preparation-and-context-pipeline.md"),
    readText("library/16-data-readiness-and-context-contracts.md"),
    readText("operations/behavior-monitoring.md"),
    readText("operations/change-management.md"),
    readText("catalog.json"),
  ]);

  assert.match(research, /<a id="r26-82"><\/a>/);
  assert.match(research, /https:\/\/x\.com\/mardehaym\/status\/2089648072217243780/);
  for (const claim of ["seven agents", "34 variables", "59-of-60", "zero-patient-data-exposure"]) {
    assert.match(research, new RegExp(claim, "i"));
  }
  assert.match(research, /self-reported/i);
  assert.match(research, /not portable targets/i);
  assert.match(index, /2026-08-18--healthcare-claims-context-and-evaluation\.md/);
  assert.match(sourceIndex, /## S29 — Mark Ajzenstadt/);

  for (const body of [blueprint, library]) {
    assert.match(body, /compiled context packet/i);
    assert.match(body, /runtime projection/i);
    assert.match(body, /not .*authority/i);
  }
  for (const body of [blueprint, library, monitoring, changes]) {
    assert.match(body, /primary, retry, fallback, and provider[- ]failover/i);
    assert.match(body, /logs, traces, (?:(?:and|or) )?caches/i);
  }
  assert.match(changes, /enrichment/);
  assert.match(changes, /payer rule/);
  assert.match(changes, /aggregate pass count cannot overrule a blocking slice/i);
  assert.match(monitoring, /final serialized request/i);

  const artifact = JSON.parse(catalogText).artifacts.find(({ path: artifactPath }) => (
    artifactPath === "research/2026-08-18--healthcare-claims-context-and-evaluation.md"
  ));
  assert.equal(artifact?.id, "evidence.healthcare-claims-context-evaluation");
});
