import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rename, rm, stat, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { callTool, toolDefinitions } from "../plugins/applied-ai-field-guide/mcp/tools.mjs";
import { digest, loadConfig } from "../plugins/applied-ai-field-guide/mcp/workspace.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pluginRoot = path.join(root, "plugins", "applied-ai-field-guide");
const guideFiles = [
  "AGENTS.md", "CHANGELOG.md", "CITATION.cff", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "GOVERNANCE.md",
  "LICENSE", "NOTICE", "README.md", "SECURITY.md", "SUPPORT.md", "catalog.json", "llms.txt", "package.json", "package-lock.json",
  "output/pdf/ai-value-engineering-scorecard.pdf",
];
const guideDirectories = [
  "assets", "blueprints", "controls", "docs", "examples", "guide", "library", "operations", "patterns",
  "playbooks", "research", "schemas", "scripts", "solutions", "templates",
];

function installerEnvironment(home, overrides = {}) {
  const env = { ...process.env, HOME: home };
  for (const key of ["APPLIED_AI_CONFIG_PATH", "FDE_CONFIG_PATH", "APPLIED_AI_WORKSPACE_ROOT", "FDE_WORKSPACE_ROOT"]) delete env[key];
  return { ...env, ...overrides };
}

function installForHome(home, arguments_ = [], overrides = {}) {
  return spawnSync(process.execPath, [path.join(root, "scripts", "install-guide-plugin.mjs"), ...arguments_], {
    cwd: root,
    encoding: "utf8",
    env: installerEnvironment(home, overrides),
  });
}

async function filesBelow(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = path.posix.join(prefix, entry.name);
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(target, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`unexpected non-file plugin entry ${relative}`);
  }
  return files;
}

async function callToolInProcess(configPath, name, arguments_, serverRoot = pluginRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(serverRoot, "mcp", "server.mjs")], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, APPLIED_AI_CONFIG_PATH: configPath },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr || `MCP process exited ${code}`));
      const reply = stdout.trim().split("\n").filter(Boolean).map(JSON.parse).find(({ id }) => id === 1);
      if (!reply) return reject(new Error(`missing MCP response: ${stderr}`));
      if (reply.result?.isError) return reject(Object.assign(new Error(reply.result.structuredContent.error.message), { code: reply.result.structuredContent.error.code }));
      resolve(reply.result.structuredContent);
    });
    child.stdin.end(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: arguments_ } })}\n`);
  });
}

async function callToolRpc(configPath, name, arguments_, serverRoot = pluginRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(serverRoot, "mcp", "server.mjs")], {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, APPLIED_AI_CONFIG_PATH: configPath },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr || `MCP process exited ${code}`));
      const line = stdout.trim().split("\n").find(Boolean);
      if (!line) return reject(new Error(`missing MCP response: ${stderr}`));
      resolve({ reply: JSON.parse(line), bytes: Buffer.byteLength(line) });
    });
    child.stdin.end(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: arguments_ } })}\n`);
  });
}

test("the Applied AI Field Guide plugin manifest, MCP declaration, and generated skill pack are coherent", async () => {
  const [plugin, mcp, packageMetadata] = await Promise.all([
    readFile(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8").then(JSON.parse),
    readFile(path.join(pluginRoot, ".mcp.json"), "utf8").then(JSON.parse),
    readFile(path.join(root, "package.json"), "utf8").then(JSON.parse),
  ]);
  assert.equal(plugin.name, "applied-ai-field-guide");
  assert.equal(plugin.interface.displayName, "The Applied AI Field Guide");
  assert.equal(plugin.version, packageMetadata.version);
  assert.equal(plugin.skills, "./skills/");
  assert.equal(plugin.mcpServers, "./.mcp.json");
  assert.equal(mcp.mcpServers["applied-ai-field-guide"].command, "node");
  assert.deepEqual(mcp.mcpServers["applied-ai-field-guide"].args, ["./mcp/server.mjs"]);
  assert.equal(mcp.mcpServers["applied-ai-field-guide"].cwd, ".");
  assert.deepEqual(mcp.mcpServers["applied-ai-field-guide"].env_vars, ["APPLIED_AI_CONFIG_PATH", "FDE_CONFIG_PATH"]);
  assert.deepEqual(Object.keys(mcp.mcpServers), ["applied-ai-field-guide"]);

  const canonicalRoot = path.join(root, ".agents", "skills");
  const packagedRoot = path.join(pluginRoot, "skills");
  const canonicalFiles = await filesBelow(canonicalRoot);
  const packagedFiles = await filesBelow(packagedRoot);
  assert.deepEqual(packagedFiles, canonicalFiles);
  assert.equal(canonicalFiles.filter((file) => file.endsWith("/SKILL.md")).length, 16);
  for (const file of canonicalFiles) {
    const [canonical, packaged] = await Promise.all([
      readFile(path.join(canonicalRoot, ...file.split("/")), "utf8"),
      readFile(path.join(packagedRoot, ...file.split("/")), "utf8"),
    ]);
    const expected = file.endsWith("/SKILL.md") ? canonical.replaceAll("(../../../", "(../../guide/") : canonical;
    assert.equal(packaged, expected, `${file} drifted from its generated skill package`);
    if (file.endsWith("/SKILL.md")) {
      for (const match of packaged.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
        const target = path.resolve(path.dirname(path.join(packagedRoot, ...file.split("/"))), match[1]);
        await readFile(target, "utf8");
      }
    }
  }
  const snapshotMappings = guideFiles.map((file) => ({ source: file, target: file }));
  for (const directory of guideDirectories) {
    for (const file of await filesBelow(path.join(root, directory))) {
      snapshotMappings.push({ source: path.posix.join(directory, file), target: path.posix.join(directory, file) });
    }
  }
  for (const file of canonicalFiles) snapshotMappings.push({ source: path.posix.join(".agents/skills", file), target: path.posix.join(".agents/skills", file) });
  snapshotMappings.push(
    { source: "plugins/applied-ai-field-guide/README.md", target: "plugins/applied-ai-field-guide/README.md" },
    { source: "plugins/applied-ai-field-guide/SECURITY.md", target: "plugins/applied-ai-field-guide/SECURITY.md" },
  );
  const actualSnapshotFiles = await filesBelow(path.join(pluginRoot, "guide"));
  assert.deepEqual(actualSnapshotFiles, snapshotMappings.map(({ target }) => target).sort((left, right) => left.localeCompare(right)), "packaged Guide snapshot has stale, missing, or extra files");
  for (const mapping of snapshotMappings) {
    const [canonical, packaged] = await Promise.all([
      readFile(path.join(root, ...mapping.source.split("/"))),
      readFile(path.join(pluginRoot, "guide", ...mapping.target.split("/"))),
    ]);
    assert.deepEqual(packaged, canonical, `${mapping.target} drifted from the canonical Guide snapshot`);
  }
  const catalog = JSON.parse(await readFile(path.join(pluginRoot, "guide", "catalog.json"), "utf8"));
  for (const artifact of catalog.artifacts) {
    const target = artifact.path.startsWith(".agents/skills/")
      ? path.join(pluginRoot, "skills", ...artifact.path.slice(".agents/skills/".length).split("/"))
      : path.join(pluginRoot, "guide", ...artifact.path.split("/"));
    const metadata = await stat(target).catch(() => null);
    assert.ok(metadata?.isFile(), `packaged Guide is missing catalog path ${artifact.path}`);
  }
});

test("the local MCP exposes distinct, bounded tools without network code", async () => {
  assert.equal(toolDefinitions.length, 12);
  assert.equal(new Set(toolDefinitions.map(({ name }) => name)).size, toolDefinitions.length);
  for (const tool of toolDefinitions) {
    assert.ok(tool.description.length >= 80, `${tool.name} needs a useful boundary description`);
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(tool.inputSchema.additionalProperties, false);
  }
  const mcpFiles = (await filesBelow(path.join(pluginRoot, "mcp"))).filter((file) => file.endsWith(".mjs"));
  const body = (await Promise.all(mcpFiles.map((file) => readFile(path.join(pluginRoot, "mcp", ...file.split("/")), "utf8")))).join("\n");
  assert.doesNotMatch(body, /node:(?:http|https|net|tls|dns|dgram|cluster)/);
  assert.doesNotMatch(body, /\bfetch\s*\(|\bWebSocket\b|createServer\s*\(/);
  assert.doesNotMatch(body, /\bexec(?:File)?Sync\s*\([^\n]*shell\s*:\s*true/);
  assert.match(body, /shell:\s*false/);
  assert.match(body, /RESTRICTED_CONTENT_DENIED/);
  assert.match(body, /maxResponseBytes/);
  assert.match(body, /idempotent_replay/);
  assert.match(body, /authority_verified:\s*false/);
});

test("bundled human documentation keeps local downloadable assets inside the installed snapshot", async () => {
  const snapshot = path.join(pluginRoot, "guide");
  const files = (await filesBelow(snapshot)).filter((file) => file.endsWith(".md"));
  const checked = new Set();
  for (const file of files) {
    const body = await readFile(path.join(snapshot, file), "utf8");
    for (const [, link] of body.matchAll(/\]\(([^)\s]+)(?:\s+["'][^)]*)?\)/g)) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link)) continue;
      const pathname = link.split(/[?#]/)[0];
      if (!/\.(?:pdf|png|svg|jpe?g|gif|webp|zip|csv|xlsx|docx|pptx)$/i.test(pathname)) continue;
      const target = path.resolve(snapshot, path.dirname(file), pathname);
      const relative = path.relative(snapshot, target);
      assert.ok(relative && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative), `${file}: asset escapes snapshot`);
      assert.ok((await stat(target)).isFile(), `${file}: missing bundled download ${link}`);
      checked.add(relative.split(path.sep).join("/"));
    }
  }
  assert.ok(checked.has("output/pdf/ai-value-engineering-scorecard.pdf"), "the scorecard PDF must be discoverable from bundled guidance");
  assert.equal((await readFile(path.join(snapshot, "output/pdf/ai-value-engineering-scorecard.pdf"))).subarray(0, 5).toString(), "%PDF-");
});

test("the local workspace preserves authority, immutable history, process safety, and conservative impact", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-plugin-test-"));
  const workspaceRoot = path.join(temporary, "engagements");
  const configPath = path.join(temporary, "config.json");
  await mkdir(workspaceRoot);
  const testConfig = {
    guide_root: root,
    validator_root: root,
    workspace_root: workspaceRoot,
    max_read_bytes: 65536,
    max_write_bytes: 262144,
    allow_confidential_model_context: true,
  };
  await writeFile(configPath, `${JSON.stringify(testConfig)}\n`);
  const priorConfig = process.env.APPLIED_AI_CONFIG_PATH;
  process.env.APPLIED_AI_CONFIG_PATH = configPath;
  t.after(async () => {
    if (priorConfig === undefined) delete process.env.APPLIED_AI_CONFIG_PATH;
    else process.env.APPLIED_AI_CONFIG_PATH = priorConfig;
    await rm(temporary, { recursive: true, force: true });
  });

  await assert.rejects(
    () => callTool("engagement_start", {
      engagement_id: "invalid-case", title: "", tenant: "northlake", workflow: "A workflow that must not be created",
      classification: "confidential", retention_summary: "Delete after the test",
    }),
    (error) => error.code === "INVALID_INPUT",
  );
  assert.deepEqual(await readdir(workspaceRoot), []);
  await assert.rejects(
    () => callTool("guide_search", { query: "field evidence", unexpected: true }),
    (error) => error.code === "INVALID_INPUT" && error.details.unknown.includes("unexpected"),
  );

  const engagementInput = {
    engagement_id: "northlake-claims",
    title: "NorthLake claims workflow",
    tenant: "northlake",
    workflow: "Review one denied claim and choose the next allowed move",
    classification: "confidential",
    retention_summary: "Local synthetic practice records; review monthly and delete when no longer needed",
  };
  const started = await callTool("engagement_start", engagementInput);
  assert.equal(started.status, "created");
  assert.equal(started.audit_mirror_status, "written");
  assert.equal((await callTool("engagement_start", engagementInput)).status, "exists");
  assert.equal((await callTool("engagement_list", { classification: "confidential" })).engagements[0].engagement_id, "northlake-claims");

  const search = await callTool("guide_search", { query: "representative case", stage: "field", limit: 3 });
  assert.ok(search.result_count >= 1);
  assert.equal(search.egress, "none");

  const sourceInput = {
    operation_id: "op-source-001",
    engagement_id: "northlake-claims",
    source_id: "source-case-001",
    title: "Synthetic denied claim walkthrough",
    kind: "operator-walkthrough",
    locator: "customer-governed://claims/case-001",
    owner: "claims-operations-owner",
    revision: "walkthrough-2026-08-31",
    classification: "confidential",
    authority_status: "observed",
    authority_basis: "Observed synthetic walkthrough; not a source of policy authority",
    freshness: "Observed on 2026-08-31; recheck if workflow or payer policy changes",
    limitations: "One fictional practice case; does not establish frequency, policy, or production performance",
  };
  const source = await callTool("source_register", sourceInput);
  assert.equal(source.idempotent_replay, false);
  assert.equal((await callTool("source_register", sourceInput)).idempotent_replay, true);
  await assert.rejects(
    () => callTool("source_register", { ...sourceInput, title: "Conflicting replay" }),
    (error) => error.code === "OPERATION_CONFLICT",
  );
  await assert.rejects(
    () => callTool("source_register", { ...sourceInput, operation_id: "op-source-bad", source_id: "source-secret-001", classification: "restricted", excerpt: "restricted body" }),
    (error) => error.code === "INVALID_INPUT",
  );
  await Promise.all(["002", "003"].map((suffix) => callToolInProcess(configPath, "source_register", {
    ...sourceInput,
    operation_id: `op-source-${suffix}`,
    source_id: `source-case-${suffix}`,
    title: `Concurrent synthetic source ${suffix}`,
    revision: `walkthrough-${suffix}`,
  })));

  const observation = await callTool("artifact_save_revision", {
    operation_id: "op-artifact-observation-001", engagement_id: "northlake-claims", artifact_id: "field-observation",
    artifact_type: "field-observation", format: "md", content: "# Field observation\n\nSynthetic case only. The operator reviews one denied claim.",
    source_refs: ["source-case-001"], depends_on: [], status: "proposed",
  });
  assert.equal(observation.artifact.revision, 1);
  const readObservation = await callTool("artifact_read_revision", { engagement_id: "northlake-claims", artifact_id: "field-observation", revision: 1 });
  assert.match(readObservation.content, /Synthetic case only/);
  assert.equal(readObservation.content_trust, "untrusted");

  async function reviewArtifact({ operationId, decisionId, artifact, disposition, decidedAt, supersedesDecisionId }) {
    return callTool("decision_record", {
      operation_id: operationId,
      engagement_id: "northlake-claims",
      decision_id: decisionId,
      decision_kind: "artifact_review",
      disposition,
      artifact_ref: artifact.artifact_id,
      artifact_revision: artifact.revision,
      artifact_digest: artifact.content_digest,
      actor: "fictional-claims-owner",
      authority_basis: "Named practice-case role; not independently verified by the plugin",
      scope: `${artifact.artifact_id} r${artifact.revision} only`,
      rationale: `Synthetic ${disposition} regression case`,
      evidence_refs: [artifact.artifact_id, "source-case-001"],
      decided_at: decidedAt,
      ...(supersedesDecisionId ? { supersedes_decision_id: supersedesDecisionId } : {}),
    });
  }
  await reviewArtifact({ operationId: "op-review-observation-001", decisionId: "review-observation-001", artifact: observation.artifact, disposition: "accept", decidedAt: "2026-08-31T15:00:00Z" });

  const canonicalTemplate = await readFile(path.join(root, "templates", "workflow-charter.json"), "utf8");
  const charter = await callTool("artifact_save_revision", {
    operation_id: "op-artifact-charter-001", engagement_id: "northlake-claims", artifact_id: "workflow-charter",
    artifact_type: "workflow-charter", format: "json", content: canonicalTemplate,
    source_refs: [], depends_on: ["field-observation"], status: "proposed",
  });
  assert.equal(charter.artifact.dependency_bindings[0].revision, 1);
  const validation = await callTool("artifact_validate", {
    engagement_id: "northlake-claims", artifact_id: "workflow-charter", profile: "complete", canonical_type: "workflow-charter",
  });
  assert.equal(validation.passed, true, JSON.stringify(validation));
  assert.equal(validation.canonical.passed, true, validation.canonical.stderr);
  assert.match(validation.canonical.runtime_digest, /^sha256:/);
  await reviewArtifact({ operationId: "op-review-charter-001", decisionId: "review-charter-001", artifact: charter.artifact, disposition: "accept", decidedAt: "2026-08-31T15:01:00Z" });

  await assert.rejects(
    () => reviewArtifact({
      operationId: "op-review-charter-wrong-digest", decisionId: "review-charter-wrong-digest", artifact: { ...charter.artifact, content_digest: "sha256:wrong" },
      disposition: "accept", decidedAt: "2026-08-31T15:01:30Z",
    }),
    (error) => error.code === "ARTIFACT_DIGEST_MISMATCH",
  );
  await assert.rejects(
    () => callTool("decision_record", {
      operation_id: "op-review-charter-missing-binding", engagement_id: "northlake-claims", decision_id: "review-charter-missing-binding",
      decision_kind: "artifact_review", disposition: "accept", artifact_ref: "workflow-charter",
      actor: "fictional-owner", authority_basis: "Negative test", scope: "Missing exact candidate", rationale: "Negative test",
      evidence_refs: ["workflow-charter"], decided_at: "2026-08-31T15:01:40Z",
    }),
    (error) => error.code === "INVALID_INPUT",
  );
  await assert.rejects(
    () => callTool("decision_record", {
      operation_id: "op-decision-impossible-time", engagement_id: "northlake-claims", decision_id: "decision-impossible-time", decision_kind: "engagement_disposition",
      disposition: "continue_discovery", actor: "fictional-owner", authority_basis: "Negative test", scope: "Impossible timestamp",
      rationale: "Negative test", evidence_refs: [], decided_at: "2026-02-31T12:00:00Z",
    }),
    (error) => error.code === "INVALID_INPUT",
  );
  await assert.rejects(
    () => callTool("decision_record", {
      operation_id: "op-decision-bad-time", engagement_id: "northlake-claims", decision_id: "decision-bad-time", decision_kind: "engagement_disposition",
      disposition: "continue_discovery", actor: "fictional-owner", authority_basis: "Negative test", scope: "Bad timestamp",
      rationale: "Negative test", evidence_refs: [], decided_at: "08/31/2026",
    }),
    (error) => error.code === "INVALID_INPUT",
  );

  const fixture = await callTool("artifact_save_revision", {
    operation_id: "op-artifact-fixture-001", engagement_id: "northlake-claims", artifact_id: "validation-fixture",
    artifact_type: "validation-fixture", format: "json", content: canonicalTemplate,
    source_refs: [], depends_on: [], status: "draft",
  });
  assert.equal(fixture.artifact.revision, 1);
  await assert.rejects(
    () => callTool("artifact_validate", { engagement_id: "northlake-claims", artifact_id: "validation-fixture", canonical_type: "workflow-charter" }),
    (error) => error.code === "ARTIFACT_TYPE_MISMATCH",
  );
  await assert.rejects(
    () => callTool("artifact_save_revision", {
      operation_id: "op-artifact-mistyped", engagement_id: "northlake-claims", artifact_id: "mistyped-artifact", artifact_type: "test", format: "md",
      content: "# Invalid typed edge\n", source_refs: ["field-observation"], depends_on: [], status: "draft",
    }),
    (error) => error.code === "REFERENCE_TYPE_MISMATCH",
  );
  await assert.rejects(
    () => callTool("artifact_save_revision", {
      operation_id: "op-artifact-cycle", engagement_id: "northlake-claims", artifact_id: "field-observation", artifact_type: "field-observation", format: "md",
      content: "# Invalid revision\n\nThis would make the observation depend on its downstream charter.", source_refs: ["source-case-001"], depends_on: ["workflow-charter"], status: "draft",
    }),
    (error) => error.code === "DEPENDENCY_CYCLE" && error.details.cycle.includes("field-observation"),
  );
  await assert.rejects(
    () => callTool("artifact_save_revision", {
      operation_id: "op-artifact-identity", engagement_id: "northlake-claims", artifact_id: "field-observation", artifact_type: "field-observation", format: "json",
      content: "{}", source_refs: [], depends_on: [], status: "draft",
    }),
    (error) => error.code === "ARTIFACT_IDENTITY_CONFLICT",
  );
  await assert.rejects(
    () => callTool("artifact_save_revision", {
      operation_id: "op-artifact-id-collision", engagement_id: "northlake-claims", artifact_id: "source-case-001", artifact_type: "test", format: "md",
      content: "collision", source_refs: [], depends_on: [], status: "draft",
    }),
    (error) => error.code === "IDENTIFIER_CONFLICT",
  );

  const impact = await callTool("change_impact_assess", { engagement_id: "northlake-claims", changed_refs: ["source-case-001"] });
  assert.deepEqual(impact.affected.map(({ artifact_id }) => artifact_id), ["field-observation", "workflow-charter"]);
  assert.deepEqual(impact.not_reached_by_declared_edges, [{ artifact_id: "validation-fixture", revision: 1 }]);
  assert.deepEqual(impact.unaffected, []);
  assert.ok(impact.unknown.length >= 2);
  assert.equal(impact.authority, "routing-only");

  const engagementDirectory = path.join(workspaceRoot, "northlake-claims");
  const artifactsDirectory = path.join(engagementDirectory, "artifacts");
  const savedArtifactsDirectory = path.join(engagementDirectory, "artifacts.real");
  const external = path.join(temporary, "outside");
  await mkdir(path.join(external, "escaped-artifact"), { recursive: true });
  const escapedContent = "must not escape";
  const externalTarget = path.join(external, "escaped-artifact", `r1-${digest(escapedContent).slice(7, 19)}.md`);
  await writeFile(externalTarget, "preserve this external file\n");
  await rename(artifactsDirectory, savedArtifactsDirectory);
  await symlink(external, artifactsDirectory);
  await assert.rejects(
    () => callTool("artifact_save_revision", {
      operation_id: "op-artifact-escaped", engagement_id: "northlake-claims", artifact_id: "escaped-artifact", artifact_type: "test", format: "md",
      content: escapedContent, source_refs: [], depends_on: [], status: "draft",
    }),
    (error) => error.code === "SYMLINK_DENIED",
  );
  assert.equal(await readFile(externalTarget, "utf8"), "preserve this external file\n");
  await rm(artifactsDirectory);
  await rename(savedArtifactsDirectory, artifactsDirectory);

  const auditPath = path.join(engagementDirectory, "audit.jsonl");
  const auditBackup = path.join(engagementDirectory, "audit.real.jsonl");
  const externalAudit = path.join(external, "audit.jsonl");
  await writeFile(externalAudit, "external audit sentinel\n", { mode: 0o640 });
  const externalMode = (await stat(externalAudit)).mode & 0o777;
  await rename(auditPath, auditBackup);
  await symlink(externalAudit, auditPath);
  const sourceFour = await callTool("source_register", {
    ...sourceInput, operation_id: "op-source-004", source_id: "source-case-004", title: "Audit mirror regression source", revision: "walkthrough-004",
  });
  assert.equal(sourceFour.audit_mirror_status, "degraded");
  assert.equal(await readFile(externalAudit, "utf8"), "external audit sentinel\n");
  assert.equal((await stat(externalAudit)).mode & 0o777, externalMode);
  await rm(auditPath);
  await rename(auditBackup, auditPath);

  await assert.rejects(
    () => callTool("engagement_status", { engagement_id: "../../escape" }),
    (error) => error.code === "INVALID_INPUT",
  );
  await assert.rejects(
    () => callTool("decision_record", {
      operation_id: "op-decision-id-collision", engagement_id: "northlake-claims", decision_id: "source-case-001", decision_kind: "engagement_disposition",
      disposition: "continue_discovery", actor: "fictional-owner", authority_basis: "Negative test", scope: "Collision", rationale: "Negative test",
      evidence_refs: [], decided_at: "2026-08-31T15:02:00Z",
    }),
    (error) => error.code === "IDENTIFIER_CONFLICT",
  );
  await assert.rejects(
    () => callTool("decision_record", {
      operation_id: "op-decision-invalid", engagement_id: "northlake-claims", decision_id: "decision-invalid-001", decision_kind: "release_gate",
      disposition: "bounded_kickoff", actor: "fictional-owner", authority_basis: "Not applicable", scope: "Invalid vocabulary pairing",
      rationale: "Negative test", evidence_refs: [], decided_at: "2026-08-31T15:02:00Z",
    }),
    (error) => error.code === "INVALID_INPUT",
  );
  const disposition = await callTool("decision_record", {
    operation_id: "op-decision-continue", engagement_id: "northlake-claims", decision_id: "decision-continue-001", decision_kind: "engagement_disposition",
    decision_stream_id: "engagement-main",
    disposition: "continue_discovery", actor: "fictional-claims-owner", authority_basis: "Named practice-case role; not independently verified by the plugin",
    scope: "Observe another representative denial before chartering", rationale: "One case does not establish representative payer behavior",
    evidence_refs: ["source-case-001", "field-observation"], decided_at: "2026-08-31T15:03:00Z",
  });
  assert.equal(disposition.authority_verified, false);
  assert.match((await callTool("next_field_move", { engagement_id: "northlake-claims" })).move, /Test the outcome economics/);

  const reframeOne = await callTool("artifact_save_revision", {
    operation_id: "op-reframe-001", engagement_id: "northlake-claims", artifact_id: "engagement-reframe", artifact_type: "engagement-reframe", format: "md",
    content: "# Engagement reframe\n\nFirst proposed boundary.", source_refs: ["source-case-001"], depends_on: ["field-observation"], status: "proposed",
  });
  assert.match((await callTool("next_field_move", { engagement_id: "northlake-claims" })).move, /Review the current reframe/);
  await reviewArtifact({ operationId: "op-review-reframe-001", decisionId: "review-reframe-001", artifact: reframeOne.artifact, disposition: "accept", decidedAt: "2026-08-31T15:04:00Z" });
  const reframeTwo = await callTool("artifact_save_revision", {
    operation_id: "op-reframe-002", engagement_id: "northlake-claims", artifact_id: "engagement-reframe", artifact_type: "engagement-reframe", format: "md",
    content: "# Engagement reframe\n\nSecond materially different proposal.", source_refs: ["source-case-001"], depends_on: ["field-observation"], status: "proposed",
  });
  assert.match((await callTool("next_field_move", { engagement_id: "northlake-claims" })).move, /Review the current reframe/);
  const historicalReview = await reviewArtifact({
    operationId: "op-review-reframe-001-again", decisionId: "review-reframe-001-again", artifact: reframeOne.artifact,
    disposition: "accept", decidedAt: "2026-08-31T15:04:30Z", supersedesDecisionId: "review-reframe-001",
  });
  assert.equal(historicalReview.decision.artifact_binding.revision, 1);
  assert.equal(historicalReview.decision.evidence_bindings.find(({ ref }) => ref === "engagement-reframe").revision, 1);
  assert.match((await callTool("next_field_move", { engagement_id: "northlake-claims" })).move, /Review the current reframe/);
  await reviewArtifact({ operationId: "op-review-reframe-002", decisionId: "review-reframe-002", artifact: reframeTwo.artifact, disposition: "revise", decidedAt: "2026-08-31T15:05:00Z" });
  assert.match((await callTool("next_field_move", { engagement_id: "northlake-claims" })).move, /Revise the current reframe/);
  const reframeThree = await callTool("artifact_save_revision", {
    operation_id: "op-reframe-003", engagement_id: "northlake-claims", artifact_id: "engagement-reframe", artifact_type: "engagement-reframe", format: "md",
    content: "# Engagement reframe\n\nThird proposal after scoped revision.", source_refs: ["source-case-001"], depends_on: ["field-observation"], status: "proposed",
  });
  await reviewArtifact({ operationId: "op-review-reframe-003", decisionId: "review-reframe-003", artifact: reframeThree.artifact, disposition: "accept", decidedAt: "2026-08-31T15:06:00Z" });
  assert.match((await callTool("next_field_move", { engagement_id: "northlake-claims" })).move, /Test the outcome economics/);
  const reframeFour = await callTool("artifact_save_revision", {
    operation_id: "op-reframe-004", engagement_id: "northlake-claims", artifact_id: "engagement-reframe", artifact_type: "engagement-reframe", format: "md",
    content: "# Engagement reframe\n\nFourth proposal that is rejected.", source_refs: ["source-case-001"], depends_on: ["field-observation"], status: "proposed",
  });
  await reviewArtifact({ operationId: "op-review-reframe-004", decisionId: "review-reframe-004", artifact: reframeFour.artifact, disposition: "reject", decidedAt: "2026-08-31T15:06:30Z" });
  const afterRejectedReframe = await callTool("engagement_status", { engagement_id: "northlake-claims" });
  assert.equal(afterRejectedReframe.accepted_artifacts.find(({ artifact_id }) => artifact_id === "engagement-reframe").revision, 3);
  assert.match(afterRejectedReframe.next_move.move, /Test the outcome economics/);

  const observationTwo = await callTool("artifact_save_revision", {
    operation_id: "op-artifact-observation-002", engagement_id: "northlake-claims", artifact_id: "field-observation", artifact_type: "field-observation", format: "md",
    content: "# Field observation\n\nA changed but unaccepted observation.", source_refs: ["source-case-001"], depends_on: [], status: "proposed",
  });
  const staleMove = await callTool("next_field_move", { engagement_id: "northlake-claims" });
  assert.equal(staleMove.stage, "change-impact");
  assert.ok((await callTool("engagement_status", { engagement_id: "northlake-claims" })).stale_artifacts.some(({ artifact_id }) => artifact_id === "workflow-charter"));
  await reviewArtifact({ operationId: "op-review-observation-002", decisionId: "review-observation-002", artifact: observationTwo.artifact, disposition: "reject", decidedAt: "2026-08-31T15:07:00Z" });
  const afterReject = await callTool("engagement_status", { engagement_id: "northlake-claims" });
  assert.equal(afterReject.accepted_artifacts.find(({ artifact_id }) => artifact_id === "field-observation").revision, 1);
  assert.equal(afterReject.stale_artifacts.length, 0);
  assert.match(afterReject.next_move.move, /Test the outcome economics/);

  const packet = await callTool("decision_packet_export", { operation_id: "op-export-001", engagement_id: "northlake-claims", packet_id: "current-brief" });
  assert.equal(packet.status, "exported");
  assert.match(packet.preview, /authority: observed \(unverified\)/);
  assert.equal(packet.content_trust, "untrusted");
  const packetBody = await readFile(path.join(engagementDirectory, ...packet.relative_path.split("/")), "utf8");
  assert.match(packetBody, /not customer evidence, approval, authorization/);
  assert.doesNotMatch(packetBody, /restricted body/);
  const replayedPacket = await callTool("decision_packet_export", { operation_id: "op-export-001", engagement_id: "northlake-claims", packet_id: "current-brief" });
  assert.equal(replayedPacket.idempotent_replay, true);
  assert.equal(replayedPacket.preview, undefined);
  assert.equal(replayedPacket.preview_omitted_from_replay, true);
  assert.doesNotMatch(await readFile(path.join(engagementDirectory, "engagement-state.json"), "utf8"), /# Current Decision Packet/);
  await writeFile(configPath, `${JSON.stringify({ ...testConfig, max_write_bytes: 4096 })}\n`);
  const boundedPacket = await callTool("decision_packet_export", { operation_id: "op-export-bounded", engagement_id: "northlake-claims", packet_id: "bounded-brief" });
  assert.equal(boundedPacket.status, "exported");
  assert.equal(boundedPacket.truncated, true);
  assert.ok((await stat(path.join(engagementDirectory, ...boundedPacket.relative_path.split("/")))).size <= 4096);
  await writeFile(configPath, `${JSON.stringify(testConfig)}\n`);

  const status = await callTool("engagement_status", { engagement_id: "northlake-claims" });
  assert.equal(status.counts.sources, 4);
  assert.equal(status.counts.artifact_revisions, 8);
  assert.equal(status.counts.decisions, 9);
  assert.equal(status.latest_artifacts.find(({ artifact_id }) => artifact_id === "field-observation").revision, 2);
  assert.equal(status.accepted_artifacts.find(({ artifact_id }) => artifact_id === "field-observation").revision, 1);
});

test("machine context policy, classification containment, and ambiguous stage projections fail closed", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-plugin-policy-"));
  const workspaceRoot = path.join(temporary, "engagements");
  const configPath = path.join(temporary, "config.json");
  await mkdir(workspaceRoot);
  await writeFile(configPath, `${JSON.stringify({ guide_root: root, validator_root: root, workspace_root: workspaceRoot })}\n`);
  const priorConfig = process.env.APPLIED_AI_CONFIG_PATH;
  process.env.APPLIED_AI_CONFIG_PATH = configPath;
  t.after(async () => {
    if (priorConfig === undefined) delete process.env.APPLIED_AI_CONFIG_PATH;
    else process.env.APPLIED_AI_CONFIG_PATH = priorConfig;
    await rm(temporary, { recursive: true, force: true });
  });

  await assert.rejects(
    () => callTool("engagement_start", {
      engagement_id: "confidential-case", title: "Confidential case", tenant: "tenant", workflow: "A confidential workflow",
      classification: "confidential", retention_summary: "Delete after test",
    }),
    (error) => error.code === "MODEL_CONTEXT_POLICY_DENIED",
  );
  await callTool("engagement_start", {
    engagement_id: "public-case", title: "Public synthetic case", tenant: "synthetic", workflow: "Test conservative routing",
    classification: "public", retention_summary: "Delete after test",
  });
  const baseSource = {
    operation_id: "source-boundary-001", engagement_id: "public-case", source_id: "source-boundary-001", title: "Synthetic source",
    kind: "synthetic", locator: "synthetic://source", owner: "test-owner", revision: "r1", authority_status: "unverified",
    authority_basis: "Negative test only", freshness: "Current for this test", limitations: "Synthetic",
  };
  await assert.rejects(
    () => callTool("source_register", { ...baseSource, classification: "internal" }),
    (error) => error.code === "CLASSIFICATION_BOUNDARY_VIOLATION",
  );
  await assert.rejects(
    () => callTool("source_register", { ...baseSource, operation_id: "source-boundary-002", source_id: "source-boundary-002", classification: "confidential" }),
    (error) => error.code === "MODEL_CONTEXT_POLICY_DENIED",
  );
  for (const suffix of ["one", "two"]) {
    await callTool("artifact_save_revision", {
      operation_id: `artifact-${suffix}`, engagement_id: "public-case", artifact_id: `field-${suffix}`, artifact_type: "field-observation",
      format: "md", content: `# Field ${suffix}\n`, source_refs: [], depends_on: [], status: "proposed",
    });
  }
  const move = await callTool("next_field_move", { engagement_id: "public-case" });
  assert.equal(move.skill, "$run-ai-engagement");
  assert.match(move.move, /ambiguous field-observation projection/);
  const boundedStatus = await callTool("engagement_status", { engagement_id: "public-case", limit: 1 });
  assert.equal(boundedStatus.latest_artifacts.length, 1);
  assert.equal(boundedStatus.projection_truncated, true);
  assert.equal(boundedStatus.projection_pages.latest_artifacts.next_offset, 1);
  const continuedStatus = await callTool("engagement_status", { engagement_id: "public-case", limit: 1, artifact_offset: 1 });
  assert.equal(continuedStatus.latest_artifacts.length, 1);
  assert.notEqual(continuedStatus.latest_artifacts[0].artifact_id, boundedStatus.latest_artifacts[0].artifact_id);
  const boundedImpact = await callTool("change_impact_assess", { engagement_id: "public-case", changed_refs: ["public-case"], limit: 1 });
  assert.equal(boundedImpact.not_reached_by_declared_edges.length, 1);
  assert.equal(boundedImpact.counts.not_reached_by_declared_edges, 2);
  assert.equal(boundedImpact.truncated, true);

  await callTool("engagement_start", {
    engagement_id: "reframe-case", title: "Reframe ambiguity case", tenant: "synthetic", workflow: "Test multiple reframe streams",
    classification: "public", retention_summary: "Delete after test",
  });
  for (const suffix of ["one", "two"]) {
    await callTool("artifact_save_revision", {
      operation_id: `reframe-${suffix}`, engagement_id: "reframe-case", artifact_id: `reframe-${suffix}`, artifact_type: "engagement-reframe",
      format: "md", content: `# Reframe ${suffix}\n`, source_refs: [], depends_on: [], status: "proposed",
    });
  }
  assert.match((await callTool("next_field_move", { engagement_id: "reframe-case" })).move, /ambiguous engagement-reframe projection/);

  await callTool("engagement_start", {
    engagement_id: "disposition-case", title: "Disposition precedence case", tenant: "synthetic", workflow: "Test blocking decisions",
    classification: "public", retention_summary: "Delete after test",
  });
  async function recordDisposition(operationId, decisionId, decisionKind, disposition, decidedAt, decisionStreamId, supersedesDecisionId) {
    return callTool("decision_record", {
      operation_id: operationId, engagement_id: "disposition-case", decision_id: decisionId, decision_kind: decisionKind, disposition,
      decision_stream_id: decisionStreamId,
      actor: "test-owner", authority_basis: "Synthetic authority basis; not independently verified", scope: "This synthetic route only",
      rationale: "Disposition precedence regression", evidence_refs: [], decided_at: decidedAt,
      ...(supersedesDecisionId ? { supersedes_decision_id: supersedesDecisionId } : {}),
    });
  }
  await recordDisposition("field-stop-op", "field-stop", "field_move", "stop", "2026-08-31T16:00:00Z", "field-route-a");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "stopped");
  await recordDisposition("field-unrelated-op", "field-unrelated", "field_move", "proceed", "2026-08-31T16:00:30Z", "field-route-b");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "stopped");
  await recordDisposition("field-proceed-op", "field-proceed", "field_move", "proceed", "2026-08-31T16:01:00Z", "field-route-a", "field-stop");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "field-observation");
  await recordDisposition("release-pause-op", "release-pause", "release_gate", "pause", "2026-08-31T16:02:00Z", "release-one");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "release-pause");
  await assert.rejects(
    () => recordDisposition("release-wrong-scope-op", "release-wrong-scope", "release_gate", "proceed", "2026-08-31T16:02:30Z", "release-two", "release-pause"),
    (error) => error.code === "DECISION_SUPERSESSION_CONFLICT",
  );
  await assert.rejects(
    () => callTool("decision_record", {
      operation_id: "release-changed-boundary-op", engagement_id: "disposition-case", decision_id: "release-changed-boundary",
      decision_kind: "release_gate", decision_stream_id: "release-one", supersedes_decision_id: "release-pause", disposition: "proceed",
      actor: "test-owner", authority_basis: "Synthetic authority basis; not independently verified", scope: "A different release boundary",
      rationale: "Scope mutation negative test", evidence_refs: [], decided_at: "2026-08-31T16:02:45Z",
    }),
    (error) => error.code === "DECISION_SCOPE_CONFLICT",
  );
  await recordDisposition("release-proceed-op", "release-proceed", "release_gate", "proceed", "2026-08-31T16:03:00Z", "release-one", "release-pause");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "field-observation");
  await recordDisposition("change-review-op", "change-review", "change_disposition", "review_required", "2026-08-31T16:04:00Z", "change-one");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "change-review_required");
  await recordDisposition("change-accept-op", "change-accept", "change_disposition", "accept", "2026-08-31T16:05:00Z", "change-one", "change-review");
  assert.equal((await callTool("next_field_move", { engagement_id: "disposition-case" })).stage, "field-observation");
});

test("the MCP process completes protocol initialization and lists the same bounded tools", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-plugin-rpc-"));
  const workspaceRoot = path.join(temporary, "engagements");
  const configPath = path.join(temporary, "config.json");
  await mkdir(workspaceRoot);
  await writeFile(configPath, `${JSON.stringify({ guide_root: root, workspace_root: workspaceRoot })}\n`);
  const child = spawn(process.execPath, [path.join(pluginRoot, "mcp", "server.mjs")], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, APPLIED_AI_CONFIG_PATH: configPath },
  });
  t.after(async () => {
    child.stdin.end();
    child.kill();
    await rm(temporary, { recursive: true, force: true });
  });
  const replies = [];
  let buffer = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      if (line) replies.push(JSON.parse(line));
    }
  });
  const waitFor = async (id) => {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      const found = replies.find((reply) => reply.id === id);
      if (found) return found;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(`timed out waiting for MCP reply ${id}`);
  };
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } })}\n`);
  const initialized = await waitFor(1);
  assert.equal(initialized.result.serverInfo.name, "applied-ai-local-copilot");
  assert.equal(initialized.result.serverInfo.version, "2.0.0");
  assert.deepEqual(initialized.result.capabilities, { tools: { listChanged: false } });
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
  const listed = await waitFor(2);
  assert.deepEqual(listed.result.tools.map(({ name }) => name), toolDefinitions.map(({ name }) => name));
});

test("a maximum-cardinality engagement status remains transport-deliverable and pageable", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-plugin-cardinality-"));
  const workspaceRoot = path.join(temporary, "engagements");
  const configPath = path.join(temporary, "config.json");
  await mkdir(workspaceRoot);
  await writeFile(configPath, `${JSON.stringify({ guide_root: root, validator_root: root, workspace_root: workspaceRoot })}\n`);
  t.after(() => rm(temporary, { recursive: true, force: true }));

  await callToolInProcess(configPath, "engagement_start", {
    engagement_id: "max-cardinality",
    title: "Maximum-cardinality transport regression",
    tenant: "synthetic",
    workflow: "Verify that every valid local state remains pageable through the MCP transport",
    classification: "public",
    retention_summary: "Delete after test",
  });
  const statePath = path.join(workspaceRoot, "max-cardinality", "engagement-state.json");
  const state = JSON.parse(await readFile(statePath, "utf8"));
  const fixedDigest = digest("x");
  state.artifacts = Array.from({ length: 8_766 }, (_, index) => ({
    artifact_id: `a${"x".repeat(53)}${String(index).padStart(10, "0")}`,
    artifact_type: "field-observation",
    revision: 1,
    format: "md",
    relative_path: "x",
    content_digest: fixedDigest,
    file_digest: fixedDigest,
    source_refs: [],
    depends_on: [],
    source_bindings: [],
    dependency_bindings: [],
    status: "proposed",
    created_at: "2026-08-31T00:00:00.000Z",
  }));
  state.events = [];
  state.operations = {};
  const stateBody = `${JSON.stringify(state, null, 2)}\n`;
  assert.ok(Buffer.byteLength(stateBody) < 5 * 1024 * 1024, "fixture must remain a valid local state size");
  await writeFile(statePath, stateBody);

  const { reply, bytes } = await callToolRpc(configPath, "engagement_status", { engagement_id: "max-cardinality", limit: 20 });
  assert.equal(reply.error, undefined);
  assert.ok(bytes < 1024 * 1024, "framed MCP response must stay below the transport limit");
  assert.equal(reply.result.structuredContent.latest_artifacts.length, 20);
  assert.equal(reply.result.structuredContent.projection_truncated, true);
  assert.equal(reply.result.structuredContent.projection_pages.latest_artifacts.next_offset, 20);
  assert.match(reply.result.structuredContent.next_move.move, /\(\+8761 more\)/);
  assert.match(reply.result.structuredContent.next_move.move, /engagement_status pages/);
  assert.ok(Buffer.byteLength(reply.result.content[0].text) <= 16 * 1024, "compatibility text must remain independently bounded");
});

test("the MCP transport terminates before parsing an oversized local request", async () => {
  const child = spawn(process.execPath, [path.join(pluginRoot, "mcp", "server.mjs")], { stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  const closed = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  });
  child.stdin.end(Buffer.alloc((1024 * 1024) + 1, 0x78));
  assert.equal(await closed, 1);
  assert.match(stdout, /Request exceeds the 1048576-byte local transport limit/);
});

test("the MCP transport rejects an unbounded pending request queue", async () => {
  const child = spawn(process.execPath, [path.join(pluginRoot, "mcp", "server.mjs")], { stdio: ["pipe", "pipe", "pipe"] });
  let stdout = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  const closed = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  });
  const requests = Array.from({ length: 17 }, (_, index) => JSON.stringify({ jsonrpc: "2.0", id: index + 1, method: "ping" })).join("\n");
  child.stdin.end(`${requests}\n`);
  assert.equal(await closed, 1);
  assert.match(stdout, /Pending request queue exceeds the 16-request local transport limit/);
});

test("the installer creates a versioned local package, preserves configuration, and refuses an implicit replacement", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-plugin-install-"));
  const localHome = path.join(temporary, "home");
  const engagementRoot = path.join(temporary, "engagements");
  await mkdir(localHome);
  t.after(() => rm(temporary, { recursive: true, force: true }));

  const runForHome = (home, arguments_ = []) => installForHome(home, arguments_, { APPLIED_AI_WORKSPACE_ROOT: engagementRoot });
  const run = (arguments_) => runForHome(localHome, arguments_);

  const invalidHome = path.join(temporary, "invalid-home");
  await mkdir(path.join(invalidHome, ".config", "fde"), { recursive: true });
  await writeFile(path.join(invalidHome, ".config", "fde", "config.json"), "{not-json\n");
  const invalid = runForHome(invalidHome);
  assert.notEqual(invalid.status, 0);
  assert.equal(await stat(path.join(invalidHome, "plugins", "applied-ai-field-guide")).catch(() => null), null);

  const first = run([]);
  assert.equal(first.status, 0, first.stderr);
  const installedRoot = path.join(localHome, "plugins", "applied-ai-field-guide");
  assert.equal(JSON.parse(await readFile(path.join(installedRoot, ".codex-plugin", "plugin.json"), "utf8")).version, "2.0.0");
  const configPath = path.join(localHome, ".config", "applied-ai-field-guide", "config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  assert.equal(config.guide_root, path.join(installedRoot, "guide"));
  assert.equal(config.validator_root, root);
  assert.equal(config.workspace_root, engagementRoot);
  assert.equal(config.allow_confidential_model_context, false);
  const installedSearch = await callToolInProcess(configPath, "guide_search", { query: "representative case", limit: 2 }, installedRoot);
  assert.ok(installedSearch.result_count >= 1);
  const detachedConfigPath = path.join(temporary, "detached-config.json");
  await writeFile(detachedConfigPath, `${JSON.stringify({ ...config, validator_root: path.join(temporary, "missing-checkout") })}\n`);
  const detachedSearch = await callToolInProcess(detachedConfigPath, "guide_search", { query: "representative case", limit: 2 }, installedRoot);
  assert.ok(detachedSearch.result_count >= 1);

  const refused = run([]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /already exists/);
  const replaced = run(["--replace"]);
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.match(replaced.stdout, /Previous plugin preserved/);
  assert.ok((await readdir(path.join(localHome, "plugins"))).some((entry) => entry.startsWith("applied-ai-field-guide.backup-")));
});

test("configuration resolution prefers the new path and preserves explicit legacy compatibility without unsafe fallback", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-config-migration-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const home = path.join(temporary, "home");
  const workspace = path.join(home, "engagements");
  const legacyPath = path.join(home, ".config", "fde", "config.json");
  const currentPath = path.join(home, ".config", "applied-ai-field-guide", "config.json");
  await mkdir(workspace, { recursive: true });
  await mkdir(path.dirname(legacyPath), { recursive: true });
  const config = { guide_root: root, workspace_root: workspace, max_read_bytes: 8192 };
  await writeFile(legacyPath, JSON.stringify(config));
  assert.equal((await loadConfig({ home, env: {} })).configPath, legacyPath);
  assert.equal((await loadConfig({ home, env: { FDE_CONFIG_PATH: legacyPath } })).maxReadBytes, 8192);
  await mkdir(path.dirname(currentPath));
  await writeFile(currentPath, JSON.stringify({ ...config, max_read_bytes: 16384 }));
  assert.equal((await loadConfig({ home, env: {} })).configPath, currentPath);
  assert.equal((await loadConfig({ home, env: { APPLIED_AI_CONFIG_PATH: currentPath, FDE_CONFIG_PATH: legacyPath } })).maxReadBytes, 16384);
  await assert.rejects(() => loadConfig({ home, env: { APPLIED_AI_CONFIG_PATH: path.join(home, "missing.json"), FDE_CONFIG_PATH: legacyPath } }), { code: "CONFIG_MISSING" });
  await writeFile(currentPath, "{broken");
  await assert.rejects(() => loadConfig({ home, env: {} }), { code: "CONFIG_INVALID" });
  await rm(currentPath);
  await symlink(legacyPath, currentPath);
  await assert.rejects(() => loadConfig({ home, env: {} }), { code: "CONFIG_INVALID" });
  await rm(currentPath);
  await rm(path.dirname(currentPath), { recursive: true });
  await symlink(path.dirname(legacyPath), path.dirname(currentPath));
  await assert.rejects(() => loadConfig({ home, env: {} }), { code: "CONFIG_INVALID" });
});

test("legacy migration preserves the config, installed package, immutable engagement data, and current workspace", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-legacy-install-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const home = path.join(temporary, "home");
  const workspace = path.join(home, "FDE-Engagements");
  const legacyPath = path.join(home, ".config", "fde", "config.json");
  const legacyPlugin = path.join(home, "plugins", "fde");
  await mkdir(workspace, { recursive: true });
  await mkdir(path.dirname(legacyPath), { recursive: true });
  await mkdir(legacyPlugin, { recursive: true });
  await writeFile(path.join(legacyPlugin, "installed-marker.txt"), "prior plugin, keep recoverable\n");
  const legacy = { guide_root: root, validator_root: root, workspace_root: workspace, max_read_bytes: 32768, max_write_bytes: 131072, allow_confidential_model_context: false, operator_note: "retain local policy metadata" };
  const legacyBody = `${JSON.stringify(legacy, null, 2)}\n`;
  await writeFile(legacyPath, legacyBody);
  await callToolInProcess(legacyPath, "engagement_start", { engagement_id: "existing-work", title: "Synthetic existing engagement", tenant: "synthetic-tenant", workflow: "Review the inherited workflow", classification: "internal", retention_summary: "Synthetic migration test only" });
  await callToolInProcess(legacyPath, "artifact_save_revision", { operation_id: "op-before-upgrade", engagement_id: "existing-work", artifact_id: "field-notes", artifact_type: "field-observation-log", format: "md", content: "The operator confirmed one representative case.", source_refs: [], depends_on: [], status: "draft" });
  const beforeFiles = await filesBelow(workspace);
  const before = new Map(await Promise.all(beforeFiles.map(async (file) => [file, await readFile(path.join(workspace, file))])));
  const migrated = installForHome(home);
  assert.equal(migrated.status, 0, migrated.stderr);
  assert.match(migrated.stdout, /legacy file and engagement data were not modified/);
  assert.equal(await readFile(legacyPath, "utf8"), legacyBody);
  assert.equal(await readFile(path.join(legacyPlugin, "installed-marker.txt"), "utf8"), "prior plugin, keep recoverable\n");
  assert.deepEqual(await filesBelow(workspace), beforeFiles);
  for (const [file, body] of before) assert.deepEqual(await readFile(path.join(workspace, file)), body, `${file} changed during migration`);
  const currentPath = path.join(home, ".config", "applied-ai-field-guide", "config.json");
  const current = JSON.parse(await readFile(currentPath, "utf8"));
  assert.equal(current.workspace_root, workspace);
  assert.equal(current.max_read_bytes, legacy.max_read_bytes);
  assert.equal(current.max_write_bytes, legacy.max_write_bytes);
  assert.equal(current.allow_confidential_model_context, false);
  assert.equal(current.operator_note, legacy.operator_note);
  assert.equal(await stat(path.join(home, "Applied-AI-Engagements")).catch(() => null), null);
  const status = await callToolInProcess(currentPath, "engagement_status", { engagement_id: "existing-work" }, path.join(home, "plugins", "applied-ai-field-guide"));
  assert.equal(status.latest_artifacts[0].artifact_id, "field-notes");
  assert.equal(status.latest_artifacts[0].revision, 1);

  // Once migrated, the current config wins even if the obsolete file is damaged.
  await writeFile(legacyPath, "{old config is no longer authoritative");
  const replaced = installForHome(home, ["--replace"]);
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.equal(JSON.parse(await readFile(currentPath, "utf8")).workspace_root, workspace);
  for (const [file, body] of before) assert.deepEqual(await readFile(path.join(workspace, file)), body);
});

test("installation fails closed for invalid or linked migration boundaries", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-install-boundaries-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const cases = ["missing-workspace", "invalid-workspace", "invalid-policy", "linked-config", "linked-config-directory", "linked-workspace", "linked-workspace-ancestor", "linked-plugin-target", "linked-plugin-parent"];
  for (const scenario of cases) {
    const home = path.join(temporary, scenario);
    const workspace = path.join(home, "existing-work");
    const legacyPath = path.join(home, ".config", "fde", "config.json");
    const outside = path.join(temporary, `${scenario}-outside`);
    await mkdir(workspace, { recursive: true });
    await mkdir(path.dirname(legacyPath), { recursive: true });
    await mkdir(outside);
    let config = { guide_root: root, workspace_root: workspace, allow_confidential_model_context: false };
    if (scenario === "missing-workspace") config.workspace_root = path.join(home, "missing");
    if (scenario === "invalid-workspace") config.workspace_root = 42;
    if (scenario === "invalid-policy") config.allow_confidential_model_context = "true";
    await writeFile(legacyPath, JSON.stringify(config));
    if (scenario === "linked-config") {
      await rename(legacyPath, path.join(outside, "config.json"));
      await symlink(path.join(outside, "config.json"), legacyPath);
    }
    if (scenario === "linked-config-directory") {
      await rename(path.dirname(legacyPath), path.join(outside, "config"));
      await symlink(path.join(outside, "config"), path.dirname(legacyPath));
    }
    if (scenario === "linked-workspace" || scenario === "linked-workspace-ancestor") {
      await rm(workspace, { recursive: true });
      await symlink(outside, workspace);
      if (scenario === "linked-workspace-ancestor") {
        await mkdir(path.join(outside, "nested"));
        config.workspace_root = path.join(workspace, "nested");
        await writeFile(legacyPath, JSON.stringify(config));
      }
    }
    if (scenario === "linked-plugin-target") {
      await mkdir(path.join(home, "plugins"));
      await symlink(outside, path.join(home, "plugins", "applied-ai-field-guide"));
    }
    if (scenario === "linked-plugin-parent") await symlink(outside, path.join(home, "plugins"));
    const outsideFiles = await filesBelow(outside);
    const failed = installForHome(home, ["--replace"]);
    assert.notEqual(failed.status, 0, `${scenario} must be refused`);
    assert.equal(await stat(path.join(home, ".config", "applied-ai-field-guide", "config.json")).catch(() => null), null, scenario);
    assert.deepEqual(await filesBelow(outside), outsideFiles, `${scenario} mutated the link destination`);
  }
});

test("fresh installation uses the new workspace default and explicit workspace overrides have stable precedence", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-fresh-install-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const home = path.join(temporary, "home");
  await mkdir(home);
  const fresh = installForHome(home);
  assert.equal(fresh.status, 0, fresh.stderr);
  const configPath = path.join(home, ".config", "applied-ai-field-guide", "config.json");
  assert.equal(JSON.parse(await readFile(configPath, "utf8")).workspace_root, path.join(home, "Applied-AI-Engagements"));
  const selected = path.join(home, "selected-work");
  const ignored = path.join(home, "ignored-work");
  const replaced = installForHome(home, ["--replace"], { APPLIED_AI_WORKSPACE_ROOT: selected, FDE_WORKSPACE_ROOT: ignored });
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.equal(JSON.parse(await readFile(configPath, "utf8")).workspace_root, selected);
  assert.equal(await stat(ignored).catch(() => null), null);
  assert.ok((await stat(path.join(home, "Applied-AI-Engagements"))).isDirectory(), "override must not remove the previous workspace");
});

test("custom configuration paths migrate deliberately and never overwrite the legacy source", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-custom-config-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const home = path.join(temporary, "home");
  const workspace = path.join(home, "existing-work");
  await mkdir(workspace, { recursive: true });
  const legacyPath = path.join(home, "prior-settings.json");
  const customPath = path.join(home, "settings", "current.json");
  const body = JSON.stringify({ guide_root: root, workspace_root: workspace, allow_confidential_model_context: true });
  await writeFile(legacyPath, body);
  const identical = installForHome(home, [], { APPLIED_AI_CONFIG_PATH: legacyPath, FDE_CONFIG_PATH: legacyPath });
  assert.notEqual(identical.status, 0);
  assert.match(identical.stderr, /paths must differ/);
  assert.equal(await readFile(legacyPath, "utf8"), body);
  const installed = installForHome(home, [], { APPLIED_AI_CONFIG_PATH: customPath, FDE_CONFIG_PATH: legacyPath });
  assert.equal(installed.status, 0, installed.stderr);
  const config = JSON.parse(await readFile(customPath, "utf8"));
  assert.equal(config.workspace_root, workspace);
  assert.equal(config.allow_confidential_model_context, true);
  assert.equal(await readFile(legacyPath, "utf8"), body);
  assert.equal(await stat(path.join(home, ".config", "applied-ai-field-guide", "config.json")).catch(() => null), null);
});

test("replacement refuses overlapping workspace and configuration paths before mutating any installed files", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-install-overlap-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  for (const scenario of ["workspace-equal", "workspace-child", "workspace-ancestor", "config-child", "config-equal", "legacy-config-child"]) {
    const home = path.join(temporary, scenario);
    const target = path.join(home, "plugins", "applied-ai-field-guide");
    const workspace = scenario === "workspace-equal" ? target : scenario === "workspace-child" ? path.join(target, "engagements") : scenario === "workspace-ancestor" ? path.dirname(target) : path.join(home, "engagements");
    await mkdir(target, { recursive: true });
    await mkdir(workspace, { recursive: true });
    await writeFile(path.join(target, "installed-marker.txt"), "existing package must remain in place\n");
    await writeFile(path.join(workspace, "existing-evidence.txt"), "immutable engagement evidence\n");
    const configPath = scenario === "config-child" || scenario === "legacy-config-child" ? path.join(target, "settings", "config.json") : path.join(home, ".config", "applied-ai-field-guide", "config.json");
    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, JSON.stringify({ guide_root: root, workspace_root: workspace }));
    const env = scenario === "legacy-config-child" ? { FDE_CONFIG_PATH: configPath } : scenario === "config-equal" ? { APPLIED_AI_CONFIG_PATH: target } : { APPLIED_AI_CONFIG_PATH: configPath };
    const beforeFiles = await filesBelow(home);
    const before = new Map(await Promise.all(beforeFiles.map(async (file) => [file, await readFile(path.join(home, file))])));
    const refused = installForHome(home, ["--replace"], env);
    assert.notEqual(refused.status, 0, scenario);
    assert.match(refused.stderr, /cannot overlap|configuration cannot be stored inside/, scenario);
    assert.deepEqual(await filesBelow(home), beforeFiles, `${scenario} changed the file inventory`);
    for (const [file, body] of before) assert.deepEqual(await readFile(path.join(home, file)), body, `${scenario} changed ${file}`);
    assert.deepEqual((await readdir(path.dirname(target))).sort(), scenario === "workspace-ancestor" ? ["applied-ai-field-guide", "existing-evidence.txt"] : ["applied-ai-field-guide"], `${scenario} must not create a backup or staging package`);
  }
});

test("an explicitly missing legacy source fails before creating fresh configuration or workspace", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "guide-missing-legacy-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const home = path.join(temporary, "home");
  const target = path.join(home, "plugins", "applied-ai-field-guide");
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, "installed-marker.txt"), "keep existing package\n");
  const beforeFiles = await filesBelow(home);
  const refused = installForHome(home, ["--replace"], { FDE_CONFIG_PATH: path.join(home, "mistyped-legacy.json") });
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /explicit legacy configuration is missing/);
  assert.deepEqual(await filesBelow(home), beforeFiles);
  assert.equal(await readFile(path.join(target, "installed-marker.txt"), "utf8"), "keep existing package\n");
  assert.equal(await stat(path.join(home, "Applied-AI-Engagements")).catch(() => null), null);
  assert.equal(await stat(path.join(home, ".config")).catch(() => null), null);
});
