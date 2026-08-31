import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

export function isWithinDirectory(directory, target) {
  const relation = path.relative(directory, target);
  return relation === "" || (relation !== ".." && !relation.startsWith(`..${path.sep}`) && !path.isAbsolute(relation));
}

export async function resolveWithinRepository({
  root,
  baseDirectory,
  candidate,
  requireRegularFile = false,
}) {
  if (typeof candidate !== "string" || candidate.length === 0 || candidate.includes("\0")) {
    throw new Error("reference must be a non-empty path without null bytes");
  }
  if (path.isAbsolute(candidate) || path.win32.isAbsolute(candidate)) {
    throw new Error("absolute paths are not repository-relative");
  }

  const resolvedRoot = await realpath(root);
  const lexicalTarget = path.resolve(baseDirectory, candidate);
  if (!isWithinDirectory(root, lexicalTarget)) throw new Error("path escapes the repository root");

  const resolvedTarget = await realpath(lexicalTarget);
  if (!isWithinDirectory(resolvedRoot, resolvedTarget)) throw new Error("resolved path escapes the repository root");

  const metadata = await lstat(lexicalTarget);
  if (requireRegularFile && !metadata.isFile()) throw new Error("target is not a regular file");

  return { lexicalTarget, resolvedTarget, metadata };
}

export function agentArtifactReferences(agent) {
  return [
    { field: "charter_uri", kind: "workflow_charter", uri: agent.charter_uri, requireRegularFile: true },
    { field: "context.ontology_uri", kind: "ontology", uri: agent.context?.ontology_uri, requireRegularFile: true },
    { field: "verification.evaluation_suite_uri", kind: "evaluation_suite", uri: agent.verification?.evaluation_suite_uri, requireRegularFile: false },
    { field: "operations.trace_contract", kind: "trace_contract", uri: agent.operations?.trace_contract, requireRegularFile: true },
    { field: "operations.runbook_uri", kind: "incident_runbook", uri: agent.operations?.runbook_uri, requireRegularFile: true },
    ...Object.entries(agent.behavior ?? {}).map(([role, component]) => ({
      field: `behavior.${role}.uri`,
      kind: "behavior_bundle",
      behaviorRole: role,
      componentId: component?.component_id,
      version: component?.version,
      schemaVersion: component?.schema_version,
      digest: component?.digest,
      uri: component?.uri,
      requireRegularFile: true,
    })),
    ...(agent.tools ?? []).flatMap((tool) => ([
      {
        field: `tools.${tool.tool_id}.contract_uri`,
        kind: "tool_contract",
        toolId: tool.tool_id,
        uri: tool.contract_uri,
        requireRegularFile: true,
      },
      {
        field: `tools.${tool.tool_id}.capability.manifest_uri`,
        kind: "capability_manifest",
        toolId: tool.tool_id,
        contractUri: tool.contract_uri,
        capabilityId: tool.capability?.capability_id,
        version: tool.capability?.version,
        digest: tool.capability?.manifest_digest,
        authorityDigest: tool.capability?.authority_digest,
        uri: tool.capability?.manifest_uri,
        requireRegularFile: true,
      },
    ])),
  ].filter((reference) => reference.uri);
}

export function evaluationReportReferences(report) {
  return [
    {
      field: "system.agent_system_uri",
      kind: "agent_system",
      uri: report.system?.agent_system_uri,
      version: report.system?.system_version,
      requireRegularFile: true,
    },
    {
      field: "suite.uri",
      kind: "evaluation_case",
      uri: report.suite?.uri,
      version: report.suite?.version,
      schemaVersion: report.suite?.schema_version,
      digest: report.suite?.digest,
      requireRegularFile: false,
    },
    {
      field: "suite.fixture_uri",
      kind: "evaluation_fixture",
      uri: report.suite?.fixture_uri,
      version: report.suite?.fixture_revision,
      schemaVersion: report.suite?.fixture_schema_version,
      digest: report.suite?.fixture_digest,
      requireRegularFile: true,
    },
    {
      field: "evaluator.grader.uri",
      kind: "evaluation_grader",
      uri: report.evaluator?.grader?.uri,
      version: report.evaluator?.grader?.version,
      schemaVersion: report.evaluator?.grader?.schema_version,
      digest: report.evaluator?.grader?.digest,
      requireRegularFile: true,
    },
    {
      field: "evaluator.runner.uri",
      kind: "evaluation_runner",
      uri: report.evaluator?.runner?.uri,
      version: report.evaluator?.runner?.version,
      schemaVersion: report.evaluator?.runner?.schema_version,
      digest: report.evaluator?.runner?.digest,
      requireRegularFile: true,
    },
    {
      field: "evaluator.output.uri",
      kind: "evaluation_output",
      uri: report.evaluator?.output?.uri,
      version: report.evaluator?.output?.version,
      schemaVersion: report.evaluator?.output?.schema_version,
      digest: report.evaluator?.output?.digest,
      requireRegularFile: true,
    },
    {
      field: "system.environment.runtime.uri",
      kind: "evaluation_runtime",
      uri: report.system?.environment?.runtime?.uri,
      version: report.system?.environment?.runtime?.version,
      schemaVersion: report.system?.environment?.runtime?.schema_version,
      digest: report.system?.environment?.runtime?.digest,
      requireRegularFile: true,
    },
    {
      field: "system.environment.policy.uri",
      kind: "evaluation_policy",
      uri: report.system?.environment?.policy?.uri,
      version: report.system?.environment?.policy?.version,
      schemaVersion: report.system?.environment?.policy?.schema_version,
      digest: report.system?.environment?.policy?.digest,
      requireRegularFile: true,
    },
    {
      field: "system.environment.world.uri",
      kind: "evaluation_world",
      uri: report.system?.environment?.world?.uri,
      version: report.system?.environment?.world?.version,
      schemaVersion: report.system?.environment?.world?.schema_version,
      digest: report.system?.environment?.world?.digest,
      requireRegularFile: true,
    },
    ...(report.system?.environment?.dependencies ?? []).map((dependency, index) => ({
      field: `system.environment.dependencies.${index}.uri`,
      kind: "evaluation_dependency",
      uri: dependency.uri,
      version: dependency.version,
      schemaVersion: dependency.schema_version,
      digest: dependency.digest,
      requireRegularFile: true,
    })),
  ].filter((reference) => reference.uri);
}

export function solutionReleaseReferences(release) {
  return [
    { field: "workflow_charter_uri", kind: "workflow_charter", uri: release.workflow_charter_uri },
    { field: "agent_system_uri", kind: "agent_system", uri: release.agent_system_uri },
    { field: "evaluation_report_uri", kind: "evaluation_report", uri: release.evaluation_report_uri },
    ...(release.artifacts ?? []).map((artifact, index) => ({
      field: `artifacts.${index}.uri`,
      kind: artifact.role,
      uri: artifact.uri,
      version: artifact.version,
      schemaVersion: artifact.schema_version,
      digest: artifact.digest,
      requireRegularFile: true,
    })),
    {
      field: "deployment_evidence.verification_uri",
      kind: "deployment_evidence",
      uri: release.deployment_evidence?.verification_uri,
      digest: release.deployment_evidence?.verification_digest,
      requireRegularFile: true,
    },
    {
      field: "rollback_evidence.evidence_uri",
      kind: "rollback_evidence",
      uri: release.rollback_evidence?.evidence_uri,
      digest: release.rollback_evidence?.evidence_digest,
      requireRegularFile: true,
    },
    {
      field: "retirement_evidence.evidence_uri",
      kind: "retirement_evidence",
      uri: release.retirement_evidence?.evidence_uri,
      digest: release.retirement_evidence?.evidence_digest,
      requireRegularFile: true,
    },
  ].filter((reference) => reference.uri);
}

export function capabilityManifestReferences(manifest) {
  return [
    {
      field: "artifacts.executable_uri",
      kind: "capability_executable",
      uri: manifest.artifacts?.executable_uri,
      digest: manifest.artifacts?.executable_digest,
      requireRegularFile: true,
    },
    {
      field: "artifacts.tool_contract.uri",
      kind: "tool_contract",
      toolId: manifest.artifacts?.tool_contract?.tool_id,
      uri: manifest.artifacts?.tool_contract?.uri,
      version: manifest.artifacts?.tool_contract?.version,
      schemaVersion: manifest.artifacts?.tool_contract?.schema_version,
      digest: manifest.artifacts?.tool_contract?.digest,
      requireRegularFile: true,
    },
    {
      field: "provenance.sbom_uri",
      kind: "sbom",
      uri: manifest.provenance?.sbom_uri,
      digest: manifest.provenance?.sbom_digest,
      requireRegularFile: true,
    },
    {
      field: "assurance.threat_model_uri",
      kind: "threat_model",
      uri: manifest.assurance?.threat_model_uri,
      requireRegularFile: true,
    },
    {
      field: "assurance.evaluation_suite_uri",
      kind: "evaluation_case",
      uri: manifest.assurance?.evaluation_suite_uri,
      requireRegularFile: false,
    },
  ].filter((reference) => reference.uri);
}

export function localLinkDocuments(root, markdownFiles) {
  return [...markdownFiles, path.join(root, "llms.txt")];
}

export function documentationLinkDestinations(content) {
  const destinations = [];
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) destinations.push(match[1]);
  for (const match of content.matchAll(/^ {0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm)) {
    destinations.push(match[1] ?? match[2]);
  }
  return destinations;
}

export function classifyReference(candidate, allowedExternalSchemes) {
  if (typeof candidate !== "string" || candidate.length === 0) return { kind: "invalid" };
  if (path.isAbsolute(candidate) || path.win32.isAbsolute(candidate)) return { kind: "absolute" };

  const scheme = candidate.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (!scheme) return { kind: "local" };
  if (allowedExternalSchemes.includes(scheme)) return { kind: "external", scheme };
  return { kind: "unsupported", scheme };
}

export function governedDocumentSchema(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return null;
  if (document.record_id && document.inherited_brief && document.roles && Array.isArray(document.claims)) {
    return "schemas/engagement-reframe.schema.json";
  }
  if (document.assessment_id && document.hard_gates && Array.isArray(document.factors)) {
    return "schemas/ai-value-engineering-scorecard.schema.json";
  }
  if (document.context_manifest_id && Array.isArray(document.data_planes) && Array.isArray(document.sources)) {
    return "schemas/data-context-manifest.schema.json";
  }
  if (document.bundle_id && Array.isArray(document.components) && Array.isArray(document.tool_members)) {
    return "schemas/behavior-bundle.schema.json";
  }
  if (document.capability_id && document.provenance && document.artifacts && document.authority) {
    return "schemas/capability-manifest.schema.json";
  }
  if (document.handoff_id && document.objective && document.authority && document.attestation) {
    return "schemas/handoff-envelope.schema.json";
  }
  return null;
}

export function isGovernedJsonDocument(repositoryPath, document = null) {
  return repositoryPath === "catalog.json"
    || /^controls\/.+\.json$/.test(repositoryPath)
    || /^examples\/.+\.json$/.test(repositoryPath)
    || /^patterns\/.+\.json$/.test(repositoryPath)
    || /^releases\/.+\/(?:agent-system|behavior-bundle|capability-manifest|change-impact-assessment|data-context-manifest|evaluation-case|evaluation-output|evaluation-report|handoff-envelope|operational-ontology|solution-release|system-map-manifest|threat-model|tool-contract|workflow-charter)\.json$/.test(repositoryPath)
    || /^releases\/.+\/(?:evals|tools)\/.+\.json$/.test(repositoryPath)
    || /^templates\/.+\.json$/.test(repositoryPath)
    || governedDocumentSchema(document) !== null;
}

export function expectedDocumentSchema(repositoryPath, document = null) {
  if (repositoryPath === "catalog.json") return "schemas/artifact-catalog.schema.json";
  if (/^controls\/.+\.json$/.test(repositoryPath)) return "schemas/control-catalog.schema.json";
  if (/^patterns\/.+\.json$/.test(repositoryPath)) return "schemas/pattern-catalog.schema.json";

  const schemaByShape = governedDocumentSchema(document);
  if (schemaByShape) return schemaByShape;

  const name = path.posix.basename(repositoryPath);
  const templateSchemas = new Map([
    ["agent-system.json", "schemas/agent-system.schema.json"],
    ["ai-value-engineering-scorecard.json", "schemas/ai-value-engineering-scorecard.schema.json"],
    ["behavior-bundle.json", "schemas/behavior-bundle.schema.json"],
    ["capability-manifest.json", "schemas/capability-manifest.schema.json"],
    ["change-impact-assessment.json", "schemas/change-impact-assessment.schema.json"],
    ["data-context-manifest.json", "schemas/data-context-manifest.schema.json"],
    ["evaluation-case.json", "schemas/evaluation-case.schema.json"],
    ["evaluation-output.json", "schemas/evaluation-output.schema.json"],
    ["evaluation-report.json", "schemas/evaluation-report.schema.json"],
    ["engagement-reframe.json", "schemas/engagement-reframe.schema.json"],
    ["handoff-envelope.json", "schemas/handoff-envelope.schema.json"],
    ["operational-ontology.json", "schemas/operational-ontology.schema.json"],
    ["threat-model.json", "schemas/threat-model.schema.json"],
    ["tool-contract.json", "schemas/tool-contract.schema.json"],
    ["solution-release.json", "schemas/solution-release.schema.json"],
    ["system-map-manifest.json", "schemas/system-map-manifest.schema.json"],
    ["workflow-charter.json", "schemas/workflow-charter.schema.json"],
  ]);
  if (repositoryPath.startsWith("templates/")) return templateSchemas.get(name) ?? null;

  if (repositoryPath.startsWith("releases/")) {
    if (/^releases\/.+\/evals\/.+\.json$/.test(repositoryPath)) return "schemas/evaluation-case.schema.json";
    if (/^releases\/.+\/tools\/.+\.json$/.test(repositoryPath)) return "schemas/tool-contract.schema.json";
    return templateSchemas.get(name) ?? null;
  }

  if (/^examples\/[^/]+\/agent-system\.json$/.test(repositoryPath)) return "schemas/agent-system.schema.json";
  if (/^examples\/[^/]+\/behavior-bundle\.json$/.test(repositoryPath)) return "schemas/behavior-bundle.schema.json";
  if (/^examples\/[^/]+\/capability-manifest\.json$/.test(repositoryPath)) return "schemas/capability-manifest.schema.json";
  if (/^examples\/[^/]+\/change-impact-assessment\.json$/.test(repositoryPath)) return "schemas/change-impact-assessment.schema.json";
  if (/^examples\/[^/]+\/data-context-manifest\.json$/.test(repositoryPath)) return "schemas/data-context-manifest.schema.json";
  if (/^examples\/[^/]+\/evaluation-output\.json$/.test(repositoryPath)) return "schemas/evaluation-output.schema.json";
  if (/^examples\/[^/]+\/evaluation-report\.json$/.test(repositoryPath)) return "schemas/evaluation-report.schema.json";
  if (/^examples\/[^/]+\/solution-release\.json$/.test(repositoryPath)) return "schemas/solution-release.schema.json";
  if (/^examples\/[^/]+\/system-map-manifest\.json$/.test(repositoryPath)) return "schemas/system-map-manifest.schema.json";
  if (/^examples\/[^/]+\/handoff-envelope\.json$/.test(repositoryPath)) return "schemas/handoff-envelope.schema.json";
  if (/^examples\/[^/]+\/ontology\.json$/.test(repositoryPath)) return "schemas/operational-ontology.schema.json";
  if (/^examples\/[^/]+\/threat-model\.json$/.test(repositoryPath)) return "schemas/threat-model.schema.json";
  if (/^examples\/[^/]+\/workflow-charter\.json$/.test(repositoryPath)) return "schemas/workflow-charter.schema.json";
  if (/^examples\/[^/]+\/evals\/.+\.json$/.test(repositoryPath)) return "schemas/evaluation-case.schema.json";
  if (/^examples\/[^/]+\/tools\/.+\.json$/.test(repositoryPath)) return "schemas/tool-contract.schema.json";
  return null;
}

export function expectedCatalogTypes(repositoryPath) {
  if (/^\.agents\/skills\/[a-z0-9-]+\/SKILL\.md$/.test(repositoryPath)) return new Set(["standard"]);
  if (/^blueprints\/(?!README\.md$).+\.md$/.test(repositoryPath)) return new Set(["blueprint"]);
  if (/^controls\/.+\.json$/.test(repositoryPath)) return new Set(["control_catalog"]);
  if (/^examples\/[^/]+\/README\.md$/.test(repositoryPath)) return new Set(["example"]);
  if (/^operations\/(?!README\.md$).+\.md$/.test(repositoryPath)) return new Set(["runbook", "standard"]);
  if (/^patterns\/.+\.json$/.test(repositoryPath)) return new Set(["standard"]);
  if (/^playbooks\/(?!README\.md$).+\.md$/.test(repositoryPath)) return new Set(["standard"]);
  if (/^research\/[0-9]{4}-[0-9]{2}-[0-9]{2}--.+\.md$/.test(repositoryPath)) return new Set(["evidence"]);
  if (/^schemas\/.+\.json$/.test(repositoryPath)) return new Set(["schema"]);
  if (/^solutions\/(?!README\.md$).+\.md$/.test(repositoryPath)) return new Set(["blueprint"]);
  if (/^templates\/(?!README\.md$).+\.(?:json|md|spdx)$/.test(repositoryPath)) return new Set(["template"]);
  return null;
}
