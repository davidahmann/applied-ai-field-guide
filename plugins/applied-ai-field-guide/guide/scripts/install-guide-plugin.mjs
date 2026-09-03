#!/usr/bin/env node

import { cp, lstat, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, "plugins", "applied-ai-field-guide");
const pluginParent = path.join(os.homedir(), "plugins");
const target = path.join(pluginParent, "applied-ai-field-guide");
const temporary = path.join(pluginParent, `.applied-ai-field-guide-install-${randomUUID()}`);
const configPath = path.resolve(process.env.APPLIED_AI_CONFIG_PATH || path.join(os.homedir(), ".config", "applied-ai-field-guide", "config.json"));
const configDirectory = path.dirname(configPath);
const legacyConfigPath = path.resolve(process.env.FDE_CONFIG_PATH || path.join(os.homedir(), ".config", "fde", "config.json"));
const workspaceOverride = process.env.APPLIED_AI_WORKSPACE_ROOT || process.env.FDE_WORKSPACE_ROOT;
const workspaceRoot = path.join(os.homedir(), "Applied-AI-Engagements");
const replace = process.argv.includes("--replace");

if (configPath === legacyConfigPath) throw new Error("new and legacy configuration paths must differ; migration preserves the legacy file");

// Home and the platform temp directory may have OS-managed aliases. Inspect every
// component below those trusted roots, or from the filesystem root elsewhere.
async function rejectLinkedPath(candidate) {
  const absolute = path.resolve(candidate);
  const bases = [os.homedir(), os.tmpdir()].map((base) => path.resolve(base)).filter((base) => absolute === base || absolute.startsWith(`${base}${path.sep}`));
  let current = bases.sort((left, right) => right.length - left.length)[0] || path.parse(absolute).root;
  const parts = path.relative(current, absolute).split(path.sep).filter(Boolean);
  for (const part of ["", ...parts]) {
    if (part) current = path.join(current, part);
    const metadata = await lstat(current).catch((error) => {
      if (error?.code === "ENOENT") return null;
      throw error;
    });
    if (!metadata) break;
    if (metadata.isSymbolicLink()) throw new Error(`symbolic links are not permitted in installation paths: ${current}`);
  }
}

async function canonicalPlannedPath(candidate) {
  let ancestor = path.resolve(candidate);
  const missing = [];
  while (true) {
    try {
      return path.join(await realpath(ancestor), ...missing);
    } catch (error) {
      if (error?.code !== "ENOENT" || ancestor === path.dirname(ancestor)) throw error;
      missing.unshift(path.basename(ancestor));
      ancestor = path.dirname(ancestor);
    }
  }
}

function containsPath(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function readPriorConfig(candidate) {
  await rejectLinkedPath(candidate);
  const metadata = await lstat(candidate).catch((error) => {
    if (error?.code === "ENOENT") return null;
    throw error;
  });
  if (!metadata) return null;
  if (!metadata.isFile()) throw new Error("existing configuration must be a regular file");
  let config;
  try {
    config = JSON.parse(await readFile(candidate, "utf8"));
  } catch (error) {
    throw new Error(`existing configuration is invalid: ${error.message}`);
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("existing configuration must be a JSON object");
  if (typeof config.workspace_root !== "string" || !path.isAbsolute(config.workspace_root) || !config.workspace_root.trim()) throw new Error("existing configuration requires an absolute workspace_root; refusing to create a replacement workspace");
  for (const field of ["max_read_bytes", "max_write_bytes"]) {
    if (config[field] !== undefined && (!Number.isInteger(config[field]) || config[field] < 4096 || config[field] > 1024 * 1024)) throw new Error(`existing configuration has an invalid ${field}`);
  }
  if (config.allow_confidential_model_context !== undefined && typeof config.allow_confidential_model_context !== "boolean") throw new Error("existing configuration has an invalid confidential-context policy");
  return config;
}

const rootCatalog = await stat(path.join(root, "catalog.json")).catch(() => null);
const manifest = await stat(path.join(source, ".codex-plugin", "plugin.json")).catch(() => null);
if (!rootCatalog?.isFile() || !manifest?.isFile()) throw new Error("run the installer from a complete, trusted Applied AI Field Guide checkout");
for (const [label, candidate] of [["repository root", root], ["plugin source", source]]) {
  if ((await lstat(candidate)).isSymbolicLink()) throw new Error(`${label} cannot be a symbolic link`);
}

async function rejectPackagedLinks(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const candidate = path.join(directory, entry.name);
    const metadata = await lstat(candidate);
    if (metadata.isSymbolicLink()) throw new Error(`plugin package contains a symbolic link: ${candidate}`);
    if (metadata.isDirectory()) await rejectPackagedLinks(candidate);
  }
}

await rejectPackagedLinks(source);
await rejectLinkedPath(target);
await rejectLinkedPath(configPath);
const canonicalTarget = await canonicalPlannedPath(target);
if (containsPath(canonicalTarget, await canonicalPlannedPath(configPath))) throw new Error("configuration cannot be stored inside the replaceable plugin package");
const current = await lstat(target).catch((error) => {
  if (error?.code === "ENOENT") return null;
  throw error;
});
if (current && !current.isDirectory()) throw new Error("plugin installation target must be a directory");
if (current && !replace) throw new Error(`${target} already exists; rerun with --replace after reviewing the installed and source versions`);

const currentConfig = await readPriorConfig(configPath);
const legacyConfig = currentConfig ? null : await readPriorConfig(legacyConfigPath);
if (!currentConfig && process.env.FDE_CONFIG_PATH && !legacyConfig) throw new Error("explicit legacy configuration is missing; refusing to create a replacement workspace");
if (legacyConfig && containsPath(canonicalTarget, await canonicalPlannedPath(legacyConfigPath))) throw new Error("legacy configuration cannot be stored inside the replaceable plugin package");
const priorConfig = currentConfig || legacyConfig || {};
const configuredWorkspace = path.resolve(workspaceOverride || priorConfig.workspace_root || workspaceRoot);
await rejectLinkedPath(configuredWorkspace);
const canonicalWorkspace = await canonicalPlannedPath(configuredWorkspace);
if (containsPath(canonicalTarget, canonicalWorkspace) || containsPath(canonicalWorkspace, canonicalTarget)) throw new Error("engagement workspace and replaceable plugin package cannot overlap");
const priorWorkspace = await stat(configuredWorkspace).catch((error) => {
  if (error?.code === "ENOENT") return null;
  throw error;
});
if (priorConfig.workspace_root && !workspaceOverride && !priorWorkspace?.isDirectory()) throw new Error("configured engagement root is missing or not a directory; restore it before migrating");
await mkdir(pluginParent, { recursive: true, mode: 0o700 });
await mkdir(configDirectory, { recursive: true, mode: 0o700 });
await mkdir(configuredWorkspace, { recursive: true, mode: 0o700 });
const installedConfig = {
  ...priorConfig,
  guide_root: path.join(target, "guide"),
  validator_root: root,
  workspace_root: configuredWorkspace,
  max_read_bytes: priorConfig.max_read_bytes ?? 65536,
  max_write_bytes: priorConfig.max_write_bytes ?? 262144,
  allow_confidential_model_context: priorConfig.allow_confidential_model_context === true,
};
const configTemporary = path.join(configDirectory, `.config-${randomUUID()}.tmp`);
await writeFile(configTemporary, `${JSON.stringify(installedConfig, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });

let backup = null;
let installedNewPlugin = false;
try {
  await cp(source, temporary, { recursive: true, dereference: false, errorOnExist: true });
  if (current) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    backup = path.join(pluginParent, `applied-ai-field-guide.backup-${stamp}-${randomUUID()}`);
    await rename(target, backup);
  }
  try {
    await rename(temporary, target);
    installedNewPlugin = true;
  } catch (error) {
    if (backup) await rename(backup, target);
    throw error;
  }
  try {
    await rename(configTemporary, configPath);
  } catch (error) {
    if (installedNewPlugin) await rm(target, { recursive: true, force: true });
    if (backup) await rename(backup, target);
    throw error;
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
  await rm(configTemporary, { force: true });
}

const installed = JSON.parse(await readFile(path.join(target, ".codex-plugin", "plugin.json"), "utf8"));
process.stdout.write(`Installed The Applied AI Field Guide ${installed.version} at ${target}.\nConfiguration: ${configPath}\nEngagement root: ${installedConfig.workspace_root}\n${legacyConfig ? `Migrated settings from ${legacyConfigPath}; the legacy file and engagement data were not modified.\n` : ""}${backup ? `Previous plugin preserved at ${backup}.\n` : ""}`);
