import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { githubSlug, markdownAnchors, stripHtmlTags } from "../scripts/markdown-anchors.mjs";

test("GitHub-style slugs normalize punctuation and whitespace", () => {
  assert.equal(githubSlug("  The Applied AI Field Guide!  "), "the-applied-ai-field-guide");
});

test("inline HTML tags are removed without re-forming nested markup", () => {
  assert.equal(stripHtmlTags("Use <em>bounded</em> tools"), "Use bounded tools");
  assert.equal(githubSlug("<<script>>alert</script>"), "alert");
  assert.doesNotMatch(githubSlug("<<script>>alert</script>"), /[<>]/);
});

test("duplicate headings and explicit anchors receive stable unique slugs", () => {
  const anchors = markdownAnchors([
    "# Release gate",
    "# Release gate",
    '<a id="release-gate-2"></a>',
    "# Release gate",
  ].join("\n"));

  assert.deepEqual([...anchors], ["release-gate-2", "release-gate", "release-gate-1", "release-gate-3"]);
});

test("public lifecycle diagrams do not silently relabel an earlier stage", async () => {
  for (const file of ["README.md", "guide/README.md", "playbooks/README.md"]) {
    const body = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    const diagrams = [...body.matchAll(/```mermaid\n([\s\S]*?)```/g)];
    assert.ok(diagrams.length > 0, `${file} must show its lifecycle`);
    for (const [, diagram] of diagrams) {
      const labels = new Map();
      for (const [, id, label] of diagram.matchAll(/\b([A-Za-z][A-Za-z0-9_]*)\s*\["([^"\n]+)"\]/g)) {
        if (labels.has(id)) assert.equal(label, labels.get(id), `${file}: node ${id} would overwrite a different stage`);
        labels.set(id, label);
      }
      assert.ok(labels.size >= 6, `${file} must keep its distinct decision stages`);
    }
  }
});
