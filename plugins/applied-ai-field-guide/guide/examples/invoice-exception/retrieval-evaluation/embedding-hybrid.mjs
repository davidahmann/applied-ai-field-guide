import {
  admissibleDocuments,
  assertQuery,
  evidenceFromRanked,
  scoreLexicalDocuments,
} from "./retriever.mjs";

function boundedNumber(value, label, { minimum = 0, maximum = Number.POSITIVE_INFINITY } = {}) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) throw new Error(`${label} must be a finite number from ${minimum} to ${maximum}`);
  return value;
}

function vector(value, label) {
  if (!Array.isArray(value) || !value.length || value.some((item) => !Number.isFinite(item))) throw new Error(`${label} must be a non-empty numeric vector`);
  return value;
}

function cosine(left, right) {
  if (left.length !== right.length) throw new Error("embedding vectors must have equal dimensions");
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }
  if (!leftMagnitude || !rightMagnitude) return 0;
  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
}

function normalized(values) {
  const maximum = Math.max(...values.map(({ score }) => score), 0);
  return values.map((item) => ({ ...item, normalized_score: maximum ? item.score / maximum : 0 }));
}

function documentText(document) {
  return `${document.title}\n${document.topic}\n${document.text}`;
}

function cloneMetrics(metrics) {
  return JSON.parse(JSON.stringify(metrics));
}

/**
 * Build a hybrid candidate around an injected embedding function. The function
 * receives only the query plus documents already admitted by tenant, scope and
 * time policy, and returns `{ vectors, input_tokens? }` in the same order.
 * It is intentionally not an adapter to a particular model provider.
 */
export function createEmbeddingHybridCandidate({ embed, name = "embedding-hybrid-v1", lexicalWeight = 0.45, minimumScore = 0.51, providerMetrics } = {}) {
  if (typeof embed !== "function") throw new Error("embed must be a function");
  if (providerMetrics !== undefined && typeof providerMetrics !== "function") throw new Error("providerMetrics must be a function when supplied");
  boundedNumber(lexicalWeight, "lexicalWeight", { minimum: 0, maximum: 1 });
  boundedNumber(minimumScore, "minimumScore", { minimum: 0, maximum: 1 });
  const metrics = { kind: "embedding_hybrid", request_count: 0, input_tokens: null, estimated_external_api_cost_usd: null };

  const candidate = async (query, documents) => {
    assertQuery(query);
    const admissible = admissibleDocuments(query, documents);
    const lexical = normalized(scoreLexicalDocuments(query.question, admissible));
    if (!admissible.length) {
      return {
        case_id: query.case_id,
        disposition: "insufficient_evidence",
        evidence: [],
        budget: { used: 1, limit: query.query_budget },
        terminal_reason: "no_authorized_current_match",
      };
    }

    const embedded = await embed([query.question, ...admissible.map(documentText)]);
    if (!embedded || typeof embedded !== "object" || !Array.isArray(embedded.vectors) || embedded.vectors.length !== admissible.length + 1) {
      throw new Error("embed must return one vector for the query and each admitted document");
    }
    const queryVector = vector(embedded.vectors[0], "query embedding");
    const semantic = embedded.vectors.slice(1).map((item, index) => cosine(queryVector, vector(item, `document embedding ${index}`)));
    const ranked = lexical
      .map((item, index) => ({
        document: item.document,
        score: lexicalWeight * item.normalized_score + (1 - lexicalWeight) * ((semantic[index] + 1) / 2),
      }))
      .filter(({ score }) => score >= minimumScore)
      .sort((left, right) => right.score - left.score || left.document.source_id.localeCompare(right.document.source_id))
      .slice(0, query.top_k);

    metrics.request_count += 1;
    if (embedded.input_tokens !== undefined) {
      if (!Number.isInteger(embedded.input_tokens) || embedded.input_tokens < 0) throw new Error("embed input_tokens must be a non-negative integer when supplied");
      metrics.input_tokens = (metrics.input_tokens ?? 0) + embedded.input_tokens;
    }
    return {
      case_id: query.case_id,
      disposition: ranked.length ? "evidence_found" : "insufficient_evidence",
      evidence: evidenceFromRanked(ranked),
      budget: { used: 1, limit: query.query_budget },
      terminal_reason: ranked.length ? "authorized_current_hybrid_match" : "no_authorized_current_match",
    };
  };
  Object.defineProperties(candidate, {
    candidateName: { value: name },
    candidateMetrics: { value: () => {
      const provider = providerMetrics?.();
      return {
        ...cloneMetrics(metrics),
        ...(provider ? { provider, estimated_external_api_cost_usd: provider.estimated_external_api_cost_usd } : {}),
      };
    } },
  });
  return candidate;
}

/**
 * An explicit OpenAI-compatible embeddings boundary for a reader-supplied
 * endpoint. It is never created by the default lab and has no implicit
 * environment or network access. Cost is an estimate only when the reader
 * supplies the provider's current input price.
 */
export function createOpenAICompatibleEmbedder({ endpoint, apiKey, model, inputUsdPerMillion = null, fetchImpl = globalThis.fetch, timeoutMs = 10_000 } = {}) {
  if (typeof endpoint !== "string" || !endpoint) throw new Error("embedding endpoint is required");
  const parsed = new URL(endpoint);
  if (parsed.protocol !== "https:") throw new Error("embedding endpoint must use https");
  if (typeof apiKey !== "string" || !apiKey) throw new Error("embedding API key is required");
  if (typeof model !== "string" || !model) throw new Error("embedding model is required");
  if (typeof fetchImpl !== "function") throw new Error("fetch implementation is required");
  if (inputUsdPerMillion !== null) boundedNumber(inputUsdPerMillion, "inputUsdPerMillion", { minimum: 0 });
  boundedNumber(timeoutMs, "timeoutMs", { minimum: 1, maximum: 120_000 });
  const metrics = { kind: "openai_compatible_embeddings", model, request_count: 0, input_tokens: 0, input_usd_per_million: inputUsdPerMillion, estimated_external_api_cost_usd: inputUsdPerMillion === null ? null : 0 };

  const embed = async (inputs) => {
    if (!Array.isArray(inputs) || !inputs.length || inputs.some((item) => typeof item !== "string" || !item)) throw new Error("embedding inputs must be non-empty strings");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchImpl(parsed, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, input: inputs }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!response?.ok) throw new Error(`embedding request failed with status ${response?.status ?? "unknown"}`);
    const payload = await response.json();
    const rows = payload?.data;
    if (!Array.isArray(rows) || rows.length !== inputs.length) throw new Error("embedding response has an unexpected number of vectors");
    const vectors = rows
      .slice()
      .sort((left, right) => left.index - right.index)
      .map((row, index) => vector(row?.embedding, `provider embedding ${index}`));
    const inputTokens = payload?.usage?.prompt_tokens;
    if (inputTokens !== undefined && (!Number.isInteger(inputTokens) || inputTokens < 0)) throw new Error("embedding response usage.prompt_tokens must be a non-negative integer");
    metrics.request_count += 1;
    if (inputTokens !== undefined) {
      metrics.input_tokens += inputTokens;
      if (inputUsdPerMillion !== null) metrics.estimated_external_api_cost_usd = Number(((metrics.input_tokens * inputUsdPerMillion) / 1_000_000).toFixed(8));
    }
    return { vectors, ...(inputTokens === undefined ? {} : { input_tokens: inputTokens }) };
  };
  Object.defineProperty(embed, "metrics", { value: () => cloneMetrics(metrics) });
  return embed;
}
