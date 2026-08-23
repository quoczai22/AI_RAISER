export function getSessionCapability(sessionId) {
  if (!sessionId) return '';
  try {
    return localStorage.getItem(`aisi_cap_${sessionId}`) || '';
  } catch {
    return '';
  }
}

export function setSessionCapability(sessionId, capability) {
  if (!sessionId || !capability) return;
  try {
    localStorage.setItem(`aisi_cap_${sessionId}`, capability);
  } catch {}
}
