# Decision Models, Failure Localization, and Decision Learning

Reviewed: 2026-09-23. Review again by 2026-12-23, or sooner if Jev's model contract, retention terms, or independent evidence changes.

These sources address different decisions. A typed decision model may be a cheap component or scorer. A turn-level evaluation can help locate a failure. A human override can reveal a missing rule or an unauthorized workaround. None of the three grants action authority or proves that the workflow improved.

<a id="r26-88"></a>
## R26-88 — TypeSafe Jev: typed judgments with narrow task limits

- **Sources:** [TypeSafe launch](https://typesafe.ai/blog/introducing-system-one-models-and-jev), 2026-09-15; [Jev 1.13 limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13), reviewed by TypeSafe 2026-09-17.
- **Evidence type:** First-party launch, vendor workflow comparisons, and published product limitations; not independent business-outcome evidence.
- **Finding:** Jev accepts state and bounded questions and returns typed choices or scores without generating prose. TypeSafe reports latency and cost advantages on its own workflow comparisons. Its documentation also warns about numeric precision, date comparisons, irrelevant context, adversarial state, contradictory criteria, and assumptions that probabilities from differently worded questions obey arithmetic identities.
- **Portable test:** For one consequential decision, compare a deterministic rule, a conventional classifier where suitable, a compact structured-output model, and a decision-only model on the same source-bound cases. Tune each threshold on development data, then hold it fixed for disjoint cases. Compare false negatives and positives by risk slice, calibration and abstention, reviewer burden, latency, full workflow cost, provider retention, and fallback. Keep arithmetic, authorization, and effects in trusted software.
- **Caveat:** Schema-conformant output is not a correct decision. TypeSafe's headline speed and cost multipliers come from vendor-designed tasks using frontier-model answers as a reference, not an independently established business truth. Do not transfer a threshold between question types or treat a probability as permission. No Guide default or release gate changes on this evidence.

<a id="r26-89"></a>
## R26-89 — LangChain Jev-as-judge: repeatability is not broad accuracy

- **Sources:** [Jev-as-a-Judge evaluation](https://www.langchain.com/blog/jev-agent-evals-langsmith), 2026-09-20; [LangSmith integration and retention note](https://www.langchain.com/blog/jev-is-now-available-in-langsmith-evals), 2026-09-21.
- **Evidence type:** First-party integration experiment with published setup and code; five fixed weather-agent responses, one human reference reviewer, and 100 repetitions per case.
- **Finding:** Jev agreed with that reviewer on the five binary cases across repeated judgments and showed low score variance in this experiment. Repetition measures stability on those inputs; it does not test generalization to new workflows or establish the human labels as infallible. LangChain states that TypeSafe did not then offer zero data retention for submitted evaluation material.
- **Portable test:** Compare candidate judges with source-bound, independently adjudicated cases outside the development set. Check disagreement and false negatives in high-consequence slices, not only mean score, variance, speed, or price. Apply classification, purpose, retention, and egress policy before sending traces to a provider. A scorer may route review; it does not approve an effect, certify completion, or change an evaluator or production rule.
- **Caveat:** One weather-agent test and vendor integration are not evidence that Jev is the preferred judge for financial, clinical, security, or other consequential work. Provider terms and behavior can change; recheck them before use.

<a id="r26-90"></a>
## R26-90 — AWS multi-turn evaluation: find the first wrong step

- **Source:** [Agent Evaluation Metric for multi-turn conversations](https://aws.amazon.com/blogs/machine-learning/agent-evaluation-metric-for-multi-turn-conversations/), AWS, 2026-09-10.
- **Evidence type:** First-party technical method and worked examples; the published first dimension addresses correctness.
- **Finding:** An early wrong tool parameter or response can make later turns wrong even if they follow from the bad state. A final failure score alone does not distinguish the initiating defect from inherited effects.
- **Portable pattern:** On a failed trace, identify the earliest observable state, source, tool, policy, or response deviation; link later effects to it and mark the origin unknown when evidence is incomplete. Turn the owning defect into a replay case and verify the external outcome separately.
- **Caveat:** The proposed composite metric is not a Guide release threshold. Turn attribution may be disputed or impossible with incomplete telemetry, and correcting one step does not by itself establish that the workflow succeeds.

<a id="r26-91"></a>
## R26-91 — UiPath Map of Work: reasoned overrides as candidate learning

- **Sources:** [Daniel Dines's Map of Work post](https://www.uipath.com/blog/product-and-updates/map-of-work-uipath-cartographer) and [UiPath Cartographer announcement](https://www.uipath.com/newsroom/uipath-launches-uipath-cartographer-map-of-work), 2026-09-23.
- **Evidence type:** First-party vendor thesis and product announcement. Cartographer was announced; the Decision Ledger and full learning loop were described as preview or roadmap work, not independently verified production outcomes.
- **Finding:** A repeated approval says what happened, but often not why. A decision record that preserves the proposal, source evidence, applicable policy, named reviewer, stated reason, and later outcome can help an owner investigate whether the rule, guidance, or observed behavior should change.
- **Portable pattern:** Collect only purpose-bound consequential decisions in the owning organization's approved record. Sample reasons alongside counterexamples and eligible denominators. An operator may challenge the interpretation; the workflow or policy owner decides whether to clarify guidance, change executable behavior through the normal release path, preserve a bounded exception, or reject the candidate learning.
- **Caveat:** A stated reason can be mistaken or self-serving; repeated workarounds do not become policy through frequency. Do not require an enterprise-wide map, a new ledger platform, or wholesale capture of employee judgment. Keep the expert's time, challenge rights, confidentiality, and ongoing stewardship explicit.

## Repository decision

Add a bounded mechanism-comparison recipe, first-divergence diagnosis, and reasoned human-decision review to existing artifacts. Keep the workflow charter, operational ontology, telemetry, field-learning record, evaluation, release, and service-review boundaries separate. No new control family, lifecycle stage, decision database, or Jev endorsement follows from these sources.
