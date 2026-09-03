#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { callTool, toolDefinitions } from "./tools.mjs";
import { GuideError } from "./workspace.mjs";

const protocolVersion = "2025-06-18";
const supportedProtocolVersions = new Set([protocolVersion, "2025-03-26", "2024-11-05"]);
const manifest = JSON.parse(await readFile(new URL("../.codex-plugin/plugin.json", import.meta.url), "utf8"));
const serverInfo = { name: "applied-ai-local-copilot", version: manifest.version };
const maxRequestBytes = 1024 * 1024;
const maxResponseBytes = 1024 * 1024;
const maxPendingRequests = 16;
const maxTextContentBytes = 16 * 1024;

function send(payload) {
  const encoded = JSON.stringify(payload);
  if (Buffer.byteLength(encoded) > maxResponseBytes) {
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: payload?.id ?? null, error: { code: -32001, message: `Response exceeds the ${maxResponseBytes}-byte local transport limit` } })}\n`);
    return;
  }
  process.stdout.write(`${encoded}\n`);
}

function result(id, value) {
  send({ jsonrpc: "2.0", id, result: value });
}

function error(id, code, message, data) {
  send({ jsonrpc: "2.0", id, error: { code, message, ...(data ? { data } : {}) } });
}

function boundedTextContent(toolName, value) {
  const full = JSON.stringify(value, null, 2);
  if (Buffer.byteLength(full) <= maxTextContentBytes) return full;
  return JSON.stringify({
    status: value?.status || "ok",
    tool: toolName,
    engagement_id: value?.engagement?.engagement_id || value?.engagement_id || null,
    counts: value?.counts || null,
    projection_pages: value?.projection_pages || null,
    projection_truncated: value?.projection_truncated ?? null,
    text_content_truncated: true,
    continuation: "Use structuredContent and the reported offsets for the complete bounded result.",
  }, null, 2);
}

async function handle(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    error(message?.id ?? null, -32600, "Invalid Request");
    return;
  }
  if (message.id === undefined) return;
  switch (message.method) {
    case "initialize":
      result(message.id, {
        protocolVersion: supportedProtocolVersions.has(message.params?.protocolVersion) ? message.params.protocolVersion : protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo,
        instructions: "Local-only applied-AI engagement workspace and Guide navigation. Tools do not grant authority, open external sources, or prove customer or production decisions.",
      });
      return;
    case "ping":
      result(message.id, {});
      return;
    case "tools/list":
      result(message.id, { tools: toolDefinitions });
      return;
    case "tools/call": {
      const name = message.params?.name;
      try {
        const structuredContent = await callTool(name, message.params?.arguments || {});
        result(message.id, {
          content: [{ type: "text", text: boundedTextContent(name, structuredContent) }],
          structuredContent,
          isError: false,
        });
      } catch (caught) {
        const known = caught instanceof GuideError;
        const payload = {
          status: "error",
          error: { code: known ? caught.code : "INTERNAL_ERROR", message: known ? caught.message : "The local Guide tool failed safely.", details: known ? caught.details : {} },
        };
        if (!known) process.stderr.write(`[applied-ai-mcp] ${caught?.stack || caught}\n`);
        result(message.id, { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload, isError: true });
      }
      return;
    }
    default:
      error(message.id, -32601, "Method not found");
  }
}

let queue = Promise.resolve();
let inputBuffer = Buffer.alloc(0);
let inputClosed = false;
let pendingRequests = 0;

function rejectOversizedRequest() {
  if (inputClosed) return;
  inputClosed = true;
  error(null, -32000, `Request exceeds the ${maxRequestBytes}-byte local transport limit`);
  process.exitCode = 1;
  process.stdin.destroy();
}

function enqueueLine(lineBuffer) {
  if (lineBuffer.byteLength > maxRequestBytes) {
    rejectOversizedRequest();
    return;
  }
  const line = lineBuffer.toString("utf8").replace(/\r$/, "");
  if (!line.trim()) return;
  if (pendingRequests >= maxPendingRequests) {
    inputClosed = true;
    error(null, -32002, `Pending request queue exceeds the ${maxPendingRequests}-request local transport limit`);
    process.exitCode = 1;
    process.stdin.destroy();
    return;
  }
  pendingRequests += 1;
  queue = queue.then(async () => {
    let message;
    try { message = JSON.parse(line); }
    catch { error(null, -32700, "Parse error"); return; }
    await handle(message);
  }).finally(() => { pendingRequests -= 1; });
}

process.stdin.on("data", (chunk) => {
  if (inputClosed) return;
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  let newline;
  while ((newline = inputBuffer.indexOf(0x0a)) !== -1) {
    const line = inputBuffer.subarray(0, newline);
    inputBuffer = inputBuffer.subarray(newline + 1);
    enqueueLine(line);
    if (inputClosed) return;
  }
  if (inputBuffer.byteLength > maxRequestBytes) rejectOversizedRequest();
});
process.stdin.on("end", () => {
  if (!inputClosed && inputBuffer.byteLength > 0) enqueueLine(inputBuffer);
  queue.catch((caught) => process.stderr.write(`[applied-ai-mcp] ${caught?.stack || caught}\n`));
});
