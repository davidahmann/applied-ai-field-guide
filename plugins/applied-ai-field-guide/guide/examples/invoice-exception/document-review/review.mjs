import { documents, sourceRevision } from "./sources.mjs";
import { baseline, recordReview } from "./engine.mjs";
const byId = (id) => document.getElementById(id);
const storageKey = `aafg-invoice-practice:${sourceRevision}`;
let history = [], imported = new Map(), initial, started, edits = 0, paused = false, finished = false;
try { const saved = JSON.parse(localStorage.getItem(storageKey) || "[]"); if (Array.isArray(saved) && saved.length <= 500) history = saved; }
catch { byId("message").textContent = "Prior history could not be loaded. Export new work before leaving."; }
for (const item of documents) { const option = document.createElement("option"); option.value = item.id; option.textContent = item.id; byId("case").append(option); }
function showHistory() { byId("history").textContent = JSON.stringify(history, null, 2); }
function load() {
  const source = documents.find((item) => item.id === byId("case").value);
  initial = byId("mode").value === "manual" ? { invoice_id: null, currency: null, amount_cents: null, evidence_quote: "", reason: "Manual entry" }
    : byId("mode").value === "imported" ? imported.get(source.id) : baseline(source.text);
  if (!initial) { initial = baseline(source.text); byId("mode").value = "baseline"; byId("message").textContent = "No imported proposal for this case; using the rules baseline."; }
  else byId("message").textContent = initial.action === "escalate" ? "The proposal recommends escalation. Review the source before changing that decision." : "";
  byId("source").textContent = source.text; byId("revision").textContent = sourceRevision;
  for (const [id, field] of [["invoice", "invoice_id"], ["currency", "currency"], ["amount", "amount_cents"], ["quote", "evidence_quote"]]) byId(id).value = initial[field] ?? "";
  byId("rationale").value = ""; byId("checked").checked = false; started = performance.now(); edits = 0; paused = false; finished = false; updateButtons();
}
function updateButtons() {
  for (const id of ["reject", "escalate"]) byId(id).disabled = paused || finished;
  byId("review").querySelector('[type="submit"]').disabled = paused || finished;
  byId("pause").disabled = finished; byId("pause").textContent = paused ? "Resume" : "Pause";
}
function save(action) {
  if (paused || finished) return;
  try {
    const proposal = { action: "draft", invoice_id: byId("invoice").value || null, currency: byId("currency").value || null,
      amount_cents: byId("amount").value === "" ? null : Number(byId("amount").value), evidence_quote: byId("quote").value, reason: byId("rationale").value };
    const record = recordReview({ document: documents.find((item) => item.id === byId("case").value), proposal, action,
      reviewer: byId("reviewer").value, rationale: byId("rationale").value, sourceChecked: byId("checked").checked, elapsedMs: performance.now() - started });
    if (history.length >= 500) throw new Error("Practice history is full. Export it before beginning a new browser session.");
    history.push({ ...record, source_revision: sourceRevision, initial_proposal: initial, mode: byId("mode").value, field_edit_events: edits, recorded_at: new Date().toISOString() });
    finished = true; updateButtons(); showHistory();
    try { localStorage.setItem(storageKey, JSON.stringify(history)); byId("message").textContent = "Practice decision retained in this browser. No business action occurred."; }
    catch { byId("message").textContent = "Decision is in memory only; browser storage failed. Download review history now."; }
  } catch (error) { byId("message").textContent = error.message; }
}
byId("review").addEventListener("submit", (event) => { event.preventDefault(); save("accept_draft"); });
byId("reject").addEventListener("click", () => save("reject")); byId("escalate").addEventListener("click", () => save("escalate"));
byId("pause").addEventListener("click", () => { paused = !paused; updateButtons(); byId("message").textContent = paused ? "Paused. Your fields are retained; choose Resume to continue." : "Review resumed."; });
for (const id of ["invoice", "currency", "amount", "quote"]) byId(id).addEventListener("input", () => edits++);
for (const id of ["case", "mode"]) byId(id).addEventListener("change", load);
byId("import").addEventListener("change", async () => {
  try {
    const file = byId("import").files[0]; if (!file || file.size > 131072) throw new Error("Select a report smaller than 128 KB.");
    const report = JSON.parse(await file.text());
    if (report.source_revision !== sourceRevision || !Array.isArray(report.results) || report.results.length > documents.length) throw new Error("Wrong source revision or report shape.");
    imported = new Map(report.results.filter((item) => documents.some((source) => source.id === item.case_id) && item.proposal && typeof item.proposal === "object").map((item) => [item.case_id, item.proposal]));
    byId("mode").value = "imported"; load();
  } catch (error) { byId("message").textContent = error.message; }
});
byId("export").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ source_revision: sourceRevision, records: history, authority: "unverified_local_practice" }, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = "invoice-review-practice.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
load(); showHistory();
