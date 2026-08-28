import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function read(repositoryPath) {
  return readFile(path.join(root, repositoryPath), "utf8");
}

test("Uber operating evidence is dated, cataloged, bounded, and reachable", async () => {
  const [research, index, sourceIndex, catalogText] = await Promise.all([
    read("research/2026-08-28--uber-production-ai-operating-lessons.md"),
    read("research/README.md"),
    read("library/05-source-index.md"),
    read("catalog.json"),
  ]);

  for (const id of ["R26-77", "R26-78", "R26-79", "R26-80"]) {
    assert.match(research, new RegExp(`## ${id} —`));
    assert.match(research, new RegExp(`<a id="${id.toLowerCase()}"></a>`));
  }
  for (const url of [
    "https://www.uber.com/us/en/blog/efficient-software-factory/",
    "https://www.uber.com/us/en/blog/scaling-real-time-traffic/",
    "https://www.uber.com/us/en/blog/ubers-file-analyzer/",
    "https://www.uber.com/us/en/blog/solving-the-agent-identity-crisis/",
  ]) assert.ok(research.includes(url), url);

  assert.match(research, /first-party measurements from its own workloads and infrastructure/i);
  assert.match(research, /not portable defaults/i);
  assert.match(research, /not required technologies/i);
  assert.match(index, /2026-08-28--uber-production-ai-operating-lessons\.md/);
  assert.match(sourceIndex, /## S27 — Uber: production AI operating reports/);

  const artifact = JSON.parse(catalogText).artifacts.find(({ path: artifactPath }) => (
    artifactPath === "research/2026-08-28--uber-production-ai-operating-lessons.md"
  ));
  assert.equal(artifact?.id, "evidence.uber-production-ai-operating-lessons");
});

test("service economics keeps accepted outcome primary and explains causal agent-work drivers", async () => {
  const [value, review, monitoring, changes] = await Promise.all([
    read("library/11-value-engineering-and-frugal-architecture.md"),
    read("templates/production-service-review.md"),
    read("operations/behavior-monitoring.md"),
    read("operations/change-management.md"),
  ]);
  const equation = /users × sessions\/user × turns\/session × requests\/turn × tokens\/request × price\/token/;
  for (const body of [value, monitoring]) assert.match(body, equation);
  for (const body of [value, review, monitoring]) assert.match(body, /cost per accepted outcome/i);
  for (const signal of [
    "repeated searching",
    "unnecessary turns",
    "oversized tool results",
    "model-visible polling",
    "unused tool schemas",
  ]) assert.match(`${review}\n${monitoring}`, new RegExp(signal, "i"));
  assert.match(changes, /hold the model and representative workload constant/i);
  assert.match(changes, /Pareto frontier/i);
  assert.match(monitoring, /MUST NOT directly rewrite prompts, skills, labels, graders, policies, thresholds, or deployed code/);
});

test("hybrid systems bind direct and downstream contracts plus semantic review boundaries", async () => {
  const [selection, hybrid, secure, changes] = await Promise.all([
    read("templates/intelligence-selection-record.md"),
    read("blueprints/hybrid-intelligence-system.md"),
    read("solutions/secure-ai-workload.md"),
    read("operations/change-management.md"),
  ]);
  for (const body of [selection, hybrid, changes]) {
    assert.match(body, /direct (?:component|contract)/i);
    assert.match(body, /downstream (?:product|contract)/i);
  }
  for (const phrase of [
    "sandboxed parse / OCR / normalization",
    "supporting spans",
    "typed abstention",
    "false-positive",
    "false-negative",
    "polyglot",
    "decompression",
    "indirect-injection",
  ]) assert.match(secure, new RegExp(phrase.replaceAll("/", "\\/"), "i"));
  assert.match(secure, /explanation helps an analyst inspect the proposal but is not evidence/i);
  assert.match(secure, /do not directly rewrite prompts, policies, labels, graders, thresholds, or deployed behavior/i);
});

test("delegated authority preserves verifiable per-hop identity and has fail-closed cases", async () => {
  const [controlsText, architecture, platform, coordinator, governanceTests] = await Promise.all([
    read("controls/control-catalog.json"),
    read("library/03-agent-system-architecture.md"),
    read("blueprints/enterprise-agent-platform.md"),
    read("blueprints/multi-agent-coordinator.md"),
    read("tests/governance-contracts.test.mjs"),
  ]);
  const controls = JSON.parse(controlsText).controls;
  const delegated = controls.find(({ id }) => id === "IAM-002");
  assert.match(delegated?.requirement ?? "", /caller, workload, logical-agent, and recipient attribution/);
  assert.match(delegated?.requirement ?? "", /missing, invalid, stale, truncated, replayed, revoked, or widened/);
  assert.ok(delegated?.evidence.includes("R26-80"));

  const combined = `${architecture}\n${platform}\n${coordinator}`;
  for (const caseName of [
    "initiating caller",
    "hosting workload",
    "logical agent",
    "wrong recipient",
    "replayed",
    "expired",
    "revoked",
    "truncated lineage",
    "scope expansion",
  ]) assert.match(combined, new RegExp(caseName.replace(" ", "[- ]"), "i"));
  assert.match(governanceTests, /handoffs cannot widen authority, reset budget, overflow depth, or expire/);
  assert.match(governanceTests, /rejects invented parents and replays by handoff ID or nonce/);
  assert.match(governanceTests, /authenticates the exact current recipient before atomic claim/);
});
