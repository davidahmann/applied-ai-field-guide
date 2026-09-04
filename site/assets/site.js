const dialog = document.querySelector("#site-search");
const openButton = document.querySelector("[data-search-open]");
const closeButton = document.querySelector("[data-search-close]");
const input = document.querySelector("#site-search-input");
const results = document.querySelector("#site-search-results");
const guideNavigation = document.querySelector(".side-nav details");

let searchIndex;
let searchSequence = 0;

if (window.matchMedia("(max-width: 780px)").matches) {
  guideNavigation?.removeAttribute("open");
}

function normalize(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function loadIndex() {
  if (!searchIndex) {
    const response = await fetch(document.body.dataset.searchIndex);
    if (!response.ok) throw new Error(`Search index failed: ${response.status}`);
    searchIndex = await response.json();
  }
  return searchIndex;
}

function createResult(item) {
  const entry = document.createElement("li");
  entry.className = "search-result";
  const link = document.createElement("a");
  link.href = `${document.body.dataset.siteBase || ""}${item.route}`;
  const title = document.createElement("span");
  title.className = "search-result-title";
  title.textContent = item.title;
  const description = document.createElement("span");
  description.className = "search-result-description";
  description.textContent = item.description;
  link.append(title, description);
  entry.append(link);
  return entry;
}

async function search(query) {
  const sequence = ++searchSequence;
  const terms = normalize(query).split(" ").filter(Boolean);
  let index;
  try { index = await loadIndex(); }
  catch {
    if (sequence !== searchSequence) return;
    results.replaceChildren();
    const failure = document.createElement("li"); failure.className = "search-empty";
    failure.textContent = "Search is unavailable. Close this window and use the guide navigation, or try again.";
    results.append(failure); return;
  }
  if (sequence !== searchSequence) return;
  const ranked = index
    .map((item) => {
      const title = normalize(item.title);
      const description = normalize(item.description);
      const text = normalize(item.text);
      const matched = terms.every((term) =>
        title.includes(term) || description.includes(term) || text.includes(term),
      );
      const score = terms.reduce(
        (total, term) =>
          total + (title.includes(term) ? 8 : 0) + (description.includes(term) ? 3 : 0) + (text.includes(term) ? 1 : 0),
        0,
      );
      return { item, matched, score };
    })
    .filter(({ matched }) => matched)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  results.replaceChildren();
  if (!terms.length) {
    const empty = document.createElement("li");
    empty.className = "search-empty";
    empty.textContent = "Search the guide, architecture, controls, and examples.";
    results.append(empty);
    return;
  }
  if (!ranked.length) {
    const empty = document.createElement("li");
    empty.className = "search-empty";
    empty.textContent = "No matching guide page. Try a broader term.";
    results.append(empty);
    return;
  }
  results.append(...ranked.map(({ item }) => createResult(item)));
}

async function openSearch() {
  if (!dialog) return;
  dialog.showModal();
  input.focus();
  await search(input.value);
}

openButton?.addEventListener("click", () => void openSearch());
closeButton?.addEventListener("click", () => dialog.close());
input?.addEventListener("input", () => void search(input.value));
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog?.open) {
    event.preventDefault();
    dialog.close();
    return;
  }
  if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const element = document.activeElement;
    if (element?.matches("input, textarea, select, [contenteditable='true']")) return;
    event.preventDefault();
    void openSearch();
  }
});

if (document.querySelector(".mermaid") && window.mermaid) {
  window.mermaid.initialize({
    startOnLoad: true,
    securityLevel: "strict",
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "neutral",
  });
}
