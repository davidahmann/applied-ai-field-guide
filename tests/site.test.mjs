import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import { pages, redirects, site } from "../site/site.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "site-dist");

function routeFile(route) {
  return path.join(outputRoot, route === "/" ? "" : route.slice(1), "index.html");
}

function matches(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

test("Escape closes search even while the search field has text", async () => {
  const handlers = new Map();
  let prevented = false;
  let closeCount = 0;
  const dialog = {
    open: true,
    close() { this.open = false; closeCount += 1; },
    addEventListener() {},
  };
  const document = {
    querySelector: (selector) => selector === "#site-search" ? dialog : null,
    addEventListener: (name, handler) => handlers.set(name, handler),
    activeElement: { matches: () => true },
  };
  const source = await readFile(path.join(root, "site/assets/site.js"), "utf8");
  vm.runInNewContext(source, { document, window: { matchMedia: () => ({ matches: false }) } });
  const event = { key: "Escape", preventDefault() { prevented = true; } };
  handlers.get("keydown")(event);
  assert.equal(prevented, true, "do not let the input consume Escape before the dialog");
  assert.equal(dialog.open, false);
  assert.equal(closeCount, 1);
  prevented = false;
  handlers.get("keydown")(event);
  assert.equal(prevented, false, "leave Escape outside search unchanged");
  assert.equal(closeCount, 1);
});

test("site configuration defines one canonical source per route", () => {
  assert.equal(new Set(pages.map(({ route }) => route)).size, pages.length);
  assert.equal(new Set(pages.map(({ source }) => source)).size, pages.length);
  assert.equal(new Set(pages.map(({ title }) => title)).size, pages.length);
  assert.equal(new Set(pages.map(({ description }) => description)).size, pages.length);
  for (const page of pages) {
    assert.match(page.route, /^\/(?:.*\/)?$/);
    assert.ok(page.description.length >= 90 && page.description.length <= 165, page.route);
  }
});

test("the five-minute guide stays concise and routes into canonical depth", async () => {
  const page = pages.find(({ source }) => source === "guide/field-guide-in-five-minutes.md");
  assert.equal(page?.route, "/five-minute-guide/");
  const source = await readFile(path.join(root, page.source), "utf8");
  const words = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[[^\]]+\]\([^\)]+\)/g, " ")
    .match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
  assert.ok(words.length >= 700 && words.length <= 1_100, `five-minute guide has ${words.length} words`);
  for (const heading of [
    "## Start with what broke",
    "## Before you design anything",
    "## Once the boundary is real",
    "## Prove the service people will actually run",
    "## Make ownership survive the project",
    "## Keep the working packet small",
    "## Where to go next",
  ]) assert.ok(source.includes(heading), heading);
  assert.equal((source.match(/```mermaid/g) ?? []).length, 1);
  for (const target of [
    "playbooks/00-field-engagement-and-reframing.md",
    "templates/workflow-charter.json",
    "templates/production-service-readiness.md",
    "operations/release-gates.md",
    "concise Applied AI Field Guide](README.md)",
  ]) assert.ok(source.includes(target), target);
  assert.match(source, /guidance—not production approval/i);
  assert.match(source, /only the original builder can change a rule or restore a failed job/);
  assert.match(source, /An internal team may keep ownership; give it capacity and backup coverage/);
  assert.match(source, /temporary FDE team should agree on exit evidence and transfer ordinary implementation or support/);
  assert.match(source, /Neither arrangement should depend on one person's laptop or permanent availability/);
  assert.match(source, /A common Monday starts like this/);
  assert.match(source, /\*\*Inherited brief:\*\*[\s\S]*\*\*Observed:\*\*[\s\S]*\*\*Safe fallback:\*\*[\s\S]*\*\*Decision needed:\*\*/);
  assert.doesNotMatch(source, /## Five rules that matter|### [1-5]\./);

  const contractions = source.match(/\b(?:don't|doesn't|isn't|can't|won't|you're|that's|it's|they're|we're|shouldn't|couldn't|wouldn't)\b/gi) ?? [];
  assert.ok(contractions.length >= 8, `five-minute guide has ${contractions.length} contractions`);
  const proseParagraphs = source
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !/^(?:#|\||>|-|```)/.test(paragraph));
  const sentenceCounts = proseParagraphs.map((paragraph) => (paragraph.match(/[.!?](?:\s|$)/g) ?? []).length);
  assert.ok(new Set(sentenceCounts).size >= 3, "five-minute guide should vary paragraph rhythm");
});

test("the public entry layer routes five common field situations before repository taxonomy", async () => {
  const [overview, shortGuide] = await Promise.all([
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "guide/field-guide-in-five-minutes.md"), "utf8"),
  ]);

  assert.ok(overview.indexOf("## Start with what went wrong") < overview.indexOf("## Choose your depth"));
  for (const situation of [
    "The brief doesn't match the real workflow",
    "Nobody can identify the real process owner or expert",
    "The sponsor, operator, and policy disagree",
    "The team needs to prove one safe slice",
    "Something was built, but acceptance or ownership is stuck",
  ]) assert.ok(overview.includes(situation), situation);

  for (const route of [
    "playbooks/00-field-engagement-and-reframing.md",
    "templates/field-observation-log.md",
    "templates/engagement-reframe.json",
    "playbooks/02-solution-and-delivery.md#5-build-a-vertical-slice",
    "templates/customer-enablement-handoff.md",
  ]) {
    assert.ok(overview.includes(route), route);
    assert.ok(shortGuide.includes(`../${route}`), route);
  }
});

test("the capability roadmap is a bounded secondary entry layer", async () => {
  const page = pages.find(({ source }) => source === "guide/capability-roadmap.md");
  assert.equal(page?.route, "/applied-ai-capability-roadmap/");
  const source = await readFile(path.join(root, page.source), "utf8");
  for (const heading of [
    "## Choose the responsibility, not the title",
    "## The capability map",
    "## Five practice missions",
    "## The quick-start engagement pack",
    "## Concise glossary",
  ]) {
    assert.ok(source.includes(heading), heading);
  }
  assert.match(source, /not a certification, hiring standard, fixed curriculum/);
  assert.match(source, /does not substitute for production experience, user acceptance, or target-system approval/);
  assert.match(source, /## Optional technical companion/);
  assert.match(source, /AI Engineering from Scratch/);
  assert.match(source, /does not make retrieval, RAG, a model call, or an agent mandatory/i);
  assert.match(source, /Course artifacts and quiz results show practice, not production readiness/i);
});

test("the public guides require direct technical evidence without turning maturity into a gate", async () => {
  const [shortGuide, conciseGuide] = await Promise.all([
    readFile(path.join(root, "guide", "field-guide-in-five-minutes.md"), "utf8"),
    readFile(path.join(root, "guide", "README.md"), "utf8"),
  ]);
  for (const source of [shortGuide, conciseGuide]) {
    assert.match(source, /code or configuration/i);
    assert.match(source, /maturity score/i);
    assert.match(source, /(?:can't|don't) prove (?:technical )?readiness/i);
  }
  assert.match(conciseGuide, /policy-required, segment-specific, role-specific, system-constrained, or accidental dysfunction/i);
  assert.match(conciseGuide, /first unresolved hard gate/i);
});

test("the AI value scorecard is a portable assessment rather than a second framework", async () => {
  const page = pages.find(({ source }) => source === "guide/ai-value-engineering-scorecard.md");
  assert.equal(page?.route, "/ai-value-engineering-scorecard/");
  const source = await readFile(path.join(root, page.source), "utf8");
  assert.match(source, /12 factors\. 4 hard gates\. One outcome: accepted value\./);
  assert.match(source, /not a separate framework/i);
  assert.match(source, /Do not convert the twelve scores into a certification or universal pass mark/i);
  for (const target of [
    "../output/pdf/ai-value-engineering-scorecard.pdf",
    "../assets/ai-value-engineering-scorecard.svg",
    "../assets/ai-value-engineering-scorecard.png",
    "../templates/ai-value-engineering-scorecard.json",
  ]) assert.ok(source.includes(target), target);
});

test("the executive route and worked engagement distinguish funding evidence from production proof", async () => {
  const page = pages.find(({ source }) => source === "guide/funding-ai-for-accepted-outcomes.md");
  const workedPage = pages.find(({ source }) => source === "examples/invoice-exception/engagement/README.md");
  assert.equal(page?.route, "/funding-ai-for-accepted-outcomes/");
  assert.equal(workedPage?.route, "/worked-engagement/invoice-exception/");
  const [source, engagement, review] = await Promise.all([
    readFile(path.join(root, page.source), "utf8"),
    readFile(path.join(root, "examples/invoice-exception/engagement/README.md"), "utf8"),
    readFile(path.join(root, "examples/invoice-exception/engagement/service-review.md"), "utf8"),
  ]);
  for (const phrase of ["fund discovery—not deployment", "four gates", "review-only shadow candidate", "do not deploy"]) {
    assert.ok(`${source}\n${engagement}\n${review}`.toLowerCase().includes(phrase.toLowerCase()), phrase);
  }
  assert.match(source, /12 Factors of AI Value Engineering/);
  assert.match(source, /invoice-exception engagement/);
});

test("public lifecycle views preserve one canonical sequence and label compressed alternatives", async () => {
  const [overview, guide, shortGuide, capability] = await Promise.all([
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "guide/README.md"), "utf8"),
    readFile(path.join(root, "guide/field-guide-in-five-minutes.md"), "utf8"),
    readFile(path.join(root, "guide/capability-roadmap.md"), "utf8"),
  ]);
  for (const body of [overview, guide]) {
    for (const stage of ["Inherit the brief", "Observe and reconcile the work", "Charter value and scope", "Make data fit for the decision", "Select the mechanism", "Build one controlled slice", "Prove it with cases and users", "Launch with operating ownership", "Operate, learn, or retire"]) {
      assert.ok(body.includes(stage), stage);
    }
  }
  assert.match(shortGuide, /compressed field path/);
  assert.match(capability, /not a second lifecycle/);
});

test("the two public front doors remain compact while the complete guide keeps a human register", async () => {
  const [overview, guide, maintenance] = await Promise.all([
    readFile(path.join(root, "README.md"), "utf8"),
    readFile(path.join(root, "guide/README.md"), "utf8"),
    readFile(path.join(root, "docs/maintainers/repository-maintenance.md"), "utf8"),
  ]);
  assert.ok(overview.split(/\s+/).length <= 1100, "README should remain a thin public router");
  assert.ok(guide.split(/\s+/).length <= 2600, "concise Guide should remain readable in one sitting");
  for (const phrase of ["Monday morning", "the hard conversation can be plain", "Net value is only $320", "Documents can't replace those exercises"]) {
    assert.ok(guide.toLowerCase().includes(phrase.toLowerCase()), phrase);
  }
  assert.match(maintenance, /consolidation ceiling/);
  assert.match(maintenance, /growth without a compensating merge or removal/i);
});

test("computer-use guidance is a first-class security route", async () => {
  const page = pages.find(({ source }) => source === "blueprints/computer-use-action-boundary.md");
  assert.equal(page?.route, "/computer-use-agent-security/");
  const source = await readFile(path.join(root, page.source), "utf8");
  for (const requirement of [
    "Prefer a typed API or target-owned adapter",
    "The page, accessibility tree, OCR, screenshot, DOM",
    "independent source-of-truth readback",
    "## Interface-drift behavior",
    "## Evaluation matrix",
  ]) {
    assert.ok(source.includes(requirement), requirement);
  }
});

test("every canonical page has accessible structure and complete metadata", async () => {
  const canonicals = [];
  for (const page of pages) {
    const html = await readFile(routeFile(page.route), "utf8");
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<a class="skip-link" href="#main-content">/);
    assert.match(html, /<main class="article" id="main-content">/);
    assert.match(html, /<nav class="side-nav" aria-label="Guide navigation">/);
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /<meta name="description" content="[^\"]{90,165}">/);
    assert.match(html, /<meta name="robots" content="index,follow/);
    assert.doesNotMatch(html, /<meta name="keywords"/i);
    assert.equal(matches(html, /<h1(?:\s[^>]*)?>(.*?)<\/h1>/gs).length, 1, page.route);
    assert.equal(matches(html, /<link rel="canonical" href="([^"]+)">/g).length, 1, page.route);
    assert.match(html, /<a href="[^"]+">View source<\/a>/);
    assert.match(html, /The repository remains the source of truth\./);
    assert.match(html, /Updated <time datetime="\d{4}-\d{2}-\d{2}">/);
    assert.match(html, /<dialog class="search-dialog"/);
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /<meta property="og:image:width" content="1280">/);
    assert.match(html, /<meta property="og:image:height" content="640">/);
    assert.match(html, /<meta property="og:image:alt" content="The Applied AI Field Guide:/);
    assert.match(html, /class="brand-mark" aria-hidden="true">AI<\/span>/);
    assert.doesNotMatch(html, /class="brand-mark"[^>]*>FDE/);
    const canonical = matches(html, /<link rel="canonical" href="([^"]+)">/g)[0];
    assert.equal(canonical, `${site.url}${page.route}`);
    canonicals.push(canonical);
    const structuredData = matches(html, /<script type="application\/ld\+json">(.*?)<\/script>/gs);
    assert.equal(structuredData.length, 2, page.route);
    for (const document of structuredData) assert.doesNotThrow(() => JSON.parse(document));
  }
  assert.equal(new Set(canonicals).size, pages.length);
});

test("renamed pages have contained, non-indexed aliases to the canonical content", async () => {
  const canonicalRoutes = new Set(pages.map(({ route }) => route));
  const sitemap = await readFile(path.join(outputRoot, "sitemap.xml"), "utf8");
  const search = JSON.parse(await readFile(path.join(outputRoot, "assets/search-index.json"), "utf8"));
  const seen = new Set();
  for (const { from, to } of redirects) {
    assert.match(from, /^\/(?:[a-z0-9-]+\/)+$/);
    assert.ok(canonicalRoutes.has(to), to);
    assert.ok(!canonicalRoutes.has(from) && !seen.has(from), from);
    seen.add(from);
    const html = await readFile(routeFile(from), "utf8");
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.ok(html.includes(`<link rel="canonical" href="${site.url}${to}">`), to);
    const target = path.posix.relative(from.slice(1), to.slice(1)) + "/";
    assert.ok(html.includes(`<meta http-equiv="refresh" content="0;url=${target}">`), from);
    assert.ok(html.includes(`location.replace(${JSON.stringify(target)} + location.hash)`), "preserve old bookmark fragments");
    assert.ok(html.includes(`<a href="${target}">Continue to `), "no-script fallback");
    assert.doesNotMatch(html, /location\.search|document\.referrer/, "untrusted input must not choose the redirect target");
    assert.ok(!sitemap.includes(`${site.url}${from}`), "aliases must not enter the sitemap");
    assert.ok(!search.some(({ route }) => route === from), "aliases must not create duplicate search results");
    await access(routeFile(to));
  }
  assert.equal(seen.size, 3);
});

test("renamed section headings preserve existing bookmark anchors", async () => {
  for (const page of pages.filter((entry) => entry.legacyAnchors)) {
    const html = await readFile(routeFile(page.route), "utf8");
    for (const [alias, target] of Object.entries(page.legacyAnchors)) {
      assert.match(alias, /^[a-z0-9-]+$/);
      assert.equal(matches(html, new RegExp(`id="(${alias})"`, "g")).length, 1, alias);
      assert.ok(html.includes(`id="${target}"`), target);
      assert.ok(html.includes(`<span id="${alias}" aria-hidden="true"></span><h2 id="${target}"`), "old anchors must land at the corresponding section");
    }
  }
});

test("generated internal links, assets, and anchors resolve", async () => {
  for (const page of pages) {
    const file = routeFile(page.route);
    const html = await readFile(file, "utf8");
    const attributes = matches(html, /(?:href|src)="([^"]+)"/g);
    for (const value of attributes) {
      if (!value || value.startsWith("#") || /^(?:https?:|mailto:|data:|\/\/)/.test(value)) continue;
      const match = value.match(/^([^?#]*)(?:\?[^#]*)?(#.*)?$/);
      const targetPath = match?.[1] || "";
      const fragment = match?.[2]?.slice(1) || "";
      const target = path.resolve(path.dirname(file), decodeURIComponent(targetPath));
      assert.ok(target === outputRoot || target.startsWith(`${outputRoot}${path.sep}`), `${page.route}: ${value}`);
      let resolved = target;
      const targetStat = await stat(target);
      if (targetStat.isDirectory()) resolved = path.join(target, "index.html");
      await access(resolved);
      if (fragment && resolved.endsWith(".html")) {
        const targetHtml = await readFile(resolved, "utf8");
        const decodedFragment = decodeURIComponent(fragment);
        assert.match(targetHtml, new RegExp(`id=["']${decodedFragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`), `${value} from ${page.route}`);
      }
    }
  }
});

test("sitemap, crawler policy, and machine index cover the public guide", async () => {
  const [sitemap, robots, llms] = await Promise.all([
    readFile(path.join(outputRoot, "sitemap.xml"), "utf8"),
    readFile(path.join(outputRoot, "robots.txt"), "utf8"),
    readFile(path.join(outputRoot, "llms.txt"), "utf8"),
  ]);
  const sitemapUrls = matches(sitemap, /<loc>(.*?)<\/loc>/g);
  for (const page of pages) {
    const canonical = `${site.url}${page.route}`;
    assert.equal(sitemapUrls.filter((url) => url === canonical).length, 1, canonical);
    assert.ok(llms.includes(canonical), canonical);
  }
  assert.match(robots, /User-agent: \*/);
  for (const crawler of ["OAI-SearchBot", "Claude-SearchBot", "Claude-User", "Google-Extended"]) {
    assert.ok(robots.includes(`User-agent: ${crawler}\nAllow: /`), crawler);
  }
  assert.ok(robots.includes(`Sitemap: ${site.url}/sitemap.xml`));
});

test("site output is self-contained and free of retired or local references", async () => {
  for (const required of [
    "assets/site.css",
    "assets/site.js",
    "assets/search-index.json",
    "assets/applied-ai-field-guide-banner.svg",
    "assets/applied-ai-field-guide-social.svg",
    "assets/applied-ai-field-guide-social.png",
    "assets/ai-value-engineering-scorecard.svg",
    "assets/ai-value-engineering-scorecard.png",
    "downloads/ai-value-engineering-scorecard.pdf",
    "assets/favicon.svg",
    "assets/mermaid.min.js",
    "404.html",
    ".nojekyll",
  ]) {
    await access(path.join(outputRoot, required));
  }
  const files = await Promise.all(pages.map(({ route }) => readFile(routeFile(route), "utf8")));
  const combined = files.join("\n");
  const placeholderPattern = new RegExp(
    `\\b(?:${[["FIX", "ME"], ["TB", "D"], ["TO", "DO"], ["X", "XX"]].map((parts) => parts.join("")).join("|")}|lorem ipsum)\\b`,
    "i",
  );
  assert.doesNotMatch(combined, /production-agent-engineering/);
  assert.doesNotMatch(combined, /\/Users\/|file:\/\//);
  assert.doesNotMatch(combined, placeholderPattern);
  assert.doesNotMatch(combined, /SEO|keyword stuffing|GEO|AEO/i);
});

test("the social preview keeps an editable source and a GitHub-compatible deterministic export", async () => {
  const [source, raster, maintenance] = await Promise.all([
    readFile(path.join(root, "assets", "applied-ai-field-guide-social.svg"), "utf8"),
    readFile(path.join(root, "assets", "applied-ai-field-guide-social.png")),
    readFile(path.join(root, "docs", "maintainers", "repository-maintenance.md"), "utf8"),
  ]);

  assert.match(source, /width="1280" height="640" viewBox="0 0 1280 640"/);
  for (const phrase of [
    "FREE &amp; OPEN SOURCE",
    "The Applied AI",
    "Field Guide.",
    "Understand the work",
    "Choose the mechanism",
    "Prove the outcome",
    "Operate the system",
    "github.com/davidahmann/applied-ai-field-guide",
  ]) assert.ok(source.includes(phrase), phrase);
  assert.doesNotMatch(source, /(?:href|src)=["']https?:\/\/|@import|<image\b/i);
  assert.doesNotMatch(source, /FDE FIELD GUIDE|The work before|the architecture\./);

  assert.deepEqual([...raster.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(raster.readUInt32BE(16), 1280);
  assert.equal(raster.readUInt32BE(20), 640);
  assert.ok(raster.byteLength < 1_000_000, `social preview is ${raster.byteLength} bytes`);
  assert.match(maintenance, /Settings → Social preview → Edit/);
  assert.match(maintenance, /committed asset alone does not change GitHub's repository social-preview setting/i);
});
