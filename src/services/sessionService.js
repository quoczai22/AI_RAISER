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

  if (input.inviterConsent !== true) {
    const error = new Error("Inviter consent is required before creating a session.");
    error.status = 400;
    throw error;
  }

  const scenario = getScenario(input.scenarioId);
  const session = {
    id: randomUUID(),
    scenarioId: scenario.id,
    inviterConsentAt: now(),
    participantConsentAt: null,
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

export function confirmParticipantConsent(sessionId, input) {
  const session = requireSession(sessionId);
  if (!input || input.participantConsent !== true) {
    const error = new Error("Participant consent is required before chat starts.");
    error.status = 400;
    throw error;
  }

  session.participantConsentAt = now();
  session.status = "active";
  session.startedAt = now();
  sessions.set(session.id, session);
  return summarizeSession(session);
}

export function getSession(sessionId) {
  return summarizeSession(requireSession(sessionId));
}

export function requireActiveSession(sessionId) {
  const session = requireSession(sessionId);
  if (!session.participantConsentAt || session.status !== "active") {
    const error = new Error("Participant consent is required before chat starts.");
    error.status = 403;
    throw error;
  }
  return session;
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
    inviterConsentAt: session.inviterConsentAt,
    participantConsentAt: session.participantConsentAt,
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
