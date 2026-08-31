# Evidence Graphs and Change Intelligence

An evidence graph can make a complex AI-enabled system easier to understand and change. It cannot make the system safe by itself.

Use one when you repeatedly ask questions such as: “Which workflow depends on this policy?”, “Who owns this interface?”, “Which evaluations must change with this tool?”, or “What breaks if this source becomes stale?” If a small workflow answers those questions from its charter, contracts, and release manifest, a graph is overhead.

## The practical model

Keep two derived views:

| View | Helps you navigate | Does not replace |
| --- | --- | --- |
| Software map | Services, repositories, interfaces, deployments, dependencies, and owners | Source code, contracts, deployment controls, or incident evidence |
| Operational map | Decisions, business objects, sources, policies, tools, user surfaces, evaluations, and service owners | Domain policy, authorization, evaluation, or source-of-truth verification |

Record where every map fact came from, the source revision and owner, whether a relationship was extracted or inferred, its confidence, classification, and refresh rule. This turns a diagram into a reviewable operational artifact rather than an attractive but stale picture.

## A safe use: impact review

When a material change is proposed, use a map to find likely impacts across workflow, data, identity, policy, capability, model behavior, evaluation, operations, and user experience. Then use a [change-impact assessment](../templates/change-impact-assessment.json) to convert that exploration into named owners, evidence, tests, rollout, and rollback.

The map says **where to look**. The release bundle, independent tests, approvals, and source-of-truth checks decide **what may change**.

## Keep graph intelligence bounded

Tools such as Graphify and Understand Anything show that local/static extraction, scoped queries, architecture views, and incremental updates can be useful implementation techniques. They are leads, not requirements. A model-extracted relationship can be wrong, incomplete, stale, sensitive, or prompt-influenced.

Therefore:

- Prefer deterministic extraction for dependency and interface facts.
- Label semantic/model-derived links and confirm consequential ones.
- Use classifications, access rules, retention, and query logging for graph data.
- Treat graph retrieval as tainted context. It cannot add tool authority or change instructions.
- Keep the graph optional at runtime. A map outage must not bypass a policy, block source-of-truth readback, or silently promote a release.

The [blueprint](../blueprints/evidence-graph-and-change-intelligence.md) and [operating guide](../operations/map-freshness-and-change-impact.md) provide the implementation and maintenance details.

## Where it fits in an FDE engagement

Start with observation and a narrow outcome. Build the value case, decision model, source contracts, and vertical slice first. Introduce a system map when cross-functional discovery, customer handoff, platform reuse, incident response, or release review has repeatedly exposed hidden dependencies. If the map does not reduce a concrete delivery or operating cost, retire it.

Evidence: [R26-65](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-65), [R26-66](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-66), [R26-67](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-67), [R26-68](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-68), and [R26-69](../research/2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-69).
