const app = document.querySelector("#app");

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
  userName: localStorage.getItem("aisi_user_name") || "",
  history: JSON.parse(localStorage.getItem("aisi_history") || "[]"),
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

function scenarioById(id) {
  return state.scenarios.find((scenario) => scenario.id === id);
}

function render(content) {
  app.innerHTML = content;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
        <h2>Dashboard cá nhân</h2>
        <p class="subtitle">Bắt đầu nhanh, không cần tài khoản phức tạp.</p>
      </div>
      <label class="stack">
        <strong>Tên hiển thị</strong>
        <input id="user-name" value="${escapeHtml(state.userName)}" placeholder="Ví dụ: Cô Lan" aria-label="Tên hiển thị">
      </label>
      <div>
        <button id="start-training">Bắt đầu luyện tập</button>
      </div>
      <h3>Lịch sử trong phiên này</h3>
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

  app.querySelector("#start-training").addEventListener("click", () => {
    const name = app.querySelector("#user-name").value.trim();
    state.userName = name || "Bạn";
    localStorage.setItem("aisi_user_name", state.userName);
    location.hash = "scenarios";
    renderScenarioPicker();
  });
}

function renderScenarioPicker() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Chọn tình huống và cấp độ</h2>
        <p class="subtitle">Mỗi tình huống kéo dài khoảng 3 phút và có phần giải thích dấu hiệu cảnh báo sau buổi luyện.</p>
      </div>
      <div class="scenario-grid">
        ${state.scenarios.map((scenario) => `
          <article class="scenario-card">
            <div>
              <h3>${escapeHtml(scenario.title)}</h3>
              <p>${escapeHtml(scenario.description)}</p>
            </div>
            <button data-scenario-id="${escapeHtml(scenario.id)}">Chọn</button>
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
      <button class="secondary" id="back-dashboard">Về dashboard</button>
    </section>
  `);

  app.querySelectorAll("[data-scenario-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedScenario = scenarioById(button.dataset.scenarioId);
      await createTrainingSession(app.querySelector("#difficulty").value);
    });
  });
  app.querySelector("#back-dashboard").addEventListener("click", () => {
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
        Đây là mô phỏng giáo dục, không phải tình huống thật. Bạn có thể dừng bất kỳ lúc nào.
      </div>
      <div class="notice danger-note">
        Không nhập OTP, mật khẩu, CCCD, số thẻ hoặc số tài khoản thật.
      </div>
      <label class="consent-row">
        <input id="simulation-consent" type="checkbox">
        <span>Tôi hiểu đây là mô phỏng luyện tập và tôi sẽ không nhập thông tin riêng tư thật.</span>
      </label>
      <button id="start-chat" disabled>Bắt đầu mô phỏng</button>
    </section>
  `);

  const checkbox = app.querySelector("#simulation-consent");
  const start = app.querySelector("#start-chat");
  checkbox.addEventListener("change", () => {
    start.disabled = !checkbox.checked;
  });
  start.addEventListener("click", confirmConsent);
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
    if (!sessionId) throw new Error("Session not found.");
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
          <p class="subtitle">Gemini phản hồi động theo lịch sử hội thoại. Cấp độ: ${escapeHtml(state.session?.difficulty || "easy")}</p>
        </div>
        <button class="warning" id="stop-chat">Dừng</button>
      </div>
      <div class="chat-messages">
        ${state.messages.length === 0 ? '<div class="bubble ai">Chào cô/chú, đây là tình huống mô phỏng. Mình cần trao đổi nhanh về một vấn đề cần xác minh.</div>' : ""}
        ${state.messages.map((message) => `<div class="bubble ${message.role}">${escapeHtml(message.content)}</div>`).join("")}
        ${state.isSending ? '<div class="bubble ai typing">Gemini đang phản hồi...</div>' : ""}
        ${state.safetyNotices.map((notice) => `<div class="notice danger-note">${escapeHtml(notice)}</div>`).join("")}
      </div>
      <form class="chat-form" id="chat-form">
        <textarea id="chat-input" maxlength="${state.runtime.maxMessageLength}" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn" ${state.isSending ? "disabled" : ""}></textarea>
        <button type="submit" ${state.isSending ? "disabled" : ""}>Gửi</button>
      </form>
    </section>
  `);

  app.querySelector("#stop-chat").addEventListener("click", renderDashboard);
  app.querySelector("#chat-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.isSending) return;
    const input = app.querySelector("#chat-input");
    const text = input.value.trim();
    if (!text) return;
    if (text.length > state.runtime.maxMessageLength) {
      state.safetyNotices.push(`Tin nhắn tối đa ${state.runtime.maxMessageLength} ký tự.`);
      renderChatShell();
      return;
    }
    state.messages.push({ role: "user", content: text });
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
      state.safetyNotices.push("Mình đã ẩn thông tin nhạy cảm để bảo vệ riêng tư.");
    }
    if (payload.safety?.provider === "safe_fallback") {
      state.safetyNotices.push(fallbackNotice(payload.safety?.fallbackReason));
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
    renderChatShell();
  }
}

function fallbackNotice(reason) {
  if (reason === "NO_GEMINI_API_KEY") {
    return "Gemini API chưa được cấu hình; app đang dùng phản hồi dự phòng an toàn.";
  }
  if (reason === "GEMINI_TIMEOUT") {
    return "Gemini phản hồi chậm; app tạm dùng phản hồi dự phòng an toàn để demo không bị gián đoạn.";
  }
  if (reason === "GEMINI_HTTP_429") {
    return "Gemini đang bị giới hạn quota/rate limit; app tạm dùng phản hồi dự phòng an toàn.";
  }
  return "Gemini gặp lỗi tạm thời; app tạm dùng phản hồi dự phòng an toàn.";
}

async function renderDashboard(options = {}) {
  try {
    const sessionId = state.session?.id || getSessionIdFromHash();
    if (!sessionId) throw new Error("Session not found.");
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
    if (!sessionId) throw new Error("Session not found.");
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
        ${dashboard.highlights.length === 0 ? '<li class="flag-item">Chưa có highlight.</li>' : dashboard.highlights.map((item) => `
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
      <div>
        <button id="copy-share">Copy tóm tắt</button>
        <button class="secondary" id="restart">Luyện tiếp</button>
        <button class="secondary" id="home">Dashboard</button>
      </div>
      ${state.safetyNotices.map((notice) => `<div class="notice">${escapeHtml(notice)}</div>`).join("")}
    </section>
  `);

  app.querySelector("#copy-share").addEventListener("click", copyShareSummary);
  app.querySelector("#restart").addEventListener("click", () => {
    location.hash = "scenarios";
    state.session = null;
    state.messages = [];
    state.safetyNotices = [];
    state.isSending = false;
    renderScenarioPicker();
  });
  app.querySelector("#home").addEventListener("click", () => {
    location.hash = "";
    renderEntryDashboard();
  });
}

async function copyShareSummary() {
  const text = app.querySelector("#share-summary").value;
  try {
    await navigator.clipboard.writeText(text);
    state.safetyNotices = ["Đã copy tóm tắt kết quả."];
  } catch {
    state.safetyNotices = ["Không copy tự động được. Bạn có thể chọn và copy thủ công."];
  }
  renderDashboardView({
    ...state.lastDashboard,
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
      <em>${escapeHtml(flag.techniqueLabel || flag.technique || "social engineering")}</em><br>
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
  localStorage.setItem("aisi_history", JSON.stringify(state.history));
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
      <button id="back-home">Về dashboard</button>
    </section>
  `);
  app.querySelector("#back-home").addEventListener("click", () => {
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
