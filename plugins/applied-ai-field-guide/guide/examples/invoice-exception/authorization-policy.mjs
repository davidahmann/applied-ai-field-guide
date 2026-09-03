const requirements = Object.freeze({
  stage_resolution: Object.freeze(["invoice-resolution:stage"]),
  commit_resolution: Object.freeze(["invoice-resolution:commit", "invoice-resolution:readback"]),
});

export function decideInvoiceAction(request) {
  const deny = (reason_code) => ({ allow: false, reason_code });

  if (request.agent !== "invoice-exception-workload") return deny("AGENT_PRINCIPAL_DENIED");
  if (!requirements[request.action]) return deny("ACTION_NOT_ALLOWED");
  if (typeof request.caller?.id !== "string" || request.caller.id.length === 0) return deny("CALLER_ID_DENIED");
  if (!request.caller || request.caller.tenant_id !== request.tenant_id) return deny("CALLER_TENANT_DENIED");
  if (!request.resource || request.resource.tenant_id !== request.tenant_id) return deny("RESOURCE_TENANT_DENIED");
  if (!requirements[request.action].every((scope) => request.caller.scopes?.includes(scope))) {
    return deny("CALLER_SCOPE_DENIED");
  }
  if (!request.policy_revision) return deny("POLICY_REVISION_MISSING");
  if (!request.current_policy_revision) return deny("CURRENT_POLICY_REVISION_MISSING");
  if (request.policy_revision !== request.current_policy_revision) return deny("POLICY_REVISION_STALE");

  if (request.action === "commit_resolution") {
    if (!request.approval?.approved) return deny("APPROVAL_REQUIRED");
    if (!request.approval.approval_id) return deny("APPROVAL_ID_MISSING");
    if (request.approval.approver_role !== "accounts-payable-approver") return deny("APPROVER_ROLE_DENIED");
    if (typeof request.approval.approver_principal !== "string" || request.approval.approver_principal.length === 0) {
      return deny("APPROVER_ID_MISSING");
    }
    if (request.approval.approver_principal === request.caller.id) return deny("APPROVAL_SEPARATION_REQUIRED");
    if (!request.approval.proposal_digest) return deny("APPROVAL_DIGEST_MISSING");
    if (!request.proposal_digest) return deny("PROPOSAL_DIGEST_MISSING");
    if (request.approval.proposal_digest !== request.proposal_digest) return deny("APPROVAL_DIGEST_MISMATCH");
    if (request.approval.expired === true) return deny("APPROVAL_EXPIRED");
    if (!request.approval.approved_at) return deny("APPROVAL_TIME_INVALID");
    if (!request.approval.expires_at) return deny("APPROVAL_EXPIRY_MISSING");

    const approvedAt = Date.parse(request.approval.approved_at);
    const expiresAt = Date.parse(request.approval.expires_at);
    const now = Date.parse(request.now ?? "");
    if (!Number.isFinite(approvedAt) || !Number.isFinite(expiresAt) || !Number.isFinite(now)) {
      return deny("APPROVAL_TIME_INVALID");
    }
    if (approvedAt > now || approvedAt >= expiresAt) return deny("APPROVAL_TIME_INVALID");
    if (expiresAt <= now) return deny("APPROVAL_EXPIRED");
  }

  return {
    allow: true,
    reason_code: "POLICY_ALLOWED",
    obligations: request.action === "commit_resolution"
      ? ["approval_digest_match", "idempotency", "postcondition_readback"]
      : ["idempotency", "staged_effect_only"],
  };
}
