# Business-Flow and Vertical-Solution Evidence Note

**Reviewed:** 2026-08-09

This note records primary sources used to shape the solution portfolio. The portable patterns are narrower than the source platforms, regulations, or standards. None of these sources proves that a generic profile satisfies a target organization's obligations or produces value.

### VS26-01

- **Source:** Palantir, [Use case lifecycle](https://www.palantir.com/docs/foundry/use-case-life-cycle/overview)
- **Source type:** Official product and delivery documentation
- **Reviewed:** 2026-08-09
- **Finding:** A use case is framed around capabilities for named users and measurable outcomes rather than “integrate system X” or “apply technique Y.” The method decomposes functional outcomes into data enrichment, domain structure, interaction, and implementation patterns.
- **Portable pattern:** Start a solution profile with the operational outcome, user, decision, and functional requirements. Select implementation mechanisms afterward.
- **Caveat:** The documentation describes Palantir's platform and delivery method. This guide adopts the outcome-led decomposition, not the product architecture or vendor claims.

### VS26-02

- **Source:** Palantir, [What is an operational application?](https://www.palantir.com/docs/foundry/app-building/operational-apps)
- **Source type:** Official product documentation
- **Reviewed:** 2026-08-09
- **Finding:** An operational application supports a specific decision process and captures decisions through governed writeback, rather than stopping at read-only insight.
- **Portable pattern:** A solution dossier must show the persistent work surface, permitted action, policy boundary, source-of-truth result, and outcome feedback—not only retrieval or generated output.
- **Caveat:** This does not imply that every workflow should write automatically or use a specific application framework.

### VS26-03

- **Source:** Palantir, [Why create an Ontology?](https://www.palantir.com/docs/foundry/ontology/why-ontology)
- **Source type:** Official product documentation
- **Reviewed:** 2026-08-09
- **Finding:** The documented decision model joins data, logic, action, and security and allows deterministic logic, optimization, conventional ML, multimodal models, agents, and people to participate under one operational model.
- **Portable pattern:** Model domain identity, evidence, logic, action, and security together. Treat an agent as one optional decision mechanism.
- **Caveat:** A graph or vendor ontology is not required. The target source systems and policies remain authoritative.

### VS26-04

- **Source:** Palantir, [Operational process coordination](https://www.palantir.com/docs/foundry/use-case-patterns/operational-process-coordination)
- **Source type:** Official solution-pattern documentation
- **Reviewed:** 2026-08-09
- **Finding:** Operational coordination patterns combine a work inbox, an operational process model, source integration, decisions, and downstream actions across recurring domains.
- **Portable pattern:** Reuse business-flow state machines across industries, then specialize domain objects, evidence, authority, and operating measures.
- **Caveat:** Delivery-speed and product-capability statements remain vendor claims and are not used as guide thresholds.

### VS26-05

- **Source:** U.S. Centers for Medicare & Medicaid Services, [CMS Interoperability and Prior Authorization Final Rule](https://www.cms.gov/initiatives/burden-reduction/overview/interoperability/policies-regulations/cms-interoperability-prior-authorization-final-rule-cms-0057-f)
- **Source type:** Official regulatory and implementation information
- **Published:** 2024-01-17; page reviewed and modified 2026-07-21
- **Reviewed:** 2026-08-09
- **Finding:** The rule addresses data exchange, prior-authorization processes, APIs, process requirements, and public metrics for specified impacted payers, with provisions and API requirements on different timelines.
- **Portable pattern:** Model payer/provider/patient scope, request state, supporting evidence, external acknowledgments, turnaround, and process metrics separately; do not infer conformance from generic FHIR support.
- **Caveat:** Scope, deadlines, covered services, standards, enforcement, and organizational obligations require current legal and implementation review. The healthcare profile is not compliance guidance.

### VS26-06

- **Sources:** HL7, [FHIR ServiceRequest R5](https://hl7.org/fhir/servicerequest.html) and [FHIR Task R5](https://hl7.org/fhir/task.html)
- **Source type:** Official interoperability specification
- **Published:** FHIR R5, 2023
- **Reviewed:** 2026-08-09
- **Finding:** `ServiceRequest` represents intent for a service, while `Task` can track administrative work toward fulfillment with explicit state, inputs, and outputs.
- **Portable pattern:** Keep the requested service, administrative coordination work, evidence, and fulfillment result as separate objects and lifecycles.
- **Caveat:** Both resources have maturity and implementation considerations. A target deployment must choose the applicable FHIR version, implementation guides, profiles, terminology, and transaction contracts.

### VS26-07

- **Sources:** U.S. Financial Crimes Enforcement Network, [Suspicious Activity Report Supporting Documentation](https://www.fincen.gov/resources/statutes-regulations/guidance/suspicious-activity-report-supporting-documentation) and [Maintaining the Confidentiality of Suspicious Activity Reports](https://www.fincen.gov/sites/default/files/shared/FIN-2010-A014.pdf)
- **Source type:** Official regulatory guidance
- **Published:** 2007-06-13 and 2010-11-23
- **Reviewed:** 2026-08-09
- **Finding:** Supporting records must remain connected to the institution's determination, and SAR information is subject to specific confidentiality restrictions.
- **Portable pattern:** Keep claims attributable to evidence, restrict case information by purpose and role, prevent sensitive case data from entering broad model context or telemetry, and separate investigation assistance from authorized filing or account action.
- **Caveat:** Requirements vary by institution, activity, jurisdiction, and current regulation. The financial-services profile is not legal, BSA/AML, filing, or model-risk guidance.

### VS26-08

- **Sources:** NIST NCCoE, [Operational Technology Asset Management](https://www.nccoe.nist.gov/ot/asset-management) and NIST SP 800-82 Rev. 3, [Guide to Operational Technology Security](https://csrc.nist.gov/pubs/sp/800/82/r3/final)
- **Source type:** Official cybersecurity guidance
- **Published:** NIST SP 800-82 Rev. 3, 2023-09; NCCoE page reviewed 2026-08-09
- **Reviewed:** 2026-08-09
- **Finding:** OT security depends on accurate asset visibility and must account for operational constraints, safety, availability, topology, and differences from ordinary IT systems.
- **Portable pattern:** Bind signals, models, work items, network policy, and operator actions to authoritative asset and operating context; keep model assistance outside equipment control and safety authority.
- **Caveat:** Asset visibility is necessary but not sufficient for functional safety, control-system security, or operational correctness.
