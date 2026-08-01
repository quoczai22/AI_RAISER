const app = document.querySelector("#app");

const state = {
  scenarios: [],
  selectedScenario: null,
  session: null,
  participantMessages: [],
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
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function scenarioById(id) {
  return state.scenarios.find((scenario) => scenario.id === id);
}

function render(content) {
  app.innerHTML = content;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadScenarios() {
  const payload = await api("/api/scenarios");
  state.scenarios = payload.scenarios;
  renderScenarioPicker();
}

function renderScenarioPicker() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Chọn tình huống luyện tập</h2>
        <p class="subtitle">Mỗi tình huống kéo dài khoảng 3 phút và có phần giải thích dấu hiệu cảnh báo sau buổi luyện.</p>
      </div>
      <div class="scenario-grid">
        ${state.scenarios.map((scenario) => `
          <article class="scenario-card">
            <div>
              <h3>${escapeHtml(scenario.title)}</h3>
              <p>${escapeHtml(scenario.description)}</p>
            </div>
            <button data-scenario-id="${escapeHtml(scenario.id)}">Chọn tình huống</button>
          </article>
        `).join("")}
      </div>
    </section>
  `);

  app.querySelectorAll("[data-scenario-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedScenario = scenarioById(button.dataset.scenarioId);
      renderInviterConsent();
    });
  });
}

function renderInviterConsent() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Xác nhận trước khi tạo buổi luyện</h2>
        <p class="subtitle">Tình huống đã chọn: ${escapeHtml(state.selectedScenario.title)}</p>
      </div>
      <div class="notice">
        Đây là mô phỏng giáo dục. Người tham gia sẽ được thông báo trước rằng đây không phải tình huống thật.
      </div>
      <label class="consent-row">
        <input id="consent-ethical" type="checkbox">
        <span>Tôi xác nhận không dùng buổi luyện này để giám sát bí mật hoặc gài bẫy người thân.</span>
      </label>
      <label class="consent-row">
        <input id="consent-privacy" type="checkbox">
        <span>Tôi hiểu không được nhập dữ liệu cá nhân thật như OTP, CCCD, số tài khoản hoặc mật khẩu.</span>
      </label>
      <div>
        <button id="create-session" disabled>Tạo buổi luyện tập</button>
        <button class="secondary" id="back-to-scenarios">Chọn lại</button>
      </div>
    </section>
  `);

  const ethical = app.querySelector("#consent-ethical");
  const privacy = app.querySelector("#consent-privacy");
  const create = app.querySelector("#create-session");
  const update = () => {
    create.disabled = !(ethical.checked && privacy.checked);
  };

  ethical.addEventListener("change", update);
  privacy.addEventListener("change", update);
  app.querySelector("#back-to-scenarios").addEventListener("click", renderScenarioPicker);
  create.addEventListener("click", createTrainingSession);
}

async function createTrainingSession() {
  try {
    const payload = await api("/api/sessions", {
      method: "POST",
      body: JSON.stringify({
        scenarioId: state.selectedScenario.id,
        inviterConsent: true,
      }),
    });
    state.session = payload.session;
    renderSessionCreated();
  } catch (error) {
    renderError(error.message);
  }
}

function renderSessionCreated() {
  const link = `${location.origin}/#participant-consent/${state.session.id}`;
  render(`
    <section class="panel stack">
      <div>
        <h2>Buổi luyện tập đã sẵn sàng</h2>
        <p class="subtitle">Tình huống: ${escapeHtml(state.selectedScenario.title)}</p>
      </div>
      <span class="session-link">${escapeHtml(link)}</span>
      <div>
        <button id="open-participant">Mở màn hình người tham gia</button>
        <button class="secondary" id="back-home">Tạo buổi khác</button>
      </div>
    </section>
  `);

  app.querySelector("#open-participant").addEventListener("click", () => {
    location.hash = `participant-consent/${state.session.id}`;
    renderParticipantConsent();
  });
  app.querySelector("#back-home").addEventListener("click", renderScenarioPicker);
}

function renderParticipantConsent() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Trước khi bắt đầu</h2>
        <p class="subtitle">Đây là buổi luyện tập mô phỏng để giúp bạn nhận diện dấu hiệu lừa đảo qua tin nhắn.</p>
      </div>
      <div class="notice danger-note">
        Không nhập OTP, mật khẩu, CCCD, số thẻ hoặc số tài khoản thật.
      </div>
      <label class="consent-row">
        <input id="participant-consent" type="checkbox">
        <span>Tôi hiểu đây là mô phỏng luyện tập và không phải tình huống thật.</span>
      </label>
      <button id="start-chat" disabled>Bắt đầu luyện tập</button>
    </section>
  `);

  const checkbox = app.querySelector("#participant-consent");
  const start = app.querySelector("#start-chat");
  checkbox.addEventListener("change", () => {
    start.disabled = !checkbox.checked;
  });
  start.addEventListener("click", confirmParticipantConsent);
}

async function confirmParticipantConsent() {
  try {
    const sessionId = getSessionIdFromHash();
    const payload = await api(`/api/sessions/${sessionId}/participant-consent`, {
      method: "POST",
      body: JSON.stringify({ participantConsent: true }),
    });
    state.session = payload.session;
    location.hash = `chat/${state.session.id}`;
    renderChatShell();
  } catch (error) {
    renderError(error.message);
  }
}

function renderChatShell() {
  const scenarioTitle = state.selectedScenario?.title || "Tình huống mô phỏng";
  render(`
    <section class="panel chat-layout">
      <div class="chat-topbar">
        <div>
          <h2>${escapeHtml(scenarioTitle)}</h2>
          <p class="subtitle">Sprint 2: giao diện chat. Sprint 3 sẽ kết nối Gemini động.</p>
        </div>
        <button class="warning" id="stop-chat">Dừng</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="bubble ai">Chào cô/chú, đây là màn hình mô phỏng chat. Kết nối Gemini sẽ được bật ở Sprint 3.</div>
        ${state.participantMessages.map((message) => `<div class="bubble user">${escapeHtml(message)}</div>`).join("")}
      </div>
      <form class="chat-form" id="chat-form">
        <textarea id="chat-input" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn"></textarea>
        <button type="submit">Gửi</button>
      </form>
    </section>
  `);

  app.querySelector("#stop-chat").addEventListener("click", renderDashboardShell);
  app.querySelector("#chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = app.querySelector("#chat-input");
    const text = input.value.trim();
    if (!text) return;
    state.participantMessages.push(text);
    input.value = "";
    renderChatShell();
  });
}

function renderDashboardShell() {
  render(`
    <section class="panel stack">
      <div>
        <h2>Kết quả buổi luyện tập</h2>
        <p class="subtitle">Sprint 2 hiển thị dashboard shell. Sprint 4 sẽ tính điểm miễn dịch thật.</p>
      </div>
      <div class="score-card">
        <span class="score-number">-- / 100</span>
        <span>Điểm sẽ được tính sau khi hoàn tất Gemini chat và scoring engine.</span>
      </div>
      <h3>Đã nhận diện tốt</h3>
      <ul class="flag-list">
        <li class="flag-item success">Sẽ hiển thị dấu hiệu người tham gia nhận diện đúng.</li>
      </ul>
      <h3>Cần luyện thêm</h3>
      <ul class="flag-list">
        <li class="flag-item">Sẽ hiển thị dấu hiệu bị bỏ lỡ và gợi ý luyện tiếp.</li>
      </ul>
      <button id="restart">Tạo buổi luyện mới</button>
    </section>
  `);

  app.querySelector("#restart").addEventListener("click", () => {
    location.hash = "";
    state.session = null;
    state.participantMessages = [];
    renderScenarioPicker();
  });
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
      <button id="back-home">Về màn hình chính</button>
    </section>
  `);
  app.querySelector("#back-home").addEventListener("click", renderScenarioPicker);
}

window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#participant-consent/")) {
    renderParticipantConsent();
  }
});

loadScenarios().catch((error) => renderError(error.message));
