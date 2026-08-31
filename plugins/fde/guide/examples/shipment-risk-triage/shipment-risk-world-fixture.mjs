export const baseShipmentRiskInput = Object.freeze({
  tenant_id: "tenant-a",
  shipment_id: "ship-100",
  business_operation_id: "review-ship-100-policy-1",
  caller: {
    id: "dispatch-coordinator-1",
    tenant_id: "tenant-a",
    scopes: ["shipment:read", "shipment-review:stage"],
  },
});

function copy(value) {
  return structuredClone(value);
}

export function createShipmentRiskWorld(options = {}) {
  const now = options.now ?? "2026-08-08T15:00:00.000Z";
  const state = {
    context: {
      tenant_id: "tenant-a",
      shipment_id: "ship-100",
      revision: "shipment-r7",
      status: "in_transit",
      shipment_value_usd: 24000,
      promised_arrival: "2026-08-10T15:00:00.000Z",
      observed_at: "2026-08-08T14:58:00.000Z",
      carrier_signals: { event: "delayed_departure", delay_minutes: 210 },
      ...(options.context ?? {}),
    },
    assessment: {
      assessment_id: "risk-ship-100-r7",
      model_version: "delay-risk-model@1.0.0",
      score: 0.91,
      evidence_revision: "shipment-r7",
      observed_at: "2026-08-08T14:59:00.000Z",
      ...(options.assessment ?? {}),
    },
    calls: [],
    reviewCases: [],
    reviewByOperation: new Map(),
    costUsd: options.costUsd ?? 0.08,
  };

  const deps = {
    now: () => now,
    cost: () => state.costUsd,
    loadShipmentContext: async (request) => {
      state.calls.push({ operation: "read_shipment_context", request: copy(request) });
      if (request.tenant_id !== state.context.tenant_id || request.caller?.tenant_id !== state.context.tenant_id) {
        throw Object.assign(new Error("tenant denied"), { code: "POLICY_DENIED" });
      }
      return copy(state.context);
    },
    predictDelayRisk: async (context) => {
      state.calls.push({ operation: "predict_delay_risk", context: copy(context) });
      if (options.modelError) throw new Error("model unavailable");
      return copy(state.assessment);
    },
    renderReviewExplanation: async (request) => {
      state.calls.push({ operation: "render_review_explanation", request: copy(request) });
      if (options.explanationError) throw new Error("explanation unavailable");
      return copy(options.explanation ?? {
        summary: "Carrier departure delay and model score exceed the review threshold.",
        evidence_refs: [`shipment:${request.context.shipment_id}@${request.context.revision}`, `risk:${request.assessment.assessment_id}@${request.assessment.model_version}`],
      });
    },
    createReviewCase: async (request) => {
      state.calls.push({ operation: "create_review_case", request: copy(request) });
      if (request.caller?.tenant_id !== state.context.tenant_id || !request.caller?.scopes?.includes("shipment-review:stage")) {
        throw Object.assign(new Error("stage denied"), { code: "POLICY_DENIED" });
      }
      if (request.shipment_revision !== state.context.revision || request.evidence_revision !== state.context.revision) {
        throw Object.assign(new Error("stale evidence"), { code: "STALE_EVIDENCE" });
      }
      const existing = state.reviewByOperation.get(request.business_operation_id);
      if (existing) return copy(existing);
      const reviewCase = { proposal_id: `case-${state.reviewCases.length + 1}`, proposal_digest: request.proposal_digest, status: "staged" };
      state.reviewCases.push({ ...copy(request), ...reviewCase });
      state.reviewByOperation.set(request.business_operation_id, reviewCase);
      return copy(reviewCase);
    },
  };
  return { state, deps };
}
