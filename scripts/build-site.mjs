import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

import { navigation, pages, redirects, site as configuredSite } from "../site/site.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "site-dist");
const site = {
  ...configuredSite,
  url: (process.env.SITE_URL || configuredSite.url).replace(/\/$/, ""),
};
const siteBase = new URL(site.url).pathname.replace(/\/$/, "");
const pageBySource = new Map(pages.map((page) => [page.source, page]));
const pageByRoute = new Map(pages.map((page) => [page.route, page]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, "-")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function routeDirectory(route) {
  return route === "/" ? "" : route.replace(/^\//, "").replace(/\/$/, "");
}

function routeOutputPath(route) {
  return path.join(outputRoot, routeDirectory(route), "index.html");
}

function relativeRoute(fromRoute, toRoute) {
  const from = routeDirectory(fromRoute);
  const to = routeDirectory(toRoute);
  let relative = path.posix.relative(from || ".", to || ".");
  if (!relative) relative = ".";
  return `${relative}/`;
}

function relativeAsset(route, asset) {
  const from = routeDirectory(route);
  return path.posix.relative(from || ".", asset);
}

function canonicalUrl(route) {
  return `${site.url}${route === "/" ? "/" : route}`;
}

function repositoryUrl(source, mode = "blob") {
  return `${site.repository}/${mode}/main/${source.split("/").map(encodeURIComponent).join("/")}`;
}

function splitTarget(target) {
  const match = target.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  return {
    pathname: match?.[1] || "",
    query: match?.[2] || "",
    hash: match?.[3] || "",
  };
}

async function rewriteLocalTarget(target, currentPage, { image = false } = {}) {
  if (!target || target.startsWith("#") || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) {
    return target;
  }
  const parts = splitTarget(target);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(currentPage.source), parts.pathname));
  if (resolved.startsWith("../") || path.posix.isAbsolute(resolved)) return target;

  if (resolved === "examples/invoice-exception/document-review/index.html") return relativeAsset(currentPage.route, "labs/invoice-review/index.html");
  if (/^templates\/[^/]+\.json$/.test(resolved)) return relativeAsset(currentPage.route, `downloads/${resolved}`);

  const mapped = pageBySource.get(resolved) || pageBySource.get(path.posix.join(resolved, "README.md"));
  if (mapped) return `${relativeRoute(currentPage.route, mapped.route)}${parts.query}${parts.hash}`;

  const publicAssets = new Set([
    "assets/applied-ai-field-guide-banner.svg",
    "assets/applied-ai-field-guide-social.svg",
    "assets/ai-value-engineering-scorecard.svg",
    "assets/ai-value-engineering-scorecard.png",
  ]);
  if (publicAssets.has(resolved)) {
    return `${relativeAsset(currentPage.route, resolved)}${parts.query}${parts.hash}`;
  }
  if (resolved === "output/pdf/ai-value-engineering-scorecard.pdf") {
    return `${relativeAsset(currentPage.route, "downloads/ai-value-engineering-scorecard.pdf")}${parts.query}${parts.hash}`;
  }

  try {
    const file = await stat(path.join(root, resolved));
    return `${repositoryUrl(resolved, file.isDirectory() ? "tree" : "blob")}${parts.query}${parts.hash}`;
  } catch {
    return target;
  }
}

function plainTextFromTokens(tokens) {
  return tokens
    .filter((token) => token.type === "inline" || token.type === "fence" || token.type === "code_block")
    .map((token) => token.content)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function lastModified(source) {
  try {
    const modified = execFileSync("git", ["log", "-1", "--format=%cs", "--", source], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    return modified || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function renderNavigation(currentPage) {
  return navigation
    .map((group) => {
      const links = group.routes
        .map((route) => {
          const page = pageByRoute.get(route);
          if (!page) throw new Error(`Navigation route is not configured: ${route}`);
          const current = route === currentPage.route ? ' aria-current="page"' : "";
          return `<li><a href="${escapeHtml(relativeRoute(currentPage.route, route))}"${current}>${escapeHtml(page.navTitle)}</a></li>`;
        })
        .join("");
      return `<section class="nav-group"><p class="nav-label">${escapeHtml(group.label)}</p><ul class="nav-list">${links}</ul></section>`;
    })
    .join("");
}

function renderToc(headings) {
  if (!headings.length) return "";
  return `<aside class="page-toc" aria-label="On this page"><p class="toc-label">On this page</p><ul class="toc-list">${headings
    .map(({ id, text }) => `<li><a href="#${escapeHtml(id)}">${escapeHtml(text)}</a></li>`)
    .join("")}</ul></aside>`;
}

function renderJsonLd(page, heading, updated) {
  const common = {
    "@context": "https://schema.org",
    "@type": page.type || "TechArticle",
    name: page.title,
    headline: heading,
    description: page.description,
    url: canonicalUrl(page.route),
    dateModified: updated,
    inLanguage: "en",
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    author: { "@type": "Person", name: site.author.name, url: site.author.url },
    isPartOf: { "@type": "WebSite", name: site.name, url: `${site.url}/` },
  };
  if (common["@type"] === "SoftwareSourceCode") common.codeRepository = site.repository;
  else common.mainEntityOfPage = canonicalUrl(page.route);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: site.name,
        item: `${site.url}/`,
      },
      ...(page.route === "/"
        ? []
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: page.navTitle,
              item: canonicalUrl(page.route),
            },
          ]),
    ],
  };
  return [common, breadcrumb]
    .map((value) => `<script type="application/ld+json">${JSON.stringify(value).replaceAll("<", "\\u003c")}</script>`)
    .join("\n");
}

function createMarkdown(page) {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: false });
  md.use(markdownItAnchor, { slugify, permalink: false });
  const defaultHeadingOpen = md.renderer.rules.heading_open || ((tokens, index, options, environment, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.heading_open = (tokens, index, options, environment, self) => {
    const id = tokens[index].attrGet("id");
    const aliases = Object.entries(page.legacyAnchors || {})
      .filter(([, target]) => target === id)
      .map(([alias]) => `<span id="${escapeHtml(alias)}" aria-hidden="true"></span>`)
      .join("");
    return aliases + defaultHeadingOpen(tokens, index, options, environment, self);
  };

  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, index, options, environment, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.link_open = (tokens, index, options, environment, self) => {
    const href = tokens[index].attrGet("href");
    const rewritten = environment.links.get(href) || href;
    tokens[index].attrSet("href", rewritten);
    if (/^https?:\/\//.test(rewritten)) {
      tokens[index].attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, index, options, environment, self);
  };

  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, environment, self) => {
    const src = tokens[index].attrGet("src");
    tokens[index].attrSet("src", environment.images.get(src) || src);
    tokens[index].attrSet("loading", index === 0 ? "eager" : "lazy");
    tokens[index].attrSet("decoding", "async");
    return defaultImage(tokens, index, options, environment, self);
  };

  const defaultTableOpen = md.renderer.rules.table_open || ((tokens, index, options, environment, self) => self.renderToken(tokens, index, options));
  const defaultTableClose = md.renderer.rules.table_close || ((tokens, index, options, environment, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.table_open = (...args) => `<div class="table-wrap" role="region" aria-label="Scrollable table" tabindex="0">${defaultTableOpen(...args)}`;
  md.renderer.rules.table_close = (...args) => `${defaultTableClose(...args)}</div>`;
  md.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
    if (token.info.trim() === "mermaid") {
      return `<pre class="mermaid">${escapeHtml(token.content)}</pre>`;
    }
    return `<pre><code class="language-${escapeHtml(token.info.trim())}">${escapeHtml(token.content)}</code></pre>`;
  };
  return md;
}

async function renderPage(page) {
  const source = await readFile(path.join(root, page.source), "utf8");
  const md = createMarkdown(page);
  const tokens = md.parse(source, {});
  const links = new Map();
  const images = new Map();
  for (const token of tokens) {
    if (token.type !== "inline") continue;
    for (const child of token.children || []) {
      if (child.type === "link_open") {
        const target = child.attrGet("href");
        links.set(target, await rewriteLocalTarget(target, page));
      } else if (child.type === "image") {
        const target = child.attrGet("src");
        images.set(target, await rewriteLocalTarget(target, page, { image: true }));
      }
    }
  }

  const headingIndex = tokens.findIndex((token) => token.type === "heading_open" && token.tag === "h1");
  if (headingIndex === -1 || tokens[headingIndex + 1]?.type !== "inline") {
    throw new Error(`${page.source} must contain one level-one heading`);
  }
  const heading = tokens[headingIndex + 1].content;
  const sourceIds = new Set(tokens.filter((token) => token.type === "heading_open").map((token) => token.attrGet("id")));
  for (const [alias, target] of Object.entries(page.legacyAnchors || {})) {
    if (!/^[a-z0-9-]+$/.test(alias) || sourceIds.has(alias) || !sourceIds.has(target)) {
      throw new Error(`Legacy anchor must be unique and point to an existing heading: ${page.route}#${alias} -> ${target}`);
    }
  }
  const bodyTokens = [...tokens];
  bodyTokens.splice(headingIndex, 3);
  const headings = [];
  for (let index = 0; index < bodyTokens.length; index += 1) {
    const token = bodyTokens[index];
    if (token.type === "heading_open" && (token.tag === "h2" || token.tag === "h3")) {
      headings.push({ id: token.attrGet("id"), text: bodyTokens[index + 1]?.content || "Section" });
    }
  }
  const body = md.renderer.render(bodyTokens, md.options, { links, images });
  const searchableText = plainTextFromTokens(tokens).slice(0, 24000);
  const wordCount = searchableText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 225));
  const updated = lastModified(page.source);
  const hasMermaid = tokens.some((token) => token.type === "fence" && token.info.trim() === "mermaid");
  const stylesheet = relativeAsset(page.route, "assets/site.css");
  const script = relativeAsset(page.route, "assets/site.js");
  const searchIndex = relativeAsset(page.route, "assets/search-index.json");
  const home = relativeRoute(page.route, "/");
  const sourceUrl = repositoryUrl(page.source);
  const releaseUrl = `${site.repository}/releases/latest`;
  const pageUrl = canonicalUrl(page.route);
  const imageUrl = `${site.url}/assets/applied-ai-field-guide-social.png`;
  const mermaidScript = hasMermaid
    ? `<script src="${escapeHtml(relativeAsset(page.route, "assets/mermaid.min.js"))}" defer></script>`
    : "";
  const nav = renderNavigation(page);
  const toc = renderToc(headings.filter(({ text }) => text.length <= 90).slice(0, 18));

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="${escapeHtml(site.author.name)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${escapeHtml(pageUrl)}">
  <link rel="license" href="https://www.apache.org/licenses/LICENSE-2.0">
  <link rel="icon" href="${escapeHtml(relativeAsset(page.route, "assets/favicon.svg"))}" type="image/svg+xml">
  <link rel="stylesheet" href="${escapeHtml(stylesheet)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${escapeHtml(site.name)}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="640">
  <meta property="og:image:alt" content="The Applied AI Field Guide: understand the work, choose the mechanism, prove the outcome, operate the system.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <meta name="twitter:image:alt" content="The Applied AI Field Guide: understand the work, choose the mechanism, prove the outcome, operate the system.">
  ${renderJsonLd(page, heading, updated)}
</head>
<body data-search-index="${escapeHtml(searchIndex)}" data-site-base="${escapeHtml(siteBase)}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${escapeHtml(home)}" aria-label="The Applied AI Field Guide home"><span class="brand-mark" aria-hidden="true">AI</span><span>${escapeHtml(site.shortName)}</span></a>
      <nav class="header-actions" aria-label="Utility navigation">
        <button class="header-action" type="button" data-search-open>Search <span class="search-shortcut" aria-hidden="true">/</span></button>
        <a class="header-action header-action-source" href="${escapeHtml(site.repository)}">GitHub</a>
      </nav>
    </div>
  </header>
  <div class="page-shell">
    <nav class="side-nav" aria-label="Guide navigation">
      <details open>
        <summary>Browse the guide</summary>
        <div class="side-nav-inner">${nav}</div>
      </details>
    </nav>
    <main class="article" id="main-content">
      <article>
        <header class="article-header">
          <p class="eyebrow">${escapeHtml(page.navTitle)}</p>
          <h1 id="${escapeHtml(slugify(heading))}">${escapeHtml(heading)}</h1>
          <p class="article-description">${escapeHtml(page.description)}</p>
          <div class="article-meta"><span>By <a href="${escapeHtml(site.author.url)}">${escapeHtml(site.author.name)}</a></span><span>Updated <time datetime="${escapeHtml(updated)}">${escapeHtml(updated)}</time></span><span>${minutes} min read</span></div>
        </header>
        <div class="article-content">${body}</div>
        <aside class="source-note"><span>This page is generated from <code>${escapeHtml(page.source)}</code>. The repository remains the source of truth.</span><a href="${escapeHtml(sourceUrl)}">View source</a> · <a download href="${escapeHtml(relativeAsset(page.route, `downloads/${page.source}`))}">Download Markdown</a></aside>
      </article>
    </main>
    ${toc}
  </div>
  <footer class="site-footer"><div class="footer-inner"><span>Independent open-source work by ${escapeHtml(site.author.name)}. Apache-2.0.</span><span><a href="${escapeHtml(releaseUrl)}">Latest release</a> · <a href="${escapeHtml(`${site.repository}/issues`)}">Issues</a> · <a href="${escapeHtml(`${site.repository}/discussions`)}">Discussions</a></span></div></footer>
  <dialog class="search-dialog" id="site-search" aria-labelledby="site-search-label">
    <div class="search-form"><label id="site-search-label"><span class="visually-hidden">Search The Applied AI Field Guide</span><input class="search-input" id="site-search-input" type="search" placeholder="Search value, architecture, evaluation…" autocomplete="off"></label><button class="search-close" type="button" data-search-close>Close</button></div>
    <ul class="search-results" id="site-search-results" aria-live="polite"></ul>
  </dialog>
  ${mermaidScript}
  <script src="${escapeHtml(script)}" defer></script>
</body>
</html>`;

  await mkdir(path.dirname(routeOutputPath(page.route)), { recursive: true });
  await writeFile(routeOutputPath(page.route), html);
  return { ...page, heading, updated, searchableText };
}

function renderNotFound() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found · ${escapeHtml(site.name)}</title><link rel="stylesheet" href="${escapeHtml(siteBase)}/assets/site.css"><link rel="icon" href="${escapeHtml(siteBase)}/assets/favicon.svg" type="image/svg+xml"></head><body><main class="article" style="max-width:48rem;margin:auto;padding-inline:1rem"><p class="eyebrow">404</p><h1>Page not found</h1><p>The page may have moved. Start with the guide or inspect the repository.</p><p><a href="${escapeHtml(siteBase)}/">Read The Applied AI Field Guide</a> · <a href="${escapeHtml(site.repository)}">Open GitHub</a></p></main></body></html>`;
}

async function renderRedirect({ from, to }) {
  const target = relativeRoute(from, to);
  const page = pageByRoute.get(to);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow"><title>Page moved · ${escapeHtml(site.name)}</title>
<link rel="canonical" href="${escapeHtml(canonicalUrl(to))}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
<link rel="stylesheet" href="${escapeHtml(relativeAsset(from, "assets/site.css"))}">
<script>location.replace(${JSON.stringify(target)} + location.hash);</script>
</head><body><main class="article" style="max-width:48rem;margin:auto;padding-inline:1rem"><h1>This page has moved</h1><p><a href="${escapeHtml(target)}">Continue to ${escapeHtml(page.navTitle)}</a>.</p></main></body></html>`;
  await mkdir(path.dirname(routeOutputPath(from)), { recursive: true });
  await writeFile(routeOutputPath(from), html);
}

async function build() {
  if (new Set(pages.map(({ route }) => route)).size !== pages.length) throw new Error("Site routes must be unique");
  if (new Set(pages.map(({ source }) => source)).size !== pages.length) throw new Error("Each source may have only one canonical site route");
  if (new Set(pages.map(({ title }) => title)).size !== pages.length) throw new Error("Site titles must be unique");
  for (const page of pages) {
    if (!page.route.startsWith("/") || !page.route.endsWith("/")) throw new Error(`Route must start and end with /: ${page.route}`);
    if (page.description.length < 90 || page.description.length > 165) throw new Error(`Description must be 90-165 characters: ${page.route}`);
  }
  const aliasRoutes = new Set();
  for (const { from, to } of redirects) {
    if (!/^\/(?:[a-z0-9-]+\/)+$/.test(from) || !pageByRoute.has(to)) {
      throw new Error(`Redirect must use a contained route and a canonical target: ${from} -> ${to}`);
    }
    if (pageByRoute.has(from) || aliasRoutes.has(from)) throw new Error(`Redirect route conflicts: ${from}`);
    aliasRoutes.add(from);
  }

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(path.join(outputRoot, "assets"), { recursive: true });
  await mkdir(path.join(outputRoot, "downloads"), { recursive: true });
  const rendered = [];
  for (const page of pages) rendered.push(await renderPage(page));
  for (const redirect of redirects) await renderRedirect(redirect);

  await copyFile(path.join(root, "site/assets/site.css"), path.join(outputRoot, "assets/site.css"));
  await copyFile(path.join(root, "site/assets/site.js"), path.join(outputRoot, "assets/site.js"));
  await copyFile(path.join(root, "site/assets/favicon.svg"), path.join(outputRoot, "assets/favicon.svg"));
  await copyFile(path.join(root, "assets/applied-ai-field-guide-banner.svg"), path.join(outputRoot, "assets/applied-ai-field-guide-banner.svg"));
  await copyFile(path.join(root, "assets/applied-ai-field-guide-social.svg"), path.join(outputRoot, "assets/applied-ai-field-guide-social.svg"));
  await copyFile(path.join(root, "assets/applied-ai-field-guide-social.png"), path.join(outputRoot, "assets/applied-ai-field-guide-social.png"));
  await copyFile(path.join(root, "assets/ai-value-engineering-scorecard.svg"), path.join(outputRoot, "assets/ai-value-engineering-scorecard.svg"));
  await copyFile(path.join(root, "assets/ai-value-engineering-scorecard.png"), path.join(outputRoot, "assets/ai-value-engineering-scorecard.png"));
  await copyFile(path.join(root, "output/pdf/ai-value-engineering-scorecard.pdf"), path.join(outputRoot, "downloads/ai-value-engineering-scorecard.pdf"));
  await copyFile(path.join(root, "node_modules/mermaid/dist/mermaid.min.js"), path.join(outputRoot, "assets/mermaid.min.js"));

  for (const page of pages) {
    const body = await readFile(path.join(root, page.source), "utf8");
    // Standalone downloads use absolute destinations; code samples remain exact.
    const chunks = body.split(/(```[\s\S]*?```)/g);
    for (let i = 0; i < chunks.length; i += 2) {
      const matches = [...chunks[i].matchAll(/\]\(([^\s)]+)\)/g)];
      for (const match of matches) {
        const target = match[1];
        const rewritten = target.startsWith("#") ? `${canonicalUrl(page.route)}${target}` : await rewriteLocalTarget(target, page);
        const absolute = new URL(rewritten, canonicalUrl(page.route)).href;
        chunks[i] = chunks[i].replace(match[0], `](${absolute})`);
      }
    }
    const destination = path.join(outputRoot, "downloads", page.source);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, chunks.join(""));
  }
  for (const directory of ["templates", "schemas"]) {
    await mkdir(path.join(outputRoot, "downloads", directory), { recursive: true });
    for (const entry of await readdir(path.join(root, directory))) if (entry.endsWith(".json")) await copyFile(path.join(root, directory, entry), path.join(outputRoot, "downloads", directory, entry));
  }
  await mkdir(path.join(outputRoot, "labs/invoice-review"), { recursive: true });
  for (const name of ["index.html", "sources.mjs", "engine.mjs", "review.mjs"]) {
    const body = await readFile(path.join(root, "examples/invoice-exception/document-review", name), "utf8");
    await writeFile(path.join(outputRoot, "labs/invoice-review", name), name === "index.html" ? body.replace("../engagement/README.md", "../../worked-engagement/invoice-exception/") : body);
  }

  const searchIndex = rendered.map((page) => ({
    route: page.route,
    title: page.title,
    description: page.description,
    text: page.searchableText,
  }));
  await writeFile(path.join(outputRoot, "assets/search-index.json"), `${JSON.stringify(searchIndex)}\n`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rendered
    .map((page) => `  <url><loc>${escapeXml(canonicalUrl(page.route))}</loc><lastmod>${escapeXml(page.updated)}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
  await writeFile(path.join(outputRoot, "sitemap.xml"), sitemap);
  await writeFile(
    path.join(outputRoot, "robots.txt"),
    `# Project-scoped discovery copy; host-root crawler policy lives at https://davidahmann.github.io/robots.txt\nUser-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
  );
  const llms = `# ${site.name}\n\n> ${site.description}\n\nCanonical repository: ${site.repository}\nLicense: Apache-2.0\n\n## Read the guide\n\n${rendered
    .map((page) => `- [${page.navTitle}](${canonicalUrl(page.route)}): ${page.description}`)
    .join("\n")}\n\n## Machine-readable source\n\n- [Repository agent contract](${site.repository}/blob/main/AGENTS.md)\n- [Governed artifact catalog](${site.repository}/blob/main/catalog.json)\n- [Production controls](${site.repository}/blob/main/controls/control-catalog.json)\n- [JSON Schemas](${site.repository}/tree/main/schemas)\n- [Executable examples](${site.repository}/tree/main/examples)\n- [Validation suite](${site.repository}/tree/main/tests)\n`;
  await writeFile(path.join(outputRoot, "llms.txt"), llms);
  await writeFile(path.join(outputRoot, "404.html"), renderNotFound());
  await writeFile(path.join(outputRoot, ".nojekyll"), "");
  console.log(`Built ${rendered.length} canonical pages in ${path.relative(root, outputRoot)}`);
}

await build();
