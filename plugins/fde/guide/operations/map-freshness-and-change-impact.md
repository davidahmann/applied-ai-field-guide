# Map Freshness and Change Impact

Use this operating guide only where a versioned software or operational map exists. It keeps derived navigation useful without letting it become a shadow source of truth.

Controls: `CTX-001`, `CTX-002`, `CTX-004`, `DEL-001`, `OPS-001`, `OPS-007`.

## Operating contract

The [system-map manifest](../templates/system-map-manifest.json) records the map scope, sources, derivation, classification, freshness, and prohibited uses. It is a derived artifact. The workflow charter, domain model, tool/policy boundary, evaluation evidence, solution release, and source-of-truth readback retain their respective authority.

Operate two views only when they pay for themselves:

- **Software map:** ownership, services, repositories, interfaces, dependencies, deployment, and runbooks.
- **Operational map:** workflow decision, business objects, evidence, policies, tools, evaluation, user surface, and service ownership.

Do not use either map for authorization, effect authorization, policy definition, completion proof, or unbounded memory.

## Freshness and access

| Event | Required action |
| --- | --- |
| Source revision, interface, deployment, ownership, classification, or policy changes | Invalidate affected map scope and create/update change-impact assessment |
| Scheduled freshness objective is missed | Mark map stale; rebuild before relying on it for a material-change review |
| Incident reveals an unmodeled dependency | Add a dated evidence item, owner, and regression or drill where applicable |
| Restricted source is added or reclassified | Reassess map access, retention, query logging, and exported views before refresh |
| Map-build or query service fails | Use primary artifacts and normal release process; do not substitute stale derived context for a control |

Collect map queries as metadata-only or approved audit records. Do not place credentials, raw sensitive source text, or unbounded tool output in the map. `CTX-002`.

## Material change sequence

1. Classify the candidate change and record before/after immutable revisions.
2. Refresh or verify the relevant map scope. Record any excluded source and reason.
3. Produce a [change-impact assessment](../templates/change-impact-assessment.json): direct/transitive candidates, confidence, disposition, owner, validation, rollout, rollback, and unresolved items.
4. Reconcile consequential inferred edges with source owners. Treat unresolved or incomplete coverage as a block for material/critical promotion.
5. Bind confirmed changed artifacts into the evaluation and compatible solution release; run the relevant replay, negative, migration, operating, and adoption checks.
6. Conduct technical, operational, and risk review for material/critical change. Release only through the standard gate; the assessment is input, not approval itself.
7. After rollout, compare expected impacts against observed traces, outcomes, cost, and incidents. Correct the map and add a field-learning item if the map missed a repeatable dependency.

## Process intelligence without a shadow control plane

Operational telemetry can reveal wait states, rework, exception clusters, handoffs, and adoption friction. Use that evidence to prioritize workflow observation, map refresh, and change candidates. Preserve event provenance, segment, time window, and privacy controls. Do not turn a process map or inferred bottleneck into a policy decision or a model instruction.

## Service-review questions

- Does the map cover every source that materially affects the released decision or effect?
- Are stale, missing, or inferred relationships visible rather than silently treated as facts?
- Did any release, incident, or operator correction reveal an unmodeled dependency?
- Do change-impact assessments predict actual operational, user, safety, cost, and adoption effects well enough to justify their maintenance cost?
- Can the service operate safely when the map is unavailable?

If the answer to the final question is no, the map has become an ungoverned control plane and must be redesigned.
