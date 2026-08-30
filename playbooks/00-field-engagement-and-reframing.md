# Field Engagement and Accountable Reframing

Use this playbook when an FDE inherits a customer request, sold brief, statement of work, or existing delivery plan. The inherited brief is a hypothesis about the work, not authority, observed truth, or a commitment to automate its proposed solution.

The purpose is to keep delivery moving when field reality contradicts the inherited story. The result is a current, evidence-backed engagement boundary with a safe next move—not a silently rewritten brief.

## The field loop

```text
inherit the story
  -> find the people who know and own the work
  -> observe one representative case and one material exception
  -> compare sold, stated, observed, system-enforced, and policy-authorized claims
  -> expose a consequential conflict
  -> propose a bounded reframe and safe fallback
  -> obtain a scoped human disposition
  -> update only dependent work and preserve history
  -> take the next accountable field move
```

Repeat the loop when new evidence invalidates the current boundary. Do not wait for design or build work to finish before surfacing a material contradiction.

## Keep one engagement boundary

Before capturing field evidence, bind the working session to one `engagement_id`, customer or tenant, workflow, environment, evidence store, and retention policy. Every interaction, claim, decision, and derived readout carries that boundary. If the engagement is missing or ambiguous, stop and ask; never search across customer folders or blend two engagements because their terminology looks similar.

The storage mechanism is target-specific. It may be a customer-owned repository, governed case workspace, document system, or another approved store. A convenient local folder is not a portable data-governance rule. Record the actual owner, access policy, classification, revision, and deletion or retention behavior instead.

## 1. Preserve the inherited story

Record the brief exactly enough to test it:

- the proposed workflow and desired outcome;
- who supplied or sold it;
- the source passages and revision;
- assumptions about users, authority, data, exceptions, acceptance, and economics;
- which statements are commitments and which are still hypotheses.

Do not improve the brief while recording it. A cleaned-up paraphrase can erase the contradiction that must be resolved.

## 2. Separate the roles

Name these roles independently. One person may hold several roles, but each role needs its own evidence or authority basis.

| Role | Question |
| --- | --- |
| Sponsor | Who wants the outcome or funds the work? |
| Process knower | Who can explain how representative and exceptional cases actually move? |
| Operator | Who performs, reviews, or receives the work? |
| Disposition authority | Who may accept, reject, defer, or constrain this engagement reframe? |
| Verifier | Who can independently determine whether the accepted outcome occurred? |

Do not infer the process knower from title, the disposition authority from sponsorship, or the verifier from delivery ownership.

### Find the process knower

Start with the work rather than an organization chart:

1. Trace a recent case from trigger to recorded outcome.
2. Ask who resolves exceptions, corrects records, or receives escalations.
3. Inspect the queues, runbooks, policy passages, workarounds, and system states they use.
4. Ask the first interviewee who they call when the documented path fails.
5. Confirm the candidate against a representative case and a material exception.

If no process knower or representative case is accessible, record the constraint and continue discovery, defer, or stop. Do not manufacture certainty from sponsor interviews.

## 3. Observe representative work

Use the [field-observation log](../templates/field-observation-log.md). Observe at least one actual or sanitized recent case inside a stated population and record:

- trigger, actors, inputs, decisions, handoffs, tools, and recorded outcome;
- normal path, exception path, workaround, and recovery;
- exact source passages, dates, owners, revisions, and limitations;
- whether the case proves occurrence only or is representative of a wider population.

Observation proves what occurred in its recorded scope. It does not prove frequency, permission, policy, or authorization.

### Close every field interaction

Do this after a meeting, shadowing session, incident review, or artifact handoff—while the source is still fresh:

1. **Stage the source record.** Assign an interaction ID; record the engagement boundary, date, participants and roles, source references and revisions, classification, access basis, and any redaction. Keep the source separate from derived claims.
2. **Propose the changes.** Draft the claims, decisions, risks, commitments, conflicts, and next moves that the interaction appears to support. Cite exact passages and state what each source cannot establish.
3. **Preview and confirm.** Show the proposed additions and affected records before appending them. A named reviewer confirms, corrects, rejects, or defers each consequential item; silence is not confirmation.
4. **Append a receipt.** Preserve the source reference, proposal, reviewer disposition, timestamp, and resulting record IDs or digests. Do not rewrite prior entries. A rejected proposal remains visible with its disposition.

A capture receipt proves that an interaction was recorded and reviewed. It does not prove the claim, grant authority, or accept a reframe. Use the confirmed receipts to derive a current sponsor readout; do not maintain a separate status narrative that can drift from the evidence record. This adapts a useful interaction pattern from the independently reviewed FDEOps repository while retaining the Guide's existing evidence and authority contracts. [R26-84](../research/2026-08-30--fde-interaction-workflow-ergonomics.md#r26-84)

## 4. Compare claims without collapsing authority

Classify each consequential claim:

| Claim class | What it can establish |
| --- | --- |
| `sold` | What was commercially represented or committed |
| `stated` | What a stakeholder said |
| `observed` | What occurred in a bounded case |
| `system_enforced` | What an identified system revision technically permits or prevents |
| `policy_authorized` | What an authoritative policy permits or requires in its scope |

No class universally outranks the others. A policy may authorize behavior without proving actual practice; an observation may prove occurrence without granting permission. Preserve cross-class conflicts until a named authority disposes them.

## 5. Bound the conflict

A conflict is consequential when resolving it could change the workflow boundary, human authority, data use, mechanism, acceptance evidence, cost, timeline, or risk ceiling.

For each consequential conflict, record:

- the competing claim IDs and exact passages;
- affected workflow and outcome boundary;
- what remains safe while unresolved;
- who has disposition authority;
- the downstream work that would change under each resolution.

Do not turn every ambiguity into a steering-committee issue. Use one of three initial movements:

1. find or validate the person who performs or owns the work;
2. observe a representative case;
3. resolve a cited conflict or review a bounded reframe.

## 6. Prepare the reframe

Write a decision brief that contains:

- the inherited claim and the contradicting evidence;
- the proposed current boundary;
- included and excluded behavior;
- retained human authority;
- a safe fallback that can proceed before the decision;
- affected acceptance evidence, economics, schedule, and downstream artifacts;
- the exact decision required, by whom, and by when;
- the next field move under accept, reject, defer, or no decision.

The reframe is a proposal. Model output, an FDE recommendation, elapsed time, or a funding deadline cannot accept it.

### Put the conflict in the room

Don't hide the contradiction in a status deck. Send the two cited claims before the meeting, then say what changes if each one wins:

> We sold automatic posting. The reviewer walkthrough and controls policy require approval before posting. We can still reduce queue time by recommending and staging a correction, but we cannot safely ship the original boundary. I need the accounts-payable service owner to accept that narrower path, reject it, or defer the decision. Until then, the manual queue stays in place.

Keep the language factual. The purpose is not to prove the sponsor wrong; it is to make the delivery consequence decidable.

| Failure mode | Better move |
| --- | --- |
| Softening the evidence to protect the room | Cite the exact source, then separate what it proves from what it does not |
| Presenting one preferred solution as inevitable | Offer the bounded proposal, safe fallback, and consequences of accept, reject, defer, or no decision |
| Asking a sponsor to overrule an operating or policy owner | Route the disposition to the role that actually controls the affected boundary |
| Letting silence become approval | Record `continue_discovery` or `defer`; time and momentum are not authority |
| Reopening the whole engagement | Change only the claims and downstream artifacts that depend on the resolved conflict |

## 7. Record a scoped disposition

The disposition authority records one engagement decision:

- `continue_discovery` — evidence or authority is still insufficient;
- `bounded_kickoff` — proceed inside the accepted boundary and named constraints;
- `defer` — preserve the record and conditions for reconsideration;
- `stop` — end the candidate engagement or workflow investigation.

Bind the actor, authority basis, scope, rationale, time, and exact evidence passage. This disposition governs the engagement boundary only. It does not grant production release, data access, tool authorization, customer acceptance, or authority to act in a target system.

## 8. Propagate selectively

After a disposition:

1. preserve the prior brief, proposal, evidence, and event chronology;
2. mark the accepted current boundary and its scope;
3. update or supersede only artifacts that depend on the changed claim;
4. leave unrelated revisions and digests unchanged;
5. record why each downstream item changed, its owner, and rollback or reconsideration condition;
6. route stale or newly conflicting work for review rather than silently regenerating it.

Use the [engagement-reframe record](../templates/engagement-reframe.json) for the living contract and the [invoice-exception engagement](../examples/invoice-exception/engagement/README.md) for a worked chain from field conflict through the next release decision.

## Exit conditions

Continue to [Discovery and Value](01-discovery-and-value.md) when:

- the current workflow boundary is source-linked;
- the sponsor, process knower, operator, disposition authority, and verifier are named or explicitly unknown;
- representative work and material limitations are recorded;
- consequential conflicts are resolved or safely bounded;
- the next field move has an owner;
- the engagement disposition is current.

Otherwise continue discovery, defer, or stop. Do not let solution design conceal an unresolved field conflict.

## Controls

- `FDE-001`: separate the people who want, know, perform, decide, and verify the work.
- `FDE-002`: observe representative and exceptional work with governed evidence.
- `FDE-005`: preserve contradictions, obtain scoped disposition, and propagate selectively.
- `CTX-001`: retain source ownership, revision, classification, and freshness.
- `CTX-004`: retain provenance, validation state, and invalidation rules.
- `DEL-002`: review material cross-resource changes as a compatible unit with rollback.

This playbook is field-delivery guidance. It is not production approval, an authorization system, a PSA, a CRM, or a substitute for target-system evidence.
