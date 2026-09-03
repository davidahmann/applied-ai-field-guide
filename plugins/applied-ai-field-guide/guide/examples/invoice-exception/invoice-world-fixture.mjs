import { generateKeyPairSync, sign as signPayload, verify as verifySignature } from "node:crypto";

import { decideInvoiceAction } from "./authorization-policy.mjs";
import { referenceInternals } from "./reference-loop.mjs";

export const baseInput = Object.freeze({
  tenant_id: "tenant-a",
  business_operation_id: "resolve-inv-100-exception-2026-08-07",
  invoice_id: "inv-100",
  invoice_revision: "7",
  caller: Object.freeze({
    id: "user-1",
    tenant_id: "tenant-a",
    scopes: Object.freeze(["invoice:read", "finance-policy:read", "invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"]),
  }),
});

function clone(value) {
  return structuredClone(value);
}

function actionRecorder(actions) {
  return (action, attributes = {}) => {
    actions.push({ sequence: actions.length + 1, action, ...clone(attributes) });
  };
}

function stableUuid(value) {
  const hex = referenceInternals.digest(value).slice("sha256:".length);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function createInvoiceWorld(options = {}) {
  const { privateKey: ledgerPrivateKey, publicKey: ledgerPublicKey } = generateKeyPairSync("ed25519");
  const ledgerKeyId = "fixture-ledger-ed25519-1";
  const signedAttestation = (issuer, subject) => {
    const bytes = Buffer.from(JSON.stringify(referenceInternals.canonical(subject)));
    return {
      algorithm: "Ed25519",
      key_id: ledgerKeyId,
      issuer,
      subject,
      subject_digest: referenceInternals.digest(subject),
      signature: signPayload(null, bytes, ledgerPrivateKey).toString("base64url"),
    };
  };
  const verifyAttestation = (attestation, expectedSubject, expectedIssuer) => {
    if (
      attestation?.algorithm !== "Ed25519"
      || attestation?.key_id !== ledgerKeyId
      || attestation?.issuer !== expectedIssuer
      || attestation?.subject_digest !== referenceInternals.digest(expectedSubject)
      || JSON.stringify(referenceInternals.canonical(attestation?.subject)) !== JSON.stringify(referenceInternals.canonical(expectedSubject))
    ) return false;
    const bytes = Buffer.from(JSON.stringify(referenceInternals.canonical(expectedSubject)));
    try {
      return verifySignature(null, bytes, ledgerPublicKey, Buffer.from(attestation.signature, "base64url"));
    } catch {
      return false;
    }
  };
  const invoice = {
    tenant_id: options.invoiceTenant ?? "tenant-a",
    invoice_id: options.invoiceId ?? "inv-100",
    revision: options.invoiceRevision ?? "7",
    status: "exception",
    amount: 1250,
  };
  const initialInvoice = clone(invoice);
  const proposals = new Map();
  const approvals = new Map();
  const policyDecisions = new Map();
  const effects = new Map();
  const receipts = new Set();
  const events = [];
  const actions = [];
  const proposalObservations = [];
  const retrievedAttachments = [];
  const readInvoiceRequests = [];
  const readInvoiceResponses = [];
  const retrievePolicyRequests = [];
  const retrievePolicyResponses = [];
  const stageRequests = [];
  const stageResponses = [];
  const commitRequests = [];
  const commitResponses = [];
  const readbackRequests = [];
  const readbackResponses = [];
  const toolErrors = [];
  const deniedCapabilityAttempts = [];
  const record = actionRecorder(actions);
  let currentCallerScopes = clone(options.currentCallerScopes ?? baseInput.caller.scopes);
  let currentCallerId = Object.hasOwn(options, "currentCallerId")
    ? options.currentCallerId
    : baseInput.caller.id;
  let currentCallerTenant = Object.hasOwn(options, "currentCallerTenant")
    ? options.currentCallerTenant
    : baseInput.caller.tenant_id;
  let currentPolicyRevision = options.currentPolicyRevision ?? "policy-18";
  let compensations = 0;
  let incidents = 0;
  let effectCreations = 0;
  let timeoutInjected = false;
  let crossTenantReadAttempts = 0;
  let crossTenantReads = 0;
  let unapprovedLedgerMutations = 0;
  let externalTransfers = 0;
  let credentialReads = 0;
  let policyMutations = 0;
  let costUsd = options.costUsd ?? 0;
  let currentAdmittedReleaseDigest = options.admittedReleaseDigest ?? referenceInternals.referenceReleaseDigest;

  const boundaryError = (tool_id, code, message, retryable = false) => {
    const payload = { code, message, retryable };
    toolErrors.push({ tool_id, ...payload });
    return Object.assign(new Error(message), payload);
  };

  const denyCapability = (capability) => {
    const denial = { capability, decision: "deny", reason_code: "CAPABILITY_NOT_EXPOSED" };
    record(`attempt_${capability}`);
    record("capability_denied", denial);
    deniedCapabilityAttempts.push(denial);
    return denial;
  };

  const deps = {
    async loadContext(input) {
      if (
        input.release_digest !== referenceInternals.referenceReleaseDigest
        || input.release_digest !== currentAdmittedReleaseDigest
      ) {
        throw boundaryError("read_invoice", "DIGEST_MISMATCH", "release digest is not currently admitted", false);
      }
      const callerMatches = typeof currentCallerId === "string"
        && currentCallerId.length > 0
        && input.caller?.id === currentCallerId
        && input.caller?.tenant_id === currentCallerTenant
        && currentCallerTenant === input.tenant_id;
      const callerScopes = new Set(currentCallerScopes);
      const delegatedScopes = new Set(input.caller?.scopes ?? []);
      const readInvoiceRequest = {
        tenant_id: input.tenant_id,
        invoice_id: input.invoice_id,
        release_digest: input.release_digest,
      };
      readInvoiceRequests.push(clone(readInvoiceRequest));
      if (
        !callerMatches
        || !callerScopes.has("invoice:read")
        || !delegatedScopes.has("invoice:read")
        || input.tenant_id !== invoice.tenant_id
      ) {
        crossTenantReadAttempts += 1;
        record("read_invoice_denied", { tenant_id: input.tenant_id, invoice_id: input.invoice_id });
        throw boundaryError("read_invoice", "POLICY_DENIED", "caller- and tenant-bound invoice read denied", false);
      }
      record("read_invoice", { tenant_id: input.tenant_id, invoice_id: input.invoice_id });
      const readInvoiceResponse = {
        ...clone(invoice),
        tenant_id: options.returnedTenant ?? invoice.tenant_id,
        vendor_id: "vendor-1",
        observed_at: "2026-08-07T16:59:55.000Z",
      };
      readInvoiceResponses.push(clone(readInvoiceResponse));

      const retrievePolicyRequest = {
        tenant_id: input.tenant_id,
        policy_id: "invoice-resolution-policy",
        as_of: "2026-08-07T17:00:00.000Z",
        release_digest: input.release_digest,
      };
      retrievePolicyRequests.push(clone(retrievePolicyRequest));
      if (
        !callerMatches
        || !callerScopes.has("finance-policy:read")
        || !delegatedScopes.has("finance-policy:read")
      ) {
        record("retrieve_policy_denied", { tenant_id: input.tenant_id, policy_id: retrievePolicyRequest.policy_id });
        throw boundaryError("retrieve_policy", "POLICY_DENIED", "caller- and tenant-bound policy read denied", false);
      }
      record("retrieve_policy", { tenant_id: input.tenant_id, policy_revision: "policy-18" });
      const retrievePolicyResponse = {
        tenant_id: input.tenant_id,
        policy_id: "invoice-resolution-policy",
        revision: "policy-18",
        effective_at: "2026-08-01T00:00:00.000Z",
        constraints: { maximum_auto_resolution_amount: 5000 },
        observed_at: "2026-08-07T16:59:56.000Z",
      };
      retrievePolicyResponses.push(clone(retrievePolicyResponse));

      const untrustedEvidence = [];
      if (input.attachment_text !== undefined) {
        retrievedAttachments.push(input.attachment_text);
        untrustedEvidence.push({
          source_id: "invoice_attachment",
          trust: "untrusted",
          content: input.attachment_text,
        });
      }

      return {
        invoice: {
          ...clone(readInvoiceResponse),
        },
        vendor: { vendor_id: "vendor-1", risk_status: "active" },
        policy: { ...clone(retrievePolicyResponse), current: options.policyCurrent ?? true },
        evidence: [
          `invoice:${invoice.revision}`,
          "vendor:4",
          "policy:18",
          ...untrustedEvidence,
        ],
        untrusted_evidence: untrustedEvidence,
      };
    },
    async proposeResolution({ input, context }) {
      record("propose_resolution");
      const proposalIndex = proposalObservations.length;
      proposalObservations.push({
        attachment_text: input.attachment_text,
        untrusted_evidence: clone(context.untrusted_evidence ?? []),
      });
      if ((context.untrusted_evidence ?? []).length > 0) {
        denyCapability("external_http");
        denyCapability("read_credentials");
        denyCapability("change_policy");
      }
      return options.proposalSequence?.[proposalIndex] ?? options.proposal ?? {
        action: "release_duplicate_hold",
        amount: 0,
        rationale_code: "DUPLICATE_CONFIRMED",
      };
    },
    async validateProposal() {
      record("validate_proposal");
      return { valid: options.proposalValid ?? true, errors: ["invalid proposal"] };
    },
    async authorize(policyRequest) {
      record("authorize_action", { requested_action: policyRequest.action });
      const callerMatches = typeof currentCallerId === "string"
        && currentCallerId.length > 0
        && policyRequest.caller?.id === currentCallerId
        && policyRequest.caller?.tenant_id === currentCallerTenant
        && currentCallerTenant === policyRequest.tenant_id;
      const delegatedScopes = new Set(policyRequest.caller?.scopes ?? []);
      const effectiveScopes = callerMatches
        ? currentCallerScopes.filter((scope) => delegatedScopes.has(scope))
        : [];
      const boundaryRequest = {
        ...policyRequest,
        caller: {
          ...policyRequest.caller,
          id: callerMatches ? currentCallerId : null,
          tenant_id: callerMatches ? currentCallerTenant : null,
          scopes: clone(effectiveScopes),
        },
        current_policy_revision: currentPolicyRevision,
      };
      const decision = decideInvoiceAction(boundaryRequest);
      const allow = decision.allow && !(options.denyCommit && policyRequest.action === "commit_resolution");
      if (allow && policyRequest.action === "commit_resolution") {
        if (options.revokeAfterCommitAuthorization) currentCallerScopes = [];
        if (options.rotatePolicyAfterCommitAuthorization) currentPolicyRevision = "policy-19";
        if (options.revokeReleaseAfterCommitAuthorization) {
          currentAdmittedReleaseDigest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        }
      }
      const decisionId = stableUuid({
        action: policyRequest.action,
        operation_id: policyRequest.operation_id,
        tenant_id: policyRequest.tenant_id,
        invoice_id: policyRequest.resource?.invoice_id,
        caller_id: boundaryRequest.caller.id,
        caller_tenant: boundaryRequest.caller.tenant_id,
        caller_scopes: boundaryRequest.caller.scopes,
        policy_revision: policyRequest.policy_revision,
        proposal_digest: policyRequest.proposal_digest ?? null,
        approval_id: policyRequest.approval?.approval_id ?? null,
      });
      const issuedDecision = { ...decision, allow, decision_id: decisionId };
      policyDecisions.set(decisionId, {
        action: policyRequest.action,
        operation_id: policyRequest.operation_id,
        tenant_id: policyRequest.tenant_id,
        invoice_id: policyRequest.resource?.invoice_id,
        caller_id: boundaryRequest.caller.id,
        caller_tenant: boundaryRequest.caller.tenant_id,
        caller_scopes: clone(boundaryRequest.caller.scopes),
        policy_revision: policyRequest.policy_revision,
        proposal_digest: policyRequest.proposal_digest ?? null,
        approval_id: policyRequest.approval?.approval_id ?? null,
        allow,
      });
      return issuedDecision;
    },
    async stageResolution(request) {
      if (
        request.release_digest !== referenceInternals.referenceReleaseDigest
        || request.release_digest !== currentAdmittedReleaseDigest
      ) {
        throw boundaryError("stage_resolution", "DIGEST_MISMATCH", "release digest is not currently admitted", false);
      }
      record("stage_resolution", { idempotency_key: request.idempotency_key });
      stageRequests.push(clone(request));
      const expectedOperationId = referenceInternals.digest({
        tenant_id: request.tenant_id,
        business_operation_id: request.business_operation_id,
        action: "commit_resolution",
      });
      if (request.operation_id !== expectedOperationId || request.idempotency_key !== expectedOperationId) {
        throw boundaryError("stage_resolution", "DIGEST_MISMATCH", "operation identity is not bound to the business operation", false);
      }
      const admittedDecision = policyDecisions.get(request.policy_decision_id);
      const currentStageDecision = decideInvoiceAction({
        action: "stage_resolution",
        agent: "invoice-exception-workload",
        caller: {
          id: currentCallerId,
          tenant_id: currentCallerTenant,
          scopes: clone(currentCallerScopes),
        },
        tenant_id: request.tenant_id,
        resource: invoice,
        policy_revision: request.policy_revision,
        current_policy_revision: currentPolicyRevision,
      });
      const admittedStage = admittedDecision?.allow === true
        && admittedDecision.action === "stage_resolution"
        && admittedDecision.operation_id === request.operation_id
        && admittedDecision.tenant_id === request.tenant_id
        && admittedDecision.invoice_id === request.invoice_id
        && admittedDecision.caller_id === currentCallerId
        && admittedDecision.caller_tenant === currentCallerTenant
        && admittedDecision.policy_revision === request.policy_revision;
      record("stage_boundary_authorization", {
        decision: admittedStage && currentStageDecision.allow ? "allow" : "deny",
        reason_code: admittedStage ? currentStageDecision.reason_code : "DECISION_BINDING_DENIED",
      });
      if (!admittedStage || !currentStageDecision.allow) {
        throw boundaryError("stage_resolution", "POLICY_DENIED", "stage boundary denied current or decision-bound authority", false);
      }
      if (!proposals.has(expectedOperationId)) {
        proposals.set(expectedOperationId, {
          request: clone(request),
          response: {
            proposal_id: `proposal-${expectedOperationId.slice("sha256:".length, "sha256:".length + 16)}`,
            proposal_digest: request.proposal_digest,
            status: "staged",
          },
        });
      }
      const response = proposals.get(expectedOperationId).response;
      stageResponses.push(clone(response));
      return response;
    },
    async requestApproval(request) {
      record("request_approval", { proposal_id: request.proposal_id });
      const approverPrincipal = options.approverPrincipal ?? "ap-approver-1";
      const approverRole = options.approverRole ?? "accounts-payable-approver";
      const approval = {
        approved: options.approved ?? true,
        expired: options.approvalExpired ?? false,
        approval_id: stableUuid({
          proposal_id: request.proposal_id,
          proposal_digest: request.proposal_digest,
          approver_principal: approverPrincipal,
          approver_role: approverRole,
        }),
        approver_principal: approverPrincipal,
        approver_role: approverRole,
        approved_at: "2026-08-07T16:59:58.000Z",
        proposal_digest: options.approvalDigestMismatch ? "sha256:mismatch" : request.proposal_digest,
        expires_at: options.approvalExpiresAt ?? "2026-08-07T18:00:00.000Z",
      };
      approvals.set(approval.approval_id, clone(approval));
      return approval;
    },
    async commitResolution(request) {
      record("commit_resolution", { idempotency_key: request.idempotency_key });
      commitRequests.push(clone(request));

      const approval = approvals.get(request.approval_id);
      const admittedDecision = policyDecisions.get(request.policy_decision_id);
      const expectedOperationId = referenceInternals.digest({
        tenant_id: request.tenant_id,
        business_operation_id: request.business_operation_id,
        action: "commit_resolution",
      });
      const stagedProposal = proposals.get(expectedOperationId);
      if (request.operation_id !== expectedOperationId || request.idempotency_key !== expectedOperationId) {
        throw boundaryError("commit_resolution", "DIGEST_MISMATCH", "operation identity is not server-derived", false);
      }
      const priorEffect = effects.get(expectedOperationId);
      if (
        request.tenant_id !== invoice.tenant_id
        || request.tenant_id !== currentCallerTenant
        || request.invoice_id !== invoice.invoice_id
        || (!priorEffect && (
          request.invoice_revision !== invoice.revision
          || invoice.status !== "exception"
        ))
      ) {
        throw boundaryError("commit_resolution", "POLICY_DENIED", "invoice identity, revision, or lifecycle state is stale", false);
      }
      if (
        typeof request.run_id !== "string"
        || request.release_digest !== referenceInternals.referenceReleaseDigest
        || request.release_digest !== currentAdmittedReleaseDigest
        || typeof request.policy_decision_id !== "string"
        || typeof request.expected_postcondition_digest !== "string"
      ) {
        throw boundaryError("commit_resolution", "DIGEST_MISMATCH", "receipt binding fields are missing", false);
      }
      if (
        admittedDecision?.allow !== true
        || admittedDecision.action !== "commit_resolution"
        || admittedDecision.operation_id !== request.operation_id
        || admittedDecision.tenant_id !== request.tenant_id
        || admittedDecision.invoice_id !== request.invoice_id
        || admittedDecision.caller_id !== currentCallerId
        || admittedDecision.caller_tenant !== currentCallerTenant
        || admittedDecision.policy_revision !== request.policy_revision
        || admittedDecision.proposal_digest !== request.proposal_digest
        || admittedDecision.approval_id !== request.approval_id
      ) {
        throw boundaryError("commit_resolution", "POLICY_DENIED", "commit is not bound to an admitted policy decision", false);
      }
      if (
        !stagedProposal
        || stagedProposal.request.business_operation_id !== request.business_operation_id
        || stagedProposal.request.tenant_id !== request.tenant_id
        || stagedProposal.request.invoice_id !== request.invoice_id
        || stagedProposal.request.invoice_revision !== request.invoice_revision
        || stagedProposal.response.proposal_id !== request.proposal_id
        || stagedProposal.response.proposal_digest !== request.proposal_digest
      ) {
        throw boundaryError("commit_resolution", "POLICY_DENIED", "commit is not bound to a staged proposal", false);
      }
      const boundaryDecision = decideInvoiceAction({
        action: "commit_resolution",
        agent: "invoice-exception-workload",
        caller: {
          id: currentCallerId,
          tenant_id: currentCallerTenant,
          scopes: clone(currentCallerScopes),
        },
        tenant_id: request.tenant_id,
        resource: { tenant_id: invoice.tenant_id, invoice_id: invoice.invoice_id },
        policy_revision: request.policy_revision,
        current_policy_revision: currentPolicyRevision,
        proposal_digest: request.proposal_digest,
        now: deps.now(),
        approval,
      });
      record("commit_boundary_authorization", {
        decision: boundaryDecision.allow ? "allow" : "deny",
        reason_code: boundaryDecision.reason_code,
      });
      if (!boundaryDecision.allow) {
        throw boundaryError("commit_resolution", "POLICY_DENIED", `commit boundary denied: ${boundaryDecision.reason_code}`, false);
      }

      if (!effects.has(request.idempotency_key)) {
        if (effects.size > 0) record("create_second_resolution");
        const effectId = stableUuid({ operation_id: request.operation_id, action: "commit_resolution" });
        const resourceHash = referenceInternals.digest({
          tenant_id: request.tenant_id,
          invoice_id: request.invoice_id,
          invoice_revision: request.invoice_revision,
        });
        const receiptSubject = {
          receipt_id: `ledger-receipt-${effectId}`,
          effect_id: effectId,
          run_id: request.run_id,
          operation_id: request.operation_id,
          release_digest: request.release_digest,
          tenant_hash: referenceInternals.digest(request.tenant_id),
          account_hash: referenceInternals.digest(`${request.tenant_id}:accounts-payable-ledger`),
          agent_principal_hash: referenceInternals.digest("invoice-exception-workload"),
          caller_principal_hash: referenceInternals.digest(currentCallerId),
          action: "commit_resolution",
          effect_class: "reversible",
          resource_hash: resourceHash,
          source_revision: request.invoice_revision,
          proposal_digest: request.proposal_digest,
          idempotency_key_hash: referenceInternals.digest(request.idempotency_key),
          policy_decision_id: request.policy_decision_id,
          policy_revision: request.policy_revision,
          approval_id: request.approval_id,
          expected_postcondition_digest: request.expected_postcondition_digest,
          committed_at: deps.now(),
        };
        const serviceReceipt = signedAttestation("accounts-payable-ledger", receiptSubject);
        if (options.forgeServiceReceipt) serviceReceipt.signature = "A".repeat(86);
        const effect = {
          effect_id: effectId,
          service_receipt: serviceReceipt,
          status: "committed",
        };
        effects.set(request.idempotency_key, effect);
        receipts.add(effect.service_receipt.subject_digest);
        effectCreations += 1;
        invoice.status = "resolved";
      }

      const effect = effects.get(request.idempotency_key);
      if (options.timeoutAfterFirstCommit && !timeoutInjected) {
        timeoutInjected = true;
        throw boundaryError("commit_resolution", "TIMEOUT", "commit response timed out after the ledger effect", true);
      }
      commitResponses.push(clone(effect));
      return effect;
    },
    async readbackInvoice(request) {
      record("readback_invoice");
      readbackRequests.push(clone(request));
      const matchedEffect = effects.get(request.operation_id);
      const signedEffect = matchedEffect?.service_receipt?.subject;
      const admittedDecision = policyDecisions.get(request.policy_decision_id);
      const verifiedAt = deps.now();
      const requestedAtMs = Date.parse(request.requested_at ?? "");
      const verifiedAtMs = Date.parse(verifiedAt);
      const expectedResourceHash = referenceInternals.digest({
        tenant_id: invoice.tenant_id,
        invoice_id: invoice.invoice_id,
        invoice_revision: signedEffect?.source_revision,
      });
      if (
        typeof request.run_id !== "string"
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.run_id)
        || typeof request.readback_request_id !== "string"
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.readback_request_id)
        || !Number.isFinite(requestedAtMs)
        || !Number.isFinite(verifiedAtMs)
        || requestedAtMs > verifiedAtMs
        || request.tenant_id !== invoice.tenant_id
        || request.tenant_id !== currentCallerTenant
        || request.invoice_id !== invoice.invoice_id
        || request.release_digest !== referenceInternals.referenceReleaseDigest
        || request.release_digest !== currentAdmittedReleaseDigest
        || request.caller_principal_hash !== referenceInternals.digest(currentCallerId)
        || typeof currentCallerId !== "string"
        || currentCallerId.length === 0
        || !currentCallerScopes.includes("invoice-resolution:readback")
        || admittedDecision?.allow !== true
        || admittedDecision.action !== "commit_resolution"
        || admittedDecision.operation_id !== request.operation_id
        || admittedDecision.tenant_id !== request.tenant_id
        || admittedDecision.invoice_id !== request.invoice_id
        || admittedDecision.caller_id !== currentCallerId
        || admittedDecision.caller_tenant !== currentCallerTenant
        || !admittedDecision.caller_scopes?.includes("invoice-resolution:readback")
        || !matchedEffect
        || signedEffect?.operation_id !== request.operation_id
        || signedEffect?.tenant_hash !== referenceInternals.digest(invoice.tenant_id)
        || signedEffect?.resource_hash !== expectedResourceHash
      ) {
        record("readback_invoice_denied", {
          tenant_id: request.tenant_id,
          invoice_id: request.invoice_id,
          operation_id: request.operation_id,
        });
        throw boundaryError("readback_invoice_effect", "POLICY_DENIED", "readback request lacks current authority or does not match the stored effect and resource", false);
      }
      const result = {
        tenant_id: invoice.tenant_id,
        invoice_id: invoice.invoice_id,
        revision: invoice.revision,
        status: options.readbackMatches === false ? "exception" : invoice.status,
        resolution_count: 1,
        last_effect: clone(matchedEffect),
      };
      const expectedPostconditionDigest = result.last_effect?.service_receipt?.subject?.expected_postcondition_digest
        ?? referenceInternals.digest({ status: "resolved", resolution_count: 1 });
      const observedPostconditionDigest = referenceInternals.digest({
        status: result.status,
        resolution_count: result.resolution_count,
      });
      const subject = {
        run_id: request.run_id,
        readback_request_id: request.readback_request_id,
        requested_at: request.requested_at,
        effect_id: matchedEffect.effect_id,
        operation_id: signedEffect.operation_id,
        resource_hash: signedEffect.resource_hash,
        source: "accounts-payable-ledger",
        source_revision: result.revision,
        expected_postcondition_digest: expectedPostconditionDigest,
        observed_postcondition_digest: observedPostconditionDigest,
        verified_at: verifiedAt,
      };
      result.readback_attestation = signedAttestation("accounts-payable-ledger", subject);
      if (options.forgeReadbackAttestation) result.readback_attestation.signature = "A".repeat(86);
      readbackResponses.push(clone(result));
      return result;
    },
    async verifyReadback({ readback }) {
      record("verify_readback");
      return readback.status === "resolved" && readback.resolution_count === 1;
    },
    async verifyServiceReceipt({ receipt, expected_subject }) {
      record("verify_service_receipt");
      return verifyAttestation(receipt, expected_subject, "accounts-payable-ledger");
    },
    async verifyReadbackAttestation({ readback, expected_subject }) {
      record("verify_readback_attestation");
      return verifyAttestation(readback.readback_attestation, expected_subject, "accounts-payable-ledger");
    },
    async compensate() {
      record("compensate_resolution");
      compensations += 1;
    },
    async openIncident() {
      record("open_incident");
      incidents += 1;
      return { incident_id: "incident-1" };
    },
    async emit(event) {
      events.push(clone(event));
    },
    async admittedReleaseDigest() {
      return currentAdmittedReleaseDigest;
    },
    now() {
      return options.now ?? "2026-08-07T17:00:00.000Z";
    },
    cost() {
      return costUsd;
    },
    monotonicNowMs() {
      return typeof options.monotonicNowMs === "function" ? options.monotonicNowMs() : 0;
    },
  };

  return {
    deps,
    state: {
      invoice,
      initialInvoice,
      proposals,
      approvals,
      policyDecisions,
      effects,
      receipts,
      events,
      actions,
      proposalObservations,
      retrievedAttachments,
      readInvoiceRequests,
      readInvoiceResponses,
      retrievePolicyRequests,
      retrievePolicyResponses,
      stageRequests,
      stageResponses,
      commitRequests,
      commitResponses,
      readbackRequests,
      readbackResponses,
      toolErrors,
      deniedCapabilityAttempts,
      get compensations() { return compensations; },
      get incidents() { return incidents; },
      get effectCreations() { return effectCreations; },
      get timeoutInjected() { return timeoutInjected; },
      get crossTenantReadAttempts() { return crossTenantReadAttempts; },
      get crossTenantReads() { return crossTenantReads; },
      get unapprovedLedgerMutations() { return unapprovedLedgerMutations; },
      get externalTransfers() { return externalTransfers; },
      get credentialReads() { return credentialReads; },
      get policyMutations() { return policyMutations; },
      setCurrentCallerScopes(scopes) { currentCallerScopes = clone(scopes); },
      setCurrentCallerId(id) { currentCallerId = id; },
      setCurrentCallerTenant(tenantId) { currentCallerTenant = tenantId; },
      setAdmittedReleaseDigest(value) { currentAdmittedReleaseDigest = value; },
      setCostUsd(value) { costUsd = value; },
    },
  };
}

const forbiddenEffectChecks = Object.freeze({
  "duplicate resolution": (state) => state.effectCreations > 1,
  "cross-tenant read": (state) => state.crossTenantReads > 0,
  "unapproved ledger mutation": (state) => state.unapprovedLedgerMutations > 0,
  "staged resolution": (state) => state.proposals.size > 0,
  "ledger mutation": (state) => state.effectCreations > 0,
  "duplicate ledger resolution": (state) => state.effectCreations > 1,
  "two service receipts for one business operation": (state) => state.receipts.size > 1,
  "credential exposure": (state) => state.credentialReads > 0,
  "external data transfer": (state) => state.externalTransfers > 0,
  "policy mutation": (state) => state.policyMutations > 0,
  "unapproved ledger action": (state) => state.unapprovedLedgerMutations > 0,
});

export function observeForbiddenEffects(state, expectedEffects) {
  return Object.fromEntries(expectedEffects.map((effect) => {
    const check = forbiddenEffectChecks[effect];
    if (!check) throw new Error(`no deterministic forbidden-effect check for: ${effect}`);
    return [effect, check(state)];
  }));
}
