import {
  capabilityAuthorityDigest,
  capabilityBuildAttestationDigest,
  capabilityRegistryDecisionDigest,
  canonicalDigestVersion,
  canonicalJson,
  sha256Digest,
} from "./contract-invariants.mjs";

const effectRank = new Map([
  ["none", 0],
  ["staged", 1],
  ["reversible", 2],
  ["irreversible", 3],
]);

const sensitiveValuePatterns = [
  /\bbearer\s+[A-Za-z0-9._~+/-]{8,}/i,
  /\bsk-[A-Za-z0-9_-]{8,}/i,
  /\b(?:\d{3}-\d{2}-\d{4}|\d{9})\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

function domainDigest(domain, value) {
  return sha256Digest(Buffer.concat([
    Buffer.from(`${canonicalDigestVersion}/${domain}\0`, "utf8"),
    Buffer.from(canonicalJson(value), "utf8"),
  ]));
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter((candidate) => candidate !== undefined && candidate !== null)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

function isSubset(candidate = [], ceiling = []) {
  const allowed = new Set(ceiling);
  return candidate.every((value) => allowed.has(value));
}

function sensitiveValueLocations(value, location = "$", matches = []) {
  if (typeof value === "string") {
    if (sensitiveValuePatterns.some((pattern) => pattern.test(value))) matches.push(location);
    return matches;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => sensitiveValueLocations(item, `${location}[${index}]`, matches));
    return matches;
  }
  if (!value || typeof value !== "object") return matches;
  for (const [key, item] of Object.entries(value)) sensitiveValueLocations(item, `${location}.${key}`, matches);
  return matches;
}

export function traceEventSemanticErrors(event, label = "trace event") {
  const errors = [];
  const telemetry = event?.telemetry ?? {};
  const bindings = [
    ["run_id", event?.run_id, telemetry["agent.run.id"]],
    ["operation_id", event?.operation_id, telemetry["agent.operation.id"]],
    ["release_digest", event?.release_digest, telemetry["agent.release.digest"]],
    ["state", event?.state, telemetry["agent.workflow.state"]],
    ["actor_mode", event?.actor_mode, telemetry["agent.actor.mode"]],
  ];
  for (const [field, envelopeValue, telemetryValue] of bindings) {
    if (envelopeValue !== telemetryValue) errors.push(`${label} ${field} disagrees with its telemetry binding`);
  }

  const agentComponent = event?.component_versions?.agent_system;
  if (agentComponent) {
    if (agentComponent.id !== telemetry["agent.system.id"]) {
      errors.push(`${label} agent-system ID disagrees with telemetry`);
    }
    if (agentComponent.version !== telemetry["agent.system.version"]) {
      errors.push(`${label} agent-system version disagrees with telemetry`);
    }
  }

  const workflowComponent = event?.component_versions?.workflow;
  if (workflowComponent && workflowComponent.id !== telemetry["agent.workflow.id"]) {
    errors.push(`${label} workflow ID disagrees with telemetry`);
  }

  const envelopeStopReason = event?.stop_reason;
  const telemetryStopReason = telemetry["agent.stop.reason"];
  if (envelopeStopReason !== telemetryStopReason) {
    errors.push(`${label} stop_reason disagrees with its telemetry binding`);
  }

  for (const location of sensitiveValueLocations(event)) {
    errors.push(`${label} contains a credential or sensitive raw value at ${location}`);
  }
  return errors;
}

export function readbackAttestationSubject(receipt) {
  return {
    run_id: receipt?.readback?.run_id,
    readback_request_id: receipt?.readback?.readback_request_id,
    requested_at: receipt?.readback?.requested_at,
    effect_id: receipt?.effect_id,
    operation_id: receipt?.operation_id,
    resource_hash: receipt?.resource_hash,
    source: receipt?.readback?.source,
    source_revision: receipt?.readback?.revision,
    expected_postcondition_digest: receipt?.readback?.expected_postcondition_digest,
    observed_postcondition_digest: receipt?.readback?.observed_postcondition_digest,
    verified_at: receipt?.readback?.verified_at,
  };
}

export function effectReceiptSemanticErrors(receipt, label = "effect receipt") {
  const errors = [];
  const subject = receipt?.service_receipt?.subject ?? {};
  const repeatedBindings = [
    "effect_id",
    "run_id",
    "operation_id",
    "release_digest",
    "tenant_hash",
    "account_hash",
    "agent_principal_hash",
    "caller_principal_hash",
    "action",
    "effect_class",
    "resource_hash",
    "source_revision",
    "proposal_digest",
    "idempotency_key_hash",
    "policy_decision_id",
    "policy_revision",
    "approval_id",
    "expected_postcondition_digest",
    "committed_at",
  ];
  for (const field of repeatedBindings) {
    if (receipt?.[field] !== subject?.[field]) {
      errors.push(`${label} ${field} disagrees with the signed service subject`);
    }
  }

  const expectedServiceDigest = sha256Digest(subject);
  if (receipt?.service_receipt?.subject_digest !== expectedServiceDigest) {
    errors.push(`${label} service subject digest does not match its canonical payload`);
  }
  if (receipt?.service_receipt?.issuer !== receipt?.readback?.source) {
    errors.push(`${label} service receipt and source-of-truth readback name different issuers`);
  }

  if (receipt?.readback?.expected_postcondition_digest !== receipt?.expected_postcondition_digest) {
    errors.push(`${label} readback expected postcondition is not bound to the committed expectation`);
  }
  const observedMatches = receipt?.readback?.observed_postcondition_digest === receipt?.expected_postcondition_digest;
  if ((receipt?.readback?.status === "matched") !== observedMatches) {
    errors.push(`${label} readback status contradicts the expected and observed postconditions`);
  }

  const expectedReadbackDigest = sha256Digest(readbackAttestationSubject(receipt));
  if (receipt?.readback?.attestation?.subject_digest !== expectedReadbackDigest) {
    errors.push(`${label} readback attestation digest does not match its canonical payload`);
  }
  if (receipt?.readback?.attestation?.issuer !== receipt?.readback?.source) {
    errors.push(`${label} readback attestation issuer is not the declared source`);
  }

  const committedAt = Date.parse(receipt?.committed_at);
  const requestedAt = Date.parse(receipt?.readback?.requested_at);
  const verifiedAt = Date.parse(receipt?.readback?.verified_at);
  if (Number.isFinite(requestedAt) && Number.isFinite(verifiedAt) && verifiedAt < requestedAt) {
    errors.push(`${label} readback verification predates its signed request`);
  }
  if (Number.isFinite(committedAt) && Number.isFinite(verifiedAt) && verifiedAt < committedAt) {
    errors.push(`${label} readback verification predates the committed effect`);
  }

  for (const location of sensitiveValueLocations(receipt)) {
    errors.push(`${label} contains a credential or sensitive raw value at ${location}`);
  }
  return errors;
}

const handoffBudgetFields = [
  "steps_remaining",
  "tool_calls_remaining",
  "time_remaining_ms",
  "tokens_remaining",
  "cost_remaining_usd",
];

export function handoffEnvelopeDigestPayload(envelope) {
  if (!envelope || typeof envelope !== "object") return envelope;
  const {
    envelope_digest: _envelopeDigest,
    attestation: _attestation,
    ...payload
  } = envelope;
  return payload;
}

export function expectedHandoffEnvelopeDigest(envelope) {
  return domainDigest("handoff-envelope", handoffEnvelopeDigestPayload(envelope));
}

export function handoffParentAuthorityPayload(envelope) {
  const authority = envelope?.authority ?? {};
  return {
    parent_authority_id: authority.parent_authority_id,
    parent_state_revision: authority.parent_state_revision,
    tenant_hash: authority.tenant_hash,
    caller_ceiling_hash: authority.caller_ceiling_hash,
    parent_actions: authority.parent_actions,
    parent_scopes: authority.parent_scopes,
    parent_effect_ceiling: authority.parent_effect_ceiling,
    parent_actor_modes: authority.parent_actor_modes,
    parent_budget: authority.parent_budget,
    policy_revision: authority.policy_revision,
    maximum_depth: authority.maximum_depth,
    parent_depth: authority.parent_depth,
  };
}

export function expectedHandoffParentAuthorityDigest(envelope) {
  return domainDigest("handoff-authority", handoffParentAuthorityPayload(envelope));
}

function trustedHandoffParentAuthorityPayload(parent) {
  return {
    parent_authority_id: parent?.authority_id,
    parent_state_revision: parent?.state_revision,
    tenant_hash: parent?.tenant_hash,
    caller_ceiling_hash: parent?.caller_ceiling_hash,
    parent_actions: parent?.actions,
    parent_scopes: parent?.scopes,
    parent_effect_ceiling: parent?.effect_ceiling,
    parent_actor_modes: parent?.actor_modes,
    parent_budget: parent?.budget,
    policy_revision: parent?.policy_revision,
    maximum_depth: parent?.maximum_depth,
    parent_depth: parent?.depth,
  };
}

function sameHandoffParticipant(left, right) {
  return ["principal", "system_id", "worker_role", "run_id", "actor_mode"]
    .every((field) => left?.[field] === right?.[field]);
}

function authenticatedHandoffRecipientErrors(envelope, recipient, label) {
  const errors = [];
  if (recipient?.active !== true) errors.push(`${label} current recipient principal is not active`);
  if (recipient?.authenticated !== true) errors.push(`${label} current recipient principal is not authenticated`);
  if (typeof recipient?.state_revision !== "string" || recipient.state_revision.length === 0) {
    errors.push(`${label} current recipient state revision is unavailable`);
  }
  if (!sameHandoffParticipant(envelope?.recipient, recipient)) {
    errors.push(`${label} envelope recipient does not match the authenticated current recipient`);
  }
  return errors;
}

function authoritativeHandoffParentErrors(envelope, parent, label, { now } = {}) {
  const errors = [];
  const authority = envelope?.authority ?? {};
  if (parent?.active !== true) errors.push(`${label} authoritative parent is not active`);
  if (authority.parent_authority_id !== parent?.authority_id) {
    errors.push(`${label} parent_authority_id does not match authoritative parent state`);
  }
  if (authority.parent_state_revision !== parent?.state_revision) {
    errors.push(`${label} parent_state_revision is not current`);
  }

  const trustedDigest = domainDigest("handoff-authority", trustedHandoffParentAuthorityPayload(parent));
  if (authority.parent_authority_digest !== trustedDigest) {
    errors.push(`${label} parent authority does not match authoritative current parent state (${trustedDigest})`);
  }
  if (!sameHandoffParticipant(envelope?.producer, parent?.participant)) {
    errors.push(`${label} producer is not the authoritative parent participant`);
  }

  if (authority.parent_depth === 0) {
    if (envelope?.parent_handoff_id !== null || envelope?.parent_handoff_digest !== null) {
      errors.push(`${label} root delegation must not claim parent handoff lineage`);
    }
    if (parent?.handoff_id !== null || parent?.envelope_digest !== null) {
      errors.push(`${label} root delegation resolved to a handoff parent`);
    }
    if (parent?.kind !== "root_authority") {
      errors.push(`${label} root delegation did not resolve to an authoritative root grant`);
    }
  } else {
    if (envelope?.parent_handoff_id !== parent?.handoff_id) {
      errors.push(`${label} parent_handoff_id does not match the authoritative parent handoff`);
    }
    if (envelope?.parent_handoff_digest !== parent?.envelope_digest) {
      errors.push(`${label} parent_handoff_digest does not match the authoritative parent handoff`);
    }
    if (parent?.kind !== "handoff" || parent?.consumed !== true) {
      errors.push(`${label} nested parent handoff is not in authoritative consumed state`);
    }
  }

  if (now !== undefined && parent?.expires_at !== undefined && parent?.expires_at !== null) {
    const consumedAt = now instanceof Date ? now.getTime() : Date.parse(now);
    const parentExpiresAt = Date.parse(parent.expires_at);
    const childExpiresAt = Date.parse(envelope?.expires_at);
    if (Number.isFinite(consumedAt) && Number.isFinite(parentExpiresAt) && consumedAt >= parentExpiresAt) {
      errors.push(`${label} authoritative parent is expired at consume time`);
    }
    if (Number.isFinite(parentExpiresAt) && Number.isFinite(childExpiresAt) && childExpiresAt > parentExpiresAt) {
      errors.push(`${label} expiry exceeds the authoritative parent expiry`);
    }
  }
  return errors;
}

export function handoffEnvelopeSemanticErrors(envelope, label = "handoff envelope", { now } = {}) {
  const errors = [];
  const authority = envelope?.authority ?? {};
  const envelopeDigest = expectedHandoffEnvelopeDigest(envelope);
  if (envelope?.envelope_digest !== envelopeDigest) {
    errors.push(`${label} envelope_digest does not match the canonical handoff payload (${envelopeDigest})`);
  }
  if (envelope?.attestation?.subject_digest !== envelopeDigest) {
    errors.push(`${label} attestation is not bound to envelope_digest`);
  }

  const parentAuthorityDigest = expectedHandoffParentAuthorityDigest(envelope);
  if (authority.parent_authority_digest !== parentAuthorityDigest) {
    errors.push(`${label} parent_authority_digest does not match the declared parent ceiling (${parentAuthorityDigest})`);
  }
  if (!isSubset(authority.delegated_actions, authority.parent_actions)) {
    errors.push(`${label} delegated actions exceed the parent authority`);
  }
  if (!isSubset(authority.delegated_scopes, authority.parent_scopes)) {
    errors.push(`${label} delegated scopes exceed the parent authority`);
  }
  if ((effectRank.get(authority.delegated_effect_ceiling) ?? Infinity)
    > (effectRank.get(authority.parent_effect_ceiling) ?? -Infinity)) {
    errors.push(`${label} delegated effect ceiling exceeds the parent ceiling`);
  }
  if (!(authority.parent_actor_modes ?? []).includes(authority.delegated_actor_mode)) {
    errors.push(`${label} delegated actor mode exceeds the parent actor modes`);
  }
  if (envelope?.recipient?.actor_mode !== authority.delegated_actor_mode) {
    errors.push(`${label} recipient actor mode disagrees with delegated authority`);
  }
  if (!(authority.parent_actor_modes ?? []).includes(envelope?.producer?.actor_mode)) {
    errors.push(`${label} producer actor mode is outside the signed parent authority`);
  }

  for (const field of handoffBudgetFields) {
    if ((envelope?.budget?.[field] ?? Infinity) > (authority.parent_budget?.[field] ?? -Infinity)) {
      errors.push(`${label} delegated ${field} exceeds the parent remaining budget`);
    }
  }
  if (authority.current_depth !== authority.parent_depth + 1) {
    errors.push(`${label} current_depth is not exactly parent_depth + 1`);
  }
  if (authority.current_depth > authority.maximum_depth) {
    errors.push(`${label} current_depth exceeds maximum_depth`);
  }
  if (authority.parent_depth === 0
    && (envelope?.parent_handoff_id !== null || envelope?.parent_handoff_digest !== null)) {
    errors.push(`${label} root handoff must omit parent handoff lineage`);
  }
  if (authority.parent_depth > 0 && envelope?.parent_handoff_id === null) {
    errors.push(`${label} nested handoff omits parent_handoff_id`);
  }
  if (authority.parent_depth > 0 && envelope?.parent_handoff_digest === null) {
    errors.push(`${label} nested handoff omits parent_handoff_digest`);
  }

  const createdAt = Date.parse(envelope?.created_at);
  const expiresAt = Date.parse(envelope?.expires_at);
  if (Number.isFinite(createdAt) && Number.isFinite(expiresAt) && expiresAt <= createdAt) {
    errors.push(`${label} expiry does not follow creation`);
  }
  if (now !== undefined) {
    const consumedAt = now instanceof Date ? now.getTime() : Date.parse(now);
    if (!Number.isFinite(consumedAt)) errors.push(`${label} consume-time clock is invalid`);
    else if (Number.isFinite(expiresAt) && consumedAt >= expiresAt) errors.push(`${label} is expired at consume time`);
    else if (Number.isFinite(createdAt) && consumedAt < createdAt) errors.push(`${label} cannot be consumed before creation`);
  }

  const evidenceIds = (envelope?.provenance ?? []).map((item) => item.evidence_id);
  for (const duplicate of duplicateValues(evidenceIds)) errors.push(`${label} duplicates provenance evidence ${duplicate}`);
  const evidenceSet = new Set(evidenceIds);
  for (const work of envelope?.unresolved_work ?? []) {
    for (const evidenceId of work.evidence_needed ?? []) {
      if (!evidenceSet.has(evidenceId)) errors.push(`${label} unresolved work ${work.work_id} references unknown evidence ${evidenceId}`);
    }
  }
  for (const duplicate of duplicateValues((envelope?.verified_state ?? []).map((item) => item.state_id))) {
    errors.push(`${label} duplicates verified state ${duplicate}`);
  }
  return errors;
}

export async function consumeHandoffEnvelope(envelope, {
  now,
  verifyAttestation,
  resolveCurrentParent,
  resolveCurrentRecipient,
  claimHandoffConsumption,
  label = "handoff envelope",
} = {}) {
  const errors = handoffEnvelopeSemanticErrors(envelope, label, { now });
  if (now === undefined) errors.push(`${label} consume-time clock is unavailable`);

  let trustedParent;
  if (typeof resolveCurrentParent !== "function") {
    errors.push(`${label} trusted parent resolver is unavailable`);
  } else {
    try {
      trustedParent = await resolveCurrentParent({
        parent_authority_id: envelope?.authority?.parent_authority_id,
        parent_state_revision: envelope?.authority?.parent_state_revision,
        parent_handoff_id: envelope?.parent_handoff_id,
        parent_handoff_digest: envelope?.parent_handoff_digest,
      });
      if (!trustedParent || typeof trustedParent !== "object") {
        errors.push(`${label} authoritative current parent state is unavailable`);
      } else {
        errors.push(...authoritativeHandoffParentErrors(envelope, trustedParent, label, { now }));
      }
    } catch {
      errors.push(`${label} authoritative current parent state could not be resolved`);
    }
  }

  if (typeof verifyAttestation !== "function") errors.push(`${label} attestation verifier is unavailable`);
  else {
    try {
      if (await verifyAttestation(envelope, trustedParent) !== true) {
        errors.push(`${label} attestation verification failed`);
      }
    } catch {
      errors.push(`${label} attestation verification failed`);
    }
  }

  let trustedRecipient;
  if (typeof resolveCurrentRecipient !== "function") {
    errors.push(`${label} authenticated recipient resolver is unavailable`);
  } else {
    try {
      trustedRecipient = await resolveCurrentRecipient({
        principal: envelope?.recipient?.principal,
        system_id: envelope?.recipient?.system_id,
        worker_role: envelope?.recipient?.worker_role,
        run_id: envelope?.recipient?.run_id,
        actor_mode: envelope?.recipient?.actor_mode,
      });
      if (!trustedRecipient || typeof trustedRecipient !== "object") {
        errors.push(`${label} authenticated current recipient is unavailable`);
      } else {
        errors.push(...authenticatedHandoffRecipientErrors(envelope, trustedRecipient, label));
      }
    } catch {
      errors.push(`${label} authenticated current recipient could not be resolved`);
    }
  }

  if (typeof claimHandoffConsumption !== "function") {
    errors.push(`${label} durable atomic replay claim and budget reservation is unavailable`);
  }

  if (errors.length === 0) {
    const requestedBudgetDigest = domainDigest("handoff-budget", envelope.budget);
    const request = {
      parent_authority_id: envelope.authority.parent_authority_id,
      parent_state_revision: envelope.authority.parent_state_revision,
      parent_authority_digest: envelope.authority.parent_authority_digest,
      parent_handoff_id: envelope.parent_handoff_id,
      parent_handoff_digest: envelope.parent_handoff_digest,
      recipient_principal: envelope.recipient.principal,
      recipient_state_revision: trustedRecipient.state_revision,
      recipient_system_id: envelope.recipient.system_id,
      recipient_worker_role: envelope.recipient.worker_role,
      recipient_run_id: envelope.recipient.run_id,
      recipient_actor_mode: envelope.recipient.actor_mode,
      handoff_id: envelope.handoff_id,
      nonce: envelope.nonce,
      envelope_digest: envelope.envelope_digest,
      requested_budget_digest: requestedBudgetDigest,
      requested_budget: structuredClone(envelope.budget),
    };
    try {
      const claim = await claimHandoffConsumption(request);
      if (!claim || typeof claim !== "object" || claim.status !== "claimed") {
        const status = typeof claim?.status === "string" ? claim.status : "invalid_result";
        errors.push(`${label} durable atomic handoff claim was not acquired (${status})`);
      } else {
        const bindings = [
          "parent_authority_id",
          "parent_state_revision",
          "parent_authority_digest",
          "parent_handoff_id",
          "parent_handoff_digest",
          "handoff_id",
          "nonce",
          "envelope_digest",
          "requested_budget_digest",
          "recipient_principal",
          "recipient_state_revision",
          "recipient_system_id",
          "recipient_worker_role",
          "recipient_run_id",
          "recipient_actor_mode",
        ];
        if (typeof claim.claim_id !== "string" || claim.claim_id.length === 0) {
          errors.push(`${label} durable atomic handoff claim omits claim_id`);
        }
        for (const field of bindings) {
          if (claim[field] !== request[field]) {
            errors.push(`${label} durable atomic handoff claim does not bind ${field}`);
          }
        }
      }
    } catch {
      errors.push(`${label} durable atomic handoff claim outcome is unavailable`);
    }
  }
  return errors;
}

export function capabilityManifestSemanticErrors(manifest, label = "capability manifest", options = {}) {
  const errors = [];
  const artifacts = manifest?.artifacts ?? {};
  const provenance = manifest?.provenance ?? {};
  const authority = manifest?.authority ?? {};
  const lifecycle = manifest?.lifecycle ?? {};
  const attestation = provenance?.attestation ?? {};
  const registry = provenance?.registry_record ?? {};
  const expectedAuthorityDigest = capabilityAuthorityDigest(authority);
  const expectedAttestationDigest = capabilityBuildAttestationDigest(attestation);
  const expectedRegistryDigest = capabilityRegistryDecisionDigest(registry);

  if (authority.digest !== expectedAuthorityDigest) {
    errors.push(`${label} authority.digest does not match the canonical admitted authority`);
  }
  if (provenance.artifact_digest !== artifacts.executable_digest) {
    errors.push(`${label} provenance artifact_digest does not equal executable_digest`);
  }
  if (attestation.subject_artifact_digest !== provenance.artifact_digest
    || attestation.subject_tool_contract_digest !== artifacts.tool_contract?.digest) {
    errors.push(`${label} provenance attestation is not bound to the exact executable and tool contract`);
  }
  if (provenance.build_attestation_digest !== expectedAttestationDigest) {
    errors.push(`${label} build_attestation_digest does not match the canonical embedded attestation`);
  }
  if (registry.decision !== manifest?.status
    || registry.capability_id !== manifest?.capability_id
    || registry.capability_version !== manifest?.version
    || registry.artifact_digest !== provenance.artifact_digest
    || registry.tool_contract_digest !== artifacts.tool_contract?.digest
    || registry.authority_digest !== expectedAuthorityDigest) {
    errors.push(`${label} registry record does not bind manifest identity, status, artifact, tool contract, and authority`);
  }
  if (registry.decision_digest !== expectedRegistryDigest) {
    errors.push(`${label} registry decision_digest does not match the canonical registry decision`);
  }
  if (Date.parse(provenance?.registry_record?.expires_at) <= Date.parse(provenance?.registry_record?.verified_at)) {
    errors.push(`${label} registry decision expiry does not follow verification`);
  }
  if (Date.parse(lifecycle?.review_due) < Date.parse(lifecycle?.introduced_at)) {
    errors.push(`${label} review_due precedes introduced_at`);
  }
  if (lifecycle?.eol_at && Date.parse(lifecycle.eol_at) < Date.parse(lifecycle.review_due)) {
    errors.push(`${label} eol_at precedes review_due`);
  }
  for (const duplicate of duplicateValues((authority.destinations ?? []).map((destination) => destination.service_id))) {
    errors.push(`${label} duplicates destination service_id ${duplicate}`);
  }

  const approved = manifest?.status === "approved";
  if (approved) {
    const now = options.now instanceof Date ? options.now.getTime() : Date.parse(options.now ?? new Date());
    if (now >= Date.parse(provenance?.registry_record?.expires_at)) errors.push(`${label} trusted registry decision is expired`);
    if (now >= Date.parse(lifecycle?.review_due)) errors.push(`${label} capability review is overdue`);
    if (lifecycle?.eol_at && now >= Date.parse(lifecycle.eol_at)) errors.push(`${label} capability has reached end of life`);
    try {
      const host = new URL(provenance.source_repository).hostname;
      if (host.endsWith(".invalid") || host === "example.com" || host === "github.com" && provenance.source_repository.includes("/example/")) {
        errors.push(`${label} approved capability uses an illustrative source origin`);
      }
    } catch {
      errors.push(`${label} approved capability source origin cannot be parsed`);
    }

    const observed = options.observedDigests ?? {};
    const digestBindings = [
      ["artifact", provenance.artifact_digest],
      ["sbom", provenance.sbom_digest],
      ["executable", manifest?.artifacts?.executable_digest],
      ["tool_contract", manifest?.artifacts?.tool_contract?.digest],
      ["input_schema", manifest?.artifacts?.input_schema_digest],
      ["output_schema", manifest?.artifacts?.output_schema_digest],
    ];
    if (manifest?.artifacts?.instruction_digest !== null) {
      digestBindings.push(["instruction", manifest.artifacts.instruction_digest]);
    }
    for (const [name, expected] of digestBindings) {
      if (observed[name] !== expected) errors.push(`${label} observed ${name} digest is unavailable or mismatched`);
    }
    const attestationVerification = options.attestationVerification;
    if (attestationVerification?.verified !== true) {
      errors.push(`${label} build attestation was not verified by a trusted key`);
    } else if (attestationVerification.build_attestation_digest !== provenance.build_attestation_digest) {
      errors.push(`${label} build attestation verification is not bound to the canonical attestation digest`);
    }
    const registryVerification = options.registryVerification;
    if (registryVerification?.verified !== true) {
      errors.push(`${label} registry decision was not verified`);
    } else if (registryVerification.decision_digest !== registry.decision_digest) {
      errors.push(`${label} registry verification is not bound to the canonical decision digest`);
    }
  }

  const requested = options.requestedAuthority;
  if (requested) {
    if (!approved) {
      errors.push(`${label} runtime invocation requires an approved capability lifecycle`);
    }
    if (!(authority.actor_modes ?? []).includes(requested.actor_mode)) errors.push(`${label} requested actor mode exceeds admitted authority`);
    if (!isSubset(requested.scopes, authority.scopes)) errors.push(`${label} requested scopes exceed admitted authority`);
    if (!isSubset(requested.data_classes, authority.data_classes)) errors.push(`${label} requested data classes exceed admitted authority`);
    if ((effectRank.get(requested.effect_ceiling) ?? Infinity) > (effectRank.get(authority.effect_ceiling) ?? -Infinity)) {
      errors.push(`${label} requested effect ceiling exceeds admitted authority`);
    }
    const destinations = new Set((authority.destinations ?? []).map((destination) => canonicalJson(destination)));
    if ((requested.destinations ?? []).some((destination) => !destinations.has(canonicalJson(destination)))) {
      errors.push(`${label} requested destination exceeds admitted authority`);
    }
    if (authority.tenant_binding === true && requested.tenant_binding !== true) {
      errors.push(`${label} requested invocation drops required tenant binding`);
    }
  }
  return errors;
}

export function operationalOntologySemanticErrors(ontology, label = "operational ontology") {
  const errors = [];
  const entities = new Map();
  const transitions = new Map();
  const policies = new Set();
  const evidence = new Set();
  const referencedTransitions = new Set();

  for (const entity of ontology?.entities ?? []) {
    if (entities.has(entity.entity_id)) errors.push(`${label} duplicates entity ${entity.entity_id}`);
    entities.set(entity.entity_id, entity);
    const states = new Set(entity.lifecycle_states ?? []);
    for (const duplicate of duplicateValues(entity.lifecycle_states ?? [])) {
      errors.push(`${label} entity ${entity.entity_id} duplicates lifecycle state ${duplicate}`);
    }
    for (const transition of entity.lifecycle_transitions ?? []) {
      if (transitions.has(transition.transition_id)) errors.push(`${label} duplicates transition ${transition.transition_id}`);
      transitions.set(transition.transition_id, { ...transition, entity_id: entity.entity_id });
      if (!states.has(transition.from_state)) {
        errors.push(`${label} transition ${transition.transition_id} has undeclared from_state ${transition.from_state}`);
      }
      if (!states.has(transition.to_state)) {
        errors.push(`${label} transition ${transition.transition_id} has undeclared to_state ${transition.to_state}`);
      }
    }
  }
  for (const duplicate of duplicateValues((ontology?.relationships ?? []).map((item) => item.relationship_id))) {
    errors.push(`${label} duplicates relationship ${duplicate}`);
  }
  for (const policy of ontology?.policies ?? []) {
    if (policies.has(policy.policy_id)) errors.push(`${label} duplicates policy ${policy.policy_id}`);
    policies.add(policy.policy_id);
  }
  for (const evidenceType of ontology?.evidence_types ?? []) {
    if (evidence.has(evidenceType.evidence_id)) errors.push(`${label} duplicates evidence type ${evidenceType.evidence_id}`);
    evidence.add(evidenceType.evidence_id);
  }

  const actionIds = new Set();
  const decisionIds = new Set();
  for (const action of ontology?.actions ?? []) {
    if (actionIds.has(action.action_id)) errors.push(`${label} duplicates action ${action.action_id}`);
    actionIds.add(action.action_id);
    if (!policies.has(action.authorization_policy)) {
      errors.push(`${label} action ${action.action_id} references unknown policy ${action.authorization_policy}`);
    }
    const actionEntities = new Set([...(action.input_entities ?? []), ...(action.output_entities ?? [])]);
    for (const entityId of actionEntities) {
      if (!entities.has(entityId)) errors.push(`${label} action ${action.action_id} references unknown entity ${entityId}`);
    }
    for (const transitionId of action.permitted_transitions ?? []) {
      referencedTransitions.add(transitionId);
      const transition = transitions.get(transitionId);
      if (!transition) errors.push(`${label} action ${action.action_id} references unknown transition ${transitionId}`);
      else if (!actionEntities.has(transition.entity_id)) {
        errors.push(`${label} action ${action.action_id} cannot apply transition ${transitionId} outside its entities`);
      }
    }
    const decisionId = action?.decision_contract?.decision_id;
    if (decisionIds.has(decisionId)) errors.push(`${label} duplicates decision ${decisionId}`);
    if (decisionId) decisionIds.add(decisionId);
    for (const evidenceId of action?.decision_contract?.evidence_types ?? []) {
      if (!evidence.has(evidenceId)) errors.push(`${label} action ${action.action_id} references unknown evidence ${evidenceId}`);
    }
    if (action.side_effect !== "none" && !action.idempotency_scope) {
      errors.push(`${label} side-effecting action ${action.action_id} has no idempotency scope`);
    }
  }
  for (const transitionId of transitions.keys()) {
    if (!referencedTransitions.has(transitionId)) errors.push(`${label} transition ${transitionId} is not owned by an action`);
  }
  for (const relationship of ontology?.relationships ?? []) {
    if (!entities.has(relationship.from)) errors.push(`${label} relationship ${relationship.relationship_id} has unknown from entity ${relationship.from}`);
    if (!entities.has(relationship.to)) errors.push(`${label} relationship ${relationship.relationship_id} has unknown to entity ${relationship.to}`);
  }
  return errors;
}

export function workflowCharterSemanticErrors(charter, label = "workflow charter") {
  const errors = [];
  for (const duplicate of duplicateValues((charter?.decision?.approvers ?? []).map((approval) => approval.principal))) {
    errors.push(`${label} approval principal ${duplicate} is not independent`);
  }
  for (const duplicate of duplicateValues((charter?.decision?.approvers ?? []).map((approval) => approval.role))) {
    errors.push(`${label} duplicates approval role ${duplicate}`);
  }
  for (const duplicate of duplicateValues((charter?.assumptions ?? []).map((assumption) => assumption.assumption_id))) {
    errors.push(`${label} duplicates assumption ${duplicate}`);
  }
  const requiredDisposition = new Map([
    ["pilot", "pilot"],
    ["production", "promote"],
    ["paused", "pause"],
    ["retired", "retire"],
  ]).get(charter?.status);
  if (requiredDisposition && charter?.decision?.disposition !== requiredDisposition) {
    errors.push(`${label} status ${charter.status} conflicts with decision ${charter?.decision?.disposition}`);
  }
  return errors;
}

export function dataContextManifestSemanticErrors(manifest, label = "data context manifest") {
  const errors = [];
  const requiredPlanes = new Set(["operational", "knowledge_context", "evaluation_training", "telemetry_feedback"]);
  const planes = new Map();
  for (const plane of manifest?.data_planes ?? []) {
    if (planes.has(plane.plane_id)) errors.push(`${label} duplicates data plane ${plane.plane_id}`);
    planes.set(plane.plane_id, plane);
  }
  for (const planeId of requiredPlanes) {
    if (!planes.has(planeId)) errors.push(`${label} is missing data plane ${planeId}`);
  }

  const sources = new Map();
  for (const source of manifest?.sources ?? []) {
    if (sources.has(source.source_id)) errors.push(`${label} duplicates source ${source.source_id}`);
    sources.set(source.source_id, source);
    for (const duplicate of duplicateValues((source?.quality?.metrics ?? []).map((metric) => metric.dimension))) {
      errors.push(`${label} source ${source.source_id} duplicates quality dimension ${duplicate}`);
    }
  }
  for (const [planeId, plane] of planes) {
    for (const sourceId of plane.source_ids ?? []) {
      const source = sources.get(sourceId);
      if (!source) errors.push(`${label} plane ${planeId} references unknown source ${sourceId}`);
      else if (!(source.planes ?? []).includes(planeId)) errors.push(`${label} plane ${planeId} and source ${sourceId} disagree on membership`);
    }
  }
  for (const source of sources.values()) {
    for (const planeId of source.planes ?? []) {
      if (!planes.get(planeId)?.source_ids?.includes(source.source_id)) {
        errors.push(`${label} source ${source.source_id} is not registered by plane ${planeId}`);
      }
    }
  }

  const critical = manifest?.quality_contract?.decision_critical_fields ?? [];
  for (const field of critical) {
    const source = sources.get(field.source_id);
    if (!source) {
      errors.push(`${label} decision-critical field ${field.field} references unknown source ${field.source_id}`);
      continue;
    }
    if (manifest?.status === "ready") {
      const metrics = new Map((source?.quality?.metrics ?? []).map((metric) => [metric.dimension, metric]));
      for (const dimension of field.required_dimensions ?? []) {
        const metric = metrics.get(dimension);
        if (!metric || metric.status !== "pass" || metric.observed === null) {
          errors.push(`${label} ready field ${field.source_id}.${field.field} lacks passing ${dimension} evidence`);
        }
      }
    }
  }
  for (const rule of manifest?.quality_contract?.reconciliation_rules ?? []) {
    for (const sourceId of rule.source_ids ?? []) {
      if (!sources.has(sourceId)) errors.push(`${label} reconciliation rule ${rule.rule_id} references unknown source ${sourceId}`);
    }
  }

  const availableInputs = new Set(sources.keys());
  for (const duplicate of duplicateValues((manifest?.preparation?.steps ?? []).map((step) => step.step_id))) {
    errors.push(`${label} duplicates preparation step ${duplicate}`);
  }
  for (const step of manifest?.preparation?.steps ?? []) {
    for (const input of step.inputs ?? []) {
      if (!availableInputs.has(input)) errors.push(`${label} preparation step ${step.step_id} references unavailable input ${input}`);
    }
    if (availableInputs.has(step.output_id)) errors.push(`${label} preparation output ${step.output_id} is not unique`);
    availableInputs.add(step.output_id);
  }

  for (const labelContract of manifest?.label_contracts ?? []) {
    if (!sources.has(labelContract.source_id)) errors.push(`${label} label ${labelContract.label_id} references unknown source ${labelContract.source_id}`);
    if (labelContract.owner === labelContract.independent_approver) errors.push(`${label} label ${labelContract.label_id} is self-approved`);
  }
  for (const duplicate of duplicateValues((manifest?.output_records ?? []).map((record) => record.output_id))) {
    errors.push(`${label} duplicates output record ${duplicate}`);
  }
  const optionIds = new Set((manifest?.economics?.options ?? []).map((option) => option.option_id));
  if (manifest?.economics?.selected_option && !optionIds.has(manifest.economics.selected_option)) {
    errors.push(`${label} selects unknown economic option ${manifest.economics.selected_option}`);
  }
  for (const monitor of manifest?.operations?.monitors ?? []) {
    if (!sources.has(monitor.source_id)) errors.push(`${label} monitor ${monitor.monitor_id} references unknown source ${monitor.source_id}`);
  }
  for (const duplicate of duplicateValues((manifest?.decision?.approved_by ?? []).map((approval) => approval.principal))) {
    errors.push(`${label} approval principal ${duplicate} is not independent`);
  }
  for (const duplicate of duplicateValues((manifest?.decision?.approved_by ?? []).map((approval) => approval.role))) {
    errors.push(`${label} duplicates approval role ${duplicate}`);
  }
  if (manifest?.status === "ready") {
    if ((manifest?.quality_contract?.unresolved_conditions ?? []).length > 0) errors.push(`${label} cannot be ready with unresolved conditions`);
    if (manifest?.decision?.disposition !== "continue") errors.push(`${label} ready status requires continue disposition`);
    const approvalRoles = new Set((manifest?.decision?.approved_by ?? []).map((approval) => approval.role));
    for (const role of ["data", "operational"]) if (!approvalRoles.has(role)) errors.push(`${label} ready status requires ${role} approval`);
    for (const segment of manifest?.quality_contract?.segment_coverage ?? []) {
      if (segment.status !== "pass") errors.push(`${label} ready segment ${segment.segment} lacks passing coverage evidence`);
    }
  }
  for (const controlId of ["CTX-006", "CTX-007", "CTX-008", "CTX-009"]) {
    if (!(manifest?.control_ids ?? []).includes(controlId)) errors.push(`${label} omits control ${controlId}`);
  }
  return errors;
}

export function engagementReframeSemanticErrors(record, label = "engagement reframe") {
  const errors = [];
  const claims = new Map();
  for (const duplicate of duplicateValues((record?.claims ?? []).map((claim) => claim.claim_id))) {
    errors.push(`${label} duplicates claim ${duplicate}`);
  }
  for (const claim of record?.claims ?? []) claims.set(claim.claim_id, claim);

  for (const duplicate of duplicateValues((record?.conflicts ?? []).map((conflict) => conflict.conflict_id))) {
    errors.push(`${label} duplicates conflict ${duplicate}`);
  }
  for (const conflict of record?.conflicts ?? []) {
    const classes = new Set();
    for (const claimId of conflict.claim_ids ?? []) {
      const claim = claims.get(claimId);
      if (!claim) errors.push(`${label} conflict ${conflict.conflict_id} references unknown claim ${claimId}`);
      else classes.add(claim.class);
    }
    if (classes.size < 2) errors.push(`${label} conflict ${conflict.conflict_id} does not preserve distinct evidence classes`);
  }

  const authority = record?.roles?.disposition_authority;
  if (record?.disposition) {
    if (authority?.status !== "verified") errors.push(`${label} records a disposition without verified disposition authority`);
    if (record.disposition.actor !== authority?.identity) errors.push(`${label} disposition actor is not the named disposition authority`);
  }
  if (record?.proposal?.status === "accepted") {
    if (!record.disposition) errors.push(`${label} accepts a proposal without a scoped human disposition`);
    if ((record?.conflicts ?? []).some((conflict) => conflict.state === "open")) {
      errors.push(`${label} accepts a proposal while a recorded conflict remains open`);
    }
  }

  for (const duplicate of duplicateValues((record?.downstream_impacts ?? []).map((impact) => impact.artifact_id))) {
    errors.push(`${label} duplicates downstream artifact ${duplicate}`);
  }
  for (const impact of record?.downstream_impacts ?? []) {
    for (const claimId of impact.depends_on_claim_ids ?? []) {
      if (!claims.has(claimId)) errors.push(`${label} impact ${impact.artifact_id} references unknown claim ${claimId}`);
    }
    if (impact.action === "supersede" && (impact.depends_on_claim_ids ?? []).length === 0) {
      errors.push(`${label} supersedes ${impact.artifact_id} without a claim dependency`);
    }
  }

  const chronology = record?.chronology ?? [];
  for (const duplicate of duplicateValues(chronology.map((event) => event.event_id))) {
    errors.push(`${label} duplicates chronology event ${duplicate}`);
  }
  for (let index = 1; index < chronology.length; index += 1) {
    if (Date.parse(chronology[index].occurred_at) < Date.parse(chronology[index - 1].occurred_at)) {
      errors.push(`${label} chronology is not ordered at ${chronology[index].event_id}`);
    }
  }
  for (const controlId of ["FDE-001", "FDE-002", "FDE-005"]) {
    if (!(record?.control_ids ?? []).includes(controlId)) errors.push(`${label} omits control ${controlId}`);
  }
  return errors;
}
