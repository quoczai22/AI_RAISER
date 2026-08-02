import assert from "node:assert/strict";
import { listScenarios } from "../src/services/scenarioService.js";
import {
  confirmConsent,
  createSession,
  getSessionMessages,
  getSession,
} from "../src/services/sessionService.js";
import { sendChatMessage } from "../src/services/chatOrchestrator.js";
import { getDashboard } from "../src/services/dashboardService.js";
import { getPositiveIntEnv, loadEnvFile } from "../src/services/env.js";
import { generateGeminiJson } from "../src/services/geminiClient.server.js";
import { maskSensitiveInput, validateAiReply } from "../src/services/safetyValidator.js";

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

const unsafeReply = validateAiReply("Bấm vào https://example.com để xác minh");
assert.equal(unsafeReply.safe, false);

const safeRefusalReply = validateAiReply("Tôi không cung cấp OTP qua chat.");
assert.equal(safeRefusalReply.safe, true);

const safePlaceholderReply = validateAiReply("Bác đọc giúp em [mã xác minh giả] trong mô phỏng.");
assert.equal(safePlaceholderReply.safe, true);

const unsafeSensitiveReply = validateAiReply("Bác đọc giúp em OTP để xác minh.");
assert.equal(unsafeSensitiveReply.safe, false);
assert.ok(unsafeSensitiveReply.reasons.includes("real_sensitive_request"));

const unsafeCccdReply = validateAiReply("CCCD của bác là 012345678901.");
assert.equal(unsafeCccdReply.safe, false);
assert.ok(unsafeCccdReply.reasons.includes("cccd"));

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

const otpSession = createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
confirmConsent(otpSession.id, { consent: true });
await sendChatMessage(otpSession.id, { message: "Tôi không cung cấp OTP qua chat." });
const otpDashboard = getDashboard(otpSession.id);
assert.equal(otpDashboard.recognizedRedFlags[0].key, "request_for_sensitive_info");

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

console.log("Implementation tests passed.");
