import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const layers = [
  { label: "library/*.md", ceiling: 18, directory: "library", include: (entry) => entry.isFile() && entry.name.endsWith(".md") },
  { label: "top-level templates/*", ceiling: 37, directory: "templates", include: (entry) => entry.isFile() },
  { label: "blueprints/*.md", ceiling: 12, directory: "blueprints", include: (entry) => entry.isFile() && entry.name.endsWith(".md") },
  { label: "guide/*.md", ceiling: 5, directory: "guide", include: (entry) => entry.isFile() && entry.name.endsWith(".md") },
];

function documentedCeilings(body) {
  const section = body.split("## Contract change matrix", 1)[0].split("The v1.26.0 inventory is the consolidation ceiling for the densest public layers:", 2)[1];
  assert.ok(section, "the consolidation-ceiling section is missing");
  return new Map([...section.matchAll(/^\| (.+?) \| (\d+) \|/gm)].map(([, label, ceiling]) => [label.replaceAll("`", ""), Number(ceiling)]));
}

test("maintainer consolidation ceilings are explicit and enforced against the current inventory", async () => {
  const maintenance = await readFile(path.join(root, "docs", "maintainers", "repository-maintenance.md"), "utf8");
  const ceilings = documentedCeilings(maintenance);

  assert.equal(ceilings.size, layers.length, "the maintenance table should expose only the governed consolidation ceilings");
  assert.match(maintenance, /explicit maintainer decision in the changelog/i);
  assert.match(maintenance, /repository test suite parses this table and counts the named layers/i);

  for (const layer of layers) {
    assert.equal(ceilings.get(layer.label), layer.ceiling, `${layer.label} ceiling drifted without an explicit test update`);
    const entries = await readdir(path.join(root, layer.directory), { withFileTypes: true });
    const count = entries.filter(layer.include).length;
    assert.ok(count <= layer.ceiling, `${layer.label} has ${count} files, exceeding its ceiling of ${layer.ceiling}`);
  }
});
