import assert from "node:assert/strict";
import test from "node:test";

import { baseInput, createInvoiceWorld } from "./invoice-world-fixture.mjs";
import { referenceInternals, runInvoiceException } from "./reference-loop.mjs";
import { expectedSolutionReleaseDigest } from "../../scripts/contract-invariants.mjs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("runtime and repository validators compute the same canonical release digest", () => {
  assert.equal(
    referenceInternals.referenceReleaseDigest,
    expectedSolutionReleaseDigest(referenceInternals.referenceReleasePayload),
  );
});

async function stageApprovedDirectRequest(deps) {
  const businessOperationId = "resolve-inv-100-direct";
  const operationId = referenceInternals.digest({
    tenant_id: "tenant-a",
    business_operation_id: businessOperationId,
    action: "commit_resolution",
  });
  const proposalDigest = "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const caller = {
    id: "user-1",
    tenant_id: "tenant-a",
    scopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  };
  const resource = { tenant_id: "tenant-a", invoice_id: "inv-100" };
  const stageDecision = await deps.authorize({
    action: "stage_resolution",
    operation_id: operationId,
    agent: "invoice-exception-workload",
    caller,
    tenant_id: "tenant-a",
    resource,
    policy_revision: "policy-18",
  });
  assert.equal(stageDecision.allow, true);
  const staged = await deps.stageResolution({
    operation_id: operationId,
    release_digest: referenceInternals.referenceReleaseDigest,
    tenant_id: "tenant-a",
    business_operation_id: businessOperationId,
    invoice_id: "inv-100",
    invoice_revision: "7",
    policy_revision: "policy-18",
    policy_decision_id: stageDecision.decision_id,
    proposal: { action: "release_duplicate_hold" },
    proposal_digest: proposalDigest,
    idempotency_key: operationId,
  });
  const approval = await deps.requestApproval({
    proposal_id: staged.proposal_id,
    proposal_digest: proposalDigest,
    evidence: [],
    expires_seconds: 3600,
  });
  const commitDecision = await deps.authorize({
    action: "commit_resolution",
    operation_id: operationId,
    agent: "invoice-exception-workload",
    caller,
    tenant_id: "tenant-a",
    resource,
    policy_revision: "policy-18",
    proposal_digest: proposalDigest,
    now: "2026-08-07T17:00:00.000Z",
    approval,
  });
  assert.equal(commitDecision.allow, true);
  return {
    run_id: "00000000-0000-4000-8000-000000000020",
    operation_id: operationId,
    release_digest: referenceInternals.referenceReleaseDigest,
    tenant_id: "tenant-a",
    business_operation_id: businessOperationId,
    invoice_id: "inv-100",
    invoice_revision: "7",
    policy_revision: "policy-18",
    policy_decision_id: commitDecision.decision_id,
    proposal_id: staged.proposal_id,
    proposal_digest: proposalDigest,
    approval_id: approval.approval_id,
    idempotency_key: operationId,
    expected_postcondition_digest: referenceInternals.digest({ status: "resolved", resolution_count: 1 }),
  };
}

test("direct staging without an admitted policy decision fails closed", async () => {
  const { deps, state } = createInvoiceWorld();
  const businessOperationId = "resolve-inv-100-stage-bypass";
  const operationId = referenceInternals.digest({
    tenant_id: "tenant-a",
    business_operation_id: businessOperationId,
    action: "commit_resolution",
  });

  await assert.rejects(
    deps.stageResolution({
      operation_id: operationId,
      release_digest: referenceInternals.referenceReleaseDigest,
      tenant_id: "tenant-a",
      business_operation_id: businessOperationId,
      invoice_id: "inv-100",
      invoice_revision: "7",
      policy_revision: "policy-18",
      policy_decision_id: "00000000-0000-4000-8000-000000000099",
      proposal: { action: "release_duplicate_hold" },
      proposal_digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      idempotency_key: operationId,
    }),
    (error) => error.code === "POLICY_DENIED" && error.retryable === false,
  );
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("authorized resolution commits and verifies exactly one effect", async () => {
  const { deps, state } = createInvoiceWorld();
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "completed");
  assert.equal(result.stop_reason, "completed");
  assert.match(result.run_id, uuidPattern);
  assert.match(result.operation_id, /^sha256:[a-f0-9]{64}$/);
  assert.equal(state.proposals.size, 1);
  assert.equal(state.effects.size, 1);
  assert.equal(result.readback.status, "resolved");
  assert.ok(state.events.some((event) => event.state === "readback_verified"));
});

test("caller without invoice read scope is denied before disclosure or staging", async () => {
  const { deps, state } = createInvoiceWorld();
  const input = {
    ...baseInput,
    caller: {
      ...baseInput.caller,
      scopes: ["finance-policy:read", "invoice-resolution:stage", "invoice-resolution:commit"],
    },
  };
  const result = await runInvoiceException(input, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied");
  assert.equal(state.readInvoiceRequests.length, 1);
  assert.equal(state.readInvoiceResponses.length, 0);
  assert.equal(state.retrievePolicyRequests.length, 0);
  assert.deepEqual(state.toolErrors.map(({ tool_id, code }) => ({ tool_id, code })), [
    { tool_id: "read_invoice", code: "POLICY_DENIED" },
  ]);
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("caller without policy read scope is denied before policy disclosure or effect", async () => {
  const { deps, state } = createInvoiceWorld();
  const input = {
    ...baseInput,
    caller: {
      ...baseInput.caller,
      scopes: ["invoice:read", "invoice-resolution:stage", "invoice-resolution:commit"],
    },
  };
  const result = await runInvoiceException(input, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied");
  assert.equal(state.readInvoiceResponses.length, 1);
  assert.equal(state.retrievePolicyRequests.length, 1);
  assert.equal(state.retrievePolicyResponses.length, 0);
  assert.deepEqual(state.toolErrors.map(({ tool_id, code }) => ({ tool_id, code })), [
    { tool_id: "retrieve_policy", code: "POLICY_DENIED" },
  ]);
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("revoked caller scopes are refreshed and denied on retry", async () => {
  const { deps, state } = createInvoiceWorld();
  const first = await runInvoiceException(baseInput, deps);
  state.setCurrentCallerScopes([]);
  const second = await runInvoiceException(baseInput, deps);

  assert.equal(first.state, "completed");
  assert.equal(second.state, "escalated");
  assert.equal(second.stop_reason, "policy_denied");
  assert.equal(state.readInvoiceResponses.length, 1);
  assert.equal(state.effectCreations, 1);
  assert.equal(state.effects.size, 1);
});

test("a different caller cannot reuse a prior caller's delegated context", async () => {
  const { deps, state } = createInvoiceWorld();
  const first = await runInvoiceException(baseInput, deps);
  const second = await runInvoiceException({
    ...baseInput,
    caller: { ...baseInput.caller, id: "user-2" },
  }, deps);

  assert.equal(first.state, "completed");
  assert.equal(second.state, "escalated");
  assert.equal(second.stop_reason, "policy_denied");
  assert.equal(state.readInvoiceResponses.length, 1);
  assert.equal(state.effectCreations, 1);
});

test("approval rejection prevents commit", async () => {
  const { deps, state } = createInvoiceWorld({ approved: false });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "rejected");
  assert.equal(result.stop_reason, "approval_rejected");
  assert.equal(state.proposals.size, 1);
  assert.equal(state.effects.size, 0);
});

test("runtime refuses a release that the deployment controller has not admitted", async () => {
  const { deps, state } = createInvoiceWorld({
    admittedReleaseDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "release_not_admitted");
  assert.equal(result.error_code, "RELEASE_NOT_ADMITTED");
  assert.equal(state.readInvoiceRequests.length, 0);
  assert.equal(state.effects.size, 0);
});

test("release revocation before reads prevents disclosure and effects", async () => {
  const { deps, state } = createInvoiceWorld();
  const admittedReleaseDigest = deps.admittedReleaseDigest;
  deps.admittedReleaseDigest = async () => {
    const digest = await admittedReleaseDigest();
    state.setAdmittedReleaseDigest("sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    return digest;
  };

  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "release_not_admitted");
  assert.equal(result.error_code, "DIGEST_MISMATCH");
  assert.equal(state.readInvoiceRequests.length, 0);
  assert.equal(state.readInvoiceResponses.length, 0);
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("release revocation before staging prevents the staged effect", async () => {
  const { deps, state } = createInvoiceWorld();
  const proposeResolution = deps.proposeResolution;
  deps.proposeResolution = async (request) => {
    state.setAdmittedReleaseDigest("sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    return proposeResolution(request);
  };

  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "release_not_admitted");
  assert.equal(result.error_code, "DIGEST_MISMATCH");
  assert.equal(state.stageRequests.length, 0);
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("cost budget exhaustion stops before data access or effect", async () => {
  const { deps, state } = createInvoiceWorld({ costUsd: 0.41 });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "budget_exhausted");
  assert.equal(state.readInvoiceRequests.length, 0);
  assert.equal(state.effects.size, 0);
  assert.equal(result.error_code, "BUDGET_COST_EXCEEDED");
});

test("wall-time budget exhaustion stops before data access or effect", async () => {
  let clock = 0;
  const { deps, state } = createInvoiceWorld({
    monotonicNowMs: () => {
      const current = clock;
      clock += 100000;
      return current;
    },
  });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "budget_exhausted");
  assert.equal(state.readInvoiceRequests.length, 0);
  assert.equal(state.effects.size, 0);
  assert.equal(result.error_code, "BUDGET_TIME_EXCEEDED");
});

test("an in-flight hung dependency is aborted at the wall-time deadline", async () => {
  const { deps, state } = createInvoiceWorld();
  let clock = 0;
  let enteredResolve;
  const entered = new Promise((resolve) => { enteredResolve = resolve; });
  deps.monotonicNowMs = () => clock;
  deps.loadContext = async () => {
    enteredResolve();
    return new Promise(() => {});
  };

  const run = runInvoiceException(baseInput, deps);
  await entered;
  clock = 100000;
  const result = await run;

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "budget_exhausted");
  assert.equal(result.error_code, "BUDGET_TIME_EXCEEDED");
  assert.equal(state.readInvoiceResponses.length, 0);
  assert.equal(state.effects.size, 0);
});

test("budget exhaustion after an effect still performs readback before stopping", async () => {
  const { deps, state } = createInvoiceWorld();
  const commitResolution = deps.commitResolution;
  deps.commitResolution = async (request) => {
    const effect = await commitResolution(request);
    state.setCostUsd(0.41);
    return effect;
  };

  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "budget_exhausted");
  assert.equal(result.error_code, "BUDGET_COST_EXCEEDED");
  assert.equal(state.effectCreations, 1);
  assert.equal(state.readbackResponses.length, 1);
  assert.equal(result.effect_receipt.readback.status, "matched");
});

test("duplicate delivery reuses stable proposal and effect receipts", async () => {
  const { deps, state } = createInvoiceWorld();
  const first = await runInvoiceException(baseInput, deps);
  const second = await runInvoiceException(baseInput, deps);

  assert.equal(first.state, "completed");
  assert.equal(second.state, "completed");
  assert.notEqual(first.run_id, second.run_id);
  assert.match(first.run_id, uuidPattern);
  assert.match(second.run_id, uuidPattern);
  assert.equal(first.operation_id, second.operation_id);
  assert.equal(first.idempotency_key, second.idempotency_key);
  assert.equal(first.operation_id, first.idempotency_key);
  assert.equal(first.effect.effect_id, second.effect.effect_id);
  assert.equal(second.effect_receipt.run_id, first.run_id);
  assert.notEqual(second.effect_receipt.run_id, second.run_id);
  assert.equal(second.effect_receipt.run_id, second.effect_receipt.service_receipt.subject.run_id);
  assert.equal(state.proposals.size, 1);
  assert.equal(state.effects.size, 1);
});

test("changed proposal for the same business operation cannot create a second effect", async () => {
  const { deps, state } = createInvoiceWorld({
    proposalSequence: [
      { action: "release_duplicate_hold", amount: 0, rationale_code: "DUPLICATE_CONFIRMED" },
      { action: "release_duplicate_hold", amount: 25, rationale_code: "MANUAL_ADJUSTMENT" },
    ],
  });
  const first = await runInvoiceException(baseInput, deps);
  const second = await runInvoiceException(baseInput, deps);

  assert.equal(first.state, "completed");
  assert.equal(second.state, "escalated");
  assert.equal(second.stop_reason, "idempotency_conflict");
  assert.equal(first.operation_id, second.operation_id);
  assert.equal(state.proposals.size, 1);
  assert.equal(state.effects.size, 1);
  assert.equal(state.commitRequests.length, 1);
});

test("source revision drift does not create a new business operation or second effect", async () => {
  const { deps, state } = createInvoiceWorld();
  const first = await runInvoiceException(baseInput, deps);
  state.invoice.revision = "8";
  const second = await runInvoiceException({ ...baseInput, invoice_revision: "8" }, deps);

  assert.equal(first.state, "completed");
  assert.equal(second.state, "escalated");
  assert.equal(second.stop_reason, "idempotency_conflict");
  assert.equal(first.operation_id, second.operation_id);
  assert.equal(state.proposals.size, 1);
  assert.equal(state.effects.size, 1);
  assert.equal(state.effectCreations, 1);
});

test("a distinct business operation cannot repeat an already resolved effect", async () => {
  const { deps, state } = createInvoiceWorld();
  const first = await runInvoiceException(baseInput, deps);
  const second = await runInvoiceException({
    ...baseInput,
    business_operation_id: "resolve-inv-100-second-operation",
  }, deps);

  assert.equal(first.state, "completed");
  assert.equal(second.state, "escalated");
  assert.equal(second.stop_reason, "policy_denied_at_commit");
  assert.equal(state.effectCreations, 1);
  assert.equal(state.effects.size, 1);
  assert.equal(state.receipts.size, 1);
});

test("expired approval is rejected before commit", async () => {
  const { deps, state } = createInvoiceWorld({ approvalExpiresAt: "2026-08-07T16:59:59.000Z" });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "rejected");
  assert.equal(result.stop_reason, "approval_expired");
  assert.equal(state.commitRequests.length, 0);
  assert.equal(state.effects.size, 0);
});

test("future-dated approval is rejected before commit", async () => {
  const { deps, state } = createInvoiceWorld({
    now: "2026-08-07T16:00:00.000Z",
    approvalExpiresAt: "2026-08-07T20:00:00.000Z",
  });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "rejected");
  assert.equal(result.stop_reason, "approval_time_invalid");
  assert.equal(state.commitRequests.length, 0);
  assert.equal(state.effects.size, 0);
});

test("approval digest mismatch is rejected before commit", async () => {
  const { deps, state } = createInvoiceWorld({ approvalDigestMismatch: true });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "approval_digest_mismatch");
  assert.equal(state.commitRequests.length, 0);
  assert.equal(state.effects.size, 0);
});

test("commit boundary denies caller scope revoked after orchestration authorization", async () => {
  const { deps, state } = createInvoiceWorld({ revokeAfterCommitAuthorization: true });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied_at_commit");
  assert.equal(state.commitRequests.length, 1);
  assert.equal(state.effects.size, 0);
  assert.deepEqual(state.toolErrors.map((error) => error.code), ["POLICY_DENIED"]);
});

test("commit boundary denies policy rotated after orchestration authorization", async () => {
  const { deps, state } = createInvoiceWorld({ rotatePolicyAfterCommitAuthorization: true });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied_at_commit");
  assert.equal(state.commitRequests.length, 1);
  assert.equal(state.effects.size, 0);
  assert.deepEqual(state.toolErrors.map((error) => error.code), ["POLICY_DENIED"]);
});

test("commit boundary denies a release revoked after orchestration authorization", async () => {
  const { deps, state } = createInvoiceWorld({ revokeReleaseAfterCommitAuthorization: true });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "release_not_admitted");
  assert.equal(result.error_code, "DIGEST_MISMATCH");
  assert.equal(state.commitRequests.length, 1);
  assert.equal(state.effects.size, 0);
  assert.deepEqual(state.toolErrors.map((error) => error.code), ["DIGEST_MISMATCH"]);
});

test("direct commit-tool invocation without approval fails closed", async () => {
  const { deps, state } = createInvoiceWorld({
    currentCallerScopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  });

  const businessOperationId = "resolve-inv-100-unapproved";
  const operationId = referenceInternals.digest({
    tenant_id: "tenant-a",
    business_operation_id: businessOperationId,
    action: "commit_resolution",
  });
  await assert.rejects(
    deps.commitResolution({
      run_id: "00000000-0000-4000-8000-000000000020",
      operation_id: operationId,
      release_digest: referenceInternals.referenceReleaseDigest,
      tenant_id: "tenant-a",
      business_operation_id: businessOperationId,
      invoice_id: "inv-100",
      invoice_revision: "7",
      policy_revision: "policy-18",
      policy_decision_id: "00000000-0000-4000-8000-000000000004",
      proposal_id: "proposal-bypass",
      proposal_digest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      approval_id: "missing-approval",
      idempotency_key: operationId,
      expected_postcondition_digest: referenceInternals.digest({ status: "resolved", resolution_count: 1 }),
    }),
    (error) => error.code === "POLICY_DENIED" && error.retryable === false,
  );
  assert.equal(state.effects.size, 0);
  assert.equal(state.unapprovedLedgerMutations, 0);
});

test("commit boundary rejects a caller-supplied stale business revision", async () => {
  const { deps, state } = createInvoiceWorld({
    currentCallerScopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  });
  const request = await stageApprovedDirectRequest(deps);

  await assert.rejects(
    deps.commitResolution({
      ...request,
      invoice_revision: "999",
    }),
    (error) => error.code === "POLICY_DENIED" && error.retryable === false,
  );
  assert.equal(state.effectCreations, 0);
  assert.equal(state.effects.size, 0);
});

test("commit boundary rejects alternate operation IDs and preserves one effect", async () => {
  const { deps, state } = createInvoiceWorld({
    currentCallerScopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  });
  const request = await stageApprovedDirectRequest(deps);
  const first = await deps.commitResolution(request);
  const forgedOperationId = "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

  await assert.rejects(
    deps.commitResolution({
      ...request,
      operation_id: forgedOperationId,
      idempotency_key: forgedOperationId,
    }),
    (error) => error.code === "DIGEST_MISMATCH" && error.retryable === false,
  );
  assert.equal(first.status, "committed");
  assert.equal(state.effectCreations, 1);
  assert.equal(state.effects.size, 1);
  assert.equal(state.receipts.size, 1);
});

test("commit boundary rejects a missing current caller identity", async () => {
  const { deps, state } = createInvoiceWorld({
    currentCallerScopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  });
  const request = await stageApprovedDirectRequest(deps);
  state.setCurrentCallerId(null);

  await assert.rejects(
    deps.commitResolution(request),
    (error) => error.code === "POLICY_DENIED" && error.retryable === false,
  );
  assert.equal(state.effectCreations, 0);
  assert.equal(state.effects.size, 0);
});

test("commit boundary rejects a release digest outside the admitted release", async () => {
  const { deps, state } = createInvoiceWorld({
    currentCallerScopes: ["invoice-resolution:stage", "invoice-resolution:commit", "invoice-resolution:readback"],
  });
  const request = await stageApprovedDirectRequest(deps);

  await assert.rejects(
    deps.commitResolution({
      ...request,
      release_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    }),
    (error) => error.code === "DIGEST_MISMATCH" && error.retryable === false,
  );
  assert.equal(state.effectCreations, 0);
});

test("approval identity and role are independently enforced", async () => {
  const { deps, state } = createInvoiceWorld({ approverPrincipal: baseInput.caller.id });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied_before_commit");
  assert.equal(state.effects.size, 0);
});

test("commit is denied before effect when mandatory readback authority is absent", async () => {
  const scopes = baseInput.caller.scopes.filter((scope) => scope !== "invoice-resolution:readback");
  const { deps, state } = createInvoiceWorld({ currentCallerScopes: scopes });
  const input = {
    ...baseInput,
    caller: { ...baseInput.caller, scopes },
  };
  const result = await runInvoiceException(input, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied_before_commit");
  assert.equal(state.commitRequests.length, 0);
  assert.equal(state.effectCreations, 0);
  assert.equal(state.readbackResponses.length, 0);
});

test("postcondition mismatch compensates and opens an incident", async () => {
  const { deps, state } = createInvoiceWorld({ readbackMatches: false });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "postcondition_failed");
  assert.equal(result.stop_reason, "readback_mismatch");
  assert.equal(state.compensations, 1);
  assert.equal(state.incidents, 1);
});

test("invalid service receipt after an effect enters readback reconciliation", async () => {
  const { deps, state } = createInvoiceWorld();
  const commitResolution = deps.commitResolution;
  deps.commitResolution = async (request) => {
    const effect = await commitResolution(request);
    effect.service_receipt.issuer = "attacker-ledger";
    return effect;
  };
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "service_receipt_invalid");
  assert.equal(state.effectCreations, 1);
  assert.equal(state.invoice.status, "resolved");
  assert.equal(state.readbackResponses.length, 1);
  assert.equal(state.incidents, 1);
  assert.equal(result.effect_receipt, undefined);
});

test("unsigned readback-attestation issuer metadata cannot be substituted", async () => {
  const { deps } = createInvoiceWorld();
  const readbackInvoice = deps.readbackInvoice;
  deps.readbackInvoice = async (request) => {
    const readback = await readbackInvoice(request);
    readback.readback_attestation.issuer = "attacker-ledger";
    return readback;
  };
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "postcondition_failed");
  assert.equal(result.stop_reason, "readback_mismatch");
});

test("a stale signed readback cannot prove a later run completed", async () => {
  const { deps, state } = createInvoiceWorld();
  let clock = "2026-08-07T17:00:00.000Z";
  deps.now = () => clock;
  const first = await runInvoiceException(baseInput, deps);
  const staleReadback = structuredClone(first.readback);
  state.invoice.status = "exception";
  clock = "2026-08-07T17:10:00.000Z";
  deps.readbackInvoice = async () => structuredClone(staleReadback);

  const second = await runInvoiceException(baseInput, deps);

  assert.equal(state.invoice.status, "exception");
  assert.equal(second.state, "postcondition_failed");
  assert.equal(second.stop_reason, "readback_mismatch");
  assert.notEqual(second.state, "completed");
});

test("a future-dated signed readback cannot prove completion", async () => {
  const { deps } = createInvoiceWorld();
  let clock = "2026-08-07T17:00:00.000Z";
  deps.now = () => clock;
  const readbackInvoice = deps.readbackInvoice;
  deps.readbackInvoice = async (request, context) => {
    clock = "2099-01-01T00:00:00.000Z";
    const readback = await readbackInvoice(request, context);
    clock = "2026-08-07T17:00:00.000Z";
    return readback;
  };

  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "postcondition_failed");
  assert.equal(result.stop_reason, "readback_mismatch");
});

test("a readback dated before commit cannot prove completion", async () => {
  const { deps } = createInvoiceWorld();
  let clock = "2026-08-07T17:00:00.000Z";
  deps.now = () => clock;
  const readbackInvoice = deps.readbackInvoice;
  deps.readbackInvoice = async (request, context) => {
    clock = "2026-08-07T16:30:00.000Z";
    try {
      return await readbackInvoice(request, context);
    } finally {
      clock = "2026-08-07T17:00:00.000Z";
    }
  };

  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "readback_denied");
});

test("tenant mismatch stops before proposal or effect", async () => {
  const { deps, state } = createInvoiceWorld({ returnedTenant: "tenant-b" });
  const result = await runInvoiceException(baseInput, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "tenant_mismatch");
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("read boundary denies a true cross-tenant request before returning data", async () => {
  const { deps, state } = createInvoiceWorld({ invoiceTenant: "tenant-a" });
  const input = {
    ...baseInput,
    tenant_id: "tenant-b",
    caller: { ...baseInput.caller, tenant_id: "tenant-b" },
  };
  const result = await runInvoiceException(input, deps);

  assert.equal(result.state, "escalated");
  assert.equal(result.stop_reason, "policy_denied");
  assert.equal(state.crossTenantReadAttempts, 1);
  assert.equal(state.crossTenantReads, 0);
  assert.equal(state.proposals.size, 0);
  assert.equal(state.effects.size, 0);
});

test("readback rejects a tenant, resource, or operation that does not match the stored effect", async () => {
  const { deps } = createInvoiceWorld();
  const result = await runInvoiceException(baseInput, deps);
  const wrongOperation = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  const validAuthority = {
    run_id: result.run_id,
    readback_request_id: "00000000-0000-4000-8000-000000000030",
    requested_at: "2026-08-07T17:00:00.000Z",
    release_digest: referenceInternals.referenceReleaseDigest,
    caller_principal_hash: referenceInternals.digest(baseInput.caller.id),
    policy_decision_id: result.effect_receipt.policy_decision_id,
  };
  const attempts = [
    { ...validAuthority, tenant_id: "tenant-b", invoice_id: baseInput.invoice_id, operation_id: result.operation_id },
    { ...validAuthority, tenant_id: baseInput.tenant_id, invoice_id: "inv-other", operation_id: result.operation_id },
    { ...validAuthority, tenant_id: baseInput.tenant_id, invoice_id: baseInput.invoice_id, operation_id: wrongOperation },
  ];

  for (const request of attempts) {
    await assert.rejects(
      deps.readbackInvoice(request),
      (error) => error.code === "POLICY_DENIED" && error.retryable === false,
    );
  }
});

test("readback refreshes current caller authority before disclosing effect evidence", async () => {
  const { deps, state } = createInvoiceWorld();
  const result = await runInvoiceException(baseInput, deps);
  state.setCurrentCallerScopes(baseInput.caller.scopes.filter((scope) => scope !== "invoice-resolution:readback"));

  await assert.rejects(
    deps.readbackInvoice({
      run_id: result.run_id,
      readback_request_id: "00000000-0000-4000-8000-000000000031",
      requested_at: "2026-08-07T17:00:00.000Z",
      tenant_id: baseInput.tenant_id,
      invoice_id: baseInput.invoice_id,
      operation_id: result.operation_id,
      release_digest: referenceInternals.referenceReleaseDigest,
      caller_principal_hash: referenceInternals.digest(baseInput.caller.id),
      policy_decision_id: result.effect_receipt.policy_decision_id,
    }),
    (error) => error.code === "POLICY_DENIED" && error.retryable === false,
  );
  assert.equal(state.readbackResponses.length, 1);
});
