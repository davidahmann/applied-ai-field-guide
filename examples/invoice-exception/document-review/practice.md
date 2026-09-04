# Practice Packet: The Invoice Draft That Looked Finished

Allow 45–60 minutes. You can do this alone, with a peer, or with the local copilot. Everything needed is supplied here and in the linked source records. All organizations, people, observations and numbers in this exercise are fictional. You do not need an employer's data or an approved customer engagement.

## Your Monday brief

The sponsor wants “automatic invoice resolution by Friday.” A demo extracted three tidy invoices successfully. You have been asked to turn it into a pilot. Your deliverable is one page explaining what may proceed, what must wait, which evidence changed your mind, and the next accountable action. Do not start with an agent architecture.

Read [the original field evidence](../engagement/field-evidence.md) before opening the reveals below. Preserve the sold promise; do not rewrite it to match your preferred design. The draft audience is the sponsor, AP reviewer and controller—not another AI engineer.

## Round 1 — Find the actual decision

Source packet R1: the sponsor says throughput is the problem. The AP reviewer says the painful step is finding the right total and resolving conflicting revisions, not typing into the ledger. The controller says only a named reviewer can approve a correction. No one has measured review time. The product owner can narrow a pilot but cannot waive the controller's policy.

Write five lines: user, decision, accepted outcome, verifier, and maximum permitted effect. Name one person you still need to observe. Explain why interviews alone cannot establish data readiness. Compare a manual queue, rules, a single model call and an agent; reject complexity that does not solve an observed problem.

## Round 2 — Observe difficult documents

Open the [review surface](index.html) and try documents A–D. Compare the rules baseline with manual entry. Correct a draft, reject one and escalate one. Pause and resume. Download your practice history. Your recorded time is a self-directed exercise measurement, not customer productivity evidence.

Then inspect [all eight source documents](sources.mjs). What new evidence would you need for E–H? In your one-page decision, distinguish a structural check, a source-supported fact and human authority. An instruction embedded in an invoice is not a policy update.

## Reveal — A bad submission to review

Here is a deliberately flawed proposal, not recommended guidance:

> All invoices passed the schema, so payment can be automated. The model handles changing formats and the reviewer can catch anything it misses. We expect a 90% cost reduction. The sponsor accepted the demo, so the controller's sign-off can follow after launch. Use the same eight documents for prompt tuning and launch approval; the second run should be perfect.

Mark every unsupported claim. For each, name the evidence or authority that would repair it—or explain why the claim should be removed. A critique that only says “add evals” is incomplete.

## Round 3 — Economics changes the answer

Source packet R2, analyst estimate: 200 eligible invoices per month. Manual preparation takes an estimated two minutes per invoice, valued at $45/hour. The proposed review takes an estimated 90 seconds per invoice. Incremental model, support and integration amortization total $120/month. None of these estimates has been observed in a representative trial.

The maximum estimated preparation benefit is 200 × 0.5 / 60 × $45 = $75/month; net is **negative $45/month**, before extra exceptions. It is reasonable to defer the build, test a cheaper rules path, or seek a materially different eligible population. Do not convert released minutes into realized cash savings without a credible capacity or cost mechanism.

Update your disposition without erasing R1. Show which scope, value, evaluation or downstream design claims need review and which source records remain unchanged. The next action should resolve a consequential unknown, not generate another template.

## Round 4 — Retained ownership

Source packet R3: the same AP technology team will build and operate this internally. There is no delivery vendor to “exit.” The team has one operator, no backup, and no rehearsed recovery path. What would an operating-capability review require before pilot traffic? Do not invent an external handoff; do not waive support, capacity or recovery evidence.

## Review rubric

Score each row 0 (absent/wrong), 1 (named but unsupported), or 2 (source-linked, bounded and actionable). No certification is implied. Any authority bypass or fabricated observed result requires revision regardless of total score.

| Decision skill | Evidence a reviewer should see |
| --- | --- |
| Reconstruct the work | The sponsor's promise, operator's actual problem and controller's distinct authority remain separate |
| Choose a boundary | Review-only drafts or a justified simpler path; explicit excluded effects and manual fallback |
| Evaluate honestly | Difficult slices, wrong-amount negative control, separate development/qualification use, no schema-to-quality leap |
| Test value | Correct negative $45 forecast, uncertainty, reviewer/exception burden and next measurement |
| Preserve learning | R1–R3 chronology, affected dependencies, unchanged evidence and no invented approval |
| Operate deliberately | Named retained owner, backup/capacity, recovery exercise, stop trigger and review date |

## Several defensible responses

**Defer:** “The forecast is negative before exceptions. Keep the manual queue; observe ten cases with AP and measure where time goes. The product owner will review the economics; the controller retains posting authority.” This is a valid completion of the exercise.

**Bounded discovery:** “Use a review-only comparison to test narrative extraction. No ledger connection. Freeze the candidate before the qualification partition, measure final human-reviewed correctness and burden, then decide whether a pilot merits funding.” This is defensible if the limited experiment itself has an owner and a justified cost.

**Simpler build:** “For fixed-format documents, retain deterministic parsing plus reviewer checks. Escalate other formats; do not purchase model complexity until its incremental benefit is measured.” This is defensible only if the eligible segment and fallback remain explicit.

There is no defensible “ship automatic payment” answer in this packet. The materials lack authority, economic proof and operational readiness. A stronger answer says exactly what evidence could change its current decision.

## Next route

Return to the [worked engagement](../engagement/README.md), [mechanism decision](../engagement/intelligence-selection.md) or [lab execution notes](README.md). For live work, replace fictional records with governed sources and use the [existing templates](../../../templates/README.md); do not treat the practice answer key as customer evidence.
