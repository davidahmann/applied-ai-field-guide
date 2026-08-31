#!/usr/bin/env node

import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, ".agents", "skills");
const target = path.join(root, "plugins", "fde", "skills");
const guideTarget = path.join(root, "plugins", "fde", "guide");
const pluginManifestPath = path.join(root, "plugins", "fde", ".codex-plugin", "plugin.json");
const packageMetadata = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const pluginManifest = JSON.parse(await readFile(pluginManifestPath, "utf8"));

if (target !== path.join(root, "plugins", "fde", "skills") || guideTarget !== path.join(root, "plugins", "fde", "guide")) {
  throw new Error("refusing to sync outside the FDE plugin package");
}
const skillEntries = (await readdir(source, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));
if (skillEntries.length < 10) throw new Error("canonical skill set is unexpectedly small");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const entry of skillEntries) {
  await cp(path.join(source, entry.name), path.join(target, entry.name), { recursive: true, dereference: false, errorOnExist: true });
  const packagedSkill = path.join(target, entry.name, "SKILL.md");
  const body = await readFile(packagedSkill, "utf8");
  await writeFile(packagedSkill, body.replaceAll("(../../../", "(../../guide/"), "utf8");
}

const guideFiles = [
  "AGENTS.md", "CHANGELOG.md", "CITATION.cff", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "GOVERNANCE.md",
  "LICENSE", "NOTICE", "README.md", "SECURITY.md", "SUPPORT.md", "catalog.json", "llms.txt", "package.json", "package-lock.json",
];
const guideDirectories = [
  "assets", "blueprints", "controls", "docs", "examples", "guide", "library", "operations", "patterns",
  "playbooks", "research", "schemas", "scripts", "solutions", "templates",
];
await rm(guideTarget, { recursive: true, force: true });
await mkdir(guideTarget, { recursive: true });
for (const file of guideFiles) await cp(path.join(root, file), path.join(guideTarget, file), { dereference: false });
for (const directory of guideDirectories) {
  await cp(path.join(root, directory), path.join(guideTarget, directory), { recursive: true, dereference: false, errorOnExist: true });
}
await mkdir(path.join(guideTarget, ".agents"), { recursive: true });
await cp(source, path.join(guideTarget, ".agents", "skills"), { recursive: true, dereference: false, errorOnExist: true });
await mkdir(path.join(guideTarget, "plugins", "fde"), { recursive: true });
await cp(path.join(root, "plugins", "fde", "README.md"), path.join(guideTarget, "plugins", "fde", "README.md"));
await cp(path.join(root, "plugins", "fde", "SECURITY.md"), path.join(guideTarget, "plugins", "fde", "SECURITY.md"));

pluginManifest.version = packageMetadata.version;
await writeFile(pluginManifestPath, `${JSON.stringify(pluginManifest, null, 2)}\n`, "utf8");
process.stdout.write(`Synced ${skillEntries.length} skills and their canonical Guide snapshot into plugins/fde at version ${packageMetadata.version}.\n`);
