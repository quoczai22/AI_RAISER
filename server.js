import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { getPositiveIntEnv, loadEnvFile } from "./src/services/env.js";
import { listScenarios } from "./src/services/scenarioService.js";
import {
  confirmConsent,
  createSession,
  getSession,
  getSessionMessages,
} from "./src/services/sessionService.js";
import { sendChatMessage } from "./src/services/chatOrchestrator.js";
import { completeSession, getDashboard } from "./src/services/dashboardService.js";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(rootDir, "src", "public");
loadEnvFile();
const port = getPositiveIntEnv("PORT", 3000);

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const staticTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const maxJsonBodyBytes = getPositiveIntEnv("MAX_JSON_BODY_BYTES", 64 * 1024);
const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
};

Object.assign(jsonHeaders, securityHeaders);

function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

function sendText(res, status, message) {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    ...securityHeaders,
  });
  res.end(message);
}

async function readJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > maxJsonBodyBytes) {
      const error = new Error("Request body is too large.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON body.");
    error.status = 400;
    throw error;
  }
}

async function serveStatic(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  let decodedPath = "";
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    sendText(res, 400, "Bad request");
    return;
  }
  const safePath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = resolve(publicDir, `.${safePath}`);
  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${sep}`)) {
    sendText(res, 404, "Not found");
    return;
  }

  const contentType = staticTypes[extname(filePath)] || "application/octet-stream";

  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "content-type": contentType,
      ...securityHeaders,
    });
    res.end(req.method === "HEAD" ? undefined : file);
  } catch {
    sendText(res, 404, "Not found");
  }
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/scenarios") {
    sendJson(res, 200, { scenarios: listScenarios() });
    return;
  }

  if (req.method === "GET" && path === "/api/runtime-status") {
    sendJson(res, 200, {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      maxChatTurns: getPositiveIntEnv("MAX_CHAT_TURNS", 8),
      maxMessageLength: getPositiveIntEnv("MAX_MESSAGE_LENGTH", 1000),
      maxJsonBodyBytes,
    });
    return;
  }

  if (req.method === "POST" && path === "/api/sessions") {
    const body = await readJsonBody(req);
    const session = createSession(body);
    sendJson(res, 201, { session });
    return;
  }

  const consentMatch = path.match(/^\/api\/sessions\/([^/]+)\/consent$/);
  if (req.method === "POST" && consentMatch) {
    const body = await readJsonBody(req);
    const session = confirmConsent(consentMatch[1], body);
    sendJson(res, 200, { session });
    return;
  }

  const messageMatch = path.match(/^\/api\/sessions\/([^/]+)\/messages$/);
  if (req.method === "GET" && messageMatch) {
    const messages = getSessionMessages(messageMatch[1]);
    sendJson(res, 200, { messages });
    return;
  }

  if (req.method === "POST" && messageMatch) {
    const body = await readJsonBody(req);
    const result = await sendChatMessage(messageMatch[1], body);
    sendJson(res, 200, result);
    return;
  }

  const sessionMatch = path.match(/^\/api\/sessions\/([^/]+)$/);
  if (req.method === "GET" && sessionMatch) {
    const session = getSession(sessionMatch[1]);
    sendJson(res, 200, { session });
    return;
  }

  const completeMatch = path.match(/^\/api\/sessions\/([^/]+)\/complete$/);
  if (req.method === "POST" && completeMatch) {
    const dashboard = completeSession(completeMatch[1]);
    sendJson(res, 200, dashboard);
    return;
  }

  const dashboardMatch = path.match(/^\/api\/sessions\/([^/]+)\/dashboard$/);
  if (req.method === "GET" && dashboardMatch) {
    const dashboard = getDashboard(dashboardMatch[1]);
    sendJson(res, 200, dashboard);
    return;
  }

  sendJson(res, 404, { error: "Route not found." });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/healthz") {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.message || "Internal server error.",
    });
  }
});

server.listen(port, () => {
  console.log(`AI Scam Inoculation running at http://localhost:${port}`);
});
