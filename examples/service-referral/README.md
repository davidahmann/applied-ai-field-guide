# A Service-Referral Agent Makes a Sale. What Is Still Unproved?

An agent can collect leads and receive a payment while the service behind it remains unfinished. This case examines that gap through a reported experiment and a separate fictional exercise. It contains no runnable agent, customer data, or live outreach.

## The reported experiment

In a supplied article attributed to Sandra (`@sandylikesfrogs`), BugBasher contacted restaurants and tried to sell referrals to pest-control providers. The author reports roughly $3,000 spent, 10,929 calls, and one $75 sale over four weeks. The buyer reportedly liked the referral, but it did not become a job. Publication details and the underlying results remain unverified; see the [source record and limitations](../../research/2026-09-17--bugbasher-business-experiment.md#r26-87).

The agent collected leads while having no provider to receive them. Later, it judged a paid-offer experiment unsuccessful after one hour; a customer paid eight hours after that judgment. More activity could not fix the missing provider, and an early conclusion misread the payment result.

## Define the transaction before automating it

For a referral service, distinguish an eligible request, an available provider, an authorized offer, a verified payment, permitted contact delivery, buyer acceptance, and any later booked job. Payment alone does not prove the whole chain. Agree on what the fee buys and what evidence establishes delivery, acceptance, refund obligations, and downstream results.

A bounded design could let a model interpret a request and draft an offer. Deterministic services would check eligibility, provider capacity, contact permission, spending limits, payment state, and duplicate delivery. The service owner would approve changes to the offer and operating policy. If a required check is unavailable, hold the affected transaction for review rather than inventing a substitute.

## Tabletop exercise: a delayed payment

Everything in this section is fictional. The times and limits are exercise inputs, not recommended defaults. Use a paper ledger or local document; do not contact anyone or charge a card.

The service owner has approved a ten-request trial using offer version `offer-3`, with a 48-hour payment observation window per offer. Only opted-in contacts and approved communication routes are eligible. Provider capacity must be reserved before an offer is sent. A reviewer and backup are named, with a four-hour response target. The operations owner may pause new offers. The agent may propose prompt changes but cannot release them.

| Event | Expected decision and evidence |
| --- | --- |
| Monday 09:00: an interested customer has no available provider | Hold the offer. Record the capacity gap, owner, and next review. Curb intake that would add unusable work. |
| Monday 11:00: capacity is reserved; an authorized offer is sent | Record the offer ID, `offer-3`, reservation expiry, recipient permission, and Wednesday 11:00 observation cutoff. |
| Monday 12:00: no payment has arrived | Keep the outcome pending. Do not mark it failed or change the observation window. Safety or spend breaches can still stop the trial early. |
| Monday 13:00: a change request opened at 09:00 reaches its approval response target without a reply | Use the approved backup route. Keep the change blocked; addresses found in a repository are not an approved escalation list. |
| Monday 20:00: the payment service reports a payment | Verify it against the payment record and bind it to the original offer/version. Recheck capacity, terms, and contact permission before delivery. If these no longer hold, route for an owned resolution, including a refund where required. |
| Monday 20:05: the same payment notification arrives again | Reuse the transaction's stable delivery identity and check delivery state. Do not deliver twice. An uncertain delivery remains unresolved until readback or human reconciliation. |
| Tuesday: a proposed prompt repair handles silence but discloses internal instructions in a replay | Reject promotion. Preserve the failure, affected version, and regression case; contain an affected live route if applicable. |

For the exercise's 48-hour window, an offer with no observed payment at the cutoff has that specific result. If payment later arrives, append a dated correction, retain the earlier as-of report, and keep attribution to the original offer. Do not rewrite history or credit a newer prompt. The clock ending does not remove obligations for an existing transaction.

## Bring a decision to the service review

Show unique eligible requests separately from contact attempts. Report pending offers by age, verified payments, delivered and accepted referrals, booked jobs, refunds, opt-outs, complaints, and unresolved effects. Separate experiment/setup costs from recurring costs; include human review and support. Missing observations stay unknown.

The reviewer should be able to trace one late payment to its offer, explain why a blocked offer did not proceed, and show that a duplicate notification could not authorize another delivery. Use the [production service review](../../templates/production-service-review.md), [evaluation guidance](../../library/04-production-evaluation-and-governance.md), and [change-management procedure](../../operations/change-management.md). The [durable-recovery lab](../invoice-exception/durable-recovery/README.md) provides separate executable practice for ambiguous and duplicate effects; it does not test this referral design.

Pause new offers when provider capacity, approval coverage, contact authority, or trial limits cannot be maintained. Keep reconciliation and support for existing transactions available. Expanding the trial requires representative evidence and a named owner's decision; completing this exercise supplies neither production approval nor proof of a viable business.
