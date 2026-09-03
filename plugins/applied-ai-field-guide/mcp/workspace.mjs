import { createHash, randomUUID } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import os from "node:os";
import path from "node:path";

const identifierPattern = /^[a-z][a-z0-9-]{2,63}$/;
const allowedClassifications = new Set(["public", "internal", "confidential", "restricted"]);
const maxStateBytes = 5 * 1024 * 1024;
const lockAttempts = 80;
const lockRetryMs = 25;

export class GuideError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "GuideError";
    this.code = code;
    this.details = details;
  }
}

export function requireString(value, field, { min = 1, max = 500 } = {}) {
  if (typeof value !== "string" || value.trim().length < min || value.length > max) {
    throw new GuideError("INVALID_INPUT", `${field} must be a string between ${min} and ${max} characters`);
  }
  return value.trim();
}

export function requireIdentifier(value, field) {
  const candidate = requireString(value, field, { min: 3, max: 64 });
  if (!identifierPattern.test(candidate)) {
    throw new GuideError("INVALID_INPUT", `${field} must use lowercase letters, digits, and hyphens and begin with a letter`);
  }
  return candidate;
}

export function requireClassification(value, field = "classification") {
  const candidate = requireString(value, field, { min: 1, max: 32 });
  if (!allowedClassifications.has(candidate)) {
    throw new GuideError("INVALID_INPUT", `${field} must be public, internal, confidential, or restricted`);
  }
  return candidate;
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function digest(value) {
  const body = typeof value === "string" || Buffer.isBuffer(value) ? value : canonicalJson(value);
  return `sha256:${createHash("sha256").update(body).digest("hex")}`;
}

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function rejectSymlinkPath(root, candidate, allowMissingLeaf = false) {
  const rootReal = await realpath(root);
  const absolute = path.resolve(candidate);
  if (!within(path.resolve(root), absolute)) throw new GuideError("PATH_ESCAPE", "path escapes its configured root");

  const relative = path.relative(path.resolve(root), absolute);
  let current = path.resolve(root);
  const parts = relative ? relative.split(path.sep) : [];
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    try {
      const metadata = await lstat(current);
      if (metadata.isSymbolicLink()) throw new GuideError("SYMLINK_DENIED", "symbolic links are not permitted inside an engagement workspace");
    } catch (error) {
      if (error?.code === "ENOENT" && allowMissingLeaf && index === parts.length - 1) break;
      throw error;
    }
  }
  const parentReal = await realpath(parts.length === 0 ? absolute : path.dirname(absolute));
  if (!within(rootReal, parentReal)) throw new GuideError("PATH_ESCAPE", "resolved path escapes its configured root");
  return absolute;
}

export async function loadConfig({ env = process.env, home = os.homedir() } = {}) {
  const explicitPath = env.APPLIED_AI_CONFIG_PATH || env.FDE_CONFIG_PATH;
  let configPath = path.resolve(explicitPath || path.join(home, ".config", "applied-ai-field-guide", "config.json"));
  const readConfigFile = async (candidate) => {
    const bases = [home, os.tmpdir()].map((base) => path.resolve(base)).filter((base) => candidate === base || candidate.startsWith(`${base}${path.sep}`));
    let current = bases.sort((left, right) => right.length - left.length)[0] || path.parse(candidate).root;
    for (const part of ["", ...path.relative(current, candidate).split(path.sep).filter(Boolean)]) {
      if (part) current = path.join(current, part);
      if ((await lstat(current)).isSymbolicLink()) throw new GuideError("CONFIG_INVALID", "configuration paths cannot contain symbolic links");
    }
    if (!(await lstat(candidate)).isFile()) throw new GuideError("CONFIG_INVALID", "configuration must be a regular file");
    return JSON.parse(await readFile(candidate, "utf8"));
  };
  let raw;
  try {
    try {
      raw = await readConfigFile(configPath);
    } catch (error) {
      if (error?.code !== "ENOENT" || explicitPath) throw error;
      configPath = path.join(home, ".config", "fde", "config.json");
      raw = await readConfigFile(configPath);
    }
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new GuideError("CONFIG_MISSING", `plugin configuration is missing at ${configPath}; run the repository's local plugin installer`);
    }
    throw new GuideError("CONFIG_INVALID", `plugin configuration cannot be read: ${error.message}`);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new GuideError("CONFIG_INVALID", "plugin configuration must be a JSON object");
  const guideRoot = path.resolve(requireString(raw.guide_root, "guide_root", { max: 4096 }));
  const validatorRoot = path.resolve(requireString(raw.validator_root || raw.guide_root, "validator_root", { max: 4096 }));
  const workspaceRoot = path.resolve(requireString(raw.workspace_root, "workspace_root", { max: 4096 }));
  for (const [label, target] of [["guide_root", guideRoot], ["workspace_root", workspaceRoot]]) {
    const metadata = await stat(target).catch(() => null);
    if (!metadata?.isDirectory()) throw new GuideError("CONFIG_INVALID", `${label} must be an existing directory`);
    if ((await lstat(target)).isSymbolicLink()) throw new GuideError("CONFIG_INVALID", `${label} cannot be a symbolic link`);
  }
  const validatorMetadata = await stat(validatorRoot).catch(() => null);
  if (validatorMetadata && !validatorMetadata.isDirectory()) throw new GuideError("CONFIG_INVALID", "validator_root must be a directory when present");
  if (validatorMetadata && (await lstat(validatorRoot)).isSymbolicLink()) throw new GuideError("CONFIG_INVALID", "validator_root cannot be a symbolic link");
  const catalog = await stat(path.join(guideRoot, "catalog.json")).catch(() => null);
  if (!catalog?.isFile()) throw new GuideError("CONFIG_INVALID", "guide_root does not contain catalog.json");
  return {
    configPath,
    guideRoot: await realpath(guideRoot),
    validatorRoot: validatorMetadata ? await realpath(validatorRoot) : validatorRoot,
    workspaceRoot: await realpath(workspaceRoot),
    maxReadBytes: Math.min(Math.max(Number(raw.max_read_bytes) || 64 * 1024, 4096), 1024 * 1024),
    maxWriteBytes: Math.min(Math.max(Number(raw.max_write_bytes) || 256 * 1024, 4096), 1024 * 1024),
    allowConfidentialModelContext: raw.allow_confidential_model_context === true,
  };
}

export async function engagementPaths(config, engagementId, { mustExist = true } = {}) {
  const id = requireIdentifier(engagementId, "engagement_id");
  const directory = path.join(config.workspaceRoot, id);
  if (!mustExist) {
    await mkdir(directory, { recursive: false, mode: 0o700 }).catch((error) => {
      if (error?.code !== "EEXIST") throw error;
    });
  }
  await rejectSymlinkPath(config.workspaceRoot, directory);
  const metadata = await stat(directory).catch(() => null);
  if (!metadata?.isDirectory()) throw new GuideError("ENGAGEMENT_NOT_FOUND", `engagement ${id} does not exist`);
  return {
    id,
    directory,
    state: path.join(directory, "engagement-state.json"),
    audit: path.join(directory, "audit.jsonl"),
    artifacts: path.join(directory, "artifacts"),
    exports: path.join(directory, "exports"),
  };
}

export async function initializeEngagement(config, input) {
  const engagementId = requireIdentifier(input.engagement_id, "engagement_id");
  const engagement = {
    engagement_id: engagementId,
    title: requireString(input.title, "title", { max: 200 }),
    tenant: requireString(input.tenant, "tenant", { max: 200 }),
    workflow: requireString(input.workflow, "workflow", { max: 500 }),
    classification: requireClassification(input.classification),
    retention_summary: requireString(input.retention_summary, "retention_summary", { max: 1000 }),
  };
  const paths = await engagementPaths(config, engagementId, { mustExist: false });
  return withEngagementLock(paths, async () => {
    const existing = await readFile(paths.state, "utf8").catch((error) => error?.code === "ENOENT" ? null : Promise.reject(error));
    if (existing !== null) {
      const current = JSON.parse(existing);
      if (digest(current.engagement) !== digest(engagement)) {
        throw new GuideError("ENGAGEMENT_CONFLICT", `engagement ${engagementId} already exists with different metadata`);
      }
      return { state: current, created: false, paths, auditMirrorStatus: "not-required" };
    }
    const now = new Date().toISOString();
    const state = {
      schema_version: "1.0.0",
      engagement,
      created_at: now,
      updated_at: now,
      sources: [],
      artifacts: [],
      decisions: [],
      operations: {},
      events: [{ event_id: randomUUID(), event_type: "engagement_started", occurred_at: now, subject_refs: [engagementId] }],
    };
    await mkdir(paths.artifacts, { recursive: true, mode: 0o700 });
    await mkdir(paths.exports, { recursive: true, mode: 0o700 });
    await atomicWriteJson(paths.state, state);
    const auditMirrorStatus = await appendAuditMirror(paths.directory, paths.audit, state.events[0]);
    return { state, created: true, paths, auditMirrorStatus };
  });
}

export async function loadEngagement(config, engagementId) {
  const paths = await engagementPaths(config, engagementId);
  await rejectSymlinkPath(config.workspaceRoot, paths.state);
  const metadata = await stat(paths.state).catch(() => null);
  if (!metadata?.isFile()) throw new GuideError("ENGAGEMENT_NOT_FOUND", `engagement ${paths.id} has no state record`);
  if (metadata.size > maxStateBytes) throw new GuideError("STATE_TOO_LARGE", "engagement state exceeds the local safety limit");
  let state;
  try {
    state = JSON.parse(await readFile(paths.state, "utf8"));
  } catch (error) {
    throw new GuideError("STATE_INVALID", `engagement state cannot be parsed: ${error.message}`);
  }
  if (state?.engagement?.engagement_id !== paths.id) throw new GuideError("STATE_INVALID", "engagement state identity does not match its directory");
  assertStateIntegrity(state);
  return { paths, state };
}

export async function mutateEngagement(config, engagementId, operationId, operationInput, eventType, mutator) {
  const opId = requireIdentifier(operationId, "operation_id");
  const paths = await engagementPaths(config, engagementId);
  return withEngagementLock(paths, async () => {
    const loaded = await loadEngagement(config, engagementId);
    const inputDigest = digest(operationInput);
    const prior = loaded.state.operations?.[opId];
    if (prior) {
      if (prior.input_digest !== inputDigest) throw new GuideError("OPERATION_CONFLICT", `operation_id ${opId} was already used with different input`);
      return { ...prior.result, idempotent_replay: true, audit_mirror_status: "not-replayed" };
    }
    const mutation = await mutator(structuredClone(loaded.state), loaded.paths);
    const now = new Date().toISOString();
    const event = {
      event_id: randomUUID(),
      event_type: eventType,
      occurred_at: now,
      operation_id: opId,
      subject_refs: mutation.subjectRefs || [],
      result_digest: digest(mutation.result),
    };
    mutation.state.updated_at = now;
    mutation.state.events.push(event);
    const replayResult = structuredClone(mutation.result);
    if (Object.hasOwn(replayResult, "preview")) {
      delete replayResult.preview;
      replayResult.preview_omitted_from_replay = true;
    }
    mutation.state.operations[opId] = { input_digest: inputDigest, result: replayResult, completed_at: now };
    await atomicWriteJson(loaded.paths.state, mutation.state);
    const auditMirrorStatus = await appendAuditMirror(loaded.paths.directory, loaded.paths.audit, event);
    return { ...mutation.result, idempotent_replay: false, audit_mirror_status: auditMirrorStatus };
  });
}

export async function writeImmutableFile(root, candidate, content, maxBytes) {
  const body = Buffer.from(content, "utf8");
  if (body.byteLength > maxBytes) throw new GuideError("WRITE_LIMIT", `content exceeds ${maxBytes} bytes`);
  await ensureContainedDirectory(root, path.dirname(candidate));
  await rejectSymlinkPath(root, candidate, true);
  let handle;
  try {
    handle = await open(candidate, "wx", 0o600);
    await handle.writeFile(body);
    await handle.sync();
  } catch (error) {
    if (error?.code === "EEXIST") throw new GuideError("IMMUTABLE_CONFLICT", "the immutable target already exists");
    throw error;
  } finally {
    await handle?.close();
  }
  return { bytes: body.byteLength, digest: digest(body) };
}

async function ensureContainedDirectory(root, directory) {
  const rootResolved = path.resolve(root);
  const target = path.resolve(directory);
  if (!within(rootResolved, target)) throw new GuideError("PATH_ESCAPE", "directory escapes its configured root");
  const rootReal = await realpath(rootResolved);
  const parts = path.relative(rootResolved, target).split(path.sep).filter(Boolean);
  let current = rootResolved;
  for (const part of parts) {
    current = path.join(current, part);
    let metadata = await lstat(current).catch((error) => error?.code === "ENOENT" ? null : Promise.reject(error));
    if (!metadata) {
      await mkdir(current, { recursive: false, mode: 0o700 }).catch((error) => {
        if (error?.code !== "EEXIST") throw error;
      });
      metadata = await lstat(current);
    }
    if (metadata.isSymbolicLink()) throw new GuideError("SYMLINK_DENIED", "symbolic links are not permitted inside an engagement workspace");
    if (!metadata.isDirectory()) throw new GuideError("NOT_A_DIRECTORY", "an engagement workspace ancestor is not a directory");
    if (!within(rootReal, await realpath(current))) throw new GuideError("PATH_ESCAPE", "resolved directory escapes its configured root");
  }
}

function assertStateIntegrity(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) throw new GuideError("STATE_INVALID", "engagement state must be an object");
  for (const field of ["sources", "artifacts", "decisions", "events"]) {
    if (!Array.isArray(state[field])) throw new GuideError("STATE_INVALID", `engagement state ${field} must be an array`);
  }
  if (!state.operations || typeof state.operations !== "object" || Array.isArray(state.operations)) throw new GuideError("STATE_INVALID", "engagement state operations must be an object");
  const owners = new Map([[state.engagement.engagement_id, "engagement"]]);
  const add = (identifier, kind) => {
    const prior = owners.get(identifier);
    if (prior && !(prior === "artifact" && kind === "artifact")) {
      throw new GuideError("STATE_INVALID", `identifier ${identifier} is shared by ${prior} and ${kind}`);
    }
    owners.set(identifier, kind);
  };
  state.sources.forEach(({ source_id: id }) => add(id, "source"));
  state.artifacts.forEach(({ artifact_id: id }) => add(id, "artifact"));
  state.decisions.forEach(({ decision_id: id }) => add(id, "decision"));
  const identity = new Map();
  for (const artifact of state.artifacts) {
    const signature = `${artifact.artifact_type}\0${artifact.format}`;
    if (identity.has(artifact.artifact_id) && identity.get(artifact.artifact_id) !== signature) {
      throw new GuideError("STATE_INVALID", `artifact ${artifact.artifact_id} changed type or format across revisions`);
    }
    identity.set(artifact.artifact_id, signature);
  }
  const decisions = new Map(state.decisions.map((decision) => [decision.decision_id, decision]));
  const decisionHeads = new Map();
  for (const decision of state.decisions) {
    if (typeof decision.decision_stream_id !== "string" || decision.decision_stream_id.length === 0) {
      throw new GuideError("STATE_INVALID", `decision ${decision.decision_id} has no decision stream`);
    }
    if (decision.scope_digest !== digest(decision.scope)) {
      throw new GuideError("STATE_INVALID", `decision ${decision.decision_id} has an invalid scope digest`);
    }
    const streamKey = `${decision.decision_kind}\0${decision.decision_stream_id}`;
    if (decision.supersedes_decision_id) {
      const prior = decisions.get(decision.supersedes_decision_id);
      if (!prior || prior.decision_kind !== decision.decision_kind || prior.decision_stream_id !== decision.decision_stream_id) {
        throw new GuideError("STATE_INVALID", `decision ${decision.decision_id} supersedes a decision outside its stream`);
      }
      if (prior.scope_digest !== decision.scope_digest) {
        throw new GuideError("STATE_INVALID", `decision ${decision.decision_id} changes scope within its stream`);
      }
      if (decisionHeads.get(streamKey) !== prior.decision_id) {
        throw new GuideError("STATE_INVALID", `decision ${decision.decision_id} does not supersede the current stream head`);
      }
    } else if (decisionHeads.has(streamKey)) {
      throw new GuideError("STATE_INVALID", `decision stream ${decision.decision_stream_id} has multiple roots`);
    }
    decisionHeads.set(streamKey, decision.decision_id);
  }
}

export async function readWorkspaceFile(config, engagementId, relativePath, maxBytes = config.maxReadBytes) {
  const { paths } = await loadEngagement(config, engagementId);
  const target = path.resolve(paths.directory, relativePath);
  await rejectSymlinkPath(paths.directory, target);
  const metadata = await stat(target);
  if (!metadata.isFile()) throw new GuideError("NOT_A_FILE", "workspace target is not a regular file");
  if (metadata.size > maxBytes) throw new GuideError("READ_LIMIT", `file exceeds ${maxBytes} bytes`);
  return { target, body: await readFile(target, "utf8"), metadata };
}

async function atomicWriteJson(target, value) {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  if (Buffer.byteLength(body) > maxStateBytes) throw new GuideError("STATE_TOO_LARGE", "engagement state exceeds the local safety limit");
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, body, { mode: 0o600, flag: "wx" });
    await chmod(temporary, 0o600);
    await rename(temporary, target);
  } finally {
    await unlink(temporary).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
  }
}

async function appendAuditMirror(root, target, event) {
  let handle;
  try {
    await rejectSymlinkPath(root, target, true);
    handle = await open(target, fsConstants.O_APPEND | fsConstants.O_CREAT | fsConstants.O_WRONLY | fsConstants.O_NOFOLLOW, 0o600);
    const metadata = await handle.stat();
    if (!metadata.isFile() || metadata.nlink !== 1) throw new GuideError("AUDIT_TARGET_DENIED", "audit mirror must be a singly linked regular file");
    await handle.writeFile(`${JSON.stringify(event)}\n`);
    await handle.sync();
    await handle.chmod(0o600);
    return "written";
  } catch (error) {
    process.stderr.write(`[applied-ai-mcp] audit mirror degraded: ${error?.message || error}\n`);
    return "degraded";
  } finally {
    await handle?.close();
  }
}

async function withEngagementLock(paths, operation) {
  const lockPath = `${paths.state}.lock`;
  for (let attempt = 0; attempt < lockAttempts; attempt += 1) {
    let handle;
    try {
      handle = await open(lockPath, "wx", 0o600);
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, lockRetryMs));
      continue;
    }
    try {
      await handle.writeFile(`${JSON.stringify({ pid: process.pid, created_at: new Date().toISOString() })}\n`);
      await handle.sync();
      return await operation();
    } finally {
      await handle.close();
      await unlink(lockPath).catch((error) => {
        if (error?.code !== "ENOENT") throw error;
      });
    }
  }
  throw new GuideError("ENGAGEMENT_BUSY", `engagement ${paths.id} is busy; retry the operation with the same operation_id`);
}

export async function cleanupNewFile(target) {
  await unlink(target).catch((error) => {
    if (error?.code !== "ENOENT") throw error;
  });
}

export async function safeGuideFile(config, relativePath) {
  const candidate = path.resolve(config.guideRoot, relativePath);
  await rejectSymlinkPath(config.guideRoot, candidate);
  const metadata = await stat(candidate);
  if (!metadata.isFile()) throw new GuideError("GUIDE_FILE_INVALID", "guide target is not a regular file");
  return { candidate, metadata };
}
