import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsRoot = path.join(root, ".agents", "skills");

const expectedSkills = new Map([
  ["assess-ai-change-impact", ["direct", "transitive", "rollback"]],
  ["assess-ai-data-readiness", ["source authority", "quality", "lineage"]],
  ["build-ai-evaluation", ["evaluation", "adversarial", "report"]],
  ["deliver-approved-ai-slice", ["vertical slice", "adoption", "release"]],
  ["design-production-ai-system", ["architecture", "system", "production"]],
  ["engineer-ai-value", ["value", "cost", "adoption"]],
  ["map-enterprise-integration", ["legacy", "reconciliation", "durable execution"]],
  ["operate-ai-service", ["slo", "incident", "cost"]],
  ["productize-field-learning", ["customer-specific", "recurrence", "reusable"]],
  ["qualify-ai-workflow", ["discovery", "workflow", "verifier"]],
  ["reframe-ai-engagement", ["inherited", "process knower", "disposition"]],
  ["review-ai-production-readiness", ["release", "evidence", "rollback"]],
  ["run-ai-engagement", ["engagement", "next accountable", "continuity"]],
  ["secure-ai-action-boundary", ["identity", "authorization", "idempotency"]],
  ["select-ai-mechanism", ["deterministic", "ml", "agent"]],
  ["transfer-ai-service", ["handoff", "owner", "retire"]],
]);

const expectedProgressiveRoutes = new Map([
  ["assess-ai-change-impact", ["../../../solutions/README.md", "not a substitute for target dependencies or release evidence"]],
  ["assess-ai-data-readiness", ["../../../solutions/README.md", "not target evidence"]],
  ["build-ai-evaluation", ["../../../solutions/README.md", "not evaluation evidence"]],
  ["deliver-approved-ai-slice", ["../../../solutions/README.md", "Read only the artifacts that apply"]],
  ["design-production-ai-system", ["../../../solutions/README.md", "not target evidence"]],
  ["engineer-ai-value", ["../../../library/14-twelve-factors-ai-value-engineering.md", "../../../solutions/README.md"]],
  ["map-enterprise-integration", ["../../../solutions/README.md", "not observed target architecture"]],
  ["operate-ai-service", ["../../../library/14-twelve-factors-ai-value-engineering.md", "../../../solutions/README.md"]],
  ["productize-field-learning", ["../../../solutions/README.md", "when evidence suggests that destination"]],
  ["qualify-ai-workflow", ["../../../library/14-twelve-factors-ai-value-engineering.md", "../../../solutions/business-flows/README.md"]],
  ["reframe-ai-engagement", ["../../../solutions/README.md", "not target evidence"]],
  ["review-ai-production-readiness", ["../../../solutions/README.md", "not release evidence"]],
  ["run-ai-engagement", ["../../../solutions/README.md", "not target evidence"]],
  ["secure-ai-action-boundary", ["../../../solutions/README.md", "not authorization policy"]],
  ["select-ai-mechanism", ["../../../solutions/README.md", "not target policy or evidence"]],
  ["transfer-ai-service", ["../../../solutions/README.md", "not exercised evidence or acceptance"]],
]);

function parseFrontmatter(body) {
  const match = body.match(/^---\n([\s\S]+?)\n---\n/);
  assert.ok(match, "SKILL.md must begin with YAML frontmatter");
  const entries = match[1].split("\n").map((line) => {
    const separator = line.indexOf(":");
    assert.notEqual(separator, -1, `invalid frontmatter line: ${line}`);
    return [line.slice(0, separator), line.slice(separator + 1).trim()];
  });
  return { metadata: Object.fromEntries(entries), body: body.slice(match[0].length) };
}

function quotedYamlValue(body, key) {
  const match = body.match(new RegExp(`^\\s{2}${key}: "([^"]+)"$`, "m"));
  assert.ok(match, `agents/openai.yaml must quote ${key}`);
  return match[1];
}

test("the repository exposes exactly sixteen focused applied-AI skills", async () => {
  const directories = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(directories, [...expectedSkills.keys()].sort());
});

test("skill instructions and interface metadata are complete and distinct", async () => {
  const descriptions = new Set();

  for (const [skillName, requiredTerms] of expectedSkills) {
    const skillDirectory = path.join(skillsRoot, skillName);
    const skillBody = await readFile(path.join(skillDirectory, "SKILL.md"), "utf8");
    const openaiBody = await readFile(path.join(skillDirectory, "agents", "openai.yaml"), "utf8");
    const { metadata, body } = parseFrontmatter(skillBody);

    assert.deepEqual(Object.keys(metadata), ["name", "description"]);
    assert.equal(metadata.name, skillName);
    assert.match(metadata.description, /^.+ Use (?:for|when) .+\.$/);
    assert.ok(metadata.description.length <= 1024);
    assert.equal(descriptions.has(metadata.description), false, `${skillName} duplicates another trigger description`);
    descriptions.add(metadata.description);

    assert.match(body.trimStart(), /^# /);
    assert.match(body, /\n## Read first\n/);
    assert.match(body, /\n## Workflow\n/);
    assert.match(body, /\n## Output contract\n/);
    for (const marker of ["TO", "FI", "TB", "XX"].map((prefix, index) => `${prefix}${["DO", "XME", "D", "X"][index]}`)) {
      assert.equal(skillBody.includes(marker), false, `${skillName} contains an unresolved marker`);
    }
    assert.ok(skillBody.split("\n").length <= 80, `${skillName} should remain progressively disclosed`);

    for (const term of requiredTerms) {
      assert.ok(skillBody.toLowerCase().includes(term), `${skillName} does not cover ${term}`);
    }

    const displayName = quotedYamlValue(openaiBody, "display_name");
    const shortDescription = quotedYamlValue(openaiBody, "short_description");
    const defaultPrompt = quotedYamlValue(openaiBody, "default_prompt");
    assert.ok(displayName.length > 0);
    assert.ok(shortDescription.length >= 25 && shortDescription.length <= 64);
    assert.ok(defaultPrompt.includes(`$${skillName}`));
    assert.doesNotMatch(openaiBody, /^dependencies:/m, `${skillName} is instruction-only and must not claim tool authority`);
  }
});

test("skills progressively route through the value framework and selected solution cases", async () => {
  for (const [skillName, requiredFragments] of expectedProgressiveRoutes) {
    const skillBody = await readFile(path.join(skillsRoot, skillName, "SKILL.md"), "utf8");
    for (const fragment of requiredFragments) {
      assert.ok(skillBody.includes(fragment), `${skillName} does not route through ${fragment}`);
    }
    assert.match(skillBody, /read only/i, `${skillName} must load only the selected solution context`);
    const hardLinkedCases = skillBody.match(/solutions\/(?:business-flows|verticals)\/(?!README\.md)[^)\s]+\.md/g) ?? [];
    assert.deepEqual(hardLinkedCases, [], `${skillName} hard-links individual solution cases`);
  }
});

test("the engagement conductor can reach every focused lifecycle route", async () => {
  const conductor = await readFile(path.join(skillsRoot, "run-ai-engagement", "SKILL.md"), "utf8");
  for (const skillName of expectedSkills.keys()) {
    if (skillName === "run-ai-engagement") continue;
    assert.ok(conductor.includes(`$${skillName}`), `run-ai-engagement cannot route to ${skillName}`);
  }
  assert.match(conductor, /reads governed data or can stage or execute an effect/);
});

test("data readiness is progressively routed through the lifecycle skills", async () => {
  const requiredRoutes = new Map([
    ["qualify-ai-workflow", ["data-readiness-assessment.md", "operational, knowledge/context, evaluation/training, and telemetry/feedback"]],
    ["select-ai-mechanism", ["data-context-manifest.json", "quality, preparation, labels, context, and drift"]],
    ["design-production-ai-system", ["data-context manifest", "CTX-001` through `CTX-009"]],
    ["build-ai-evaluation", ["data-context-manifest.json", "missing, stale, conflicting, corrected, late"]],
    ["review-ai-production-readiness", ["data-context manifest", "output ownership"]],
    ["operate-ai-service", ["data-quality-and-drift.md", "CTX-009"]],
  ]);
  for (const [skillName, fragments] of requiredRoutes) {
    const body = await readFile(path.join(skillsRoot, skillName, "SKILL.md"), "utf8");
    for (const fragment of fragments) assert.ok(body.includes(fragment), `${skillName} omits ${fragment}`);
  }
});

test("operating, value, transfer, and productization skills carry the portfolio-health extensions", async () => {
  const [operate, value, transfer, productize] = await Promise.all([
    readFile(path.join(skillsRoot, "operate-ai-service", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "engineer-ai-value", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "transfer-ai-service", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "productize-field-learning", "SKILL.md"), "utf8"),
  ]);

  assert.match(operate, /templates\/workflow-portfolio-review\.md/);
  assert.match(operate, /continuation signals as realized value/i);
  assert.match(value, /maximum duration, evidence cutoff, separate technical, operator, adoption, value, economics, and production-readiness graduation thresholds/i);
  assert.match(transfer, /independent backup/i);
  assert.match(transfer, /succession or escalation path/i);
  assert.match(productize, /target-specific delivery\/support effort/i);
  assert.match(productize, /lower customer-specific effort does not weaken outcomes, safety, adoption, supportability, or local-policy validation/i);
});

test("qualification and value engineering have distinct lifecycle triggers", async () => {
  const [qualificationText, valueText, qualificationUi, valueUi] = await Promise.all([
    readFile(path.join(skillsRoot, "qualify-ai-workflow", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "engineer-ai-value", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "qualify-ai-workflow", "agents", "openai.yaml"), "utf8"),
    readFile(path.join(skillsRoot, "engineer-ai-value", "agents", "openai.yaml"), "utf8"),
  ]);
  const qualification = parseFrontmatter(qualificationText).metadata.description;
  const value = parseFrontmatter(valueText).metadata.description;

  assert.match(qualification, /before value modeling or solution design/i);
  assert.match(value, /already bounded AI-enabled workflow/i);
  assert.doesNotMatch(qualification, /portfolio (?:comparison|prioritization)/i);
  assert.doesNotMatch(value, /workflow observation|field discovery/i);
  assert.match(quotedYamlValue(qualificationUi, "short_description"), /before value modeling/i);
  assert.match(quotedYamlValue(qualificationUi, "default_prompt"), /before value modeling or solution design/i);
  assert.match(quotedYamlValue(valueUi, "short_description"), /bounded or live AI workflow/i);
  assert.match(quotedYamlValue(valueUi, "default_prompt"), /bounded workflow or its continued live operation/i);
});

test("qualification, engagement reframing, and value engineering have distinct field triggers", async () => {
  const [qualificationText, reframeText, valueText, reframeUi] = await Promise.all([
    readFile(path.join(skillsRoot, "qualify-ai-workflow", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "reframe-ai-engagement", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "engineer-ai-value", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "reframe-ai-engagement", "agents", "openai.yaml"), "utf8"),
  ]);
  const qualification = parseFrontmatter(qualificationText).metadata.description;
  const reframe = parseFrontmatter(reframeText).metadata.description;
  const value = parseFrontmatter(valueText).metadata.description;

  assert.match(qualification, /before value modeling or solution design/i);
  assert.match(reframe, /field evidence materially contradicts the sold brief or current boundary/i);
  assert.match(value, /already bounded AI-enabled workflow/i);
  assert.doesNotMatch(reframe, /production (?:release|readiness|approval)/i);
  assert.match(quotedYamlValue(reframeUi, "short_description"), /field evidence/i);
  assert.match(quotedYamlValue(reframeUi, "default_prompt"), /scoped human disposition/i);
});

test("skill interfaces expose situation-first routing cases without claiming host behavior", async () => {
  const cases = [
    { skill: "run-ai-engagement", prompt: "Keep this live engagement coherent and tell me the next accountable move from the recorded evidence.", terms: ["engagement", "next accountable"] },
    { skill: "qualify-ai-workflow", prompt: "We have a candidate workflow but have not observed it or named the verifier.", terms: ["workflow", "before value modeling"] },
    { skill: "reframe-ai-engagement", prompt: "The brief is wrong; the sponsor and operator disagree about what may ship.", terms: ["brief is wrong", "sponsor and operator disagree"] },
    { skill: "engineer-ai-value", prompt: "The workflow is bounded. Is it worth funding once adoption and full cost are counted?", terms: ["bounded", "cost"] },
    { skill: "assess-ai-data-readiness", prompt: "The workflow is bounded; prove whether its data and context are fit for the decision.", terms: ["source authority", "quality"] },
    { skill: "select-ai-mechanism", prompt: "Should this decision use rules, retrieval, ML, an agent, or a person?", terms: ["smallest sufficient mechanism", "human review"] },
    { skill: "map-enterprise-integration", prompt: "Map the legacy, reconciliation, identity, execution, and operating seams around this approved workflow.", terms: ["legacy", "reconciliation"] },
    { skill: "design-production-ai-system", prompt: "The workflow and mechanism are approved; design the production system.", terms: ["production ai-enabled system", "architecture"] },
    { skill: "deliver-approved-ai-slice", prompt: "The decisions are accepted; deliver one bounded vertical slice through validation and operating ownership.", terms: ["vertical slice", "adoption"] },
    { skill: "build-ai-evaluation", prompt: "Build realistic cases and graders for this production AI release.", terms: ["evaluations", "graders"] },
    { skill: "assess-ai-change-impact", prompt: "This material dependency changed; trace direct and transitive impact before promotion.", terms: ["direct", "transitive"] },
    { skill: "secure-ai-action-boundary", prompt: "Secure this tool call with identity, authorization, idempotency, and readback.", terms: ["authorization", "readback"] },
    { skill: "review-ai-production-readiness", prompt: "This exact release needs a production readiness decision and rollback conditions.", terms: ["release", "rollback"] },
    { skill: "operate-ai-service", prompt: "The service is live; review SLOs, incidents, cost, and whether to retire it.", terms: ["slo", "retirement"] },
    { skill: "transfer-ai-service", prompt: "Prove the receiving team can operate, recover, change, and retire the service.", terms: ["operating team", "retire"] },
    { skill: "productize-field-learning", prompt: "This failure keeps recurring; decide what is reusable without leaking customer context.", terms: ["recurring", "without leaking customer context"] },
  ];

  assert.deepEqual(new Set(cases.map(({ skill }) => skill)), new Set(expectedSkills.keys()));
  for (const { skill, prompt, terms } of cases) {
    assert.ok(prompt.length >= 50, `${skill} prompt is not representative`);
    const body = await readFile(path.join(skillsRoot, skill, "SKILL.md"), "utf8");
    const description = parseFrontmatter(body).metadata.description.toLowerCase();
    for (const term of terms) assert.ok(description.includes(term), `${skill} description omits ${term}`);
  }

  const readme = await readFile(path.join(root, "README.md"), "utf8");
  assert.match(readme, /Describe the situation in ordinary language/);
  assert.match(readme, /confirm which skill the host selects/i);
});

test("qualification, value engineering, and production review use bounded decision vocabularies", async () => {
  const [qualification, value, review, charterSchemaText, releaseSchemaText] = await Promise.all([
    readFile(path.join(skillsRoot, "qualify-ai-workflow", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "engineer-ai-value", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "review-ai-production-readiness", "SKILL.md"), "utf8"),
    readFile(path.join(root, "schemas", "workflow-charter.schema.json"), "utf8"),
    readFile(path.join(root, "schemas", "solution-release.schema.json"), "utf8"),
  ]);
  const charterSchema = JSON.parse(charterSchemaText);
  const allowedDispositions = charterSchema.properties.decision.properties.disposition.enum;
  const decisionLine = qualification.match(/^\d+\. Decide ([^\n]+)$/m)?.[1] ?? "";
  const qualificationDecisions = [...decisionLine.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  assert.deepEqual(qualificationDecisions, ["discover", "defer", "do_not_build"]);
  for (const decision of qualificationDecisions) {
    assert.ok(allowedDispositions.includes(decision), `qualification uses invalid disposition ${decision}`);
  }

  const valueDecisionLine = value.match(/^\d+\. Recommend ([^\n]+)$/m)?.[1] ?? "";
  const valueDecisions = [...valueDecisionLine.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  assert.deepEqual(valueDecisions, ["pilot", "defer", "do_not_build", "continue", "constrain", "pause", "retire"]);
  for (const decision of valueDecisions.slice(0, 3)) {
    assert.ok(allowedDispositions.includes(decision), `value engineering uses invalid charter disposition ${decision}`);
  }
  assert.doesNotMatch(qualification, /`pilot`/);
  assert.match(valueDecisionLine, /For an already-live workflow, state a separate/);

  const releaseSchema = JSON.parse(releaseSchemaText);
  const rolloutStrategies = releaseSchema.properties.rollout.properties.strategy.enum;
  for (const strategy of rolloutStrategies) assert.match(review, new RegExp("`" + strategy + "`"));
  assert.match(review, /state any permitted manifest status change/);
});

test("skills do not force agent artifacts or solution accelerators onto simpler systems", async () => {
  const [design, evaluation, review] = await Promise.all([
    readFile(path.join(skillsRoot, "design-production-ai-system", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "build-ai-evaluation", "SKILL.md"), "utf8"),
    readFile(path.join(skillsRoot, "review-ai-production-readiness", "SKILL.md"), "utf8"),
  ]);

  assert.match(design, /Record `none` for the pattern or foundation when no artifact fits/);
  assert.match(design, /do not force a composition/i);
  assert.match(design, /evaluation-report and solution-release profiles only when model or agent behavior is selected/i);
  assert.match(evaluation, /When model or agent behavior is selected/);
  assert.match(evaluation, /equivalent target-software evaluation record/);
  assert.match(review, /target-software release record/);
  assert.match(review, /Require a behavior bundle, capability manifest, and evaluation report only when they apply/);

  for (const [name, body] of [["design", design], ["evaluation", evaluation], ["review", review]]) {
    assert.match(body, /deterministic, optimization, or classical-ML-only/i, `${name} omits simpler system routes`);
    assert.match(body, /(?:without|do not create) placeholder (?:model or )?agent artifacts/i, `${name} permits placeholder agent artifacts`);
  }
});

test("every skill is registered as a governed repository standard", async () => {
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8"));
  const entries = new Map(catalog.artifacts.map((artifact) => [artifact.path, artifact]));

  for (const skillName of expectedSkills.keys()) {
    const repositoryPath = `.agents/skills/${skillName}/SKILL.md`;
    const entry = entries.get(repositoryPath);
    assert.ok(entry, `${repositoryPath} is not cataloged`);
    assert.equal(entry.id, `skill.${skillName}`);
    assert.equal(entry.type, "standard");
    assert.ok(entry.tags.includes("skill"));
  }
});

test("the skill pack routes every control domain", async () => {
  const controlCatalog = JSON.parse(await readFile(path.join(root, "controls", "control-catalog.json"), "utf8"));
  const expectedPrefixes = new Set(controlCatalog.controls.map((control) => control.id.slice(0, 3)));
  const skillBodies = await Promise.all(
    [...expectedSkills.keys()].map((skillName) => readFile(path.join(skillsRoot, skillName, "SKILL.md"), "utf8")),
  );
  const routedPrefixes = new Set(
    skillBodies.join("\n").match(/\b[A-Z]{3}-[0-9]{3}\b/g)?.map((controlId) => controlId.slice(0, 3)) ?? [],
  );

  assert.deepEqual([...routedPrefixes].sort(), [...expectedPrefixes].sort());
});

test("public navigation progressively discloses the Guide, Handbook, Engineering Kit, and optional skills", async () => {
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const guide = await readFile(path.join(root, "guide", "README.md"), "utf8");
  const agents = await readFile(path.join(root, "AGENTS.md"), "utf8");
  const llms = await readFile(path.join(root, "llms.txt"), "utf8");
  const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8"));

  assert.ok(readme.indexOf("## Start with the job in front of you") < readme.indexOf("## Choose your depth"));
  assert.ok(readme.indexOf("## Choose your depth") < readme.indexOf("## See it working"));
  assert.ok(readme.indexOf("## See it working") < readme.indexOf("## Optional: use it with a coding agent"));
  assert.ok(readme.indexOf("## From idea to production") < readme.indexOf("## Optional: use it with a coding agent"));
  for (const body of [readme, guide]) {
    for (const layer of ["The Guide", "Handbook", "Engineering Kit"]) assert.match(body.replace(/\*/g, ""), new RegExp(layer));
  }
  for (const body of [readme, agents, llms]) assert.match(body, /guide\/README\.md/);
  assert.equal(catalog.artifacts.find((artifact) => artifact.path === "guide/README.md")?.id, "guide.core");

  const numberedGuideSections = [...guide.matchAll(/^## (\d+)\. /gm)].map((match) => Number(match[1]));
  assert.deepEqual(numberedGuideSections, Array.from({ length: 13 }, (_, index) => index + 1));
  assert.match(guide, /examples\/invoice-exception\/reference-loop\.mjs/);
  assert.match(guide, /examples\/shipment-risk-triage\/shipment-risk-triage\.mjs/);
  assert.match(readme, /examples\/invoice-exception\/reference-loop\.mjs/);
  assert.match(readme, /npm run test:reference/);
  assert.ok(readme.split(/\s+/).length < guide.split(/\s+/).length, "README must remain the shorter entry door");
  assert.match(readme, /They are not separate frameworks/);
  assert.match(guide, /They are three depths of one method/);

  assert.match(readme, /npx skills add davidahmann\/applied-ai-field-guide/);
  assert.match(readme, /The guide is complete as documentation/);
  assert.ok(agents.indexOf("## Repository map") < agents.indexOf("## Skill routes"));
  assert.ok(llms.indexOf("## Core entry points") < llms.indexOf("## Optional task skills"));
});
