import assert from "node:assert/strict";
import { listScenarios } from "../src/services/scenarioService.js";
import {
  confirmParticipantConsent,
  createSession,
  getSession,
} from "../src/services/sessionService.js";

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

console.log("Sprint 1 tests passed.");
