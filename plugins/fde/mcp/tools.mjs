import { spawnSync } from "node:child_process";
import { lstat, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
  FdeError,
  cleanupNewFile,
  digest,
  initializeEngagement,
  loadConfig,
  loadEngagement,
  mutateEngagement,
  readWorkspaceFile,
  requireClassification,
  requireIdentifier,
  requireString,
  safeGuideFile,
  writeImmutableFile,
} from "./workspace.mjs";

const formats = new Set(["md", "json", "yaml", "txt"]);
const artifactStatuses = new Set(["draft", "proposed"]);
const decisionKinds = new Set(["engagement_disposition", "artifact_review", "release_gate", "field_move", "change_disposition"]);
const allowedDispositions = new Set([
  "continue_discovery", "bounded_kickoff", "defer", "stop", "accept", "reject", "revise",
  "proceed", "constrain", "pause", "rollback", "retire", "review_required",
]);
const validationTypes = new Set(["workflow-charter", "engagement-reframe", "data-context-manifest"]);
const sourceAuthorityStatuses = new Set(["system_of_record", "authoritative_policy", "owner_attested", "observed", "supporting", "unverified"]);
const classificationRank = new Map([["public", 0], ["internal", 1], ["confidential", 2], ["restricted", 3]]);
const dispositionsByKind = new Map([
  ["engagement_disposition", new Set(["continue_discovery", "bounded_kickoff", "defer", "stop"])],
  ["artifact_review", new Set(["accept", "reject", "revise"])],
  ["release_gate", new Set(["proceed", "constrain", "pause", "rollback"])],
  ["field_move", new Set(["proceed", "defer", "stop", "review_required"])],
  ["change_disposition", new Set(["accept", "reject", "revise", "constrain", "pause", "rollback", "review_required"])],
]);

function ensureArray(value, field, { max = 100 } = {}) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > max) throw new FdeError("INVALID_INPUT", `${field} must be an array with at most ${max} entries`);
  return value;
}

function knownRefs(state) {
  return new Set([
    state.engagement.engagement_id,
    ...state.sources.map(({ source_id: id }) => id),
    ...state.artifacts.map(({ artifact_id: id }) => id),
    ...state.decisions.map(({ decision_id: id }) => id),
  ]);
}

function requireKnownRefs(state, values, field) {
  const known = knownRefs(state);
  const refs = ensureArray(values, field).map((value) => requireIdentifier(value, field));
  const missing = refs.filter((value) => !known.has(value));
  if (missing.length > 0) throw new FdeError("UNKNOWN_REFERENCE", `${field} contains unknown references`, { missing });
  return [...new Set(refs)];
}

function requireSourceRefs(state, values, field) {
  const refs = ensureArray(values, field).map((value) => requireIdentifier(value, field));
  const sources = new Set(state.sources.map(({ source_id: id }) => id));
  const invalid = refs.filter((value) => !sources.has(value));
  if (invalid.length > 0) throw new FdeError("REFERENCE_TYPE_MISMATCH", `${field} accepts source references only`, { invalid });
  return [...new Set(refs)];
}

function requireArtifactRefs(state, values, field) {
  const refs = ensureArray(values, field).map((value) => requireIdentifier(value, field));
  const artifacts = new Set(state.artifacts.map(({ artifact_id: id }) => id));
  const invalid = refs.filter((value) => !artifacts.has(value));
  if (invalid.length > 0) throw new FdeError("REFERENCE_TYPE_MISMATCH", `${field} accepts artifact references only`, { invalid });
  return [...new Set(refs)];
}

function latestArtifacts(state, predicate = () => true) {
  const current = new Map();
  for (const artifact of state.artifacts.filter(predicate)) {
    const prior = current.get(artifact.artifact_id);
    if (!prior || artifact.revision > prior.revision) current.set(artifact.artifact_id, artifact);
  }
  return [...current.values()].sort((left, right) => left.artifact_id.localeCompare(right.artifact_id));
}

function currentDecisionHeads(state, kind) {
  const decisions = state.decisions.filter(({ decision_kind: decisionKind }) => decisionKind === kind);
  const superseded = new Set(decisions.map(({ supersedes_decision_id: id }) => id).filter(Boolean));
  return decisions.filter(({ decision_id: id }) => !superseded.has(id));
}

function reviewForArtifactRevision(state, artifact) {
  return currentDecisionHeads(state, "artifact_review")
    .find(({ artifact_binding: binding }) => binding?.ref === artifact.artifact_id
      && binding.revision === artifact.revision
      && binding.digest === artifact.content_digest) || null;
}

function activeBlockingDecision(state, kind, dispositions) {
  const rank = new Map(dispositions.map((disposition, index) => [disposition, index]));
  return currentDecisionHeads(state, kind)
    .filter(({ disposition }) => rank.has(disposition))
    .sort((left, right) => (rank.get(left.disposition) - rank.get(right.disposition))
      || left.decision_stream_id.localeCompare(right.decision_stream_id))[0] || null;
}

function acceptedArtifacts(state) {
  const accepted = new Map();
  for (const artifact of state.artifacts) {
    if (reviewForArtifactRevision(state, artifact)?.disposition !== "accept") continue;
    const prior = accepted.get(artifact.artifact_id);
    if (!prior || artifact.revision > prior.revision) accepted.set(artifact.artifact_id, artifact);
  }
  return [...accepted.values()].sort((left, right) => left.artifact_id.localeCompare(right.artifact_id));
}

function currentArtifacts(state) {
  const accepted = new Map(acceptedArtifacts(state).map((artifact) => [artifact.artifact_id, artifact]));
  for (const latest of latestArtifacts(state)) {
    const review = reviewForArtifactRevision(state, latest);
    if (review?.disposition !== "reject") accepted.set(latest.artifact_id, latest);
  }
  return [...accepted.values()].sort((left, right) => left.artifact_id.localeCompare(right.artifact_id));
}

function staleArtifacts(state) {
  const current = new Map(currentArtifacts(state).map((artifact) => [artifact.artifact_id, artifact]));
  const sources = new Map(state.sources.map((source) => [source.source_id, source]));
  const stale = [];
  for (const artifact of currentArtifacts(state)) {
    const mismatches = [];
    for (const binding of artifact.dependency_bindings || []) {
      const target = current.get(binding.ref);
      if (!target || target.revision !== binding.revision || target.content_digest !== binding.digest) {
        mismatches.push({ ref: binding.ref, bound_revision: binding.revision, current_revision: target?.revision || null, kind: "artifact" });
      }
    }
    for (const binding of artifact.source_bindings || []) {
      const target = sources.get(binding.ref);
      if (!target || digest(target) !== binding.digest) mismatches.push({ ref: binding.ref, kind: "source" });
    }
    if (mismatches.length > 0) stale.push({ artifact_id: artifact.artifact_id, revision: artifact.revision, artifact_type: artifact.artifact_type, mismatches });
  }
  return stale;
}

function bindReference(state, reference) {
  if (reference === state.engagement.engagement_id) return { ref: reference, kind: "engagement", digest: digest(state.engagement) };
  const source = state.sources.find(({ source_id: id }) => id === reference);
  if (source) return { ref: reference, kind: "source", digest: digest(source), revision: source.revision };
  const artifact = currentArtifacts(state).find(({ artifact_id: id }) => id === reference);
  if (artifact) return { ref: reference, kind: "artifact", digest: artifact.content_digest, revision: artifact.revision };
  const decision = state.decisions.find(({ decision_id: id }) => id === reference);
  if (decision) return { ref: reference, kind: "decision", digest: digest(decision), decided_at: decision.decided_at };
  throw new FdeError("UNKNOWN_REFERENCE", `reference ${reference} cannot be bound`);
}

function requireAcyclicArtifactDependencies(state, artifactId, dependencies) {
  const artifacts = currentArtifacts(state);
  const artifactIds = new Set(artifacts.map(({ artifact_id: id }) => id));
  artifactIds.add(artifactId);
  const graph = new Map(artifacts.map((artifact) => [artifact.artifact_id, artifact.depends_on.filter((reference) => artifactIds.has(reference))]));
  graph.set(artifactId, dependencies.filter((reference) => artifactIds.has(reference)));
  const active = new Set();
  const complete = new Set();
  const visit = (node, trail) => {
    if (active.has(node)) throw new FdeError("DEPENDENCY_CYCLE", "artifact dependencies contain a cycle", { cycle: [...trail, node] });
    if (complete.has(node)) return;
    active.add(node);
    for (const dependency of graph.get(node) || []) visit(dependency, [...trail, node]);
    active.delete(node);
    complete.add(node);
  };
  visit(artifactId, []);
}

function assertGloballyAvailableId(state, identifier, expectedKind) {
  const kinds = [];
  if (state.engagement.engagement_id === identifier) kinds.push("engagement");
  if (state.sources.some(({ source_id: id }) => id === identifier)) kinds.push("source");
  if (state.artifacts.some(({ artifact_id: id }) => id === identifier)) kinds.push("artifact");
  if (state.decisions.some(({ decision_id: id }) => id === identifier)) kinds.push("decision");
  if (kinds.length > 0 && !(kinds.length === 1 && kinds[0] === expectedKind)) {
    throw new FdeError("IDENTIFIER_CONFLICT", `${identifier} is already used by ${kinds.join(", ")}`);
  }
}

function validateSchemaValue(schema, value, field) {
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new FdeError("INVALID_INPUT", `${field} must be an object`);
    const properties = schema.properties || {};
    const unknown = Object.keys(value).filter((key) => !(key in properties));
    if (schema.additionalProperties === false && unknown.length > 0) throw new FdeError("INVALID_INPUT", `${field} contains unknown fields`, { unknown });
    for (const required of schema.required || []) {
      if (!(required in value)) throw new FdeError("INVALID_INPUT", `${field}.${required} is required`);
    }
    for (const [key, item] of Object.entries(value)) validateSchemaValue(properties[key], item, `${field}.${key}`);
    return;
  }
  if (schema.type === "string") {
    if (typeof value !== "string") throw new FdeError("INVALID_INPUT", `${field} must be a string`);
    if (schema.minLength !== undefined && value.length < schema.minLength) throw new FdeError("INVALID_INPUT", `${field} is too short`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) throw new FdeError("INVALID_INPUT", `${field} is too long`);
  } else if (schema.type === "integer") {
    if (!Number.isInteger(value)) throw new FdeError("INVALID_INPUT", `${field} must be an integer`);
    if (schema.minimum !== undefined && value < schema.minimum) throw new FdeError("INVALID_INPUT", `${field} is below its minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) throw new FdeError("INVALID_INPUT", `${field} is above its maximum`);
  } else if (schema.type === "boolean") {
    if (typeof value !== "boolean") throw new FdeError("INVALID_INPUT", `${field} must be a boolean`);
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) throw new FdeError("INVALID_INPUT", `${field} must be an array`);
    if (schema.minItems !== undefined && value.length < schema.minItems) throw new FdeError("INVALID_INPUT", `${field} has too few entries`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) throw new FdeError("INVALID_INPUT", `${field} has too many entries`);
    value.forEach((entry, index) => validateSchemaValue(schema.items, entry, `${field}[${index}]`));
  }
  if (schema.enum && !schema.enum.includes(value)) throw new FdeError("INVALID_INPUT", `${field} is outside the supported vocabulary`);
}

function markdownText(value) {
  return String(value).replace(/[\r\n\t]+/g, " ").replace(/([\\`*_{}\[\]<>])/g, "\\$1").trim();
}

function summarizeText(value, maxCharacters = 240) {
  const text = markdownText(value);
  return text.length <= maxCharacters ? text : `${text.slice(0, maxCharacters - 1)}…`;
}

function summarizeRefs(values, maxItems = 5) {
  const refs = values || [];
  const shown = refs.slice(0, maxItems).join(", ");
  return refs.length <= maxItems ? (shown || "none") : `${shown} (+${refs.length - maxItems} more)`;
}

function summarizeArtifactCandidates(artifacts, maxItems = 5) {
  return summarizeRefs(artifacts.map(({ artifact_id: artifactId, revision }) => `${artifactId} r${revision}`), maxItems);
}

function boundedPage(items, { offset = 0, limit = 20, maxBytes = 96 * 1024, map = (value) => value } = {}) {
  const page = [];
  let bytes = 2;
  let index = offset;
  while (index < items.length && page.length < limit) {
    const candidate = map(items[index]);
    const candidateBytes = Buffer.byteLength(JSON.stringify(candidate)) + (page.length > 0 ? 1 : 0);
    if (bytes + candidateBytes > maxBytes) break;
    page.push(candidate);
    bytes += candidateBytes;
    index += 1;
  }
  return { items: page, total: items.length, offset, returned: page.length, next_offset: index < items.length ? index : null, byte_bounded: index < items.length && page.length < limit };
}

function boundedMarkdownSection(lines, maxBytes) {
  const kept = [];
  let bytes = 0;
  for (const line of lines) {
    const lineBytes = Buffer.byteLength(`${line}\n`);
    if (bytes + lineBytes > maxBytes) break;
    kept.push(line);
    bytes += lineBytes;
  }
  return { body: kept.join("\n") || "- None recorded.", returned: kept.length, total: lines.length };
}

function requireRfc3339Timestamp(value, field) {
  const candidate = requireString(value, field, { max: 100 });
  const match = candidate.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/);
  if (!match) throw new FdeError("INVALID_INPUT", `${field} must be an RFC 3339 timestamp with an explicit timezone`);
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, millisecondText = "0", zone, sign, offsetHourText = "0", offsetMinuteText = "0"] = match;
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const milliseconds = Number(millisecondText.padEnd(3, "0"));
  const offsetHour = Number(offsetHourText);
  const offsetMinute = Number(offsetMinuteText);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59) {
    throw new FdeError("INVALID_INPUT", `${field} contains an invalid calendar date or time`);
  }
  const offset = zone === "Z" ? 0 : (sign === "+" ? 1 : -1) * ((offsetHour * 60) + offsetMinute) * 60_000;
  const expected = Date.UTC(year, month - 1, day, hour, minute, second, milliseconds) - offset;
  if (Date.parse(candidate) !== expected) throw new FdeError("INVALID_INPUT", `${field} contains an invalid RFC 3339 timestamp`);
  return new Date(expected).toISOString();
}

function requireEngagementModelContextPolicy(config, state) {
  if (state.engagement.classification === "restricted") {
    throw new FdeError("RESTRICTED_CONTENT_DENIED", "restricted engagements are unsupported at this model-visible boundary");
  }
  if (state.engagement.classification === "confidential" && !config.allowConfidentialModelContext) {
    throw new FdeError("MODEL_CONTEXT_POLICY_DENIED", "confidential engagement use requires allow_confidential_model_context in the machine-local FDE configuration");
  }
}

function nextMove(state) {
  const latest = latestArtifacts(state);
  const current = currentArtifacts(state);
  const accepted = acceptedArtifacts(state);
  const acceptedTypes = new Set(accepted.map(({ artifact_type: type }) => type));
  const engagementBlocker = activeBlockingDecision(state, "engagement_disposition", ["stop", "defer"]);
  const steps = [
    [["field-observation", "field-observation-log"], "field-observation", "Observe one representative case with the process knower and register its governed source metadata.", "$qualify-ai-workflow"],
    [["workflow-charter"], "workflow-charter", "Charter the accepted outcome, verifier, population, owners, guardrails, and risk ceiling.", "$qualify-ai-workflow"],
    [["value-case"], "value-case", "Test the outcome economics, full cost, adoption, hard gates, and stop threshold.", "$engineer-ai-value"],
    [["data-context-manifest"], "data-context-manifest", "Prove decision-scoped source authority, quality, preparation, lineage, privacy, and failure behavior.", "$assess-ai-data-readiness"],
    [["intelligence-selection", "intelligence-selection-record"], "intelligence-selection-record", "Select the smallest sufficient mechanism for each consequential decision step.", "$select-ai-mechanism"],
    [["integration-map", "enterprise-integration-map", "system-map-manifest"], "enterprise-integration-map", "Open the source, reconciliation, identity, execution, environment, and ownership seams.", "$map-enterprise-integration"],
    [["production-system-design", "architecture-decision-record"], "production-system-design", "Design the production boundary, state, contracts, failures, telemetry, and operating model for the approved mechanism.", "$design-production-ai-system"],
    [["secure-action-boundary-review"], "secure-action-boundary-review", "Prove the trusted read and effect boundary, or record why the approved slice has no governed read or action path.", "$secure-ai-action-boundary"],
    [["delivery-slice", "approved-delivery-slice", "delivery-and-adoption-plan"], "approved-delivery-slice", "Build and validate one approved vertical slice through the real operator surface.", "$deliver-approved-ai-slice"],
    [["evaluation-report"], "evaluation-report", "Run representative, failure, adversarial, operational, and adoption evaluation for the exact candidate.", "$build-ai-evaluation"],
    [["production-service-readiness"], "production-service-readiness", "Review the exact release evidence, gaps, rollout, rollback, and receiving ownership.", "$review-ai-production-readiness"],
    [["customer-handoff", "customer-enablement-handoff"], "customer-enablement-handoff", "Exercise the receiving team's ability to operate, change, recover, support, and retire the service.", "$transfer-ai-service"],
    [["production-service-review"], "production-service-review", "Review realized outcome, adoption, reliability, safety, cost, ownership, and retirement evidence.", "$operate-ai-service"],
  ];
  if (engagementBlocker?.disposition === "stop") return { stage: "stopped", skill: null, decision_stream_id: engagementBlocker.decision_stream_id, move: `Preserve the record for ${engagementBlocker.scope}. Resume only when the named authority explicitly supersedes decision ${engagementBlocker.decision_id} in the same decision stream.` };
  if (engagementBlocker?.disposition === "defer") return { stage: "deferred", skill: "$run-fde-engagement", decision_stream_id: engagementBlocker.decision_stream_id, move: `Preserve the record for ${engagementBlocker.scope}. Resume only at its review trigger or when the named authority explicitly supersedes decision ${engagementBlocker.decision_id} in the same decision stream.` };
  const fieldBlocker = activeBlockingDecision(state, "field_move", ["stop", "defer", "review_required"]);
  if (fieldBlocker?.disposition === "stop") return { stage: "stopped", skill: null, decision_stream_id: fieldBlocker.decision_stream_id, move: `Preserve the field record for ${fieldBlocker.scope}. Resume only when the named authority explicitly supersedes decision ${fieldBlocker.decision_id} in the same decision stream.` };
  if (fieldBlocker?.disposition === "defer") return { stage: "deferred", skill: "$run-fde-engagement", decision_stream_id: fieldBlocker.decision_stream_id, move: `Hold the field move for ${fieldBlocker.scope} until its recorded review trigger or an explicit same-stream supersession of decision ${fieldBlocker.decision_id}.` };
  if (fieldBlocker?.disposition === "review_required") return { stage: "field-review", skill: "$run-fde-engagement", decision_stream_id: fieldBlocker.decision_stream_id, move: `Obtain the recorded field review for ${fieldBlocker.scope} before explicitly superseding decision ${fieldBlocker.decision_id}.` };
  const releaseBlocker = activeBlockingDecision(state, "release_gate", ["rollback", "pause", "constrain"]);
  if (releaseBlocker) {
    const verb = releaseBlocker.disposition === "rollback" ? "Execute and verify the recorded rollback" : releaseBlocker.disposition === "pause" ? "Keep the release paused" : "Honor the recorded release constraints";
    return { stage: `release-${releaseBlocker.disposition}`, skill: "$review-ai-production-readiness", decision_stream_id: releaseBlocker.decision_stream_id, move: `${verb} for ${releaseBlocker.scope}; progress only after the named authority explicitly supersedes decision ${releaseBlocker.decision_id} in the same release stream.` };
  }
  const changeBlocker = activeBlockingDecision(state, "change_disposition", ["rollback", "pause", "reject", "revise", "constrain", "review_required"]);
  if (changeBlocker) {
    return { stage: `change-${changeBlocker.disposition}`, skill: "$assess-ai-change-impact", decision_stream_id: changeBlocker.decision_stream_id, move: `Honor the recorded ${changeBlocker.disposition} disposition for ${changeBlocker.scope}, preserve prior accepted state, and explicitly supersede decision ${changeBlocker.decision_id} in the same change stream before promotion.` };
  }
  const stale = staleArtifacts(state);
  if (stale.length > 0) {
    return { stage: "change-impact", skill: "$assess-ai-change-impact", move: `Review ${stale.length} stale artifact projection${stale.length === 1 ? "" : "s"} against changed upstream revisions before progressing.` };
  }
  const currentReframes = current.filter(({ artifact_type: type }) => type === "engagement-reframe");
  const latestReframes = latest.filter(({ artifact_type: type }) => type === "engagement-reframe");
  const reframes = currentReframes.length > 0 ? currentReframes : latestReframes;
  if (reframes.length > 1) {
    return {
      stage: "engagement-reframe",
      skill: "$run-fde-engagement",
      move: `Resolve the ambiguous engagement-reframe projection: ${summarizeArtifactCandidates(reframes)}. Use engagement_status pages to inspect every candidate; preserve every stream and record an explicit scoped disposition before progressing.`,
    };
  }
  const reframe = reframes[0];
  const reframeReview = reframe ? reviewForArtifactRevision(state, reframe) : null;
  for (const [aliases, stage, move, skill] of steps) {
    if (stage === "workflow-charter" && reframe && reframeReview?.disposition !== "accept") {
      const reviewMove = reframeReview?.disposition === "reject"
        ? "The current reframe was rejected. Preserve it and record a revised proposal only if new evidence supports one."
        : reframeReview?.disposition === "revise"
          ? "Revise the current reframe and obtain a new exact-revision review before changing the charter."
          : "Review the current reframe with the named authority before chartering a changed boundary.";
      return { stage: "engagement-reframe", skill: "$reframe-ai-engagement", move: reviewMove };
    }
    const currentStageArtifacts = current.filter(({ artifact_type: type }) => aliases.includes(type));
    const latestStageArtifacts = latest.filter(({ artifact_type: type }) => aliases.includes(type));
    const stageArtifacts = currentStageArtifacts.length > 0 ? currentStageArtifacts : latestStageArtifacts;
    if (stageArtifacts.length > 1) {
      return {
        stage,
        skill: "$run-fde-engagement",
        move: `Resolve the ambiguous ${stage} projection: ${summarizeArtifactCandidates(stageArtifacts)}. Use engagement_status pages to inspect every candidate; preserve every stream and record an explicit scoped disposition before progressing.`,
      };
    }
    const latestForStage = stageArtifacts[0];
    const acceptedForStage = aliases.some((type) => acceptedTypes.has(type));
    if (latestForStage) {
      const review = reviewForArtifactRevision(state, latestForStage);
      if (review?.disposition === "revise") return { stage, skill, move: `Revise ${latestForStage.artifact_id} r${latestForStage.revision} and obtain a new exact-revision review.` };
      if (review?.disposition === "reject" && !acceptedForStage) return { stage, skill, move: `${latestForStage.artifact_id} r${latestForStage.revision} was rejected. Preserve it, then revise with new evidence or stop this route.` };
      if (!review && (!acceptedForStage || !accepted.some(({ artifact_id: id, revision }) => id === latestForStage.artifact_id && revision === latestForStage.revision))) {
        return { stage, skill, move: `Complete and obtain a scoped human review of ${latestForStage.artifact_id} r${latestForStage.revision} before moving on.` };
      }
    }
    if (!acceptedForStage) return { stage, skill, move };
  }
  return { stage: "operate", skill: "$operate-ai-service", move: "Review the live service and decide whether to improve, constrain, pause, transfer, or retire it." };
}

export const toolDefinitions = [
  {
    name: "guide_search",
    description: "Search the configured FDE Guide snapshot by query and optional stage. Read-only, engagement-independent, local filesystem only; results are bounded excerpts and never authority or customer evidence.",
    inputSchema: { type: "object", additionalProperties: false, required: ["query"], properties: { query: { type: "string", minLength: 2, maxLength: 200 }, stage: { type: "string", enum: ["field", "value", "data", "design", "delivery", "evaluation", "release", "operation", "transfer", "change"] }, limit: { type: "integer", minimum: 1, maximum: 10 } } },
  },
  {
    name: "engagement_list",
    description: "List bounded metadata for local FDE engagement workspaces so a fresh task can resume deliberately. Returns no source excerpts or artifact content and ignores non-engagement entries.",
    inputSchema: { type: "object", additionalProperties: false, properties: { classification: { type: "string", enum: ["public", "internal", "confidential"] }, limit: { type: "integer", minimum: 1, maximum: 100 } } },
  },
  {
    name: "engagement_start",
    description: "Create one local engagement workspace with an explicit tenant, workflow, classification, and retention boundary. Creates no customer-system record and grants no source or action authority.",
    inputSchema: { type: "object", additionalProperties: false, required: ["engagement_id", "title", "tenant", "workflow", "classification", "retention_summary"], properties: { engagement_id: { type: "string" }, title: { type: "string" }, tenant: { type: "string" }, workflow: { type: "string" }, classification: { type: "string", enum: ["public", "internal", "confidential"] }, retention_summary: { type: "string" } } },
  },
  {
    name: "engagement_status",
    description: "Read a byte-bounded, offset-pageable local projection for one engagement: boundary, counts, latest immutable revisions, decisions, and next evidence-bound move. Read-only and bounded to one engagement.",
    inputSchema: { type: "object", additionalProperties: false, required: ["engagement_id"], properties: { engagement_id: { type: "string" }, limit: { type: "integer", minimum: 1, maximum: 20 }, source_offset: { type: "integer", minimum: 0 }, artifact_offset: { type: "integer", minimum: 0 }, decision_offset: { type: "integer", minimum: 0 } } },
  },
  {
    name: "artifact_read_revision",
    description: "Read one bounded immutable artifact revision for continuity in a fresh task. Returns untrusted content only within the machine-local model-context policy; restricted state fails closed.",
    inputSchema: { type: "object", additionalProperties: false, required: ["engagement_id", "artifact_id"], properties: { engagement_id: { type: "string" }, artifact_id: { type: "string" }, revision: { type: "integer", minimum: 1 }, max_chars: { type: "integer", minimum: 256, maximum: 32000 } } },
  },
  {
    name: "source_register",
    description: "Append source metadata and an optional bounded excerpt supplied directly by the caller. Does not open external paths, URLs, email, browsers, cloud drives, or customer systems.",
    inputSchema: { type: "object", additionalProperties: false, required: ["operation_id", "engagement_id", "source_id", "title", "kind", "locator", "owner", "revision", "classification", "authority_status", "authority_basis", "freshness", "limitations"], properties: { operation_id: { type: "string" }, engagement_id: { type: "string" }, source_id: { type: "string" }, title: { type: "string" }, kind: { type: "string" }, locator: { type: "string" }, owner: { type: "string" }, revision: { type: "string" }, classification: { type: "string", enum: ["public", "internal", "confidential"] }, authority_status: { type: "string", enum: ["system_of_record", "authoritative_policy", "owner_attested", "observed", "supporting", "unverified"] }, authority_basis: { type: "string" }, freshness: { type: "string" }, limitations: { type: "string" }, excerpt: { type: "string", maxLength: 8000 } } },
  },
  {
    name: "artifact_save_revision",
    description: "Write a new immutable local artifact revision with declared source and artifact dependencies. Never overwrites a revision and does not accept, authorize, or release the artifact.",
    inputSchema: { type: "object", additionalProperties: false, required: ["operation_id", "engagement_id", "artifact_id", "artifact_type", "format", "content", "source_refs", "depends_on", "status"], properties: { operation_id: { type: "string" }, engagement_id: { type: "string" }, artifact_id: { type: "string" }, artifact_type: { type: "string" }, format: { type: "string", enum: ["md", "json", "yaml", "txt"] }, content: { type: "string" }, source_refs: { type: "array", items: { type: "string" }, maxItems: 100 }, depends_on: { type: "array", items: { type: "string" }, maxItems: 100 }, status: { type: "string", enum: ["draft", "proposed"] } } },
  },
  {
    name: "artifact_validate",
    description: "Validate one saved local artifact revision. Supported canonical JSON artifacts use the Guide's fixed validator; other formats receive bounded structural checks. Read-only and never promotion evidence by itself.",
    inputSchema: { type: "object", additionalProperties: false, required: ["engagement_id", "artifact_id"], properties: { engagement_id: { type: "string" }, artifact_id: { type: "string" }, revision: { type: "integer", minimum: 1 }, profile: { type: "string", enum: ["starter", "complete"] }, canonical_type: { type: "string", enum: ["workflow-charter", "engagement-reframe", "data-context-manifest"] } } },
  },
  {
    name: "decision_record",
    description: "Append a human disposition or exact-revision artifact review with actor, authority basis, scope, rationale, and evidence references. Non-artifact updates require explicit same-stream supersession; the tool cannot verify or grant authority.",
    inputSchema: { type: "object", additionalProperties: false, required: ["operation_id", "engagement_id", "decision_id", "decision_kind", "disposition", "actor", "authority_basis", "scope", "rationale", "evidence_refs", "decided_at"], properties: { operation_id: { type: "string" }, engagement_id: { type: "string" }, decision_id: { type: "string" }, decision_kind: { type: "string", enum: ["engagement_disposition", "artifact_review", "release_gate", "field_move", "change_disposition"] }, decision_stream_id: { type: "string" }, supersedes_decision_id: { type: "string" }, disposition: { type: "string" }, artifact_ref: { type: "string" }, artifact_revision: { type: "integer", minimum: 1 }, artifact_digest: { type: "string" }, actor: { type: "string" }, authority_basis: { type: "string" }, scope: { type: "string" }, rationale: { type: "string" }, evidence_refs: { type: "array", items: { type: "string" }, maxItems: 100 }, decided_at: { type: "string" } } },
  },
  {
    name: "change_impact_assess",
    description: "Traverse only declared source and artifact dependencies to find direct and transitive change candidates. Read-only; undeclared areas remain unknown and the result cannot authorize promotion.",
    inputSchema: { type: "object", additionalProperties: false, required: ["engagement_id", "changed_refs"], properties: { engagement_id: { type: "string" }, changed_refs: { type: "array", minItems: 1, maxItems: 100, items: { type: "string" } }, limit: { type: "integer", minimum: 1, maximum: 200 } } },
  },
  {
    name: "next_field_move",
    description: "Select the next Guide route from the local engagement's recorded artifact types and dispositions. Read-only, deterministic, and deliberately conservative when evidence is missing.",
    inputSchema: { type: "object", additionalProperties: false, required: ["engagement_id"], properties: { engagement_id: { type: "string" } } },
  },
  {
    name: "decision_packet_export",
    description: "Create an immutable, byte-bounded, source-linked Markdown index of the current engagement projection for human review. It reports omissions, summarizes references rather than source contents, and is not an approval or system of record.",
    inputSchema: { type: "object", additionalProperties: false, required: ["operation_id", "engagement_id", "packet_id"], properties: { operation_id: { type: "string" }, engagement_id: { type: "string" }, packet_id: { type: "string" } } },
  },
];

export async function callTool(name, rawInput = {}) {
  const definition = toolDefinitions.find((tool) => tool.name === name);
  if (!definition) throw new FdeError("TOOL_NOT_FOUND", `unknown FDE tool ${name}`);
  validateSchemaValue(definition.inputSchema, rawInput, "arguments");
  const input = rawInput;
  const config = await loadConfig();
  switch (name) {
    case "guide_search": return guideSearch(config, input);
    case "engagement_list": return engagementList(config, input);
    case "engagement_start": return engagementStart(config, input);
    case "engagement_status": return engagementStatus(config, input);
    case "artifact_read_revision": return artifactReadRevision(config, input);
    case "source_register": return sourceRegister(config, input);
    case "artifact_save_revision": return artifactSaveRevision(config, input);
    case "artifact_validate": return artifactValidate(config, input);
    case "decision_record": return decisionRecord(config, input);
    case "change_impact_assess": return changeImpactAssess(config, input);
    case "next_field_move": return nextFieldMove(config, input);
    case "decision_packet_export": return decisionPacketExport(config, input);
    default: throw new FdeError("TOOL_NOT_FOUND", `unknown FDE tool ${name}`);
  }
}

async function engagementList(config, input) {
  const limit = input.limit || 20;
  const entries = (await readdir(config.workspaceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^[a-z][a-z0-9-]{2,63}$/.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const engagements = [];
  const invalid = [];
  for (const entry of entries) {
    try {
      const { state } = await loadEngagement(config, entry.name);
      if (state.engagement.classification === "restricted" || (state.engagement.classification === "confidential" && !config.allowConfidentialModelContext)) continue;
      if (input.classification && state.engagement.classification !== input.classification) continue;
      engagements.push({
        engagement_id: state.engagement.engagement_id,
        title: state.engagement.title,
        tenant: state.engagement.tenant,
        workflow: state.engagement.workflow,
        classification: state.engagement.classification,
        updated_at: state.updated_at,
        counts: { sources: state.sources.length, artifact_revisions: state.artifacts.length, decisions: state.decisions.length },
        next_move: nextMove(state),
      });
    } catch (error) {
      invalid.push({ engagement_id: entry.name, error: error instanceof FdeError ? error.code : "INVALID_LOCAL_STATE" });
    }
    if (engagements.length >= limit) break;
  }
  return { engagements, invalid, truncated: engagements.length >= limit && entries.length > engagements.length, content_included: false };
}

async function guideSearch(config, input) {
  const query = requireString(input.query, "query", { min: 2, max: 200 }).toLowerCase();
  const terms = [...new Set(query.split(/\s+/).filter((term) => term.length >= 2))];
  const limit = Number.isInteger(input.limit) ? Math.min(Math.max(input.limit, 1), 10) : 6;
  const catalog = JSON.parse(await readFile(path.join(config.guideRoot, "catalog.json"), "utf8"));
  const stageHints = {
    field: ["field", "reframe", "discovery"], value: ["value", "outcome", "economics"], data: ["data", "context", "readiness"],
    design: ["architecture", "design", "mechanism"], delivery: ["delivery", "adoption", "implementation"], evaluation: ["evaluation", "test", "grader"],
    release: ["release", "readiness", "rollback"], operation: ["operations", "service", "slo"], transfer: ["handoff", "transfer", "enablement"], change: ["change", "impact", "dependency"],
  };
  const hinted = input.stage ? stageHints[input.stage] || [] : [];
  const candidates = [
    { path: "README.md", id: "readme", type: "standard", tags: ["orientation"] },
    ...catalog.artifacts,
  ].filter(({ path: target }) => /\.(?:md|json)$/.test(target));
  const results = [];
  for (const candidate of candidates) {
    let file;
    try { file = await safeGuideFile(config, candidate.path); } catch { continue; }
    if (file.metadata.size > config.maxReadBytes * 8) continue;
    const body = await readFile(file.candidate, "utf8");
    const lines = body.split("\n");
    let best = null;
    lines.forEach((line, index) => {
      const lower = line.toLowerCase();
      const matched = terms.filter((term) => lower.includes(term));
      if (matched.length === 0) return;
      const tagText = `${candidate.id} ${candidate.type} ${(candidate.tags || []).join(" ")}`.toLowerCase();
      const score = matched.length * 10 + hinted.filter((hint) => lower.includes(hint) || tagText.includes(hint)).length * 3 + (line.startsWith("#") ? 2 : 0);
      if (!best || score > best.score) best = { score, line: index + 1, excerpt: line.trim().slice(0, 800) };
    });
    if (best) results.push({ artifact_id: candidate.id, artifact_type: candidate.type, path: candidate.path, tags: candidate.tags || [], ...best });
  }
  results.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path));
  return { query, stage: input.stage || null, result_count: Math.min(results.length, limit), results: results.slice(0, limit), classification: "repository-public", egress: "none", truncated: results.length > limit };
}

async function engagementStart(config, input) {
  if (input.classification === "confidential" && !config.allowConfidentialModelContext) {
    throw new FdeError("MODEL_CONTEXT_POLICY_DENIED", "confidential engagement use requires allow_confidential_model_context in the machine-local FDE configuration");
  }
  const { state, created, auditMirrorStatus } = await initializeEngagement(config, input);
  return { status: created ? "created" : "exists", engagement: state.engagement, state_digest: digest(state), workspace_scope: state.engagement.engagement_id, audit_mirror_status: auditMirrorStatus };
}

async function engagementStatus(config, input) {
  const { state } = await loadEngagement(config, input.engagement_id);
  requireEngagementModelContextPolicy(config, state);
  const limit = input.limit || 20;
  const latest = latestArtifacts(state);
  const accepted = acceptedArtifacts(state);
  const stale = staleArtifacts(state);
  const sourcePage = boundedPage(state.sources, {
    offset: input.source_offset || 0,
    limit,
    maxBytes: 64 * 1024,
    map: ({ excerpt: _excerpt, ...source }) => source,
  });
  const latestPage = boundedPage(latest, { offset: input.artifact_offset || 0, limit, maxBytes: 64 * 1024 });
  const acceptedPage = boundedPage(accepted, { offset: input.artifact_offset || 0, limit, maxBytes: 64 * 1024 });
  const stalePage = boundedPage(stale, { offset: input.artifact_offset || 0, limit, maxBytes: 64 * 1024 });
  const decisionPage = boundedPage([...state.decisions].reverse(), {
    offset: input.decision_offset || 0,
    limit,
    maxBytes: 64 * 1024,
  });
  const pages = { sources: sourcePage, latest_artifacts: latestPage, accepted_artifacts: acceptedPage, stale_artifacts: stalePage, recent_decisions: decisionPage };
  const pageMeta = Object.fromEntries(Object.entries(pages).map(([name, page]) => [name, {
    total: page.total,
    offset: page.offset,
    returned: page.returned,
    next_offset: page.next_offset,
    byte_bounded: page.byte_bounded,
  }]));
  return {
    engagement: state.engagement,
    created_at: state.created_at,
    updated_at: state.updated_at,
    counts: { sources: state.sources.length, artifact_revisions: state.artifacts.length, decisions: state.decisions.length },
    sources: sourcePage.items,
    latest_artifacts: latestPage.items,
    accepted_artifacts: acceptedPage.items,
    stale_artifacts: stalePage.items,
    recent_decisions: decisionPage.items,
    projection_pages: pageMeta,
    projection_truncated: Object.values(pages).some(({ next_offset: nextOffset }) => nextOffset !== null),
    next_move: nextMove(state),
    state_digest: digest(state),
  };
}

async function artifactReadRevision(config, input) {
  const artifactId = requireIdentifier(input.artifact_id, "artifact_id");
  const { state } = await loadEngagement(config, input.engagement_id);
  requireEngagementModelContextPolicy(config, state);
  const candidates = state.artifacts.filter(({ artifact_id: id }) => id === artifactId);
  const artifact = input.revision ? candidates.find(({ revision }) => revision === input.revision) : candidates.at(-1);
  if (!artifact) throw new FdeError("ARTIFACT_NOT_FOUND", `artifact ${artifactId} revision was not found`);
  const loaded = await readWorkspaceFile(config, input.engagement_id, artifact.relative_path, config.maxWriteBytes + 1);
  if (digest(loaded.body) !== artifact.file_digest) throw new FdeError("ARTIFACT_INTEGRITY_FAILURE", "saved artifact file no longer matches its immutable receipt");
  const maxChars = input.max_chars || 12_000;
  return {
    artifact,
    content: loaded.body.slice(0, maxChars),
    truncated: loaded.body.length > maxChars,
    classification: state.engagement.classification,
    model_context_exposure: true,
    content_trust: "untrusted",
  };
}

async function sourceRegister(config, input) {
  const sourceId = requireIdentifier(input.source_id, "source_id");
  const excerpt = input.excerpt === undefined ? null : requireString(input.excerpt, "excerpt", { max: 8000 });
  const classification = requireClassification(input.classification);
  if (excerpt && classification === "restricted") throw new FdeError("RESTRICTED_CONTENT_DENIED", "restricted source excerpts cannot be stored through this model-visible tool");
  if (classification === "confidential" && !config.allowConfidentialModelContext) {
    throw new FdeError("MODEL_CONTEXT_POLICY_DENIED", "confidential source metadata or excerpts require allow_confidential_model_context in the machine-local FDE configuration");
  }
  return mutateEngagement(config, input.engagement_id, input.operation_id, input, "source_registered", (state) => {
    requireEngagementModelContextPolicy(config, state);
    if (classificationRank.get(classification) > classificationRank.get(state.engagement.classification)) {
      throw new FdeError("CLASSIFICATION_BOUNDARY_VIOLATION", `source classification ${classification} exceeds the ${state.engagement.classification} engagement boundary`);
    }
    assertGloballyAvailableId(state, sourceId, "source");
    if (state.sources.some(({ source_id: id }) => id === sourceId)) throw new FdeError("SOURCE_CONFLICT", `source ${sourceId} already exists`);
    const authorityStatus = requireString(input.authority_status, "authority_status", { max: 50 });
    if (!sourceAuthorityStatuses.has(authorityStatus)) throw new FdeError("INVALID_INPUT", "authority_status is outside the supported vocabulary");
    const source = {
      source_id: sourceId,
      title: requireString(input.title, "title", { max: 300 }),
      kind: requireString(input.kind, "kind", { max: 100 }),
      locator: requireString(input.locator, "locator", { max: 2000 }),
      owner: requireString(input.owner, "owner", { max: 200 }),
      revision: requireString(input.revision, "revision", { max: 200 }),
      classification,
      authority_status: authorityStatus,
      authority_basis: requireString(input.authority_basis, "authority_basis", { max: 1000 }),
      authority_verified: false,
      freshness: requireString(input.freshness, "freshness", { max: 500 }),
      limitations: requireString(input.limitations, "limitations", { max: 2000 }),
      excerpt,
      recorded_at: new Date().toISOString(),
    };
    state.sources.push(source);
    const result = { status: "recorded", source_id: sourceId, source_digest: digest(source), excerpt_stored: excerpt !== null };
    return { state, result, subjectRefs: [sourceId] };
  });
}

async function artifactSaveRevision(config, input) {
  const artifactId = requireIdentifier(input.artifact_id, "artifact_id");
  const format = requireString(input.format, "format", { max: 10 });
  if (!formats.has(format)) throw new FdeError("INVALID_INPUT", "format is not supported");
  const status = requireString(input.status, "status", { max: 30 });
  if (!artifactStatuses.has(status)) throw new FdeError("INVALID_INPUT", "artifact status is not supported");
  const content = requireString(input.content, "content", { max: config.maxWriteBytes });
  if (format === "json") {
    try { JSON.parse(content); } catch (error) { throw new FdeError("INVALID_JSON", `artifact content is not valid JSON: ${error.message}`); }
  }
  let createdPath = null;
  let createdFile = false;
  try {
    return await mutateEngagement(config, input.engagement_id, input.operation_id, input, "artifact_revision_saved", async (state, paths) => {
      requireEngagementModelContextPolicy(config, state);
      assertGloballyAvailableId(state, artifactId, "artifact");
      const priorRevisions = state.artifacts.filter(({ artifact_id: id }) => id === artifactId);
      const artifactType = requireString(input.artifact_type, "artifact_type", { max: 100 });
      if (priorRevisions.some((artifact) => artifact.artifact_type !== artifactType || artifact.format !== format)) {
        throw new FdeError("ARTIFACT_IDENTITY_CONFLICT", `artifact ${artifactId} cannot change artifact_type or format across revisions`);
      }
      const sourceRefs = requireSourceRefs(state, input.source_refs, "source_refs");
      const dependsOn = requireArtifactRefs(state, input.depends_on, "depends_on");
      if (dependsOn.includes(artifactId)) throw new FdeError("DEPENDENCY_CYCLE", "an artifact cannot depend on itself");
      requireAcyclicArtifactDependencies(state, artifactId, dependsOn);
      const revision = Math.max(0, ...priorRevisions.map(({ revision: value }) => value)) + 1;
      const contentDigest = digest(content);
      const relativePath = path.posix.join("artifacts", artifactId, `r${revision}-${contentDigest.slice(7, 19)}.${format}`);
      createdPath = path.join(paths.directory, ...relativePath.split("/"));
      const write = await writeImmutableFile(paths.directory, createdPath, `${content}${content.endsWith("\n") ? "" : "\n"}`, config.maxWriteBytes + 1);
      createdFile = true;
      const artifact = {
        artifact_id: artifactId,
        artifact_type: artifactType,
        revision,
        format,
        relative_path: relativePath,
        content_digest: contentDigest,
        file_digest: write.digest,
        source_refs: sourceRefs,
        source_bindings: sourceRefs.map((reference) => bindReference(state, reference)),
        depends_on: dependsOn,
        dependency_bindings: dependsOn.map((reference) => bindReference(state, reference)),
        status,
        created_at: new Date().toISOString(),
      };
      state.artifacts.push(artifact);
      return { state, result: { status: "saved", artifact }, subjectRefs: [artifactId, ...sourceRefs, ...dependsOn] };
    });
  } catch (error) {
    if (createdFile && createdPath) await cleanupNewFile(createdPath);
    throw error;
  }
}

async function artifactValidate(config, input) {
  const artifactId = requireIdentifier(input.artifact_id, "artifact_id");
  const { state } = await loadEngagement(config, input.engagement_id);
  requireEngagementModelContextPolicy(config, state);
  const candidates = state.artifacts.filter(({ artifact_id: id }) => id === artifactId);
  const artifact = input.revision ? candidates.find(({ revision }) => revision === input.revision) : candidates.at(-1);
  if (!artifact) throw new FdeError("ARTIFACT_NOT_FOUND", `artifact ${artifactId} revision was not found`);
  const loaded = await readWorkspaceFile(config, input.engagement_id, artifact.relative_path, config.maxWriteBytes + 1);
  const checks = [{ check: "file_digest", passed: digest(loaded.body) === artifact.file_digest, detail: "saved file matches its immutable revision receipt" }];
  if (artifact.format === "json") {
    try { JSON.parse(loaded.body); checks.push({ check: "json_parse", passed: true, detail: "valid JSON" }); }
    catch (error) { checks.push({ check: "json_parse", passed: false, detail: error.message }); }
  } else {
    checks.push({ check: "non_empty", passed: loaded.body.trim().length > 0, detail: "artifact contains text" });
    const unresolvedMarkerPattern = new RegExp(`\\[(?:${["TO", "DO"].join("")}|${["FIX", "ME"].join("")}):`, "i");
    checks.push({ check: "unresolved_marker", passed: !unresolvedMarkerPattern.test(loaded.body), detail: "no unresolved bracketed work marker" });
  }
  let canonical = null;
  if (input.canonical_type) {
    const canonicalType = requireString(input.canonical_type, "canonical_type", { max: 100 });
    if (!validationTypes.has(canonicalType)) throw new FdeError("INVALID_INPUT", "canonical_type is not supported by the local validator");
    if (artifact.format !== "json") throw new FdeError("INVALID_INPUT", "canonical validation requires a JSON artifact");
    if (artifact.artifact_type !== canonicalType) throw new FdeError("ARTIFACT_TYPE_MISMATCH", `saved artifact_type ${artifact.artifact_type} cannot be validated as ${canonicalType}`);
    const runtime = await verifyValidatorRuntime(config, canonicalType);
    const validator = path.join(config.validatorRoot, "scripts", "validate-artifact.mjs");
    const execution = spawnSync(process.execPath, [validator, "validate", loaded.target, "--profile", input.profile || "complete", "--type", canonicalType, "--json"], {
      cwd: config.validatorRoot,
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 256 * 1024,
      shell: false,
      env: { PATH: process.env.PATH || "", NODE_NO_WARNINGS: "1" },
    });
    canonical = { passed: execution.status === 0, status: execution.status, stdout: execution.stdout.trim().slice(0, 32_000), stderr: execution.stderr.trim().slice(0, 8_000), timed_out: execution.error?.code === "ETIMEDOUT", runtime_digest: runtime.digest };
    checks.push({ check: "canonical_contract", passed: canonical.passed, detail: `${canonicalType} ${input.profile || "complete"} validation` });
  }
  return { artifact: { artifact_id: artifactId, revision: artifact.revision, artifact_type: artifact.artifact_type, content_digest: artifact.content_digest }, passed: checks.every(({ passed }) => passed), checks, canonical, limitations: "This validates local structure and declared invariants only; it is not customer evidence, authority, or production approval." };
}

async function verifyValidatorRuntime(config, canonicalType) {
  const validatorMetadata = await stat(config.validatorRoot).catch(() => null);
  if (!validatorMetadata?.isDirectory()) {
    throw new FdeError("VALIDATOR_RUNTIME_UNAVAILABLE", "canonical validation requires the trusted FDE Guide checkout recorded in validator_root");
  }
  if ((await lstat(config.validatorRoot)).isSymbolicLink()) throw new FdeError("VALIDATOR_RUNTIME_UNAVAILABLE", "validator_root cannot be a symbolic link");
  const schemaByType = {
    "workflow-charter": "schemas/workflow-charter.schema.json",
    "engagement-reframe": "schemas/engagement-reframe.schema.json",
    "data-context-manifest": "schemas/data-context-manifest.schema.json",
  };
  const files = [
    "package.json",
    "package-lock.json",
    "scripts/validate-artifact.mjs",
    "scripts/governance-invariants.mjs",
    "scripts/contract-invariants.mjs",
    "scripts/repository-paths.mjs",
    schemaByType[canonicalType],
  ];
  const bindings = [];
  for (const relative of files) {
    const packaged = await safeGuideFile(config, relative);
    const runtime = await safeGuideFile({ ...config, guideRoot: config.validatorRoot }, relative);
    const [packagedBody, runtimeBody] = await Promise.all([readFile(packaged.candidate), readFile(runtime.candidate)]);
    const packagedDigest = digest(packagedBody);
    const runtimeDigest = digest(runtimeBody);
    if (packagedDigest !== runtimeDigest) throw new FdeError("VALIDATOR_RUNTIME_DRIFT", `${relative} differs from the installed FDE Guide snapshot`);
    bindings.push({ path: relative, digest: runtimeDigest });
  }
  return { bindings, digest: digest(bindings) };
}

async function decisionRecord(config, input) {
  const decisionId = requireIdentifier(input.decision_id, "decision_id");
  const kind = requireString(input.decision_kind, "decision_kind", { max: 100 });
  if (!decisionKinds.has(kind)) throw new FdeError("INVALID_INPUT", "decision_kind is not supported");
  const disposition = requireString(input.disposition, "disposition", { max: 100 });
  if (!allowedDispositions.has(disposition)) throw new FdeError("INVALID_INPUT", "disposition is outside the bounded local vocabulary");
  if (!dispositionsByKind.get(kind).has(disposition)) throw new FdeError("INVALID_INPUT", `disposition ${disposition} is not valid for ${kind}`);
  const decidedAt = requireRfc3339Timestamp(input.decided_at, "decided_at");
  return mutateEngagement(config, input.engagement_id, input.operation_id, input, "decision_recorded", (state) => {
    requireEngagementModelContextPolicy(config, state);
    assertGloballyAvailableId(state, decisionId, "decision");
    if (state.decisions.some(({ decision_id: id }) => id === decisionId)) throw new FdeError("DECISION_CONFLICT", `decision ${decisionId} already exists`);
    const evidenceRefs = requireKnownRefs(state, input.evidence_refs, "evidence_refs");
    let artifactBinding = null;
    let decisionStreamId;
    if (kind === "artifact_review") {
      const artifactRef = requireIdentifier(input.artifact_ref, "artifact_ref");
      if (!Number.isInteger(input.artifact_revision) || input.artifact_revision < 1) throw new FdeError("INVALID_INPUT", "artifact_review requires artifact_revision");
      const artifactDigest = requireString(input.artifact_digest, "artifact_digest", { max: 100 });
      if (!evidenceRefs.includes(artifactRef)) throw new FdeError("INVALID_INPUT", "artifact_ref must also appear in evidence_refs");
      const artifact = state.artifacts.find(({ artifact_id: id, revision }) => id === artifactRef && revision === input.artifact_revision);
      if (!artifact) throw new FdeError("REFERENCE_TYPE_MISMATCH", "artifact_ref must name a saved artifact");
      if (artifact.content_digest !== artifactDigest) throw new FdeError("ARTIFACT_DIGEST_MISMATCH", "artifact_digest does not match the requested immutable revision");
      artifactBinding = { ref: artifactRef, kind: "artifact", revision: artifact.revision, digest: artifact.content_digest };
      decisionStreamId = `artifact-review:${artifactRef}:r${artifact.revision}:${artifact.content_digest.slice(7, 19)}`;
      if (input.decision_stream_id !== undefined) throw new FdeError("INVALID_INPUT", "artifact_review derives its decision stream from the exact artifact revision; omit decision_stream_id");
    } else if (input.artifact_ref !== undefined || input.artifact_revision !== undefined || input.artifact_digest !== undefined) {
      throw new FdeError("INVALID_INPUT", "artifact_ref, artifact_revision, and artifact_digest are supported only for artifact_review decisions");
    } else {
      decisionStreamId = requireIdentifier(input.decision_stream_id, "decision_stream_id");
    }
    const scope = requireString(input.scope, "scope", { max: 1000 });
    const scopeDigest = digest(scope);
    const priorInStream = state.decisions.filter((decision) => decision.decision_kind === kind && decision.decision_stream_id === decisionStreamId);
    const supersededIds = new Set(priorInStream.map(({ supersedes_decision_id: id }) => id).filter(Boolean));
    const heads = priorInStream.filter(({ decision_id: id }) => !supersededIds.has(id));
    let supersedesDecisionId = null;
    if (heads.length === 0) {
      if (input.supersedes_decision_id !== undefined) throw new FdeError("DECISION_SUPERSESSION_CONFLICT", "the first decision in a stream cannot supersede another decision");
    } else {
      if (heads.length !== 1) throw new FdeError("DECISION_STREAM_AMBIGUOUS", `decision stream ${decisionStreamId} has multiple current heads`);
      supersedesDecisionId = requireIdentifier(input.supersedes_decision_id, "supersedes_decision_id");
      if (supersedesDecisionId !== heads[0].decision_id) {
        throw new FdeError("DECISION_SUPERSESSION_CONFLICT", `supersedes_decision_id must name current decision ${heads[0].decision_id} in stream ${decisionStreamId}`);
      }
      if (heads[0].scope_digest !== scopeDigest) {
        throw new FdeError("DECISION_SCOPE_CONFLICT", "a decision stream cannot silently change scope; open a new stream for a different scope");
      }
    }
    const decision = {
      decision_id: decisionId,
      decision_kind: kind,
      decision_stream_id: decisionStreamId,
      supersedes_decision_id: supersedesDecisionId,
      disposition,
      actor: requireString(input.actor, "actor", { max: 200 }),
      authority_basis: requireString(input.authority_basis, "authority_basis", { max: 1000 }),
      scope,
      scope_digest: scopeDigest,
      rationale: requireString(input.rationale, "rationale", { max: 2000 }),
      evidence_refs: evidenceRefs,
      artifact_binding: artifactBinding,
      decided_at: decidedAt,
      recorded_at: new Date().toISOString(),
    };
    decision.evidence_bindings = decision.evidence_refs.map((reference) => artifactBinding?.ref === reference ? artifactBinding : bindReference(state, reference));
    state.decisions.push(decision);
    return { state, result: { status: "recorded", decision, authority_verified: false }, subjectRefs: [decisionId, ...(supersedesDecisionId ? [supersedesDecisionId] : []), ...decision.evidence_refs] };
  });
}

async function changeImpactAssess(config, input) {
  const { state } = await loadEngagement(config, input.engagement_id);
  requireEngagementModelContextPolicy(config, state);
  const changed = requireKnownRefs(state, ensureArray(input.changed_refs, "changed_refs", { max: 100 }), "changed_refs");
  const current = currentArtifacts(state);
  const impacted = new Map();
  for (const artifact of current) {
    const evidence = [...artifact.source_refs, ...artifact.depends_on].filter((ref) => changed.includes(ref));
    if (evidence.length > 0 || changed.includes(artifact.artifact_id)) impacted.set(artifact.artifact_id, { artifact, impact: "direct", via: evidence.length > 0 ? evidence : [artifact.artifact_id] });
  }
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const artifact of current) {
      if (impacted.has(artifact.artifact_id)) continue;
      const via = artifact.depends_on.filter((ref) => impacted.has(ref));
      if (via.length > 0) { impacted.set(artifact.artifact_id, { artifact, impact: "transitive", via }); expanded = true; }
    }
  }
  const allAffected = [...impacted.values()].map(({ artifact, impact, via }) => ({ artifact_id: artifact.artifact_id, artifact_type: artifact.artifact_type, revision: artifact.revision, status: artifact.status, impact, via }));
  const notReachedByDeclaredEdges = current.filter(({ artifact_id: id }) => !impacted.has(id)).map(({ artifact_id, revision }) => ({ artifact_id, revision }));
  const limit = input.limit || 100;
  const affected = allAffected.slice(0, limit);
  const boundedNotReached = notReachedByDeclaredEdges.slice(0, limit);
  const unknown = ["Declared edges provide routing evidence only. No-path does not prove unaffectedness; verify map scope, freshness, coverage, and primary sources with the accountable owner."];
  if (affected.length === 0) unknown.push("No declared artifact dependency references the changed subjects; inspect primary artifacts before concluding there is no impact.");
  if (notReachedByDeclaredEdges.length > 0) unknown.push(`${notReachedByDeclaredEdges.length} current artifact projection${notReachedByDeclaredEdges.length === 1 ? " was" : "s were"} not reached by declared edges and remain undisposed.`);
  return {
    changed_refs: changed,
    affected,
    not_reached_by_declared_edges: boundedNotReached,
    unaffected: [],
    unknown,
    counts: { affected: allAffected.length, not_reached_by_declared_edges: notReachedByDeclaredEdges.length },
    truncated: allAffected.length > limit || notReachedByDeclaredEdges.length > limit,
    authority: "routing-only",
    state_digest: digest(state),
  };
}

async function nextFieldMove(config, input) {
  const { state } = await loadEngagement(config, input.engagement_id);
  requireEngagementModelContextPolicy(config, state);
  return { engagement_id: state.engagement.engagement_id, ...nextMove(state), basis: "deterministic presence of current artifact types and recorded dispositions only", unknowns_remain_visible: true };
}

async function decisionPacketExport(config, input) {
  const packetId = requireIdentifier(input.packet_id, "packet_id");
  let createdPath = null;
  let createdFile = false;
  try {
    return await mutateEngagement(config, input.engagement_id, input.operation_id, input, "decision_packet_exported", async (state, paths) => {
      requireEngagementModelContextPolicy(config, state);
      const latest = latestArtifacts(state);
      const accepted = acceptedArtifacts(state);
      const stale = staleArtifacts(state);
      const lineGroups = {
        sources: state.sources.map((source) => `- \`${source.source_id}\` — ${summarizeText(source.title)}; owner: ${summarizeText(source.owner)}; revision: ${summarizeText(source.revision)}; classification: ${source.classification}; authority: ${source.authority_status} (unverified); basis: ${summarizeText(source.authority_basis)}; limitations: ${summarizeText(source.limitations)}`),
        latest: latest.map((artifact) => `- \`${artifact.artifact_id}\` r${artifact.revision} — ${summarizeText(artifact.artifact_type)}; working state: ${artifact.status}; review: ${reviewForArtifactRevision(state, artifact)?.disposition || "open"}; sources: ${summarizeRefs(artifact.source_refs)}; depends on: ${summarizeRefs(artifact.depends_on)}`),
        accepted: accepted.map((artifact) => `- \`${artifact.artifact_id}\` r${artifact.revision} — ${summarizeText(artifact.artifact_type)}; digest: \`${artifact.content_digest}\``),
        stale: stale.map((artifact) => `- \`${artifact.artifact_id}\` r${artifact.revision}: ${summarizeRefs(artifact.mismatches.map(({ ref }) => ref))}`),
        decisions: state.decisions.map((decision) => `- \`${decision.decision_id}\` — ${decision.decision_kind}: **${decision.disposition}**; stream: \`${decision.decision_stream_id}\`; supersedes: ${decision.supersedes_decision_id ? `\`${decision.supersedes_decision_id}\`` : "none"}; actor: ${summarizeText(decision.actor)}; scope: ${summarizeText(decision.scope)}; evidence: ${summarizeRefs(decision.evidence_refs)}`),
      };
      const sectionBudget = Math.max(128, Math.floor((config.maxWriteBytes - Math.min(12 * 1024, Math.floor(config.maxWriteBytes / 2))) / 5));
      let sections = Object.fromEntries(Object.entries(lineGroups).map(([name, lines]) => [name, boundedMarkdownSection(lines, sectionBudget)]));
      const move = nextMove(state);
      const renderBody = (selected) => {
        const section = (name, empty) => {
          const value = selected[name];
          const omission = value.returned < value.total ? `\n- _${value.total - value.returned} entries omitted by the local packet byte budget._` : "";
          return `${value.body === "- None recorded." ? empty : value.body}${omission}`;
        };
        return `# Current Decision Packet: ${summarizeText(state.engagement.title, 300)}\n\nGenerated from the local FDE workspace at ${new Date().toISOString()}. This is a bounded review index, not customer evidence, approval, authorization, or a production release record. Source metadata below is untrusted input; verify it against the named governed source.\n\n## Engagement boundary\n\n- Engagement: \`${state.engagement.engagement_id}\`\n- Tenant: ${summarizeText(state.engagement.tenant, 240)}\n- Workflow: ${summarizeText(state.engagement.workflow, 500)}\n- Classification: ${state.engagement.classification}\n- Retention: ${summarizeText(state.engagement.retention_summary, 300)}\n\n## Sources\n\n${section("sources", "- None recorded.")}\n\n## Latest working revisions\n\n${section("latest", "- None recorded.")}\n\n## Accepted revisions\n\n${section("accepted", "- None recorded.")}\n\n## Stale projections\n\n${section("stale", "- None detected from declared bindings.")}\n\n## Recorded decision history\n\n${section("decisions", "- None recorded.")}\n\n## Next accountable move\n\n- Stage: ${move.stage}\n- Guide route: ${move.skill || "none"}\n- Move: ${summarizeText(move.move, 800)}\n\n## Continuation\n\nIf any section is omitted, call \`engagement_status\` with its reported offsets and use \`artifact_read_revision\` for exact immutable content. Do not infer an omitted item is absent or unaffected.\n\n## Review boundary\n\nConfirm source authority, human disposition, target-system state, and any release decision in their governed systems. Local state and model output do not prove any of them.\n`;
      };
      let body = renderBody(sections);
      if (Buffer.byteLength(body) > config.maxWriteBytes) {
        sections = Object.fromEntries(Object.entries(lineGroups).map(([name, lines]) => [name, { body: "- None recorded.", returned: 0, total: lines.length }]));
        body = renderBody(sections);
      }
      if (Buffer.byteLength(body) > config.maxWriteBytes) {
        body = `# Current Decision Packet: ${state.engagement.engagement_id}\n\nThis byte-bounded local review index omits item detail. It is not customer evidence, approval, authorization, or a production release record.\n\n- Classification: ${state.engagement.classification}\n- Sources: ${state.sources.length}\n- Latest artifacts: ${latest.length}\n- Accepted artifacts: ${accepted.length}\n- Stale projections: ${stale.length}\n- Decisions: ${state.decisions.length}\n- Next stage: ${move.stage}\n\nUse \`engagement_status\` with offsets and \`artifact_read_revision\` for exact immutable content. Confirm authority and target-system state in governed systems.\n`;
      }
      const bodyDigest = digest(body);
      const relativePath = path.posix.join("exports", `${packetId}-${bodyDigest.slice(7, 19)}.md`);
      createdPath = path.join(paths.directory, ...relativePath.split("/"));
      const write = await writeImmutableFile(paths.directory, createdPath, body, config.maxWriteBytes);
      createdFile = true;
      const sectionCounts = Object.fromEntries(Object.entries(sections).map(([name, section]) => [name, { total: section.total, included: section.returned, omitted: section.total - section.returned }]));
      const result = { status: "exported", packet_id: packetId, relative_path: relativePath, packet_digest: bodyDigest, file_digest: write.digest, source_count: state.sources.length, artifact_count: latest.length, decision_count: state.decisions.length, section_counts: sectionCounts, truncated: Object.values(sectionCounts).some(({ omitted }) => omitted > 0), continuation: "Use engagement_status offsets and artifact_read_revision for omitted entries.", preview: body.slice(0, 16_000), preview_truncated: body.length > 16_000, content_trust: "untrusted" };
      return { state, result, subjectRefs: [packetId, ...state.sources.map(({ source_id }) => source_id), ...latest.map(({ artifact_id }) => artifact_id)] };
    });
  } catch (error) {
    if (createdFile && createdPath) await cleanupNewFile(createdPath);
    throw error;
  }
}
