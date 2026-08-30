import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readinessPath = path.join(root, "templates", "production-service-readiness.md");

test("production readiness uses one bounded evidence vocabulary without a composite score", async () => {
  const body = await readFile(readinessPath, "utf8");
  for (const status of ["required", "not applicable", "unresolved", "designed", "tested", "operational"]) {
    assert.match(body, new RegExp(`\\| \\\`${status}\\\` \\|`), `missing status ${status}`);
  }
  assert.match(body, /Do not calculate a readiness score/i);
  assert.doesNotMatch(body, /\|\s*(?:readiness|total|overall) score\s*\|/i);
  assert.match(body, /cannot by themselves advance a row beyond `designed`/i);
  assert.match(body, /`tested` requires executable target-system evidence/i);
  assert.match(body, /`operational` additionally requires current production telemetry/i);
});

test("production readiness covers the minimum service boundary and resolves every control", async () => {
  const [body, controlsText] = await Promise.all([
    readFile(readinessPath, "utf8"),
    readFile(path.join(root, "controls", "control-catalog.json"), "utf8"),
  ]);
  for (const dimension of [
    "Identity and authorization",
    "Source integration, reconciliation, and environment constraints",
    "Durable state and data recovery",
    "Async work, concurrency, retries, and idempotency",
    "Rate, cost, and capacity limits",
    "Telemetry, alerts, and service objectives",
    "Failure, degraded operation, and rollback",
    "Operator workflow, adoption, and review capacity",
    "Scaling assumptions and limits",
    "Service ownership and evidence lifecycle",
  ]) assert.match(body, new RegExp(`\\| ${dimension.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")} \\|`));

  const knownControls = new Set(JSON.parse(controlsText).controls.map((control) => control.id));
  const citedControls = new Set(body.match(/\b[A-Z]{3}-\d{3}\b/g) ?? []);
  assert.ok(citedControls.size >= 15);
  for (const controlId of citedControls) assert.ok(knownControls.has(controlId), `unknown control ${controlId}`);
});

test("infrastructure mechanisms remain conditional on the declared workflow", async () => {
  const body = await readFile(readinessPath, "utf8");
  assert.match(body, /A database is required only when the workflow needs durable or queryable state/i);
  assert.match(body, /A queue or durable workflow engine is required only when work outlives a request/i);
  assert.match(body, /Caching and horizontal scaling are required only when measured load/i);
  assert.match(body, /Synchronous bounded work may be `not applicable` with evidence/i);
  assert.match(body, /A completed request, file load, or batch proves transport only/i);
  assert.match(body, /Enterprise Integration and Scale Reality/);
  assert.match(body, /eligible, exposed, completed, independently accepted, and business-effect events/i);
  assert.match(body, /Documentation, a demo, or delivery-team-led usage remains `designed`/i);
});

test("the readiness packet is cataloged and reachable from human and agent routes", async () => {
  const [catalogText, templates, readme, guide, agents, llms, skill, gates] = await Promise.all([
    readFile(path.join(root, "catalog.json"), "utf8"),
    readFile(path.join(root, "templates", "README.md"), "utf8"),
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "guide", "README.md"), "utf8"),
    readFile(path.join(root, "AGENTS.md"), "utf8"),
    readFile(path.join(root, "llms.txt"), "utf8"),
    readFile(path.join(root, ".agents", "skills", "review-ai-production-readiness", "SKILL.md"), "utf8"),
    readFile(path.join(root, "operations", "release-gates.md"), "utf8"),
  ]);
  const catalog = JSON.parse(catalogText).artifacts;
  assert.equal(
    catalog.find((artifact) => artifact.path === "templates/production-service-readiness.md")?.id,
    "template.production-service-readiness",
  );
  for (const body of [templates, readme, guide, agents, llms, skill, gates]) {
    assert.match(body, /production-service-readiness\.md/);
  }
});
