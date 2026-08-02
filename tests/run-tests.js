import assert from "node:assert/strict";
import { listScenarios } from "../src/services/scenarioService.js";
import {
  confirmConsent,
  createSession,
  getSessionMessages,
  getSession,
  requireStoredSession,
} from "../src/services/sessionService.js";
import { sendChatMessage } from "../src/services/chatOrchestrator.js";
import { getDashboard } from "../src/services/dashboardService.js";
import { getPositiveIntEnv, loadEnvFile } from "../src/services/env.js";
import { generateGeminiJson } from "../src/services/geminiClient.server.js";
import { looksLikeScamRecognition, maskSensitiveInput, validateAiReply } from "../src/services/safetyValidator.js";
import { sessions } from "../src/services/store.js";

function expectThrows(fn, message) {
  try {
    fn();
    assert.fail(`Expected error: ${message}`);
  } catch (error) {
    assert.ok(error.message.includes(message), `Expected "${message}", got "${error.message}"`);
  }
}

const scenarios = listScenarios();
loadEnvFile();
process.env.GEMINI_API_KEY = "";
process.env.UNIT_BAD_INT = "abc";
process.env.UNIT_ZERO_INT = "0";
process.env.UNIT_GOOD_INT = "12";
assert.equal(getPositiveIntEnv("UNIT_BAD_INT", 7), 7);
assert.equal(getPositiveIntEnv("UNIT_ZERO_INT", 7), 7);
assert.equal(getPositiveIntEnv("UNIT_GOOD_INT", 7), 12);
assert.equal(scenarios.length, 3);
assert.equal(scenarios[0].id, "fake_bank");

expectThrows(
  () => confirmConsent("missing", { consent: true }),
  "Session not found",
);

const created = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
assert.equal(created.status, "created");
assert.equal(created.scenarioId, "fake_bank");
assert.equal(created.consentAt, null);
assert.equal(created.difficulty, "medium");

expectThrows(
  () => confirmConsent(created.id, { consent: false }),
  "Simulation consent is required",
);

const active = confirmConsent(created.id, { consent: true });
assert.equal(active.status, "active");
assert.ok(active.consentAt);

const loaded = getSession(created.id);
assert.equal(loaded.id, created.id);
assert.equal(loaded.status, "active");

const processingSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
confirmConsent(processingSession.id, { consent: true });
requireStoredSession(processingSession.id).isProcessing = true;
await assert.rejects(
  () => sendChatMessage(processingSession.id, { message: "Xin chào." }),
  /already being processed/,
);
requireStoredSession(processingSession.id).isProcessing = false;

const weirdNameSession = createSession({
  scenarioId: "fake_bank",
  difficulty: "medium",
  userName: "  Cô\nLan\t<script>  ",
});
assert.equal(weirdNameSession.userName, "Cô Lan <script>");

await assert.rejects(
  () => sendChatMessage(created.id, { message: "x".repeat(1001) }),
  /Message must be 1000 characters or fewer/,
);

const masked = maskSensitiveInput("mã của tôi là 123456");
assert.equal(masked.changed, true);
assert.equal(masked.masked.includes("[MASKED_OTP]"), true);

const maskedCccd = maskSensitiveInput("CCCD của tôi là 012345678901");
assert.equal(maskedCccd.changed, true);
assert.equal(maskedCccd.masked.includes("[MASKED_CCCD]"), true);

const maskedPhone = maskSensitiveInput("Số của tôi là 090 123 4567");
assert.equal(maskedPhone.changed, true);
assert.equal(maskedPhone.masked.includes("[MASKED_PHONE]"), true);
assert.equal(maskedPhone.masked.includes("[MASKED_OTP]"), false);

const maskedAccount = maskSensitiveInput("STK: 1234567890");
assert.equal(maskedAccount.changed, true);
assert.equal(maskedAccount.masked.includes("[MASKED_ACCOUNT]"), true);
assert.equal(maskedAccount.masked.includes("1234567890"), false);

const unsafeReply = validateAiReply("Bấm vào https://example.com để xác minh");
assert.equal(unsafeReply.safe, false);

const safeRefusalReply = validateAiReply("Tôi không cung cấp OTP qua chat.");
assert.equal(safeRefusalReply.safe, true);

const safePlaceholderReply = validateAiReply("Bác đọc giúp em [mã xác minh giả] trong mô phỏng.");
assert.equal(safePlaceholderReply.safe, true);
assert.equal(looksLikeScamRecognition("mã của tôi là [MASKED_OTP]"), false);
assert.equal(looksLikeScamRecognition("Tôi không cung cấp OTP qua chat."), true);

const unsafeSensitiveReply = validateAiReply("Bác đọc giúp em OTP để xác minh.");
assert.equal(unsafeSensitiveReply.safe, false);
assert.ok(unsafeSensitiveReply.reasons.includes("real_sensitive_request"));

const unsafeCccdReply = validateAiReply("CCCD của bác là 012345678901.");
assert.equal(unsafeCccdReply.safe, false);
assert.ok(unsafeCccdReply.reasons.includes("cccd"));

const unsafeAccountReply = validateAiReply("Bác chuyển vào số tài khoản 1234567890 trong mô phỏng này.");
assert.equal(unsafeAccountReply.safe, false);
assert.ok(unsafeAccountReply.reasons.includes("account_number"));

const chat = await sendChatMessage(created.id, { message: "Tôi sẽ gọi hotline chính thức để kiểm tra lại." });
assert.ok(chat.reply.length > 0);
assert.equal(chat.safety.provider, "safe_fallback");
assert.equal(chat.safety.fallbackReason, "NO_GEMINI_API_KEY");
assert.equal(chat.sessionStatus, "completed");

const transcript = getSessionMessages(created.id);
assert.equal(transcript.length, 2);
assert.equal(transcript[0].role, "user");
assert.equal(transcript[1].role, "ai");

const dashboard = getDashboard(created.id);
assert.equal(dashboard.immunityScore, 25);
assert.equal(dashboard.recognizedCount, 1);
assert.equal(dashboard.totalCount, 4);
assert.ok(dashboard.nextRecommendation.length > 0);
assert.ok(dashboard.shareSummary.includes("25/100"));
assert.equal(dashboard.recognizedRedFlags[0].key, "unofficial_channel");
assert.ok(dashboard.recognizedRedFlags[0].techniqueLabel.includes("authority"));
assert.ok(dashboard.missedRedFlags.every((flag) => flag.techniqueLabel.length > 0));
assert.ok(dashboard.missedRedFlags.every((flag) => flag.recommendation.startsWith("Pattern:")));
assert.ok(dashboard.missedRedFlags.every((flag) => !flag.recommendation.includes("Bạn nên trả lời")));

expectThrows(
  () => confirmConsent(created.id, { consent: true }),
  "Session is already completed",
);

const noConsentSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
expectThrows(
  () => getDashboard(noConsentSession.id),
  "Simulation consent is required before viewing results",
);

const otpSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
confirmConsent(otpSession.id, { consent: true });
await sendChatMessage(otpSession.id, { message: "Tôi không cung cấp OTP qua chat." });
const otpDashboard = getDashboard(otpSession.id);
assert.equal(otpDashboard.recognizedRedFlags[0].key, "request_for_sensitive_info");

const leakedOtpSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
confirmConsent(leakedOtpSession.id, { consent: true });
const leakedOtpChat = await sendChatMessage(leakedOtpSession.id, { message: "Mã của tôi là 123456" });
assert.equal(leakedOtpChat.safety.maskedSensitiveInput, true);
assert.equal(leakedOtpChat.sessionStatus, "active");
assert.equal(leakedOtpChat.detectedEvents[0].status, "triggered");

const originalFetch = globalThis.fetch;
try {
  process.env.GEMINI_API_KEY = "unit-test-key";
  globalThis.fetch = async () => new Response("upstream overloaded", { status: 500 });
  await assert.rejects(
    () => generateGeminiJson({ systemInstruction: "test", prompt: "test", schema: {} }),
    (error) => error.code === "GEMINI_HTTP_500",
  );

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: "not json" }],
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  await assert.rejects(
    () => generateGeminiJson({ systemInstruction: "test", prompt: "test", schema: {} }),
    (error) => error.code === "GEMINI_INVALID_JSON",
  );

  let repairCallCount = 0;
  globalThis.fetch = async () => {
    repairCallCount += 1;
    const unsafeSelfAssessment = repairCallCount === 1;
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: unsafeSelfAssessment
                      ? "Bác cần cung cấp mã xác minh giả lập để tiếp tục."
                      : "Mình chỉ mô phỏng tình huống, không cần bất kỳ mã hay thông tin thật nào.",
                    simulationState: {
                      status: "active",
                      reason: "continue_training",
                      shouldEnd: false,
                    },
                    redFlagSignals: [
                      {
                        key: "request_for_sensitive_info",
                        status: "triggered",
                        evidence: "Nhắc tới mã xác minh trong mô phỏng.",
                      },
                    ],
                    safetyAssessment: {
                      containsSensitiveRequest: unsafeSelfAssessment,
                      containsRealWorldInstruction: false,
                      safeToShow: true,
                      notes: unsafeSelfAssessment ? "Self-reported sensitive request." : "",
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const repairSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  confirmConsent(repairSession.id, { consent: true });
  const repairChat = await sendChatMessage(repairSession.id, { message: "Xin chào." });
  assert.equal(repairChat.safety.provider, "gemini");
  assert.equal(repairChat.safety.retryUsed, true);
  assert.equal(repairCallCount, 2);

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: "Mình tiếp tục mô phỏng an toàn.",
                    simulationState: {
                      status: "finished-but-not-valid",
                      reason: "bad_shape_test",
                      shouldEnd: "false",
                    },
                    redFlagSignals: [
                      {
                        key: "authority_pressure",
                        status: "recognized-ish",
                        evidence: "Status sai enum phải về triggered.",
                      },
                    ],
                    safetyAssessment: {
                      containsSensitiveRequest: "false",
                      containsRealWorldInstruction: "false",
                      safeToShow: "true",
                      notes: "Bad booleans should not be trusted as booleans.",
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  const badShapeSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  confirmConsent(badShapeSession.id, { consent: true });
  const badShapeChat = await sendChatMessage(badShapeSession.id, { message: "Xin chào." });
  assert.equal(badShapeChat.sessionStatus, "active");
  assert.equal(badShapeChat.detectedEvents[0].status, "triggered");

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: "Mình ghi nhận phản ứng an toàn của bạn.",
                    simulationState: {
                      status: "active",
                      reason: "dedupe_test",
                      shouldEnd: false,
                    },
                    redFlagSignals: [
                      {
                        key: "authority_pressure",
                        status: "triggered",
                        evidence: "Áp lực danh nghĩa.",
                      },
                      {
                        key: "authority_pressure",
                        status: "recognized",
                        evidence: "Người dùng đã nghi ngờ danh nghĩa.",
                      },
                    ],
                    safetyAssessment: {
                      containsSensitiveRequest: false,
                      containsRealWorldInstruction: false,
                      safeToShow: true,
                      notes: "",
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  const duplicateSignalSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  confirmConsent(duplicateSignalSession.id, { consent: true });
  const duplicateSignalChat = await sendChatMessage(duplicateSignalSession.id, { message: "Tôi nghi là giả mạo." });
  assert.equal(duplicateSignalChat.detectedEvents.length, 1);
  assert.equal(duplicateSignalChat.detectedEvents[0].key, "authority_pressure");
  assert.equal(duplicateSignalChat.detectedEvents[0].status, "recognized");

  process.env.GEMINI_API_KEY = "unit-test-key";
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reply: "Dạ bác cần xử lý qua kênh này ngay ạ.",
                    simulationState: {
                      status: "completed",
                      reason: "participant_safe_verification",
                      shouldEnd: true,
                    },
                    redFlagSignals: [
                      {
                        key: "unofficial_channel",
                        status: "triggered",
                        evidence: "Kéo người dùng sang kênh chat.",
                      },
                    ],
                    safetyAssessment: {
                      containsSensitiveRequest: false,
                      containsRealWorldInstruction: false,
                      safeToShow: true,
                      notes: "",
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  const geminiSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  confirmConsent(geminiSession.id, { consent: true });
  const geminiChat = await sendChatMessage(geminiSession.id, {
    message: "Tôi sẽ gọi hotline chính thức để kiểm tra lại.",
  });
  assert.equal(geminiChat.safety.provider, "gemini");
  const geminiDashboard = getDashboard(geminiSession.id);
  assert.equal(geminiDashboard.recognizedRedFlags[0].key, "unofficial_channel");
} finally {
  globalThis.fetch = originalFetch;
  process.env.GEMINI_API_KEY = "";
}

process.env.MAX_SESSIONS = "3";
sessions.clear();
const pruneA = createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "A" });
const pruneB = createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "B" });
const pruneC = createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "C" });
const pruneD = createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "D" });
assert.equal(getSession(pruneB.id).id, pruneB.id);
assert.equal(getSession(pruneC.id).id, pruneC.id);
assert.equal(getSession(pruneD.id).id, pruneD.id);
expectThrows(
  () => getSession(pruneA.id),
  "Session not found",
);
delete process.env.MAX_SESSIONS;

console.log("Implementation tests passed.");
