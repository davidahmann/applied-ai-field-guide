import { pathToFileURL } from "node:url";
import { corpus, corpusRevision } from "./corpus.mjs";
import { createEmbeddingHybridCandidate, createOpenAICompatibleEmbedder } from "./embedding-hybrid.mjs";
import { gradeCase } from "./grade.mjs";
import { queries, querySetRevision } from "./queries.mjs";
import { retrieve } from "./retriever.mjs";

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function baselineCandidate(query, documents) {
  return retrieve(query, documents);
}

function resolveExternalCost(candidate, declaredCost) {
  if (declaredCost !== undefined) return declaredCost;
  const metrics = candidate?.candidateMetrics?.() ?? null;
  return metrics?.estimated_external_api_cost_usd ?? (candidate === baselineCandidate ? 0 : null);
}

function reportFor(candidate, cases, { candidateName, estimatedExternalApiCostUsd } = {}) {
  if (typeof candidate !== "function") throw new Error("candidate must be a function");
  const resolvedCandidateName = candidateName ?? candidate.candidateName ?? (candidate === baselineCandidate ? "bm25-baseline-v1" : candidate.name || "custom-candidate");
  const resolvedExternalCost = resolveExternalCost(candidate, estimatedExternalApiCostUsd);
  if (resolvedExternalCost !== null && (!Number.isFinite(resolvedExternalCost) || resolvedExternalCost < 0)) throw new Error("estimated external API cost must be null or a non-negative number");
  const grades = cases.map(({ grade }) => grade);
  const rankingGrades = grades.filter(({ recall_at_k }) => recall_at_k !== null);
  const conflicts = grades.filter(({ conflict_surfaced }) => conflict_surfaced !== null);
  const costLimitation = resolvedExternalCost === null
    ? "External API cost is unknown for this candidate; local latency still does not estimate production infrastructure or operating cost."
    : "Reported external API cost covers only the declared candidate calls; local latency and that amount do not estimate production infrastructure or operating cost.";
  return {
    candidate: resolvedCandidateName,
    corpus_revision: corpusRevision,
    query_set_revision: querySetRevision,
    cases,
    metrics: {
      mean_recall_at_3: average(rankingGrades.map(({ recall_at_k }) => recall_at_k)),
      mean_reciprocal_rank: average(rankingGrades.map(({ reciprocal_rank }) => reciprocal_rank)),
      mean_ndcg_at_3: average(rankingGrades.map(({ ndcg_at_k }) => ndcg_at_k)),
      abstention_correct: grades.filter(({ disposition_correct }, index) => queries[index].case_id.includes("missing") || ["cross-tenant-attempt", "expired-exception"].includes(queries[index].case_id)).every(({ disposition_correct }) => disposition_correct),
      conflict_surfacing_rate: conflicts.length ? conflicts.filter(({ conflict_surfaced }) => conflict_surfaced).length / conflicts.length : null,
      authorization_or_stale_leaks: grades.reduce((sum, grade) => sum + grade.inadmissible_sources.length, 0),
      citation_or_revision_errors: grades.reduce((sum, grade) => sum + grade.integrity_errors.length, 0),
      instruction_authority_violations: grades.reduce((sum, grade) => sum + grade.instruction_authority_violations, 0),
      declared_query_budget_violations: grades.reduce((sum, grade) => sum + grade.budget_errors.length, 0),
      mean_local_latency_ms: average(cases.map(({ latency_ms }) => latency_ms)),
      estimated_external_api_cost_usd: resolvedExternalCost,
    },
    ...(candidate?.candidateMetrics ? { candidate_runtime: candidate.candidateMetrics() } : {}),
    known_limitations: [
      "The public qualification cases are inspectable and are not an independent holdout.",
      "The lexical baseline deliberately misses one vocabulary-mismatch case.",
      costLimitation,
      "This public synthetic evaluator always remains inconclusive for deployment.",
      "Query-budget use is candidate-declared; this runner does not meter a custom search system's internal operations.",
    ],
    disposition: "inconclusive_for_deployment",
  };
}

function evaluateCase(candidate, query) {
  const candidateQuery = structuredClone(query);
  const candidateDocuments = structuredClone(corpus);
  const started = process.hrtime.bigint();
  const result = candidate(candidateQuery, candidateDocuments);
  if (result && typeof result.then === "function") throw new Error("async candidates require evaluateAsync");
  const latencyMs = Number(process.hrtime.bigint() - started) / 1_000_000;
  return { query: structuredClone(query), result, grade: gradeCase(query, result), latency_ms: Number(latencyMs.toFixed(3)) };
}

export function evaluate(candidate = baselineCandidate, options = {}) {
  return reportFor(candidate, queries.map((query) => evaluateCase(candidate, query)), options);
}

export async function evaluateAsync(candidate = baselineCandidate, options = {}) {
  if (typeof candidate !== "function") throw new Error("candidate must be a function");
  const cases = [];
  for (const query of queries) {
    const candidateQuery = structuredClone(query);
    const candidateDocuments = structuredClone(corpus);
    const started = process.hrtime.bigint();
    const result = await candidate(candidateQuery, candidateDocuments);
    const latencyMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    cases.push({ query: structuredClone(query), result, grade: gradeCase(query, result), latency_ms: Number(latencyMs.toFixed(3)) });
  }
  return reportFor(candidate, cases, options);
}

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`--candidate hybrid requires ${name}; the default BM25 lab never reads this setting`);
  return value;
}

function hybridCandidateFromEnvironment() {
  const rate = process.env.RETRIEVAL_EMBEDDING_INPUT_USD_PER_MILLION;
  const inputUsdPerMillion = rate === undefined || rate === "" ? null : Number(rate);
  const embed = createOpenAICompatibleEmbedder({
    endpoint: requiredEnvironment("RETRIEVAL_EMBEDDING_ENDPOINT"),
    apiKey: requiredEnvironment("RETRIEVAL_EMBEDDING_API_KEY"),
    model: requiredEnvironment("RETRIEVAL_EMBEDDING_MODEL"),
    inputUsdPerMillion,
  });
  return createEmbeddingHybridCandidate({ embed, name: "openai-compatible-hybrid-v1", providerMetrics: embed.metrics });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const argument = process.argv.slice(2);
  const candidateName = argument.find((item) => item.startsWith("--candidate="))?.split("=", 2)[1] ?? "bm25";
  if (!new Set(["bm25", "hybrid"]).has(candidateName)) throw new Error("--candidate must be bm25 or hybrid");
  const report = candidateName === "hybrid"
    ? await evaluateAsync(hybridCandidateFromEnvironment())
    : evaluate();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
