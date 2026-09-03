import assert from "node:assert/strict";
import test from "node:test";

import { decideInvoiceAction } from "./authorization-policy.mjs";

const request = {
  action: "stage_resolution",
  agent: "invoice-exception-workload",
  caller: {
    id: "invoice-requester-1",
    tenant_id: "tenant-a",
    scopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  },
  tenant_id: "tenant-a",
  resource: { tenant_id: "tenant-a", invoice_id: "inv-100" },
  policy_revision: "policy-18",
  current_policy_revision: "policy-18",
};

test("allows scoped tenant-bound staging", () => {
  assert.equal(decideInvoiceAction(request).allow, true);
});

test("denies unknown action", () => {
  const decision = decideInvoiceAction({ ...request, action: "delete_invoice" });
  assert.deepEqual(decision, { allow: false, reason_code: "ACTION_NOT_ALLOWED" });
});

test("denies cross-tenant resource", () => {
  const decision = decideInvoiceAction({ ...request, resource: { tenant_id: "tenant-b" } });
  assert.deepEqual(decision, { allow: false, reason_code: "RESOURCE_TENANT_DENIED" });
});

test("denies caller without action scope", () => {
  const decision = decideInvoiceAction({
    ...request,
    caller: { id: "invoice-requester-1", tenant_id: "tenant-a", scopes: [] },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "CALLER_SCOPE_DENIED" });
});

test("denies a missing caller identity", () => {
  const decision = decideInvoiceAction({
    ...request,
    caller: { tenant_id: "tenant-a", scopes: ["invoice-resolution:stage"] },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "CALLER_ID_DENIED" });
});

test("denies a stale policy revision", () => {
  const decision = decideInvoiceAction({ ...request, current_policy_revision: "policy-19" });
  assert.deepEqual(decision, { allow: false, reason_code: "POLICY_REVISION_STALE" });
});

test("commit requires approval bound to a proposal digest", () => {
  const baseCommit = {
    ...request,
    action: "commit_resolution",
    proposal_digest: "sha256:proposal",
    now: "2026-08-07T14:00:00.000Z",
  };
  assert.equal(decideInvoiceAction(baseCommit).reason_code, "APPROVAL_REQUIRED");
  assert.equal(decideInvoiceAction({
    ...baseCommit,
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: "invoice-approver-1",
    },
  }).reason_code, "APPROVAL_DIGEST_MISSING");
  assert.equal(decideInvoiceAction({
    ...baseCommit,
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: "invoice-approver-1",
      proposal_digest: "sha256:proposal",
      approved_at: "2026-08-07T13:59:00.000Z",
      expires_at: "2026-08-07T15:00:00.000Z",
    },
  }).allow, true);
});

test("commit denies approval bound to a different proposal", () => {
  const decision = decideInvoiceAction({
    ...request,
    action: "commit_resolution",
    proposal_digest: "sha256:expected",
    now: "2026-08-07T14:00:00.000Z",
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: "invoice-approver-1",
      proposal_digest: "sha256:other",
      approved_at: "2026-08-07T13:59:00.000Z",
      expires_at: "2026-08-07T15:00:00.000Z",
    },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "APPROVAL_DIGEST_MISMATCH" });
});

test("commit denies expired approval", () => {
  const decision = decideInvoiceAction({
    ...request,
    action: "commit_resolution",
    proposal_digest: "sha256:proposal",
    now: "2026-08-07T14:00:00.000Z",
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: "invoice-approver-1",
      proposal_digest: "sha256:proposal",
      approved_at: "2026-08-07T13:00:00.000Z",
      expires_at: "2026-08-07T13:59:59.000Z",
    },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "APPROVAL_EXPIRED" });
});

test("commit requires an approver independent from the caller", () => {
  const decision = decideInvoiceAction({
    ...request,
    action: "commit_resolution",
    proposal_digest: "sha256:proposal",
    now: "2026-08-07T14:00:00.000Z",
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: request.caller.id,
      proposal_digest: "sha256:proposal",
      approved_at: "2026-08-07T13:59:00.000Z",
      expires_at: "2026-08-07T15:00:00.000Z",
    },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "APPROVAL_SEPARATION_REQUIRED" });
});

test("commit denies an approval issued after the decision time", () => {
  const decision = decideInvoiceAction({
    ...request,
    action: "commit_resolution",
    proposal_digest: "sha256:proposal",
    now: "2026-08-07T14:00:00.000Z",
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: "invoice-approver-1",
      proposal_digest: "sha256:proposal",
      approved_at: "2026-08-07T14:00:01.000Z",
      expires_at: "2026-08-07T15:00:00.000Z",
    },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "APPROVAL_TIME_INVALID" });
});

test("commit requires authority for its mandatory readback", () => {
  const decision = decideInvoiceAction({
    ...request,
    action: "commit_resolution",
    caller: {
      ...request.caller,
      scopes: ["invoice-resolution:commit"],
    },
    proposal_digest: "sha256:proposal",
    now: "2026-08-07T14:00:00.000Z",
    approval: {
      approved: true,
      approval_id: "approval-1",
      approver_role: "accounts-payable-approver",
      approver_principal: "invoice-approver-1",
      proposal_digest: "sha256:proposal",
      approved_at: "2026-08-07T13:59:00.000Z",
      expires_at: "2026-08-07T15:00:00.000Z",
    },
  });
  assert.deepEqual(decision, { allow: false, reason_code: "CALLER_SCOPE_DENIED" });
});
