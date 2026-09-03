import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function read(repositoryPath) {
  return readFile(path.join(root, repositoryPath), "utf8");
}

test("Warp software-factory evidence is dated, cataloged, bounded, and reachable", async () => {
  const [research, index, sourceIndex, catalogText] = await Promise.all([
    read("research/2026-08-28--warp-self-improving-software-factories.md"),
    read("research/README.md"),
    read("library/05-source-index.md"),
    read("catalog.json"),
  ]);

  assert.match(research, /<a id="r26-81"><\/a>/);
  assert.match(research, /## R26-81 — Warp:/);
  assert.match(
    research,
    /\[Closing the loop with self-improving cloud software factories\]\(https:\/\/www\.warp\.dev\/blog\/agent-self-improving-software-factories\)/,
  );
  assert.match(research, /vendor-authored product and engineering article/i);
  assert.match(research, /not an independently reproducible benchmark/i);
  assert.match(index, /2026-08-28--warp-self-improving-software-factories\.md/);
  assert.match(sourceIndex, /## S28 — Warp: self-improving software factories/);

  const artifact = JSON.parse(catalogText).artifacts.find(({ path: artifactPath }) => (
    artifactPath === "research/2026-08-28--warp-self-improving-software-factories.md"
  ));
  assert.equal(artifact?.id, "evidence.warp-software-factory-improvement");
});

test("closed-loop improvement binds an exact release graph and protected authorities", async () => {
  const [governance, improvement, changes, synthesis] = await Promise.all([
    read("library/04-production-evaluation-and-governance.md"),
    read("blueprints/controlled-improvement-agent.md"),
    read("operations/change-management.md"),
    read("library/10-applied-ai-delivery-and-operating-model.md"),
  ]);
  const combined = `${governance}\n${improvement}\n${changes}`;

  for (const component of [
    "workflow topology",
    "model route",
    "admitted skills and capabilities",
    "tools and MCP",
    "evaluator",
    "permissions",
    "resource budgets",
    "environment",
  ]) assert.match(combined, new RegExp(component, "i"));

  assert.match(governance, /must not become a second source of truth/i);
  assert.match(improvement, /MUST NOT modify the protected benchmark, grader, threshold, holdout, CI result, approval, merge, deployment, or rollback evidence/);
  assert.match(synthesis, /keeps proposal, evaluation, approval, deployment, and rollback authority separate/i);
});

test("scorers and configuration benchmarks remain governed evaluation evidence", async () => {
  const [monitoring, improvement, changes, review] = await Promise.all([
    read("operations/behavior-monitoring.md"),
    read("blueprints/controlled-improvement-agent.md"),
    read("operations/change-management.md"),
    read("templates/production-service-review.md"),
  ]);
  const scorerEvidence = `${monitoring}\n${improvement}\n${review}`;
  for (const field of [
    "eligible population",
    "sampling",
    "rubric",
    "label or reference authority",
    "uncertainty",
    "calibration",
    "disagreement",
    "cost",
  ]) assert.match(scorerEvidence, new RegExp(field, "i"));

  assert.match(scorerEvidence, /human interaction is evidence.*not anonymous ground truth/is);
  assert.match(monitoring, /MUST NOT grant action authority/);
  assert.match(improvement, /same representative tasks, frozen world and policy revisions, resource ceilings, scorer versions, trial rules, and acceptance criteria/i);
  assert.match(changes, /current and candidate release graphs/i);
  assert.match(changes, /agent-authored diff remains a candidate/i);
});

test("deployment and topology choices stay evidence-driven rather than categorical", async () => {
  const [enterprise, synthesis, research] = await Promise.all([
    read("library/17-enterprise-integration-and-scale-reality.md"),
    read("library/10-applied-ai-delivery-and-operating-model.md"),
    read("research/2026-08-28--warp-self-improving-software-factories.md"),
  ]);

  assert.match(enterprise, /Those are requirements; “cloud” is not/);
  assert.match(enterprise, /API-first is not an authority model/);
  assert.match(enterprise, /Public cloud, private cloud, VPC, on-premises, hybrid, restricted-network, and local development paths/);
  assert.match(synthesis, /not a reason to prescribe cloud deployment, API-only operation, multiple models, multiple agents, or automation percentage/i);
  assert.match(research, /Multi-model routing and multi-agent decomposition are optional mechanisms/);
  assert.match(research, /cost per accepted outcome/i);
});

test("long-horizon optimization separates search feedback from promotion authority", async () => {
  const [sourceIndex, evaluation, changes, skill, research] = await Promise.all([
    read("library/05-source-index.md"),
    read("library/09-evaluation-corpus-and-review-loops.md"),
    read("operations/change-management.md"),
    read(".agents/skills/build-ai-evaluation/SKILL.md"),
    read("research/2026-08-08--operational-redesign-and-applied-ai-practice.md"),
  ]);

  assert.match(sourceIndex, /## S35 — K-Dense AI: Arbor skill/);
  assert.match(sourceIndex, /1e5eeffbdad3749125afe7ab48a39694e27f181c/);
  for (const body of [evaluation, changes, skill]) {
    assert.match(body, /initial artifact/i);
    assert.match(body, /development evaluator/i);
    assert.match(body, /promotion evaluator/i);
    assert.match(body, /hypothesis/i);
    assert.match(body, /artifact revision/i);
  }
  assert.match(evaluation, /A held-out score can reject a candidate; it cannot authorize a merge, deployment, or business effect/i);
  assert.match(changes, /autonomous search topology is not a release authority/i);
  assert.match(skill, /held-out result still proceeds through ordinary approval and release gates/i);
  assert.match(research, /No new lifecycle, score, module, or control family is created/i);
});
