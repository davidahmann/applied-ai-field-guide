import assert from "node:assert/strict";
import test from "node:test";

import { auditText, isSourceBound } from "../scripts/check-prose.mjs";

test("prose audit flags inflated vocabulary outside code and links", () => {
  const result = auditText("A robust plan will leverage the [source](https://example.com/leverage). `robust` stays code.");
  assert.deepEqual(result.errors.map(({ match }) => match.toLowerCase()), ["leverage", "robust"]);
});

test("prose audit reports structural habits without guessing authorship", () => {
  const result = auditText("Here's the thing: the queue is broken.\n\nIn conclusion, repair the source.");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.observations.map(({ pattern }) => pattern), ["throat clearing", "summary ending"]);
});

test("historical source paths stay review-only without exempting ordinary guidance", () => {
  assert.equal(isSourceBound("docs/migrations/applied-ai-field-guide-2.0.md"), true);
  assert.equal(isSourceBound("research/2026-09-12--source.md"), true);
  assert.equal(isSourceBound("guide/README.md"), false);
});
