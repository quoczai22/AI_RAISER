import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getScenario, listScenarios } from "../src/services/scenarioService.js";
import {
  assertSessionCapability,
  confirmConsent,
  createSession,
  generateCapability,
  getSessionMessages,
  getSession,
  hashCapability,
  requireStoredSession,
  verifySessionCapability,
} from "../src/services/sessionService.js";
import { emitValidatedReplyChunks, sendChatMessage, sendChatMessageStream } from "../src/services/chatOrchestrator.js";
import { getDashboard } from "../src/services/dashboardService.js";
import { getPositiveIntEnv, loadEnvFile } from "../src/services/env.js";
import { generateGeminiJson } from "../src/services/geminiClient.server.js";
import { looksLikeScamRecognition, maskSensitiveInput, validateAiReply } from "../src/services/safetyValidator.js";
import { getFirestoreConfig, sanitizeSessionForFirestore, sessions } from "../src/services/store.js";


console.log("Stage 1: Basic assertions");
const scenarios = listScenarios();
loadEnvFile();
process.env.GEMINI_API_KEY = "";
assert.deepEqual(getFirestoreConfig({}), null);
assert.deepEqual(getFirestoreConfig({ FIRESTORE_PROJECT_ID: "project-a" }), { projectId: "project-a" });
assert.deepEqual(
  getFirestoreConfig({ FIRESTORE_PROJECT_ID: " project-a ", FIRESTORE_DATABASE_ID: " named-db " }),
  { projectId: "project-a", databaseId: "named-db" }
);
assert.deepEqual(
  getFirestoreConfig({ ENABLE_FIRESTORE: "true", GOOGLE_CLOUD_PROJECT: "runtime-project" }),
  { projectId: "runtime-project" }
);
const firestoreDocument = sanitizeSessionForFirestore({
  id: "session-safe",
  scenarioId: "fake_bank",
  userName: "Cô Lan",
  difficulty: "medium",
  messages: [{ content: "Mã OTP của tôi là 123456" }],
  redFlagEvents: [{ redFlagKey: "authority_pressure", status: "triggered", evidenceText: "private text" }],
  score: {
    immunityScore: 25,
    recognizedCount: 1,
    totalCount: 4,
    triggeredKeys: ["authority_pressure"],
    recognizedRedFlags: [{ key: "authority_pressure", explanation: "extra field" }],
  },
});
assert.equal(firestoreDocument.userName, undefined);
assert.equal(firestoreDocument.messages, undefined);
assert.equal(firestoreDocument.redFlagEvents[0].evidenceText, undefined);
assert.equal(firestoreDocument.redFlagEvents[0].redFlagKey, "authority_pressure");
assert.equal(firestoreDocument.score.immunityScore, 25);
assert.equal(firestoreDocument.score.recognizedRedFlags, undefined);
process.env.UNIT_BAD_INT = "abc";
process.env.UNIT_ZERO_INT = "0";
process.env.UNIT_GOOD_INT = "12";
assert.equal(getPositiveIntEnv("UNIT_BAD_INT", 7), 7);
assert.equal(getPositiveIntEnv("UNIT_ZERO_INT", 7), 7);
assert.equal(getPositiveIntEnv("UNIT_GOOD_INT", 7), 12);
const publicAppSource = readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const publicCssSource = readFileSync(new URL("../src/public/app.css", import.meta.url), "utf8");
const publicIndexSource = readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");
const reactChatSource = readFileSync(new URL("../src/react-app/components/ChatShell.jsx", import.meta.url), "utf8");
assert.equal(publicAppSource.includes('|| "social engineering"'), false);
assert.equal(publicAppSource.includes("aisi_accessibility"), true);
assert.equal(publicAppSource.includes("large-text-toggle"), true);
assert.equal(publicAppSource.includes("high-contrast-toggle"), true);
assert.equal(publicAppSource.includes("Không cần mật khẩu, không cần OTP, không trừ tiền."), true);
assert.equal(publicAppSource.includes("Hủy bỏ / Quay lại"), true);
assert.equal(publicAppSource.includes("quota/rate limit"), false);
assert.equal(publicAppSource.includes(">Copy "), false);
assert.equal(publicAppSource.includes(">Dashboard<"), false);
assert.equal(publicCssSource.includes("body.large-text"), true);
assert.equal(publicCssSource.includes("body.high-contrast"), true);
assert.equal(publicCssSource.includes("min-height: 56px"), true);
assert.equal(publicCssSource.includes("button:active"), true);
assert.equal(publicCssSource.includes("@media (max-width: 520px)"), true);
assert.equal(publicCssSource.includes("min-height: 64px"), true);
assert.equal(publicCssSource.includes(".chat-screen .app-header"), true);
assert.equal(publicCssSource.includes("height: 100dvh"), true);
assert.equal(publicCssSource.includes("grid-template-columns: 1fr 1fr"), true);
assert.equal(publicCssSource.includes(".skip-link"), true);
assert.equal(publicCssSource.includes(".sr-only"), true);
assert.equal(publicIndexSource.includes('href="#app"'), true);
assert.equal(publicIndexSource.includes('role="status"'), true);
assert.equal(scenarios.length, 10);
assert.ok(scenarios.some((s) => s.id === "ecommerce_refund"));
assert.ok(scenarios.some((s) => s.id === "vneid"));
assert.equal(scenarios[0].id, "fake_bank");
assert.ok(scenarios.some((scenario) => scenario.id === "fake_job"));
const fakeJobSummary = scenarios.find((scenario) => scenario.id === "fake_job");
assert.equal(fakeJobSummary.redFlagCount, 5);
const fakeJobScenario = getScenario("fake_job");
assert.equal(fakeJobScenario.redFlags.length, 5);
assert.ok(fakeJobScenario.redFlags.some((flag) => flag.key === "job_vague_description"));
assert.ok(fakeJobScenario.redFlags.some((flag) => flag.key === "unofficial_recruitment_channel"));
assert.ok(fakeJobScenario.redFlags.some((flag) => flag.key === "urgent_departure_pressure"));
assert.ok(fakeJobScenario.redFlags.some((flag) => flag.key === "no_clear_contract"));
assert.ok(fakeJobScenario.redFlags.some((flag) => flag.key === "illegal_border_crossing_offer"));

// Verify travel_sales and gym_sales have DISTINCT red flag sets
const travelScenario = getScenario("travel_sales");
const gymScenario = getScenario("gym_sales");
assert.ok(travelScenario.redFlags.some((flag) => flag.key === "travel_scarcity_pressure"));
assert.ok(gymScenario.redFlags.some((flag) => flag.key === "gym_hidden_credit_trap"));
const travelKeys = new Set(travelScenario.redFlags.map((f) => f.key));
const gymKeys = new Set(gymScenario.redFlags.map((f) => f.key));
const intersection = [...travelKeys].filter((key) => gymKeys.has(key));
assert.equal(intersection.length, 0, "travel_sales and gym_sales must have completely distinct red flag keys");
const fakePoliceScenario = getScenario("fake_police");
assert.equal(fakePoliceScenario.redFlags.length, 3);
assert.ok(fakePoliceScenario.redFlags.some((flag) => flag.key === "police_authority"));
assert.ok(fakePoliceScenario.redFlags.some((flag) => flag.key === "police_fear"));
assert.ok(fakePoliceScenario.redFlags.some((flag) => flag.key === "police_urgency"));
assert.equal(
  scenarios.some((scenario) =>
    scenario.allowedTactics?.some((tactic) => /khuyến khích.*kiểm tra qua kênh không chính thức/i.test(tactic)),
  ),
  false,
);

console.log("Stage 2: Session & Consent");
await sessions.clear();
await assert.rejects(
  () => confirmConsent("missing", { consent: true }),
  /Session not found/
);

const created = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
assert.equal(created.status, "created");
assert.equal(created.scenarioId, "fake_bank");
assert.equal(created.consentAt, null);
assert.equal(created.difficulty, "medium");

await assert.rejects(
  () => confirmConsent(created.id, { consent: false }),
  /Simulation consent is required/
);

const active = await confirmConsent(created.id, { consent: true });
assert.equal(active.status, "active");
assert.ok(active.consentAt);

const loaded = await getSession(created.id);
assert.equal(loaded.id, created.id);
assert.equal(loaded.status, "active");

const processingSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
await confirmConsent(processingSession.id, { consent: true });
const s = await requireStoredSession(processingSession.id);
s.isProcessing = true;
s.updatedAt = new Date().toISOString();
await sessions.set(s.id, s);
await assert.rejects(
  () => sendChatMessage(processingSession.id, { message: "Xin chào." }),
  /already being processed/,
);
const s2 = await requireStoredSession(processingSession.id);
s2.isProcessing = false;
await sessions.set(s2.id, s2);

const weirdNameSession = await createSession({
  scenarioId: "fake_bank",
  difficulty: "medium",
  userName: "  Cô\nLan\t<script>  ",
});
assert.equal(weirdNameSession.userName, "Cô Lan <script>");

await assert.rejects(
  () => sendChatMessage(created.id, { message: "x".repeat(1001) }),
  /Message must be 1000 characters or fewer/,
);

console.log("Stage 3: Chat & Safety");
const case1 = maskSensitiveInput("Mã đơn hàng 123456");
assert.equal(case1.changed, false, "Mã đơn hàng 123456 must NOT be masked");
assert.equal(case1.masked, "Mã đơn hàng 123456");

const case2 = maskSensitiveInput("Số biên nhận 123456");
assert.equal(case2.changed, false, "Số biên nhận 123456 must NOT be masked");
assert.equal(case2.masked, "Số biên nhận 123456");

const case3 = maskSensitiveInput("Mã OTP của bạn là 123456");
assert.equal(case3.changed, true, "Mã OTP của bạn là 123456 MUST be masked");
assert.equal(case3.masked, "Mã OTP [MASKED_OTP]");

const case4 = maskSensitiveInput("Mã xác nhận 123456");
assert.equal(case4.changed, true, "Mã xác nhận 123456 MUST be masked");
assert.equal(case4.masked, "Mã xác nhận [MASKED_OTP]");

const case5 = maskSensitiveInput("Mã bảo mật 123456");
assert.equal(case5.changed, true, "Mã bảo mật 123456 MUST be masked");
assert.equal(case5.masked, "Mã bảo mật [MASKED_OTP]");

const case6 = maskSensitiveInput("123456");
assert.equal(case6.changed, false, "123456 standalone must NOT be masked");
assert.equal(case6.masked, "123456");

const case7 = maskSensitiveInput("Năm 2026");
assert.equal(case7.changed, false, "Năm 2026 must NOT be masked");
assert.equal(case7.masked, "Năm 2026");

const case8 = maskSensitiveInput("500000 VNĐ");
assert.equal(case8.changed, false, "500000 VNĐ must NOT be masked");
assert.equal(case8.masked, "500000 VNĐ");

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
assert.equal(maskedAccount.masked.includes("$1"), false);
assert.equal(maskedAccount.masked.includes("STK [MASKED_ACCOUNT]"), true);

const maskedLongAccount = maskSensitiveInput("số tài khoản 1234567890123");
assert.equal(maskedLongAccount.changed, true);
assert.equal(maskedLongAccount.masked.includes("[MASKED_ACCOUNT]"), true);
assert.equal(maskedLongAccount.masked.includes("[MASKED_CARD]"), false);
assert.equal(maskedLongAccount.detected.includes("account"), true);

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

const fallbackBankSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Fallback Bank" });
await confirmConsent(fallbackBankSession.id, { consent: true });
const fallbackBankChat = await sendChatMessage(fallbackBankSession.id, { message: "Tôi đang bận, nhắn sau nhé." });
assert.equal(fallbackBankChat.safety.provider, "safe_fallback");
assert.match(fallbackBankChat.reply, /thời hạn xử lý|hối bác quyết định nhanh/i);
assert.equal(validateAiReply(fallbackBankChat.reply).safe, true);

const fallbackJobSession = await createSession({ scenarioId: "fake_job", difficulty: "medium", userName: "Fallback Job" });
await confirmConsent(fallbackJobSession.id, { consent: true });
const fallbackJobChat = await sendChatMessage(fallbackJobSession.id, { message: "Công ty này làm gì vậy?" });
assert.equal(fallbackJobChat.safety.provider, "safe_fallback");
assert.match(fallbackJobChat.reply, /tuyển dụng|cơ hội|thu nhập/i);
assert.equal(validateAiReply(fallbackJobChat.reply).safe, true);

const transcript = await getSessionMessages(created.id);
assert.equal(transcript.length, 2);
assert.equal(transcript[0].role, "user");
assert.equal(transcript[1].role, "ai");

const dashboard = await getDashboard(created.id);
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
const allowedFeedbackTechniques = new Set(["urgency", "authority", "fear", "social proof/reciprocity", "scarcity"]);
for (const flag of [...dashboard.recognizedRedFlags, ...dashboard.missedRedFlags]) {
  for (const part of flag.technique.split("+").map((item) => item.trim())) {
    assert.ok(allowedFeedbackTechniques.has(part), `Unexpected feedback technique: ${part}`);
  }
}

await assert.rejects(
  () => confirmConsent(created.id, { consent: true }),
  /Session is already completed/
);
await assert.rejects(
  () => sendChatMessage(created.id, { message: "Tôi muốn nhắn tiếp." }),
  /Session is already completed/,
);

const noConsentSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
await assert.rejects(
  () => getDashboard(noConsentSession.id),
  /Simulation consent is required before viewing results/
);
await assert.rejects(
  () => getSessionMessages(noConsentSession.id),
  /Simulation consent is required before viewing results/
);

const activeDashboardSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
await confirmConsent(activeDashboardSession.id, { consent: true });
await assert.rejects(
  () => getDashboard(activeDashboardSession.id),
  /Session must be completed before viewing results/
);

const otpSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
await confirmConsent(otpSession.id, { consent: true });
await sendChatMessage(otpSession.id, { message: "Tôi không cung cấp OTP qua chat." });
const otpDashboard = await getDashboard(otpSession.id);
assert.equal(otpDashboard.recognizedRedFlags[0].key, "request_for_sensitive_info");

const leakedOtpSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
await confirmConsent(leakedOtpSession.id, { consent: true });
const leakedOtpChat = await sendChatMessage(leakedOtpSession.id, { message: "Mã OTP: 123456" });
assert.equal(leakedOtpChat.safety.maskedSensitiveInput, true);
assert.equal(leakedOtpChat.sessionStatus, "active");
assert.equal(leakedOtpChat.detectedEvents[0].status, "triggered");

const originalFetch = globalThis.fetch;
function setGeminiMock(handler) {
  globalThis.fetch = async (url, ...args) => {
    const urlStr = typeof url === "string" ? url : url?.url || "";
    if (urlStr.includes("generativelanguage.googleapis.com")) {
      return handler(url, ...args);
    }
    return originalFetch(url, ...args);
  };
}

try {
  process.env.GEMINI_API_KEY = "unit-test-key";
  setGeminiMock(async () => new Response("upstream overloaded", { status: 500 }));
  await assert.rejects(
    () => generateGeminiJson({ systemInstruction: "test", prompt: "test", schema: {} }),
    (error) => error.code === "GEMINI_HTTP_500",
  );

  setGeminiMock(async () =>
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
    ));
  await assert.rejects(
    () => generateGeminiJson({ systemInstruction: "test", prompt: "test", schema: {} }),
    (error) => error.code === "GEMINI_INVALID_JSON",
  );

  let repairCallCount = 0;
  setGeminiMock(async () => {
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
  });

  const repairSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  await confirmConsent(repairSession.id, { consent: true });
  const repairChat = await sendChatMessage(repairSession.id, { message: "Xin chào." });
  assert.equal(repairChat.safety.provider, "gemini");
  assert.equal(repairChat.safety.retryUsed, true);
  assert.equal(repairCallCount, 2);

  setGeminiMock(async () =>
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
    ));

  const badShapeSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  await confirmConsent(badShapeSession.id, { consent: true });
  const badShapeChat = await sendChatMessage(badShapeSession.id, { message: "Xin chào." });
  assert.equal(badShapeChat.sessionStatus, "active");
  assert.equal(badShapeChat.detectedEvents[0].status, "triggered");

  setGeminiMock(async () =>
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
    ));

  const duplicateSignalSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  await confirmConsent(duplicateSignalSession.id, { consent: true });
  const duplicateSignalChat = await sendChatMessage(duplicateSignalSession.id, { message: "Tôi nghi là giả mạo." });
  assert.equal(duplicateSignalChat.detectedEvents.length, 1);
  assert.equal(duplicateSignalChat.detectedEvents[0].key, "authority_pressure");
  assert.equal(duplicateSignalChat.detectedEvents[0].status, "recognized");

  process.env.GEMINI_API_KEY = "unit-test-key";
  setGeminiMock(async () =>
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
    ));

  const geminiSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "Cô Lan" });
  await confirmConsent(geminiSession.id, { consent: true });
  const geminiChat = await sendChatMessage(geminiSession.id, {
    message: "Tôi sẽ gọi hotline chính thức để kiểm tra lại.",
  });
  assert.equal(geminiChat.safety.provider, "gemini");
  const geminiDashboard = await getDashboard(geminiSession.id);
  assert.equal(geminiDashboard.recognizedRedFlags[0].key, "unofficial_channel");
} finally {
  globalThis.fetch = originalFetch;
  process.env.GEMINI_API_KEY = "";
}

process.env.MAX_SESSIONS = "3";
await sessions.clear();
const pruneA = await createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "A" });
const pruneB = await createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "B" });
const pruneC = await createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "C" });
const pruneD = await createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "D" });
assert.equal((await getSession(pruneB.id)).id, pruneB.id);
assert.equal((await getSession(pruneC.id)).id, pruneC.id);
assert.equal((await getSession(pruneD.id)).id, pruneD.id);
await assert.rejects(
  () => getSession(pruneA.id),
  /Session not found/
);
delete process.env.MAX_SESSIONS;

// Regression test for copy-on-read behavior
const regressionSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "CopyTest" });
const retrievedSession1 = await sessions.get(regressionSession.id);
retrievedSession1.userName = "MutatedNameDirectly";
const retrievedSession2 = await sessions.get(regressionSession.id);
assert.notEqual(retrievedSession2.userName, "MutatedNameDirectly", "Mutating a retrieved session must not mutate the stored session");

// Verify that sendChatMessage explicitly persists the session
const chatSession = await createSession({ scenarioId: "fake_bank", difficulty: "easy", userName: "PersistTest" });
await confirmConsent(chatSession.id, { consent: true });
const initialData = await sessions.get(chatSession.id);
assert.equal(initialData.messages.length, 0);

await sendChatMessage(chatSession.id, { message: "Hello." });
const afterChatData = await sessions.get(chatSession.id);
assert.equal(afterChatData.messages.length, 2, "sendChatMessage must explicitly persist the session updates");

// Progressive rendering runs only after full-reply validation.
for (const unsafeReply of [
  "Mã OTP: 123456",
  "Hãy gọi 0901234567",
  "Mở https://example.com ngay",
]) {
  const unsafeChunks = [];
  const unsafeResult = await emitValidatedReplyChunks(unsafeReply, {
    onChunk: (text) => unsafeChunks.push(text),
    chunkDelayMs: 0,
  });
  assert.equal(unsafeResult.emitted, false, `${unsafeReply} must be blocked before any chunk is emitted`);
  assert.deepEqual(unsafeChunks, [], `${unsafeReply} must never reach the UI callback`);
}

const safeChunks = [];
const safeReply = "Hãy dừng lại và xác minh qua kênh chính thức.";
const safeResult = await emitValidatedReplyChunks(safeReply, {
  onChunk: (text) => safeChunks.push(text),
  chunkDelayMs: 0,
});
assert.equal(safeResult.emitted, true);
assert.equal(safeChunks.join(""), safeReply);

let cancelRequested = false;
const cancelledChunks = [];
const cancelledResult = await emitValidatedReplyChunks("Đây là nội dung an toàn nhưng sẽ bị dừng.", {
  onChunk: (text) => {
    cancelledChunks.push(text);
    cancelRequested = true;
  },
  isCancelled: () => cancelRequested,
  chunkDelayMs: 0,
});
assert.equal(cancelledResult.cancelled, true);
assert.equal(cancelledChunks.length, 1, "No later chunk may be emitted after cancellation");
assert.equal(reactChatSource.includes("new AbortController()"), true);
assert.equal(reactChatSource.includes("chatRequestControllerRef.current?.abort()"), true);

const cancelledStreamSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "CancelUser" });
await confirmConsent(cancelledStreamSession.id, { consent: true });
let cancelledStreamChunkCount = 0;
let cancelledStreamDone = false;
await sendChatMessageStream(cancelledStreamSession.id, { message: "Dừng phiên đang gửi." }, {
  onChunk: () => { cancelledStreamChunkCount += 1; },
  onDone: () => { cancelledStreamDone = true; },
  isCancelled: () => true,
  chunkDelayMs: 0,
});
assert.equal(cancelledStreamChunkCount, 0);
assert.equal(cancelledStreamDone, false);
assert.equal((await getSession(cancelledStreamSession.id)).status, "completed");

const streamSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "StreamUser" });
await confirmConsent(streamSession.id, { consent: true });
let chunkReceived = "";
let doneReceived = null;
await sendChatMessageStream(streamSession.id, { message: "Xin chào mô phỏng." }, {
  onChunk: (text) => { chunkReceived += text; },
  onDone: (res) => { doneReceived = res; },
  chunkDelayMs: 0,
});
assert.ok(chunkReceived.length > 0, "onChunk must receive text during streaming");
assert.ok(doneReceived && doneReceived.reply, "onDone must receive final result");
assert.equal(chunkReceived, doneReceived.reply, "Only the fully validated final reply may be progressively rendered");
assert.equal(doneReceived.safety.provider, "safe_fallback");
assert.equal(
  reactChatSource.includes("message.streaming && !message.content ? 'AI đang trả lời...' : message.content"),
  true,
  "The pending label must share the streaming bubble and disappear as soon as text arrives",
);
assert.equal(
  reactChatSource.includes('{isSending ? (\n              <div className="bubble ai typing"'),
  false,
  "The UI must not render a second typing bubble beside the progressive reply",
);

// Verify model lock remains enforced after the progressive-rendering change.
process.env.GEMINI_MODEL = "forbidden-model-name";
await assert.rejects(
  () => generateGeminiJson({ systemInstruction: "", prompt: "", schema: {} }),
  /Forbidden model/,
);
process.env.GEMINI_MODEL = "gemini-3.6-flash";

console.log("Stage 4: Regression tests");
// TASK-036 Regression Tests: firestore.rules default-deny & client code isolation
const firestoreRulesSource = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
assert.equal(firestoreRulesSource.includes("rules_version = '2';"), true, "firestore.rules must include rules_version = '2';");
assert.equal(firestoreRulesSource.includes("allow read, write: if false;"), true, "firestore.rules must include default deny allow read, write: if false;");
assert.equal(firestoreRulesSource.includes("match /sessions/{sessionId}"), true, "firestore.rules must match sessions collection");
assert.equal(firestoreRulesSource.includes("allow read, write: if true"), false, "firestore.rules MUST NOT contain allow read, write: if true");
assert.equal(firestoreRulesSource.includes("allow read: if true"), false, "firestore.rules MUST NOT contain allow read: if true");
assert.equal(firestoreRulesSource.includes("allow write: if true"), false, "firestore.rules MUST NOT contain allow write: if true");

const reactAppFiles = [
  "../src/react-app/App.jsx",
  "../src/react-app/main.jsx",
  "../src/react-app/components/AppShell.jsx",
  "../src/react-app/components/ChatShell.jsx",
  "../src/react-app/components/Dashboard.jsx",
  "../src/react-app/components/EntryForm.jsx",
  "../src/react-app/components/Hotlines.jsx",
  "../src/react-app/components/ResultScorecard.jsx",
  "../src/react-app/components/ScenarioPicker.jsx",
  "../src/react-app/components/ShareCard.jsx",
  "../src/react-app/components/SimulationConsent.jsx",
  "../src/public/app.js",
];

for (const relPath of reactAppFiles) {
  const content = readFileSync(new URL(relPath, import.meta.url), "utf8");
  assert.equal(/firebase|firestore/i.test(content), false, `Client file ${relPath} MUST NOT reference firebase or firestore`);
}

// TASK-036: Test FirestoreStore error handling and fallback
const testStore = new sessions.constructor();
testStore.useFirestore = true;
testStore.collection = {
  doc: () => ({
    set: async () => { throw new Error("Permission Denied (Security Rules Test)"); },
    get: async () => { throw new Error("Permission Denied (Security Rules Test)"); },
    delete: async () => { throw new Error("Permission Denied (Security Rules Test)"); },
  }),
};

await assert.rejects(
  () => testStore.set("test-fail-id", { id: "test-fail-id" }),
  /Permission Denied/,
  "Firestore set failure must throw an exception and not silently succeed"
);
assert.equal(testStore.inMemoryMap.has("test-fail-id"), false, "Failed Firestore write must not pollute in-memory map");

await assert.rejects(
  () => testStore.get("test-fail-id"),
  /Permission Denied/,
  "Firestore get failure must throw an exception"
);

const localStore = new sessions.constructor({});
assert.equal(localStore.useFirestore, false);
await localStore.set("local-id", { id: "local-id", scenarioId: "fake_bank" });
const retrievedLocal = await localStore.get("local-id");
assert.equal(retrievedLocal.id, "local-id");

console.log("Stage 5: TASK-042 Capability tests");
// TASK-042: Anonymous session capability & isolation tests
const testCap = generateCapability();
assert.equal(typeof testCap, "string");
assert.equal(testCap.length, 64, "Capability must be 32 random bytes in hex (64 chars)");
const testCapHash = hashCapability(testCap);
assert.equal(testCapHash.length, 64, "Capability hash must be 64 char sha256 hex");

const dummySession = {
  id: "session-cap-test",
  sessionCapabilityHash: testCapHash,
};
assert.equal(verifySessionCapability(dummySession, testCap), true, "Valid capability must verify");
assert.equal(verifySessionCapability(dummySession, "wrong-capability-string"), false, "Wrong capability must fail");
assert.equal(verifySessionCapability(dummySession, ""), false, "Empty capability must fail");
assert.equal(verifySessionCapability(dummySession, null), false, "Null capability must fail");
assert.equal(verifySessionCapability({}, testCap), false, "Session without hash must fail");

// Test createSession creates capability and returns it only once
const capSession = await createSession({ scenarioId: "fake_bank", difficulty: "medium", userName: "CapUser" });
assert.ok(capSession.capability, "createSession must return raw capability");
assert.equal(capSession.capability.length, 64);
const { capability: rawCap, ...publicSummary } = capSession;
assert.equal(publicSummary.capability, undefined, "publicSummary must NOT contain capability");
assert.equal(publicSummary.sessionCapabilityHash, undefined, "publicSummary must NOT contain sessionCapabilityHash");

const storedCapSession = await requireStoredSession(capSession.id);
assert.equal(storedCapSession.capability, undefined, "Stored session must NOT store raw capability");
assert.ok(storedCapSession.sessionCapabilityHash, "Stored session MUST store capability hash");
assert.equal(storedCapSession.sessionCapabilityHash, hashCapability(capSession.capability));

const readSession = await getSession(capSession.id);
assert.equal(readSession.capability, undefined, "getSession summary must NOT include raw capability");
assert.equal(readSession.sessionCapabilityHash, undefined, "getSession summary must NOT include hash");

// Verify frontend only reads data.capability and has no fallback to session capability
const reactAppCode = readFileSync(new URL("../src/react-app/App.jsx", import.meta.url), "utf8");
const legacyAppCode = readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

assert.ok(reactAppCode.includes("const cap = data.capability;"), "App.jsx must contain exactly 'const cap = data.capability;'");

// Regex must fail if there is any (sess|session)?.capability or (data|sess|session).session?.capability
const forbiddenAccessRegex = /\b(sess|session)\??\.capability\b|\bdata\??\.session\??\.capability\b/;
assert.equal(forbiddenAccessRegex.test(reactAppCode), false, "App.jsx must not have (sess|session)?.capability or data.session.capability access");
assert.equal(forbiddenAccessRegex.test(legacyAppCode), false, "app.js must not have (sess|session)?.capability or data.session.capability access");

// Test assertSessionCapability behavior
await assert.rejects(
  () => assertSessionCapability(capSession.id, ""),
  (err) => err.status === 403,
  "Missing capability must throw 403"
);
await assert.rejects(
  () => assertSessionCapability(capSession.id, "invalid_cap_hex_string_12345678901234567890123456789012345678901234"),
  (err) => err.status === 403,
  "Wrong capability must throw 403"
);
await assert.rejects(
  () => assertSessionCapability("non_existent_session_id", "valid_looking_cap_hex_string_123456789012345678901234567890123456"),
  (err) => err.status === 404,
  "Non-existent session with capability must throw 404"
);
const asserted = await assertSessionCapability(capSession.id, capSession.capability);
assert.equal(asserted.id, capSession.id, "Valid capability must assert successfully");

// TASK-043: History navigation must never construct #dashboard/undefined.
const chatShellCode = readFileSync(new URL("../src/react-app/components/ChatShell.jsx", import.meta.url), "utf8");
const dashboardCode = readFileSync(new URL("../src/react-app/components/Dashboard.jsx", import.meta.url), "utf8");
assert.ok(
  chatShellCode.includes("const historyItem = { ...data, id: data.sessionId }"),
  "Completed session history must normalize sessionId to id"
);
assert.ok(
  dashboardCode.includes("history[0]?.id || history[0]?.sessionId"),
  "Dashboard must accept both id and sessionId history shapes"
);
assert.equal(
  dashboardCode.includes("dashboard/${history[0].id}"),
  false,
  "Dashboard must not navigate with an unchecked history id"
);

const resultScorecardCode = readFileSync(new URL("../src/react-app/components/ResultScorecard.jsx", import.meta.url), "utf8");
const shareCardCode = readFileSync(new URL("../src/react-app/components/ShareCard.jsx", import.meta.url), "utf8");
const protectedSessionMessage = "Kết quả này chỉ mở được trên thiết bị đã thực hiện buổi luyện tập.";
assert.ok(resultScorecardCode.includes(protectedSessionMessage), "Result scorecard must explain missing session access");
assert.ok(shareCardCode.includes(protectedSessionMessage), "Share card must explain missing session access");
assert.ok(shareCardCode.includes("url.hash = '';"), "Shared links must not expose a private session route");
assert.ok(shareCardCode.includes("fullscreenApplet"), "AI Studio shared links must open the app fullscreen");

console.log("Implementation tests passed.");
process.exit(0);
