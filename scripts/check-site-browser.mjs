// Optional browser lane: build first; install Playwright and Chromium separately.
// PLAYWRIGHT_MODULE may select an already provisioned local module entry point.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const playwrightModule = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const chromium = playwrightModule.chromium ?? playwrightModule.default?.chromium;
if (!chromium) throw new Error("Playwright module does not expose Chromium");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../site-dist");
const screenshotDirectory = process.env.SITE_SCREENSHOT_DIRECTORY;
if (screenshotDirectory) await mkdir(screenshotDirectory, { recursive: true });
const base = "/applied-ai-field-guide";
const server = createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!requested.startsWith(`${base}/`)) throw new Error("outside site");
    let file = path.resolve(root, `.${requested.slice(base.length)}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error("outside site");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
    response.setHeader("Content-Type", types[path.extname(file)] || "text/plain"); response.end(await readFile(file));
  } catch { response.writeHead(404); response.end("Not found"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
    const page = await context.newPage();
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}${base}/practice/invoice-review/`);
    await page.getByRole("button", { name: /search/i }).first().click();
    await page.locator("#site-search-input").fill("invoice document");
    await page.locator(".search-result").first().waitFor();
    await page.keyboard.press("Escape"); assert.equal(await page.locator("#site-search").isVisible(), false);
    if (screenshotDirectory) await page.screenshot({ path: path.join(screenshotDirectory, `practice-${width}.png`), fullPage: true });
    await page.goto(`${origin}${base}/practice/invoice-policy-retrieval/`);
    await page.getByRole("heading", { name: "Invoice Policy Retrieval Evaluation Lab", exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `retrieval overflow at ${width}`);
    if (screenshotDirectory) await page.screenshot({ path: path.join(screenshotDirectory, `retrieval-${width}.png`), fullPage: true });
    await page.goto(`${origin}${base}/practice/invoice-durable-recovery/`);
    await page.getByRole("heading", { name: "Durable Recovery Lab: One Effect, an Interrupted Process, and Readback", exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `durable recovery overflow at ${width}`);
    if (screenshotDirectory) await page.screenshot({ path: path.join(screenshotDirectory, `durable-recovery-${width}.png`), fullPage: true });
    await page.goto(`${origin}${base}/labs/invoice-review/`);
    await page.locator("#invoice").waitFor();
    await page.locator("#reviewer").fill("Fictional reviewer"); await page.locator("#rationale").fill("Checked the final invoice against the source.");
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "Accept draft" }).isDisabled(), true);
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await page.locator("#checked").check(); await page.getByRole("button", { name: "Accept draft" }).click();
    assert.match(await page.locator("#message").textContent(), /retained/);
    assert.equal(await page.getByRole("button", { name: "Accept draft" }).isDisabled(), true);
    await page.locator("#case").selectOption("doc-c"); await page.locator("#rationale").fill("Totals conflict; ask the controller to reconcile.");
    await page.getByRole("button", { name: "Escalate", exact: true }).click();
    assert.match(await page.locator("#history").textContent(), /escalate/);
    await page.locator("#case").selectOption("doc-d"); await page.locator("#rationale").fill("Credit note is outside invoice scope.");
    await page.getByRole("button", { name: "Reject", exact: true }).click();
    await page.locator("#import").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"source_revision":"old","results":[]}') });
    await page.getByText("Wrong source revision or report shape.", { exact: true }).waitFor();
    const downloadEvent = page.waitForEvent("download"); await page.getByRole("button", { name: "Download review history" }).click();
    const download = await downloadEvent; const exported = JSON.parse(await readFile(await download.path(), "utf8"));
    assert.equal(exported.records.length, 3); assert.equal(exported.records.every((item) => !item.production_authorization), true);
    await page.reload(); assert.match(await page.locator("#history").textContent(), /Fictional reviewer/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
    if (screenshotDirectory) await page.screenshot({ path: path.join(screenshotDirectory, `review-${width}.png`), fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
  }
  const page = await browser.newPage();
  await page.route("**/search-index.json", (route) => route.abort());
  await page.goto(`${origin}${base}/`); await page.getByRole("button", { name: /search/i }).first().click();
  await page.getByText(/Search is unavailable/).waitFor(); await page.getByRole("button", { name: "Close", exact: true }).click();
  assert.equal(await page.locator("#site-search").isVisible(), false);
  console.log("Browser checks passed: desktop/mobile navigation, retrieval and durable-recovery routes, search/Escape/error recovery, review/pause/reject/escalate, import rejection, export, persistence and overflow.");
} finally { await browser.close(); await new Promise((resolve) => server.close(resolve)); }
