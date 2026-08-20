import { randomUUID } from "node:crypto";
import { getPositiveIntEnv } from "./env.js";
import { getScenario } from "./scenarioService.js";
import { requireActiveSession } from "./sessionService.js";
import { sessions } from "./store.js";
import { generateGeminiJson } from "./geminiClient.server.js";
import {
  isStopRequest,
  looksLikeScamRecognition,
  maskSensitiveInput,
  validateAiReply,
} from "./safetyValidator.js";

const maxTurns = getPositiveIntEnv("MAX_CHAT_TURNS", 8);
const maxMessageLength = getPositiveIntEnv("MAX_MESSAGE_LENGTH", 1000);

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

  if (input.message.trim().length > maxMessageLength) {
    const error = new Error(`Message must be ${maxMessageLength} characters or fewer.`);
    error.status = 400;
    throw error;
  }

  const session = await requireActiveSession(sessionId);
  const scenario = getScenario(session.scenarioId);
  if (session.isProcessing) {
    const lastUpdate = session.updatedAt || session.createdAt;
    const lockAgeMs = new Date() - new Date(lastUpdate);
    if (lockAgeMs > 30000) {
      console.warn(`Lock expired for session ${sessionId} (${lockAgeMs}ms old). Releasing lock.`);
      session.isProcessing = false;
    } else {
      const error = new Error("A chat message is already being processed.");
      error.status = 409;
      throw error;
    }
  }
  session.isProcessing = true;
  session.updatedAt = new Date().toISOString();
  await sessions.set(session.id, session);

  try {
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
    session.updatedAt = new Date().toISOString();
    await sessions.set(session.id, session);

    let modelResult = await generateModelReply({ session, scenario, participantMessage });
    let aiValidation = validateAiReply(modelResult.reply);
    if (!isModelResultSafe(modelResult, aiValidation)) {
      modelResult = await generateModelReply({
        session,
        scenario,
        participantMessage,
        repairReason: aiValidation.reasons.join(", ") || modelResult.safetyAssessment?.notes || "unsafe_output",
      });
      aiValidation = validateAiReply(modelResult.reply);
      modelResult.retryUsed = true;
    }
    const safeToShow = isModelResultSafe(modelResult, aiValidation);

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
        fallbackReason: modelResult.fallbackReason || "",
      },
      createdAt: now(),
    };
    session.messages.push(aiMessage);

    const redFlagSignals = applyParticipantRecognition({
      signals: normalizeRedFlagSignals(modelResult.redFlagSignals, scenario),
      scenario,
      session,
      participantMessage,
    });
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

    session.updatedAt = new Date().toISOString();
    await sessions.set(session.id, session);

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
        fallbackReason: modelResult.fallbackReason || "",
      },
    };
  } finally {
    session.isProcessing = false;
    session.updatedAt = new Date().toISOString();
    await sessions.set(session.id, session);
  }
}

async function generateModelReply({ session, scenario, participantMessage, repairReason = "" }) {
  const prompt = buildPrompt({ session, scenario, participantMessage, repairReason });
  try {
    const result = await generateGeminiJson({
      systemInstruction,
      prompt,
      schema: geminiOutputSchema,
    });
    return validateGeminiShape({
      ...result,
      provider: "gemini",
      modelUsed: "gemini-3.6-flash",
      retryUsed: Boolean(repairReason),
    });
  } catch (error) {
    const reason = error.name === "AbortError" || error.code === 20 ? "GEMINI_TIMEOUT" : error.code || error.name || error.message;
    return fallbackReply({ session, scenario, participantMessage, reason });
  }
}

function buildPrompt({ session, scenario, participantMessage, repairReason }) {
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
    repairInstruction: repairReason
      ? `Previous output was blocked because: ${repairReason}. Return a safer JSON reply. If the user recognized the scam or refused sensitive data, acknowledge that and move to wrap_up/completed without asking for OTP, phone, account, URL, transfer, app install, or real personal data.`
      : "",
  });
}

function isModelResultSafe(modelResult, aiValidation) {
  return (
    aiValidation.safe &&
    modelResult.safetyAssessment?.safeToShow !== false &&
    modelResult.safetyAssessment?.containsSensitiveRequest !== true &&
    modelResult.safetyAssessment?.containsRealWorldInstruction !== true
  );
}

function validateGeminiShape(result) {
  if (!result || typeof result.reply !== "string") {
    const error = new Error("Invalid Gemini response shape.");
    error.status = 502;
    throw error;
  }
  const simulationState = normalizeSimulationState(result.simulationState);
  const safetyAssessment = normalizeSafetyAssessment(result.safetyAssessment);
  return {
    reply: result.reply,
    simulationState,
    redFlagSignals: Array.isArray(result.redFlagSignals) ? result.redFlagSignals : [],
    safetyAssessment,
    provider: result.provider,
    modelUsed: result.modelUsed,
    retryUsed: Boolean(result.retryUsed),
  };
}

function normalizeSimulationState(value) {
  const allowedStatuses = new Set(["active", "wrap_up", "completed", "aborted"]);
  const status = allowedStatuses.has(value?.status) ? value.status : "active";
  return {
    status,
    reason: String(value?.reason || "default_state").slice(0, 120),
    shouldEnd: value?.shouldEnd === true,
  };
}

function normalizeSafetyAssessment(value) {
  return {
    containsSensitiveRequest: value?.containsSensitiveRequest === true,
    containsRealWorldInstruction: value?.containsRealWorldInstruction === true,
    safeToShow: value?.safeToShow !== false,
    notes: String(value?.notes || "").slice(0, 180),
  };
}

function fallbackReply({ session, scenario, participantMessage, reason }) {
  const recognized = looksLikeScamRecognition(participantMessage.content);
  const stop = isStopRequest(participantMessage.content);
  const shouldEnd = stop || recognized || session.turnCount >= maxTurns;
  const fallbackRedFlag = chooseFallbackRedFlag({ scenario, session, participantMessage });

  const noKey = reason === "NO_GEMINI_API_KEY";
  let reply = noKey
    ? "Đây là phản hồi dự phòng an toàn vì Gemini chưa được cấu hình. Khi có GEMINI_API_KEY, phần này sẽ được thay bằng hội thoại AI động."
    : "Mình tạm dùng phản hồi dự phòng an toàn vì Gemini đang phản hồi chậm hoặc gặp lỗi tạm thời. Mô phỏng vẫn tiếp tục trong giới hạn an toàn.";
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
        key: fallbackRedFlag.key,
        status: recognized ? "recognized" : "triggered",
        evidence: fallbackRedFlag.label,
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
    fallbackReason: reason,
  };
}

function chooseFallbackRedFlag({ scenario, session, participantMessage }) {
  const text = String(participantMessage.content || "").toLowerCase();
  const preferredKeys = [
    {
      key: "request_for_sensitive_info",
      pattern: /(otp|mã xác minh|mật khẩu|password|cccd|số thẻ|số tài khoản|không cung cấp)/i,
    },
    {
      key: "unofficial_channel",
      pattern: /(hotline|kênh chính thức|app|chi nhánh|gọi lại|kiểm tra lại)/i,
    },
    {
      key: "request_to_transfer_money",
      pattern: /(chuyển tiền|chuyển khoản|gửi tiền|không chuyển tiền)/i,
    },
    {
      key: "request_to_keep_secret",
      pattern: /(bí mật|giữ kín|đừng nói|không nói ai)/i,
    },
    {
      key: "identity_mismatch",
      pattern: /(người thân|số cũ|gọi lại con|gọi lại cháu|xác minh danh tính)/i,
    },
    {
      key: "authority_pressure",
      pattern: /(lừa đảo|giả mạo|không tin|xác minh|ngân hàng|công an|cơ quan)/i,
    },
    {
      key: "fake_company_authority",
      pattern: /(tuyển dụng|nhân sự|hr|công ty|việc làm|job|xác minh công ty)/i,
    },
    {
      key: "urgency_scarcity_fee",
      pattern: /(phí|giữ chỗ|đặt cọc|suất|hết chỗ|đóng tiền|không đóng phí)/i,
    },
    {
      key: "unrealistic_salary_social_proof",
      pattern: /(lương cao|việc nhẹ|thu nhập|nhiều người|ai cũng|đã làm|kiếm được)/i,
    },
    {
      key: "urgency_threat",
      pattern: /(gấp|ngay|khẩn|đe dọa|khóa|hậu quả)/i,
    },
  ];

  for (const item of preferredKeys) {
    const flag = scenario.redFlags.find((redFlag) => redFlag.key === item.key);
    if (flag && item.pattern.test(text)) {
      return flag;
    }
  }

  const fallbackIndex = Math.max(session.turnCount - 1, 0) % scenario.redFlags.length;
  return scenario.redFlags[fallbackIndex];
}

function applyParticipantRecognition({ signals, scenario, session, participantMessage }) {
  if (!looksLikeScamRecognition(participantMessage.content)) {
    return signals;
  }

  const recognizedFlag = chooseFallbackRedFlag({ scenario, session, participantMessage });
  const existingSignal = signals.find((signal) => signal.key === recognizedFlag.key);
  if (existingSignal) {
    existingSignal.status = "recognized";
    existingSignal.evidence = existingSignal.evidence || recognizedFlag.label;
    return signals;
  }

  return [
    ...signals,
    {
      key: recognizedFlag.key,
      status: "recognized",
      evidence: recognizedFlag.label,
    },
  ];
}

function normalizeRedFlagSignals(signals, scenario) {
  const allowed = new Set(scenario.redFlags.map((flag) => flag.key));
  const allowedStatuses = new Set(["triggered", "recognized", "missed", "not_applicable"]);
  const normalized = signals
    .filter((signal) => signal && allowed.has(signal.key))
    .map((signal) => ({
      key: signal.key,
      status: allowedStatuses.has(signal.status) ? signal.status : "triggered",
      evidence: String(signal.evidence || "").slice(0, 180),
    }));
  return dedupeSignalsByKey(normalized);
}

function dedupeSignalsByKey(signals) {
  const statusRank = {
    recognized: 4,
    triggered: 3,
    missed: 2,
    not_applicable: 1,
  };
  const byKey = new Map();
  for (const signal of signals) {
    const current = byKey.get(signal.key);
    if (!current || statusRank[signal.status] > statusRank[current.status]) {
      byKey.set(signal.key, signal);
    }
  }
  return Array.from(byKey.values());
}

function now() {
  return new Date().toISOString();
}

export async function sendChatMessageStream(sessionId, input, callbacks = {}) {
  const { onChunk, onNotice, onDone, isCancelled, chunkDelayMs = 70 } = callbacks;
  const result = await sendChatMessage(sessionId, input);

  if (isCancelled?.()) {
    const latestSession = await sessions.get(sessionId);
    if (latestSession) {
      latestSession.status = "completed";
      latestSession.completedAt = latestSession.completedAt || now();
      latestSession.updatedAt = now();
      await sessions.set(sessionId, latestSession);
    }
    return { ...result, sessionStatus: "completed" };
  }

  if (result.safety.provider === "safe_fallback" && typeof onNotice === "function" && !isCancelled?.()) {
    onNotice(result.safety.fallbackReason);
  }

  const emission = await emitValidatedReplyChunks(result.reply, {
    onChunk,
    isCancelled,
    chunkDelayMs,
  });

  if (!emission.emitted && !emission.cancelled) {
    const error = new Error("Validated reply was blocked before progressive rendering.");
    error.code = "AI_OUTPUT_BLOCKED";
    throw error;
  }

  if (typeof onDone === "function" && !isCancelled?.()) {
    onDone(result);
  }
  return result;
}

export async function emitValidatedReplyChunks(reply, callbacks = {}) {
  const { onChunk, isCancelled, chunkDelayMs = 70 } = callbacks;
  const validation = validateAiReply(reply);
  if (!validation.safe) {
    return { emitted: false, reasons: validation.reasons };
  }

  const chunks = splitValidatedReply(reply);
  for (const chunk of chunks) {
    if (isCancelled?.()) {
      return { emitted: false, cancelled: true, reasons: [] };
    }
    if (typeof onChunk === "function") {
      onChunk(chunk);
    }
    if (chunkDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, chunkDelayMs));
    }
  }
  return { emitted: true, cancelled: false, reasons: [] };
}

function splitValidatedReply(reply) {
  const text = String(reply || "");
  const chunks = text.match(/\S+\s*/g);
  return chunks && chunks.length > 0 ? chunks : text ? [text] : [];
}
