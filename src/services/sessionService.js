import { randomUUID } from "node:crypto";
import { getScenario } from "./scenarioService.js";
import { sessions } from "./store.js";

function now() {
  return new Date().toISOString();
}

export function createSession(input) {
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

  sessions.set(session.id, session);
  return summarizeSession(session);
}

export function confirmConsent(sessionId, input) {
  const session = requireSession(sessionId);
  if (!input || input.consent !== true) {
    const error = new Error("Simulation consent is required before chat starts.");
    error.status = 400;
    throw error;
  }

  session.consentAt = now();
  session.status = "active";
  session.startedAt = now();
  sessions.set(session.id, session);
  return summarizeSession(session);
}

export function getSession(sessionId) {
  return summarizeSession(requireSession(sessionId));
}

export function getSessionMessages(sessionId) {
  const session = requireSession(sessionId);
  return session.messages.map((message) => ({
    id: message.id,
    role: message.role === "participant" ? "user" : message.role,
    content: message.content,
    createdAt: message.createdAt,
  }));
}

export function requireActiveSession(sessionId) {
  const session = requireSession(sessionId);
  if (!session.consentAt || session.status !== "active") {
    const error = new Error("Simulation consent is required before chat starts.");
    error.status = 403;
    throw error;
  }
  return session;
}

export function requireStoredSession(sessionId) {
  return requireSession(sessionId);
}

function requireSession(sessionId) {
  const session = sessions.get(sessionId);
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
  const name = String(value || "").trim();
  if (!name) return "Bạn";
  return name.slice(0, 40);
}
