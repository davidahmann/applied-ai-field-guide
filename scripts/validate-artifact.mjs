#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  dataContextManifestSemanticErrors,
  engagementReframeSemanticErrors,
  workflowCharterSemanticErrors,
} from "./governance-invariants.mjs";
import { expectedDocumentSchema, governedDocumentSchema } from "./repository-paths.mjs";

const repositoryRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const profiles = new Set(["starter", "complete"]);
const typeDefinitions = new Map([
  ["workflow-charter", {
    schema: "schemas/workflow-charter.schema.json",
    semanticErrors: workflowCharterSemanticErrors,
    starterPointers: [
      "/workflow_id",
      "/functional_requirement/user",
      "/functional_requirement/decision",
      "/functional_requirement/accepted_outcome",
      "/scope/initial_segment",
      "/scope/out_of_scope",
      "/outcome/verifier",
      "/owners/operational",
      "/owners/risk",
      "/owners/receiving_service_owner",
      "/stop_conditions",
      "/decision/disposition",
    ],
  }],
  ["engagement-reframe", {
    schema: "schemas/engagement-reframe.schema.json",
    semanticErrors: engagementReframeSemanticErrors,
    starterPointers: [
      "/record_id",
      "/workflow_id",
      "/inherited_brief/statement",
      "/inherited_brief/source_refs",
      "/roles/process_knower/identity",
      "/roles/process_knower/status",
      "/roles/process_knower/evidence_refs",
      "/roles/disposition_authority/identity",
      "/roles/disposition_authority/status",
      "/roles/disposition_authority/evidence_refs",
      "/representative_case/case_id",
      "/representative_case/evidence_refs",
      "/claims/0/claim_id",
      "/claims/1/claim_id",
      "/conflicts/0/conflict_id",
      "/proposal/safe_fallback",
      "/proposal/next_field_move",
    ],
  }],
  ["data-context-manifest", {
    schema: "schemas/data-context-manifest.schema.json",
    semanticErrors: dataContextManifestSemanticErrors,
    starterPointers: [
      "/context_manifest_id",
      "/workflow_id",
      "/owner",
      "/decision_scope",
      "/sources/0/source_id",
      "/sources/0/owner",
      "/sources/0/source_of_truth",
      "/sources/0/purpose",
      "/sources/0/failure_behavior/missing",
      "/quality_contract/decision_critical_fields/0/source_id",
      "/quality_contract/decision_critical_fields/0/field",
      "/quality_contract/decision_critical_fields/0/decision_use",
      "/quality_contract/decision_critical_fields/0/fallback",
      "/operations/drift_response",
      "/operations/rollback_condition",
      "/operations/change_owner",
      "/decision/disposition",
    ],
  }],
]);

function help() {
  return `Usage:
  fde-guide validate <artifact.json> [--profile starter|complete] [--type TYPE] [--json]

Types:
  workflow-charter | engagement-reframe | data-context-manifest

Profiles:
  starter   Validate the fields needed for the current decision while preserving
            the canonical schema's types and closed-object rules.
  complete  Validate the complete canonical schema and semantic invariants.
`;
}

function parseArguments(argv) {
  const args = [...argv];
  if (args[0] === "validate") args.shift();
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) return { help: true };

  const result = { profile: "complete", type: null, json: false, file: null };
  while (args.length > 0) {
    const token = args.shift();
    if (token === "--json") result.json = true;
    else if (token === "--profile" || token === "--type") {
      if (args.length === 0) throw new Error(`${token} requires a value`);
      result[token.slice(2)] = args.shift();
    } else if (token.startsWith("--")) throw new Error(`unknown option ${token}`);
    else if (result.file === null) result.file = token;
    else throw new Error("validate accepts one artifact path at a time");
  }
  if (!result.file) throw new Error("validate requires an artifact path");
  if (!profiles.has(result.profile)) throw new Error(`unknown profile ${result.profile}`);
  if (result.type && !typeDefinitions.has(result.type)) throw new Error(`unknown artifact type ${result.type}`);
  return result;
}

function cloneForStarter(value) {
  if (Array.isArray(value)) return value.map(cloneForStarter);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "required" && key !== "minItems")
      .map(([key, item]) => [key, cloneForStarter(item)]),
  );
}

function pointerValue(document, pointer) {
  const tokens = pointer.split("/").slice(1).map((token) => token.replaceAll("~1", "/").replaceAll("~0", "~"));
  let value = document;
  for (const token of tokens) {
    if (!value || typeof value !== "object" || !(token in value)) return undefined;
    value = value[token];
  }
  return value;
}

function typeFromSchema(schemaPath) {
  for (const [type, definition] of typeDefinitions) {
    if (definition.schema === schemaPath) return type;
  }
  return null;
}

function inferType(document, inputPath) {
  const shapedSchema = governedDocumentSchema(document);
  const shapedType = typeFromSchema(shapedSchema);
  if (shapedType) return shapedType;

  if (document?.record_id || document?.inherited_brief) return "engagement-reframe";
  if (document?.context_manifest_id || document?.data_planes) return "data-context-manifest";
  if (document?.workflow_id && (document?.functional_requirement || document?.outcome)) return "workflow-charter";

  const repositoryPath = path.relative(repositoryRoot, inputPath).split(path.sep).join("/");
  return typeFromSchema(expectedDocumentSchema(repositoryPath, document));
}

function formatAjvErrors(errors = []) {
  return errors.map((error) => `${error.instancePath || "/"} ${error.message}`);
}

export async function validateArtifact({ file, profile = "complete", type = null }) {
  const inputPath = path.resolve(file);
  let document;
  try {
    document = JSON.parse(await readFile(inputPath, "utf8"));
  } catch (error) {
    return { ok: false, file: inputPath, profile, type, errors: [`cannot read valid JSON: ${error.message}`] };
  }

  const resolvedType = type ?? inferType(document, inputPath);
  if (!resolvedType || !typeDefinitions.has(resolvedType)) {
    return {
      ok: false,
      file: inputPath,
      profile,
      type: resolvedType,
      errors: ["artifact type is not recognized; pass --type workflow-charter, engagement-reframe, or data-context-manifest"],
    };
  }

  const definition = typeDefinitions.get(resolvedType);
  const canonicalSchema = JSON.parse(await readFile(path.join(repositoryRoot, definition.schema), "utf8"));
  const schema = profile === "starter" ? cloneForStarter(canonicalSchema) : canonicalSchema;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const errors = validate(document) ? [] : formatAjvErrors(validate.errors);

  if (profile === "starter") {
    for (const pointer of definition.starterPointers) {
      const value = pointerValue(document, pointer);
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        errors.push(`${pointer} is required by the starter decision profile`);
      }
    }
  } else {
    errors.push(...definition.semanticErrors(document, path.basename(inputPath)));
  }

  return { ok: errors.length === 0, file: inputPath, profile, type: resolvedType, schema: definition.schema, errors };
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${help()}`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    process.stdout.write(help());
    return;
  }

  const result = await validateArtifact(options);
  if (options.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else if (result.ok) process.stdout.write(`PASS ${result.type} (${result.profile}) ${result.file}\n`);
  else {
    process.stderr.write(`FAIL ${result.type ?? "unknown"} (${result.profile}) ${result.file}\n`);
    for (const error of result.errors) process.stderr.write(`- ${error}\n`);
  }
  process.exitCode = result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
