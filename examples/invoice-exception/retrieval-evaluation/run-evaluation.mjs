import { pathToFileURL } from "node:url";
import { corpus, corpusRevision } from "./corpus.mjs";
import { gradeCase } from "./grade.mjs";
import { queries, querySetRevision } from "./queries.mjs";
import { retrieve } from "./retriever.mjs";

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function baselineCandidate(query) {
  return retrieve(query, corpus);
}

export function evaluate(candidate = baselineCandidate, { candidateName, estimatedExternalApiCostUsd } = {}) {
  if (typeof candidate !== "function") throw new Error("candidate must be a function");
  const resolvedCandidateName = candidateName ?? (candidate === baselineCandidate ? "bm25-baseline-v1" : candidate.name || "custom-candidate");
  const resolvedExternalCost = estimatedExternalApiCostUsd ?? (candidate === baselineCandidate ? 0 : null);
  if (resolvedExternalCost !== null && (!Number.isFinite(resolvedExternalCost) || resolvedExternalCost < 0)) throw new Error("estimated external API cost must be null or a non-negative number");
  const cases = queries.map((query) => {
    const candidateQuery = structuredClone(query);
    const started = process.hrtime.bigint();
    const result = candidate(candidateQuery);
    const latencyMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    return { query: structuredClone(query), result, grade: gradeCase(query, result), latency_ms: Number(latencyMs.toFixed(3)) };
  });
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.stdout.write(`${JSON.stringify(evaluate(), null, 2)}\n`);
}
