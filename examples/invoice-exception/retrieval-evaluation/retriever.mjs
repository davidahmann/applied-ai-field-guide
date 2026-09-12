const stopWords = new Set(["a", "an", "and", "are", "before", "can", "does", "for", "how", "in", "is", "it", "of", "or", "the", "this", "to", "what", "who"]);

export function tokenize(value) {
  if (typeof value !== "string") return [];
  return value.toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => token.length > 1 && !stopWords.has(token)) ?? [];
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export function admissibleDocuments(query, documents) {
  if (!query || typeof query !== "object" || !validDate(query.as_of)) throw new Error("query needs a valid as_of date");
  if (typeof query.tenant_id !== "string" || !query.tenant_id) throw new Error("query needs a tenant");
  if (!query.caller || !Array.isArray(query.caller.scopes)) throw new Error("query needs caller scopes");
  const scopes = new Set(query.caller.scopes);
  return documents.filter((document) =>
    document.tenant_id === query.tenant_id
    && document.status === "active"
    && document.superseded_by === null
    && document.effective_from <= query.as_of
    && (document.effective_to === null || document.effective_to >= query.as_of)
    && document.permission_valid_until >= query.as_of
    && document.required_scopes.every((scope) => scopes.has(scope))
  );
}

function scoreDocuments(question, documents, { k1 = 1.2, b = 0.75 } = {}) {
  const queryTerms = [...new Set(tokenize(question))];
  const tokenized = documents.map((document) => tokenize(`${document.title} ${document.topic} ${document.text}`));
  const averageLength = tokenized.reduce((sum, tokens) => sum + tokens.length, 0) / Math.max(tokenized.length, 1);
  return documents.map((document, index) => {
    const tokens = tokenized[index];
    const frequencies = new Map();
    for (const token of tokens) frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    let score = 0;
    for (const term of queryTerms) {
      const frequency = frequencies.get(term) ?? 0;
      if (!frequency) continue;
      const documentFrequency = tokenized.filter((candidate) => candidate.includes(term)).length;
      const inverseDocumentFrequency = Math.log(1 + (documents.length - documentFrequency + 0.5) / (documentFrequency + 0.5));
      const normalization = frequency + k1 * (1 - b + b * tokens.length / Math.max(averageLength, 1));
      score += inverseDocumentFrequency * (frequency * (k1 + 1) / normalization);
    }
    return { document, score };
  });
}

export function retrieve(query, documents, { minimumScore = 0.5 } = {}) {
  if (typeof query.question !== "string" || query.question.length < 2 || query.question.length > 240) throw new Error("question must contain 2 to 240 characters");
  if (!Number.isInteger(query.top_k) || query.top_k < 1 || query.top_k > 5) throw new Error("top_k must be between 1 and 5");
  if (!Number.isInteger(query.query_budget) || query.query_budget < 1 || query.query_budget > 3) throw new Error("query_budget must be between 1 and 3");
  const admissible = admissibleDocuments(query, documents);
  const ranked = scoreDocuments(query.question, admissible)
    .filter(({ score }) => score >= minimumScore)
    .sort((left, right) => right.score - left.score || left.document.source_id.localeCompare(right.document.source_id))
    .slice(0, query.top_k);
  const evidence = ranked.map(({ document, score }) => ({
    source_id: document.source_id,
    revision: document.revision,
    owner: document.owner,
    trust: document.trust,
    excerpt: document.text,
    score: Number(score.toFixed(6)),
    instruction_authority: false,
  }));
  return {
    case_id: query.case_id,
    disposition: evidence.length ? "evidence_found" : "insufficient_evidence",
    evidence,
    budget: { used: 1, limit: query.query_budget },
    terminal_reason: evidence.length ? "authorized_current_lexical_match" : "no_authorized_current_match",
  };
}
