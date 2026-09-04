export const proposalSchema = {
  type: "object", additionalProperties: false,
  required: ["action", "invoice_id", "currency", "amount_cents", "evidence_quote", "reason"],
  properties: {
    action: { type: "string", enum: ["draft", "escalate"] },
    invoice_id: { type: ["string", "null"] }, currency: { type: ["string", "null"] },
    amount_cents: { type: ["integer", "null"] }, evidence_quote: { type: "string" }, reason: { type: "string" },
  },
};

export function baseline(text) {
  const invoice_id = text.match(/^Invoice: (INV-\d+)$/m)?.[1] ?? null;
  const currency = text.match(/^Currency: (USD)$/m)?.[1] ?? null;
  const total = text.match(/^Total: (\d+)\.(\d{2})$/m);
  const amount_cents = total ? Number(total[1]) * 100 + Number(total[2]) : null;
  const conflict = /unreconciled|not been reconciled|neither amount|credit note|OCR output/i.test(text);
  return { action: invoice_id && currency && amount_cents !== null && !conflict ? "draft" : "escalate",
    invoice_id, currency, amount_cents, evidence_quote: text, reason: "Fixed-label baseline v1; uncertain cases go to the existing manual queue." };
}

export function validateProposal(proposal, text) {
  if (!proposal || typeof proposal !== "object" || Array.isArray(proposal)) return ["proposal must be an object"];
  const errors = [];
  const keys = Object.keys(proposalSchema.properties);
  if (Object.keys(proposal).some((key) => !keys.includes(key)) || keys.some((key) => !(key in proposal))) errors.push("unknown or missing proposal fields");
  if (!["draft", "escalate"].includes(proposal.action)) errors.push("unsupported action");
  if (typeof proposal.reason !== "string" || !proposal.reason.trim() || proposal.reason.length > 2000) errors.push("reason is required and bounded");
  if (typeof proposal.evidence_quote !== "string" || !proposal.evidence_quote.trim() || !text.includes(proposal.evidence_quote)) errors.push("quote must occur verbatim in this source revision");
  if (proposal.invoice_id !== null && (typeof proposal.invoice_id !== "string" || !/^INV-\d{1,12}$/.test(proposal.invoice_id))) errors.push("invalid invoice identifier");
  if (proposal.currency !== null && proposal.currency !== "USD") errors.push("unsupported currency");
  if (proposal.amount_cents !== null && (!Number.isSafeInteger(proposal.amount_cents) || proposal.amount_cents < 0 || proposal.amount_cents > 10000000)) errors.push("invalid amount");
  if (proposal.action === "draft" && (proposal.invoice_id === null || proposal.currency === null || proposal.amount_cents === null)) errors.push("draft requires all business fields");
  return errors;
}

export function recordReview({ document, proposal, action, reviewer, rationale, sourceChecked, elapsedMs }) {
  if (!["accept_draft", "reject", "escalate"].includes(action)) throw new Error("unsupported review decision");
  if (!reviewer.trim() || !rationale.trim()) throw new Error("Name the practice reviewer and explain the decision.");
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new Error("invalid review timing");
  if (action === "accept_draft") {
    const errors = validateProposal(proposal, document.text);
    if (!sourceChecked || proposal.action !== "draft" || errors.length) throw new Error("Check the source and correct the record before accepting a draft.");
  }
  return { source_id: document.id, source_text: document.text, proposal: structuredClone(proposal), action,
    reviewer, rationale, elapsed_ms: Math.round(elapsedMs), source_checked: sourceChecked,
    effect: "local_practice_record_only", production_authorization: false };
}
