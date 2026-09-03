import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateArtifact } from "../scripts/validate-artifact.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function temporaryJson(name, value) {
  const directory = await mkdtemp(path.join(tmpdir(), "applied-ai-field-guide-artifact-"));
  const target = path.join(directory, name);
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
  return target;
}

test("starter workflow validation requires decision-bearing fields without forking the canonical schema", async () => {
  const starter = {
    workflow_id: "invoice_exception_resolution",
    owners: {
      operational: "accounts-payable",
      risk: "finance-controls",
      receiving_service_owner: "accounts-payable-service",
    },
    functional_requirement: {
      user: "accounts-payable reviewer",
      decision: "select the policy-covered resolution",
      accepted_outcome: "approved resolution matches ledger readback",
    },
    scope: { initial_segment: "domestic price-variance exceptions", out_of_scope: ["payment execution"] },
    outcome: { verifier: "finance controls manager" },
    stop_conditions: ["source authority cannot be verified"],
    decision: { disposition: "discover" },
  };
  const target = await temporaryJson("workflow-start.json", starter);
  const result = await validateArtifact({ file: target, profile: "starter", type: "workflow-charter" });
  assert.equal(result.ok, true, result.errors.join("\n"));

  delete starter.outcome.verifier;
  const incomplete = await temporaryJson("workflow-start.json", starter);
  const failed = await validateArtifact({ file: incomplete, profile: "starter", type: "workflow-charter" });
  assert.equal(failed.ok, false);
  assert.ok(failed.errors.some((error) => error.includes("/outcome/verifier")));
});

test("the documented twelve-field starter is copyable without advertising an unpublished global binary", async () => {
  const templates = await readFile(path.join(root, "templates", "README.md"), "utf8");
  const match = templates.match(/twelve decision-bearing fields[\s\S]*?```json\n([\s\S]*?)\n```/);
  assert.ok(match, "templates README should contain one copyable starter JSON object");
  const target = await temporaryJson("documented-workflow-start.json", JSON.parse(match[1]));
  const result = await validateArtifact({ file: target, profile: "starter", type: "workflow-charter" });
  assert.equal(result.ok, true, result.errors.join("\n"));

  const packageDocument = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.equal(packageDocument.private, true);
  assert.equal(packageDocument.bin, undefined);
});

test("CLI help leads with commands available from a private repository clone", () => {
  const helpText = execFileSync(process.execPath, [path.join(root, "scripts", "validate-artifact.mjs"), "--help"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.match(helpText, /Usage from a repository clone:/);
  assert.match(helpText, /npm run validate:artifact -- <artifact\.json>/);
  assert.match(helpText, /Direct script equivalent:/);
  assert.doesNotMatch(helpText, /^\s*applied-ai-field-guide validate/m);
});

test("progressive validation keeps collaborative Markdown plans human-readable and structurally guarded", async () => {
  const [templates, delivery, readiness, handoff] = await Promise.all([
    readFile(path.join(root, "templates", "README.md"), "utf8"),
    readFile(path.join(root, "templates", "delivery-and-adoption-plan.md"), "utf8"),
    readFile(path.join(root, "templates", "production-service-readiness.md"), "utf8"),
    readFile(path.join(root, "templates", "customer-enablement-handoff.md"), "utf8"),
  ]);

  assert.match(templates, /Why progressive profiles stop at JSON contracts/);
  assert.match(templates, /do not create separate “starter” Markdown copies/);
  assert.match(templates, /structural guardrail, not evidence/i);
  for (const heading of [
    "## Delivery contract",
    "## Pilot graduation contract",
    "## Adoption measurement contract",
    "## Adoption funnel and friction review",
    "## Adoption rehearsal and cohort sequence",
    "## Review and support capacity",
  ]) assert.ok(delivery.includes(heading), heading);
  for (const heading of ["## Assessment identity", "## Status contract", "## Readiness matrix", "## Decision and handoff"]) {
    assert.ok(readiness.includes(heading), heading);
  }
  for (const heading of [
    "## Ownership",
    "## Pilot transfer plan",
    "## Capability evidence",
    "## Post-exit support and re-entry contract",
    "## Acceptance decision",
  ]) assert.ok(handoff.includes(heading), heading);
});

test("starter validation retains closed-object and type rules from the canonical schema", async () => {
  const target = await temporaryJson("workflow-start.json", {
    workflow_id: "invoice_exception_resolution",
    invented_field: true,
    owners: { operational: "ap", risk: "controls", receiving_service_owner: "ap-service" },
    functional_requirement: { user: "reviewer", decision: "resolve", accepted_outcome: "verified" },
    scope: { initial_segment: "domestic", out_of_scope: ["payments"] },
    outcome: { verifier: "controller" },
    stop_conditions: ["authority missing"],
    decision: { disposition: "discover" },
  });
  const result = await validateArtifact({ file: target, profile: "starter", type: "workflow-charter" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("additional properties")));
});

test("complete validation applies canonical structure and semantic invariants", async () => {
  const canonical = path.join(root, "examples", "invoice-exception", "workflow-charter.json");
  const passing = await validateArtifact({ file: canonical });
  assert.equal(passing.ok, true, passing.errors.join("\n"));

  const charter = JSON.parse(await readFile(canonical, "utf8"));
  charter.decision.disposition = "pause";
  const target = await temporaryJson("workflow-charter.json", charter);
  const failed = await validateArtifact({ file: target, type: "workflow-charter" });
  assert.equal(failed.ok, false);
  assert.ok(failed.errors.some((error) => error.includes("status pilot conflicts with decision pause")));
});

test("starter engagement validation requires two cited claims and a bounded next move", async () => {
  const target = await temporaryJson("reframe-start.json", {
    record_id: "invoice_reframe",
    workflow_id: "invoice_exception_resolution",
    inherited_brief: { statement: "Post exceptions automatically", source_refs: ["brief.md#promise"] },
    roles: {
      process_knower: { identity: "AP exception lead", status: "verified", evidence_refs: ["observation.md#owner"] },
      disposition_authority: { identity: "AP service owner", status: "verified", evidence_refs: ["decision.md#authority"] },
    },
    representative_case: { case_id: "case-1042", evidence_refs: ["observation.md#case-1042"] },
    claims: [{ claim_id: "sold" }, { claim_id: "observed" }],
    conflicts: [{ conflict_id: "approval-boundary" }],
    proposal: { safe_fallback: "Use the manual queue", next_field_move: "Observe ten eligible cases" },
  });
  const result = await validateArtifact({ file: target, profile: "starter", type: "engagement-reframe" });
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("starter data validation accepts one representative source and names failure behavior", async () => {
  const target = await temporaryJson("data-start.json", {
    context_manifest_id: "invoice_context",
    workflow_id: "invoice_exception_resolution",
    owner: "finance-data",
    decision_scope: "recommend a correction for domestic price-variance exceptions",
    sources: [{
      source_id: "invoice-ledger",
      owner: "finance-data",
      source_of_truth: true,
      purpose: "current invoice state",
      failure_behavior: { missing: "stop and return to manual review" },
    }],
    quality_contract: {
      decision_critical_fields: [{
        source_id: "invoice-ledger",
        field: "invoice_revision",
        decision_use: "bind the proposal to current state",
        fallback: "stop on missing or stale revision",
      }],
    },
    operations: {
      drift_response: "pause the affected segment",
      rollback_condition: "source reconciliation fails",
      change_owner: "finance-data",
    },
    decision: { disposition: "remediate" },
  });
  const result = await validateArtifact({ file: target, profile: "starter", type: "data-context-manifest" });
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("unknown external artifacts fail with an actionable type message", async () => {
  const target = await temporaryJson("unknown.json", { hello: "world" });
  const result = await validateArtifact({ file: target });
  assert.equal(result.ok, false);
  assert.ok(result.errors[0].includes("pass --type"));
});
