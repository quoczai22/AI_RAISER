import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listScenarios } from "./src/services/scenarioService.js";
import {
  confirmParticipantConsent,
  createSession,
  getSession,
} from "./src/services/sessionService.js";
import { sendChatMessage } from "./src/services/chatOrchestrator.js";
import { completeSession, getDashboard } from "./src/services/dashboardService.js";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);

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

function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
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
  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = join(rootDir, "src", "public", safePath);
  const contentType = staticTypes[extname(filePath)] || "application/octet-stream";

  try {
    const file = await readFile(filePath);
    res.writeHead(200, { "content-type": contentType });
    res.end(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/scenarios") {
    sendJson(res, 200, { scenarios: listScenarios() });
    return;
  }

  if (req.method === "POST" && path === "/api/sessions") {
    const body = await readJsonBody(req);
    const session = createSession(body);
    sendJson(res, 201, { session });
    return;
  }

  const participantConsentMatch = path.match(/^\/api\/sessions\/([^/]+)\/participant-consent$/);
  if (req.method === "POST" && participantConsentMatch) {
    const body = await readJsonBody(req);
    const session = confirmParticipantConsent(participantConsentMatch[1], body);
    sendJson(res, 200, { session });
    return;
  }

  const messageMatch = path.match(/^\/api\/sessions\/([^/]+)\/messages$/);
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
