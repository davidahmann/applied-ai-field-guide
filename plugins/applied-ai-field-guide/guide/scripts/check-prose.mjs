import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// This taxonomy adapts Peter Yang's MIT-licensed no-ai-slop project.
// Source and full license notice: https://github.com/petergyang/no-ai-slop and ../NOTICE.
const bannedWords = [
  "delve", "foster", "leverage", "utilize", "facilitate", "empower", "streamline",
  "robust", "cutting-edge", "paradigm shift", "game changer", "this is huge",
  "this changes everything", "tapestry", "realm", "beacon", "multifaceted",
  "meticulous", "intricate", "paramount", "transformative", "elevate", "embark",
  "supercharge", "ever-evolving",
];

const structuralPatterns = [
  ["binary contrast", /\b(?:this|it|the question) (?:is not|isn't)\b[^.!?]*[.!?]\s*(?:it(?:'s| is)|the answer is)\b/gi],
  ["throat clearing", /\b(?:here's the thing|let me be clear|the uncomfortable truth is|it's worth noting|it's important to note)\b/gi],
  ["faux insight", /\b(?:what most people get wrong|here's what nobody tells you|the part everyone misses|this is the part most people skip)\b/gi],
  ["interpretive aside", /\b(?:as you can see|this distinction matters|the key point is|that last part matters more than it sounds)\b/gi],
  ["summary ending", /^(?:in conclusion|ultimately|overall),?\b/gim],
];

function stripMarkdown(source) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/`[^`\n]+`/g, " ")
    .replace(/!?(\[[^\]]*\])\([^\s)]+(?:\s+"[^"]*")?\)/g, "$1")
    .replace(/^\s*```mermaid[\s\S]*?^\s*```/gim, " ");
}

export function auditText(source) {
  const text = stripMarkdown(source);
  const errors = [];
  const observations = [];
  for (const term of bannedWords) {
    const expression = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replaceAll("\\ ", "\\s+")}\\b`, "gi");
    for (const match of text.matchAll(expression)) errors.push({ pattern: "inflated vocabulary", match: match[0] });
  }
  for (const [pattern, expression] of structuralPatterns) {
    expression.lastIndex = 0;
    for (const match of text.matchAll(expression)) observations.push({ pattern, match: match[0].replace(/\s+/g, " ").trim() });
  }
  return { errors, observations };
}

export function isSourceBound(file) {
  return file === "CHANGELOG.md" || file === "library/05-source-index.md" || file.startsWith("research/") || file.startsWith("docs/migrations/");
}

function run() {
  const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "*.md"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter(Boolean)
    .filter((file) => !file.startsWith("plugins/applied-ai-field-guide/guide/"));
  const failures = [];
  const notes = [];
  for (const file of files) {
    const result = auditText(readFileSync(path.join(root, file), "utf8"));
    const findings = [...result.errors, ...result.observations];
    for (const finding of findings) {
      const item = `${file}: ${finding.pattern}: ${JSON.stringify(finding.match)}`;
      if (finding.pattern === "inflated vocabulary" && !isSourceBound(file)) failures.push(item);
      else notes.push(item);
    }
  }
  if (notes.length) console.log(`Prose observations (${notes.length}; review required, not authorship detection):\n${notes.join("\n")}`);
  if (failures.length) {
    console.error(`Prose failures (${failures.length}):\n${failures.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log(`Prose audit passed for ${files.length} Markdown files; technical vocabulary and source quotations remain intentional.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
