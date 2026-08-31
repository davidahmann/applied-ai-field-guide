import { createHash } from "node:crypto";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const embeddedToolSchemaFields = ["input_schema", "output_schema", "error_schema"];
export const canonicalDigestVersion = "production-agent-engineering/canonical-json/v1";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Digest(value) {
  const bytes = Buffer.isBuffer(value)
    ? value
    : typeof value === "string"
      ? Buffer.from(value, "utf8")
      : Buffer.from(canonicalJson(value), "utf8");
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function solutionReleaseDigestPayload(release) {
  if (!release || typeof release !== "object") return release;
  const {
    release_digest: _releaseDigest,
    release_status: _releaseStatus,
    approvals: _approvals,
    deployment_evidence: _deploymentEvidence,
    rollback_evidence: _rollbackEvidence,
    retirement_evidence: _retirementEvidence,
    ...candidate
  } = release;
  return candidate;
}

export function expectedSolutionReleaseDigest(release) {
  return sha256Digest(Buffer.concat([
    Buffer.from(`${canonicalDigestVersion}/solution-release\0`, "utf8"),
    Buffer.from(canonicalJson(solutionReleaseDigestPayload(release)), "utf8"),
  ]));
}

export function evaluationOutputDigestPayload(report) {
  if (!report || typeof report !== "object") return report;
  return {
    report_id: report.report_id,
    version: report.version,
    generated_at: report.generated_at,
    claim: report.claim,
    objective: report.objective,
    population: report.population,
    system: report.system,
    suite: report.suite,
    evaluator: {
      grader: report.evaluator?.grader,
      runner: report.evaluator?.runner,
      output: {
        component_id: report.evaluator?.output?.component_id,
        uri: report.evaluator?.output?.uri,
        version: report.evaluator?.output?.version,
        schema_version: report.evaluator?.output?.schema_version,
      },
      minimum_confidence: report.evaluator?.minimum_confidence,
    },
    resource_budgets: report.resource_budgets,
    resource_usage: report.resource_usage,
    trials: report.trials,
    results: report.results,
    contamination_controls: report.contamination_controls,
    limitations: report.limitations,
  };
}

export function expectedEvaluationOutputDigest(report) {
  return sha256Digest(Buffer.concat([
    Buffer.from(`${canonicalDigestVersion}/evaluation-summary\0`, "utf8"),
    Buffer.from(canonicalJson(evaluationOutputDigestPayload(report)), "utf8"),
  ]));
}

function domainSeparatedCanonicalDigest(domain, value) {
  return sha256Digest(Buffer.concat([
    Buffer.from(`${canonicalDigestVersion}/${domain}\0`, "utf8"),
    Buffer.from(canonicalJson(value), "utf8"),
  ]));
}

export function capabilityAuthorityDigest(authority) {
  if (!authority || typeof authority !== "object") return null;
  const { digest: _digest, ...subject } = authority;
  return domainSeparatedCanonicalDigest("capability-authority", subject);
}

export function capabilityRegistryDecisionDigest(registryRecord) {
  if (!registryRecord || typeof registryRecord !== "object") return null;
  const { decision_digest: _digest, ...subject } = registryRecord;
  return domainSeparatedCanonicalDigest("capability-registry-decision", subject);
}

export function capabilityBuildAttestationDigest(attestation) {
  return domainSeparatedCanonicalDigest("capability-build-attestation", attestation);
}

export function evaluationEnvironmentDigestPayload(environment) {
  if (!environment || typeof environment !== "object") return environment;
  const { environment_digest: _environmentDigest, ...payload } = environment;
  return payload;
}

export function expectedEvaluationEnvironmentDigest(environment) {
  return domainSeparatedCanonicalDigest("evaluation-environment", evaluationEnvironmentDigestPayload(environment));
}

export function evaluationSandboxDigestPayload(sandbox) {
  if (!sandbox || typeof sandbox !== "object") return sandbox;
  const { digest: _digest, ...payload } = sandbox;
  return payload;
}

export function expectedEvaluationSandboxDigest(sandbox) {
  return domainSeparatedCanonicalDigest("evaluation-sandbox", evaluationSandboxDigestPayload(sandbox));
}

export function embeddedToolSchemaErrors(tool, label = "tool contract") {
  const errors = [];

  for (const field of embeddedToolSchemaFields) {
    if (tool?.[field] === undefined) continue;

    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    try {
      ajv.compile(tool[field]);
    } catch (error) {
      errors.push(`${label} ${field} schema compilation failed: ${error.message}`);
    }
  }

  return errors;
}

export function toolContractSemanticErrors(tool, label = "tool contract") {
  const errors = [];
  const inputProperties = new Set(Object.keys(tool?.input_schema?.properties ?? {}));
  const requiredInputs = new Set(tool?.input_schema?.required ?? []);
  const sensitivityRank = new Map([
    ["none", 0],
    ["public", 1],
    ["internal", 2],
    ["confidential", 3],
    ["restricted", 4],
  ]);

  for (const scopeField of tool?.data_access?.scope_fields ?? []) {
    if (!inputProperties.has(scopeField)) {
      errors.push(`${label} data-access scope field ${scopeField} is not declared in input_schema.properties`);
    } else if (!requiredInputs.has(scopeField)) {
      errors.push(`${label} data-access scope field ${scopeField} is not required by input_schema`);
    }
  }

  const classifications = tool?.data_access?.classifications ?? [];
  const declaredMaximumSensitivity = tool?.data_access?.maximum_sensitivity;
  const computedMaximumSensitivity = classifications.reduce(
    (maximum, classification) => Math.max(maximum, sensitivityRank.get(classification) ?? -1),
    0,
  );
  if (sensitivityRank.get(declaredMaximumSensitivity) !== computedMaximumSensitivity) {
    errors.push(`${label} maximum_sensitivity does not match the highest declared response classification`);
  }

  const destinationServiceIds = new Set();
  for (const destination of tool?.network?.destinations ?? []) {
    if (destinationServiceIds.has(destination?.service_id)) {
      errors.push(`${label} duplicates network destination service_id ${destination.service_id}`);
    }
    if (destination?.service_id) destinationServiceIds.add(destination.service_id);
  }
  const requestFields = new Set();
  for (const requestField of tool?.data_access?.request_fields ?? []) {
    if (requestFields.has(requestField.field)) {
      errors.push(`${label} duplicates request-field policy ${requestField.field}`);
    }
    requestFields.add(requestField.field);
    if (!inputProperties.has(requestField.field)) {
      errors.push(`${label} request field ${requestField.field} is not declared in input_schema.properties`);
    }
    for (const sinkServiceId of requestField.allowed_sink_service_ids ?? []) {
      if (!destinationServiceIds.has(sinkServiceId)) {
        errors.push(`${label} request field ${requestField.field} references undeclared sink service ${sinkServiceId}`);
      }
    }
  }

  if (tool?.network?.egress === "allowlist") {
    if ((tool.network.allowed_operations ?? []).length !== 1 || tool.network.allowed_operations[0] !== tool.tool_id) {
      errors.push(`${label} network allowed_operations must contain only tool_id ${tool.tool_id}`);
    }
    if (tool.authorization?.tenant_binding === true && tool.network.tenant_binding !== true) {
      errors.push(`${label} network policy does not preserve required tenant binding`);
    }
    for (const inputField of inputProperties) {
      if (!requestFields.has(inputField)) {
        errors.push(`${label} network-bound input field ${inputField} has no request-field policy`);
      }
    }
  }

  const publicGateway = tool?.network?.public_gateway_capability;
  if (tool?.data_access?.open_world === true) {
    if (!publicGateway
      || !destinationServiceIds.has(publicGateway.service_id)
      || !(tool.network?.allowed_operations ?? []).includes(publicGateway.operation)
      || publicGateway.operation !== tool.tool_id) {
      errors.push(`${label} open-world read is not bound to its exact public gateway capability`);
    }
  } else if (publicGateway !== null && publicGateway !== undefined) {
    errors.push(`${label} closed-world tool declares a public gateway capability`);
  }

  const idempotency = tool?.execution?.idempotency ?? {};
  if (idempotency.required === true) {
    for (const keyField of idempotency.key_fields ?? []) {
      if (!inputProperties.has(keyField)) {
        errors.push(`${label} idempotency key field ${keyField} is not declared in input_schema.properties`);
      } else if (!requiredInputs.has(keyField)) {
        errors.push(`${label} idempotency key field ${keyField} is not required by input_schema`);
      }
    }
    if (tool?.kind === "commit_write" && !(idempotency.key_fields ?? []).includes("idempotency_key")) {
      errors.push(`${label} commit idempotency key_fields must contain idempotency_key`);
    }
    if (["stage_write", "commit_write"].includes(tool?.kind)
      && !(idempotency.key_fields ?? []).includes("business_operation_id")) {
      errors.push(`${label} write idempotency key_fields must contain stable business_operation_id`);
    }
  }

  const failureModes = new Map();
  for (const failureMode of tool?.failure_modes ?? []) {
    if (failureModes.has(failureMode.code)) {
      errors.push(`${label} duplicates failure code ${failureMode.code}`);
    }
    failureModes.set(failureMode.code, failureMode);
    if (failureMode.retry === true
      && (failureMode.class !== "retryable" || failureMode.retry_safety !== "idempotent_replay")) {
      errors.push(`${label} failure ${failureMode.code} is not safe for automatic retry`);
    }
    if (failureMode.retry === false && failureMode.retry_safety !== "never") {
      errors.push(`${label} non-retryable failure ${failureMode.code} must declare retry_safety never`);
    }
  }

  const declaredRetryableErrors = new Set(tool?.execution?.retryable_errors ?? []);
  const retryableFailureCodes = new Set(
    [...failureModes.values()].filter((failureMode) => failureMode.retry === true).map((failureMode) => failureMode.code),
  );
  for (const errorCode of declaredRetryableErrors) {
    if (!retryableFailureCodes.has(errorCode)) {
      errors.push(`${label} retryable error ${errorCode} has no matching retry-safe failure mode`);
    }
  }
  for (const errorCode of retryableFailureCodes) {
    if (!declaredRetryableErrors.has(errorCode)) {
      errors.push(`${label} retry-safe failure ${errorCode} is missing from execution.retryable_errors`);
    }
  }
  if (retryableFailureCodes.size > 0 && (tool?.execution?.max_attempts ?? 1) < 2) {
    errors.push(`${label} declares retry-safe failures but max_attempts does not permit a retry`);
  }
  if (tool?.side_effects?.class !== "none" && retryableFailureCodes.size > 0 && idempotency.required !== true) {
    errors.push(`${label} side-effecting retries require enforced idempotency`);
  }

  return errors;
}

export function evaluationReportSemanticErrors(report, label = "evaluation report") {
  const errors = [];
  const {
    population = {},
    system = {},
    suite = {},
    resource_budgets: budgets = {},
    resource_usage: usage = {},
    trials = {},
    results = [],
    contamination_controls: contamination = {},
    decision = {},
  } = report ?? {};

  if (population.evaluated_cases + population.excluded_cases !== population.eligible_cases) {
    errors.push(`${label} evaluated and excluded cases must partition the eligible population`);
  }

  const populationSegments = new Set(population.segments ?? []);
  const coveredSegments = new Set();
  let coveredEligibleCases = 0;
  let coveredEvaluatedCases = 0;
  for (const coverage of population.case_coverage ?? []) {
    if (coveredSegments.has(coverage.slice)) errors.push(`${label} duplicates case-coverage slice ${coverage.slice}`);
    coveredSegments.add(coverage.slice);
    if (!populationSegments.has(coverage.slice)) errors.push(`${label} case-coverage slice ${coverage.slice} is not a declared population segment`);
    if (coverage.evaluated_cases > coverage.eligible_cases) {
      errors.push(`${label} case-coverage slice ${coverage.slice} evaluates more cases than are eligible`);
    }
    coveredEligibleCases += coverage.eligible_cases ?? 0;
    coveredEvaluatedCases += coverage.evaluated_cases ?? 0;
  }
  for (const segment of populationSegments) {
    if (!coveredSegments.has(segment)) errors.push(`${label} population segment ${segment} has no case-coverage entry`);
  }
  if (coveredEligibleCases !== population.eligible_cases || coveredEvaluatedCases !== population.evaluated_cases) {
    errors.push(`${label} case-coverage totals do not match the declared population totals`);
  }

  const componentRoles = new Set();
  for (const component of system.component_manifest ?? []) {
    if (componentRoles.has(component.role)) errors.push(`${label} duplicates component-manifest role ${component.role}`);
    componentRoles.add(component.role);
  }
  if (system.environment?.network_mode !== contamination.external_network) {
    errors.push(`${label} evaluation environment network mode contradicts contamination controls`);
  }
  if (system.environment?.sandbox?.isolation === "host_process") {
    if (system.environment.network_mode !== "unenforced"
      || system.environment.sandbox.network_enforced !== false
      || system.environment.sandbox.wall_time_enforced !== false) {
      errors.push(`${label} host-process evaluation must declare unenforced network and wall-time isolation`);
    }
    if (!(report?.limitations ?? []).some((limitation) => /host[- ]process/i.test(limitation)
      && /not (?:production|sandbox)/i.test(limitation))) {
      errors.push(`${label} host-process evaluation must explicitly limit non-production sandbox assurance`);
    }
  }
  const dependencyUris = new Set();
  for (const dependency of system.environment?.dependencies ?? []) {
    if (dependencyUris.has(dependency.uri)) errors.push(`${label} duplicates environment dependency ${dependency.uri}`);
    dependencyUris.add(dependency.uri);
  }
  if (system.environment?.sandbox?.digest !== expectedEvaluationSandboxDigest(system.environment?.sandbox)) {
    errors.push(`${label} sandbox digest does not match the canonical sandbox profile`);
  }
  const expectedEnvironmentDigest = expectedEvaluationEnvironmentDigest(system.environment);
  if (system.environment?.environment_digest !== expectedEnvironmentDigest) {
    errors.push(`${label} environment_digest does not match the canonical evaluation environment (${expectedEnvironmentDigest})`);
  }

  const budgetChecks = [
    ["turns", "max_turns"],
    ["tool_calls", "max_tool_calls"],
    ["total_tokens", "max_total_tokens"],
    ["wall_time_ms", "max_wall_time_ms"],
    ["cost_usd", "max_cost_usd"],
    ["peak_parallel_workers", "max_parallel_workers"],
  ];
  for (const [usageField, budgetField] of budgetChecks) {
    if (typeof usage[usageField] === "number"
      && typeof budgets[budgetField] === "number"
      && usage[usageField] > budgets[budgetField]) {
      errors.push(`${label} resource usage ${usageField} exceeds ${budgetField}`);
    }
  }

  if (trials.count > 1 && (!trials.independent || !trials.state_reset_between_trials)) {
    errors.push(`${label} repeated trials must be independent and reset state between trials`);
  }
  if (population.evaluated_cases > 0 && trials.count < 1) {
    errors.push(`${label} evaluated cases require at least one recorded trial`);
  }
  if (trials.count === 0 && Object.values(usage).some((value) => typeof value === "number" && value > 0)) {
    errors.push(`${label} zero recorded trials cannot declare non-zero resource usage`);
  }
  if (trials.aggregation === "single_pass" && trials.count > 1) {
    errors.push(`${label} single-pass aggregation permits at most one trial`);
  }
  if (["mean", "quantile"].includes(trials.aggregation) && trials.count < 2) {
    errors.push(`${label} ${trials.aggregation} aggregation requires repeated trials`);
  }
  if (Number.isInteger(trials.k) && Number.isInteger(trials.count) && trials.k > trials.count) {
    errors.push(`${label} aggregation k exceeds the trial count`);
  }

  const resultKeys = new Set();
  for (const result of results) {
    const resultKey = `${result.metric}\0${result.slice}`;
    if (resultKeys.has(resultKey)) errors.push(`${label} duplicates result ${result.metric}/${result.slice}`);
    resultKeys.add(resultKey);
    if (!coveredSegments.has(result.slice)) errors.push(`${label} result ${result.metric}/${result.slice} has no case-coverage slice`);

    const expectedPass = result.threshold?.operator === "eq"
      ? result.value === result.threshold.value
      : result.threshold?.operator === "lte"
        ? result.value <= result.threshold.value
        : result.value >= result.threshold?.value;
    if (result.pass !== expectedPass) errors.push(`${label} result ${result.metric}/${result.slice} pass flag contradicts its threshold`);
    if (result.uncertainty) {
      if (result.uncertainty.lower > result.uncertainty.upper) {
        errors.push(`${label} result ${result.metric}/${result.slice} has an inverted uncertainty interval`);
      }
      if (result.value < result.uncertainty.lower || result.value > result.uncertainty.upper) {
        errors.push(`${label} result ${result.metric}/${result.slice} value falls outside its uncertainty interval`);
      }
    }
  }

  if (decision.decided_by === report?.owner || decision.independent_from_candidate !== true) {
    errors.push(`${label} decision authority must be independent from the evaluation candidate and report owner`);
  }
  if (Date.parse(decision.decided_at) < Date.parse(report?.generated_at)) {
    errors.push(`${label} decision predates report generation`);
  }
  const expectedOutputDigest = expectedEvaluationOutputDigest(report);
  if (report?.evaluator?.output?.uri === null && report.evaluator.output.digest !== expectedOutputDigest) {
    errors.push(`${label} evaluator output digest does not match the canonical evaluation output (${expectedOutputDigest})`);
  }

  if (decision.status === "accept") {
    if (!report?.evaluator?.output?.uri) {
      errors.push(`${label} accepted evaluation requires immutable raw output evidence`);
    }
    const holdoutRequired = report?.objective !== "regression";
    if ((holdoutRequired && !suite.holdout_isolated)
      || system.environment?.sandbox?.isolation === "not_executed"
      || population.evaluated_cases < 1
      || trials.count < 1
      || results.some((result) => !result.pass)) {
      errors.push(`${label} cannot accept its claim without evaluated cases, an executed trial, required holdout isolation, and passing declared results`);
    }
    if ((contamination.known_exposures ?? []).length > 0
      || (report?.objective !== "regression" && contamination.reference_solution_reviewed === true)) {
      errors.push(`${label} cannot accept a contaminated evaluation or one whose reference solution was reviewed`);
    }
    if (report?.objective === "regression"
      && !(report?.limitations ?? []).some((limitation) => /does not (?:establish|claim).*(?:production|generalization)/i.test(limitation))) {
      errors.push(`${label} accepted regression evidence must disclaim production generalization`);
    }
    for (const coverage of population.case_coverage ?? []) {
      if (coverage.evaluated_cases < 1) {
        errors.push(`${label} accepted population slice ${coverage.slice} has no evaluated cases`);
      }
      if (!results.some((result) => result.slice === coverage.slice)) {
        errors.push(`${label} accepted population slice ${coverage.slice} has no declared result`);
      }
    }
    for (const result of results) {
      if (!result.uncertainty) {
        errors.push(`${label} accepted result ${result.metric}/${result.slice} requires a declared uncertainty interval`);
        continue;
      }
      const { lower, upper } = result.uncertainty;
      const threshold = result.threshold?.value;
      if (result.uncertainty.confidence < report.evaluator?.minimum_confidence) {
        errors.push(`${label} accepted result ${result.metric}/${result.slice} is below the minimum confidence`);
      }
      const boundPasses = result.threshold?.operator === "gte"
        ? lower >= threshold
        : result.threshold?.operator === "lte"
          ? upper <= threshold
          : lower === threshold && upper === threshold;
      if (!boundPasses) {
        errors.push(`${label} accepted result ${result.metric}/${result.slice} uncertainty interval crosses its threshold`);
      }
    }
  }
  return errors;
}

export function evaluationCaseSemanticErrors(evaluationCase, label = "evaluation case") {
  const errors = [];
  const authority = evaluationCase?.reference_authority ?? {};

  if (authority.label_author === authority.approved_by) {
    errors.push(`${label} reference label author and approver must be different principals`);
  }
  if (authority.review_due && evaluationCase?.last_reviewed
    && authority.review_due < evaluationCase.last_reviewed) {
    errors.push(`${label} reference label review_due precedes last_reviewed`);
  }
  if (authority.approved_at && evaluationCase?.last_reviewed
    && authority.approved_at.slice(0, 10) > evaluationCase.last_reviewed) {
    errors.push(`${label} reference label approval occurs after last_reviewed`);
  }
  if (authority.basis === "expert_judgment"
    && !["single_expert_review", "multi_expert_consensus"].includes(authority.adjudication_method)) {
    errors.push(`${label} expert-judgment reference requires an expert adjudication method`);
  }
  if (authority.basis === "synthetic_invariant"
    && authority.adjudication_method !== "synthetic_invariant_review") {
    errors.push(`${label} synthetic reference requires synthetic_invariant_review`);
  }

  return errors;
}

export function solutionReleaseSemanticErrors(release, label = "solution release") {
  const errors = [];
  const singletonRoles = new Set([
    "workflow_charter",
    "data_context",
    "domain_model",
    "agent_system",
    "security_policy",
    "threat_model",
    "evaluation",
    "runtime",
    "user_surface",
    "operations",
  ]);
  const roles = new Set();
  const roleUris = new Set();
  const artifactsByRole = new Map();
  for (const artifact of release?.artifacts ?? []) {
    if (singletonRoles.has(artifact.role) && roles.has(artifact.role)) {
      errors.push(`${label} duplicates artifact role ${artifact.role}`);
    }
    roles.add(artifact.role);
    const roleUri = `${artifact.role}\0${artifact.uri}`;
    if (roleUris.has(roleUri)) errors.push(`${label} duplicates artifact ${artifact.role}/${artifact.uri}`);
    roleUris.add(roleUri);
    if (!artifactsByRole.has(artifact.role)) artifactsByRole.set(artifact.role, []);
    artifactsByRole.get(artifact.role).push(artifact);
  }

  const topLevelBindings = [
    ["workflow_charter", "workflow_charter_uri"],
    ["agent_system", "agent_system_uri"],
    ["evaluation", "evaluation_report_uri"],
  ];
  for (const [role, field] of topLevelBindings) {
    const artifact = artifactsByRole.get(role)?.[0];
    if (artifact && artifact.uri !== release?.[field]) {
      errors.push(`${label} ${field} does not equal the ${role} artifact URI`);
    }
  }

  const approvalRoles = new Set();
  const approvalPrincipals = new Set();
  for (const approval of release?.approvals ?? []) {
    if (approvalRoles.has(approval.role)) errors.push(`${label} duplicates approval role ${approval.role}`);
    approvalRoles.add(approval.role);
    if (approvalPrincipals.has(approval.principal)) errors.push(`${label} approval principal ${approval.principal} is not independent`);
    approvalPrincipals.add(approval.principal);
    if (approval.bound_release_digest !== release.release_digest) {
      errors.push(`${label} ${approval.role} approval is not bound to the release digest`);
    }
    if (Date.parse(approval.approved_at) < Date.parse(release?.created_at)) {
      errors.push(`${label} ${approval.role} approval predates the release`);
    }
    if (approval.role === "service" && approval.principal !== release?.rollout?.service_owner) {
      errors.push(`${label} service approval is not issued by rollout.service_owner`);
    }
  }

  const expectedDigest = expectedSolutionReleaseDigest(release);
  if (release?.release_digest !== expectedDigest) {
    errors.push(`${label} release_digest does not match the canonical release payload (${expectedDigest})`);
  }

  const migrations = release?.compatibility?.migrations ?? [];
  if (release?.compatibility?.migration_required === true && migrations.length === 0) {
    errors.push(`${label} requires a migration but declares no migration procedure`);
  }
  if (release?.compatibility?.migration_required === false && migrations.length > 0) {
    errors.push(`${label} declares migrations while migration_required is false`);
  }

  const deploymentStatuses = new Set(["deployed", "rolled_back", "retired"]);
  const deployment = release?.deployment_evidence;
  if (deploymentStatuses.has(release?.release_status)) {
    if (!deployment) {
      errors.push(`${label} ${release.release_status} status requires deployment evidence`);
    } else {
      if (deployment.release_digest !== release.release_digest) errors.push(`${label} deployment evidence is not bound to the release digest`);
      if (deployment.environment_id !== release.compatibility?.environment_id) errors.push(`${label} deployment evidence names a different environment`);
      if (deployment.rollout_strategy !== release.rollout?.strategy) errors.push(`${label} deployment evidence names a different rollout strategy`);
      const completedDeployment = release.release_status === "deployed"
        || (release.release_status === "retired" && !release.rollback_evidence);
      if (completedDeployment && deployment.observed_traffic_percent !== release.rollout?.traffic_percent) {
        errors.push(`${label} deployment traffic does not match the rollout plan`);
      }
      if (!completedDeployment && (deployment.observed_traffic_percent > release.rollout?.traffic_percent
        || (release.rollout?.strategy !== "shadow" && deployment.observed_traffic_percent <= 0))) {
        errors.push(`${label} rollback deployment traffic must be positive and no greater than the rollout plan`);
      }
      if (Date.parse(deployment.deployed_at) < Date.parse(release.created_at)) errors.push(`${label} deployment predates the release`);
      if ((release.approvals ?? []).some((approval) => Date.parse(deployment.deployed_at) < Date.parse(approval.approved_at))) {
        errors.push(`${label} deployment predates a required approval`);
      }
    }
  } else if (deployment !== null && deployment !== undefined) {
    errors.push(`${label} ${release?.release_status} status cannot contain deployment evidence`);
  }

  const retirement = release?.retirement_evidence;
  const rollback = release?.rollback_evidence;
  if (release?.release_status === "rolled_back") {
    if (!rollback) {
      errors.push(`${label} rolled_back status requires rollback evidence`);
    } else {
      if (rollback.release_digest !== release.release_digest) errors.push(`${label} rollback evidence is not bound to the release digest`);
      if (deployment && Date.parse(rollback.rolled_back_at) < Date.parse(deployment.deployed_at)) {
        errors.push(`${label} rollback predates deployment`);
      }
    }
  } else if (release?.release_status !== "retired" && rollback !== null && rollback !== undefined) {
    errors.push(`${label} ${release?.release_status} status cannot contain rollback evidence`);
  }
  if (release?.release_status === "retired") {
    if (!retirement) {
      errors.push(`${label} retired status requires retirement evidence`);
    } else {
      if (retirement.release_digest !== release.release_digest) errors.push(`${label} retirement evidence is not bound to the release digest`);
      if (deployment && Date.parse(retirement.retired_at) < Date.parse(deployment.deployed_at)) {
        errors.push(`${label} retirement predates deployment`);
      } else if (rollback && Date.parse(retirement.retired_at) < Date.parse(rollback.rolled_back_at)) {
        errors.push(`${label} retirement predates rollback`);
      }
    }
  } else if (retirement !== null && retirement !== undefined) {
    errors.push(`${label} ${release?.release_status} status cannot contain retirement evidence`);
  }
  return errors;
}

export function ontologyIdentityErrors(ontology, label = "operational ontology") {
  const errors = [];

  for (const entity of ontology?.entities ?? []) {
    const attributeNames = new Set();
    for (const attribute of entity.attributes ?? []) {
      if (attributeNames.has(attribute.name)) {
        errors.push(`${label} entity ${entity.entity_id} duplicates attribute ${attribute.name}`);
      }
      attributeNames.add(attribute.name);
    }

    for (const identityKey of entity.identity_keys ?? []) {
      if (!attributeNames.has(identityKey)) {
        errors.push(`${label} entity ${entity.entity_id} identity key ${identityKey} is not declared as an attribute`);
      }
    }
  }

  return errors;
}

export function systemMapManifestSemanticErrors(map, label = "system-map manifest") {
  const errors = [];
  const sources = map?.sources ?? [];
  const nodes = map?.nodes ?? [];
  const relations = map?.relations ?? [];
  const sourceIds = new Set();
  const nodeIds = new Set();
  const relationIds = new Set();

  for (const source of sources) {
    if (sourceIds.has(source.source_id)) errors.push(`${label} duplicates source ${source.source_id}`);
    sourceIds.add(source.source_id);
  }
  for (const node of nodes) {
    if (nodeIds.has(node.node_id)) errors.push(`${label} duplicates node ${node.node_id}`);
    nodeIds.add(node.node_id);
    for (const sourceRef of node.source_refs ?? []) {
      if (!sourceIds.has(sourceRef)) errors.push(`${label} node ${node.node_id} references missing source ${sourceRef}`);
    }
  }
  for (const relation of relations) {
    if (relationIds.has(relation.relation_id)) errors.push(`${label} duplicates relation ${relation.relation_id}`);
    relationIds.add(relation.relation_id);
    if (!nodeIds.has(relation.source_node_id)) errors.push(`${label} relation ${relation.relation_id} references missing source node ${relation.source_node_id}`);
    if (!nodeIds.has(relation.target_node_id)) errors.push(`${label} relation ${relation.relation_id} references missing target node ${relation.target_node_id}`);
    for (const sourceRef of relation.source_refs ?? []) {
      if (!sourceIds.has(sourceRef)) errors.push(`${label} relation ${relation.relation_id} references missing source ${sourceRef}`);
    }
  }

  const includedSources = new Set(sources.filter((source) => source.included).map((source) => source.source_id));
  const coverageSources = new Set(map?.derivation?.coverage?.included_source_ids ?? []);
  if (includedSources.size !== coverageSources.size
    || [...includedSources].some((sourceId) => !coverageSources.has(sourceId))) {
    errors.push(`${label} derivation coverage does not equal included source IDs`);
  }
  if (map?.status === "verified" && map?.derivation?.coverage?.status !== "complete") {
    errors.push(`${label} verified status requires complete derivation coverage`);
  }
  return errors;
}

export function changeImpactAssessmentSemanticErrors(assessment, map = null, label = "change-impact assessment") {
  const errors = [];
  const impacts = assessment?.impacted_elements ?? [];
  const impactIds = new Set();
  const mapNodeIds = map ? new Set((map.nodes ?? []).map((node) => node.node_id)) : null;

  if (assessment?.impact_summary?.impact_count !== impacts.length) {
    errors.push(`${label} impact_summary.impact_count does not equal impacted_elements length`);
  }
  for (const impact of impacts) {
    if (impactIds.has(impact.impact_id)) errors.push(`${label} duplicates impact ${impact.impact_id}`);
    impactIds.add(impact.impact_id);
    if (mapNodeIds && !mapNodeIds.has(impact.element_id)) {
      errors.push(`${label} impact ${impact.impact_id} references missing mapped element ${impact.element_id}`);
    }
  }
  if (["material", "critical"].includes(assessment?.change?.materiality)
    && (assessment?.impact_summary?.unmapped_change_references ?? []).length > 0) {
    errors.push(`${label} material change cannot retain unmapped change references`);
  }
  return errors;
}

const valueScorecardFactors = [
  [1, "observe_real_work", "Observe the real work"],
  [2, "own_outcome", "Own the outcome"],
  [3, "bound_eligible_work", "Bound the eligible work"],
  [4, "establish_counterfactual", "Establish the counterfactual"],
  [5, "name_verifier", "Name the verifier"],
  [6, "engineer_workflow_and_adoption", "Engineer the workflow and adoption"],
  [7, "use_smallest_sufficient_intelligence", "Use the smallest sufficient intelligence"],
  [8, "bound_authority_and_loss", "Bound authority and loss"],
  [9, "price_whole_service", "Price the whole service"],
  [10, "prove_representative_work", "Prove it on representative work"],
  [11, "measure_attributable_realized_value", "Measure attributable realized value"],
  [12, "expand_constrain_or_retire", "Expand, constrain, or retire from evidence"],
];

export function valueScorecardSemanticErrors(scorecard, label = "AI value engineering scorecard") {
  const errors = [];
  const factors = scorecard?.factors ?? [];
  for (const [index, expected] of valueScorecardFactors.entries()) {
    const [number, id, name] = expected;
    const factor = factors[index];
    if (!factor
      || factor.factor_number !== number
      || factor.factor_id !== id
      || factor.factor_name !== name) {
      errors.push(`${label} factor ${number} does not match the canonical ordered factor`);
      continue;
    }
    if (factor.score === 2 && (factor.evidence ?? []).length === 0) {
      errors.push(`${label} factor ${number} cannot be demonstrated without evidence`);
    }
  }

  const gates = Object.values(scorecard?.hard_gates ?? {});
  const unresolvedGate = gates.some((gate) => gate?.status !== "pass");
  if (unresolvedGate && ["pilot", "continue"].includes(scorecard?.decision?.disposition)) {
    errors.push(`${label} cannot recommend ${scorecard.decision.disposition} while a hard gate is fail or unknown`);
  }
  for (const [gateId, gate] of Object.entries(scorecard?.hard_gates ?? {})) {
    if (gate?.status === "pass" && (gate.evidence ?? []).length === 0) {
      errors.push(`${label} hard gate ${gateId} cannot pass without evidence`);
    }
  }
  if (scorecard?.assessed_at && scorecard?.decision?.decided_at
    && scorecard.decision.decided_at < scorecard.assessed_at) {
    errors.push(`${label} decision predates the assessment`);
  }
  if (scorecard?.assessed_at && scorecard?.decision?.next_review
    && scorecard.decision.next_review < scorecard.assessed_at.slice(0, 10)) {
    errors.push(`${label} next review predates the assessment`);
  }

  return errors;
}

export function patternCatalogErrors(catalog, evidenceIds, label = "pattern catalog", today = new Date()) {
  const errors = [];
  const patternIds = new Set();
  const todayIso = today.toISOString().slice(0, 10);

  for (const pattern of catalog?.patterns ?? []) {
    if (patternIds.has(pattern.id)) errors.push(`${label} duplicates pattern ID ${pattern.id}`);
    patternIds.add(pattern.id);

    for (const evidenceId of pattern.evidence ?? []) {
      if (evidenceId.startsWith("internal-")) continue;
      if (!evidenceIds.has(evidenceId.toUpperCase())) {
        errors.push(`${label} pattern ${pattern.id} references missing evidence ${evidenceId}`);
      }
    }

    if (pattern.reviewed_at && pattern.review_due && pattern.reviewed_at > pattern.review_due) {
      errors.push(`${label} pattern ${pattern.id} review_due precedes reviewed_at`);
    }
    if (pattern.reviewed_at && pattern.reviewed_at > todayIso) {
      errors.push(`${label} pattern ${pattern.id} reviewed_at is in the future`);
    }
    if (pattern.review_due && pattern.review_due < todayIso) {
      errors.push(`${label} pattern ${pattern.id} review is overdue`);
    }
  }

  return errors;
}
