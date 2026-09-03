# Business-Flow Patterns

Business-flow patterns organize a solution around a recurring operational decision. They sit between the workflow charter and the horizontal architecture accelerators.

| Pattern | Trigger | Decision | Controlled result |
| --- | --- | --- | --- |
| [Exception to resolution](exception-to-resolution.md) | Normal processing cannot continue | Resolve, request evidence, compensate, or escalate | Verified source state or owned unresolved case |
| [Signal to investigation](signal-to-investigation.md) | A rule, model, report, or person raises a signal | Dismiss, monitor, investigate, or escalate | Evidence-backed case disposition |
| [Risk to prioritized action](risk-to-prioritized-action.md) | Eligible work competes for limited attention | Rank, route, defer, or escalate | Policy-bounded queue and human decision |
| [Request to activation](request-to-activation.md) | A user or service requests access or enablement | Approve, provision, block, or request information | Independently accepted first use or safe rejection |

Use one primary pattern. Compose a second only when the observed workflow crosses both state machines. Every pattern must still be adapted through the canonical workflow charter, value case, ontology, intelligence-selection record, tool contracts, evaluation cases, release manifest, and operating artifacts.
