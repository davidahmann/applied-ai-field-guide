import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { pages } from "../site/site.config.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const chapterPath = path.join(root, "library", "17-enterprise-integration-and-scale-reality.md");

test("enterprise deployment guidance opens every material seam without inventing a universal stack", async () => {
  const body = await readFile(chapterPath, "utf8");
  for (const section of [
    "## Start with the enterprise seam",
    "## Observe the path, not only the schema",
    "## Treat legacy integration as product behavior",
    "## Hostile worked scenario: the missing order hold",
    "## Map teaching components to production responsibilities",
    "## Evidence required at the target boundary",
    "## Decide what remains local and what should compound",
    "## What this does not prove",
  ]) assert.ok(body.includes(section), section);

  for (const seam of [
    "Source authority",
    "Extraction",
    "Preparation",
    "Identity and policy",
    "Execution",
    "Environment and operation",
  ]) assert.match(body, new RegExp(`\\| ${seam.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")} \\|`));

  for (const responsibility of [
    "Durable business and workflow state",
    "service-enforced idempotency",
    "row- and column-filter bypass attempts",
    "append-only or tamper-evident retention",
    "restricted-environment promotion",
    "receiving-team operation",
  ]) assert.match(body, new RegExp(responsibility, "i"));

  assert.match(body, /Queues, caches, distributed workers, row-level security, column-level security, and immutable audit storage are not mandatory by category/i);
  assert.match(body, /fictional scenario is a practice case, not a benchmark or customer claim/i);
  assert.doesNotMatch(body, /70\s*%|seventy percent/i);
});

test("enterprise deployment guidance cites only governed controls and routes to existing foundations", async () => {
  const [body, controlsText] = await Promise.all([
    readFile(chapterPath, "utf8"),
    readFile(path.join(root, "controls", "control-catalog.json"), "utf8"),
  ]);
  const knownControls = new Set(JSON.parse(controlsText).controls.map((control) => control.id));
  const citedControls = new Set(body.match(/\b[A-Z]{3}-\d{3}\b/g) ?? []);
  assert.ok(citedControls.size >= 15);
  for (const controlId of citedControls) assert.ok(knownControls.has(controlId), `unknown control ${controlId}`);

  for (const target of [
    "../solutions/integration-runtime.md",
    "../solutions/enterprise-foundation.md",
    "../solutions/deployment-and-operations.md",
    "../templates/production-service-readiness.md",
    "../templates/data-context-manifest.json",
  ]) assert.ok(body.includes(target), target);
});

test("the production boundary is visible from human, agent, solution, example, and web routes", async () => {
  const documents = await Promise.all([
    "README.md",
    "guide/README.md",
    "library/00-start-here.md",
    "AGENTS.md",
    "llms.txt",
    "solutions/integration-runtime.md",
    "solutions/enterprise-foundation.md",
    "templates/production-service-readiness.md",
    "examples/invoice-exception/README.md",
    "examples/shipment-risk-triage/README.md",
  ].map((file) => readFile(path.join(root, file), "utf8")));
  for (const body of documents) assert.match(body, /17-enterprise-integration-and-scale-reality\.md/);

  const page = pages.find(({ source }) => source === "library/17-enterprise-integration-and-scale-reality.md");
  assert.equal(page?.route, "/enterprise-ai-integration/");
  assert.match(page?.title ?? "", /Enterprise AI Integration/);
});

test("teaching examples state the exact production responsibilities they do not prove", async () => {
  for (const file of [
    path.join(root, "examples", "invoice-exception", "README.md"),
    path.join(root, "examples", "shipment-risk-triage", "README.md"),
  ]) {
    const body = await readFile(file, "utf8");
    assert.match(body, /## Teaching-to-production boundary/);
    assert.match(body, /durable/i);
    assert.match(body, /authorization/i);
    assert.match(body, /audit/i);
    assert.match(body, /reconcil/i);
    assert.match(body, /load/i);
    assert.match(body, /production service readiness/i);
  }
});

test("agentic operating maturity is evidence-led rather than topology-led", async () => {
  const [research, index, sourceIndex, chapter, capabilities, coordinator, catalogText] = await Promise.all([
    readFile(path.join(root, "research", "2026-08-26--agentic-operating-maturity-field-report.md"), "utf8"),
    readFile(path.join(root, "research", "README.md"), "utf8"),
    readFile(path.join(root, "library", "05-source-index.md"), "utf8"),
    readFile(chapterPath, "utf8"),
    readFile(path.join(root, "operations", "capability-supply-chain.md"), "utf8"),
    readFile(path.join(root, "blueprints", "multi-agent-coordinator.md"), "utf8"),
    readFile(path.join(root, "catalog.json"), "utf8"),
  ]);

  assert.match(research, /<a id="r26-83"><\/a>/);
  assert.match(research, /https:\/\/x\.com\/mardehaym\/status\/2092516152274554891/);
  for (const rejectedDefault of ["seven steps", "knowledge graphs", "90-day", "LLM handoff", "not portable"]) {
    assert.match(research, new RegExp(rejectedDefault, "i"));
  }
  assert.match(index, /2026-08-26--agentic-operating-maturity-field-report\.md/);
  assert.match(sourceIndex, /## S30 — Mark Ajzenstadt/);
  assert.match(chapter, /developer laptop is a valid development surface, not evidence of an unattended service/i);
  assert.match(chapter, /maturity comes from accepted outcomes and exercised operating evidence/i);
  assert.match(capabilities, /inactivity may trigger this review; they are not universal retirement thresholds/i);
  assert.match(capabilities, /MUST NOT retain unowned active credentials/);
  assert.match(coordinator, /Operational evidence precedes topology/);
  assert.match(coordinator, /not authorization, deterministic merge policy, source-of-truth verification, or independent proof/i);

  const artifact = JSON.parse(catalogText).artifacts.find(({ path: artifactPath }) => (
    artifactPath === "research/2026-08-26--agentic-operating-maturity-field-report.md"
  ));
  assert.equal(artifact?.id, "evidence.agentic-operating-maturity");
});
