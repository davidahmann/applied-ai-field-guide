import { readdirSync, readFileSync } from "node:fs";

export const site = {
  name: "The Applied AI Field Guide",
  shortName: "Applied AI Field Guide",
  url: "https://davidahmann.github.io/applied-ai-field-guide",
  repository: "https://github.com/davidahmann/applied-ai-field-guide",
  description:
    "Open-source guidance for applied AI teams: understand the work, choose the right mechanism, prove the outcome, and operate the system.",
  author: {
    name: "David Ahmann",
    url: "https://www.linkedin.com/in/dahmann/",
  },
};

// These aliases live under the current site base. A repository rename does not
// redirect the previous GitHub Pages project base.
export const redirects = [
  { from: "/forward-deployed-engineering/", to: "/applied-ai-delivery/" },
  { from: "/forward-deployed-engineer-roadmap/", to: "/applied-ai-capability-roadmap/" },
  { from: "/fde-operating-model/", to: "/applied-ai-operating-model/" },
];

export const navigation = [
  {
    label: "Start",
    routes: [
      "/",
      "/five-minute-guide/",
      "/applied-ai-delivery/",
      "/applied-ai-capability-roadmap/",
      "/applied-ai-operating-model/",
    ],
  },
  {
    label: "Field practice",
    routes: [
      "/field-engagement-reframing/",
      "/worked-engagement/invoice-exception/",
      "/practice/invoice-review/",
    ],
  },
  {
    label: "Design",
    routes: [
      "/ai-value-engineering/",
      "/ai-value-engineering-scorecard/",
      "/funding-ai-for-accepted-outcomes/",
      "/ai-data-readiness/",
      "/enterprise-ai-integration/",
      "/ai-workflows-vs-agents/",
      "/production-ai-agent-architecture/",
      "/workflow-automation-examples/",
    ],
  },
  {
    label: "Prove and operate",
    routes: [
      "/ai-agent-evaluation/",
      "/ai-agent-security/",
      "/computer-use-agent-security/",
      "/production-ai-readiness/",
      "/operations/",
    ],
  },
  {
    label: "Use the kit",
    routes: [
      "/reference-implementations/invoice-exception/",
      "/reference-implementations/shipment-risk-triage/",
      "/templates/",
      "/research/",
    ],
  },
];

// Supporting study pages keep their canonical Markdown and stable source-based
// routes. They are searchable/linkable without filling the primary navigation.
function addSupportingPages() {
for (const directory of ["library", "templates", "playbooks", "operations", "examples/invoice-exception/engagement", "examples/invoice-exception/document-review"]) {
  for (const entry of readdirSync(new URL(`../${directory}/`, import.meta.url), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const source = `${directory}/${entry.name}`;
    if (pages.some((page) => page.source === source)) continue;
    const heading = readFileSync(new URL(`../${source}`, import.meta.url), "utf8").match(/^# (.+)$/m)?.[1];
    if (!heading) throw new Error(`Study page needs a heading: ${source}`);
    const practice = source === "examples/invoice-exception/document-review/practice.md";
    const area = directory.startsWith("examples") ? "Invoice practice" : directory[0].toUpperCase() + directory.slice(1);
    pages.push({ source, route: practice ? "/practice/invoice-review/" : `/study/${source.replace(/\.md$/, "").toLowerCase()}/`,
      navTitle: heading, title: `${heading} · ${area}`,
      description: `Read ${heading.slice(0, 55)}: ${area.toLowerCase()} guidance with evidence limits, practical checks and editable source material.` });
  }
}
}
export const pages = [
  {
    route: "/",
    source: "README.md",
    navTitle: "Overview",
    title: "The Applied AI Field Guide: From Real Work to Production",
    description:
      "An open-source guide and executable kit for applied AI teams, product owners, operators, and FDEs building measurable, secure production systems.",
    type: "SoftwareSourceCode",
  },
  {
    route: "/five-minute-guide/",
    source: "guide/field-guide-in-five-minutes.md",
    navTitle: "Five-minute field guide",
    title: "The Applied AI Field Guide in Five Minutes: Start with the Messy Brief",
    legacyAnchors: { "know-when-to-leave": "make-ownership-survive-the-project" },
    description:
      "Start with a broken brief, missing process owner, stakeholder conflict, unsafe first slice, or stalled handoff and find the next defensible move.",
  },
  {
    route: "/applied-ai-delivery/",
    source: "guide/README.md",
    navTitle: "The complete delivery method",
    title: "Applied AI Delivery: From Workflow to Production",
    legacyAnchors: { "1-what-an-fde-is-responsible-for": "1-what-the-delivery-team-is-responsible-for" },
    description:
      "A shared delivery method for applied AI teams and forward-deployed engineers: field discovery, value, design, proof, ownership, and operation.",
  },
  {
    route: "/applied-ai-capability-roadmap/",
    source: "guide/capability-roadmap.md",
    navTitle: "Applied AI capability roadmap",
    title: "Applied AI Capability Roadmap: Roles, Missions, and Evidence",
    description:
      "A practical capability roadmap for AI engineers, product owners, operators, and FDEs, with role boundaries, practice missions, artifacts, and a glossary.",
  },
  {
    route: "/field-engagement-reframing/",
    source: "playbooks/00-field-engagement-and-reframing.md",
    navTitle: "Field engagement and reframing",
    title: "Applied AI Fieldwork: Reframe a Brief with Evidence",
    description:
      "Find the process knower, reconcile field contradictions, obtain scoped decisions, and change an AI delivery brief without erasing its history.",
  },
  {
    route: "/worked-engagement/invoice-exception/",
    source: "examples/invoice-exception/engagement/README.md",
    navTitle: "Complete worked engagement",
    title: "Worked AI Delivery Engagement: When the Sold Brief Cannot Ship",
    description:
      "Follow one synthetic invoice engagement from field contradiction and reframe through economics, evaluation, adoption, handoff, and a review-only decision.",
  },
  {
    route: "/applied-ai-operating-model/",
    source: "library/10-applied-ai-delivery-and-operating-model.md",
    navTitle: "Applied AI operating model",
    title: "An Operating Model for Applied AI Delivery",
    legacyAnchors: {
      "two-linked-practices-one-delivery-system": "shared-responsibilities-one-delivery-system",
      "the-combined-fde-method": "the-applied-ai-delivery-method",
      "separate-customer-specific-context-from-reusable-practice": "separate-workflow-specific-context-from-reusable-practice",
    },
    description:
      "A practical operating model for internal AI teams and delivery partners: discovery, value, delivery, company adoption, operation, and learning.",
  },
  {
    route: "/ai-value-engineering/",
    source: "library/14-twelve-factors-ai-value-engineering.md",
    navTitle: "12 Factors",
    title: "The 12 Factors of AI Value Engineering",
    description:
      "A twelve-factor framework for turning AI activity into accepted outcomes, positive net value, controlled risk, and durable operation.",
  },
  {
    route: "/ai-value-engineering-scorecard/",
    source: "guide/ai-value-engineering-scorecard.md",
    navTitle: "12 Factors worksheet",
    title: "AI Value Engineering Scorecard: 12 Factors and 4 Hard Gates",
    description:
      "Assess one AI-enabled workflow across twelve value factors and four hard gates, then record a bounded pilot or lifecycle decision.",
  },
  {
    route: "/funding-ai-for-accepted-outcomes/",
    source: "guide/funding-ai-for-accepted-outcomes.md",
    navTitle: "Executive funding guide",
    title: "Funding AI Initiatives for Accepted Outcomes",
    description:
      "An executive guide to funding, reshaping, expanding, pausing, or stopping AI work through owned outcomes, evidence, economics, risk, and operations.",
  },
  {
    route: "/ai-data-readiness/",
    source: "library/16-data-readiness-and-context-contracts.md",
    navTitle: "AI data readiness",
    title: "AI Data Readiness: Context, Quality, Lineage, and Drift",
    description:
      "A decision-bound data readiness method for operational data, AI context, evaluation evidence, preparation lineage, output ownership, and production drift.",
  },
  {
    route: "/enterprise-ai-integration/",
    source: "library/17-enterprise-integration-and-scale-reality.md",
    navTitle: "Enterprise integration reality",
    title: "Enterprise AI Integration: From Teaching Code to Target Evidence",
    description:
      "Bridge local AI examples to enterprise deployment through source authority, reconciliation, identity, durable execution, restricted promotion, and target evidence.",
  },
  {
    route: "/ai-workflows-vs-agents/",
    source: "library/12-software-architecture-and-intelligence-selection.md",
    navTitle: "Workflows vs. agents",
    title: "AI Workflows vs. Agents: Select the Smallest Sufficient Mechanism",
    description:
      "Compare deterministic software, optimization, classical ML, retrieval, model calls, agents, and human review for each decision step.",
  },
  {
    route: "/production-ai-agent-architecture/",
    source: "library/03-agent-system-architecture.md",
    navTitle: "Agent architecture",
    title: "Production AI Agent Architecture: Harnesses, Tools, State, and Control",
    description:
      "Production AI agent architecture patterns for harnesses, context, tools, state, sandboxes, durable execution, and verifiable effects.",
  },
  {
    route: "/workflow-automation-examples/",
    source: "solutions/README.md",
    navTitle: "Workflow patterns",
    title: "Enterprise AI Workflow Automation Patterns and Examples",
    description:
      "Reusable business-flow patterns, industry profiles, and foundations for designing bounded enterprise AI workflow automation.",
  },
  {
    route: "/ai-agent-evaluation/",
    source: "library/04-production-evaluation-and-governance.md",
    navTitle: "Agent evaluation",
    title: "AI Agent Evaluation for Production Systems",
    description:
      "Design realistic AI agent evaluations with deterministic checks, behavioral traces, adversarial cases, cost budgets, and release evidence.",
  },
  {
    route: "/ai-agent-security/",
    source: "library/15-production-ai-security-and-action-boundaries.md",
    navTitle: "Agent security",
    title: "AI Agent Security: Identity, Tools, Egress, and Verified Effects",
    description:
      "A production AI security guide for identity, tenant isolation, tool contracts, capability provenance, egress, approvals, and readback.",
  },
  {
    route: "/computer-use-agent-security/",
    source: "blueprints/computer-use-action-boundary.md",
    navTitle: "Computer-use security",
    title: "Computer-Use Agent Security: Browser Automation Boundaries",
    description:
      "Design browser and desktop automation with scoped sessions, hostile-content handling, duplicate safety, interface-drift controls, and independent readback.",
  },
  {
    route: "/production-ai-readiness/",
    source: "operations/release-gates.md",
    navTitle: "Production readiness",
    title: "Production AI Readiness: Evidence and Release Gates",
    description:
      "Use evidence-based release gates for value, architecture, security, evaluation, rollout, operation, and retirement of production AI systems.",
  },
  {
    route: "/operations/",
    source: "operations/README.md",
    navTitle: "Production operations",
    title: "Operating Production AI Systems",
    description:
      "A company operating model for accountable AI services: decision rights, shared rails, workflow ownership, proof gates, telemetry, cost, recovery, and retirement.",
  },
  {
    route: "/reference-implementations/invoice-exception/",
    source: "examples/invoice-exception/README.md",
    navTitle: "Controlled-write example",
    title: "Production AI Agent Example: Controlled Invoice Resolution",
    description:
      "An executable AI agent reference showing trusted authorization, staged writes, idempotency, signed receipts, readback, and adversarial tests.",
  },
  {
    route: "/reference-implementations/shipment-risk-triage/",
    source: "examples/shipment-risk-triage/README.md",
    navTitle: "Hybrid AI example",
    title: "Hybrid AI System Example: Shipment-Risk Triage",
    description:
      "An executable reference combining classical ML, deterministic policy, optional model explanation, human review, and outcome evaluation.",
  },
  {
    route: "/templates/",
    source: "templates/README.md",
    navTitle: "Templates and contracts",
    title: "Applied AI Delivery and Production Templates",
    description:
      "Starter artifacts for workflow discovery, value, architecture, evaluation, security, release, adoption, handoff, and service operation.",
  },
  {
    route: "/research/",
    source: "research/README.md",
    navTitle: "Research and evidence",
    title: "Applied AI Research Notes and Evidence",
    description:
      "Dated primary-source research, portable findings, attribution, uncertainty, and implementation implications behind The Applied AI Field Guide.",
  },
];
addSupportingPages();
