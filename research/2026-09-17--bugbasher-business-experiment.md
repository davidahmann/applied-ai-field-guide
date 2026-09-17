# BugBasher: Delayed Outcomes and Blocked Work

Review date: 2026-09-17. Review again by 2027-03-17, or when a public source, correction, or reproducible implementation becomes available.

<a id="r26-87"></a>
## R26-87 — A supplied account of an agent-run referral business

- **Source:** User-supplied article titled *Make money, make no mistakes.*, attributed to Sandra, `@sandylikesfrogs`. The [author profile](https://x.com/sandylikesfrogs) is a locator, not a verified article permalink.
- **Date and evidence status:** Publication date and public permalink unverified at review. The supplied text presents a first-person experiment using Devin and several communication and payment services. Record it as a practitioner lead; authorship, figures, logs, and implementation were not independently verified.
- **Disposition:** Use the reported events as a discussion case under existing controls. Do not use this account as independent evidence for a new production requirement, benchmark, or vendor recommendation.

## Reported events

The author reports roughly $3,000 spent over four weeks, 10,929 restaurant calls, and one $75 referral sale. Calls are not unique restaurants. The cost breakdown, including treatment of setup and human work, is unclear. The buyer reportedly liked the referral, although it did not convert into a job. These observations do not establish repeat demand, steady-state unit economics, or profitability.

The agent continued gathering leads while lacking a provider to receive them. Approval requests also accumulated in a channel where the agent could post but could not read replies. It eventually found operator email addresses through Git history and contacted them. The excerpt does not establish whether that alternative use was authorized.

After sending a paid offer, the agent called the experiment unsuccessful after one hour. A buyer paid eight hours later. The account also reports instructions spoken aloud on 197 calls and unsuccessful prompt repairs. Prompts and saved skills could change without the code-review approval used for code changes.

## What to carry into the guide

| Reported event | Guide application | Existing authority |
| --- | --- | --- |
| Leads accumulated without a provider | Check the receiving dependency and its capacity before admitting more work | `OPS-004`, `OPS-006` |
| Payment arrived after an early failure judgment | Predeclare an observation window; retain pending cases and attribute late events to the producing version | `EVA-006`, `OPS-001` |
| Approval messages were unanswered | Exercise both directions of the approval route, with a backup and safe waiting state | `OPS-003`, `OPS-006` |
| Git history supplied another contact route | Evaluate purpose and communication authority separately from read access | `IAM-002`, `IAM-003`, `TOL-005` |
| Prompt edits affected live calls | Review behavioral changes and replay regressions before promotion | `EVA-004`, `OPS-007` |
| Repeated call failures reached real recipients | Define contact limits, opt-out handling, stop conditions, and an accountable response before a live trial | `EVA-003`, `OPS-002`, `OPS-003` |

These are guide recommendations drawn from the account, not claims that the experiment implemented those controls. A shared file-based memory also raises questions about concurrent updates, stale instructions, and replay, but the excerpt does not establish how writes were coordinated or whether data was lost.

## Limits and implementation route

Do not repeat the article's claim to the first publicly documented cold-start B2B agent sale as an established fact. A paid referral, delivered contact information, a booked service, and a completed service are separate outcomes. The account does not prove that the final pitch caused the purchase, that contact or recording practices met applicable requirements, or that public inspection data was current evidence of a restaurant's need.

The [service-referral case](../examples/service-referral/README.md) separates reported events from a fictional tabletop exercise. The [evaluation chapter](../library/04-production-evaluation-and-governance.md#layer-4-longitudinal-and-production-evaluation) and [service review](../templates/production-service-review.md) hold the reusable guidance. No live calls, contact scraping, payments, or autonomous business deployment are provided.
