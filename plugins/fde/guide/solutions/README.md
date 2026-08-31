# Operational Solution Portfolio

This portfolio shows how the guide's controls and architecture become business-facing systems. Start with a recurring business flow, apply an industry profile where useful, and then select the horizontal foundations required by the target environment.

The portfolio has four different kinds of material. They are intentionally not interchangeable.

| Layer | Question it answers | Maturity |
| --- | --- | --- |
| [Business-flow patterns](business-flows/README.md) | What decision and operating loop are we improving? | Reusable design patterns |
| [Vertical profiles](verticals/README.md) | How do domain objects, evidence, authority, risk, and operating measures change in this industry? | Worked design profiles |
| Foundation accelerators | Which shared platform boundary is the dominant delivery risk? | Horizontal design accelerators |
| [Executable examples](../examples/) | Which specific software invariants are demonstrated locally? | Teaching implementations and regression evidence |

None of these artifacts is a deployable product, a certification, or release evidence. A customer or internal deployment still needs an observed workflow, target-specific policies and integrations, representative evaluation, an owned release, adoption evidence, and an exercised handoff.

## Start with the business flow

Choose the pattern that best describes the operational decision—not the model, vendor, or source system.

| Business flow | Use it when | Smallest useful result | Executable proof |
| --- | --- | --- | --- |
| [Exception to resolution](business-flows/exception-to-resolution.md) | A transaction, request, or record cannot continue on the normal path | One exception is resolved or safely escalated with current evidence and verified state | [Invoice exception](../examples/invoice-exception/README.md) |
| [Signal to investigation](business-flows/signal-to-investigation.md) | A signal must become an evidence-backed case disposition | One signal is triaged into a persistent case with bounded evidence and named review | — |
| [Risk to prioritized action](business-flows/risk-to-prioritized-action.md) | Limited human capacity must focus on the most consequential work | One eligible item is ranked, policy-routed, reviewed, and measured | [Shipment-risk triage](../examples/shipment-risk-triage/README.md) |
| [Request to activation](business-flows/request-to-activation.md) | A customer, user, service, or resource must become safely usable | One request reaches an independently accepted first outcome | — |

## Add an industry profile

Industry profiles adapt the same flows to domain language, evidence, authority, and operating constraints. They do not replace local legal, privacy, security, clinical, financial, safety, or compliance review.

| Profile | Primary flow composition | Worked decision |
| --- | --- | --- |
| [Healthcare access coordination](verticals/healthcare-access-coordination.md) | Request to activation + exception to resolution | Move a referral or authorization case toward the next administratively valid state without making a clinical or coverage decision |
| [Financial-services investigation](verticals/financial-services-investigation.md) | Signal to investigation + exception to resolution | Assemble an evidence-backed case for an authorized investigator while preserving confidentiality and human disposition authority |
| [Industrial operations response](verticals/industrial-operations-response.md) | Risk to prioritized action + exception to resolution | Prioritize an asset or supply disruption for an authorized operator without allowing a score or model to control equipment |

## Select the horizontal foundation

Use one primary accelerator for the dominant technical failure boundary. Add another only when the approved slice genuinely crosses that boundary.

| Dominant delivery risk | Accelerator | Smallest useful slice |
| --- | --- | --- |
| Enterprise access, tenant isolation, monetization, or activation | [Enterprise foundation](enterprise-foundation.md) | One tenant lifecycle from identity setup to accepted use and reconciled usage |
| Third-party systems, webhooks, connector reliability, or credential boundaries | [Integration runtime](integration-runtime.md) | One verified inbound event and one duplicate-safe, reconciled outbound action |
| Sensitive knowledge, permission-aware retrieval, citations, or minimization | [Secure AI workload](secure-ai-workload.md) | One read-only evidence path with current access, minimization, citations, and escalation |
| Repeatable deployment, adoption and SLO evidence, incident recovery, or public proof | [Deployment and operations](deployment-and-operations.md) | One admitted environment, canary, rollback exercise, operating view, and evidence packet |

## Composition method

```text
accepted outcome and verifier
  -> business-flow pattern
  -> industry profile and domain model
  -> horizontal foundation boundaries
  -> smallest sufficient intelligence per decision
  -> operator surface and controlled actions
  -> target-specific evaluation, release, adoption, and operation
```

1. Qualify the workflow and value case through [Discovery and Value](../playbooks/01-discovery-and-value.md).
2. Select one business-flow pattern by its trigger, decision, action, and accepted outcome.
3. Apply an industry profile only where it adds concrete domain objects, policies, risks, or operating evidence.
4. Select the primary horizontal accelerator by its dominant failure boundary.
5. Copy and complete the linked canonical templates in the delivery repository.
6. Implement the smallest vertical slice with representative data, final identity and action boundaries, a persistent user surface, and measurable outcome evidence.
7. Evaluate and release the exact target bundle; transfer it to a named service owner.

Do not combine every pattern, profile, and accelerator by default. A useful solution is a narrow operational loop, not a diagram containing the entire enterprise.

## Twelve-project coverage

Twelve common FDE project archetypes are mapped to the four horizontal foundations. The business-flow and vertical layers show how those foundations participate in an actual operating decision.

| Project ID | Common project | Primary accelerator | Why it belongs there |
| --- | --- | --- | --- |
| P01 | Multi-tenant SaaS platform | [Enterprise foundation](enterprise-foundation.md) | Tenant identity, isolation, entitlements, usage, and lifecycle are one control surface. |
| P02 | Enterprise SSO integration | [Enterprise foundation](enterprise-foundation.md) | Authentication, provisioning, request-time authorization, and deprovisioning must remain coherent. |
| P03 | Customer connector pack | [Integration runtime](integration-runtime.md) | Connectors need shared credential, tenancy, delivery, recovery, and versioning services. |
| P04 | Secure customer RAG system | [Secure AI workload](secure-ai-workload.md) | Permission-aware retrieval, evidence, data minimization, and evaluation form one decision path. |
| P05 | Customer health dashboard | [Deployment and operations](deployment-and-operations.md) | Adoption, value, reliability, cost, and support signals belong in one operating view. |
| P06 | Webhook integration engine | [Integration runtime](integration-runtime.md) | Signature checks, durable receipt, duplicate safety, retries, and replay are runtime primitives. |
| P07 | One-click customer deployment | [Deployment and operations](deployment-and-operations.md) | Provisioning is a controlled release pipeline with admission, verification, rollback, and ownership. |
| P08 | PII redaction middleware | [Secure AI workload](secure-ai-workload.md) | Classification and minimization must span ingestion, retrieval, model context, output, and telemetry. |
| P09 | Incident response system | [Deployment and operations](deployment-and-operations.md) | Detection, containment, readback, recovery, communication, and regression are one service capability. |
| P10 | Usage metering and billing | [Enterprise foundation](enterprise-foundation.md) | Tenant entitlements, stable usage events, aggregation, rating, and reconciliation must agree. |
| P11 | Customer onboarding automation | [Enterprise foundation](enterprise-foundation.md) | Identity setup, configuration, activation, and time-to-first-value share the tenant lifecycle. |
| P12 | Public deployment case study | [Deployment and operations](deployment-and-operations.md) | A publishable case is a redacted evidence product derived from operated results, not marketing added at the end. |

These projects demonstrate design and verification skill; they do not guarantee employment or substitute for customer-specific review.
