import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createDurableRecoveryLab } from "./durable-recovery.mjs";

const root = await mkdtemp(path.join(tmpdir(), "applied-ai-durable-recovery-"));
const request = {
  tenant_id: "tenant-a",
  business_operation_id: "resolve-inv-100-demo",
  invoice_id: "inv-100",
  approval_revision: "approval-42",
  policy_revision: "policy-18",
  caller: { id: "reviewer-17", tenant_id: "tenant-a", scopes: ["invoice-resolution:commit"] },
};

try {
  const firstAttempt = await createDurableRecoveryLab(root);
  let interruption;
  try {
    await firstAttempt.submit(request, { fault: "after_effect_before_receipt" });
  } catch (error) {
    interruption = error.code;
  }
  const restarted = await createDurableRecoveryLab(root);
  const recovered = await restarted.recover(request);
  process.stdout.write(`${JSON.stringify({ interruption, recovered, stored_effects: Object.keys(restarted.inspect().effects).length, note: "Fictional local fixture only; production needs target identity, durable storage, concurrency, retention, and recovery evidence." }, null, 2)}\n`);
} finally {
  await rm(root, { recursive: true, force: true });
}
