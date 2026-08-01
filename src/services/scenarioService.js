import scenarios from "../data/scenarios.json" with { type: "json" };

export function listScenarios() {
  return scenarios.map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    educationalObjective: scenario.educationalObjective,
    redFlagCount: scenario.redFlags.length,
  }));
}

export function getScenario(scenarioId) {
  const scenario = scenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    const error = new Error("Scenario not found.");
    error.status = 404;
    throw error;
  }
  return scenario;
}
