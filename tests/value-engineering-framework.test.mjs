import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const frameworkPath = path.join(root, "library", "14-twelve-factors-ai-value-engineering.md");

test("the AI value-engineering framework contains twelve distinct evidence-backed factors", async () => {
  const body = await readFile(frameworkPath, "utf8");
  const headings = [...body.matchAll(/^## (\d+)\. (.+)$/gm)];
  assert.equal(headings.length, 12);
  assert.deepEqual(headings.map((match) => Number(match[1])), Array.from({ length: 12 }, (_, index) => index + 1));
  assert.equal(new Set(headings.map((match) => match[2])).size, 12);

  const factorSections = body.split(/^## \d+\. .+$/gm).slice(1, 13);
  assert.equal(factorSections.length, 12);
  for (const [index, section] of factorSections.entries()) {
    assert.match(section, /\*\*Evidence:\*\*/i, `factor ${index + 1} has no evidence contract`);
    assert.match(section, /\b[A-Z]{3}-\d{3}\b/, `factor ${index + 1} has no control mapping`);
  }
});

test("the framework measures incremental accepted outcomes and full economics rather than activity", async () => {
  const body = await readFile(frameworkPath, "utf8");
  for (const term of [
    "eligible volume",
    "expected adoption",
    "expected incremental accepted-outcome rate",
    "attributable incremental accepted outcomes",
    "expected lifecycle cost",
    "expected residual loss",
    "actual lifecycle cost",
    "realized loss",
    "cost per accepted outcome",
  ]) assert.ok(body.includes(term), `framework is missing ${term}`);

  assert.match(body, /For one loss class, use either gross exposure minus residual loss or net avoided loss/i);
  assert.match(body, /Tokens are an input\. Autonomy is a design choice\. Accepted outcomes are the product\./);
  assert.match(body, /not a certification/i);
});

test("working value artifacts carry residual loss without double counting avoided loss", async () => {
  const [schema, charter, valueCase, serviceReview, discoveryPlaybook, controlCatalog] = await Promise.all([
    readFile(path.join(root, "schemas", "workflow-charter.schema.json"), "utf8"),
    readFile(path.join(root, "templates", "workflow-charter.json"), "utf8"),
    readFile(path.join(root, "templates", "value-case.md"), "utf8"),
    readFile(path.join(root, "templates", "production-service-review.md"), "utf8"),
    readFile(path.join(root, "playbooks", "01-discovery-and-value.md"), "utf8"),
    readFile(path.join(root, "controls", "control-catalog.json"), "utf8"),
  ]);
  for (const body of [schema, charter]) assert.match(body, /annual_expected_residual_loss_usd/);
  for (const body of [valueCase, serviceReview, discoveryPlaybook]) {
    assert.match(body, /residual loss/i);
    assert.match(body, /avoided loss/i);
  }
  assert.match(valueCase, /- residual_loss_adjustment/);
  assert.match(valueCase, /0 when the exposure is already netted from unit value or avoided loss/);
  assert.match(valueCase, /gross exposure minus residual loss or net avoided loss/i);
  assert.match(discoveryPlaybook, /- residual_loss_adjustment/);
  assert.match(discoveryPlaybook, /0 when the exposure is already netted from unit value or avoided loss/);
  assert.match(discoveryPlaybook, /gross exposure minus residual loss or net avoided loss/i);
  const valueControl = JSON.parse(controlCatalog).controls.find((control) => control.id === "VAL-002");
  assert.match(valueControl.requirement, /residual loss not already netted from either benefit term/i);
  assert.match(valueControl.requirement, /Unit value, avoided loss, and residual loss MUST use non-overlapping definitions/);
  assert.match(valueControl.requirement, /not counted twice/i);
});

test("engagement, service, and portfolio artifacts keep value, continuation, capacity, and reuse distinct", async () => {
  const [delivery, service, portfolio, learning, operations, synthesis, catalogText] = await Promise.all([
    readFile(path.join(root, "templates", "delivery-and-adoption-plan.md"), "utf8"),
    readFile(path.join(root, "templates", "production-service-review.md"), "utf8"),
    readFile(path.join(root, "templates", "workflow-portfolio-review.md"), "utf8"),
    readFile(path.join(root, "templates", "field-learning-register.md"), "utf8"),
    readFile(path.join(root, "playbooks", "03-operate-and-scale.md"), "utf8"),
    readFile(path.join(root, "library", "10-applied-ai-delivery-and-operating-model.md"), "utf8"),
    readFile(path.join(root, "catalog.json"), "utf8"),
  ]);

  for (const gate of ["Technical performance", "Operator acceptance", "Adoption", "Business-value evidence", "Full economics", "Production readiness"]) {
    assert.ok(delivery.includes(gate), `pilot graduation omits ${gate}`);
  }
  assert.match(delivery, /strong technical result or composite score cannot average away/i);
  assert.match(delivery, /Primary sponsor \/ independent backup \/ succession trigger/);
  assert.match(service, /Continuation and sponsor resilience/);
  assert.match(service, /does not independently prove an accepted outcome or realized value/i);

  for (const term of [
    "Time to first accepted outcome",
    "Time to first accepted value",
    "Pilots reaching bounded production",
    "Full delivery cost per workflow",
    "Customer-specific effort ratio",
    "Supported-workflow load",
    "Sponsor resilience and operating capacity",
  ]) assert.ok(portfolio.includes(term), `portfolio review omits ${term}`);
  assert.match(portfolio, /portfolio average to override a workflow's value, safety, release, or retirement gate/i);
  assert.match(portfolio, /not profit/i);
  assert.match(portfolio, /External delivery \/ internal applied-AI team \/ mixed/);
  assert.match(portfolio, /Workflow variation and standardization eligibility/);
  for (const variant of ["policy-required", "segment-specific", "role-specific", "system-constrained", "accidental dysfunction"]) {
    assert.match(portfolio, new RegExp(variant, "i"));
    assert.match(learning, new RegExp(variant, "i"));
  }
  assert.match(portfolio, /first unresolved hard gate or binding constraint/i);
  assert.match(portfolio, /does not erase target-specific policy, data, security, evaluation, release, adoption, support, or ownership gates/i);
  assert.match(learning, /Standardization eligibility/);
  assert.match(learning, /retain every target's normal validation and release gates/i);

  for (const body of [learning, operations]) {
    assert.match(body, /customer-specific effort ratio/i);
    assert.match(body, /support/i);
    assert.match(body, /outcome/i);
  }
  assert.match(synthesis, /Keep engagement, service, and portfolio evidence separate/);
  assert.match(synthesis, /Professional practice boundaries/);
  assert.match(synthesis, /do not manufacture dependence/i);
  assert.match(synthesis, /Cluster only workflows with comparable decisions, outcomes, policy boundaries, source semantics, effect classes, and operating conditions/i);

  const catalog = JSON.parse(catalogText);
  assert.equal(
    catalog.artifacts.find((artifact) => artifact.path === "templates/workflow-portfolio-review.md")?.id,
    "template.fde-portfolio-review",
  );
});

test("field contributions have owned destinations, reuse rights, and capability-transfer evidence", async () => {
  const [delivery, learning, handoff, portfolio, synthesis, guide, patternsText, catalogText, research] = await Promise.all([
    readFile(path.join(root, "templates", "delivery-and-adoption-plan.md"), "utf8"),
    readFile(path.join(root, "templates", "field-learning-register.md"), "utf8"),
    readFile(path.join(root, "templates", "customer-enablement-handoff.md"), "utf8"),
    readFile(path.join(root, "templates", "workflow-portfolio-review.md"), "utf8"),
    readFile(path.join(root, "library", "10-applied-ai-delivery-and-operating-model.md"), "utf8"),
    readFile(path.join(root, "guide", "README.md"), "utf8"),
    readFile(path.join(root, "patterns", "pattern-catalog.json"), "utf8"),
    readFile(path.join(root, "catalog.json"), "utf8"),
    readFile(path.join(root, "research", "2026-08-10--fde-product-boundaries-and-capability-transfer.md"), "utf8"),
  ]);

  for (const body of [delivery, synthesis, guide]) {
    assert.match(body, /customer (?:or business-unit )?configuration/i);
    assert.match(body, /target-owned extension/i);
    assert.match(body, /shared product or platform/i);
    assert.match(body, /time-bounded experiment/i);
    assert.match(body, /shadow product/i);
  }
  for (const body of [learning, handoff, portfolio, synthesis, guide]) assert.match(body, /reuse(?: and transfer)? rights/i);
  for (const body of [handoff, portfolio, synthesis, guide]) assert.match(body, /delivery-team|FDE involvement|target-specific intervention/i);
  assert.match(handoff, /representative changes completed by the receiving team without delivery-team intervention/i);
  assert.match(portfolio, /Unresolved parallel production assets/);
  assert.match(research, /Leads not promoted into core guidance/);
  assert.match(research, /popularity or job title is not evidence/i);

  const patterns = JSON.parse(patternsText).patterns;
  assert.equal(patterns.find((pattern) => pattern.id === "PAT-021")?.title, "Owned field contribution path");
  assert.equal(patterns.find((pattern) => pattern.id === "ANTI-019")?.title, "Field-owned shadow product");

  const catalog = JSON.parse(catalogText).artifacts;
  assert.equal(
    catalog.find((artifact) => artifact.path === "research/2026-08-10--fde-product-boundaries-and-capability-transfer.md")?.type,
    "evidence",
  );
});

test("the four hard gates cannot be averaged away", async () => {
  const body = await readFile(frameworkPath, "utf8");
  const gateSection = body.match(/## Use the factors as gates, not an average\n([\s\S]*?)\n## Apply the framework/)?.[1] ?? "";
  assert.equal((gateSection.match(/^\d+\. /gm) ?? []).length, 4);
  for (const gate of ["owned, measurable outcome", "independent verifier", "Bounded authority", "positive value case after full cost"]) {
    assert.match(gateSection, new RegExp(gate, "i"));
  }
  assert.match(gateSection, /do_not_build/);
  assert.match(gateSection, /strong factors do not average away a failed gate/i);
});

test("the portable scorecard preserves the framework without inventing a certification", async () => {
  const [framework, scorecard, worksheetText, schemaText, svg, catalogText] = await Promise.all([
    readFile(frameworkPath, "utf8"),
    readFile(path.join(root, "guide", "ai-value-engineering-scorecard.md"), "utf8"),
    readFile(path.join(root, "templates", "ai-value-engineering-scorecard.json"), "utf8"),
    readFile(path.join(root, "schemas", "ai-value-engineering-scorecard.schema.json"), "utf8"),
    readFile(path.join(root, "assets", "ai-value-engineering-scorecard.svg"), "utf8"),
    readFile(path.join(root, "catalog.json"), "utf8"),
  ]);
  const worksheet = JSON.parse(worksheetText);
  const schema = JSON.parse(schemaText);
  const frameworkFactors = [...framework.matchAll(/^## (\d+)\. (.+)$/gm)].map((match) => ({
    number: Number(match[1]),
    name: match[2],
  }));
  assert.deepEqual(worksheet.factors.map(({ factor_number: number, factor_name: name }) => ({ number, name })), frameworkFactors);
  assert.equal(Object.keys(worksheet.hard_gates).length, 4);
  assert.deepEqual(schema.properties.factors.minItems, 12);
  assert.match(scorecard, /not a separate framework/i);
  assert.match(scorecard, /Do not convert the twelve scores into a certification or universal pass mark/i);
  assert.doesNotMatch(scorecard, /total score|pass mark:/i);
  assert.match(svg, /12 factors\. 4 hard gates\. One outcome: accepted value\./);
  const catalog = JSON.parse(catalogText).artifacts;
  for (const id of [
    "guide.ai-value-engineering-scorecard",
    "template.ai-value-engineering-scorecard",
    "schema.ai-value-engineering-scorecard",
  ]) assert.ok(catalog.some((artifact) => artifact.id === id), id);
});

test("every control cited by the framework resolves", async () => {
  const [framework, catalogText] = await Promise.all([
    readFile(frameworkPath, "utf8"),
    readFile(path.join(root, "controls", "control-catalog.json"), "utf8"),
  ]);
  const known = new Set(JSON.parse(catalogText).controls.map((control) => control.id));
  const cited = new Set(framework.match(/\b[A-Z]{3}-\d{3}\b/g) ?? []);
  assert.ok(cited.size >= 15);
  for (const controlId of cited) assert.ok(known.has(controlId), `framework cites unknown control ${controlId}`);
});

test("human and agent navigation place the framework and scorecard above implementation detail", async () => {
  const [readme, agents, llms, valueGuide, discovery] = await Promise.all([
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "AGENTS.md"), "utf8"),
    readFile(path.join(root, "llms.txt"), "utf8"),
    readFile(path.join(root, "library", "11-value-engineering-and-frugal-architecture.md"), "utf8"),
    readFile(path.join(root, "playbooks", "01-discovery-and-value.md"), "utf8"),
  ]);
  const reference = "library/14-twelve-factors-ai-value-engineering.md";
  const scorecard = "guide/ai-value-engineering-scorecard.md";
  for (const body of [readme, agents, llms]) assert.ok(body.includes(reference));
  for (const body of [readme, agents, llms]) assert.ok(body.includes(scorecard));
  assert.ok(valueGuide.includes("14-twelve-factors-ai-value-engineering.md"));
  assert.ok(discovery.includes("../library/14-twelve-factors-ai-value-engineering.md"));
  assert.ok(readme.indexOf("12 Factors of AI Value Engineering") < readme.indexOf("## From idea to production"));
  assert.ok(readme.indexOf("## From idea to production") < readme.indexOf("## Start from a business flow"));
});
