import assert from "node:assert/strict";
import { listScenarios } from "../src/services/scenarioService.js";
import {
  confirmParticipantConsent,
  createSession,
  getSession,
} from "../src/services/sessionService.js";
import { sendChatMessage } from "../src/services/chatOrchestrator.js";
import { getDashboard } from "../src/services/dashboardService.js";
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
assert.equal(scenarios.length, 3);
assert.equal(scenarios[0].id, "fake_bank");

expectThrows(
  () => createSession({ scenarioId: "fake_bank", inviterConsent: false }),
  "Inviter consent is required",
);

const created = createSession({ scenarioId: "fake_bank", inviterConsent: true });
assert.equal(created.status, "created");
assert.equal(created.scenarioId, "fake_bank");
assert.equal(created.participantConsentAt, null);

expectThrows(
  () => confirmParticipantConsent(created.id, { participantConsent: false }),
  "Participant consent is required",
);

const active = confirmParticipantConsent(created.id, { participantConsent: true });
assert.equal(active.status, "active");
assert.ok(active.participantConsentAt);

const loaded = getSession(created.id);
assert.equal(loaded.id, created.id);
assert.equal(loaded.status, "active");

const masked = maskSensitiveInput("mã của tôi là 123456");
assert.equal(masked.changed, true);
assert.equal(masked.masked.includes("[MASKED_OTP]"), true);

const unsafeReply = validateAiReply("Bấm vào https://example.com để xác minh");
assert.equal(unsafeReply.safe, false);

const chat = await sendChatMessage(created.id, { message: "Tôi sẽ gọi hotline chính thức để kiểm tra lại." });
assert.ok(chat.reply.length > 0);
assert.equal(chat.safety.provider, "safe_fallback");
assert.equal(chat.sessionStatus, "completed");

const dashboard = getDashboard(created.id);
assert.equal(dashboard.immunityScore, 25);
assert.equal(dashboard.recognizedCount, 1);
assert.equal(dashboard.totalCount, 4);
assert.ok(dashboard.nextRecommendation.length > 0);

console.log("Implementation tests passed.");
