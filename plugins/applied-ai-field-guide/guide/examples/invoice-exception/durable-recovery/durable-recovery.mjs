import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const stateFile = "durable-recovery-state.json";
const requiredScope = "invoice-resolution:commit";

function clone(value) {
  return structuredClone(value);
}

function operationId(request) {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify({
      tenant_id: request.tenant_id,
      business_operation_id: request.business_operation_id,
      invoice_id: request.invoice_id,
      action: "commit_invoice_resolution",
    }))
    .digest("hex")}`;
}

function recoveryError(code, message) {
  return Object.assign(new Error(message), { code });
}

function initialState() {
  return { schema_version: "1.0.0", operations: {}, effects: {}, audit: [] };
}

function validRequest(request) {
  return request
    && typeof request === "object"
    && typeof request.tenant_id === "string"
    && typeof request.business_operation_id === "string"
    && typeof request.invoice_id === "string"
    && typeof request.approval_revision === "string"
    && typeof request.policy_revision === "string"
    && request.caller
    && typeof request.caller.id === "string"
    && request.caller.tenant_id === request.tenant_id
    && Array.isArray(request.caller.scopes)
    && request.caller.scopes.includes(requiredScope);
}

/**
 * A deliberately small, fictional recovery world. It persists operation intent
 * before a simulated external effect, then treats readback—not an interrupted
 * process's memory—as the only completion proof. It is not a concurrency-safe
 * workflow engine or a production storage design.
 */
export async function createDurableRecoveryLab(root, {
  currentPolicyRevision = "policy-18",
  currentApprovalRevision = "approval-42",
  readbackAvailable = true,
} = {}) {
  if (typeof root !== "string" || !path.isAbsolute(root)) throw new Error("root must be an absolute path");
  await mkdir(root, { recursive: true, mode: 0o700 });
  const file = path.join(root, stateFile);
  let state;
  try {
    state = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    state = initialState();
    await persist();
  }
  if (!state || state.schema_version !== "1.0.0" || typeof state.operations !== "object" || typeof state.effects !== "object" || !Array.isArray(state.audit)) {
    throw new Error("durable-recovery state is malformed");
  }

  async function persist() {
    const temporary = path.join(root, `.${stateFile}.${process.pid}.${Date.now()}.tmp`);
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    await rename(temporary, file);
  }

  function record(action, details = {}) {
    state.audit.push({ sequence: state.audit.length + 1, action, ...clone(details) });
  }

  async function deny(request, reason) {
    record("request_denied", { tenant_id: request?.tenant_id ?? null, reason });
    await persist();
    return { status: "denied", reason, effect: null };
  }

  function requestIsCurrent(request) {
    return request.policy_revision === currentPolicyRevision && request.approval_revision === currentApprovalRevision;
  }

  function receiptFor(id) {
    const effect = state.effects[id];
    return effect ? { operation_id: id, effect_id: effect.effect_id, invoice_id: effect.invoice_id, tenant_id: effect.tenant_id, verified_by: "simulated_source_of_truth_readback" } : null;
  }

  async function submit(request, { fault = null } = {}) {
    if (!validRequest(request)) return deny(request, "caller_or_request_is_not_authorized");
    if (!requestIsCurrent(request)) return deny(request, "approval_or_policy_is_not_current");
    if (!new Set([null, "before_effect", "after_effect_before_receipt"]).has(fault)) throw new Error("fault must be before_effect, after_effect_before_receipt, or null");
    const id = operationId(request);
    const existing = state.operations[id];
    if (existing?.status === "completed") {
      record("duplicate_delivery_replayed", { operation_id: id });
      await persist();
      return { status: "completed", disposition: "existing_verified_effect", receipt: receiptFor(id), effect_created: false };
    }
    if (existing?.status === "pending_effect") {
      record("duplicate_delivery_requires_reconciliation", { operation_id: id });
      await persist();
      return { status: "reconciliation_pending", disposition: "do_not_blindly_retry", receipt: null, effect_created: false };
    }

    state.operations[id] = {
      operation_id: id,
      status: "pending_effect",
      tenant_id: request.tenant_id,
      invoice_id: request.invoice_id,
      policy_revision: request.policy_revision,
      approval_revision: request.approval_revision,
    };
    record("effect_intent_persisted", { operation_id: id });
    await persist();
    if (fault === "before_effect") throw recoveryError("SIMULATED_INTERRUPTION_BEFORE_EFFECT", "interrupted after intent persisted and before external effect");

    state.effects[id] = {
      effect_id: `effect-${id.slice(-12)}`,
      tenant_id: request.tenant_id,
      invoice_id: request.invoice_id,
      idempotency_key: id,
      status: "committed",
    };
    record("external_effect_created", { operation_id: id, effect_id: state.effects[id].effect_id });
    await persist();
    if (fault === "after_effect_before_receipt") throw recoveryError("SIMULATED_AMBIGUOUS_EFFECT", "external effect may have completed; do not retry before readback");

    state.operations[id].status = "completed";
    state.operations[id].completion_reason = "same_process_readback";
    record("effect_read_back", { operation_id: id });
    await persist();
    return { status: "completed", disposition: "verified_effect", receipt: receiptFor(id), effect_created: true };
  }

  async function recover(request) {
    if (!validRequest(request)) return deny(request, "caller_or_request_is_not_authorized");
    const id = operationId(request);
    const operation = state.operations[id];
    if (!operation) return { status: "not_found", disposition: "no_recorded_operation", receipt: null, effect_created: false };
    if (operation.status === "completed") return { status: "completed", disposition: "existing_verified_effect", receipt: receiptFor(id), effect_created: false };
    const effect = state.effects[id];
    if (effect) {
      if (!readbackAvailable) {
        record("readback_unavailable", { operation_id: id });
        await persist();
        return { status: "reconciliation_pending", disposition: "readback_unavailable_escalate", receipt: null, effect_created: false };
      }
      if (effect.tenant_id !== request.tenant_id || effect.invoice_id !== request.invoice_id) throw new Error("simulated readback did not match the persisted operation");
      operation.status = "completed";
      operation.completion_reason = "recovered_source_of_truth_readback";
      record("effect_reconciled_after_restart", { operation_id: id, effect_id: effect.effect_id });
      await persist();
      return { status: "completed", disposition: "reconciled_existing_effect", receipt: receiptFor(id), effect_created: false };
    }
    if (!requestIsCurrent(request)) {
      operation.status = "escalated";
      operation.escalation_reason = "approval_or_policy_changed_before_effect";
      record("pending_operation_escalated", { operation_id: id, reason: operation.escalation_reason });
      await persist();
      return { status: "escalated", disposition: operation.escalation_reason, receipt: null, effect_created: false };
    }
    operation.status = "escalated";
    operation.escalation_reason = "no_effect_readback_requires_operator_decision";
    record("pending_operation_escalated", { operation_id: id, reason: operation.escalation_reason });
    await persist();
    return { status: "escalated", disposition: operation.escalation_reason, receipt: null, effect_created: false };
  }

  return Object.freeze({
    submit,
    recover,
    inspect: () => clone(state),
    statePath: file,
    operationId,
  });
}
