import assert from "node:assert/strict";
import test from "node:test";
import { nextMove } from "../plugins/applied-ai-field-guide/mcp/tools.mjs";

const stages = ["field-observation", "workflow-charter", "value-case", "data-context-manifest", "intelligence-selection-record", "enterprise-integration-map", "production-system-design", "secure-action-boundary-review", "approved-delivery-slice", "evaluation-report", "production-service-readiness", "customer-enablement-handoff", "production-service-review"];
function state() { return { engagement: { engagement_id: "practice" }, sources: [], artifacts: [], decisions: [] }; }
function evidence(target, covers, { accepted = true, ownership } = {}) {
  const id = `existing-record-${target.artifacts.length}`;
  const artifact = { artifact_id: id, artifact_type: "native-team-record", revision: 1, content_digest: `digest-${id}`,
    depends_on: [], dependency_bindings: [], source_bindings: [], routing: { covers, rationale: "Synthetic reviewed source packet", applicability: "applicable", ...(ownership ? { ownership } : {}) } };
  target.artifacts.push(artifact);
  if (accepted) target.decisions.push({ decision_id: `review-${id}`, decision_kind: "artifact_review", disposition: "accept", artifact_binding: { ref: id, revision: 1, digest: artifact.content_digest } });
  return artifact;
}

test("incomplete brief routes to an observation, not architecture or model selection", () => {
  assert.equal(nextMove(state()).stage, "field-observation");
});
test("reviewed native records enter at the actual evidence gap without duplicate templates", () => {
  const target = state(); evidence(target, stages.slice(0, 8));
  assert.equal(nextMove(target).stage, "approved-delivery-slice");
});
test("deterministic delivery uses equivalent software evals and retains safety and readiness checks", () => {
  const target = state(); evidence(target, stages.slice(0, 9));
  assert.equal(nextMove(target).stage, "evaluation-report");
  evidence(target, ["evaluation-report"]);
  assert.equal(nextMove(target).stage, "production-service-readiness");
});
test("failed economics or conflicting authority blocks even a complete evidence packet", () => {
  for (const kind of ["engagement_disposition", "field_move"]) {
    const target = state(); evidence(target, stages);
    target.decisions.push({ decision_id: "stop-current", decision_kind: kind, decision_stream_id: "value-or-authority", disposition: "stop", scope: "negative economics or unresolved controller authority" });
    assert.equal(nextMove(target).stage, "stopped"); assert.equal(nextMove(target).skill, null);
  }
});
test("equivalent evidence must be reviewed at the exact revision; stale dependencies block", () => {
  const target = state(); const artifact = evidence(target, stages);
  artifact.revision = 2; assert.notEqual(nextMove(target).stage, "operate");
  artifact.revision = 1; artifact.dependency_bindings = [{ ref: "missing-upstream", revision: 1, digest: "stale" }];
  assert.equal(nextMove(target).stage, "change-impact");
});
test("retained team proves operating capability without an artificial vendor exit", () => {
  const target = state(); evidence(target, stages, { ownership: "retained" });
  assert.equal(nextMove(target).stage, "operate"); assert.equal(nextMove(target).ownership, "retained");
  assert.match(nextMove(target).move, /capacity and backup/);
});
test("ambiguous coverage and an unreviewed replacement never silently complete a stage", () => {
  const target = state(); evidence(target, ["field-observation"]); evidence(target, ["field-observation"]);
  assert.equal(nextMove(target).skill, "$run-ai-engagement");
  const incomplete = state(); evidence(incomplete, stages, { accepted: false });
  assert.equal(nextMove(incomplete).stage, "field-observation");
});

test("withdrawing coverage in a newer revision cannot reuse historical acceptance", () => {
  for (const disposition of [undefined, "accept", "revise"]) {
    const target = state(); const prior = evidence(target, stages, { ownership: "retained" });
    const replacement = { ...prior, revision: 2, routing: { ...prior.routing, covers: stages.slice(1), ownership: undefined } };
    target.artifacts.push(replacement);
    if (disposition) target.decisions.push({ decision_id: "review-new", decision_kind: "artifact_review", disposition, artifact_binding: { ref: prior.artifact_id, revision: 2, digest: prior.content_digest } });
    assert.equal(nextMove(target).stage, "field-observation");
  }
});

test("a rejected replacement preserves the prior accepted coverage", () => {
  const target = state(); const prior = evidence(target, stages);
  target.artifacts.push({ ...prior, revision: 2, routing: { ...prior.routing, covers: [] } });
  target.decisions.push({ decision_id: "review-rejected", decision_kind: "artifact_review", disposition: "reject", artifact_binding: { ref: prior.artifact_id, revision: 2, digest: prior.content_digest } });
  assert.equal(nextMove(target).stage, "operate");
});
