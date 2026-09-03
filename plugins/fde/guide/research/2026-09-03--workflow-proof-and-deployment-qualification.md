# Workflow Proof and Deployment Qualification

Reviewed: 2026-09-03

This note records two complementary signals: a formal method for qualifying a human-AI operating policy and a practitioner account of turning a candidate workflow into a bounded proof. The portable lesson is narrower than either source: a proof should produce a decision, and any deployment claim should cover the complete operating policy rather than autonomous model performance alone.

<a id="r26-85"></a>
## R26-85 — READY: qualify the complete human-AI operating policy

- **Source:** [READY or Not: Reliable Enterprise Agent Deployment](https://arxiv.org/abs/2609.02095), Scale AI research preprint, published 2026-09-02
- **Evidence type:** Research preprint with a stated method, open testbed, and retrospective clinical-audit case study across 16 agent systems and 750 cases
- **Finding:** Agent accuracy alone does not establish a deployable operating point. READY selects an oversight policy using development evidence, freezes it, and qualifies the resulting human-AI system on disjoint held-out cases against workflow reliability, risk, review burden, and cost. A point estimate above target is insufficient; the lower confidence bound must clear the target under the stated sampling assumptions.
- **Portable pattern:** Define workflow success and the candidate oversight-policy class; preserve separate development and qualification partitions; state the sampling unit and dependence; bind the frozen policy and routing signal; measure autonomous coverage, reviewer burden, reviewer effectiveness, latency, and total operating cost; then qualify the complete operating point. Reuse terminal trajectories only when oversight cannot change the trajectory. If intervention changes subsequent execution, rerun or simulate the policy in the loop.
- **Change boundary:** Re-scoring saved evidence may be valid for a changed terminal evaluator or target when all required inputs remain observable. A changed agent, context, tool, environment, trajectory-dependent policy, or eligible population normally requires fresh execution before requalification.
- **Caveat:** This is a preprint, not an independently reproduced production standard. Its empirical case is retrospective clinical audit with terminal accept-or-escalate routing; the reported target, cases, systems, confidence method, review assumptions, and operating points are not Guide defaults. In the case study, human review effectiveness includes an assumption rather than observed production reviewer performance. Qualification does not replace security, privacy, legal, data, adoption, service-ownership, or release gates.

<a id="r26-86"></a>
## R26-86 — Practitioner proof loop: participation, baseline, and decision-yielding work

- **Source:** Full first-party post text supplied by Mark Ajzenstadt (`@mardehaym`) without a stable permalink or publication date; reviewed 2026-09-03
- **Evidence type:** Practitioner field account with self-reported customer examples, operating recommendations, survey claims, commercial terms, timelines, and outcomes
- **Finding:** The account treats a proof as a short decision instrument rather than a miniature transformation program. It asks the sponsor, process owner, data owner, operators, and metric owner to contribute evidence and decisions; fixes the baseline before building; and expects material work to yield a decision, a tested assumption, a working increment, or a reusable asset.
- **Portable pattern:** Before a proof, name required participants, their decision rights, evidence contributions, availability, delegates, and the stop or escalation path when capacity is missing. Have the metric owner and verifier acknowledge the baseline revision, disputes, and rebaseline triggers. Maintain a lightweight proof-work ledger whose outputs are decisions, tested assumptions, working increments, or sanitized reusable learning. When reusing context, harness, hosting, governance, or another governed artifact, bind the exact prior version and revalidate it for the new target.
- **Caveat:** The proposed sequence, private-equity framing, five lenses, ten steps, seven-rung ladder, interview order, fixed durations, staffing, pricing, time commitments, percentages, and customer outcomes are not independently verified or universal requirements. “Sign the baseline” means an explicit governed acknowledgment appropriate to the engagement; it is not legal advice or a substitute for contracting. Reusable learning still requires confidentiality, rights, target validation, and ordinary release governance.

## Repository impact

| Area | Change | Deliberately unchanged |
| --- | --- | --- |
| Evaluation report | Optional deployment-qualification record for the exact policy, evidence split, sampling, reliability bound, review path, burden, cost, and requalification triggers | Existing evaluation lifecycle, decision vocabulary, and non-agent evidence routes |
| Evaluation and release guidance | Qualify the complete human-AI policy; distinguish terminal replay from trajectory-dependent rerun; require evidence-backed reviewer assumptions | No universal reliability target, policy optimizer, confidence method, or review percentage |
| Delivery and adoption | Participant-capacity contract, baseline acknowledgment, and proof-work output ledger | No fixed proof duration, staffing model, or commercial offer |
| Change and reuse | Component-sensitive requalification plus exact-version, prior-scope, target revalidation | Reuse does not transfer authority or bypass target gates |
| Skills and plugin | Existing evaluation, delivery, readiness, and operating routes surface these checks | No new skill, module, maturity ladder, or control family |

## Decision

Adopt the operating mechanics through the Guide's existing artifacts and controls. Keep the sources' named frameworks and commercial prescriptions as attributed evidence rather than new Guide doctrine.
