import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const requiredInput = ["tenant_id", "business_operation_id", "invoice_id", "invoice_revision", "caller"];
const requiredDependencies = [
  "loadContext",
  "proposeResolution",
  "validateProposal",
  "authorize",
  "stageResolution",
  "requestApproval",
  "commitResolution",
  "readbackInvoice",
  "verifyReadback",
  "verifyServiceReceipt",
  "verifyReadbackAttestation",
  "compensate",
  "openIncident",
  "admittedReleaseDigest",
  "cost",
  "monotonicNowMs",
];

const runtimeBudget = Object.freeze({
  maxCostUsd: 0.4,
  maxSteps: 12,
  maxWallTimeMs: 90000,
  maxRecoveryWallTimeMs: 5000,
});

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function digest(value) {
  return `sha256:${createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex")}`;
}

function digestBytes(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function solutionReleaseDigestPayload(release) {
  const {
    release_digest: _releaseDigest,
    release_status: _releaseStatus,
    approvals: _approvals,
    deployment_evidence: _deploymentEvidence,
    rollback_evidence: _rollbackEvidence,
    retirement_evidence: _retirementEvidence,
    ...payload
  } = release;
  return payload;
}

function expectedSolutionReleaseDigest(release) {
  const domain = Buffer.from("production-agent-engineering/canonical-json/v1/solution-release\0", "utf8");
  const payload = Buffer.from(JSON.stringify(canonical(solutionReleaseDigestPayload(release))), "utf8");
  return digestBytes(Buffer.concat([domain, payload]));
}

const releaseUrl = new URL("./solution-release.json", import.meta.url);
const readJson = (url) => JSON.parse(readFileSync(url, "utf8"));
const referenceReleasePayload = Object.freeze(readJson(releaseUrl));
const referenceReleaseDigest = expectedSolutionReleaseDigest(referenceReleasePayload);
if (referenceReleasePayload.release_digest !== referenceReleaseDigest) {
  throw new Error("invoice reference release digest does not match its canonical manifest");
}
if (["rolled_back", "retired"].includes(referenceReleasePayload.release_status)) {
  throw new Error(`invoice reference release is not executable in status ${referenceReleasePayload.release_status}`);
}

const expectedArtifacts = Object.freeze([
  ["workflow_charter", "workflow-charter.json", new URL("./workflow-charter.json", import.meta.url)],
  ["data_context", "data-context-manifest.json", new URL("./data-context-manifest.json", import.meta.url)],
  ["domain_model", "ontology.json", new URL("./ontology.json", import.meta.url)],
  ["agent_system", "agent-system.json", new URL("./agent-system.json", import.meta.url)],
  ["behavior_bundle", "behavior-bundle.json", new URL("./behavior-bundle.json", import.meta.url)],
  ["tool_contract", "tools/read-invoice.json", new URL("./tools/read-invoice.json", import.meta.url)],
  ["tool_contract", "tools/retrieve-policy.json", new URL("./tools/retrieve-policy.json", import.meta.url)],
  ["tool_contract", "tools/stage-resolution.json", new URL("./tools/stage-resolution.json", import.meta.url)],
  ["tool_contract", "tools/commit-resolution.json", new URL("./tools/commit-resolution.json", import.meta.url)],
  ["tool_contract", "tools/readback-invoice-effect.json", new URL("./tools/readback-invoice-effect.json", import.meta.url)],
  ["capability_manifest", "capabilities/read-invoice.json", new URL("./capabilities/read-invoice.json", import.meta.url)],
  ["capability_manifest", "capabilities/retrieve-policy.json", new URL("./capabilities/retrieve-policy.json", import.meta.url)],
  ["capability_manifest", "capabilities/stage-resolution.json", new URL("./capabilities/stage-resolution.json", import.meta.url)],
  ["capability_manifest", "capabilities/commit-resolution.json", new URL("./capabilities/commit-resolution.json", import.meta.url)],
  ["capability_manifest", "capabilities/readback-invoice-effect.json", new URL("./capabilities/readback-invoice-effect.json", import.meta.url)],
  ["security_policy", "authorization-policy.mjs", new URL("./authorization-policy.mjs", import.meta.url)],
  ["threat_model", "threat-model.json", new URL("./threat-model.json", import.meta.url)],
  ["evaluation", "evaluation-report.json", new URL("./evaluation-report.json", import.meta.url)],
  ["runtime", "reference-loop.mjs", new URL("./reference-loop.mjs", import.meta.url)],
  ["user_surface", "README.md", new URL("./README.md", import.meta.url)],
  ["operations", "../../operations/incident-runbook.md", new URL("../../operations/incident-runbook.md", import.meta.url)],
]);

if (referenceReleasePayload.artifacts.length !== expectedArtifacts.length) {
  throw new Error("invoice reference release artifact set is incomplete or contains undeclared members");
}
const boundArtifacts = new Map();
for (const [role, uri, fileUrl] of expectedArtifacts) {
  const matches = referenceReleasePayload.artifacts.filter((artifact) => artifact.role === role && artifact.uri === uri);
  if (matches.length !== 1) throw new Error(`invoice reference release must bind exactly one ${role}:${uri}`);
  const artifact = matches[0];
  if (artifact.digest !== digestBytes(readFileSync(fileUrl))) {
    throw new Error(`invoice reference release artifact digest does not match ${uri}`);
  }
  boundArtifacts.set(`${role}:${uri}`, artifact);
}

const referenceAgentSystem = Object.freeze(readJson(new URL("./agent-system.json", import.meta.url)));
const referenceWorkflowCharter = Object.freeze(readJson(new URL("./workflow-charter.json", import.meta.url)));
const referenceOntology = Object.freeze(readJson(new URL("./ontology.json", import.meta.url)));
const boundArtifact = (role, uri) => boundArtifacts.get(`${role}:${uri}`);
const behaviorComponent = (role) => {
  const component = referenceAgentSystem.behavior[role];
  const behaviorArtifact = boundArtifact("behavior_bundle", "behavior-bundle.json");
  if (component.uri !== "./behavior-bundle.json" || component.digest !== behaviorArtifact.digest) {
    throw new Error(`invoice reference ${role} is not bound to the admitted behavior bundle`);
  }
  return { id: component.component_id, version: component.version, digest: component.digest };
};

const referenceComponentVersions = Object.freeze({
  agent_system: {
    id: referenceAgentSystem.system_id,
    version: referenceAgentSystem.version,
    digest: boundArtifact("agent_system", "agent-system.json").digest,
  },
  workflow: {
    id: referenceWorkflowCharter.workflow_id,
    version: referenceWorkflowCharter.version,
    digest: boundArtifact("workflow_charter", "workflow-charter.json").digest,
  },
  ontology: {
    id: referenceOntology.ontology_id,
    version: referenceOntology.version,
    digest: boundArtifact("domain_model", "ontology.json").digest,
  },
  policy_bundle: behaviorComponent("guardrail_policy"),
  prompt_bundle: behaviorComponent("prompt_bundle"),
  model_route: behaviorComponent("model_route"),
  tool_bundle: behaviorComponent("tool_bundle"),
  runtime: {
    id: "invoice_exception_reference_runtime",
    version: boundArtifact("runtime", "reference-loop.mjs").version,
    digest: boundArtifact("runtime", "reference-loop.mjs").digest,
  },
});

function assertContract(input, deps) {
  for (const field of requiredInput) {
    if (input[field] === undefined || input[field] === null) throw new TypeError(`missing input.${field}`);
  }
  for (const dependency of requiredDependencies) {
    if (typeof deps[dependency] !== "function") throw new TypeError(`missing dependency ${dependency}`);
  }
}

export async function runInvoiceException(input, deps) {
  assertContract(input, deps);

  const trace = [];
  const startedAtMs = deps.monotonicNowMs();
  const startedAtWallClockMs = Date.now();
  const runId = randomUUID();
  const traceId = runId.replaceAll("-", "");
  const operationId = digest({
    tenant_id: input.tenant_id,
    business_operation_id: input.business_operation_id,
    action: "commit_resolution",
  });
  const telemetryIdentity = {
    tenant_hash: digest(input.tenant_id),
    agent_principal_hash: digest("invoice-exception-workload"),
    caller_id_hash: digest(input.caller.id ?? `${input.tenant_id}:anonymous`),
  };
  const releaseDigest = referenceReleaseDigest;
  const componentVersions = referenceComponentVersions;

  const transition = async (state, attributes = {}) => {
    const { stop_reason: stopReason, ...details } = attributes;
    const parentSpanId = trace.at(-1)?.span_id ?? null;
    const spanId = createHash("sha256").update(`${runId}:${trace.length + 1}:${state}`).digest("hex").slice(0, 16);
    const telemetry = {
      "agent.run.id": runId,
      "agent.operation.id": operationId,
      "agent.release.digest": releaseDigest,
      "agent.system.id": referenceAgentSystem.system_id,
      "agent.system.version": referenceAgentSystem.version,
      "agent.workflow.id": referenceWorkflowCharter.workflow_id,
      "agent.workflow.state": state,
      "agent.tenant.hash": telemetryIdentity.tenant_hash,
      "agent.principal.id_hash": telemetryIdentity.agent_principal_hash,
      "agent.caller.id_hash": telemetryIdentity.caller_id_hash,
      "agent.actor.mode": "interactive_delegated",
      "agent.autonomy.level": "execute_reversible",
      "agent.steps.count": trace.length + 1,
    };
    if (stopReason) {
      telemetry["agent.stop.reason"] = stopReason;
      telemetry["agent.cost.usd"] = typeof deps.cost === "function" ? deps.cost() : 0;
      telemetry["agent.accepted_outcome"] = state === "completed";
    }
    const event = {
      schema_version: "1.2.0",
      event_name: "agent.state.transition",
      occurred_at: deps.now ? deps.now() : new Date().toISOString(),
      run_id: runId,
      trace_id: traceId,
      span_id: spanId,
      parent_span_id: parentSpanId,
      operation_id: operationId,
      release_digest: releaseDigest,
      component_versions: componentVersions,
      actor_mode: "interactive_delegated",
      state,
      details,
      telemetry,
      retention_class: "write_audit",
      ...(stopReason ? { stop_reason: stopReason } : {}),
    };
    trace.push(event);
    if (deps.emit) await deps.emit(event);
  };

  const terminal = async (state, reason, artifacts = {}) => {
    await transition(state, { stop_reason: reason });
    return { run_id: runId, operation_id: operationId, state, stop_reason: reason, trace, ...artifacts };
  };

  const budgetViolation = ({ includeSteps = true } = {}) => {
    const costUsd = deps.cost();
    const elapsedMs = Math.max(
      deps.monotonicNowMs() - startedAtMs,
      Date.now() - startedAtWallClockMs,
    );
    if (!Number.isFinite(costUsd) || costUsd < 0 || costUsd > runtimeBudget.maxCostUsd) {
      return "BUDGET_COST_EXCEEDED";
    }
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs > runtimeBudget.maxWallTimeMs) {
      return "BUDGET_TIME_EXCEEDED";
    }
    if (includeSteps && trace.length >= runtimeBudget.maxSteps - 1) return "BUDGET_STEPS_EXCEEDED";
    return null;
  };
  const deadlineError = (boundary, code = "BUDGET_TIME_EXCEEDED") => Object.assign(
    new Error(`${boundary} exceeded its wall-time deadline`),
    { code, boundary, retryable: false },
  );
  const isBudgetDeadline = (error) => error?.code === "BUDGET_TIME_EXCEEDED";
  const awaitBoundary = async (boundary, invoke, { recovery = false } = {}) => {
    const elapsedMs = Math.max(
      deps.monotonicNowMs() - startedAtMs,
      Date.now() - startedAtWallClockMs,
    );
    const remainingMs = recovery
      ? runtimeBudget.maxRecoveryWallTimeMs
      : runtimeBudget.maxWallTimeMs - elapsedMs;
    const errorCode = recovery ? "RECOVERY_TIME_EXCEEDED" : "BUDGET_TIME_EXCEEDED";
    if (!Number.isFinite(remainingMs) || remainingMs <= 0) throw deadlineError(boundary, errorCode);

    const controller = new AbortController();
    let wallTimer;
    let deadlineCheck;
    let settled = false;
    const expire = (error) => {
      if (settled) return;
      controller.abort(error);
    };
    const deadline = new Promise((_, reject) => {
      const error = deadlineError(boundary, errorCode);
      wallTimer = setTimeout(() => {
        expire(error);
        reject(error);
      }, Math.max(1, Math.ceil(remainingMs)));
      const check = () => {
        if (settled) return;
        if (!recovery && budgetViolation({ includeSteps: false }) === "BUDGET_TIME_EXCEEDED") {
          expire(error);
          reject(error);
          return;
        }
        deadlineCheck = setImmediate(check);
      };
      deadlineCheck = setImmediate(check);
    });

    try {
      return await Promise.race([
        Promise.resolve().then(() => invoke({
          signal: controller.signal,
          deadline_monotonic_ms: startedAtMs + runtimeBudget.maxWallTimeMs,
        })),
        deadline,
      ]);
    } catch (error) {
      if (controller.signal.aborted) throw controller.signal.reason;
      throw error;
    } finally {
      settled = true;
      clearTimeout(wallTimer);
      clearImmediate(deadlineCheck);
    }
  };
  const stopBeforeEffectIfOverBudget = async () => {
    const errorCode = budgetViolation();
    return errorCode
      ? terminal("escalated", "budget_exhausted", { error_code: errorCode })
      : null;
  };

  try {
  await transition("received");
  const admittedReleaseDigest = await awaitBoundary(
    "admitted_release_digest",
    ({ signal }) => deps.admittedReleaseDigest({ signal }),
  );
  if (admittedReleaseDigest !== releaseDigest) {
    return terminal("escalated", "release_not_admitted", { error_code: "RELEASE_NOT_ADMITTED" });
  }
  let budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  let context;
  try {
    context = await awaitBoundary(
      "load_context",
      ({ signal }) => deps.loadContext({ ...input, release_digest: releaseDigest }, { signal }),
    );
  } catch (error) {
    if (isBudgetDeadline(error)) throw error;
    const stopReason = error?.code === "DIGEST_MISMATCH"
      ? "release_not_admitted"
      : error?.code === "POLICY_DENIED"
        ? "policy_denied"
        : "context_load_failed";
    return terminal("escalated", stopReason, {
      error_code: error?.code ?? "INTERNAL_ERROR",
    });
  }
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  await transition("evidence_loaded", {
    source_revisions: [
      { source_id: "invoice", revision_digest: digest(context.invoice.revision) },
      { source_id: "finance_policy", revision_digest: digest(context.policy.revision) },
    ],
  });

  if (context.invoice.tenant_id !== input.tenant_id) {
    return terminal("escalated", "tenant_mismatch");
  }
  if (context.policy.tenant_id !== input.tenant_id) {
    return terminal("escalated", "tenant_mismatch");
  }
  if (context.invoice.revision !== input.invoice_revision) {
    return terminal("escalated", "stale_invoice_revision");
  }
  if (!context.policy.current) {
    return terminal("escalated", "stale_policy");
  }

  const proposal = await awaitBoundary(
    "propose_resolution",
    ({ signal }) => deps.proposeResolution({ input, context }, { signal }),
  );
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  await transition("proposed");

  const validation = await awaitBoundary(
    "validate_proposal",
    ({ signal }) => deps.validateProposal({ proposal, context }, { signal }),
  );
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  if (!validation.valid) {
    return terminal("escalated", "validation_failed", { validation_error_codes: ["PROPOSAL_INVALID"] });
  }
  await transition("validated");

  const proposalDigest = digest({
    tenant_id: input.tenant_id,
    invoice_id: input.invoice_id,
    proposal,
    invoice_revision: context.invoice.revision,
    policy_revision: context.policy.revision,
  });
  const idempotencyKey = operationId;

  const stageDecision = await awaitBoundary("authorize_stage", ({ signal }) => deps.authorize({
    action: "stage_resolution",
    operation_id: operationId,
    agent: "invoice-exception-workload",
    caller: input.caller,
    tenant_id: input.tenant_id,
    resource: context.invoice,
    policy_revision: context.policy.revision,
  }, { signal }));
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  await transition("stage_authorized", {
    decision_references: [{ decision_type: "authorization", decision_id: stageDecision.decision_id }],
  });
  if (!stageDecision.allow) {
    return terminal("escalated", "policy_denied");
  }

  let staged;
  try {
    staged = await awaitBoundary("stage_resolution", ({ signal }) => deps.stageResolution({
      operation_id: operationId,
      release_digest: releaseDigest,
      tenant_id: input.tenant_id,
      business_operation_id: input.business_operation_id,
      invoice_id: input.invoice_id,
      invoice_revision: context.invoice.revision,
      policy_revision: context.policy.revision,
      proposal,
      proposal_digest: proposalDigest,
      idempotency_key: idempotencyKey,
      policy_decision_id: stageDecision.decision_id,
    }, { signal }));
  } catch (error) {
    if (isBudgetDeadline(error)) throw error;
    const stopReason = error?.code === "DIGEST_MISMATCH"
      ? "release_not_admitted"
      : error?.code === "POLICY_DENIED"
        ? "policy_denied"
        : "internal_error";
    return terminal("escalated", stopReason, {
      error_code: error?.code ?? "INTERNAL_ERROR",
    });
  }
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  if (staged.proposal_digest !== proposalDigest) {
    return terminal("escalated", "idempotency_conflict", {
      proposal_id: staged.proposal_id,
      staged_proposal_digest: staged.proposal_digest,
      attempted_proposal_digest: proposalDigest,
    });
  }
  await transition("staged", {
    artifact_references: [{
      artifact_type: "proposal",
      artifact_id_hash: digest(staged.proposal_id),
      content_digest: proposalDigest,
    }],
  });

  const approval = await awaitBoundary("request_approval", ({ signal }) => deps.requestApproval({
    proposal_id: staged.proposal_id,
    proposal_digest: proposalDigest,
    evidence: context.evidence,
    expires_seconds: 3600,
  }, { signal }));
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  const authorizationTime = deps.now ? deps.now() : new Date().toISOString();
  const approvedAtMs = Date.parse(approval.approved_at ?? "");
  const authorizationTimeMs = Date.parse(authorizationTime);
  const expiresAtMs = Date.parse(approval.expires_at ?? "");
  const approvalTimeInvalid = !Number.isFinite(approvedAtMs)
    || !Number.isFinite(authorizationTimeMs)
    || approvedAtMs > authorizationTimeMs
    || (Number.isFinite(expiresAtMs) && approvedAtMs >= expiresAtMs);
  const approvalExpired = approval.expired === true
    || !approval.expires_at
    || !Number.isFinite(expiresAtMs)
    || expiresAtMs <= authorizationTimeMs;
  if (!approval.approved || approvalExpired || approvalTimeInvalid) {
    const stopReason = approvalTimeInvalid
      ? "approval_time_invalid"
      : approvalExpired
        ? "approval_expired"
        : "approval_rejected";
    return terminal("rejected", stopReason, {
      proposal_id: staged.proposal_id,
    });
  }
  if (approval.proposal_digest !== proposalDigest) {
    return terminal("escalated", "approval_digest_mismatch", { proposal_id: staged.proposal_id });
  }
  await transition("approved", {
    decision_references: [{ decision_type: "approval", decision_id: approval.approval_id }],
  });

  const commitDecision = await awaitBoundary("authorize_commit", ({ signal }) => deps.authorize({
    action: "commit_resolution",
    operation_id: operationId,
    agent: "invoice-exception-workload",
    caller: input.caller,
    tenant_id: input.tenant_id,
    resource: context.invoice,
    policy_revision: context.policy.revision,
    proposal_digest: proposalDigest,
    now: authorizationTime,
    approval,
  }, { signal }));
  budgetStop = await stopBeforeEffectIfOverBudget();
  if (budgetStop) return budgetStop;
  await transition("commit_authorized", {
    decision_references: [{ decision_type: "authorization", decision_id: commitDecision.decision_id }],
  });
  if (!commitDecision.allow) {
    return terminal("escalated", "policy_denied_before_commit", { proposal_id: staged.proposal_id });
  }

  const resourceHash = digest({
    tenant_id: input.tenant_id,
    invoice_id: input.invoice_id,
    invoice_revision: context.invoice.revision,
  });
  const accountHash = digest(`${input.tenant_id}:accounts-payable-ledger`);
  const expectedPostconditionDigest = digest({ status: "resolved", resolution_count: 1 });
  const readbackRequestedAt = deps.now ? deps.now() : new Date().toISOString();
  const readbackRequestId = randomUUID();
  const commitRequest = {
    run_id: runId,
    operation_id: operationId,
    release_digest: releaseDigest,
    tenant_id: input.tenant_id,
    business_operation_id: input.business_operation_id,
    invoice_id: input.invoice_id,
    invoice_revision: context.invoice.revision,
    policy_revision: context.policy.revision,
    policy_decision_id: commitDecision.decision_id,
    proposal_id: staged.proposal_id,
    proposal_digest: proposalDigest,
    approval_id: approval.approval_id,
    idempotency_key: idempotencyKey,
    expected_postcondition_digest: expectedPostconditionDigest,
  };
  const readbackRequest = {
    run_id: runId,
    readback_request_id: readbackRequestId,
    requested_at: readbackRequestedAt,
    tenant_id: input.tenant_id,
    invoice_id: input.invoice_id,
    operation_id: operationId,
    release_digest: releaseDigest,
    caller_principal_hash: telemetryIdentity.caller_id_hash,
    policy_decision_id: commitDecision.decision_id,
  };
  let effect;
  let readback;
  let completionReason = "completed";
  let effectState = "committed";
  let postEffectBudgetError = null;
  try {
    effect = await awaitBoundary(
      "commit_resolution",
      ({ signal }) => deps.commitResolution(commitRequest, { signal }),
    );
  } catch (error) {
    if (error?.code === "POLICY_DENIED") {
      return terminal("escalated", "policy_denied_at_commit", { error_code: error.code });
    }
    if (error?.code === "DIGEST_MISMATCH") {
      return terminal("escalated", "release_not_admitted", { error_code: error.code });
    }
    if (!isBudgetDeadline(error) && (error?.code !== "TIMEOUT" || error.retryable !== true)) {
      return terminal("escalated", "internal_error", { error_code: error?.code ?? "INTERNAL_ERROR" });
    }

    await transition("effect_unknown", { error: { code: error.code } });
    if (isBudgetDeadline(error)) postEffectBudgetError = error.code;
    try {
      readback = await awaitBoundary(
        "readback_after_unknown_effect",
        ({ signal }) => deps.readbackInvoice(readbackRequest, { signal }),
        { recovery: true },
      );
    } catch (readbackError) {
      const incident = await awaitBoundary("open_reconciliation_incident", ({ signal }) => deps.openIncident({
        run_id: runId,
        severity: "SEV-1",
        reason: "timeout_readback_denied",
      }, { signal }), { recovery: true });
      return terminal("escalated", postEffectBudgetError ? "budget_exhausted" : "readback_denied", {
        error_code: postEffectBudgetError ?? readbackError?.code ?? "READBACK_FAILED",
        incident_id: incident.incident_id,
      });
    }
    if (!readback.last_effect) {
      return terminal("escalated", postEffectBudgetError ? "budget_exhausted" : "timeout_exhausted", { error_code: error.code });
    }
    effect = readback.last_effect;
    completionReason = "completed_after_timeout_recovery";
    effectState = "effect_recovered";
  }

  const signedSubject = effect?.service_receipt?.subject;
  const expectedServiceSubject = {
    receipt_id: signedSubject?.receipt_id,
    effect_id: effect?.effect_id,
    run_id: signedSubject?.run_id,
    operation_id: operationId,
    release_digest: releaseDigest,
    tenant_hash: telemetryIdentity.tenant_hash,
    account_hash: accountHash,
    agent_principal_hash: telemetryIdentity.agent_principal_hash,
    caller_principal_hash: telemetryIdentity.caller_id_hash,
    action: "commit_resolution",
    effect_class: "reversible",
    resource_hash: resourceHash,
    source_revision: context.invoice.revision,
    proposal_digest: proposalDigest,
    idempotency_key_hash: digest(idempotencyKey),
    policy_decision_id: commitDecision.decision_id,
    policy_revision: context.policy.revision,
    approval_id: approval.approval_id,
    expected_postcondition_digest: expectedPostconditionDigest,
    committed_at: signedSubject?.committed_at,
  };
  let serviceReceiptVerified = false;
  try {
    serviceReceiptVerified = await awaitBoundary(
      "verify_service_receipt",
      ({ signal }) => deps.verifyServiceReceipt({
        receipt: effect?.service_receipt,
        expected_subject: expectedServiceSubject,
      }, { signal }),
      { recovery: true },
    );
  } catch (error) {
    if (error?.code !== "RECOVERY_TIME_EXCEEDED") throw error;
  }
  if (serviceReceiptVerified) {
    await transition(effectState, {
      effect_reference: {
        effect_id: effect.effect_id,
        service_receipt_digest: effect.service_receipt.subject_digest,
      },
    });
  } else if (trace.at(-1)?.state !== "effect_unknown") {
    await transition("effect_unknown", { error: { code: "SERVICE_RECEIPT_INVALID" } });
  }

  if (!readback) {
    try {
      readback = await awaitBoundary(
        "readback_after_effect",
        ({ signal }) => deps.readbackInvoice(readbackRequest, { signal }),
        { recovery: true },
      );
    } catch (readbackError) {
      const incident = await awaitBoundary("open_readback_incident", ({ signal }) => deps.openIncident({
        run_id: runId,
        effect,
        severity: "SEV-1",
        reason: serviceReceiptVerified ? "readback_denied" : "service_receipt_invalid_and_readback_denied",
      }, { signal }), { recovery: true });
      return terminal("escalated", serviceReceiptVerified ? "readback_denied" : "service_receipt_invalid", {
        error_code: readbackError?.code ?? "READBACK_FAILED",
        incident_id: incident.incident_id,
      });
    }
  }
  const observedPostconditionDigest = digest({
    status: readback.status,
    resolution_count: readback.resolution_count,
  });
  const readbackSubject = {
    run_id: runId,
    readback_request_id: readbackRequestId,
    requested_at: readbackRequestedAt,
    effect_id: effect.effect_id,
    operation_id: operationId,
    resource_hash: resourceHash,
    source: "accounts-payable-ledger",
    source_revision: String(readback.revision),
    expected_postcondition_digest: expectedPostconditionDigest,
    observed_postcondition_digest: observedPostconditionDigest,
    verified_at: readback.readback_attestation?.subject?.verified_at,
  };
  const committedAtMs = Date.parse(signedSubject?.committed_at ?? "");
  const verifiedAtMs = Date.parse(readbackSubject.verified_at ?? "");
  const verificationNowMs = Date.parse(deps.now ? deps.now() : new Date().toISOString());
  const readbackChronologyValid = Number.isFinite(approvedAtMs)
    && Number.isFinite(committedAtMs)
    && Number.isFinite(verifiedAtMs)
    && Number.isFinite(verificationNowMs)
    && approvedAtMs <= committedAtMs
    && committedAtMs <= verifiedAtMs
    && authorizationTimeMs <= verifiedAtMs
    && Date.parse(readbackRequestedAt) <= verifiedAtMs
    && verifiedAtMs <= verificationNowMs;
  let readbackAttestationVerified = false;
  try {
    readbackAttestationVerified = await awaitBoundary(
      "verify_readback_attestation",
      ({ signal }) => deps.verifyReadbackAttestation({
        readback,
        expected_subject: readbackSubject,
      }, { signal }),
      { recovery: true },
    );
  } catch (error) {
    if (error?.code !== "RECOVERY_TIME_EXCEEDED") throw error;
  }
  let postconditionVerified = false;
  if (readbackAttestationVerified && readbackChronologyValid) {
    try {
      postconditionVerified = expectedPostconditionDigest === observedPostconditionDigest
        && await awaitBoundary(
          "verify_readback",
          ({ signal }) => deps.verifyReadback({ readback, proposal, effect, context }, { signal }),
          { recovery: true },
        );
    } catch (error) {
      if (error?.code !== "RECOVERY_TIME_EXCEEDED") throw error;
    }
  }
  const verified = postconditionVerified
    && expectedPostconditionDigest === observedPostconditionDigest
    && readbackChronologyValid;
  const { subject: _readbackSubject, ...readbackAttestation } = readback.readback_attestation ?? {};

  if (!serviceReceiptVerified) {
    if (!verified) {
      await awaitBoundary(
        "compensate_after_unverified_effect",
        ({ signal }) => deps.compensate({ effect, context, reason: "unverified_effect_and_postcondition" }, { signal }),
        { recovery: true },
      );
    }
    const incident = await awaitBoundary("open_receipt_incident", ({ signal }) => deps.openIncident({
      run_id: runId,
      effect,
      readback,
      severity: "SEV-1",
      reason: verified ? "service_receipt_invalid" : "service_receipt_and_readback_invalid",
    }, { signal }), { recovery: true });
    return terminal(verified ? "escalated" : "postcondition_failed", verified ? "service_receipt_invalid" : "readback_mismatch", {
      error_code: "SERVICE_RECEIPT_INVALID",
      effect,
      readback,
      incident_id: incident.incident_id,
    });
  }

  const effectReceipt = {
    schema_version: "1.2.0",
    effect_id: effect.effect_id,
    run_id: signedSubject.run_id,
    operation_id: operationId,
    release_digest: releaseDigest,
    tenant_hash: telemetryIdentity.tenant_hash,
    account_hash: accountHash,
    agent_principal_hash: telemetryIdentity.agent_principal_hash,
    caller_principal_hash: telemetryIdentity.caller_id_hash,
    action: "commit_resolution",
    effect_class: "reversible",
    resource_hash: resourceHash,
    source_revision: context.invoice.revision,
    proposal_digest: proposalDigest,
    idempotency_key_hash: digest(idempotencyKey),
    policy_decision_id: commitDecision.decision_id,
    policy_revision: context.policy.revision,
    approval_id: approval.approval_id,
    expected_postcondition_digest: expectedPostconditionDigest,
    service_receipt: effect.service_receipt,
    committed_at: effect.service_receipt.subject.committed_at,
    readback: {
      run_id: runId,
      readback_request_id: readbackRequestId,
      requested_at: readbackRequestedAt,
      status: verified ? "matched" : "mismatched",
      source: "accounts-payable-ledger",
      revision: String(readback.revision),
      verified_at: readbackSubject.verified_at,
      verifier: "invoice-postcondition-verifier",
      expected_postcondition_digest: expectedPostconditionDigest,
      observed_postcondition_digest: observedPostconditionDigest,
      attestation: readbackAttestation,
    },
    compensation: {
      status: verified ? "available" : "requested",
      reference: "compensate-invoice-resolution",
    },
  };
  if (!verified) {
    await awaitBoundary(
      "compensate_postcondition_mismatch",
      ({ signal }) => deps.compensate({ effect, context, reason: "postcondition_mismatch" }, { signal }),
      { recovery: true },
    );
    const incident = await awaitBoundary("open_postcondition_incident", ({ signal }) => deps.openIncident({
      run_id: runId,
      effect,
      readback,
      severity: "SEV-1",
    }, { signal }), { recovery: true });
    return terminal("postcondition_failed", "readback_mismatch", {
      effect,
      effect_receipt: effectReceipt,
      incident_id: incident.incident_id,
    });
  }

  await transition("readback_verified");
  const finalBudgetError = postEffectBudgetError ?? budgetViolation({ includeSteps: false });
  if (finalBudgetError) {
    return terminal("escalated", "budget_exhausted", {
      error_code: finalBudgetError,
      proposal_id: staged.proposal_id,
      effect,
      effect_receipt: effectReceipt,
      readback,
    });
  }
  return terminal("completed", completionReason, {
    proposal_id: staged.proposal_id,
    effect,
    effect_receipt: effectReceipt,
    readback,
    idempotency_key: idempotencyKey,
  });
  } catch (error) {
    if (error?.code === "BUDGET_TIME_EXCEEDED") {
      return terminal("escalated", "budget_exhausted", { error_code: error.code });
    }
    if (error?.code === "RECOVERY_TIME_EXCEEDED") {
      return terminal("escalated", "readback_denied", { error_code: error.code });
    }
    throw error;
  }
}

export const referenceInternals = {
  canonical,
  digest,
  referenceReleaseDigest,
  referenceReleasePayload,
};
