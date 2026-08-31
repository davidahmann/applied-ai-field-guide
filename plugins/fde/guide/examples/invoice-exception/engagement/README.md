# Worked Engagement: When the Sold Brief Cannot Ship

This synthetic engagement connects the field work, value decision, system boundary, evaluation, adoption plan, handoff, and service review for the invoice-exception reference. Read it in order. Each artifact states what the fixture demonstrates and what a customer would still need to prove.

## Ten-minute walkthrough

You do not need to read the repository first. Use this as a short decision trail:

| Minute | Open | Look for |
| ---: | --- | --- |
| 0–2 | [Field evidence](field-evidence.md) | The sold promise, one observed case, the policy conflict, and the role allowed to decide |
| 2–4 | [Engagement reframe](engagement-reframe.json) | Preserved history, a narrower proposal, the human disposition, and unchanged downstream state |
| 4–6 | [Value case](value-case.md) and [intelligence selection](intelligence-selection.md) | What must be true economically and why the fixture keeps deterministic policy plus human approval |
| 6–8 | [Reference system](../README.md) and [evaluation report](../evaluation-report.json) | Staging, authorization, effect receipt, readback, and the exact limits of five passing cases |
| 8–10 | [Adoption and handoff](adoption-and-handoff.md) and [evidence review](service-review.md) | Why the next decision is review-only, which exercises are missing, and the next field move |

Validate the governed reframe while you read:

```bash
npm run validate:artifact -- examples/invoice-exception/engagement/engagement-reframe.json --profile complete
```

At ten minutes, you should be able to explain why the original brief cannot ship, which bounded path may continue, what the implementation actually proves, and what evidence is still missing. The packet is synthetic teaching evidence, not a customer claim.

## The situation

The sold brief promised automatic resolution and posting of eligible invoice exceptions. One observed case, the current controls policy, and the current-build behavior all showed a different boundary: a designated accounts-payable reviewer must approve a staged correction before it is posted.

That contradiction changes the product. It is not a prompt detail.

## Why the packet makes these choices

| Choice | Why it has this value |
| --- | --- |
| `bounded_kickoff` rather than automatic posting | The service owner can authorize a narrower engagement, but the cited policy keeps approval and posting with a designated reviewer |
| Domestic price-variance exceptions only | The single observed case sits in that segment; it cannot establish coverage for every invoice exception |
| Manual queue as the safe fallback | It is the recorded current path and does not require the unproved proposal route to succeed |
| No change to the current data-context manifest | The conflict changes workflow authority and acceptance, not the fixture's already-declared source set; target source readiness remains open separately |
| Deterministic proposal behavior in the fixture | It lets the action boundary be tested without presenting an unevaluated model recommendation as capability evidence |
| Review-only shadow candidate | Five closed deterministic cases support another bounded test, not production traffic, customer adoption, realized value, or handoff |

These are worked judgments, not universal defaults. A target engagement should change them when its sources, authority, cases, economics, or operating constraints differ.

## The evidence chain

| Step | Decision | Artifact | Evidence state |
| --- | --- | --- | --- |
| 1. Preserve and observe | What was sold, what happened, and who may decide? | [Field evidence](field-evidence.md) | Synthetic source packet; one representative case |
| 2. Reframe | Which boundary can proceed without erasing the original promise? | [Engagement reframe](engagement-reframe.json) | Structurally and semantically validated; human disposition is part of the fixture |
| 3. Test the economics | What would have to be true for the bounded slice to be worth operating? | [Value case](value-case.md) | Forecast only; no realized customer value |
| 4. Select the mechanism | Which steps need rules, retrieval, a model, or a person? | [Intelligence selection](intelligence-selection.md) | Decision rationale; fixture runtime remains deterministic |
| 5. Build and prove | Can the controlled-write boundary enforce the declared invariants? | [Reference system](../README.md) and [evaluation report](../evaluation-report.json) | Five committed deterministic cases pass in the recorded host-process environment |
| 6. Prepare adoption and transfer | What must users and the receiving team demonstrate? | [Adoption and handoff](adoption-and-handoff.md) | Predeclared plan; exercises not run |
| 7. Decide the next gate | What may happen now? | [Evidence review](service-review.md) | Continue as a review-only shadow candidate; do not deploy or hand off |

## Current decision

Proceed only with recommendation and staging for the named domestic price-variance segment. A reviewer retains approval and posting authority. The executable fixture may remain a review-only shadow candidate because its five deterministic cases pass, but it has no production traffic, customer adoption evidence, realized value, hardened sandbox evidence, or completed receiving-team exercises.

The next field move is not “add more autonomy.” It is to observe ten eligible cases, confirm the population and authority boundary, measure reviewer effort and recommendation quality, and decide whether the forecast in the value case remains plausible.

## What this example does not prove

- The synthetic observation represents a real customer population.
- A model can recommend the correct resolution at the required rate.
- Operators will use or accept the review surface.
- The forecast savings or costs will be realized.
- The in-memory runtime meets target identity, durability, audit, load, recovery, or restricted-environment requirements.
- A receiving team can operate, change, recover, support, or retire the service.

Those are open evidence obligations, not footnotes. A target engagement should replace every fixture role, source, assumption, threshold, and decision with owned evidence.
