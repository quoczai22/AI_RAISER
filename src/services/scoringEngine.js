export function calculateScore({ session, scenario }) {
  const totalCount = scenario.redFlags.length;
  const recognizedKeys = new Set(
    session.redFlagEvents
      .filter((event) => event.status === "recognized")
      .map((event) => event.redFlagKey),
  );

  const triggeredKeys = new Set(
    session.redFlagEvents
      .filter((event) => event.status === "triggered" || event.status === "recognized")
      .map((event) => event.redFlagKey),
  );

  const recognizedCount = recognizedKeys.size;
  const immunityScore = totalCount === 0 ? 0 : Math.round((recognizedCount / totalCount) * 100);

  const recognizedRedFlags = scenario.redFlags.filter((flag) => recognizedKeys.has(flag.key));
  const missedRedFlags = scenario.redFlags.filter((flag) => !recognizedKeys.has(flag.key));

  return {
    recognizedCount,
    totalCount,
    immunityScore,
    recognizedRedFlags,
    missedRedFlags,
    triggeredKeys: Array.from(triggeredKeys),
    createdAt: new Date().toISOString(),
  };
}
