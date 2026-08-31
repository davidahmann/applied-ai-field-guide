---
name: design-production-ai-system
description: Design a production AI-enabled system after its workflow, value, and intelligence choices are approved. Use for architecture, domain and state modeling, model behavior, context, tools, human review, security boundaries, delivery planning, or a complete design packet.
---

# Design a Production AI System

Translate an approved workflow into the smallest coherent software system. Preserve deterministic boundaries even when a model or agent is selected.

## Read first

1. Confirm the current engagement boundary has no unresolved material reframe, then verify that the workflow charter, value case, data-readiness assessment, data-context manifest, and intelligence-selection record are complete enough to design.
2. Read [Solution Design and Delivery](../../../playbooks/02-solution-and-delivery.md), the [solution portfolio](../../../solutions/README.md), the [production implementation playbook](../../../library/07-production-implementation-playbook.md), and the [blueprint selector](../../../blueprints/README.md).
3. Select at most one business-flow pattern, one optional vertical profile, and one primary horizontal foundation. Record `none` for the pattern or foundation when no artifact fits; do not force a composition. Read only selected artifacts and treat them as design accelerators, not target evidence.
4. Follow the canonical artifact order in [AGENTS.md](../../../AGENTS.md).
5. Apply `ARC-001` through `ARC-005`, `DEL-001`, `CTX-001` through `CTX-009`, `STA-001` through `STA-003`, `HUM-001` through `HUM-003`, and the applicable identity, tool, security, reliability, operations, and cost controls.

## Workflow

1. Record the selected solution composition or `none`, target-specific deviations, customer-specific decisions, and non-claims; then define the system boundary, trust boundaries, users, service owners, deployment topology, dependencies, and persistent user surface.
2. Model domain objects, lifecycle states, actions, policies, evidence, identity, and sources of truth in the operational ontology. Bind the four data planes, decision-critical quality, preparation lineage, label authority, output ownership, failure behavior, economics, and drift response in the data-context manifest.
3. Map each decision to its selected mechanism. Define explicit state, retries, deadlines, cancellation, failure, escalation, rollback, and retirement behavior.
4. When model behavior is selected, bind its model route, prompt, harness, context policy, guardrails, runtime compatibility, tools, and capability manifests in one versioned behavior bundle.
5. Give every read or effect a narrow typed boundary. Separate read, stage, commit, administrative, and destructive operations.
6. Draft the threat model and evaluation cases together. Design persistent review surfaces and start adoption and handoff work during the pilot.
7. Define the compatible release unit and evidence needed at each release gate. Use the current evaluation-report and solution-release profiles only when model or agent behavior is selected; deterministic, optimization, or classical-ML-only systems require equivalent target-software architecture, test, provenance, deployment, rollback, and operating records without placeholder agent artifacts.

## Output contract

Return the solution composition and deviations plus the smallest complete packet applicable to the workflow: ADRs, data-context manifest, ontology, system design, behavior bundle when needed, tool and capability contracts, handoff contract when delegated, threat model, evaluation plan, adoption plan, release plan, and operating ownership.

Do not begin with a framework or multi-agent topology. Do not hide unresolved authority, source-of-truth, verifier, or ownership questions inside prompts or future implementation work.
