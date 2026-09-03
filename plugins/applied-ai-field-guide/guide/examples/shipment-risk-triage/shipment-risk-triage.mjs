import { createHash } from "node:crypto";

const policy = Object.freeze({
  version: "shipment-routing-policy@1.0.0",
  reviewScoreThreshold: 0.8,
  reviewValueThresholdUsd: 10000,
  evidenceFreshnessMs: 5 * 60 * 1000,
  maxCostUsd: 0.2,
});

const requiredScopes = Object.freeze({ read: "shipment:read", stage: "shipment-review:stage" });

function codeError(code, message) {
  return Object.assign(new Error(message), { code });
}

function hasScope(caller, scope) {
  return Array.isArray(caller?.scopes) && caller.scopes.includes(scope);
}

function isFresh(timestamp, now) {
  const observedAt = Date.parse(timestamp);
  const current = Date.parse(now);
  return Number.isFinite(observedAt) && Number.isFinite(current)
    && observedAt <= current
    && current - observedAt <= policy.evidenceFreshnessMs;
}

function deterministicExplanation(context, assessment, route) {
  return {
    source: "deterministic_fallback",
    summary: `Route ${route}: delay risk ${assessment.score.toFixed(2)} with shipment value ${context.shipment_value_usd}.`,
    evidence_refs: [`shipment:${context.shipment_id}@${context.revision}`, `risk:${assessment.assessment_id}@${assessment.model_version}`],
  };
}

function validModelExplanation(candidate) {
  return candidate
    && typeof candidate.summary === "string"
    && candidate.summary.length > 0
    && candidate.summary.length <= 500
    && Array.isArray(candidate.evidence_refs)
    && candidate.evidence_refs.length > 0
    && candidate.evidence_refs.every((reference) => typeof reference === "string" && reference.length > 0);
}

function proposalDigest(context, assessment, selectedRoute) {
  const material = JSON.stringify({
    evidence_revision: context.revision,
    model_version: assessment.model_version,
    route: selectedRoute,
    score: assessment.score,
    shipment_id: context.shipment_id,
  });
  return `sha256:${createHash("sha256").update(material).digest("hex")}`;
}

function validateContext(context, input, now) {
  if (!context || context.tenant_id !== input.tenant_id || context.shipment_id !== input.shipment_id) {
    throw codeError("CONTEXT_IDENTITY_MISMATCH", "shipment context does not match the authorized request");
  }
  if (context.status !== "in_transit" || !Number.isFinite(context.shipment_value_usd) || context.shipment_value_usd < 0) {
    throw codeError("CONTEXT_INVALID", "shipment context is not eligible for risk triage");
  }
  if (!isFresh(context.observed_at, now)) {
    throw codeError("EVIDENCE_STALE", "shipment or carrier evidence is stale");
  }
  return context;
}

function validateAssessment(assessment, context, now) {
  if (!assessment
    || typeof assessment.assessment_id !== "string"
    || typeof assessment.model_version !== "string"
    || !Number.isFinite(assessment.score)
    || assessment.score < 0
    || assessment.score > 1
    || assessment.evidence_revision !== context.revision
    || !isFresh(assessment.observed_at, now)) {
    throw codeError("RISK_SCORE_INVALID", "risk assessment is missing, stale, out of range, or bound to different evidence");
  }
  return assessment;
}

function route(context, assessment) {
  return assessment.score >= policy.reviewScoreThreshold && context.shipment_value_usd >= policy.reviewValueThresholdUsd
    ? "review_required"
    : "no_action";
}

function terminal(state, stopReason, trace, artifacts = {}) {
  trace.push({ state, stop_reason: stopReason });
  return { state, stop_reason: stopReason, policy_version: policy.version, trace, ...artifacts };
}

export async function runShipmentRiskTriage(input, deps) {
  if (!input?.tenant_id || !input?.shipment_id || !input?.business_operation_id || !input?.caller?.id) {
    throw new TypeError("tenant_id, shipment_id, business_operation_id, and caller.id are required");
  }
  for (const dependency of ["loadShipmentContext", "predictDelayRisk", "renderReviewExplanation", "createReviewCase", "cost", "now"]) {
    if (typeof deps?.[dependency] !== "function") throw new TypeError(`missing dependency ${dependency}`);
  }

  const trace = [];
  const now = deps.now();
  if (input.caller.tenant_id !== input.tenant_id || !hasScope(input.caller, requiredScopes.read)) {
    return terminal("denied", "caller_not_authorized_for_shipment_read", trace);
  }

  let context;
  try {
    trace.push({ state: "reading_context" });
    context = validateContext(await deps.loadShipmentContext({
      tenant_id: input.tenant_id,
      shipment_id: input.shipment_id,
      caller: input.caller,
    }), input, now);
  } catch (error) {
    return terminal("escalated", error.code ?? "context_unavailable", trace);
  }

  let assessment;
  try {
    trace.push({ state: "scoring_risk" });
    assessment = validateAssessment(await deps.predictDelayRisk(context), context, now);
  } catch (error) {
    return terminal("escalated", error.code ?? "risk_scoring_unavailable", trace, { context });
  }

  const selectedRoute = route(context, assessment);
  trace.push({ state: "policy_routed", route: selectedRoute });
  if (selectedRoute === "no_action") {
    return terminal("no_action", "policy_no_review_required", trace, { context, assessment, route: selectedRoute });
  }

  if (!Number.isFinite(deps.cost()) || deps.cost() < 0 || deps.cost() > policy.maxCostUsd) {
    return terminal("escalated", "budget_exhausted", trace, { context, assessment, route: selectedRoute });
  }
  if (!hasScope(input.caller, requiredScopes.stage)) {
    return terminal("denied", "caller_not_authorized_to_stage_review", trace, { context, assessment, route: selectedRoute });
  }

  let explanation;
  try {
    trace.push({ state: "rendering_explanation" });
    const candidate = await deps.renderReviewExplanation({ context, assessment, route: selectedRoute });
    explanation = validModelExplanation(candidate)
      ? { source: "foundation_model", summary: candidate.summary, evidence_refs: candidate.evidence_refs }
      : deterministicExplanation(context, assessment, selectedRoute);
  } catch {
    explanation = deterministicExplanation(context, assessment, selectedRoute);
  }

  try {
    trace.push({ state: "staging_review_case" });
    const receipt = await deps.createReviewCase({
      tenant_id: input.tenant_id,
      business_operation_id: input.business_operation_id,
      shipment_id: context.shipment_id,
      shipment_revision: context.revision,
      routing_policy_version: policy.version,
      route: selectedRoute,
      risk_score: assessment.score,
      model_version: assessment.model_version,
      evidence_revision: assessment.evidence_revision,
      proposal_digest: proposalDigest(context, assessment, selectedRoute),
      explanation,
      caller: input.caller,
    });
    if (!receipt || receipt.status !== "staged" || typeof receipt.proposal_id !== "string" || typeof receipt.proposal_digest !== "string") {
      throw codeError("REVIEW_CASE_INVALID", "review-case service did not return a staged case receipt");
    }
    const reviewCase = { review_case_id: receipt.proposal_id, proposal_digest: receipt.proposal_digest, status: receipt.status };
    return terminal("review_ready", "coordinator_review_required", trace, {
      context,
      assessment,
      route: selectedRoute,
      explanation,
      review_case: reviewCase,
    });
  } catch (error) {
    return terminal("escalated", error.code ?? "review_case_unavailable", trace, { context, assessment, route: selectedRoute, explanation });
  }
}

export const shipmentRiskTriagePolicy = policy;
