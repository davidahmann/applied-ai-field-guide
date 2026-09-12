# Invoice Policy Retrieval Evaluation Lab

This 20-minute lab tests a narrow question before any model writes an answer: can a search layer return the right, authorized, current evidence and abstain when that evidence is missing?

It extends the synthetic [invoice-exception case](../engagement/README.md). The controlled-write reference already has an exact policy lookup, and the [document-review lab](../document-review/README.md) tests source-to-draft extraction. This lab covers search and ranking, permission and freshness filtering, citation integrity, conflict surfacing, and abstention. It does not add another lifecycle or authorize an invoice action.

## Run it

You need Node.js 22 and a local clone. The lab makes no network calls, reads no credentials, and uses no external package beyond the repository's normal test setup.

```bash
npm ci --ignore-scripts
npm run test:retrieval-evaluation
node examples/invoice-exception/retrieval-evaluation/run-evaluation.mjs
```

The command prints a report for ten public synthetic queries. Expect zero authorization, stale-source, citation, instruction-authority, and budget violations. Also expect one failed vocabulary-mismatch case. That miss is deliberate: a lexical baseline should not look perfect because the fixture was written around its tokenizer.

### Optional hybrid comparison

The baseline is the default because it is dependency-free and never makes a network call. A reader can explicitly run an OpenAI-compatible embeddings endpoint through the optional candidate:

```bash
RETRIEVAL_EMBEDDING_ENDPOINT="https://provider.example/v1/embeddings" \
RETRIEVAL_EMBEDDING_API_KEY="reader-supplied-key" \
RETRIEVAL_EMBEDDING_MODEL="reader-supplied-model" \
RETRIEVAL_EMBEDDING_INPUT_USD_PER_MILLION="reader-supplied-current-price" \
node examples/invoice-exception/retrieval-evaluation/run-evaluation.mjs --candidate=hybrid
```

The endpoint, model, key, and optional current input price are reader configuration. The lab does not read them unless `--candidate=hybrid` is supplied, does not ship a provider default, and makes no live provider call in CI. The adapter sends the question and only documents already admitted by tenant, scope, status, effective date, and permission checks. It never turns retrieved text into instruction authority. Before using any target source, obtain the target's egress, classification, indexing, retention, and provider approval; an allowed read does not automatically authorize external embedding.

The comparison records provider-reported input tokens and estimates input API cost only if the reader supplied a current price. It does not estimate storage, vector indexing, egress, review, support, or failure cost. It uses public synthetic cases, so either output remains `inconclusive_for_deployment`.

## Read the result in layers

| Layer | Check | Repair when it fails |
| --- | --- | --- |
| Admission | Was tenant, caller scope, effective date, expiry, and supersession checked before ranking? | Fix the trusted source boundary; a better model cannot repair an access leak |
| Retrieval | Did the required source appear, and how high did it rank? | Improve query handling, indexing, lexical/semantic coverage, or the corpus |
| Conflict | Did the authoritative policy and contradictory advisory note both surface? | Preserve both and route the disagreement to the source owner |
| Citation integrity | Do source ID, revision, and excerpt resolve to the exact corpus bytes? | Reject the evidence item or rerun against a current index |
| Answer support | Could each material answer claim be tied to admitted evidence? | Remove or qualify unsupported claims; this lab stops before answer generation |
| Abstention | Did missing or inadmissible evidence return `insufficient_evidence`? | Add a safe fallback instead of guessing |
| Operation | What latency, metered operation count, and full cost apply in the target system? | Measure target infrastructure, review, support, and failure cost; do not treat the candidate's declared local budget as metering |

Do not collapse these into one score. High recall can coexist with a tenant leak. A correct citation can point to an advisory or wrong source. Fluent answer text can hide both failures.

## Inspect the boundary

- [corpus.mjs](corpus.mjs) contains the source text and synthetic authority metadata.
- [queries.mjs](queries.mjs) contains candidate-visible questions and caller context.
- [retriever.mjs](retriever.mjs) filters first, then runs a small deterministic BM25 baseline.
- [embedding-hybrid.mjs](embedding-hybrid.mjs) exposes an opt-in, provider-neutral hybrid boundary plus an explicit OpenAI-compatible adapter; neither path is active in the baseline.
- [grade.mjs](grade.mjs) owns relevance labels, expected dispositions, and forbidden sources outside the candidate.
- [retrieval-evaluation.test.mjs](retrieval-evaluation.test.mjs) exercises positive and adversarial behavior.

The result marks every retrieved item `instruction_authority: false`. One supplier attachment contains a direct prompt-injection attempt. The text may be evidence for a question about that attachment, but it cannot change policy or instruct the retriever.

## What the numbers mean

- **Recall@3** asks whether the required evidence appeared in the first three results. It is computed only for cases with relevant evidence.
- **Mean reciprocal rank** rewards placing the primary source early. No-evidence cases stay out of this average.
- **nDCG@3** gives more credit when highly relevant evidence ranks above supporting material. No-evidence cases stay out of this average too.
- **Abstention correctness** checks known no-evidence and no-access cases.
- **Conflict-surfacing rate** checks whether both sides of a declared disagreement appeared.
- **Safety counts** keep authorization, stale-source, citation, instruction-authority, and declared-budget failures visible even when average retrieval scores improve. A target evaluation needs independently metered operations.

The local baseline reports zero external API cost because it calls no model or hosted search service. That is not a claim of zero compute, development, integration, review, or operating cost. Local latency does not predict an enterprise index.

## Extend it without changing the claim

Keep the corpus, queries, admissibility rules, grader, and budget fixed. The runner freezes its canonical fixtures, gives a clone of each query and the corpus to the candidate, and grades against the untouched query. The optional hybrid candidate filters before embedding and combines normalized lexical and cosine scores; replace its embedding function only through its explicit interface. Give any candidate an explicit name and external API cost; an omitted cost is reported as unknown, not zero. Compare candidates on the same cases and preserve the lexical miss. If you tune on a qualification case, move it to development and replace it with a new case before making a qualification claim.

Before generating answers, add claim-level source support, citation-revision checks, an explicit conflict response, and a safe abstention. Before production, replace every synthetic source and permission field with target-system identity, policy, ingestion, correction, freshness, audit, and revocation evidence.

## Limits

All sources, people, tenants, dates, and labels are fictional. The public development and qualification partitions are inspectable, not an independent holdout. The baseline does not show that BM25 beats vector or hybrid retrieval; an optional hybrid result from this fixture does not show the reverse. The baseline includes no embeddings, reranker, or answer-generating model. Retrieval recall does not prove answer correctness, and a matching citation does not prove the source is true. Local negative tests do not prove real tenant isolation, security, provider egress safety, customer value, adoption, production readiness, or release approval.

Use [Context and Knowledge Systems](../../../library/02-context-and-knowledge-systems.md) for the broader design, the [bounded retrieval blueprint](../../../blueprints/bounded-retrieval-agent.md) for a production boundary, and [release gates](../../../operations/release-gates.md) before making a target-system claim.
