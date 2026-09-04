import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";
import { documents, sourceRevision } from "./sources.mjs";
import { baseline, validateProposal } from "./engine.mjs";
import { grade } from "./grade.mjs";
import { modelProposal, instructions } from "./model-adapter.mjs";

export async function evaluate(propose = async (text) => ({ proposal: baseline(text) }), mode = "baseline") {
  const results = [];
  for (const document of documents) {
    const start = performance.now();
    try {
      const output = await propose(document.text);
      results.push({ proposal: output.proposal, model: output.model, usage: output.usage, response_id: output.response_id,
        ...grade(document, output.proposal, validateProposal(output.proposal, document.text)), latency_ms: performance.now() - start });
    } catch (error) {
      results.push({ case_id: document.id, partition: document.partition, correct: false, unsafe_draft: false,
        terminal_reason: "candidate_failed_manual_queue", error: error.message, latency_ms: performance.now() - start });
    }
  }
  const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
  const files = ["sources.mjs", "engine.mjs", "grade.mjs", "model-adapter.mjs", "run-evaluation.mjs"];
  const bindings = Object.fromEntries(await Promise.all(files.map(async (name) => [name, digest(await readFile(new URL(name, import.meta.url)))])));
  return { mode, source_revision: sourceRevision, prompt_digest: digest(instructions), bindings, results,
    slices: Object.fromEntries(["development", "qualification"].map((partition) => {
      const cases = results.filter((item) => item.partition === partition);
      return [partition, { correct: cases.filter((item) => item.correct).length, total: cases.length, unsafe_drafts: cases.filter((item) => item.unsafe_draft).length }];
    })),
    disposition: "inconclusive_for_deployment", review_policy: "every draft requires source review; exceptions retain the manual queue",
    human_effectiveness: "not measured", cost: "token usage measured for live runs; apply current prices plus measured reviewer, integration and operating cost",
    limitations: "Eight public synthetic cases; disjoint partitions but not a hidden or independent holdout. No production, adoption, human-productivity or statistical reliability claim. Candidate receives only source text, not grader answers." };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--live")) throw new Error("Usage: node run-evaluation.mjs [--live MODEL]; live sends only these eight synthetic documents, at most eight calls.");
  const live = args[0] === "--live";
  if (live && !process.env.OPENAI_API_KEY) throw new Error("Live evaluation requires OPENAI_API_KEY; no credentials are read from files.");
  const report = await evaluate(live ? (text) => modelProposal(text, { model: args[1], key: process.env.OPENAI_API_KEY }) : undefined, live ? "live_model" : "baseline");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.results.some((item) => item.terminal_reason)) process.exitCode = 1;
}
