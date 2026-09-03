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

test("company agent adoption centralizes rails without centralizing workflow authority", async () => {
  const [playbook, portfolioReview, serviceReview, operations, skill, research] = await Promise.all([
    read("playbooks/03-operate-and-scale.md"),
    read("templates/fde-portfolio-review.md"),
    read("templates/production-service-review.md"),
    read("operations/README.md"),
    read(".agents/skills/operate-ai-service/SKILL.md"),
    read("research/2026-08-08--operational-redesign-and-applied-ai-practice.md"),
  ]);

  for (const phrase of [
    "AI-enabled services, not a headcount of agents",
    "Centralize reusable rails",
    "Preserve workflow accountability",
    "Earn authority by effect class",
  ]) assert.match(playbook, new RegExp(phrase, "i"));

  for (const role of [
    "Executive sponsor or program owner",
    "Workflow owner",
    "Business metric owner and independent verifier",
    "AI service owner",
    "Operational owner",
    "Shared platform owner",
    "Data, policy, security, or risk owner",
    "Delivery or FDE team",
    "Operator or reviewer",
  ]) assert.match(`${playbook}\n${portfolioReview}`, new RegExp(role, "i"));

  assert.match(portfolioReview, /Stop \/ reshape \/ continue proving \/ bounded production/);
  for (const gate of ["Technical performance", "Operator acceptance", "Adoption", "Business value", "Full economics", "Production readiness"]) {
    assert.match(portfolioReview, new RegExp(`\\| ${gate} \\|`, "i"));
  }
  assert.match(portfolioReview, /no universal 30-day production promise/i);
  assert.match(`${playbook}\n${portfolioReview}\n${skill}`, /every applicable mandatory gate (?:to )?pass/i);
  assert.match(`${playbook}\n${portfolioReview}\n${skill}`, /non-blocking residual/i);
  assert.match(`${playbook}\n${portfolioReview}`, /does not prove receiving-team capability|substitute for exercised receiving-team capability/i);
  assert.match(serviceReview, /Receiving-team operating capability/);
  assert.match(operations, /shared-versus-workflow capability boundary/i);
  assert.match(skill, /shared enablement, workflow-local accountability, and temporary delivery capacity/i);
  assert.match(research, /thirty-feature list/i);
  assert.match(research, /single centralized intelligence layer/i);
});

test("system design follows the complete operating path without adopting a layer-count heuristic", async () => {
  const [architecture, blueprint, readiness, skill, research] = await Promise.all([
    read("library/12-software-architecture-and-intelligence-selection.md"),
    read("blueprints/hybrid-intelligence-system.md"),
    read("templates/production-service-readiness.md"),
    read(".agents/skills/design-production-ai-system/SKILL.md"),
    read("research/2026-08-08--operational-redesign-and-applied-ai-practice.md"),
  ]);

  for (const phrase of [
    "initiating actor",
    "applicable scope",
    "durable result destination",
    "bounded orchestration and state",
    "governed context",
    "evaluation, abstention, and escalation",
  ]) assert.match(`${architecture}\n${blueprint}\n${readiness}\n${skill}`, new RegExp(phrase, "i"));

  assert.match(research, /not a seven-layer maturity model/i);
  assert.match(research, /“80%” context claim/i);
  assert.match(research, /private model instance per tenant/i);
});

test("workflow proofs and deployment qualification stay bounded and operational", async () => {
  const [research, index, sourceIndex, catalogText, delivery, discovery, operations, evaluation, changes, readiness, serviceReview, schemaText, skill] = await Promise.all([
    read("research/2026-09-03--workflow-proof-and-deployment-qualification.md"),
    read("research/README.md"),
    read("library/05-source-index.md"),
    read("catalog.json"),
    read("templates/delivery-and-adoption-plan.md"),
    read("playbooks/01-discovery-and-value.md"),
    read("playbooks/03-operate-and-scale.md"),
    read("library/09-evaluation-corpus-and-review-loops.md"),
    read("operations/change-management.md"),
    read("templates/production-service-readiness.md"),
    read("templates/production-service-review.md"),
    read("schemas/evaluation-report.schema.json"),
    read(".agents/skills/build-ai-evaluation/SKILL.md"),
  ]);

  for (const id of ["R26-85", "R26-86"]) {
    assert.match(research, new RegExp(`## ${id} —`));
  }
  assert.match(research, /<a id="r26-85"><\/a>/);
  assert.match(research, /<a id="r26-86"><\/a>/);
  assert.match(research, /not Guide defaults/i);
  assert.match(research, /No new skill, module, maturity ladder, or control family/i);
  assert.match(index, /workflow-proof-and-deployment-qualification\.md/);
  assert.match(sourceIndex, /## S38 — Scale AI: READY deployment qualification/);
  assert.match(sourceIndex, /## S39 — Mark Ajzenstadt: AI transformation loop/);
  const artifact = JSON.parse(catalogText).artifacts.find(({ path: artifactPath }) => (
    artifactPath === "research/2026-09-03--workflow-proof-and-deployment-qualification.md"
  ));
  assert.equal(artifact?.id, "evidence.workflow-proof-deployment-qualification");

  for (const phrase of [
    "Proof participation and decision capacity",
    "Baseline acknowledgment",
    "Proof-work ledger",
  ]) assert.match(delivery, new RegExp(phrase, "i"));
  assert.match(`${discovery}\n${operations}`, /decision instrument/i);
  assert.match(`${delivery}\n${operations}`, /decision, tested assumption, working increment, or sanitized reusable learning/i);
  assert.match(`${delivery}\n${operations}`, /exact version and prior scope/i);

  for (const phrase of [
    "lower confidence bound",
    "human-review burden",
    "reviewer effectiveness",
    "terminal trajectories",
    "policy in the loop",
  ]) assert.match(`${evaluation}\n${changes}\n${readiness}\n${serviceReview}\n${skill}`, new RegExp(phrase, "i"));
  assert.match(readiness, /Evaluation and human-AI deployment qualification/);
  assert.match(serviceReview, /Human-AI deployment qualification/);
  const schema = JSON.parse(schemaText);
  assert.equal(schema.properties.schema_version.const, "1.1.0");
  assert.ok(schema.properties.deployment_qualification);
});
