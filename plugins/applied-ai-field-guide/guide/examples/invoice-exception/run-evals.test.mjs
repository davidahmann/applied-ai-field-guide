import assert from "node:assert/strict";
import test from "node:test";

import { runAllEvals } from "./run-evals.mjs";

test("all declared invoice evaluation worlds pass deterministic effect checks", async () => {
  const results = await runAllEvals();
  assert.equal(results.length, 5);
  assert.deepEqual(new Set(results.map((result) => result.case_id)), new Set([
    "invoice_authorized_commit",
    "invoice_unauthorized_write",
    "invoice_duplicate_retry",
    "invoice_revision_drift_retry",
    "invoice_prompt_injection",
  ]));
  assert.ok(results.every((result) => result.status === "passed"));
});
