// Fixed local schema registry. Never load an artifact-supplied URL or executable.
import * as contract from "./contract-invariants.mjs";
import * as governance from "./governance-invariants.mjs";

export { artifactTypes } from "./artifact-type-names.mjs";

const semanticChecks = {
  "ai-value-engineering-scorecard": contract.valueScorecardSemanticErrors,
  "capability-manifest": governance.capabilityManifestSemanticErrors,
  "change-impact-assessment": (document, label) => contract.changeImpactAssessmentSemanticErrors(document, null, label),
  "data-context-manifest": governance.dataContextManifestSemanticErrors,
  "effect-receipt": governance.effectReceiptSemanticErrors,
  "engagement-reframe": governance.engagementReframeSemanticErrors,
  "evaluation-case": contract.evaluationCaseSemanticErrors,
  "evaluation-report": contract.evaluationReportSemanticErrors,
  "handoff-envelope": governance.handoffEnvelopeSemanticErrors,
  "operational-ontology": governance.operationalOntologySemanticErrors,
  "solution-release": contract.solutionReleaseSemanticErrors,
  "system-map-manifest": contract.systemMapManifestSemanticErrors,
  "tool-contract": contract.toolContractSemanticErrors,
  "trace-event": governance.traceEventSemanticErrors,
  "workflow-charter": governance.workflowCharterSemanticErrors,
};

export function artifactSemanticErrors(type, document, label) {
  return semanticChecks[type]?.(document, label) ?? [];
}
