# Product, Process, and Human Collaboration

## The agent is a mechanism, not the outcome

Organizations do not buy “agency” in the abstract. They want a faster close, a better investigation, a reliable analysis, fewer support escalations, or more shipped product. Agent design should therefore begin with the operating model and desired result, not the model or interface. [S15]

The most useful allocation rule in the source set is:

| Work type | Best default | Why |
| --- | --- | --- |
| Structured inputs, explicit rules, predictable path | Deterministic software | Cheaper, testable, and easier to govern |
| Variable path, interpretation, cross-system context | Agent | Useful judgment under bounded uncertainty |
| Accountability, deep ambiguity, trust, undefined quality | Human or human-led copilot | Consequences or standards require ownership |

This classification happens at the **step** level, not necessarily at the workflow level. A single process can use software for validation, an agent for synthesis, and a human for approval.

## Choose workflows by value and verifiability

The most painful process is not automatically the best process to automate. Candidate workflows should be compared on:

- Business value: revenue, cost, risk reduction, or strategic leverage
- Manual effort and cycle time displaced
- Frequency and volume
- Key-person dependency
- Availability and freshness of context
- Ease and cost of verifying the output
- Cost to build, integrate, govern, and maintain
- Consequence of a false positive, false negative, or unauthorized action
- Operator willingness to adopt the new workflow

The **Verifier's Rule** sharpens the decision: the cheaper and more reliable the verification, the safer it is to delegate execution. Definition checks, reconciliations, formatting, compilation, and policy validation can support more autonomy than litigation strategy, executive judgment, or relationship-sensitive decisions. [S05]

## Context extraction is discovery, product, and engineering

Forward-deployed work looks like engineering but combines three jobs: identify where to build, decide what to build, and determine how to build it. Coding is downstream of the difficult part: extracting context from fragmented people and systems, or creating explicit context where none exists. [S13]

### Observe the work as an apprentice

Operators often demonstrate a process more accurately than they describe it. A strong discovery process uses interviews, screen recordings, process traces, example artifacts, exception review, and observation of real cases. Ramp's early internal process-mining work used Loom recordings to derive workflow diagrams before its spreadsheet agent emerged. [S01]

The output should be an inspectable **knowledge tree**:

- Workflow map and handoffs
- Inputs, outputs, and systems of record
- Decision rules and approval thresholds
- Exception taxonomy and edge-case library
- Escalation paths and accountable owners
- Access policies and data boundaries
- Definition of done and evidence required
- Golden examples and evaluation cases
- Known failure modes and recovery procedures

### Separate judgment from scar tissue

Tribal knowledge contains both expertise and workarounds. If a workaround exists only because data is dirty, permissions are broken, or an old system is unreliable, encoding it can automate dysfunction. Context extraction must therefore include a redesign decision: preserve, repair, remove, or escalate each behavior. [S15]

### Modernization does not always mean migration

It is often practical to leave ERP, CRM, document, and code systems in place, connect to them, and make the work between them legible to agents. The agent deployment can then reveal which underlying components truly need rebuilding. This approach fails when it merely hides unusable data or broken authorization beneath a new interface. [S15]

## Build around the professional's native artifact

Chat is a convenient command surface but a low-bandwidth review environment. Professional work benefits from persistent artifacts that expose structure and make feedback local:

- Spreadsheets for finance models and reconciliations
- Notebooks and query cells for iterative analysis
- Tables for reviewing classifications across many records
- Documents for comments, redlines, and legal or research review
- Slides for evidence-backed narratives and decisions
- Code diffs and pull requests for engineering work

Ramp found that finance professionals preferred Excel-native manipulation and formulas over black-box Python generation. Python remained an escape hatch, but the trusted work product stayed inspectable in the spreadsheet. [S01]

Legora's argument generalizes this: as execution becomes cheap, planning and review become the bottlenecks. Persistent documents, review tables, and commentable artifacts let humans steer an agent with more precision than repeated chat turns. [S05]

Listen's Composer similarly treats document creation as an iterative human-agent edit rather than a one-shot response. Its research workflow ultimately produces structured analysis and presentation artifacts, not just conversation. [S03]

## Design the collaboration contract

A useful human-agent workflow specifies:

1. **Direction:** the human chooses the objective, priorities, and constraints.
2. **Delegation:** the agent receives a bounded task, tools, budget, and evidence target.
3. **Inspection:** intermediate state and work products remain visible.
4. **Interruption:** the human can pause, redirect, approve, or reject.
5. **Escalation:** uncertainty, policy exceptions, and exhausted retries return to an owner.
6. **Accountability:** a named person or role owns consequential output.

This model reframes experienced contributors from tactical executors to strategic programmers or directors: they scope, design systems, review evidence, make tradeoffs, and protect quality. [S12] Replit describes a similar move from “doers” to people who choose destinations and direct agent execution, though its organizational metrics are first-party claims. [S17]

For open-ended work, use a **queue of bounded tasks** rather than an infinite improvement loop. A queue is triageable, observable, reprioritizable, and easier to stop. [S12]

## Adoption is part of the product

Enterprise deployment requires two aligned value propositions:

- Executives need a measurable operating outcome.
- Operators need a safer, easier, or more rewarding workday.

Operators may reasonably fear that documenting their expertise will eliminate their role. Treating discovery as apprenticeship, involving them in evaluation, and making escalation visible builds trust and improves the system. Technical correctness without operator buy-in is not a successful deployment. [S15]

Low-friction surfaces can accelerate adoption. Replit reports that a Slack interface exposed its internal agents to non-engineering teams; teams then contributed their own skills and integrations. The lesson is not “use Slack everywhere,” but to meet users in a familiar workflow while keeping the durable artifact elsewhere. [S17]

### Start with the operator's current path

The first adoption interview should not ask, “Would you use this?” Put a recent case on the screen instead. Ask the operator to show where it arrived, what they opened, which evidence they trusted, where they hesitated, what they changed, who they asked, and how they knew the work was finished. Record the current artifact, wait states, workarounds, recovery path, and time spent.

Now place the proposed surface beside that case. What disappears from the operator's workday? What new judgment, verification, or support burden appears? If the system saves the sponsor time by making the operator's job slower, more anxious, or less legible, “resistance” may be a correct product signal.

### Measure the path, not registrations

Adoption is a funnel over eligible work:

```text
eligible workflow opportunity
  -> exposed in the usable surface
  -> completed or explicitly dispositioned
  -> independently accepted
  -> verified business effect
  -> sustained after guardrails and full cost
```

Each break points to a different problem:

| Observed break | First question | Likely owning work |
| --- | --- | --- |
| Eligible work is not exposed | Did routing, access, integration, or data readiness exclude it? | Integration, identity, instrumentation, or segment definition |
| Exposed work is abandoned | Is the surface slow, confusing, badly timed, or missing a safe action? | Product flow, training, workflow placement, or fallback |
| Work is completed but rejected or heavily edited | Is the evidence insufficient, the behavior wrong, or the policy boundary unclear? | Context, mechanism, evaluation, or authority |
| Accepted work produces no measurable effect | Did the workflow target the wrong bottleneck or use a weak baseline? | Product thesis, value model, or outcome instrumentation |
| Accepted value is real but queues or support load grow | Did reviewer and service capacity become the constraint? | Operating model, staffing, limits, or scope |

Registered users, logins, prompts, and runs cannot locate those breaks. Before a pilot, freeze the eligible denominator, exclusions, baseline, target, guardrails, window, event/query revisions, and accountable owner. Instrument exposure, completion, acceptance, correction, rejection, abandonment, reviewer wait, and support demand. Preserve the old definition when any of those fields changes.

### Earn the next cohort

Adoption work should move through evidence-bearing steps: observe the current job, rehearse the new surface on representative cases, run assisted shadow use, let operators lead a bounded cohort, and have the receiving team support and measure that cohort. Each step has an exit decision. Weak exposure calls for access or routing work; weak acceptance calls for product or behavior repair; a support queue beyond capacity calls for constraint, not a larger launch.

Training is necessary when the job changes, but training cannot repair a surface that hides evidence or adds pointless work. Likewise, office hours cannot substitute for owned support, and a charismatic FDE cannot be the permanent escalation path. The receiving team must reproduce the adoption calculation, diagnose one real break, support users, change the service safely, and decide when to constrain or retire it. Use the [delivery and adoption plan](../templates/delivery-and-adoption-plan.md) and [customer enablement handoff](../templates/customer-enablement-handoff.md) to make that evidence inspectable.

## Pattern libraries are the compounding asset

Customer data and company-specific rules may not be portable, but deployment methods can compound:

- Workflow archetypes
- Discovery questions
- Common exceptions
- Evaluation harnesses
- Governance and approval patterns
- Tool and integration templates
- Change-management techniques
- Failure and recovery patterns

This pattern library is a plausible moat for applied-agent companies: not generic intelligence, but accumulated knowledge of where autonomy works and how to operationalize it. [S15]

Mike Fishbein's proposed automation of forward-deployed discovery—voice interviews, prototype-building cloud agents, feedback collection, and a consultant subagent that ranks use cases—extends this idea. It should be treated as a promising workflow pattern rather than proof that the political and interpretive parts of discovery can be fully automated. [S13]

## Product design checklist

- What business result changes if this works?
- Which step is rule-based, which requires judgment, and which requires accountability?
- What evidence makes completion cheap to verify?
- Where does the necessary context live, and who owns it?
- Which current behaviors are expertise versus workaround?
- What artifact will users inspect, edit, compare, and approve?
- Can the user see state, cost, sources, and uncertainty?
- Can the user pause, redirect, and resume?
- What triggers escalation, and to whom?
- How will the operator experience improve?
- Which eligible opportunities reached the surface, completed, were independently accepted, and produced the intended effect?
- Where does the adoption funnel break, and which team owns that break?
- Can the receiving team reproduce the metric, support a cohort, and diagnose non-adoption without the delivery team?
- Which deployment learning is reusable without moving customer data?

[S01]: 05-source-index.md#s01
[S03]: 05-source-index.md#s03
[S05]: 05-source-index.md#s05
[S12]: 05-source-index.md#s12
[S13]: 05-source-index.md#s13
[S15]: 05-source-index.md#s15
[S17]: 05-source-index.md#s17
