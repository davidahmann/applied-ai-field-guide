# Invoice Document Review Lab

The existing invoice reference tests controlled writes. This optional upstream lab tests a different question: can a proposed business record survive source checking and operator correction? It extends the [same worked engagement](../engagement/README.md); it does not replace its charter or authorize posting.

No customer access is needed. Start with the [self-contained practice packet](practice.md), then [open the review surface](index.html). In a clone, serve the repository with a static server bound to loopback, for example `python3 -m http.server 8123 --bind 127.0.0.1`, and open `/examples/invoice-exception/document-review/`. Do not open the HTML as a local file: module imports require HTTP. Stop the server when finished; serve only a clean public clone, never a directory containing customer files or credentials.

## First run in 15 minutes

**Prerequisites:** Node.js 22, npm, and a local clone. The default path is offline and sends nothing to a model provider.

1. Run `npm ci --ignore-scripts` from the repository root.
2. Run `npm run test:document-review` and confirm all negative controls pass.
3. Run `node examples/invoice-exception/document-review/run-evaluation.mjs`.
4. Find the wrong-amount test: the proposal is structurally valid, but the independent source grader rejects it.
5. Serve the clone on loopback, open the review page, correct one proposal, and export the local practice history.

The exercise should leave you with a baseline report, one visible failure, one human correction, and a clear boundary between record shape, source correctness, and approval authority. It does not require an API key. The optional live comparison below adds provider cost and should use only the built-in synthetic documents.

## Boundary and mechanism decision

The user is an accounts-payable reviewer. The accepted practice outcome is a source-supported invoice draft or a justified return to the manual queue. Posting, payment, supplier contact, policy changes, identity management and customer data are excluded. The fictional controller retains posting authority. The manual queue is the fallback.

| Step | Smallest sufficient mechanism | Why and limit |
| --- | --- | --- |
| Extract fixed labels | Regular expressions, baseline v1 | Cheap and inspectable; fails on narrative wording and revisions |
| Interpret variable wording | Optional single model call | Compare against the baseline; no tools, agent loop, graph or retrieval engine |
| Validate record shape and source quote | Deterministic code | Rejects malformed fields and invented quotes; cannot prove a quoted amount is the correct amount |
| Resolve contradictions and accept a draft | Human source review | Requires identity, currency, amount and revision checks; a schema pass is insufficient |
| Post to the ledger | Not implemented | Use the separate controlled-write reference and target-system authority; never connect this page directly to payments |

The domain is deliberately small: source document and revision, proposal, review decision, and practice history. The browser stores only local practice records. Imported model output is untrusted; it cannot execute HTML, call tools or authorize an effect. A decision is terminal for the currently loaded case; reloading a case starts a new attempt and preserves prior history. Pause retains fields. Reject and escalate remain available without accepting an invalid record. Storage failures tell the user to export rather than claim persistence. `ARC-004`, `ARC-005`, `HUM-001`, `HUM-002`.

## Run and compare

From the repository root:

```bash
npm run test:document-review
node examples/invoice-exception/document-review/run-evaluation.mjs
```

The default runs the real fixed-label baseline offline against eight fictional documents. It does **not** replay a made-up model score. Four development and four qualification cases cover plain labels, prose, unresolved totals, credit notes, instruction injection, missing currency, unreadable OCR and superseded estimates. Inspect [sources](sources.mjs), [candidate and validation](engine.mjs), and the separate [grader](grade.mjs).

For a live comparison, select a structured-output-capable model and set `OPENAI_API_KEY` in your shell. The command below sends **only the eight built-in public synthetic documents** to OpenAI, with no retries, eight calls maximum, a 30-second limit per call and 1,200 output tokens per response. It does not read environment files or accept customer documents. Provider charges apply; check current prices before choosing the model. Capture stdout to a file outside the repository if you want to import the report into the browser.

```bash
node examples/invoice-exception/document-review/run-evaluation.mjs --live YOUR_MODEL_ID
```

The adapter uses the [Responses API structured-output format](https://platform.openai.com/docs/guides/structured-outputs), inspected 2026-09-04. Model refusal, incomplete output, HTTP failure and timeout produce a failed case with the manual-queue terminal reason. Validation remains in trusted code after the response. A schema-constrained response is not a correctness guarantee.

The run log binds source, prompt, candidate and grader bytes; it records per-case correctness, unsafe drafts, latency and live token usage. Keep failed outputs. Do not tune on qualification cases and still call them an unseen holdout. These public partitions are inspectable teaching data, not independent qualification evidence. Neither an 8/8 run nor repository CI establishes population accuracy. `EVA-001`, `EVA-002`, `EVA-003`, `EVA-006`.

### Worked interpretation of a perfect small run

Suppose a candidate gets 8 of 8 cases right. The observed rate is 100%, but the sample is tiny. Under an optimistic assumption that the cases are independent and representative, a two-sided 95% Wilson interval has a lower bound of about 68%. The result is compatible with a much weaker population rate than “nearly perfect.”

The assumption is also doubtful here: the cases are public, curated by one maintainer, and share one narrow invoice pattern. Their errors may be correlated, and a developer can inspect every expected result. Report “8/8 on this named fixture revision,” then inspect slice failures, repeat stochastic candidates, measure reviewer corrections and cost, and gather target cases from the real eligible population. Do not turn 8/8—or [a self-reported 59/60 result](../../../research/2026-08-18--healthcare-claims-context-and-evaluation.md)—into a deployment guarantee.

## Measure the operator, not just the extractor

Try manual entry and proposals in counterbalanced order with different but comparable cases. Record source-reading time, field edits, escalations, abandoned attempts, corrections missed by the reviewer and final record accuracy. The browser exports elapsed time and edit events; elapsed time includes idle time and is **not** measured savings. Browser storage and imported reports are editable, unverified practice data, not immutable production audit evidence.

Calculate cost per accepted draft using current model prices, observed reviewer time, rework, exception handling, integration and ongoing support. The complete engagement's existing value case is a forecast, not the result of this exercise. If human review costs erase the benefit, keep manual entry or the rules baseline. Do not count escalation as a completed invoice.

## Threats, checks and open proof

| Failure | Prevention and detection | Recovery / executable check |
| --- | --- | --- |
| Invoice text attempts to authorize payment | No payment tool; outputs are data, never instructions | Retain manual authority; injection case and forbidden-field test |
| Plausible but wrong amount | Source shown beside draft; exact quote and field checks | Correct or escalate; wrong-amount negative control must fail the grader |
| Missing or conflicting source | Explicit escalation policy | Manual queue; missing-currency, OCR and conflict cases |
| Invalid or oversized imported report | Local size and source-revision checks; no execution | Reject import and keep prior state; browser tests |
| Duplicate click, pause or storage failure | Terminal decision state; disabled controls; visible save status | Export history; review-state and browser checks |

This is an experimental learning extension, not a deployable service or a model/agent release bundle. A production version still needs target authentication, tenant isolation, permissioned sources, durable state, tamper-evident audit, source freshness, validated model behavior, representative human trials, capacity, operating ownership and the [release gates](../../../operations/release-gates.md). Keep development-run logs separate from the canonical [evaluation report](../../../templates/evaluation-report.json) and [solution release](../../../templates/solution-release.json) required for a real model release. The candidate model has no filesystem or grader access; repository maintainers can inspect both, so this is not evaluator isolation against a malicious developer.
