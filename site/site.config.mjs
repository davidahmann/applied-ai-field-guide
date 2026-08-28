export const site = {
  name: "The FDE Guide",
  shortName: "FDE Guide",
  url: "https://davidahmann.github.io/fde-guide",
  repository: "https://github.com/davidahmann/fde-guide",
  description:
    "A practical forward deployed engineering guide for field discovery, accountable adaptation, measurable value, and production AI systems.",
  author: {
    name: "David Ahmann",
    url: "https://www.linkedin.com/in/dahmann/",
  },
};

export const navigation = [
  {
    label: "Start",
    routes: [
      "/",
      "/five-minute-guide/",
      "/forward-deployed-engineering/",
      "/forward-deployed-engineer-roadmap/",
      "/fde-operating-model/",
    ],
  },
  {
    label: "Field practice",
    routes: [
      "/field-engagement-reframing/",
    ],
  },
  {
    label: "Design",
    routes: [
      "/ai-value-engineering/",
      "/ai-value-engineering-scorecard/",
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
export const pages = [
  {
    route: "/",
    source: "README.md",
    navTitle: "Overview",
    title: "The FDE Guide: Value Engineering for Production AI",
    description:
      "An open-source forward deployed engineering guide and executable kit for measurable, secure, production AI-enabled systems.",
    type: "SoftwareSourceCode",
  },
  {
    route: "/five-minute-guide/",
    source: "guide/fde-guide-in-five-minutes.md",
    navTitle: "The Guide in five minutes",
    title: "The FDE Guide in Five Minutes: From Field Work to Operated Value",
    description:
      "Learn the essential FDE method in five minutes: observe real work, bound value, choose the smallest mechanism, prove the release, and transfer ownership.",
  },
  {
    route: "/forward-deployed-engineering/",
    source: "guide/README.md",
    navTitle: "Forward Deployed Engineering",
    title: "Forward Deployed Engineer Guide: From Workflow to Production",
    description:
      "Learn what forward deployed engineers do and how to move a real workflow from discovery to measurable, business-owned operation.",
  },
  {
    route: "/forward-deployed-engineer-roadmap/",
    source: "guide/capability-roadmap.md",
    navTitle: "FDE capability roadmap",
    title: "Forward Deployed Engineer Roadmap: Skills, Missions, and Evidence",
    description:
      "A practical capability roadmap for forward deployed and applied AI engineers, with role boundaries, five missions, starter artifacts, and a glossary.",
  },
  {
    route: "/field-engagement-reframing/",
    source: "playbooks/00-field-engagement-and-reframing.md",
    navTitle: "Field engagement and reframing",
    title: "FDE Field Engagement: Reframe a Brief with Evidence",
    description:
      "A practical FDE method for finding the process knower, reconciling field contradictions, obtaining scoped decisions, and changing direction without erasing history.",
  },
  {
    route: "/fde-operating-model/",
    source: "library/10-fde-and-production-agent-synthesis.md",
    navTitle: "FDE operating model",
    title: "The FDE Operating Model for Applied AI Delivery",
    description:
      "A practical operating model for forward deployed and internal applied-AI teams: discovery, value, delivery, adoption, operation, and learning.",
  },
  {
    route: "/ai-value-engineering/",
    source: "library/14-twelve-factors-ai-value-engineering.md",
    navTitle: "AI value engineering",
    title: "The 12 Factors of AI Value Engineering",
    description:
      "A twelve-factor framework for turning AI activity into accepted outcomes, positive net value, controlled risk, and durable operation.",
  },
  {
    route: "/ai-value-engineering-scorecard/",
    source: "guide/ai-value-engineering-scorecard.md",
    navTitle: "AI value scorecard",
    title: "AI Value Engineering Scorecard: 12 Factors and 4 Hard Gates",
    description:
      "Assess one AI-enabled workflow across twelve value factors and four hard gates, then record a bounded pilot or lifecycle decision.",
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
      "A production operating model for AI systems covering telemetry, SLOs, incidents, behavior, cost, change, recovery, and retirement.",
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
    title: "FDE and Production AI Templates",
    description:
      "Starter artifacts for workflow discovery, value, architecture, evaluation, security, release, adoption, handoff, and service operation.",
  },
  {
    route: "/research/",
    source: "research/README.md",
    navTitle: "Research and evidence",
    title: "Production AI and FDE Research Notes",
    description:
      "Dated primary-source research, portable findings, attribution, uncertainty, and implementation implications behind The FDE Guide.",
  },
];
