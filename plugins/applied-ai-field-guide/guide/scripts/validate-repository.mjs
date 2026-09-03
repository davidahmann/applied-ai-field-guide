import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  capabilityAuthorityDigest as authorityDigest,
  capabilityBuildAttestationDigest as buildAttestationDigest,
  capabilityRegistryDecisionDigest as registryDecisionDigest,
  canonicalDigestVersion,
  canonicalJson,
  changeImpactAssessmentSemanticErrors,
  embeddedToolSchemaErrors,
  evaluationCaseSemanticErrors,
  evaluationReportSemanticErrors,
  evaluationSandboxDigestPayload,
  expectedEvaluationEnvironmentDigest,
  expectedEvaluationOutputDigest,
  ontologyIdentityErrors,
  patternCatalogErrors,
  solutionReleaseSemanticErrors,
  sha256Digest,
  systemMapManifestSemanticErrors,
  toolContractSemanticErrors,
  valueScorecardSemanticErrors,
} from "./contract-invariants.mjs";
import {
  capabilityManifestSemanticErrors,
  dataContextManifestSemanticErrors,
  engagementReframeSemanticErrors,
  effectReceiptSemanticErrors,
  handoffEnvelopeSemanticErrors,
  operationalOntologySemanticErrors,
  traceEventSemanticErrors,
  workflowCharterSemanticErrors,
} from "./governance-invariants.mjs";
import { markdownAnchors } from "./markdown-anchors.mjs";
import {
  agentArtifactReferences,
  capabilityManifestReferences,
  classifyReference,
  documentationLinkDestinations,
  evaluationReportReferences,
  expectedDocumentSchema,
  expectedCatalogTypes,
  isGovernedJsonDocument,
  isWithinDirectory,
  localLinkDocuments,
  resolveWithinRepository,
  solutionReleaseReferences,
} from "./repository-paths.mjs";

const defaultRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const root = process.env.REPOSITORY_VALIDATION_ROOT
  ? path.resolve(process.env.REPOSITORY_VALIDATION_ROOT)
  : defaultRoot;
const ignoredDirectories = new Set([".git", "node_modules", "coverage", "site-dist"]);
const ignoredRelativePrefixes = ["plugins/applied-ai-field-guide/guide", "plugins/applied-ai-field-guide/skills"];
const textExtensions = new Set([".cff", ".css", ".json", ".md", ".mjs", ".js", ".spdx", ".svg", ".txt", ".yml", ".yaml"]);
const textBasenames = new Set([".editorconfig", ".gitattributes", ".gitignore", "CODEOWNERS", "LICENSE", "Makefile", "NOTICE"]);
const failures = [];

function fail(message) {
  failures.push(message);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    const targetRelative = path.relative(root, target).split(path.sep).join("/");
    if (entry.isDirectory() && ignoredRelativePrefixes.some((prefix) => targetRelative === prefix || targetRelative.startsWith(`${prefix}/`))) continue;
    if (entry.isDirectory()) files.push(...await walk(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function declaredArtifactVersion(document) {
  return typeof document?.version === "string" ? document.version : null;
}

function declaredSchemaVersion(document) {
  return typeof document?.schema_version === "string" ? document.schema_version : null;
}

function javascriptDependencySpecifiers(body) {
  const specifiers = new Set();
  for (const pattern of [
    /\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ]) {
    for (const match of body.matchAll(pattern)) specifiers.add(match[1]);
  }
  return specifiers;
}

function javascriptLocalDataSpecifiers(body) {
  const specifiers = new Set();
  for (const match of body.matchAll(/["']((?:\.\.?\/|(?:tools|schemas)\/)[^"']+\.json)["']/g)) {
    specifiers.add(match[1]);
  }
  return specifiers;
}

function importedPackageName(specifier) {
  if (specifier.startsWith("node:") || specifier.startsWith(".") || specifier.startsWith("/")) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function lifecycleEvidenceSubject(referenceKind, evidence) {
  if (!evidence || typeof evidence !== "object") return null;
  if (referenceKind === "deployment_evidence") {
    const { verification_uri: _uri, verification_digest: _digest, ...subject } = evidence;
    return subject;
  }
  const { evidence_uri: _uri, evidence_digest: _digest, ...subject } = evidence;
  return subject;
}

function lifecycleSubjectDigest(referenceKind, subject) {
  return `sha256:${createHash("sha256")
    .update(`production-agent-engineering/canonical-json/v1/${referenceKind}\0`)
    .update(canonicalJson(subject))
    .digest("hex")}`;
}

function domainSeparatedDigest(domain, value) {
  return sha256Digest(Buffer.concat([
    Buffer.from(`${canonicalDigestVersion}/${domain}\0`, "utf8"),
    Buffer.from(canonicalJson(value), "utf8"),
  ]));
}

function sameStringSet(left = [], right = []) {
  return left.length === right.length && new Set(left).size === left.length
    && left.every((value) => right.includes(value));
}

function sameCanonicalSet(left = [], right = []) {
  const leftValues = left.map((value) => canonicalJson(value));
  const rightValues = right.map((value) => canonicalJson(value));
  return sameStringSet(leftValues, rightValues);
}

function contractAuthorityErrors(manifest, contract, label) {
  const errors = [];
  const authority = manifest?.authority ?? {};
  const expectedDataClasses = [...new Set([
    ...(contract?.data_access?.classifications ?? []),
    ...(contract?.data_access?.request_fields ?? []).map((field) => field.classification),
  ].filter((classification) => classification && classification !== "none"))];
  const expectedCredentialMode = contract?.network?.credential_broker === "none"
    || contract?.network?.egress === "none"
    ? "none"
    : "short_lived_brokered";
  if (contract?.authorization?.caller_context_required === true
    && (authority.actor_modes ?? []).some((mode) => mode === "unattended_workload")) {
    errors.push(`${label} authority actor_modes admit an unattended caller despite a caller-bound tool contract`);
  }
  if (!sameStringSet(authority.scopes, contract?.authorization?.required_scopes ?? [])) {
    errors.push(`${label} authority scopes do not equal the bound tool contract scopes`);
  }
  if (!sameStringSet(authority.data_classes, expectedDataClasses)) {
    errors.push(`${label} authority data_classes do not equal the bound tool contract data exposure`);
  }
  if (authority.effect_ceiling !== contract?.side_effects?.class) {
    errors.push(`${label} authority effect_ceiling does not equal the bound tool contract effect class`);
  }
  if (authority.egress !== contract?.network?.egress) {
    errors.push(`${label} authority egress does not equal the bound tool contract network policy`);
  }
  if (!sameCanonicalSet(authority.destinations, contract?.network?.destinations ?? [])) {
    errors.push(`${label} authority destinations do not equal the bound tool contract destinations`);
  }
  if (authority.credential_mode !== expectedCredentialMode) {
    errors.push(`${label} authority credential_mode does not equal the bound tool contract credential boundary`);
  }
  if (authority.tenant_binding !== contract?.authorization?.tenant_binding
    || authority.tenant_binding !== contract?.network?.tenant_binding) {
    errors.push(`${label} authority tenant binding does not equal the bound tool contract`);
  }
  return errors;
}

async function sha256Path(target, metadata = null) {
  metadata ??= await stat(target);
  const hash = createHash("sha256");
  if (metadata.isFile()) {
    hash.update(await readFile(target));
    return `sha256:${hash.digest("hex")}`;
  }
  if (!metadata.isDirectory()) throw new Error("target is neither a regular file nor a directory");
  hash.update("directory\0");

  async function appendDirectory(directory, prefix = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    for (const entry of entries) {
      const repositoryName = path.posix.join(prefix, entry.name);
      const child = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`directory digest rejects symbolic link ${repositoryName}`);
      if (entry.isDirectory()) {
        hash.update(`directory\0${repositoryName}\0`);
        await appendDirectory(child, repositoryName);
      } else if (entry.isFile()) {
        hash.update(`file\0${repositoryName}\0`);
        hash.update(await readFile(child));
        hash.update("\0");
      } else {
        throw new Error(`directory digest rejects special entry ${repositoryName}`);
      }
    }
  }

  await appendDirectory(target);
  return `sha256:${hash.digest("hex")}`;
}

function collectControlIds(value, ids = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectControlIds(item, ids));
    return ids;
  }
  if (!value || typeof value !== "object") return ids;
  for (const [key, item] of Object.entries(value)) {
    if (key === "control_ids" && Array.isArray(item)) {
      item.filter((id) => typeof id === "string").forEach((id) => ids.add(id));
    } else {
      collectControlIds(item, ids);
    }
  }
  return ids;
}

function duplicateJsonKey(body) {
  let cursor = 0;
  const whitespace = /\s/;

  function skipWhitespace() {
    while (cursor < body.length && whitespace.test(body[cursor])) cursor += 1;
  }

  function parseString() {
    const start = cursor;
    cursor += 1;
    while (cursor < body.length) {
      if (body[cursor] === "\\") {
        cursor += 2;
      } else if (body[cursor] === "\"") {
        cursor += 1;
        return JSON.parse(body.slice(start, cursor));
      } else {
        cursor += 1;
      }
    }
    return "";
  }

  function parseValue() {
    skipWhitespace();
    if (body[cursor] === "{") return parseObject();
    if (body[cursor] === "[") return parseArray();
    if (body[cursor] === "\"") {
      parseString();
      return null;
    }
    while (cursor < body.length && !/[\s,}\]]/.test(body[cursor])) cursor += 1;
    return null;
  }

  function parseArray() {
    cursor += 1;
    skipWhitespace();
    while (cursor < body.length && body[cursor] !== "]") {
      const duplicate = parseValue();
      if (duplicate) return duplicate;
      skipWhitespace();
      if (body[cursor] === ",") {
        cursor += 1;
        skipWhitespace();
      }
    }
    cursor += 1;
    return null;
  }

  function parseObject() {
    cursor += 1;
    skipWhitespace();
    const keys = new Set();
    while (cursor < body.length && body[cursor] !== "}") {
      const key = parseString();
      if (keys.has(key)) return { key };
      keys.add(key);
      skipWhitespace();
      cursor += 1;
      const duplicate = parseValue();
      if (duplicate) return duplicate;
      skipWhitespace();
      if (body[cursor] === ",") {
        cursor += 1;
        skipWhitespace();
      }
    }
    cursor += 1;
    return null;
  }

  return parseValue();
}

const files = await walk(root);
const textFiles = files.filter((file) => textExtensions.has(path.extname(file)) || textBasenames.has(path.basename(file)));
const contents = new Map();

for (const file of textFiles) {
  const body = await readFile(file, "utf8");
  contents.set(file, body);
  if (body.length === 0) fail(`${relative(file)} is empty`);
  body.split("\n").forEach((line, index) => {
    if (/[ \t]+$/.test(line)) fail(`${relative(file)}:${index + 1} has trailing whitespace`);
  });
  if (/(?:\/Users\/|file:\/\/|(?<![A-Za-z0-9+.-])[A-Za-z]:[\\/])/i.test(body)) {
    fail(`${relative(file)} contains a machine-local path`);
  }
  if (relative(file) !== "scripts/validate-repository.mjs" && /\b(?:FIXME|TBD|TODO|XXX)\b|(?<!\$)\{\{[^}]+\}\}|\[INSERT[^\]]*\]/.test(body)) {
    fail(`${relative(file)} contains an unresolved placeholder`);
  }
}

const requiredPublicFiles = [
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/design-proposal.yml",
  ".github/ISSUE_TEMPLATE/evidence-correction.yml",
  ".github/ISSUE_TEMPLATE/field-signal.yml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/dependabot.yml",
  ".github/workflows/pages.yml",
  ".github/workflows/validate.yml",
  "AGENTS.md",
  "CHANGELOG.md",
  "CITATION.cff",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "GOVERNANCE.md",
  "LICENSE",
  "NOTICE",
  "README.md",
  "SECURITY.md",
  "SUPPORT.md",
  "llms.txt",
];
for (const requiredFile of requiredPublicFiles) {
  try {
    await stat(path.join(root, requiredFile));
  } catch {
    fail(`missing required public-repository file ${requiredFile}`);
  }
}

const retiredRepositoryUrl = ["github.com/davidahmann", "agents"].join("/");
for (const [file, body] of contents) {
  if (body.includes(retiredRepositoryUrl)) {
    fail(`${relative(file)} contains the retired repository URL`);
  }
}

const readme = contents.get(path.join(root, "README.md")) ?? "";
if (!readme.startsWith("# The Applied AI Field Guide\n")) {
  fail("README.md does not use the canonical project title");
}
if (!readme.includes("not an external compliance standard")) {
  fail("README.md does not state the control-catalog boundary");
}

const citation = contents.get(path.join(root, "CITATION.cff")) ?? "";
for (const field of [
  "cff-version: 1.2.0",
  "title: \"The Applied AI Field Guide\"",
  "repository-code: \"https://github.com/davidahmann/applied-ai-field-guide\"",
  "license: Apache-2.0",
]) {
  if (!citation.includes(field)) fail(`CITATION.cff is missing required metadata: ${field}`);
}

const apacheLicense = contents.get(path.join(root, "LICENSE")) ?? "";
const apacheLicenseSha256 = createHash("sha256").update(apacheLicense).digest("hex");
if (apacheLicenseSha256 !== "c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4") {
  fail("LICENSE does not match the canonical Apache-2.0 text");
}

const jsonFiles = files.filter((file) => path.extname(file) === ".json");
const documents = new Map();
for (const file of jsonFiles) {
  try {
    const body = await readFile(file, "utf8");
    const document = JSON.parse(body);
    const duplicateKey = duplicateJsonKey(body);
    if (duplicateKey) throw new Error(`duplicate object key ${JSON.stringify(duplicateKey.key)}`);
    documents.set(file, document);
  } catch (error) {
    fail(`${relative(file)} is not valid JSON: ${error.message}`);
  }
}

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const schemaFiles = jsonFiles.filter((file) => relative(file).startsWith("schemas/"));
for (const file of schemaFiles) {
  const schema = documents.get(file);
  if (!schema) continue;
  const expectedSchemaId = `https://github.com/davidahmann/applied-ai-field-guide/${relative(file)}`;
  if (schema.$id !== expectedSchemaId) {
    fail(`${relative(file)} has non-canonical $id ${schema.$id ?? "<missing>"}`);
  }
  try {
    ajv.addSchema(schema);
  } catch (error) {
    fail(`${relative(file)} schema compilation failed: ${error.message}`);
  }
}

const packageMetadata = documents.get(path.join(root, "package.json"));
if (packageMetadata) {
  if (packageMetadata.name !== "applied-ai-field-guide") fail("package.json has a non-canonical package name");
  if (packageMetadata.license !== "Apache-2.0") fail("package.json must declare Apache-2.0");
  if (packageMetadata.private !== true) fail("package.json must prevent accidental registry publication");
  if (packageMetadata.repository?.url !== "git+https://github.com/davidahmann/applied-ai-field-guide.git") {
    fail("package.json has a non-canonical repository URL");
  }
  if (!citation.includes(`version: ${packageMetadata.version}`)) {
    fail("CITATION.cff version does not match package.json");
  }
}

for (const [file, document] of documents) {
  if (schemaFiles.includes(file)) continue;
  const repositoryPath = relative(file);
  const governed = isGovernedJsonDocument(repositoryPath, document);
  const expectedSchema = expectedDocumentSchema(repositoryPath, document);
  if (!governed && !document?.$schema?.startsWith(".")) continue;
  if (governed && !expectedSchema) {
    fail(`${repositoryPath} is governed JSON without an expected schema binding`);
    continue;
  }

  let schemaPath;
  if (typeof document?.$schema !== "string" || !document.$schema.startsWith(".")) {
    fail(`${repositoryPath} must declare a repository-relative $schema`);
  } else {
    try {
      ({ lexicalTarget: schemaPath } = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: document.$schema,
        requireRegularFile: true,
      }));
    } catch (error) {
      fail(`${repositoryPath} declares unsafe or missing schema ${document.$schema}: ${error.message}`);
    }
  }

  if (expectedSchema) {
    const expectedSchemaPath = path.join(root, expectedSchema);
    if (schemaPath && schemaPath !== expectedSchemaPath) {
      fail(`${repositoryPath} declares ${relative(schemaPath)}, expected ${expectedSchema}`);
    }
    schemaPath = expectedSchemaPath;
  }

  const schema = documents.get(schemaPath);
  if (!schema) {
    fail(`${repositoryPath} declares missing schema ${document.$schema ?? "<missing>"}`);
    continue;
  }
  const validate = ajv.getSchema(schema.$id);
  if (!validate) {
    fail(`${repositoryPath} schema ${relative(schemaPath)} was not compiled`);
    continue;
  }
  if (!validate(document)) {
    const errors = validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
    fail(`${repositoryPath} fails ${relative(schemaPath)}: ${errors}`);
  }
}

for (const [file, tool] of documents) {
  if (!tool?.tool_id) continue;
  for (const error of embeddedToolSchemaErrors(tool, relative(file))) fail(error);
  for (const error of toolContractSemanticErrors(tool, relative(file))) fail(error);
}
for (const [file, report] of documents) {
  if (report?.assessment_id && report?.hard_gates && Array.isArray(report?.factors)) {
    for (const error of valueScorecardSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.context_manifest_id && Array.isArray(report?.data_planes) && Array.isArray(report?.sources)) {
    for (const error of dataContextManifestSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.case_id && report?.reference_authority && report?.expected) {
    for (const error of evaluationCaseSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.report_id && report?.system && report?.suite) {
    for (const error of evaluationReportSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.release_id && Array.isArray(report?.artifacts)) {
    for (const error of solutionReleaseSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.workflow_id && report?.functional_requirement && report?.decision) {
    for (const error of workflowCharterSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.record_id && report?.inherited_brief && Array.isArray(report?.claims)) {
    for (const error of engagementReframeSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.map_id && Array.isArray(report?.sources) && Array.isArray(report?.relations)) {
    for (const error of systemMapManifestSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.ontology_id && Array.isArray(report?.entities)) {
    for (const error of operationalOntologySemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.handoff_id && report?.authority && report?.attestation) {
    for (const error of handoffEnvelopeSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.capability_id && report?.provenance && report?.authority) {
    if (report.status !== "approved") {
      for (const error of capabilityManifestSemanticErrors(report, relative(file))) fail(error);
    }
  }
  if (report?.event_name === "agent.state.transition" && report?.telemetry) {
    for (const error of traceEventSemanticErrors(report, relative(file))) fail(error);
  }
  if (report?.effect_id && report?.service_receipt && report?.readback) {
    for (const error of effectReceiptSemanticErrors(report, relative(file))) fail(error);
  }
}

for (const [file, assessment] of documents) {
  if (!assessment?.assessment_id || !assessment?.system_map || !Array.isArray(assessment?.impacted_elements)) continue;
  let map = null;
  let mapPath = null;
  try {
    ({ lexicalTarget: mapPath } = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: assessment.system_map.uri,
      requireRegularFile: true,
    }));
    map = documents.get(mapPath) ?? null;
  } catch (error) {
    fail(`${relative(file)} system_map.uri is unsafe or missing: ${error.message}`);
  }
  if (map && mapPath) {
    if (assessment.system_map.version !== map.version) fail(`${relative(file)} system_map.version does not match ${relative(mapPath)}`);
    if (assessment.system_map.status !== map.status) fail(`${relative(file)} system_map.status does not match ${relative(mapPath)}`);
    if (assessment.system_map.digest !== await sha256Path(mapPath)) {
      fail(`${relative(file)} system_map.digest does not match ${relative(mapPath)}`);
    }
  }
  for (const error of changeImpactAssessmentSemanticErrors(assessment, map, relative(file))) fail(error);
}

const catalog = documents.get(path.join(root, "catalog.json"));
const catalogPaths = new Map();
if (catalog) {
  const ids = new Set();
  for (const artifact of catalog.artifacts ?? []) {
    if (typeof artifact?.path !== "string") {
      fail(`catalog.json artifact ${artifact?.id ?? "<unknown>"} has a non-string path`);
      continue;
    }
    if (ids.has(artifact.id)) fail(`catalog.json duplicates artifact ID ${artifact.id}`);
    ids.add(artifact.id);

    if (catalogPaths.has(artifact.path)) {
      fail(`catalog.json maps ${artifact.path} to both ${catalogPaths.get(artifact.path).id} and ${artifact.id}`);
    }
    catalogPaths.set(artifact.path, artifact);

    if (path.posix.normalize(artifact.path) !== artifact.path) {
      fail(`catalog.json uses non-normalized path ${artifact.path}`);
    }

    try {
      await resolveWithinRepository({
        root,
        baseDirectory: root,
        candidate: artifact.path,
        requireRegularFile: true,
      });
    } catch (error) {
      fail(`catalog.json points to unsafe or missing regular file ${artifact.path}: ${error.message}`);
    }

    const allowedTypes = expectedCatalogTypes(artifact.path);
    if (allowedTypes && !allowedTypes.has(artifact.type)) {
      fail(`catalog.json classifies ${artifact.path} as ${artifact.type}, expected ${[...allowedTypes].join(" or ")}`);
    }
  }

  for (const file of files) {
    const repositoryPath = relative(file);
    if (expectedCatalogTypes(repositoryPath) && !catalogPaths.has(repositoryPath)) {
      fail(`catalog.json omits governed artifact ${repositoryPath}`);
    }
  }
}

const controlCatalog = documents.get(path.join(root, "controls/control-catalog.json"));
const definedControls = new Set();
const evidenceIds = new Set();
for (const content of contents.values()) {
  for (const match of content.matchAll(/<a\s+id=["']((?:r26|s)[0-9-]+)["']/gi)) evidenceIds.add(match[1].toUpperCase());
}
if (controlCatalog) {
  for (const control of controlCatalog.controls ?? []) {
    if (definedControls.has(control.id)) fail(`control catalog duplicates ${control.id}`);
    definedControls.add(control.id);
    for (const evidence of control.evidence ?? []) {
      if (evidence.startsWith("internal-")) continue;
      if (!evidenceIds.has(evidence.toUpperCase())) fail(`${control.id} references missing evidence ${evidence}`);
    }
  }
}
const controlPrefixes = new Set([...definedControls].map((controlId) => controlId.slice(0, 3)));

for (const [file, document] of documents) {
  if (!document?.patterns) continue;
  for (const error of patternCatalogErrors(document, evidenceIds, relative(file))) fail(error);
}

for (const [file, document] of documents) {
  for (const controlId of collectControlIds(document)) {
    if (!definedControls.has(controlId)) fail(`${relative(file)} references undefined control ${controlId}`);
  }
}
for (const [file, content] of contents) {
  if (path.extname(file) !== ".md") continue;
  for (const match of content.matchAll(/\b[A-Z]{3}-[0-9]{3}\b/g)) {
    if (!controlPrefixes.has(match[0].slice(0, 3))) continue;
    if (!definedControls.has(match[0])) fail(`${relative(file)} references undefined control ${match[0]}`);
  }
}

const markdownFiles = files.filter((file) => path.extname(file) === ".md");
const anchorsByFile = new Map();
for (const file of markdownFiles) anchorsByFile.set(file, markdownAnchors(contents.get(file) ?? ""));

const localLinkFiles = localLinkDocuments(root, markdownFiles);
for (const file of localLinkFiles) {
  const content = contents.get(file) ?? "";
  for (const linkDestination of documentationLinkDestinations(content)) {
    let destination = linkDestination.trim();
    if (destination.startsWith("<") && destination.endsWith(">")) destination = destination.slice(1, -1);
    const reference = classifyReference(destination, ["http", "https", "mailto"]);
    if (reference.kind === "external") continue;
    if (reference.kind !== "local") {
      fail(`${relative(file)} uses unsupported or absolute link ${destination}`);
      continue;
    }
    const [rawPath, fragment] = destination.split("#", 2);
    let target = file;
    if (rawPath) {
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(rawPath);
      } catch {
        fail(`${relative(file)} contains invalid URL encoding in ${destination}`);
        continue;
      }
      try {
        ({ lexicalTarget: target } = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(file),
          candidate: decodedPath,
        }));
      } catch (error) {
        fail(`${relative(file)} links to unsafe or missing local path ${destination}: ${error.message}`);
        continue;
      }
    }
    if (!rawPath) {
      try {
        await stat(target);
      } catch {
        fail(`${relative(file)} links to missing local path ${destination}`);
        continue;
      }
    }
    if (fragment && path.extname(target) === ".md") {
      let decodedFragment;
      try {
        decodedFragment = decodeURIComponent(fragment);
      } catch {
        fail(`${relative(file)} contains invalid anchor encoding in ${destination}`);
        continue;
      }
      const anchors = anchorsByFile.get(target) ?? markdownAnchors(await readFile(target, "utf8"));
      if (!anchors.has(decodedFragment)) fail(`${relative(file)} links to missing anchor ${destination}`);
    }
  }
}

const explicitAnchorLocations = new Map();
for (const [file, content] of contents) {
  for (const match of content.matchAll(/<a\s+(?:name|id)=["']([^"']+)["'][^>]*>/gi)) {
    const key = `${relative(file)}#${match[1]}`;
    if (explicitAnchorLocations.has(key)) fail(`${key} is duplicated`);
    explicitAnchorLocations.set(key, true);
  }
}

const evalIds = new Set();
for (const [file, document] of documents) {
  if (!document?.case_id) continue;
  if (evalIds.has(document.case_id)) fail(`evaluation case ID ${document.case_id} is duplicated`);
  evalIds.add(document.case_id);
  const weight = (document.graders ?? []).reduce((sum, grader) => sum + grader.weight, 0);
  if (Math.abs(weight - 1) > 1e-9) fail(`${relative(file)} grader weights total ${weight}, expected 1`);
}

for (const [file, ontology] of documents) {
  if (!ontology?.ontology_id) continue;
  for (const error of ontologyIdentityErrors(ontology, relative(file))) fail(error);
  const entities = new Set((ontology.entities ?? []).map((entity) => entity.entity_id));
  const policies = new Set((ontology.policies ?? []).map((policy) => policy.policy_id));
  for (const relationship of ontology.relationships ?? []) {
    if (!entities.has(relationship.from)) fail(`${relative(file)} relationship ${relationship.relationship_id} has unknown from entity ${relationship.from}`);
    if (!entities.has(relationship.to)) fail(`${relative(file)} relationship ${relationship.relationship_id} has unknown to entity ${relationship.to}`);
  }
  for (const action of ontology.actions ?? []) {
    for (const entity of [...action.input_entities, ...action.output_entities]) {
      if (!entities.has(entity)) fail(`${relative(file)} action ${action.action_id} references unknown entity ${entity}`);
    }
    if (!policies.has(action.authorization_policy)) {
      fail(`${relative(file)} action ${action.action_id} references unknown policy ${action.authorization_policy}`);
    }
  }
}

for (const [file, threatModel] of documents) {
  if (!threatModel?.threats || !threatModel?.assets) continue;
  const assets = new Set(threatModel.assets.map((asset) => asset.asset_id));
  for (const threat of threatModel.threats) {
    for (const asset of threat.affected_assets) {
      if (!assets.has(asset)) fail(`${relative(file)} threat ${threat.threat_id} references unknown asset ${asset}`);
    }
    for (const caseId of threat.test_case_ids) {
      if (!evalIds.has(caseId)) fail(`${relative(file)} threat ${threat.threat_id} references unknown evaluation case ${caseId}`);
    }
  }
}

for (const [file, agent] of documents) {
  if (!agent?.system_id || !Array.isArray(agent?.tools) || !agent?.context) continue;
  for (const reference of agentArtifactReferences(agent)) {
    const classification = classifyReference(reference.uri, []);
    if (classification.kind !== "local") {
      fail(`${relative(file)} has unsupported or absolute ${reference.field} ${reference.uri}`);
      continue;
    }

    let resolved;
    try {
      resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: reference.uri,
        requireRegularFile: reference.requireRegularFile,
      });
    } catch (error) {
      fail(`${relative(file)} has unsafe or missing ${reference.field} ${reference.uri}: ${error.message}`);
      continue;
    }

    const targetDocument = documents.get(resolved.lexicalTarget);
    const targetRepositoryPath = relative(resolved.lexicalTarget);
    if (reference.kind === "workflow_charter"
      && (expectedDocumentSchema(targetRepositoryPath, targetDocument) !== "schemas/workflow-charter.schema.json" || !targetDocument?.workflow_id)) {
      fail(`${relative(file)} ${reference.field} does not reference a parsed workflow charter`);
    }
    if (reference.kind === "ontology"
      && (expectedDocumentSchema(targetRepositoryPath, targetDocument) !== "schemas/operational-ontology.schema.json" || !targetDocument?.ontology_id)) {
      fail(`${relative(file)} ${reference.field} does not reference a parsed operational ontology`);
    }
    if (reference.kind === "tool_contract") {
      if (expectedDocumentSchema(targetRepositoryPath, targetDocument) !== "schemas/tool-contract.schema.json" || !targetDocument?.tool_id) {
        fail(`${relative(file)} ${reference.field} does not reference a parsed tool contract`);
      } else if (targetDocument.tool_id !== reference.toolId) {
        fail(`${relative(file)} declares tool ${reference.toolId}, but ${relative(resolved.lexicalTarget)} declares ${targetDocument.tool_id}`);
      } else {
        if (targetDocument.authorization?.agent_principal !== agent.actor_identity?.agent_principal) {
          fail(`${relative(file)} tool ${reference.toolId} agent principal does not match actor_identity.agent_principal`);
        }
        try {
          const charterResolution = await resolveWithinRepository({
            root,
            baseDirectory: path.dirname(file),
            candidate: agent.charter_uri,
            requireRegularFile: true,
          });
          const charter = documents.get(charterResolution.lexicalTarget);
          const effectRank = new Map([["none", 0], ["staged", 1], ["reversible", 2], ["irreversible", 3]]);
          if ((effectRank.get(targetDocument.side_effects?.class) ?? Number.POSITIVE_INFINITY)
            > (effectRank.get(charter?.scope?.maximum_effect) ?? -1)) {
            fail(`${relative(file)} tool ${reference.toolId} exceeds the workflow charter maximum_effect`);
          }
        } catch {
          // The charter reference pass reports malformed workflow-charter references.
        }
      }
    }
    if (reference.kind === "capability_manifest") {
      if (expectedDocumentSchema(targetRepositoryPath, targetDocument) !== "schemas/capability-manifest.schema.json"
        || !targetDocument?.capability_id) {
        fail(`${relative(file)} ${reference.field} does not reference a governed capability manifest`);
      } else {
        const observedDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
        if (observedDigest !== reference.digest) {
          fail(`${relative(file)} ${reference.field} manifest_digest does not match ${targetRepositoryPath} (${observedDigest})`);
        }
        if (targetDocument.capability_id !== reference.capabilityId
          || targetDocument.version !== reference.version
          || targetDocument.authority?.digest !== reference.authorityDigest) {
          fail(`${relative(file)} ${reference.field} identity, version, or authority digest does not match ${targetRepositoryPath}`);
        }
        if (targetDocument.kind !== "tool") {
          fail(`${relative(file)} ${reference.field} is not a tool capability`);
        }
        if (["disabled", "retired"].includes(targetDocument.status)) {
          fail(`${relative(file)} ${reference.field} references a ${targetDocument.status} capability`);
        }
        if (!(targetDocument.authority?.actor_modes ?? []).includes(agent.actor_identity?.mode)) {
          fail(`${relative(file)} ${reference.field} does not admit actor mode ${agent.actor_identity?.mode}`);
        }
        if (!(targetDocument.runtime?.supported_harness_versions ?? []).includes(agent.behavior?.harness?.version)) {
          fail(`${relative(file)} ${reference.field} does not support harness version ${agent.behavior?.harness?.version}`);
        }
        if (!(targetDocument.authority?.scopes ?? []).every((scope) => agent.actor_identity?.authority_scope?.includes(scope))) {
          fail(`${relative(file)} ${reference.field} authority exceeds the agent actor authority_scope`);
        }
        if (targetDocument.authority?.egress === "allowlist" && agent.controls?.egress !== "allowlist") {
          fail(`${relative(file)} ${reference.field} egress exceeds the agent control boundary`);
        }
        try {
          const manifestContract = await resolveWithinRepository({
            root,
            baseDirectory: path.dirname(resolved.lexicalTarget),
            candidate: targetDocument.artifacts?.tool_contract?.uri,
            requireRegularFile: true,
          });
          const agentContract = await resolveWithinRepository({
            root,
            baseDirectory: path.dirname(file),
            candidate: reference.contractUri,
            requireRegularFile: true,
          });
          if (manifestContract.lexicalTarget !== agentContract.lexicalTarget) {
            fail(`${relative(file)} ${reference.field} binds a different tool contract than ${reference.toolId}`);
          }
        } catch {
          // The governed-reference passes report malformed manifest or contract references.
        }
      }
    }
    if (reference.kind === "behavior_bundle") {
      if (expectedDocumentSchema(targetRepositoryPath, targetDocument) !== "schemas/behavior-bundle.schema.json"
        || !targetDocument?.bundle_id) {
        fail(`${relative(file)} ${reference.field} does not reference a governed behavior bundle`);
      } else {
        const observedDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
        if (observedDigest !== reference.digest) {
          fail(`${relative(file)} ${reference.field} digest does not match ${targetRepositoryPath} (${observedDigest})`);
        }
        if (targetDocument.schema_version !== reference.schemaVersion) {
          fail(`${relative(file)} ${reference.field} schema_version does not match ${targetRepositoryPath}`);
        }
        const component = (targetDocument.components ?? []).find((candidate) => candidate.component_id === reference.componentId);
        if (!component || component.role !== reference.behaviorRole || component.version !== reference.version) {
          fail(`${relative(file)} ${reference.field} does not bind the declared component ID, role, and version`);
        }
        if (targetDocument.status === "retired") {
          fail(`${relative(file)} ${reference.field} references a retired behavior bundle`);
        }
      }
    }
    if (reference.kind === "evaluation_suite") {
      const ownerDirectory = path.dirname(file);
      const directoryContainsCase = resolved.metadata.isDirectory()
        && path.basename(resolved.lexicalTarget) === "evals"
        && isWithinDirectory(ownerDirectory, resolved.lexicalTarget)
        && [...documents].some(([candidate, document]) => candidate.startsWith(`${resolved.lexicalTarget}${path.sep}`)
          && expectedDocumentSchema(relative(candidate), document) === "schemas/evaluation-case.schema.json"
          && document?.case_id);
      const validEvaluationFile = resolved.metadata.isFile()
        && isWithinDirectory(ownerDirectory, resolved.lexicalTarget)
        && expectedDocumentSchema(targetRepositoryPath, targetDocument) === "schemas/evaluation-case.schema.json"
        && targetDocument?.case_id;
      const validEvaluationSuite = directoryContainsCase || validEvaluationFile;
      if (!validEvaluationSuite) fail(`${relative(file)} ${reference.field} is not an owned evaluation case or evals directory`);
    }
    if (reference.kind === "trace_contract" || reference.kind === "incident_runbook") {
      const catalogEntry = catalogPaths.get(targetRepositoryPath);
      const validTraceContract = reference.kind === "trace_contract"
        && catalogEntry?.type === "standard"
        && catalogEntry.tags?.includes("observability")
        && catalogEntry.tags?.includes("trace");
      const validIncidentRunbook = reference.kind === "incident_runbook"
        && catalogEntry?.type === "runbook"
        && catalogEntry.tags?.includes("incident")
        && catalogEntry.tags?.includes("recovery");
      const validOperationsContract = path.extname(resolved.lexicalTarget) === ".md"
        && (validTraceContract || validIncidentRunbook);
      if (!validOperationsContract) fail(`${relative(file)} ${reference.field} is not a cataloged Markdown operations contract`);
    }
  }

  const boundToolKinds = new Set();
  for (const tool of agent.tools) {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: tool.contract_uri,
        requireRegularFile: true,
      });
      boundToolKinds.add(documents.get(resolved.lexicalTarget)?.kind);
    } catch {
      // The agent-reference pass reports malformed tool contracts.
    }
  }
  if (!boundToolKinds.has("commit_write")
    && ((agent.workflow?.states ?? []).includes("committed")
      || (agent.workflow?.terminal_states ?? []).includes("committed"))) {
    fail(`${relative(file)} declares committed workflow state without a bound commit_write tool`);
  }
  try {
    const ontologyResolution = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: agent.context.ontology_uri,
      requireRegularFile: true,
    });
    const ontology = documents.get(ontologyResolution.lexicalTarget);
    if (!boundToolKinds.has("commit_write")
      && (ontology?.entities ?? []).some((entity) => entity.lifecycle_states?.includes("committed"))) {
      fail(`${relative(file)} ontology declares committed lifecycle state without a bound commit_write tool`);
    }
  } catch {
    // The ontology reference pass reports malformed ontology contracts.
  }

  const behaviorBundlePaths = new Set();
  for (const reference of agentArtifactReferences(agent).filter((candidate) => candidate.kind === "behavior_bundle")) {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: reference.uri,
        requireRegularFile: true,
      });
      behaviorBundlePaths.add(resolved.lexicalTarget);
    } catch {
      // The agent-reference pass reports malformed behavior references.
    }
  }
  for (const bundlePath of behaviorBundlePaths) {
    const bundle = documents.get(bundlePath);
    const declaredMembers = bundle?.tool_members ?? [];
    if (declaredMembers.length !== agent.tools.length) {
      fail(`${relative(file)} behavior tool_bundle does not contain exactly the agent tool set`);
      continue;
    }
    for (const tool of agent.tools) {
      const member = declaredMembers.find((candidate) => candidate.tool_id === tool.tool_id);
      if (!member) {
        fail(`${relative(file)} behavior tool_bundle omits ${tool.tool_id}`);
        continue;
      }
      try {
        const [memberContract, agentContract, memberCapability, agentCapability] = await Promise.all([
          resolveWithinRepository({ root, baseDirectory: path.dirname(bundlePath), candidate: member.contract_uri, requireRegularFile: true }),
          resolveWithinRepository({ root, baseDirectory: path.dirname(file), candidate: tool.contract_uri, requireRegularFile: true }),
          resolveWithinRepository({ root, baseDirectory: path.dirname(bundlePath), candidate: member.capability_manifest_uri, requireRegularFile: true }),
          resolveWithinRepository({ root, baseDirectory: path.dirname(file), candidate: tool.capability?.manifest_uri, requireRegularFile: true }),
        ]);
        if (memberContract.lexicalTarget !== agentContract.lexicalTarget
          || memberCapability.lexicalTarget !== agentCapability.lexicalTarget
          || member.capability_id !== tool.capability?.capability_id
          || member.capability_version !== tool.capability?.version
          || member.capability_manifest_digest !== tool.capability?.manifest_digest
          || member.authority_digest !== tool.capability?.authority_digest) {
          fail(`${relative(file)} behavior tool_bundle member ${tool.tool_id} does not equal the agent tool and capability binding`);
        }
        const contract = documents.get(agentContract.lexicalTarget);
        const contractDigest = await sha256Path(agentContract.lexicalTarget, agentContract.metadata);
        if (member.contract_version !== contract?.version
          || member.contract_schema_version !== contract?.schema_version
          || member.contract_digest !== contractDigest) {
          fail(`${relative(file)} behavior tool_bundle member ${tool.tool_id} does not bind the exact tool contract bytes`);
        }
      } catch {
        // The governed-reference passes report malformed member references.
      }
    }
  }
}

const governedReferenceChecks = [
  {
    predicate: (document) => document?.report_id && document?.system && document?.suite,
    references: evaluationReportReferences,
  },
  {
    predicate: (document) => document?.release_id && Array.isArray(document?.artifacts),
    references: solutionReleaseReferences,
  },
  {
    predicate: (document) => document?.capability_id && document?.provenance && document?.assurance,
    references: capabilityManifestReferences,
  },
];
const referenceSchemas = new Map([
  ["workflow_charter", "schemas/workflow-charter.schema.json"],
  ["agent_system", "schemas/agent-system.schema.json"],
  ["behavior_bundle", "schemas/behavior-bundle.schema.json"],
  ["capability_manifest", "schemas/capability-manifest.schema.json"],
  ["data_context", "schemas/data-context-manifest.schema.json"],
  ["evaluation_case", "schemas/evaluation-case.schema.json"],
  ["evaluation_output", "schemas/evaluation-output.schema.json"],
  ["evaluation", "schemas/evaluation-report.schema.json"],
  ["evaluation_report", "schemas/evaluation-report.schema.json"],
  ["domain_model", "schemas/operational-ontology.schema.json"],
  ["tool_contract", "schemas/tool-contract.schema.json"],
  ["threat_model", "schemas/threat-model.schema.json"],
]);

for (const [file, document] of documents) {
  for (const check of governedReferenceChecks) {
    if (!check.predicate(document)) continue;
    for (const reference of check.references(document)) {
      const classification = classifyReference(reference.uri, []);
      if (classification.kind !== "local") {
        fail(`${relative(file)} has unsupported or absolute ${reference.field} ${reference.uri}`);
        continue;
      }

      let resolved;
      try {
        resolved = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(file),
          candidate: reference.uri,
          requireRegularFile: reference.requireRegularFile ?? true,
        });
      } catch (error) {
        fail(`${relative(file)} has unsafe or missing ${reference.field} ${reference.uri}: ${error.message}`);
        continue;
      }

      const expectedReferenceSchema = referenceSchemas.get(reference.kind);
      if (reference.kind === "evaluation_case" && resolved.metadata.isDirectory()) {
        const directoryContainsCase = [...documents].some(([candidate, candidateDocument]) => candidate.startsWith(`${resolved.lexicalTarget}${path.sep}`)
          && expectedDocumentSchema(relative(candidate), candidateDocument) === "schemas/evaluation-case.schema.json"
          && candidateDocument?.case_id);
        if (!directoryContainsCase) fail(`${relative(file)} ${reference.field} does not contain a governed evaluation case`);
        continue;
      }
      if (expectedReferenceSchema && expectedDocumentSchema(relative(resolved.lexicalTarget), documents.get(resolved.lexicalTarget)) !== expectedReferenceSchema) {
        fail(`${relative(file)} ${reference.field} does not reference ${expectedReferenceSchema}`);
      }
    }
  }
}

for (const [file, manifest] of documents) {
  if (!manifest?.capability_id || !manifest?.provenance || !manifest?.assurance) continue;
  const label = relative(file);
  const references = capabilityManifestReferences(manifest);
  const sbomReference = references.find((reference) => reference.kind === "sbom");
  const contractReference = references.find((reference) => reference.kind === "tool_contract");
  const executableReference = references.find((reference) => reference.kind === "capability_executable");
  const observedDigests = {};

  const expectedAuthorityDigest = authorityDigest(manifest.authority);
  if (manifest.authority?.digest !== expectedAuthorityDigest) {
    fail(`${label} authority.digest does not match the canonical admitted authority (${expectedAuthorityDigest})`);
  }
  if (manifest.provenance?.artifact_digest !== manifest.artifacts?.executable_digest) {
    fail(`${label} provenance artifact_digest does not equal artifacts.executable_digest`);
  }
  if (manifest.provenance?.attestation?.subject_artifact_digest !== manifest.provenance?.artifact_digest
    || manifest.provenance?.attestation?.subject_tool_contract_digest !== manifest.artifacts?.tool_contract?.digest) {
    fail(`${label} build attestation is not bound to the exact executable and tool contract`);
  }
  const expectedAttestationDigest = buildAttestationDigest(manifest.provenance?.attestation);
  if (manifest.provenance?.build_attestation_digest !== expectedAttestationDigest) {
    fail(`${label} build_attestation_digest does not match the canonical embedded attestation (${expectedAttestationDigest})`);
  }
  const registry = manifest.provenance?.registry_record ?? {};
  if (registry.decision !== manifest.status
    || registry.capability_id !== manifest.capability_id
    || registry.capability_version !== manifest.version
    || registry.artifact_digest !== manifest.provenance?.artifact_digest
    || registry.tool_contract_digest !== manifest.artifacts?.tool_contract?.digest
    || registry.authority_digest !== manifest.authority?.digest) {
    fail(`${label} registry record does not bind the manifest identity, status, artifact, tool contract, and authority`);
  }
  const expectedRegistryDigest = registryDecisionDigest(registry);
  if (registry.decision_digest !== expectedRegistryDigest) {
    fail(`${label} registry decision_digest does not match the canonical registry decision (${expectedRegistryDigest})`);
  }

  if (!contractReference) {
    fail(`${label} omits its tool-contract binding`);
  } else {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: contractReference.uri,
        requireRegularFile: true,
      });
      const contract = documents.get(resolved.lexicalTarget);
      const observedDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
      if (observedDigest !== contractReference.digest
        || contract?.tool_id !== contractReference.toolId
        || contract?.version !== contractReference.version
        || contract?.schema_version !== contractReference.schemaVersion) {
        fail(`${label} tool-contract binding does not match the exact governed contract identity and bytes`);
      }
      if (manifest.artifacts?.input_schema_digest !== sha256Digest(contract?.input_schema)
        || manifest.artifacts?.output_schema_digest !== sha256Digest(contract?.output_schema)) {
        fail(`${label} embedded input/output schema digests do not match the bound tool contract`);
      }
      for (const error of contractAuthorityErrors(manifest, contract, label)) fail(error);
      observedDigests.input_schema = sha256Digest(contract?.input_schema);
      observedDigests.output_schema = sha256Digest(contract?.output_schema);
      observedDigests.tool_contract = observedDigest;
    } catch {
      // The governed-reference pass reports unsafe or missing tool-contract references.
    }
  }

  if (executableReference) {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: executableReference.uri,
        requireRegularFile: true,
      });
      const observedDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
      if (observedDigest !== executableReference.digest) {
        fail(`${label} executable_digest does not match ${relative(resolved.lexicalTarget)} (${observedDigest})`);
      }
      observedDigests.artifact = observedDigest;
      observedDigests.executable = observedDigest;
    } catch {
      // The governed-reference pass reports unsafe or missing executable references.
    }
  } else if (manifest.status === "approved") {
    fail(`${label} approved capability omits a resolvable executable artifact`);
  }

  if (!sbomReference) {
    fail(`${label} omits its SBOM reference`);
    continue;
  }
  try {
    const resolved = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: sbomReference.uri,
      requireRegularFile: true,
    });
    const observedDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
    if (observedDigest !== sbomReference.digest) {
      fail(`${label} provenance.sbom_digest does not match ${relative(resolved.lexicalTarget)} (${observedDigest})`);
    }
    observedDigests.sbom = observedDigest;
    const sbom = await readFile(resolved.lexicalTarget, "utf8");
    for (const requiredField of ["SPDXVersion:", "SPDXID:", "DocumentNamespace:", "PackageName:", "PackageChecksum:"]) {
      if (!sbom.includes(requiredField)) fail(`${label} SBOM omits ${requiredField}`);
    }
  } catch {
    // The governed-reference pass reports unsafe or missing capability references.
  }

  if (manifest.status === "approved") {
    const externalTrustErrors = new Set([
      `${label} build attestation was not verified by a trusted key`,
      `${label} registry decision was not verified`,
    ]);
    for (const error of capabilityManifestSemanticErrors(manifest, label, {
      observedDigests,
    })) {
      // Repository validation proves exact structure and byte bindings. Runtime admission
      // must call the semantic helper with an independently configured trust verifier.
      if (!externalTrustErrors.has(error)) fail(error);
    }
  }
}

for (const [file, report] of documents) {
  if (!report?.report_id || !report?.system || !report?.suite) continue;
  const resolvedReportReferences = new Map();
  for (const reference of evaluationReportReferences(report)) {
    let resolved;
    try {
      resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: reference.uri,
        requireRegularFile: reference.requireRegularFile,
      });
    } catch {
      continue;
    }
    if (!resolvedReportReferences.has(reference.kind)) resolvedReportReferences.set(reference.kind, []);
    resolvedReportReferences.get(reference.kind).push({ reference, resolved });

    if (reference.kind === "agent_system") {
      const agent = documents.get(resolved.lexicalTarget);
      const agentVersion = declaredArtifactVersion(agent);
      if (reference.version !== agentVersion) {
        fail(`${relative(file)} system.system_version ${reference.version} does not match ${relative(resolved.lexicalTarget)} version ${agentVersion ?? "<missing>"}`);
      }
      const agentDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
      if (report.system.system_digest !== agentDigest) {
        fail(`${relative(file)} system.system_digest does not match ${relative(resolved.lexicalTarget)} (${agentDigest})`);
      }
      try {
        const declaredSuite = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(resolved.lexicalTarget),
          candidate: agent?.verification?.evaluation_suite_uri,
        });
        const evaluatedSuite = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(file),
          candidate: report.suite.uri,
        });
        if (declaredSuite.lexicalTarget !== evaluatedSuite.lexicalTarget) {
          fail(`${relative(file)} suite.uri does not equal the agent system evaluation suite`);
        }
      } catch {
        // The governed-reference passes report malformed suite references.
      }

      if (report.resource_budgets?.max_turns > agent?.workflow?.max_steps) {
        fail(`${relative(file)} max_turns exceeds the agent system max_steps`);
      }
      if (report.resource_budgets?.max_wall_time_ms > agent?.workflow?.time_budget_ms) {
        fail(`${relative(file)} max_wall_time_ms exceeds the agent system time budget`);
      }
      if (report.resource_budgets?.max_cost_usd > agent?.economics?.max_cost_per_run_usd) {
        fail(`${relative(file)} max_cost_usd exceeds the agent system per-run cost budget`);
      }

      const behaviorRoles = new Map([
        ["model_route", "model_route"],
        ["prompt_bundle", "prompt_bundle"],
        ["tool_bundle", "tool_bundle"],
        ["context_policy", "context_policy"],
        ["guardrail_bundle", "guardrail_policy"],
      ]);
      for (const component of report.system.component_manifest ?? []) {
        const behavior = agent?.behavior?.[behaviorRoles.get(component.role)];
        if (!behavior) {
          fail(`${relative(file)} component ${component.role} is absent from ${relative(resolved.lexicalTarget)}`);
        } else if (component.version !== behavior.version || component.digest !== behavior.digest) {
          fail(`${relative(file)} component ${component.role} does not match ${relative(resolved.lexicalTarget)}`);
        }
      }
      const harness = report.system.environment?.harness;
      if (agent?.behavior?.harness
        && (harness?.version !== agent.behavior.harness.version || harness?.digest !== agent.behavior.harness.digest)) {
        fail(`${relative(file)} evaluation harness does not match ${relative(resolved.lexicalTarget)}`);
      }
    }

    if (reference.kind === "evaluation_case") {
      let suiteDigest;
      try {
        suiteDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
      } catch (error) {
        fail(`${relative(file)} cannot digest suite.uri ${reference.uri}: ${error.message}`);
        continue;
      }
      if (reference.digest !== suiteDigest) {
        fail(`${relative(file)} suite.digest does not match ${relative(resolved.lexicalTarget)} (${suiteDigest})`);
      }

      if (resolved.metadata.isFile()) {
        const suiteDocument = documents.get(resolved.lexicalTarget);
        const suiteVersion = declaredArtifactVersion(suiteDocument);
        const suiteSchemaVersion = declaredSchemaVersion(suiteDocument);
        if (reference.version !== suiteVersion) {
          fail(`${relative(file)} suite.version ${reference.version ?? "<none>"} does not match ${relative(resolved.lexicalTarget)} version ${suiteVersion ?? "<none>"}`);
        }
        if (reference.schemaVersion !== suiteSchemaVersion) {
          fail(`${relative(file)} suite.schema_version ${reference.schemaVersion} does not match ${relative(resolved.lexicalTarget)} schema_version ${suiteSchemaVersion ?? "<missing>"}`);
        }
      } else {
        const suiteCases = [...documents]
          .filter(([candidate, candidateDocument]) => candidate.startsWith(`${resolved.lexicalTarget}${path.sep}`)
            && expectedDocumentSchema(relative(candidate), candidateDocument) === "schemas/evaluation-case.schema.json"
            && candidateDocument?.case_id)
          .map(([, candidateDocument]) => candidateDocument);
        if (suiteCases.length === 0
          || suiteCases.some((candidateDocument) => declaredSchemaVersion(candidateDocument) !== reference.schemaVersion)) {
          fail(`${relative(file)} suite.schema_version ${reference.schemaVersion} does not match every governed case in ${relative(resolved.lexicalTarget)}`);
        }
        const declaredSuiteVersions = new Set(suiteCases.map(declaredArtifactVersion));
        if (declaredSuiteVersions.size !== 1 || !declaredSuiteVersions.has(reference.version)) {
          fail(`${relative(file)} suite.version ${reference.version ?? "<none>"} does not match every governed case in ${relative(resolved.lexicalTarget)}`);
        }
      }
    }

    if (["evaluation_fixture", "evaluation_grader", "evaluation_runner", "evaluation_output", "evaluation_runtime", "evaluation_policy", "evaluation_world", "evaluation_dependency"].includes(reference.kind)) {
      const componentDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
      if (reference.digest !== componentDigest) {
        fail(`${relative(file)} ${reference.field} digest does not match ${relative(resolved.lexicalTarget)} (${componentDigest})`);
      }
      const componentDocument = documents.get(resolved.lexicalTarget);
      let componentVersion = declaredArtifactVersion(componentDocument);
      if (reference.kind === "evaluation_runtime" && componentVersion === null) {
        componentVersion = report.system.environment?.harness?.version ?? null;
      }
      const componentSchemaVersion = declaredSchemaVersion(componentDocument);
      if (reference.version !== componentVersion) {
        fail(`${relative(file)} ${reference.field} version ${reference.version ?? "<none>"} does not match ${relative(resolved.lexicalTarget)} version ${componentVersion ?? "<none>"}`);
      }
      if (reference.schemaVersion !== componentSchemaVersion) {
        fail(`${relative(file)} ${reference.field} schema_version ${reference.schemaVersion} does not match ${relative(resolved.lexicalTarget)} schema_version ${componentSchemaVersion ?? "<none>"}`);
      }
      if (reference.kind === "evaluation_fixture"
        && expectedDocumentSchema(relative(resolved.lexicalTarget), componentDocument) !== "schemas/evaluation-case.schema.json") {
        fail(`${relative(file)} ${reference.field} is not a governed evaluation-case fixture`);
      }
      if (["evaluation_grader", "evaluation_runner"].includes(reference.kind)
        && ![".js", ".mjs", ".cjs", ".wasm"].includes(path.extname(resolved.lexicalTarget))) {
        fail(`${relative(file)} ${reference.field} is not an executable evaluator artifact`);
      }
    }
  }

  const suiteResolution = resolvedReportReferences.get("evaluation_case")?.[0]?.resolved;
  const fixtureResolution = resolvedReportReferences.get("evaluation_fixture")?.[0]?.resolved;
  const graderResolution = resolvedReportReferences.get("evaluation_grader")?.[0]?.resolved;
  const runnerResolution = resolvedReportReferences.get("evaluation_runner")?.[0]?.resolved;
  if (suiteResolution && fixtureResolution) {
    const fixtureIsSuiteFile = suiteResolution.metadata.isFile()
      && fixtureResolution.lexicalTarget === suiteResolution.lexicalTarget;
    const fixtureIsInSuiteDirectory = suiteResolution.metadata.isDirectory()
      && isWithinDirectory(suiteResolution.lexicalTarget, fixtureResolution.lexicalTarget);
    if (!fixtureIsSuiteFile && !fixtureIsInSuiteDirectory) {
      fail(`${relative(file)} suite.fixture_uri is not a member of the immutable evaluation suite`);
    }
  }
  if (graderResolution && fixtureResolution
    && graderResolution.lexicalTarget === fixtureResolution.lexicalTarget) {
    fail(`${relative(file)} evaluator.grader.uri cannot reuse the evaluation fixture`);
  }
  if (graderResolution && suiteResolution
    && (graderResolution.lexicalTarget === suiteResolution.lexicalTarget
      || (suiteResolution.metadata.isDirectory()
        && isWithinDirectory(suiteResolution.lexicalTarget, graderResolution.lexicalTarget)))) {
    fail(`${relative(file)} evaluator.grader.uri must be isolated from the evaluation suite`);
  }
  if (graderResolution && runnerResolution
    && graderResolution.lexicalTarget !== runnerResolution.lexicalTarget) {
    const runnerImportsGrader = [...javascriptDependencySpecifiers(contents.get(runnerResolution.lexicalTarget) ?? "")]
      .filter((specifier) => specifier.startsWith("."))
      .some((specifier) => path.resolve(path.dirname(runnerResolution.lexicalTarget), specifier) === graderResolution.lexicalTarget);
    if (!runnerImportsGrader) {
      fail(`${relative(file)} evaluator.runner.uri does not execute the bound grader artifact`);
    }
  }

  const dependencyResolutions = resolvedReportReferences.get("evaluation_dependency") ?? [];
  const dependencyPaths = new Set(dependencyResolutions.map(({ resolved }) => resolved.lexicalTarget));
  const evaluatedAgentPath = resolvedReportReferences.get("agent_system")?.[0]?.resolved?.lexicalTarget;
  const evaluatedAgent = documents.get(evaluatedAgentPath);
  const evaluatedRuntimePath = resolvedReportReferences.get("evaluation_runtime")?.[0]?.resolved?.lexicalTarget;
  if (evaluatedAgent && evaluatedRuntimePath) {
    try {
      const harnessReference = evaluatedAgent.behavior?.harness;
      const bundleResolution = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(evaluatedAgentPath),
        candidate: harnessReference.uri,
        requireRegularFile: true,
      });
      const bundle = documents.get(bundleResolution.lexicalTarget);
      const harness = (bundle?.components ?? []).find((component) => (
        component.role === "harness" && component.component_id === harnessReference.component_id
      ));
      const runtimeResolution = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(bundleResolution.lexicalTarget),
        candidate: harness?.configuration?.runtime_uri,
        requireRegularFile: true,
      });
      const runtimeDigest = await sha256Path(runtimeResolution.lexicalTarget, runtimeResolution.metadata);
      if (runtimeResolution.lexicalTarget !== evaluatedRuntimePath
        || harness?.version !== report.system.environment.runtime.version
        || harness?.configuration?.runtime_digest !== runtimeDigest
        || report.system.environment.runtime.digest !== runtimeDigest) {
        fail(`${relative(file)} evaluation runtime does not equal the versioned behavior-bundle harness artifact`);
      }
    } catch {
      fail(`${relative(file)} cannot resolve the versioned behavior-bundle runtime binding`);
    }
  }
  for (const agentReference of (evaluatedAgent ? agentArtifactReferences(evaluatedAgent) : [])
    .filter((reference) => ["ontology", "behavior_bundle", "tool_contract", "capability_manifest"].includes(reference.kind))) {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(evaluatedAgentPath),
        candidate: agentReference.uri,
        requireRegularFile: true,
      });
      if (!dependencyPaths.has(resolved.lexicalTarget)) {
        fail(`${relative(file)} environment dependencies omit evaluated ${agentReference.kind} ${relative(resolved.lexicalTarget)}`);
      }
    } catch {
      // The agent-reference pass reports malformed dependency references.
    }
  }

  const boundEvaluatorPaths = new Set(
    [...resolvedReportReferences.values()]
      .flat()
      .filter(({ resolved }) => resolved.metadata.isFile())
      .map(({ resolved }) => resolved.lexicalTarget),
  );
  boundEvaluatorPaths.add(file);
  for (const [candidatePath, candidateDocument] of documents) {
    if (!candidateDocument?.release_id || !candidateDocument?.evaluation_report_uri) continue;
    try {
      const candidateEvaluation = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(candidatePath),
        candidate: candidateDocument.evaluation_report_uri,
        requireRegularFile: true,
      });
      if (candidateEvaluation.lexicalTarget === file) boundEvaluatorPaths.add(candidatePath);
    } catch {
      // Governed reference validation reports malformed release envelopes.
    }
  }
  const packageLocks = dependencyResolutions
    .filter(({ resolved }) => path.basename(resolved.lexicalTarget) === "package-lock.json")
    .map(({ resolved }) => documents.get(resolved.lexicalTarget))
    .filter(Boolean);
  for (const modulePath of boundEvaluatorPaths) {
    if (![".js", ".mjs", ".cjs"].includes(path.extname(modulePath))) continue;
    const moduleBody = contents.get(modulePath) ?? "";
    for (const specifier of javascriptDependencySpecifiers(moduleBody)) {
      if (specifier.startsWith(".")) {
        try {
          const imported = await resolveWithinRepository({
            root,
            baseDirectory: path.dirname(modulePath),
            candidate: specifier,
            requireRegularFile: true,
          });
          if (!boundEvaluatorPaths.has(imported.lexicalTarget)) {
            fail(`${relative(file)} evaluator dependency closure omits ${relative(imported.lexicalTarget)} imported by ${relative(modulePath)}`);
          }
        } catch {
          // Repository reference and runtime tests report missing local modules.
        }
        continue;
      }
      const packageName = importedPackageName(specifier);
      if (packageName && !packageLocks.some((lock) => lock?.packages?.[`node_modules/${packageName}`])) {
        fail(`${relative(file)} evaluator dependency closure has no bound lock entry for package ${packageName}`);
      }
    }
    for (const specifier of javascriptLocalDataSpecifiers(moduleBody)) {
      try {
        const imported = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(modulePath),
          candidate: specifier,
          requireRegularFile: true,
        });
        if (!boundEvaluatorPaths.has(imported.lexicalTarget)) {
          fail(`${relative(file)} evaluator dependency closure omits ${relative(imported.lexicalTarget)} read by ${relative(modulePath)}`);
        }
      } catch {
        // Runtime verification reports paths assembled relative to a different explicit base.
      }
    }
  }

  if (report.decision?.status === "accept" && report.evaluator?.output?.uri) {
    try {
      const outputTarget = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: report.evaluator.output.uri,
        requireRegularFile: true,
      });
      const suiteTarget = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: report.suite.uri,
      });
      const rawOutput = documents.get(outputTarget.lexicalTarget);
      const expectedCaseIds = new Set();
      if (suiteTarget.metadata.isFile()) {
        const evaluationCase = documents.get(suiteTarget.lexicalTarget);
        if (evaluationCase?.case_id) expectedCaseIds.add(evaluationCase.case_id);
      } else {
        for (const [candidate, evaluationCase] of documents) {
          if (candidate.startsWith(`${suiteTarget.lexicalTarget}${path.sep}`) && evaluationCase?.case_id) {
            expectedCaseIds.add(evaluationCase.case_id);
          }
        }
      }

      if (!rawOutput
        || rawOutput.report_id !== report.report_id
        || rawOutput.report_version !== report.version
        || rawOutput.summary_digest !== expectedEvaluationOutputDigest(report)
        || rawOutput.suite_digest !== report.suite.digest
        || rawOutput.fixture_digest !== report.suite.fixture_digest
        || rawOutput.system_digest !== report.system.system_digest
        || rawOutput.grader_digest !== report.evaluator.grader.digest
        || rawOutput.runner_digest !== report.evaluator.runner.digest
        || rawOutput.environment_digest !== report.system.environment.environment_digest
        || rawOutput.runner_output_digest !== domainSeparatedDigest("evaluation-runner-output", rawOutput.runner_output)
        || rawOutput.runner_output?.status !== "passed"
        || !Array.isArray(rawOutput.runner_output?.cases)
        || canonicalJson(rawOutput.runner_output?.execution_environment)
          !== canonicalJson(evaluationSandboxDigestPayload(report.system.environment.sandbox))
        || rawOutput.runner_output?.wall_time_ms !== rawOutput.resource_usage?.wall_time_ms
        || canonicalJson(rawOutput.population) !== canonicalJson(report.population)
        || canonicalJson(rawOutput.resource_usage) !== canonicalJson(report.resource_usage)
        || canonicalJson(rawOutput.trials) !== canonicalJson(report.trials)
        || canonicalJson(rawOutput.results) !== canonicalJson(report.results)
        || canonicalJson(rawOutput.contamination_controls) !== canonicalJson(report.contamination_controls)
        || !Array.isArray(rawOutput.cases)) {
        fail(`${relative(file)} raw evaluator output does not bind the complete evaluated report, environment, and observations`);
      } else {
        const observedToolCalls = rawOutput.runner_output.cases.reduce((total, execution) => (
          Number.isInteger(execution?.tool_calls) ? total + execution.tool_calls : Number.NaN
        ), 0);
        if (!Number.isInteger(observedToolCalls) || observedToolCalls !== rawOutput.resource_usage.tool_calls) {
          fail(`${relative(file)} raw evaluator output tool usage is not derived from the executed cases`);
        }
        const executedCaseIds = new Set();
        const runnerCases = new Map(rawOutput.runner_output.cases.map((execution) => [execution?.case_id, execution]));
        for (const execution of rawOutput.cases) {
          if (executedCaseIds.has(execution?.case_id)) {
            fail(`${relative(file)} raw evaluator output duplicates case ${execution?.case_id}`);
          }
          executedCaseIds.add(execution?.case_id);
          if (typeof execution?.case_id !== "string"
            || execution.status !== "pass"
            || !Number.isInteger(execution.trial_count)
            || execution.trial_count !== report.trials.count
            || runnerCases.get(execution.case_id)?.status !== "passed"
            || execution.execution_digest !== domainSeparatedDigest("evaluation-case-execution", runnerCases.get(execution.case_id))) {
            fail(`${relative(file)} raw evaluator output does not prove passing trial coverage for ${execution?.case_id}`);
          }
        }
        if (executedCaseIds.size !== expectedCaseIds.size
          || [...expectedCaseIds].some((caseId) => !executedCaseIds.has(caseId))) {
          fail(`${relative(file)} raw evaluator output does not cover every case in the immutable suite`);
        }
        if (runnerCases.size !== expectedCaseIds.size
          || [...expectedCaseIds].some((caseId) => !runnerCases.has(caseId))) {
          fail(`${relative(file)} isolated runner output does not cover every case in the immutable suite`);
        }
        if (rawOutput.cases.length !== report.population.evaluated_cases) {
          fail(`${relative(file)} raw evaluator output case count does not match population.evaluated_cases`);
        }
      }
    } catch {
      // The governed-reference pass reports malformed raw-output or suite references.
    }
  }
}

for (const [file, release] of documents) {
  if (!release?.release_id || !Array.isArray(release?.artifacts)) continue;
  const resolvedArtifacts = new Map();
  for (const [index, artifact] of release.artifacts.entries()) {
    let resolved;
    try {
      resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: artifact.uri,
        requireRegularFile: true,
      });
    } catch {
      continue;
    }
    resolvedArtifacts.set(index, resolved);

    const artifactDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
    if (artifact.digest !== artifactDigest) {
      fail(`${relative(file)} artifacts.${index}.digest does not match ${relative(resolved.lexicalTarget)} (${artifactDigest})`);
    }
    const targetDocument = documents.get(resolved.lexicalTarget);
    const targetVersion = declaredArtifactVersion(targetDocument);
    const targetSchemaVersion = declaredSchemaVersion(targetDocument);
    const externallyVersionedRuntime = artifact.role === "runtime"
      && targetVersion === null
      && artifact.version !== null;
    if (!externallyVersionedRuntime && artifact.version !== targetVersion) {
      fail(`${relative(file)} artifacts.${index}.version ${artifact.version ?? "<none>"} does not match ${relative(resolved.lexicalTarget)} version ${targetVersion ?? "<none>"}`);
    }
    if (artifact.schema_version !== targetSchemaVersion) {
      fail(`${relative(file)} artifacts.${index}.schema_version ${artifact.schema_version} does not match ${relative(resolved.lexicalTarget)} schema_version ${targetSchemaVersion ?? "<none>"}`);
    }
  }
  for (const evidenceReference of solutionReleaseReferences(release)
    .filter((reference) => ["deployment_evidence", "rollback_evidence", "retirement_evidence"].includes(reference.kind))) {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(file),
        candidate: evidenceReference.uri,
        requireRegularFile: true,
      });
      const evidenceDigest = await sha256Path(resolved.lexicalTarget, resolved.metadata);
      if (evidenceReference.digest !== evidenceDigest) {
        fail(`${relative(file)} ${evidenceReference.field} digest does not match ${relative(resolved.lexicalTarget)} (${evidenceDigest})`);
      }
      const evidenceDocument = documents.get(resolved.lexicalTarget);
      const lifecycleEvidence = evidenceReference.kind === "deployment_evidence"
        ? release.deployment_evidence
        : evidenceReference.kind === "rollback_evidence"
          ? release.rollback_evidence
          : release.retirement_evidence;
      const subject = lifecycleEvidenceSubject(evidenceReference.kind, lifecycleEvidence);
      const lifecycleTimestamp = lifecycleEvidence?.deployed_at
        ?? lifecycleEvidence?.rolled_back_at
        ?? lifecycleEvidence?.retired_at;
      const expectedSubjectDigest = lifecycleSubjectDigest(evidenceReference.kind, subject);
      const verifier = evidenceDocument?.verifier;
      if (evidenceDocument?.schema_version !== "1.0.0"
        || evidenceDocument?.evidence_type !== evidenceReference.kind
        || canonicalJson(evidenceDocument?.subject) !== canonicalJson(subject)
        || evidenceDocument?.subject_digest !== expectedSubjectDigest
        || typeof verifier?.principal !== "string"
        || verifier.principal.length < 2
        || verifier.principal === release.owner
        || typeof verifier?.authority_role !== "string"
        || verifier.authority_role.length < 2
        || typeof verifier?.attestation_id !== "string"
        || verifier.attestation_id.length < 8
        || !Number.isFinite(Date.parse(verifier?.verified_at))
        || Date.parse(verifier.verified_at) < Date.parse(lifecycleTimestamp)) {
        fail(`${relative(file)} ${evidenceReference.field} is not a release-bound structured lifecycle attestation`);
      }
    } catch {
      // The governed-reference pass reports malformed lifecycle-evidence references.
    }
  }

  let candidateAgentPath;
  try {
    ({ lexicalTarget: candidateAgentPath } = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: release.agent_system_uri,
      requireRegularFile: true,
    }));
  } catch {
    candidateAgentPath = null;
  }
  const candidateAgent = documents.get(candidateAgentPath);
  const candidateReleaseArtifactPaths = (role) => [...resolvedArtifacts]
    .filter(([index]) => release.artifacts[index]?.role === role)
    .map(([, resolved]) => resolved.lexicalTarget);
  if (candidateAgent) {
    try {
      const harnessReference = candidateAgent.behavior?.harness;
      const bundleResolution = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(candidateAgentPath),
        candidate: harnessReference.uri,
        requireRegularFile: true,
      });
      const bundle = documents.get(bundleResolution.lexicalTarget);
      const harness = (bundle?.components ?? []).find((component) => (
        component.role === "harness" && component.component_id === harnessReference.component_id
      ));
      const runtimeResolution = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(bundleResolution.lexicalTarget),
        candidate: harness?.configuration?.runtime_uri,
        requireRegularFile: true,
      });
      const runtimeArtifacts = release.artifacts
        .map((artifact, index) => ({ artifact, resolved: resolvedArtifacts.get(index) }))
        .filter(({ artifact }) => artifact.role === "runtime");
      if (runtimeArtifacts.length !== 1
        || runtimeArtifacts[0].resolved?.lexicalTarget !== runtimeResolution.lexicalTarget
        || runtimeArtifacts[0].artifact.version !== harness?.version
        || runtimeArtifacts[0].artifact.digest !== harness?.configuration?.runtime_digest
        || runtimeArtifacts[0].artifact.digest !== await sha256Path(runtimeResolution.lexicalTarget, runtimeResolution.metadata)) {
        fail(`${relative(file)} runtime artifact does not equal the versioned behavior-bundle harness runtime`);
      }
    } catch {
      fail(`${relative(file)} cannot resolve the release behavior-bundle runtime binding`);
    }
  }
  const expectedAgentDependencyPaths = async (kind) => {
    const paths = new Set();
    for (const reference of (candidateAgent ? agentArtifactReferences(candidateAgent) : [])
      .filter((candidate) => candidate.kind === kind)) {
      try {
        const resolved = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(candidateAgentPath),
          candidate: reference.uri,
          requireRegularFile: true,
        });
        paths.add(resolved.lexicalTarget);
      } catch {
        // The agent-reference pass reports malformed dependency references.
      }
    }
    return paths;
  };
  for (const [role, kind] of [
    ["behavior_bundle", "behavior_bundle"],
    ["capability_manifest", "capability_manifest"],
  ]) {
    const declared = new Set(candidateReleaseArtifactPaths(role));
    const expected = await expectedAgentDependencyPaths(kind);
    if (declared.size !== expected.size || [...declared].some((artifactPath) => !expected.has(artifactPath))) {
      fail(`${relative(file)} ${role} artifacts do not equal the agent system ${kind} dependencies`);
    }
  }

  const candidateDeclaredToolPaths = new Set(candidateReleaseArtifactPaths("tool_contract"));
  const candidateAgentToolPaths = await expectedAgentDependencyPaths("tool_contract");
  if (candidateDeclaredToolPaths.size !== candidateAgentToolPaths.size
    || [...candidateDeclaredToolPaths].some((toolPath) => !candidateAgentToolPaths.has(toolPath))) {
    fail(`${relative(file)} tool_contract artifacts do not equal the agent system tool contracts`);
  }
  for (const capabilityPath of candidateReleaseArtifactPaths("capability_manifest")) {
    const capability = documents.get(capabilityPath);
    try {
      const capabilityContract = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(capabilityPath),
        candidate: capability?.artifacts?.tool_contract?.uri,
        requireRegularFile: true,
      });
      if (!candidateDeclaredToolPaths.has(capabilityContract.lexicalTarget)) {
        fail(`${relative(file)} capability ${relative(capabilityPath)} binds a tool contract outside the release`);
      }
    } catch {
      // The capability-reference pass reports malformed tool-contract references.
    }
  }
  if (candidateAgent) {
    try {
      const agentOntology = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(candidateAgentPath),
        candidate: candidateAgent.context.ontology_uri,
        requireRegularFile: true,
      });
      if (candidateReleaseArtifactPaths("domain_model")[0] !== agentOntology.lexicalTarget) {
        fail(`${relative(file)} domain_model artifact does not equal the agent system ontology`);
      }
    } catch {
      // The agent-reference pass reports malformed ontology references.
    }
  }
  const candidateDataContextPath = candidateReleaseArtifactPaths("data_context")[0];
  const candidateDataContext = documents.get(candidateDataContextPath);
  const candidateDataSources = new Map((candidateDataContext?.sources ?? []).map((source) => [source.source_id, source]));
  const candidateContextProjection = (candidateAgent?.context?.sources ?? []).map((source) => {
    const declared = candidateDataSources.get(source.source_id);
    return declared && {
      source_id: declared.source_id,
      owner: declared.owner,
      source_of_truth: declared.source_of_truth,
      revision: declared.contract.revision,
      schema_contract: { id: declared.contract.schema_id, version: declared.contract.version, digest: declared.contract.digest },
      freshness_slo_seconds: declared.contract.freshness_slo_seconds,
      classification: declared.classification,
      trust: declared.trust,
    };
  });
  if (candidateContextProjection.some((source) => !source)
    || canonicalJson(candidateContextProjection) !== canonicalJson(candidateAgent?.context?.sources ?? [])) {
    fail(`${relative(file)} data_context artifact does not bind the agent system source, schema, revision, trust, and freshness context`);
  }

  if (!["approved", "deployed", "rolled_back", "retired"].includes(release.release_status)) continue;

  if (relative(file).startsWith("templates/")) {
    fail(`${relative(file)} canonical templates cannot enter an approved or post-approval lifecycle state`);
  }
  for (const [index, resolved] of resolvedArtifacts) {
    if (relative(resolved.lexicalTarget).startsWith("templates/")) {
      fail(`${relative(file)} approved or post-approval release references template artifact artifacts.${index}.uri`);
    }
  }

  let evaluationPath;
  let agentPath;
  let charterPath;
  try {
    ({ lexicalTarget: evaluationPath } = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: release.evaluation_report_uri,
      requireRegularFile: true,
    }));
    ({ lexicalTarget: agentPath } = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: release.agent_system_uri,
      requireRegularFile: true,
    }));
    ({ lexicalTarget: charterPath } = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(file),
      candidate: release.workflow_charter_uri,
      requireRegularFile: true,
    }));
  } catch {
    continue;
  }

  const evaluation = documents.get(evaluationPath);
  const agent = documents.get(agentPath);
  const charter = documents.get(charterPath);
  const releaseArtifactPaths = (role) => [...resolvedArtifacts]
    .filter(([index]) => release.artifacts[index]?.role === role)
    .map(([, resolved]) => resolved.lexicalTarget);
  const transitiveReferenceGroups = [
    [evaluationPath, evaluationReportReferences(evaluation)],
    [agentPath, agentArtifactReferences(agent)],
    [file, solutionReleaseReferences(release).filter((reference) => ["deployment_evidence", "rollback_evidence", "retirement_evidence"].includes(reference.kind))],
    ...releaseArtifactPaths("capability_manifest")
      .map((capabilityPath) => [capabilityPath, capabilityManifestReferences(documents.get(capabilityPath))]),
  ];
  for (const [ownerPath, references] of transitiveReferenceGroups) {
    for (const reference of references) {
      try {
        const resolved = await resolveWithinRepository({
          root,
          baseDirectory: path.dirname(ownerPath),
          candidate: reference.uri,
          requireRegularFile: reference.requireRegularFile ?? true,
        });
        if (relative(resolved.lexicalTarget).startsWith("templates/")) {
          fail(`${relative(file)} approved or post-approval release transitively references template ${relative(resolved.lexicalTarget)}`);
        }
      } catch {
        // The governed-reference passes report malformed transitive references.
      }
    }
  }
  if (evaluation?.decision?.status !== "accept") {
    fail(`${relative(file)} ${release.release_status} release requires an accepted evaluation report`);
  }
  for (const segment of release.target_segments ?? []) {
    if (!(evaluation?.population?.segments ?? []).includes(segment)) {
      fail(`${relative(file)} target segment ${segment} is absent from the accepted evaluation population`);
    }
    if (!(agent?.autonomy?.segments ?? []).includes(segment)) {
      fail(`${relative(file)} target segment ${segment} is absent from the agent autonomy boundary`);
    }
  }
  if (release.autonomy_level !== agent?.autonomy?.level) {
    fail(`${relative(file)} autonomy_level does not match ${relative(agentPath)}`);
  }
  const charterLifecycleAllowed = [["pilot", "pilot"], ["production", "promote"]];
  if (!charterLifecycleAllowed.some(([status, disposition]) => (
    charter?.status === status && charter?.decision?.disposition === disposition
  ))) {
    fail(`${relative(file)} release lifecycle is incompatible with the workflow charter decision`);
  }
  if (release.rollout?.service_owner !== charter?.owners?.receiving_service_owner) {
    fail(`${relative(file)} rollout.service_owner does not match the workflow charter receiving service owner`);
  }
  if (canonicalJson(evaluation?.population?.eligible_population)
    !== canonicalJson(charter?.outcome?.primary_metric?.eligible_population)) {
    fail(`${relative(file)} accepted evaluation population does not match the workflow charter`);
  }

  const primaryMetric = charter?.outcome?.primary_metric;
  const primaryOperator = primaryMetric?.direction === "increase"
    ? "gte"
    : primaryMetric?.direction === "decrease"
      ? "lte"
      : "eq";
  const requiredMetrics = [
    {
      metric: primaryMetric?.metric_id,
      operator: primaryOperator,
      threshold: primaryMetric?.target,
      unit: primaryMetric?.unit,
    },
    ...(charter?.outcome?.guardrail_metrics ?? []).map((guardrail) => ({
      metric: guardrail.metric_id,
      operator: guardrail.operator,
      threshold: guardrail.threshold,
      unit: null,
    })),
  ];
  for (const segment of release.target_segments ?? []) {
    for (const requiredMetric of requiredMetrics) {
      const result = evaluation?.results?.find((candidate) => candidate.metric === requiredMetric.metric
        && candidate.slice === segment);
      if (!result) {
        fail(`${relative(file)} accepted evaluation omits ${requiredMetric.metric}/${segment}`);
        continue;
      }
      if (result.threshold?.operator !== requiredMetric.operator
        || result.threshold?.value !== requiredMetric.threshold
        || (requiredMetric.unit !== null && result.unit !== requiredMetric.unit)) {
        fail(`${relative(file)} accepted evaluation changes the charter threshold for ${requiredMetric.metric}/${segment}`);
      }
    }
  }
  const autonomyRank = new Map([
    ["observe", 0],
    ["recommend", 1],
    ["execute_reversible", 2],
    ["execute_bounded", 3],
    ["coordinate", 4],
  ]);
  if ((autonomyRank.get(release.autonomy_level) ?? Number.POSITIVE_INFINITY)
    > (autonomyRank.get(charter?.scope?.autonomy_ceiling) ?? Number.NEGATIVE_INFINITY)) {
    fail(`${relative(file)} autonomy_level exceeds the workflow charter autonomy ceiling`);
  }

  const declaredToolPaths = new Set(releaseArtifactPaths("tool_contract"));
  const agentToolPaths = new Set();
  for (const toolReference of agentArtifactReferences(agent).filter((reference) => reference.kind === "tool_contract")) {
    try {
      const resolved = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(agentPath),
        candidate: toolReference.uri,
        requireRegularFile: true,
      });
      agentToolPaths.add(resolved.lexicalTarget);
    } catch {
      // The agent-reference pass reports malformed tool references.
    }
  }
  if (declaredToolPaths.size !== agentToolPaths.size
    || [...declaredToolPaths].some((toolPath) => !agentToolPaths.has(toolPath))) {
    fail(`${relative(file)} tool_contract artifacts do not equal the agent system tool contracts`);
  }

  for (const capabilityPath of releaseArtifactPaths("capability_manifest")) {
    const capability = documents.get(capabilityPath);
    if (capability?.status !== "approved") {
      fail(`${relative(file)} ${release.release_status} release includes non-approved capability ${relative(capabilityPath)}`);
    }
    try {
      const capabilityContract = await resolveWithinRepository({
        root,
        baseDirectory: path.dirname(capabilityPath),
        candidate: capability?.artifacts?.tool_contract?.uri,
        requireRegularFile: true,
      });
      if (!declaredToolPaths.has(capabilityContract.lexicalTarget)) {
        fail(`${relative(file)} capability ${relative(capabilityPath)} binds a tool contract outside the release`);
      }
    } catch {
      // The capability-reference pass reports malformed tool-contract references.
    }
  }

  try {
    const agentOntology = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(agentPath),
      candidate: agent.context.ontology_uri,
      requireRegularFile: true,
    });
    if (releaseArtifactPaths("domain_model")[0] !== agentOntology.lexicalTarget) {
      fail(`${relative(file)} domain_model artifact does not equal the agent system ontology`);
    }
  } catch {
    // The agent-reference pass reports malformed ontology references.
  }

  const dataContextPath = releaseArtifactPaths("data_context")[0];
  const dataContext = documents.get(dataContextPath);
  const dataSources = new Map((dataContext?.sources ?? []).map((source) => [source.source_id, source]));
  const contextProjection = (agent?.context?.sources ?? []).map((source) => {
    const declared = dataSources.get(source.source_id);
    return declared && {
      source_id: declared.source_id,
      owner: declared.owner,
      source_of_truth: declared.source_of_truth,
      revision: declared.contract.revision,
      schema_contract: { id: declared.contract.schema_id, version: declared.contract.version, digest: declared.contract.digest },
      freshness_slo_seconds: declared.contract.freshness_slo_seconds,
      classification: declared.classification,
      trust: declared.trust,
    };
  });
  if (contextProjection.some((source) => !source)
    || canonicalJson(contextProjection) !== canonicalJson(agent?.context?.sources ?? [])) {
    fail(`${relative(file)} data_context artifact does not bind the agent system source, schema, revision, trust, and freshness context`);
  }

  const threatModelPath = releaseArtifactPaths("threat_model")[0];
  const threatModel = documents.get(threatModelPath);
  if (threatModel?.system_id !== agent?.system_id) {
    fail(`${relative(file)} threat_model artifact targets a different agent system`);
  }
  try {
    const evaluatedRuntime = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(evaluationPath),
      candidate: evaluation.system.environment.runtime.uri,
      requireRegularFile: true,
    });
    if (releaseArtifactPaths("runtime")[0] !== evaluatedRuntime.lexicalTarget) {
      fail(`${relative(file)} runtime artifact does not equal the evaluated runtime`);
    }
    const evaluatedPolicy = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(evaluationPath),
      candidate: evaluation.system.environment.policy.uri,
      requireRegularFile: true,
    });
    if (releaseArtifactPaths("security_policy")[0] !== evaluatedPolicy.lexicalTarget) {
      fail(`${relative(file)} security_policy artifact does not equal the evaluated policy bundle`);
    }
  } catch {
    // The evaluation-reference pass reports malformed runtime or policy references.
  }

  try {
    const evaluatedSuite = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(evaluationPath),
      candidate: evaluation.suite.uri,
    });
    const evaluatedCaseIds = new Set();
    if (evaluatedSuite.metadata.isFile()) {
      const evaluationCase = documents.get(evaluatedSuite.lexicalTarget);
      if (evaluationCase?.case_id) evaluatedCaseIds.add(evaluationCase.case_id);
    } else {
      for (const [candidate, evaluationCase] of documents) {
        if (candidate.startsWith(`${evaluatedSuite.lexicalTarget}${path.sep}`) && evaluationCase?.case_id) {
          evaluatedCaseIds.add(evaluationCase.case_id);
        }
      }
    }
    for (const threat of threatModel?.threats ?? []) {
      for (const caseId of threat.test_case_ids ?? []) {
        if (!evaluatedCaseIds.has(caseId)) {
          fail(`${relative(file)} security threat ${threat.threat_id} references case ${caseId} outside the evaluated suite`);
        }
      }
    }
  } catch {
    // The governed-reference pass reports malformed evaluated-suite references.
  }

  const catalogRoleRequirements = new Map([
    ["user_surface", (entry) => entry?.tags?.some((tag) => ["adoption", "interface", "user-surface"].includes(tag))],
    ["operations", (entry) => entry?.type === "runbook" || entry?.tags?.some((tag) => ["operations", "support", "recovery"].includes(tag))],
  ]);
  for (const [role, accepts] of catalogRoleRequirements) {
    const targetPath = releaseArtifactPaths(role)[0];
    const entry = targetPath ? catalogPaths.get(relative(targetPath)) : null;
    if (!accepts(entry)) fail(`${relative(file)} ${role} artifact is not cataloged with its required role tags`);
  }

  try {
    const evaluationAgent = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(evaluationPath),
      candidate: evaluation.system.agent_system_uri,
      requireRegularFile: true,
    });
    if (evaluationAgent.lexicalTarget !== agentPath) {
      fail(`${relative(file)} accepted evaluation targets a different agent system`);
    }
  } catch {
    // The governed-reference pass reports malformed evaluation references.
  }

  try {
    const agentCharter = await resolveWithinRepository({
      root,
      baseDirectory: path.dirname(agentPath),
      candidate: agent.charter_uri,
      requireRegularFile: true,
    });
    if (agentCharter.lexicalTarget !== charterPath) {
      fail(`${relative(file)} agent system targets a different workflow charter`);
    }
  } catch {
    // The agent-reference pass reports malformed charter references.
  }

  const approvalPrincipals = new Set((release.approvals ?? []).map((approval) => approval.principal));
  if (approvalPrincipals.has(evaluation?.decision?.decided_by)) {
    fail(`${relative(file)} evaluation decision authority is also a release approver`);
  }
  const charterPrincipals = Object.values(charter?.owners ?? {}).flatMap((principal) => (
    Array.isArray(principal) ? principal : [principal]
  ));
  const candidatePrincipals = new Set([
    release.owner,
    agent?.actor_identity?.agent_principal,
    ...Object.values(agent?.owners ?? {}),
    ...charterPrincipals,
  ]);
  if (candidatePrincipals.has(evaluation?.decision?.decided_by)) {
    fail(`${relative(file)} evaluation decision authority is also an owner of the evaluated candidate`);
  }
  for (const approval of release.approvals ?? []) {
    if (Date.parse(approval.approved_at) < Date.parse(evaluation?.decision?.decided_at)) {
      fail(`${relative(file)} ${approval.role} approval predates the evaluation decision`);
    }
  }
  if (release.deployment_evidence
    && Date.parse(release.deployment_evidence.deployed_at) < Date.parse(evaluation?.decision?.decided_at)) {
    fail(`${relative(file)} deployment predates the accepted evaluation decision`);
  }
}

try {
  const tracked = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  for (const trackedFile of tracked) {
    const target = path.join(root, trackedFile);
    let metadata;
    try {
      metadata = await stat(target);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (metadata.isFile() && metadata.size === 0) fail(`${trackedFile} is a tracked empty file`);
  }
} catch (error) {
  fail(`git tracked-file check failed: ${error.message}`);
}

if (failures.length) {
  console.error(`Repository validation failed with ${failures.length} issue(s):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    status: "passed",
    files: files.length,
    markdown_files: markdownFiles.length,
    json_files: jsonFiles.length,
    schemas: schemaFiles.length,
    controls: definedControls.size,
    evaluation_cases: evalIds.size,
    catalog_artifacts: catalog?.artifacts?.length ?? 0,
  }, null, 2));
}
