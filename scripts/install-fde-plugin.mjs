#!/usr/bin/env node

import { cp, lstat, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, "plugins", "fde");
const pluginParent = path.join(os.homedir(), "plugins");
const target = path.join(pluginParent, "fde");
const temporary = path.join(pluginParent, `.fde-install-${randomUUID()}`);
const configDirectory = path.join(os.homedir(), ".config", "fde");
const configPath = path.join(configDirectory, "config.json");
const workspaceRoot = path.resolve(process.env.FDE_WORKSPACE_ROOT || path.join(os.homedir(), "FDE-Engagements"));
const replace = process.argv.includes("--replace");

const rootCatalog = await stat(path.join(root, "catalog.json")).catch(() => null);
const manifest = await stat(path.join(source, ".codex-plugin", "plugin.json")).catch(() => null);
if (!rootCatalog?.isFile() || !manifest?.isFile()) throw new Error("run the installer from a complete, trusted FDE Guide checkout");
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

await mkdir(pluginParent, { recursive: true, mode: 0o700 });
await mkdir(configDirectory, { recursive: true, mode: 0o700 });

const current = await stat(target).catch(() => null);
if (current && !replace) throw new Error(`${target} already exists; rerun with --replace after reviewing the installed and source versions`);

const priorConfig = await readFile(configPath, "utf8").then(JSON.parse).catch((error) => {
  if (error?.code === "ENOENT") return {};
  throw new Error(`existing FDE configuration is invalid: ${error.message}`);
});
if (!priorConfig || typeof priorConfig !== "object" || Array.isArray(priorConfig)) throw new Error("existing FDE configuration must be a JSON object");
const configuredWorkspace = path.resolve(process.env.FDE_WORKSPACE_ROOT || priorConfig.workspace_root || workspaceRoot);
await mkdir(configuredWorkspace, { recursive: true, mode: 0o700 });
if ((await lstat(configuredWorkspace)).isSymbolicLink()) throw new Error("engagement root cannot be a symbolic link");
const installedConfig = {
  guide_root: path.join(target, "guide"),
  validator_root: root,
  workspace_root: configuredWorkspace,
  max_read_bytes: priorConfig.max_read_bytes || 65536,
  max_write_bytes: priorConfig.max_write_bytes || 262144,
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
    backup = path.join(pluginParent, `fde.backup-${stamp}`);
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
process.stdout.write(`Installed FDE ${installed.version} at ${target}.\nConfiguration: ${configPath}\nEngagement root: ${installedConfig.workspace_root}\n${backup ? `Previous plugin preserved at ${backup}.\n` : ""}`);
