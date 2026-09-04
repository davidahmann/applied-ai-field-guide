import assert from "node:assert/strict";
import test from "node:test";
import { documents } from "./sources.mjs";
import { baseline, validateProposal, recordReview } from "./engine.mjs";
import { grade } from "./grade.mjs";
import { evaluate } from "./run-evaluation.mjs";
import { modelProposal } from "./model-adapter.mjs";

test("real baseline exposes format limitations and does not draft known unsafe cases", async () => {
  const report = await evaluate();
  assert.equal(report.results.length, 8);
  assert.equal(report.results.filter((item) => item.correct).length, 6);
  assert.equal(report.results.some((item) => item.unsafe_draft), false);
  assert.equal(report.disposition, "inconclusive_for_deployment");
  assert.equal(report.human_effectiveness, "not measured");
});

test("a polished wrong amount passes shape but fails the independent source grader", () => {
  const document = documents[0];
  const proposal = { ...baseline(document.text), amount_cents: 12000 };
  assert.deepEqual(validateProposal(proposal, document.text), []);
  assert.equal(grade(document, proposal, []).correct, false);
});

test("business record rejects hallucinated quotes, extra effects, fractional cents and missing fields", () => {
  const document = documents[0], valid = baseline(document.text);
  for (const mutation of [{ evidence_quote: "invented source" }, { amount_cents: 1.1 }, { amount_cents: -2 }, { pay_now: true }, { currency: null }, { invoice_id: "<script>" }]) {
    assert.ok(validateProposal({ ...valid, ...mutation }, document.text).length);
  }
});

test("review acceptance needs explicit source check and records no production authority", () => {
  const document = documents[0], proposal = baseline(document.text);
  const input = { document, proposal, action: "accept_draft", reviewer: "practice-owner", rationale: "Checked final invoice", sourceChecked: false, elapsedMs: 1000 };
  assert.throws(() => recordReview(input), /Check the source/);
  const accepted = recordReview({ ...input, sourceChecked: true });
  assert.equal(accepted.production_authorization, false);
  assert.equal(accepted.effect, "local_practice_record_only");
  assert.equal(recordReview({ ...input, action: "escalate" }).action, "escalate");
  assert.throws(() => recordReview({ ...input, action: "pay" }), /unsupported/);
});

test("candidate cannot emit a passing grade and candidate failure retains manual fallback", async () => {
  const forged = await evaluate(async (text) => ({ proposal: { ...baseline(text), amount_cents: 1 }, correct: true, unsafe_draft: false, case_id: "forged", partition: "forged" }));
  assert.equal(forged.results[0].correct, false);
  assert.equal(forged.results[0].case_id, "doc-a");
  assert.equal(forged.results[0].partition, "development");
  const report = await evaluate(async () => { throw new Error("deliberate timeout"); }, "negative-control");
  assert.equal(report.results.every((item) => !item.correct && item.terminal_reason === "candidate_failed_manual_queue"), true);
});

test("live adapter fixes destination, bounds completion and rejects incomplete outputs without retry", async () => {
  let calls = 0;
  const fetcher = async (url, options) => {
    calls++; assert.equal(url, "https://api.openai.com/v1/responses"); assert.equal(options.redirect, "error");
    const request = JSON.parse(options.body);
    assert.equal(request.store, false); assert.equal(request.max_output_tokens, 1200); assert.equal(request.tools, undefined);
    return { ok: true, json: async () => ({ status: "incomplete" }) };
  };
  await assert.rejects(() => modelProposal(documents[0].text, { model: "fixture-model", key: "fixture-only", fetcher }), /incomplete/);
  assert.equal(calls, 1);
});
