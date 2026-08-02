import { randomUUID } from "node:crypto";
import { getScenario } from "./scenarioService.js";
import { requireActiveSession } from "./sessionService.js";
import { generateGeminiJson } from "./geminiClient.server.js";
import {
  isStopRequest,
  looksLikeScamRecognition,
  maskSensitiveInput,
  validateAiReply,
} from "./safetyValidator.js";

const maxTurns = Number(process.env.MAX_CHAT_TURNS || 8);

const geminiOutputSchema = {
  type: "object",
  required: ["reply", "simulationState", "redFlagSignals", "safetyAssessment"],
  properties: {
    reply: { type: "string" },
    simulationState: {
      type: "object",
      required: ["status", "reason", "shouldEnd"],
      properties: {
        status: {
          type: "string",
          enum: ["active", "wrap_up", "completed", "aborted"],
        },
        reason: { type: "string" },
        shouldEnd: { type: "boolean" },
      },
    },
    redFlagSignals: {
      type: "array",
      items: {
        type: "object",
        required: ["key", "status", "evidence"],
        properties: {
          key: { type: "string" },
          status: {
            type: "string",
            enum: ["triggered", "recognized", "missed", "not_applicable"],
          },
          evidence: { type: "string" },
        },
      },
    },
    safetyAssessment: {
      type: "object",
      required: ["containsSensitiveRequest", "containsRealWorldInstruction", "safeToShow"],
      properties: {
        containsSensitiveRequest: { type: "boolean" },
        containsRealWorldInstruction: { type: "boolean" },
        safeToShow: { type: "boolean" },
        notes: { type: "string" },
      },
    },
  },
};

const systemInstruction = `
You are an educational simulation writer for AI Scam Inoculation.
This is a consent-based training simulation for Vietnamese families.
You are NOT helping anyone commit fraud.
You must not provide instructions, operational details, links, QR codes, bank account numbers, malware steps, credential theft tactics, or content reusable for real-world scams.
Reply naturally in Vietnamese, keep messages short and chat-like for a 55+ Vietnamese participant.
Use only the allowed tactics from the scenario.
Do not ask for real OTP, passwords, CCCD, card numbers, bank account numbers, or private data.
If sensitive information is referenced, use fictional placeholders like "[mã xác minh giả]".
Do not generate real links, QR codes, phone numbers, payment details, or app install instructions.
If the participant says they want to stop, end politely.
If the participant identifies the scam, transition toward a safe wrap-up.
Output only valid JSON matching the schema.
`;

export async function sendChatMessage(sessionId, input) {
  if (!input || typeof input.message !== "string" || input.message.trim().length === 0) {
    const error = new Error("Message is required.");
    error.status = 400;
    throw error;
  }

  const session = requireActiveSession(sessionId);
  const scenario = getScenario(session.scenarioId);
  const masked = maskSensitiveInput(input.message.trim());

  const participantMessage = {
    id: randomUUID(),
    role: "participant",
    content: masked.masked,
    metadata: {
      maskedSensitiveInput: masked.changed,
      detectedSensitiveTypes: masked.detected,
    },
    createdAt: now(),
  };
  session.messages.push(participantMessage);
  session.turnCount += 1;

  const modelResult = await generateModelReply({ session, scenario, participantMessage });
  const aiValidation = validateAiReply(modelResult.reply);
  const safeToShow =
    aiValidation.safe &&
    modelResult.safetyAssessment?.safeToShow !== false &&
    modelResult.safetyAssessment?.containsRealWorldInstruction !== true;

  const aiReply = safeToShow
    ? modelResult.reply
    : "Mình tạm dừng mô phỏng tại đây để đảm bảo an toàn. Bây giờ chúng ta sẽ chuyển sang phần nhận diện dấu hiệu cảnh báo.";

  const aiMessage = {
    id: randomUUID(),
    role: "ai",
    content: aiReply,
    metadata: {
      provider: modelResult.provider,
      modelUsed: modelResult.modelUsed,
      aiOutputValidated: safeToShow,
      validationReasons: aiValidation.reasons,
      retryUsed: modelResult.retryUsed,
    },
    createdAt: now(),
  };
  session.messages.push(aiMessage);

  const redFlagSignals = normalizeRedFlagSignals(modelResult.redFlagSignals, scenario);
  session.redFlagEvents.push(
    ...redFlagSignals.map((event) => ({
      id: randomUUID(),
      messageId: aiMessage.id,
      redFlagKey: event.key,
      status: event.status,
      evidenceText: event.evidence,
      createdAt: now(),
    })),
  );

  if (
    !safeToShow ||
    modelResult.simulationState?.shouldEnd ||
    session.turnCount >= maxTurns ||
    isStopRequest(masked.masked)
  ) {
    session.status = "completed";
    session.completedAt = now();
  }

  return {
    messageId: aiMessage.id,
    reply: aiReply,
    sessionStatus: session.status,
    turnCount: session.turnCount,
    detectedEvents: redFlagSignals,
    safety: {
      maskedSensitiveInput: masked.changed,
      aiOutputValidated: safeToShow,
      retryUsed: modelResult.retryUsed,
      provider: modelResult.provider,
    },
  };
}

async function generateModelReply({ session, scenario, participantMessage }) {
  const prompt = buildPrompt({ session, scenario, participantMessage });
  try {
    const result = await generateGeminiJson({
      systemInstruction,
      prompt,
      schema: geminiOutputSchema,
    });
    return validateGeminiShape({
      ...result,
      provider: "gemini",
      modelUsed: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      retryUsed: false,
    });
  } catch (error) {
    return fallbackReply({ session, scenario, participantMessage, reason: error.code || error.message });
  }
}

function buildPrompt({ session, scenario, participantMessage }) {
  const history = session.messages.slice(-10).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  return JSON.stringify({
    scenario,
    sessionState: {
      turnCount: session.turnCount,
      maxTurns,
      status: session.status,
      difficulty: session.difficulty,
      triggeredRedFlags: session.redFlagEvents.map((event) => event.redFlagKey),
      consentConfirmed: Boolean(session.consentAt),
    },
    conversationHistory: history,
    currentParticipantMessage: participantMessage.content,
  });
}

function validateGeminiShape(result) {
  if (!result || typeof result.reply !== "string") {
    const error = new Error("Invalid Gemini response shape.");
    error.status = 502;
    throw error;
  }
  return {
    reply: result.reply,
    simulationState: result.simulationState || {
      status: "active",
      reason: "default_state",
      shouldEnd: false,
    },
    redFlagSignals: Array.isArray(result.redFlagSignals) ? result.redFlagSignals : [],
    safetyAssessment: result.safetyAssessment || {
      containsSensitiveRequest: false,
      containsRealWorldInstruction: false,
      safeToShow: true,
      notes: "",
    },
    provider: result.provider,
    modelUsed: result.modelUsed,
    retryUsed: Boolean(result.retryUsed),
  };
}

function fallbackReply({ session, scenario, participantMessage, reason }) {
  const recognized = looksLikeScamRecognition(participantMessage.content);
  const stop = isStopRequest(participantMessage.content);
  const shouldEnd = stop || recognized || session.turnCount >= maxTurns;
  const firstRedFlag = scenario.redFlags[session.turnCount % scenario.redFlags.length];

  let reply = "Đây là phản hồi dự phòng an toàn vì Gemini chưa được cấu hình. Khi có GEMINI_API_KEY, phần này sẽ được thay bằng hội thoại AI động.";
  if (recognized) {
    reply = "Bạn đã làm đúng khi muốn xác minh lại qua kênh chính thức. Mình sẽ dừng mô phỏng để chuyển sang phần tổng kết dấu hiệu cảnh báo.";
  } else if (stop) {
    reply = "Mình dừng mô phỏng tại đây. Bây giờ chúng ta có thể xem lại các dấu hiệu cảnh báo.";
  }

  return {
    reply,
    simulationState: {
      status: shouldEnd ? "completed" : "active",
      reason,
      shouldEnd,
    },
    redFlagSignals: [
      {
        key: firstRedFlag.key,
        status: recognized ? "recognized" : "triggered",
        evidence: firstRedFlag.label,
      },
    ],
    safetyAssessment: {
      containsSensitiveRequest: false,
      containsRealWorldInstruction: false,
      safeToShow: true,
      notes: "Fallback response used.",
    },
    provider: "safe_fallback",
    modelUsed: "none",
    retryUsed: false,
  };
}

function normalizeRedFlagSignals(signals, scenario) {
  const allowed = new Set(scenario.redFlags.map((flag) => flag.key));
  return signals
    .filter((signal) => signal && allowed.has(signal.key))
    .map((signal) => ({
      key: signal.key,
      status: signal.status || "triggered",
      evidence: String(signal.evidence || "").slice(0, 180),
    }));
}

function now() {
  return new Date().toISOString();
}
