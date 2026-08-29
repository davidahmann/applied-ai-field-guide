import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { engagementReframeSemanticErrors } from "../scripts/governance-invariants.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("the canonical and worked engagement reframes are structurally and semantically valid", async () => {
  const schema = await json("schemas/engagement-reframe.schema.json");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  for (const relativePath of ["templates/engagement-reframe.json", "examples/invoice-exception/engagement/engagement-reframe.json"]) {
    const record = await json(relativePath);
    assert.equal(validate(record), true, `${relativePath}: ${JSON.stringify(validate.errors)}`);
    assert.deepEqual(engagementReframeSemanticErrors(record, relativePath), []);
  }
});

test("a disposition cannot be inferred from sponsorship or an unverified actor", async () => {
  const record = await json("templates/engagement-reframe.json");
  record.disposition.actor = record.roles.sponsor.identity;
  record.roles.disposition_authority.status = "unverified";
  const errors = engagementReframeSemanticErrors(record);
  assert.ok(errors.some((error) => error.includes("without verified disposition authority")));
  assert.ok(errors.some((error) => error.includes("not the named disposition authority")));
});

test("accepted reframes fail closed when conflict, references, or dependency lineage are incomplete", async () => {
  const record = await json("templates/engagement-reframe.json");
  record.conflicts[0].state = "open";
  record.conflicts[0].claim_ids.push("missing_claim");
  record.downstream_impacts[0].depends_on_claim_ids = [];
  const errors = engagementReframeSemanticErrors(record);
  assert.ok(errors.some((error) => error.includes("unknown claim missing_claim")));
  assert.ok(errors.some((error) => error.includes("remains open")));
  assert.ok(errors.some((error) => error.includes("without a claim dependency")));
});

test("unrelated downstream state remains explicitly unchanged", async () => {
  const record = await json("examples/invoice-exception/engagement/engagement-reframe.json");
  const unchanged = record.downstream_impacts.filter((impact) => impact.action === "no_change");
  assert.deepEqual(unchanged.map((impact) => impact.artifact_id), ["data_context_manifest"]);
  assert.deepEqual(unchanged[0].depends_on_claim_ids, []);
});

test("the invoice engagement preserves one navigable evidence chain without overstating production proof", async () => {
  const files = [
    "README.md",
    "field-evidence.md",
    "value-case.md",
    "intelligence-selection.md",
    "adoption-and-handoff.md",
    "service-review.md",
  ];
  const bodies = await Promise.all(files.map((name) => readFile(path.join(root, "examples", "invoice-exception", "engagement", name), "utf8")));
  const combined = bodies.join("\n");
  for (const phrase of [
    "field-evidence.md",
    "engagement-reframe.json",
    "value-case.md",
    "intelligence-selection.md",
    "adoption-and-handoff.md",
    "service-review.md",
    "continue as a review-only shadow candidate",
    "handoff_blocked",
    "no realized customer value",
  ]) assert.ok(combined.toLowerCase().includes(phrase.toLowerCase()), `worked engagement omits ${phrase}`);

  const valueCase = bodies[2];
  assert.match(valueCase, /500 × 60% = 300/);
  assert.match(valueCase, /\$1,000 \/ 240 = \$4\.17/);
  assert.match(valueCase, /Every number is illustrative/);
});
