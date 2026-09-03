# Evidence Graphs and Change Intelligence: Research Note

## Scope

This note evaluates a narrow question: when should an FDE or applied-AI team use a derived system/knowledge graph to support design, delivery, and operations? It does not recommend a graph database, a particular extractor, or autonomous graph-driven control.

## Conclusion

The durable idea is **versioned relationship evidence for navigation and change review**, not “make the graph the brain.” C4 supports hierarchical software views; Backstage demonstrates source-controlled ownership/catalog metadata; OpenLineage defines a standard lineage vocabulary. Graphify and Understand Anything provide implementation leads for locally generated views, scoped exploration, and change impact, but their project documentation is not independent proof of accuracy or operating benefit.

## Portable design implications

- Preserve source, revision, owner, classification, extraction basis, confidence, and invalidation for every derived map relationship.
- Maintain software and operational views separately, then connect them through evidence rather than conflating code dependencies with business authority.
- Use maps to discover likely impact; use release manifests, tests, approvals, and source-of-truth verification to authorize change.
- Treat map retrieval as untrusted context and graph data as potentially sensitive derived data.
- Prefer deterministic extraction where facts are available; route material inferred links to named human/source confirmation.
- Keep the map optional to runtime safety. A graph outage must not weaken identity, policy, effects, evaluation, or recovery.

## Source quality and limits

Entries [R26-65](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-65) through [R26-69](2026-02-07--2026-08-07-production-agent-source-ledger.md#r26-69) are the evidence base. C4, Backstage, and OpenLineage provide primary architecture/catalog/lineage material. Graphify and Understand Anything are project-maintained field implementations (Tier C); their claims about extraction, cost, and impact need local validation. No vendor benchmark or model-extraction accuracy claim is treated as a repository control.
