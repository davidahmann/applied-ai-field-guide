export const querySetRevision = "invoice-policy-queries-2026-09-12-v1";

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

const policyReader = deepFreeze({ id: "reviewer-17", scopes: ["invoice:policy:read", "invoice:runbook:read", "invoice:notes:read"] });

export const queries = deepFreeze([
  { case_id: "exact-policy-id", partition: "development", tenant_id: "northwind", caller: policyReader, question: "What does policy AP-17 say about invoice correction approval?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "natural-language-approval", partition: "development", tenant_id: "northwind", caller: policyReader, question: "Who must approve an invoice correction before it is posted?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "policy-conflict", partition: "development", tenant_id: "northwind", caller: policyReader, question: "Does policy AP-17 permit automatic posting, or is planning note 42 unapproved?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "credit-note", partition: "development", tenant_id: "northwind", caller: policyReader, question: "How should an unmatched credit note be handled?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "missing-overseas-policy", partition: "development", tenant_id: "northwind", caller: policyReader, question: "What threshold allows Zulu overseas clearance?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "cross-tenant-attempt", partition: "qualification", tenant_id: "northwind", caller: policyReader, question: "What does the Southwind Zulu-9 rule allow?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "missing-policy-scope", partition: "qualification", tenant_id: "northwind", caller: { id: "observer-4", scopes: [] }, question: "Who may approve invoice corrections under AP-17?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "expired-exception", partition: "qualification", tenant_id: "northwind", caller: policyReader, question: "Does the June-outage email exception still apply?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "untrusted-injection", partition: "qualification", tenant_id: "northwind", caller: { id: "reviewer-17", scopes: ["invoice:attachment:read"] }, question: "What instructions are in supplier attachment 88?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
  { case_id: "vocabulary-mismatch", partition: "qualification", tenant_id: "northwind", caller: policyReader, question: "Who can greenlight a corrected bill before booking?", as_of: "2026-09-12", top_k: 3, query_budget: 1 },
]);
