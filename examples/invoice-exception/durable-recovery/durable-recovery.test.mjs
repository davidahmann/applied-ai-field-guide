import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createDurableRecoveryLab } from "./durable-recovery.mjs";

const request = Object.freeze({
  tenant_id: "tenant-a",
  business_operation_id: "resolve-inv-100-exception",
  invoice_id: "inv-100",
  approval_revision: "approval-42",
  policy_revision: "policy-18",
  caller: Object.freeze({ id: "reviewer-17", tenant_id: "tenant-a", scopes: Object.freeze(["invoice-resolution:commit"]) }),
});

async function world(t, options = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "applied-ai-durable-recovery-test-"));
  t.after(async () => rm(root, { recursive: true, force: true }));
  return { root, lab: await createDurableRecoveryLab(root, options) };
}

test("an ambiguous effect survives restart and is reconciled without a second effect", async (t) => {
  const { root, lab } = await world(t);
  await assert.rejects(lab.submit(request, { fault: "after_effect_before_receipt" }), { code: "SIMULATED_AMBIGUOUS_EFFECT" });
  assert.equal(Object.keys(lab.inspect().effects).length, 1);
  assert.equal(Object.values(lab.inspect().operations)[0].status, "pending_effect");

  const restarted = await createDurableRecoveryLab(root);
  const recovered = await restarted.recover(request);
  assert.deepEqual(recovered, {
    status: "completed",
    disposition: "reconciled_existing_effect",
    receipt: {
      operation_id: restarted.operationId(request),
      effect_id: `effect-${restarted.operationId(request).slice(-12)}`,
      invoice_id: "inv-100",
      tenant_id: "tenant-a",
      verified_by: "simulated_source_of_truth_readback",
    },
    effect_created: false,
  });
  assert.equal(Object.keys(restarted.inspect().effects).length, 1);
  const duplicate = await restarted.submit(request);
  assert.equal(duplicate.disposition, "existing_verified_effect");
  assert.equal(Object.keys(restarted.inspect().effects).length, 1);
});

test("a pre-effect interruption never retries after policy changes", async (t) => {
  const { root, lab } = await world(t);
  await assert.rejects(lab.submit(request, { fault: "before_effect" }), { code: "SIMULATED_INTERRUPTION_BEFORE_EFFECT" });
  assert.equal(Object.keys(lab.inspect().effects).length, 0);

  const changedPolicy = await createDurableRecoveryLab(root, { currentPolicyRevision: "policy-19" });
  const recovered = await changedPolicy.recover(request);
  assert.equal(recovered.status, "escalated");
  assert.equal(recovered.disposition, "approval_or_policy_changed_before_effect");
  assert.equal(Object.keys(changedPolicy.inspect().effects).length, 0);
});

test("failed readback keeps the operation pending and blocks a blind retry", async (t) => {
  const { root, lab } = await world(t);
  await assert.rejects(lab.submit(request, { fault: "after_effect_before_receipt" }), { code: "SIMULATED_AMBIGUOUS_EFFECT" });
  const unavailable = await createDurableRecoveryLab(root, { readbackAvailable: false });
  const recovered = await unavailable.recover(request);
  assert.equal(recovered.disposition, "readback_unavailable_escalate");
  const duplicate = await unavailable.submit(request);
  assert.equal(duplicate.disposition, "do_not_blindly_retry");
  assert.equal(Object.keys(unavailable.inspect().effects).length, 1);
});

test("cross-tenant or scope-invalid requests cannot create an effect", async (t) => {
  const { lab } = await world(t);
  const crossTenant = await lab.submit({ ...request, tenant_id: "tenant-b", caller: { ...request.caller, tenant_id: "tenant-a" } });
  assert.equal(crossTenant.status, "denied");
  const missingScope = await lab.submit({ ...request, caller: { ...request.caller, scopes: [] } });
  assert.equal(missingScope.status, "denied");
  assert.equal(Object.keys(lab.inspect().effects).length, 0);
});
