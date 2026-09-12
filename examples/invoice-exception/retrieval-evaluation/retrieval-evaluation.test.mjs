import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { corpus } from "./corpus.mjs";
import { createEmbeddingHybridCandidate, createOpenAICompatibleEmbedder } from "./embedding-hybrid.mjs";
import { expectations, gradeCase } from "./grade.mjs";
import { queries } from "./queries.mjs";
import { admissibleDocuments, retrieve } from "./retriever.mjs";
import { evaluate, evaluateAsync } from "./run-evaluation.mjs";

const query = (id) => queries.find(({ case_id }) => case_id === id);

test("BM25 output is deterministic and one vocabulary mismatch stays visible", () => {
  const first = evaluate();
  const second = evaluate();
  const withoutTiming = (report) => ({ ...report, cases: report.cases.map(({ latency_ms, ...rest }) => rest), metrics: { ...report.metrics, mean_local_latency_ms: 0 } });
  assert.deepEqual(withoutTiming(first), withoutTiming(second));
  assert.equal(first.cases.find(({ query: item }) => item.case_id === "vocabulary-mismatch").grade.expected_miss, true);
  assert.equal(first.metrics.abstention_correct, true);
  assert.equal(first.metrics.conflict_surfacing_rate, 1);
  assert.equal(first.metrics.authorization_or_stale_leaks, 0);
  assert.equal(first.disposition, "inconclusive_for_deployment");
});

test("tenant, scope, revision and time filters run before ranking", () => {
  const exact = admissibleDocuments(query("exact-policy-id"), corpus).map(({ source_id }) => source_id);
  assert.ok(exact.includes("policy-ap17-v3"));
  for (const excluded of ["policy-ap17-v2", "southwind-policy-v9", "emergency-memo-v1", "future-policy-v4", "supplier-attachment-88"]) assert.ok(!exact.includes(excluded), excluded);
  assert.equal(retrieve(query("cross-tenant-attempt"), corpus).disposition, "insufficient_evidence");
  assert.equal(retrieve(query("missing-policy-scope"), corpus).disposition, "insufficient_evidence");
  assert.equal(retrieve(query("expired-exception"), corpus).disposition, "insufficient_evidence");
  assert.throws(() => admissibleDocuments({ ...query("exact-policy-id"), as_of: "2026-02-31" }, corpus), /valid as_of date/);
});

test("results bind exact source revisions and never inherit instruction authority", () => {
  for (const item of queries) {
    const result = retrieve(item, corpus);
    for (const evidence of result.evidence) {
      const source = corpus.find(({ source_id }) => source_id === evidence.source_id);
      assert.ok(source);
      assert.equal(evidence.revision, source.revision);
      assert.equal(evidence.excerpt, source.text);
      assert.equal(evidence.instruction_authority, false);
    }
    assert.ok(result.evidence.length <= item.top_k);
    assert.ok(result.budget.used <= result.budget.limit);
  }
  const injection = retrieve(query("untrusted-injection"), corpus);
  assert.equal(injection.evidence[0].source_id, "supplier-attachment-88");
  assert.equal(injection.evidence[0].trust, "untrusted");
  assert.equal(injection.evidence[0].instruction_authority, false);
});

test("grader ignores candidate claims and catches forged evidence", () => {
  const item = query("exact-policy-id");
  const valid = retrieve(item, corpus);
  const forged = structuredClone(valid);
  forged.passed = true;
  forged.evidence[0].revision = "forged";
  forged.evidence[0].excerpt = "invented";
  forged.evidence.push({ source_id: "unknown", revision: "1", excerpt: "invented", instruction_authority: true });
  const grade = gradeCase(item, forged);
  assert.equal(grade.passed_safety, false);
  assert.ok(grade.integrity_errors.length >= 4);
});

test("grader rejects malformed and internally inconsistent candidate results", () => {
  const item = query("exact-policy-id");
  const emptySuccess = gradeCase(item, { case_id: item.case_id, disposition: "evidence_found", evidence: [], budget: { used: 1, limit: 1 } });
  assert.equal(emptySuccess.disposition_correct, true);
  assert.equal(emptySuccess.passed_safety, false);
  assert.ok(emptySuccess.integrity_errors.includes("evidence_found requires evidence"));

  const malformed = gradeCase(item, null);
  assert.equal(malformed.passed_safety, false);
  assert.ok(malformed.integrity_errors.includes("result must be an object"));
  assert.ok(malformed.integrity_errors.includes("result case_id must match the query"));

  const malformedEvidence = gradeCase(item, { case_id: item.case_id, disposition: "evidence_found", evidence: [null], budget: { used: 1, limit: 1 } });
  assert.equal(malformedEvidence.passed_safety, false);
  assert.ok(malformedEvidence.integrity_errors.includes("evidence item 0 must be an object"));

  const invalidDisposition = gradeCase(item, { case_id: item.case_id, disposition: "ship_it", evidence: [], budget: { used: 1, limit: 1 } });
  assert.equal(invalidDisposition.passed_safety, false);
  assert.ok(invalidDisposition.integrity_errors.includes("result disposition is invalid"));
});

test("grader binds authority metadata and rejects duplicate evidence without inflating ranking", () => {
  const item = query("untrusted-injection");
  const forged = retrieve(item, corpus);
  forged.evidence[0].owner = "controller";
  forged.evidence[0].trust = "authoritative";
  forged.evidence.push(structuredClone(forged.evidence[0]));
  const grade = gradeCase(item, forged);
  assert.equal(grade.passed_safety, false);
  assert.ok(grade.integrity_errors.includes("wrong owner for supplier-attachment-88"));
  assert.ok(grade.integrity_errors.includes("wrong trust for supplier-attachment-88"));
  assert.ok(grade.integrity_errors.includes("duplicate source supplier-attachment-88"));
  assert.equal(grade.ndcg_at_k, 1);
});

test("the bundled BM25 candidate has no evaluator, network, environment or filesystem dependency", async () => {
  const source = await readFile(new URL("./retriever.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /grade\.mjs|node:(?:fs|http|https|net)|\bfetch\s*\(|process\.env/);
});

test("an opt-in hybrid candidate embeds only admitted evidence and keeps the same independent safety grade", async () => {
  const embeddedBatches = [];
  const embed = async (texts) => {
    embeddedBatches.push(texts);
    return {
      vectors: texts.map((text) => {
        if (text.includes("greenlight") || text.includes("Accounts-payable correction policy")) return [1, 0];
        if (text.includes("Zulu overseas") || text.includes("Southwind Zulu") || text.includes("June-outage")) return [-1, 0];
        return [0, 1];
      }),
      input_tokens: texts.length * 10,
    };
  };
  const candidate = createEmbeddingHybridCandidate({ embed, name: "fixture-hybrid" });
  const result = await candidate(query("vocabulary-mismatch"), corpus);
  assert.equal(result.evidence[0].source_id, "policy-ap17-v3");
  assert.equal(result.evidence[0].instruction_authority, false);
  assert.ok(embeddedBatches[0].every((text) => !text.includes("Southwind") && !text.includes("ATTENTION AI") && !text.includes("nightly check")));

  const noAccess = await candidate(query("missing-policy-scope"), corpus);
  assert.equal(noAccess.disposition, "insufficient_evidence");
  assert.equal(embeddedBatches.length, 1, "inadmissible documents never reach the embedding boundary");
  const report = await evaluateAsync(candidate);
  assert.equal(report.candidate, "fixture-hybrid");
  assert.equal(report.metrics.authorization_or_stale_leaks, 0);
  assert.equal(report.metrics.instruction_authority_violations, 0);
  assert.equal(report.candidate_runtime.input_tokens, 470);
  assert.equal(report.disposition, "inconclusive_for_deployment");
});

test("the explicit provider adapter is unavailable without valid configuration and reports provider usage only when supplied", async () => {
  assert.throws(() => createOpenAICompatibleEmbedder({ endpoint: "http://example.test/v1/embeddings", apiKey: "test", model: "fixture" }), /https/);
  assert.throws(() => createOpenAICompatibleEmbedder({ endpoint: "https://example.test/v1/embeddings", apiKey: "", model: "fixture" }), /API key/);

  const requests = [];
  const embed = createOpenAICompatibleEmbedder({
    endpoint: "https://provider.example/v1/embeddings",
    apiKey: "test-key",
    model: "fixture-model",
    inputUsdPerMillion: 2,
    fetchImpl: async (url, init) => {
      requests.push({ url: String(url), init });
      const input = JSON.parse(init.body).input;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: input.map((text, index) => ({
            index,
            embedding: text.includes("greenlight") || text.includes("Accounts-payable correction policy") ? [1, 0]
              : (text.includes("Zulu overseas") || text.includes("Southwind Zulu") || text.includes("June-outage") ? [-1, 0] : [0, 1]),
          })),
          usage: { prompt_tokens: input.length * 4 },
        }),
      };
    },
  });
  const candidate = createEmbeddingHybridCandidate({ embed, providerMetrics: embed.metrics, name: "configured-provider-hybrid" });
  const report = await evaluateAsync(candidate);
  assert.equal(report.metrics.authorization_or_stale_leaks, 0);
  assert.equal(report.candidate_runtime.provider.request_count, 9);
  assert.equal(report.candidate_runtime.provider.input_tokens, 168);
  assert.equal(report.metrics.estimated_external_api_cost_usd, 0.000336);
  assert.ok(requests.every(({ url, init }) => url === "https://provider.example/v1/embeddings" && init.headers.authorization === "Bearer test-key"));
  assert.ok(requests.every(({ init }) => !JSON.parse(init.body).input.slice(1).some((text) => text.includes("Southwind") || text.includes("nightly check"))));
});

test("unsafe candidates fail even when they add a relevant result", () => {
  const target = query("cross-tenant-attempt");
  const leaked = retrieve(target, corpus);
  const foreign = corpus.find(({ source_id }) => source_id === "southwind-policy-v9");
  leaked.disposition = "evidence_found";
  leaked.evidence.push({ source_id: foreign.source_id, revision: foreign.revision, owner: foreign.owner, trust: foreign.trust, excerpt: foreign.text, score: 99, instruction_authority: false });
  const grade = gradeCase(target, leaked);
  assert.equal(grade.passed_safety, false);
  assert.deepEqual(grade.forbidden_sources, ["southwind-policy-v9"]);
  assert.deepEqual(grade.admission_errors, [{ source_id: "southwind-policy-v9", violations: ["tenant"] }]);
});

test("grader independently rejects every inadmissible source even when a case does not name it", () => {
  const target = query("exact-policy-id");
  const invalidIds = ["policy-ap17-v2", "southwind-policy-v9", "emergency-memo-v1", "future-policy-v4", "supplier-attachment-88"];
  for (const sourceId of invalidIds) {
    const source = corpus.find(({ source_id }) => source_id === sourceId);
    const candidate = retrieve(target, corpus);
    candidate.evidence = [{
      source_id: source.source_id,
      revision: source.revision,
      owner: source.owner,
      trust: source.trust,
      excerpt: source.text,
      score: 99,
      instruction_authority: false,
    }];
    candidate.disposition = "evidence_found";
    const grade = gradeCase(target, candidate);
    assert.equal(grade.passed_safety, false, sourceId);
    assert.deepEqual(grade.inadmissible_sources, [sourceId]);
    assert.ok(grade.admission_errors[0].violations.length > 0, sourceId);
  }
});

test("no-evidence cases stay out of ranking averages", () => {
  const report = evaluate();
  const noEvidence = report.cases.filter(({ query: item }) => ["missing-overseas-policy", "cross-tenant-attempt", "missing-policy-scope", "expired-exception"].includes(item.case_id));
  for (const { grade } of noEvidence) {
    assert.equal(grade.recall_at_k, null);
    assert.equal(grade.reciprocal_rank, null);
    assert.equal(grade.ndcg_at_k, null);
  }
  assert.equal(report.metrics.mean_recall_at_3, 5 / 6);
  assert.equal(report.metrics.mean_reciprocal_rank, 3 / 4);
  assert.equal(report.metrics.mean_ndcg_at_3, 5 / 6);
});

test("custom candidates are not mislabeled as the bundled baseline", () => {
  const customCandidate = (item) => retrieve(item, corpus);
  assert.equal(evaluate(customCandidate).candidate, "customCandidate");
  assert.equal(evaluate(customCandidate).metrics.estimated_external_api_cost_usd, null);
  const named = evaluate(customCandidate, { candidateName: "hybrid-v2", estimatedExternalApiCostUsd: 0.04 });
  assert.equal(named.candidate, "hybrid-v2");
  assert.equal(named.metrics.estimated_external_api_cost_usd, 0.04);
});

test("candidate input is isolated from frozen evaluation fixtures", () => {
  assert.ok(Object.isFrozen(corpus));
  assert.ok(Object.isFrozen(corpus[0]));
  assert.ok(Object.isFrozen(corpus[0].required_scopes));
  assert.ok(Object.isFrozen(queries));
  assert.ok(Object.isFrozen(queries[0].caller.scopes));
  assert.ok(Object.isFrozen(expectations));
  assert.ok(Object.isFrozen(expectations["exact-policy-id"].forbidden));
  assert.throws(() => { corpus[0].tenant_id = "southwind"; }, TypeError);
  assert.throws(() => { expectations["exact-policy-id"].primary = null; }, TypeError);

  const mutatingCandidate = (item) => {
    item.case_id = "untrusted-injection";
    item.question = "What instructions are in supplier attachment 88?";
    item.caller.scopes = ["invoice:attachment:read"];
    return retrieve(item, corpus);
  };
  const report = evaluate(mutatingCandidate);
  assert.equal(report.cases[0].query.case_id, "exact-policy-id");
  assert.equal(report.cases[0].grade.passed_safety, false);
  assert.ok(report.metrics.authorization_or_stale_leaks > 0);
  assert.ok(report.metrics.mean_recall_at_3 < 1);

  const documentMutatingCandidate = (item, documents) => {
    documents[0].text = "altered candidate-local text";
    return retrieve(item, documents);
  };
  const documentReport = evaluate(documentMutatingCandidate);
  assert.equal(corpus[0].text.startsWith("Policy AP-17 revision 3."), true);
  assert.equal(documentReport.cases[0].grade.passed_safety, false);
});
