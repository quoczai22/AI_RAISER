import { randomUUID } from "node:crypto";
import { getPositiveIntEnv } from "./env.js";
import { getScenario } from "./scenarioService.js";
import { sessions } from "./store.js";

function now() {
  return new Date().toISOString();
}

export async function createSession(input) {
  if (!input || typeof input !== "object") {
    const error = new Error("Request body is required.");
    error.status = 400;
    throw error;
  }

  const scenario = getScenario(input.scenarioId);
  const difficulty = normalizeDifficulty(input.difficulty);
  const session = {
    id: randomUUID(),
    scenarioId: scenario.id,
    userName: normalizeUserName(input.userName),
    difficulty,
    consentAt: null,
    status: "created",
    turnCount: 0,
    messages: [],
    redFlagEvents: [],
    score: null,
    createdAt: now(),
  };

  await sessions.set(session.id, session);
  await pruneSessionStore({ keepSessionId: session.id });
  return summarizeSession(session);
}

export async function confirmConsent(sessionId, input) {
  const session = await requireSession(sessionId);
  if (!input || input.consent !== true) {
    const error = new Error("Simulation consent is required before chat starts.");
    error.status = 400;
    throw error;
  }

  if (session.status === "completed") {
    const error = new Error("Session is already completed.");
    error.status = 409;
    throw error;
  }

  session.consentAt = session.consentAt || now();
  session.status = "active";
  session.startedAt = session.startedAt || now();
  await sessions.set(session.id, session);
  return summarizeSession(session);
}

export async function getSession(sessionId) {
  return summarizeSession(await requireSession(sessionId));
}

export async function getSessionMessages(sessionId) {
  const session = await requireConsentedSession(sessionId);
  return session.messages.map((message) => ({
    id: message.id,
    role: message.role === "participant" ? "user" : message.role,
    content: message.content,
    createdAt: message.createdAt,
  }));
}

export async function requireActiveSession(sessionId) {
  const session = await requireSession(sessionId);
  if (session.status === "completed") {
    const error = new Error("Session is already completed.");
    error.status = 409;
    throw error;
  }
  if (!session.consentAt || session.status !== "active") {
    const error = new Error("Simulation consent is required before chat starts.");
    error.status = 403;
    throw error;
  }
  return session;
}

export async function requireStoredSession(sessionId) {
  return await requireSession(sessionId);
}

export async function requireConsentedSession(sessionId) {
  const session = await requireSession(sessionId);
  if (!session.consentAt) {
    const error = new Error("Simulation consent is required before viewing results.");
    error.status = 403;
    throw error;
  }
  return session;
}

export async function requireCompletedSession(sessionId) {
  const session = await requireConsentedSession(sessionId);
  if (session.status !== "completed") {
    const error = new Error("Session must be completed before viewing results.");
    error.status = 409;
    throw error;
  }
  return session;
}

async function requireSession(sessionId) {
  const session = await sessions.get(sessionId);
  if (!session) {
    const error = new Error("Session not found.");
    error.status = 404;
    throw error;
  }
  return session;
}

function summarizeSession(session) {
  return {
    id: session.id,
    scenarioId: session.scenarioId,
    userName: session.userName,
    difficulty: session.difficulty,
    consentAt: session.consentAt,
    status: session.status,
    turnCount: session.turnCount,
    messageCount: session.messages.length,
    redFlagEventCount: session.redFlagEvents.length,
    hasScore: Boolean(session.score),
    createdAt: session.createdAt,
    startedAt: session.startedAt || null,
    completedAt: session.completedAt || null,
  };
}

function normalizeDifficulty(value) {
  const difficulty = String(value || "easy").toLowerCase();
  if (["easy", "medium", "hard"].includes(difficulty)) {
    return difficulty;
  }
  return "easy";
}

function normalizeUserName(value) {
  const name = String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!name) return "Bạn";
  return name.slice(0, 40);
}

async function pruneSessionStore({ keepSessionId }) {
  const maxSessions = getPositiveIntEnv("MAX_SESSIONS", 200);
  const currentSize = await sessions.size();
  if (currentSize <= maxSessions) return;

  const oldestFirst = (await sessions.values())
    .filter((session) => session.id !== keepSessionId)
    .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)));

  const pruneOrder = [
    ...oldestFirst.filter((session) => session.status !== "active"),
    ...oldestFirst.filter((session) => session.status === "active"),
  ];

  for (const session of pruneOrder) {
    const freshSize = await sessions.size();
    if (freshSize <= maxSessions) return;
    await sessions.delete(session.id);
  }
}
