# Synthetic Field Evidence Packet

This packet is a fictional teaching fixture. It preserves source classes separately so a sold statement, an observation, a policy, a system test, and a human decision do not collapse into anonymous “truth.”

## Sold brief

### Automatic posting

> The service will automatically resolve and post eligible invoice exceptions without a separate accounts-payable review.

Evidence class: `sold`. Scope: eligible exceptions described by the fictional statement of work. Limitation: the statement does not establish operational authority or current system behavior.

### Sponsor

The finance transformation lead sponsors a cycle-time reduction initiative. Sponsorship establishes the desired business result; it does not grant posting authority.

## Operator walkthrough

### Owner

The accounts-payable exception lead owns the queue, exception escalation path, and access to recent cases. The accounts-payable service owner controls the operating boundary.

### Case 1042

At 14:00 UTC on 20 August 2026, a fictional accounts-payable reviewer opened domestic price-variance exception `1042`, inspected the invoice and purchase-order evidence, selected a correction, approved it under an authenticated identity, and posted it through a separate state. The reviewer retained a manual recovery path.

Population scope: this case only. It shows that the path occurred. It does not establish frequency, population coverage, average handling time, or model accuracy.

## Controls policy

### Posting control

Fictional controls-policy revision 8 requires a designated reviewer to approve each invoice correction before posting. Approval and posting are distinct events.

### Verification

The finance controls manager verifies that the approved proposal digest, invoice revision, policy revision, and ledger readback agree. That role is independent of the proposed recommendation step.

## Current-build test

### Approval state

The teaching build stages a correction before a separate authenticated approval event. It rejects stale revisions, tenant mismatch, absent or expired approval, approval-digest mismatch, duplicate business effects, and unverified completion. See the [committed evaluation report](../evaluation-report.json).

This test establishes fixture behavior under its recorded environment. It does not prove how a target invoice platform behaves.

## Scoped decision

### Authority

The fictional accounts-payable service owner is the verified disposition authority for the invoice-exception operating boundary.

### Proposal

Classify the exception, assemble cited evidence, and stage a correction. Keep approval and posting with the designated reviewer. If required evidence is missing, continue through the existing manual queue.

### Bounded kickoff

> Proceed with recommendation and staging for domestic price-variance exceptions. Approval and posting remain reviewer-controlled.

Decision: `bounded_kickoff`. The prior automatic-posting statement remains preserved as superseded history. No production release or customer acceptance is implied.
