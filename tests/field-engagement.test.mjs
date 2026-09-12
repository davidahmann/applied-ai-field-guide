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

test("the shared handbook requires a reframe only for a material contradiction", async () => {
  const handbook = await readFile(path.join(root, "playbooks", "README.md"), "utf8");
  const stage = handbook.split("\n").find((line) => line.startsWith("| Understand and reframe if needed |"));
  const packet = handbook.split("\n").find((line) => line.startsWith("| [Engagement-reframe record]"));
  assert.ok(stage && packet, "both lifecycle and working-packet routes must remain present");
  assert.match(stage, /add an engagement-reframe record.*when a material contradiction/i);
  assert.match(packet, /when evidence materially contradicts the brief/i);
  assert.match(packet, /do not create a conflict for an otherwise valid brief/i);
});

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

  const adoption = bodies[4];
  for (const phrase of [
    "What the adoption path would have to prove",
    "Friction hypotheses to test",
    "How a pilot result would be diagnosed",
    "These are test questions, not findings",
    "This table is predeclared planning logic. It contains no observed pilot result.",
  ]) assert.match(adoption, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  for (const stage of ["Eligible opportunity", "Exposed in the review surface", "Completed or dispositioned", "Independently accepted", "Sustained net value"]) {
    assert.match(adoption, new RegExp(stage, "i"));
  }
});

test("the repository keeps one canonical engagement chain instead of duplicating examples for symmetry", async () => {
  const [maintenance, shipment] = await Promise.all([
    readFile(path.join(root, "docs", "maintainers", "repository-maintenance.md"), "utf8"),
    readFile(path.join(root, "examples", "shipment-risk-triage", "README.md"), "utf8"),
  ]);
  assert.match(maintenance, /one canonical end-to-end worked engagement/i);
  assert.match(maintenance, /implementation reference does not need a parallel engagement chain merely for symmetry/i);
  assert.doesNotMatch(shipment, /engagement\/adoption-and-handoff\.md/);
});

test("discovery tests the inherited story against direct technical evidence", async () => {
  const [playbook, discovery, synthesis, research] = await Promise.all([
    readFile(path.join(root, "playbooks", "01-discovery-and-value.md"), "utf8"),
    readFile(path.join(root, "templates", "discovery-pack.md"), "utf8"),
    readFile(path.join(root, "library", "10-applied-ai-delivery-and-operating-model.md"), "utf8"),
    readFile(path.join(root, "research", "2026-08-08--operational-redesign-and-applied-ai-practice.md"), "utf8"),
  ]);

  for (const body of [playbook, discovery]) {
    assert.match(body, /Technical reality check|Check the technical reality directly/i);
    assert.match(body, /code or configuration/i);
    assert.match(body, /data pipeline/i);
    assert.match(body, /identity, permission/i);
    assert.match(body, /representative execution/i);
    assert.match(body, /questionnaire/i);
    assert.match(body, /maturity score/i);
  }
  assert.match(playbook, /keep the claim `unknown`/i);
  assert.match(synthesis, /Interview assistants, voice capture, transcript extraction, prototype generation, and automated feedback summaries/i);
  assert.match(synthesis, /do not replace observation, operator validation, conflict resolution, source authority, or the scoped human disposition/i);
  assert.match(research, /No new lifecycle, score, module, or control family is created/i);
});

test("discovery reconciles strategy, operating reality, and the candidate value surface", async () => {
  const [playbook, discovery, sourceIndex, research] = await Promise.all([
    readFile(path.join(root, "playbooks", "01-discovery-and-value.md"), "utf8"),
    readFile(path.join(root, "templates", "discovery-pack.md"), "utf8"),
    readFile(path.join(root, "library", "05-source-index.md"), "utf8"),
    readFile(path.join(root, "research", "2026-08-08--operational-redesign-and-applied-ai-practice.md"), "utf8"),
  ]);

  for (const body of [playbook, discovery]) {
    assert.match(body, /strategic and operating apertures/i);
    assert.match(body, /customer-visible interaction/i);
    assert.match(body, /internal enablement/i);
    assert.match(body, /cost or capacity/i);
    assert.match(body, /risk and control/i);
    assert.match(body, /not (?:a )?(?:universal priority rule|fixed interview script)/i);
  }
  assert.match(playbook, /surveys and transcripts may stage hypotheses/i);
  assert.match(playbook, /customer visibility is a useful candidate-generation lens, not a universal priority rule/i);
  assert.match(discovery, /do not treat executive sponsorship, interview volume, a survey, or a roadmap as proof/i);
  assert.match(sourceIndex, /## S36 — Alex Lieberman: AI roadmap field account/);
  assert.match(sourceIndex, /## S37 — Mark Ajzenstadt: customer-interaction use-case lens/);
  assert.match(research, /requiring a customer-visible use case first/i);
});

test("field interactions close through an isolated reviewed append loop and a derived readout", async () => {
  const [playbook, observation, discovery, serviceReview, example, research] = await Promise.all([
    readFile(path.join(root, "playbooks", "00-field-engagement-and-reframing.md"), "utf8"),
    readFile(path.join(root, "templates", "field-observation-log.md"), "utf8"),
    readFile(path.join(root, "templates", "discovery-pack.md"), "utf8"),
    readFile(path.join(root, "templates", "production-service-review.md"), "utf8"),
    readFile(path.join(root, "examples", "invoice-exception", "engagement", "README.md"), "utf8"),
    readFile(path.join(root, "research", "2026-08-30--fde-interaction-workflow-ergonomics.md"), "utf8"),
  ]);

  for (const phrase of [
    "Keep one engagement boundary",
    "Stage the source record",
    "Propose the changes",
    "Preview and confirm",
    "Append a receipt",
    "does not prove the claim, grant authority, or accept a reframe",
  ]) assert.match(playbook, new RegExp(phrase, "i"));
  for (const body of [playbook, observation, discovery]) {
    assert.match(body, /engagement (?:id|boundary)/i);
    assert.match(body, /retention/i);
  }
  assert.match(observation, /Post-interaction capture receipt/);
  assert.match(observation, /Confirm \/ correct \/ reject \/ defer/);
  assert.match(serviceReview, /Current sponsor readout/);
  assert.match(serviceReview, /projection, not a new source of truth, approval, or acceptance record/i);
  assert.match(example, /Ten-minute walkthrough/);
  for (const minute of ["0–2", "2–4", "4–6", "6–8", "8–10"]) assert.ok(example.includes(minute), minute);
  assert.match(research, /R26-84/);
  assert.match(research, /do not build another FDE workspace, router, CLI, storage convention, lifecycle, or trust-score system/i);

  const combined = [playbook, observation, discovery, serviceReview].join("\n");
  assert.doesNotMatch(combined, /~\/.fde|\.fde\/clients|21-day|trust traffic light|@fde\b/i);
});
