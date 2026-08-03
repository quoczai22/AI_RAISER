const app = document.querySelector("#app");
const statusRegion = document.querySelector("#status-region");

const state = {
  scenarios: [],
  selectedScenario: null,
  session: null,
  messages: [],
  safetyNotices: [],
  isSending: false,
  runtime: {
    maxMessageLength: 1000,
  },
  accessibility: loadAccessibilitySettings(),
  userName: safeStorageGet("aisi_user_name") || "",
  history: loadHistory(),
};

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return false;
  }
  return true;
}

function safeStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return false;
  }
  return true;
}

function loadHistory() {
  try {
    const parsed = JSON.parse(safeStorageGet("aisi_history") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    safeStorageRemove("aisi_history");
    return [];
  }
}

function loadAccessibilitySettings() {
  try {
    const parsed = JSON.parse(safeStorageGet("aisi_accessibility") || "{}");
    return {
      largeText: parsed.largeText === true,
      highContrast: parsed.highContrast === true,
    };
  } catch {
    safeStorageRemove("aisi_accessibility");
    return {
      largeText: false,
      highContrast: false,
    };
  }
}

function saveAccessibilitySettings() {
  safeStorageSet("aisi_accessibility", JSON.stringify(state.accessibility));
}

function applyAccessibilitySettings() {
  document.body.classList.toggle("large-text", state.accessibility.largeText);
  document.body.classList.toggle("high-contrast", state.accessibility.highContrast);
}

function acknowledgeTap() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const rawText = await response.text();
  let payload = {};
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = { error: rawText || "Invalid server response." };
  }
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

function scenarioById(id) {
  return state.scenarios.find((scenario) => scenario.id === id);
}

function render(content, options = {}) {
  applyAccessibilitySettings();
  document.body.classList.toggle("chat-screen", options.chatScreen === true);
  app.innerHTML = content;
  app.focus({ preventScroll: true });
}

function announceStatus(message) {
  if (statusRegion) {
    statusRegion.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function maskSensitiveForDisplay(value) {
  let masked = String(value || "");
  masked = masked.replace(/\b(số tài khoản|stk|tài khoản)\s*[:=]?\s*(?:\d[\s.-]?){6,19}\b/gi, "$1 [MASKED_ACCOUNT]");
  masked = masked.replace(/\b\d{12}\b/g, "[MASKED_CCCD]");
  masked = masked.replace(/\b(?:\d[ -]?){13,19}\b/g, "[MASKED_CARD]");
  masked = masked.replace(/\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/g, "[MASKED_PHONE]");
  masked = masked.replace(/\b\d{4,8}\b/g, "[MASKED_OTP]");
  masked = masked.replace(/(mật khẩu|password)\s*[:=]?\s*\S+/gi, "$1 [MASKED_PASSWORD]");
  return {
    masked,
    changed: masked !== String(value || ""),
  };
}

async function loadScenarios() {
  const [scenarioPayload, runtimePayload] = await Promise.all([
    api("/api/scenarios"),
    api("/api/runtime-status"),
  ]);
  state.scenarios = scenarioPayload.scenarios;
  state.runtime = {
    ...state.runtime,
    ...runtimePayload,
  };
  routeFromHash();
}

function renderEntryDashboard() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Trang chính của bạn</h2>
        <p class="subtitle">Không cần mật khẩu, không cần OTP, không trừ tiền.</p>
      </div>
      <div class="notice">
        Đây là phần tự luyện tập. Bạn có thể nhấn "Quay lại" bất cứ lúc nào.
      </div>
      <div class="accessibility-panel" aria-label="Tùy chọn hiển thị">
        <label class="toggle-row">
          <input id="large-text-toggle" type="checkbox" ${state.accessibility.largeText ? "checked" : ""}>
          <span>Chữ to</span>
        </label>
        <label class="toggle-row">
          <input id="high-contrast-toggle" type="checkbox" ${state.accessibility.highContrast ? "checked" : ""}>
          <span>Tương phản cao</span>
        </label>
      </div>
      <label class="stack">
        <strong>Tên hiển thị</strong>
        <input id="user-name" value="${escapeHtml(state.userName)}" maxlength="40" autocomplete="off" placeholder="Ví dụ: Cô Lan" aria-label="Tên hiển thị">
      </label>
      <div class="entry-actions">
        <button id="start-training"><span aria-hidden="true">▶</span> Bắt đầu luyện tập</button>
      </div>
      <h3>Lịch sử luyện tập</h3>
      <ul class="flag-list">
        ${state.history.length === 0 ? '<li class="flag-item">Chưa có buổi luyện nào.</li>' : state.history.map((item) => `
          <li class="flag-item success">
            <strong>${escapeHtml(item.scenarioTitle)}</strong><br>
            Điểm: ${item.immunityScore}/100 - ${escapeHtml(item.createdAt)}
          </li>
        `).join("")}
      </ul>
    </section>
  `);


  app.querySelector("#large-text-toggle").addEventListener("change", (event) => {
    state.accessibility.largeText = event.target.checked;
    saveAccessibilitySettings();
    applyAccessibilitySettings();
    announceStatus(event.target.checked ? "Đã bật chữ to." : "Đã tắt chữ to.");
  });
  app.querySelector("#high-contrast-toggle").addEventListener("change", (event) => {
    state.accessibility.highContrast = event.target.checked;
    saveAccessibilitySettings();
    applyAccessibilitySettings();
    announceStatus(event.target.checked ? "Đã bật tương phản cao." : "Đã tắt tương phản cao.");
  });
  app.querySelector("#start-training").addEventListener("click", () => {
    acknowledgeTap();
    const name = app.querySelector("#user-name").value.trim();
    state.userName = name || "Bạn";
    safeStorageSet("aisi_user_name", state.userName);
    location.hash = "scenarios";
    renderScenarioPicker();
  });
}

function renderScenarioPicker() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Chọn tình huống và cấp độ</h2>
        <p class="subtitle">Mỗi buổi luyện khoảng 3 phút. Sau đó sẽ có phần giải thích dấu hiệu cảnh báo.</p>
      </div>
      <div class="scenario-grid">
        ${state.scenarios.map((scenario) => `
          <article class="scenario-card">
            <div>
              <h3>${escapeHtml(scenario.title)}</h3>
              <p>${escapeHtml(scenario.description)}</p>
            </div>
            <button data-scenario-id="${escapeHtml(scenario.id)}"><span aria-hidden="true">✓</span> Chọn</button>
          </article>
        `).join("")}
      </div>
      <label class="stack">
        <strong>Cấp độ</strong>
        <select id="difficulty" aria-label="Cấp độ">
          <option value="easy">Dễ - gợi ý rõ dấu hiệu</option>
          <option value="medium">Vừa - áp lực tự nhiên hơn</option>
          <option value="hard">Khó - ít gợi ý hơn</option>
        </select>
      </label>
      <button class="secondary" id="back-dashboard"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
    </section>
  `);

  app.querySelectorAll("[data-scenario-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      acknowledgeTap();
      state.selectedScenario = scenarioById(button.dataset.scenarioId);
      await createTrainingSession(app.querySelector("#difficulty").value);
    });
  });
  app.querySelector("#back-dashboard").addEventListener("click", () => {
    acknowledgeTap();
    location.hash = "";
    renderEntryDashboard();
  });
}

async function createTrainingSession(difficulty) {
  try {
    const payload = await api("/api/sessions", {
      method: "POST",
      body: JSON.stringify({
        scenarioId: state.selectedScenario.id,
        difficulty,
        userName: state.userName || "Bạn",
      }),
    });
    state.session = payload.session;
    location.hash = `consent/${state.session.id}`;
    renderSimulationConsent();
  } catch (error) {
    renderError(error.message);
  }
}

function renderSimulationConsent() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Trước khi bắt đầu</h2>
        <p class="subtitle">Tình huống: ${escapeHtml(state.selectedScenario?.title || scenarioById(state.session?.scenarioId)?.title || "")}</p>
      </div>
      <div class="notice">
        Đây là tình huống mô phỏng. Bạn có thể dừng bất cứ lúc nào.
      </div>
      <div class="notice danger-note">
        Không nhập mã OTP, mật khẩu, CCCD hoặc tài khoản thật.
      </div>
      <label class="consent-row">
        <input id="simulation-consent" type="checkbox">
        <span>Tôi hiểu đây là mô phỏng và sẽ không nhập thông tin thật.</span>
      </label>
      <div class="entry-actions">
        <button class="secondary" id="cancel-consent"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
        <button id="start-chat" disabled><span aria-hidden="true">▶</span> Bắt đầu mô phỏng</button>
      </div>
    </section>
  `);

  const checkbox = app.querySelector("#simulation-consent");
  const start = app.querySelector("#start-chat");
  checkbox.addEventListener("change", () => {
    start.disabled = !checkbox.checked;
  });
  start.addEventListener("click", () => {
    acknowledgeTap();
    confirmConsent();
  });
  app.querySelector("#cancel-consent").addEventListener("click", () => {
    acknowledgeTap();
    location.hash = "scenarios";
    renderScenarioPicker();
  });
}

async function confirmConsent() {
  try {
    const sessionId = getSessionIdFromHash();
    const payload = await api(`/api/sessions/${sessionId}/consent`, {
      method: "POST",
      body: JSON.stringify({ consent: true }),
    });
    state.session = payload.session;
    state.selectedScenario = scenarioById(state.session.scenarioId);
    state.messages = [];
    state.safetyNotices = [];
    state.isSending = false;
    location.hash = `chat/${state.session.id}`;
    renderChatShell();
  } catch (error) {
    renderError(error.message);
  }
}

async function renderConsentFromRoute() {
  try {
    const sessionId = getSessionIdFromHash();
    if (!sessionId) throw new Error("Không tìm thấy buổi luyện.");
    const payload = await api(`/api/sessions/${sessionId}`);
    state.session = payload.session;
    state.selectedScenario = scenarioById(state.session.scenarioId);
    if (state.session.status === "active") {
      renderChatShell();
      return;
    }
    if (state.session.status === "completed") {
      await renderDashboard({ readOnly: true });
      return;
    }
    renderSimulationConsent();
  } catch (error) {
    renderError(error.message);
  }
}

function renderChatShell() {
  const scenario = state.selectedScenario || scenarioById(state.session?.scenarioId);
  render(`
    <section class="panel chat-layout">
      <div class="chat-topbar">
        <div>
          <h2>${escapeHtml(scenario?.title || "Tình huống mô phỏng")}</h2>
          <p class="subtitle">Trợ lý AI phản hồi theo cuộc trò chuyện. Cấp độ: ${escapeHtml(state.session?.difficulty || "easy")}</p>
        </div>
        <button class="warning" id="stop-chat"><span aria-hidden="true">■</span> Dừng và xem kết quả</button>
      </div>
      <div class="chat-messages">
        ${state.messages.length === 0 ? '<div class="bubble ai">Chào cô/chú, đây là tình huống mô phỏng. Mình cần trao đổi nhanh về một vấn đề cần xác minh.</div>' : ""}
        ${state.messages.map((message) => `<div class="bubble ${message.role}">${escapeHtml(message.content)}</div>`).join("")}
        ${state.isSending ? '<div class="bubble ai typing">Trợ lý AI đang phản hồi...</div>' : ""}
        ${state.safetyNotices.map((notice) => `<div class="notice danger-note">${escapeHtml(notice)}</div>`).join("")}
      </div>
      <form class="chat-form" id="chat-form">
        <textarea id="chat-input" maxlength="${state.runtime.maxMessageLength}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn" ${state.isSending ? "disabled" : ""}></textarea>
        <div class="chat-actions">
          <button type="submit" ${state.isSending ? "disabled" : ""}><span aria-hidden="true">➤</span> Gửi</button>
        </div>
      </form>
    </section>
  `, { chatScreen: true });

  app.querySelector("#stop-chat").addEventListener("click", () => {
    acknowledgeTap();
    renderDashboard();
  });

  app.querySelector("#chat-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    acknowledgeTap();
    if (state.isSending) return;
    const input = app.querySelector("#chat-input");
    const text = input.value.trim();
    if (!text) return;
    if (text.length > state.runtime.maxMessageLength) {
      state.safetyNotices.push(`Tin nhắn tối đa ${state.runtime.maxMessageLength} ký tự.`);
      renderChatShell();
      return;
    }
    const displayMessage = maskSensitiveForDisplay(text);
    state.messages.push({ role: "user", content: displayMessage.masked });
    state.isSending = true;
    input.value = "";
    renderChatShell();
    await sendChatMessage(text);
  });
}


async function sendChatMessage(text) {
  try {
    const payload = await api(`/api/sessions/${state.session.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: text }),
    });
    if (payload.safety?.maskedSensitiveInput) {
      const message = "Mình đã ẩn thông tin nhạy cảm để bảo vệ riêng tư.";
      state.safetyNotices.push(message);
      announceStatus(message);
    }
    if (payload.safety?.provider === "safe_fallback") {
      const message = fallbackNotice(payload.safety?.fallbackReason);
      state.safetyNotices.push(message);
      announceStatus(message);
    }
    state.messages.push({ role: "ai", content: payload.reply });
    state.isSending = false;
    if (payload.sessionStatus === "completed") {
      await renderDashboard();
      return;
    }
    renderChatShell();
  } catch (error) {
    state.isSending = false;
    state.safetyNotices.push(error.message);
    announceStatus(error.message);
    renderChatShell();
  }
}

function fallbackNotice(reason) {
  if (reason === "NO_GEMINI_API_KEY") {
    return "Trợ lý AI chưa sẵn sàng; app đang dùng phản hồi dự phòng an toàn.";
  }
  if (reason === "GEMINI_TIMEOUT") {
    return "Trợ lý AI phản hồi chậm; app tạm dùng phản hồi dự phòng an toàn để buổi luyện không bị gián đoạn.";
  }
  if (reason === "GEMINI_HTTP_429") {
    return "Trợ lý AI đang bận; app tạm dùng phản hồi dự phòng an toàn.";
  }
  return "Trợ lý AI gặp lỗi tạm thời; app tạm dùng phản hồi dự phòng an toàn.";
}

async function renderDashboard(options = {}) {
  try {
    const sessionId = state.session?.id || getSessionIdFromHash();
    if (!sessionId) throw new Error("Không tìm thấy buổi luyện.");
    state.session = state.session || { id: sessionId };
    const dashboard = options.readOnly
      ? await api(`/api/sessions/${sessionId}/dashboard`)
      : await api(`/api/sessions/${sessionId}/complete`, { method: "POST" });
    if (location.hash !== `#dashboard/${sessionId}`) {
      history.replaceState(null, "", `#dashboard/${sessionId}`);
    }
    saveHistory(dashboard);
    renderDashboardView(dashboard);
  } catch (error) {
    renderError(error.message);
  }
}

async function renderChatFromRoute() {
  try {
    const sessionId = getSessionIdFromHash();
    if (!sessionId) throw new Error("Không tìm thấy buổi luyện.");
    const payload = await api(`/api/sessions/${sessionId}`);
    state.session = payload.session;
    state.selectedScenario = scenarioById(state.session.scenarioId);
    const transcript = await api(`/api/sessions/${sessionId}/messages`);
    state.messages = transcript.messages || [];
    state.safetyNotices = [];
    state.isSending = false;
    if (state.session.status === "completed") {
      await renderDashboard({ readOnly: true });
      return;
    }
    renderChatShell();
  } catch (error) {
    renderError(error.message);
  }
}

function renderDashboardView(dashboard) {
  render(`
    <section class="panel stack">
      <div>
        <h2>Kết quả buổi luyện tập</h2>
        <p class="subtitle">${escapeHtml(dashboard.scenarioTitle)} - Cấp độ ${escapeHtml(dashboard.difficulty)}</p>
      </div>
      <div class="accessibility-panel" aria-label="Tùy chọn hiển thị">
        <label class="toggle-row">
          <input id="large-text-toggle" type="checkbox" ${state.accessibility.largeText ? "checked" : ""}>
          <span>Chữ to</span>
        </label>
        <label class="toggle-row">
          <input id="high-contrast-toggle" type="checkbox" ${state.accessibility.highContrast ? "checked" : ""}>
          <span>Tương phản cao</span>
        </label>
      </div>
      <div class="score-card">
        <span class="score-number">${dashboard.immunityScore} / 100</span>
        <span>Nhận diện ${dashboard.recognizedCount} / ${dashboard.totalCount} dấu hiệu cảnh báo.</span>
      </div>
      <h3>Đã nhận diện tốt</h3>
      <ul class="flag-list">${renderFlags(dashboard.recognizedRedFlags, "success", "Chưa có dấu hiệu nào được nhận diện rõ.")}</ul>
      <h3>Cần luyện thêm</h3>
      <ul class="flag-list">${renderFlags(dashboard.missedRedFlags, "", "Không còn dấu hiệu nào bị bỏ lỡ.")}</ul>
      <h3>Đoạn hội thoại cần chú ý</h3>
      <ul class="flag-list">
        ${dashboard.highlights.length === 0 ? '<li class="flag-item">Chưa có đoạn cần chú ý.</li>' : dashboard.highlights.map((item) => `
          <li class="flag-item ${item.status === "recognized" ? "success" : ""}">
            <strong>${escapeHtml(item.label)}</strong><br>
            ${escapeHtml(item.evidenceText || "Không có trích đoạn.")}
          </li>
        `).join("")}
      </ul>
      <div class="notice">${escapeHtml(dashboard.nextRecommendation)}</div>
      <label class="stack">
        <strong>Tóm tắt chia sẻ cho người thân</strong>
        <textarea id="share-summary" readonly>${escapeHtml(dashboard.shareSummary)}</textarea>
      </label>
      <div class="result-actions">
        <button id="copy-share"><span aria-hidden="true">⧉</span> Sao chép tóm tắt</button>
        <button class="secondary" id="restart"><span aria-hidden="true">↻</span> Luyện tiếp</button>
        <button class="secondary" id="home"><span aria-hidden="true">⌂</span> Trang chính</button>
      </div>
      ${state.safetyNotices.map((notice) => `<div class="notice">${escapeHtml(notice)}</div>`).join("")}
    </section>
  `);

  app.querySelector("#large-text-toggle").addEventListener("change", (event) => {
    state.accessibility.largeText = event.target.checked;
    saveAccessibilitySettings();
    applyAccessibilitySettings();
    announceStatus(event.target.checked ? "Đã bật chữ to." : "Đã tắt chữ to.");
  });
  app.querySelector("#high-contrast-toggle").addEventListener("change", (event) => {
    state.accessibility.highContrast = event.target.checked;
    saveAccessibilitySettings();
    applyAccessibilitySettings();
    announceStatus(event.target.checked ? "Đã bật tương phản cao." : "Đã tắt tương phản cao.");
  });

  app.querySelector("#copy-share").addEventListener("click", () => copyShareSummary(dashboard));
  app.querySelector("#restart").addEventListener("click", () => {
    acknowledgeTap();
    location.hash = "scenarios";
    state.session = null;
    state.messages = [];
    state.safetyNotices = [];
    state.isSending = false;
    renderScenarioPicker();
  });
  app.querySelector("#home").addEventListener("click", () => {
    acknowledgeTap();
    location.hash = "";
    renderEntryDashboard();
  });
}

async function copyShareSummary(dashboard) {
  const text = app.querySelector("#share-summary").value;
  try {
    acknowledgeTap();
    await navigator.clipboard.writeText(text);
    state.safetyNotices = ["Đã sao chép tóm tắt kết quả."];
    announceStatus("Đã sao chép tóm tắt kết quả.");
  } catch {
    state.safetyNotices = ["Không sao chép tự động được. Bạn có thể chọn và sao chép thủ công."];
    announceStatus("Không sao chép tự động được. Bạn có thể chọn và sao chép thủ công.");
  }
  renderDashboardView({
    ...dashboard,
    shareSummary: text,
  });
}

function renderFlags(flags, className, emptyText) {
  if (!flags || flags.length === 0) {
    return `<li class="flag-item ${className}">${escapeHtml(emptyText)}</li>`;
  }
  return flags.map((flag) => `
    <li class="flag-item ${className}">
      <strong>${escapeHtml(flag.label)}</strong><br>
      <em>${escapeHtml(flag.techniqueLabel || flag.technique || "authority")}</em><br>
      ${escapeHtml(flag.recommendation || flag.explanation || "")}
    </li>
  `).join("");
}

function saveHistory(dashboard) {
  state.lastDashboard = dashboard;
  const item = {
    sessionId: dashboard.sessionId,
    scenarioTitle: dashboard.scenarioTitle,
    immunityScore: dashboard.immunityScore,
    createdAt: new Date().toLocaleString("vi-VN"),
  };
  state.history = [item, ...state.history.filter((entry) => entry.sessionId !== item.sessionId)].slice(0, 5);
  safeStorageSet("aisi_history", JSON.stringify(state.history));
}

function getSessionIdFromHash() {
  const parts = location.hash.replace("#", "").split("/");
  return parts[1] || state.session?.id;
}

function renderError(message) {
  render(`
    <section class="panel stack">
      <h2>Không thể tiếp tục</h2>
      <div class="notice danger-note">${escapeHtml(message)}</div>
      <button id="back-home"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
    </section>
  `);
  app.querySelector("#back-home").addEventListener("click", () => {
    acknowledgeTap();
    state.session = null;
    state.messages = [];
    state.safetyNotices = [];
    state.isSending = false;
    if (location.hash) {
      location.hash = "";
      return;
    }
    renderEntryDashboard();
  });
}

function routeFromHash() {
  if (location.hash.startsWith("#scenarios")) {
    renderScenarioPicker();
    return;
  }
  if (location.hash.startsWith("#consent/")) {
    renderConsentFromRoute();
    return;
  }
  if (location.hash.startsWith("#chat/")) {
    renderChatFromRoute();
    return;
  }
  if (location.hash.startsWith("#dashboard/")) {
    renderDashboard({ readOnly: true });
    return;
  }
  renderEntryDashboard();
}

window.addEventListener("hashchange", routeFromHash);
loadScenarios().catch((error) => renderError(error.message));
