const app = document.querySelector("#app");
const statusRegion = document.querySelector("#status-region");

const state = {
  scenarios: [],
  selectedScenario: null,
  selectedDifficulty: "easy",
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

// Keep core validation escape methods intact
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

function initAccessibility() {
  const largeTextToggle = document.querySelector("#large-text-toggle");
  const highContrastToggle = document.querySelector("#high-contrast-toggle");

  if (largeTextToggle) {
    largeTextToggle.checked = state.accessibility.largeText;
    largeTextToggle.addEventListener("change", (event) => {
      state.accessibility.largeText = event.target.checked;
      saveAccessibilitySettings();
      applyAccessibilitySettings();
      announceStatus(event.target.checked ? "Đã bật chữ to." : "Đã tắt chữ to.");
    });
  }

  if (highContrastToggle) {
    highContrastToggle.checked = state.accessibility.highContrast;
    highContrastToggle.addEventListener("change", (event) => {
      state.accessibility.highContrast = event.target.checked;
      saveAccessibilitySettings();
      applyAccessibilitySettings();
      announceStatus(event.target.checked ? "Đã bật tương phản cao." : "Đã tắt tương phản cao.");
    });
  }

  applyAccessibilitySettings();
}

function renderEntryDashboard() {
  if (!state.userName) {
    render(`
      <section class="panel">
        <div class="consent-layout stack" style="max-width: 390px; margin: 0 auto;">
          <div class="ui-card stack" style="padding: 24px;">
            <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; gap: 16px; margin-bottom: 8px;">
              <div style="width: 80px; height: 80px; background: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: var(--shadow);">🛡️</div>
              <div>
                <h2 style="margin: 0; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.6rem; color: var(--foreground);">Luyện tập<br>nhận biết lừa đảo</h2>
                <p class="subtitle" style="margin: 6px 0 0; color: var(--muted-foreground); font-size: 0.9rem;">Cùng AI luyện tập để không bị lừa — hoàn toàn miễn phí, không cần tài khoản.</p>
              </div>
            </div>
            
            <div class="notice" style="border-left-color: var(--success); background: var(--success-bg); color: var(--secondary-foreground); font-weight: 700; border-radius: var(--radius); padding: 12px 16px;">
              <strong>Không cần mật khẩu, không cần OTP, không trừ tiền.</strong>
            </div>
            
            <div class="stack" style="gap: 8px;">
              <strong style="font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 1rem; color: var(--foreground);">Tên của cô/chú/anh/chị</strong>
              <input id="user-name" value="${escapeHtml(state.userName)}" maxlength="40" placeholder="Ví dụ: Bác Hùng, Chị Mai..." aria-label="Tên hiển thị">
            </div>
            
            <div class="entry-actions" style="margin-top: 8px;">
              <button id="start-training" style="width: 100%;"><span aria-hidden="true">▶</span> Bắt đầu luyện tập</button>
            </div>

            <div style="background: var(--secondary); border: 1px solid #B6DFC2; border-radius: var(--radius); padding: 16px; gap: 8px; display: grid;">
              <p style="font-size: 0.85rem; font-weight: 700; color: var(--secondary-foreground); margin: 0 0 8px;">✓ Hoàn toàn an sau</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <div class="build-badge" style="border: 0; background: var(--card); padding: 4px 10px; font-size: 0.75rem; color: var(--secondary-foreground); font-weight: 700; border-radius: 100px;">✓ Không cần mật khẩu</div>
                <div class="build-badge" style="border: 0; background: var(--card); padding: 4px 10px; font-size: 0.75rem; color: var(--secondary-foreground); font-weight: 700; border-radius: 100px;">✓ Không cần OTP</div>
                <div class="build-badge" style="border: 0; background: var(--card); padding: 4px 10px; font-size: 0.75rem; color: var(--secondary-foreground); font-weight: 700; border-radius: 100px;">✓ Không mất tiền</div>
              </div>
            </div>

            <p style="text-align: center; font-size: 0.75rem; color: var(--muted-foreground); margin: 8px 0 0;">Ứng dụng luyện tập — không xác minh thật</p>
          </div>
        </div>
      </section>
    `);

    const startBtn = app.querySelector("#start-training");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        acknowledgeTap();
        const name = app.querySelector("#user-name").value.trim();
        state.userName = name || "Bạn";
        safeStorageSet("aisi_user_name", state.userName);
        location.hash = "scenarios";
        renderScenarioPicker();
      });
    }
    return;
  }

  const completedSessions = state.history.length;
  const avgScore = completedSessions > 0
    ? Math.round(state.history.reduce((sum, h) => sum + h.immunityScore, 0) / completedSessions) + "%"
    : "0%";

  const historyHtml = state.history.length === 0
    ? '<li class="flag-item" style="border-left-color: var(--border); background: var(--background); font-weight: normal; color: var(--muted-foreground);">Chưa có buổi luyện nào. Hãy bắt đầu luyện tập để tăng đề kháng lừa đảo!</li>'
    : state.history.map((item) => `
        <li class="history-card">
          <div class="history-card-left">
            <h4>${escapeHtml(item.scenarioTitle)}</h4>
            <span>${escapeHtml(item.createdAt)}</span>
          </div>
          <div class="history-card-right">
            <div class="history-card-score">${item.immunityScore}/100</div>
          </div>
        </li>
      `).join("");

  render(`
    <section class="panel">
      <div class="dashboard-layout">
        <!-- Cột trái -->
        <div class="stack" style="gap: 20px;">
          <!-- Welcome Header -->
          <div class="dashboard-welcome" style="background: var(--primary); color: white; border: 0; padding: 24px; border-radius: var(--radius); display: flex; justify-content: space-between; align-items: start; box-shadow: var(--shadow);">
            <div class="welcome-info" style="color: white;">
              <p style="margin: 0; font-size: 0.85rem; opacity: 0.8;">Xin chào,</p>
              <h2 style="margin: 4px 0 0; color: white; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.75rem;">${escapeHtml(state.userName)} 👋</h2>
              <p class="subtitle" style="margin: 6px 0 0; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem;">Hôm nay bạn muốn luyện tập tình huống nào?</p>
            </div>
            <button class="outline" id="change-name-btn" style="min-height: 40px; padding: 6px 12px; font-size: 0.8rem; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; border-radius: 8px; font-family: 'Nunito', sans-serif;">Đổi tên</button>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">${completedSessions}</div>
              <div class="stat-label">Buổi luyện</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">📚</div>
              <div class="stat-value">5</div>
              <div class="stat-label">Dấu hiệu học</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">${avgScore}</div>
              <div class="stat-label">Điểm trung bình</div>
            </div>
          </div>

          <p class="eyebrow" style="margin-bottom: 0;">Bạn muốn làm gì?</p>

          <div class="ui-card action-card" id="btn-scenarios" role="button" tabindex="0" aria-label="Luyện tập tình huống. Chọn kịch bản và luyện phản xạ với AI.">
            <div class="action-card-icon">🎯</div>
            <div style="flex: 1;">
              <strong class="action-card-title">Luyện tập tình huống</strong>
              <p class="subtitle" style="margin: 2px 0 0; font-size: 0.85rem;">Chọn kịch bản và luyện phản xạ với AI</p>
            </div>
            <span class="action-card-right">›</span>
          </div>

          <div class="ui-card action-card" id="btn-hotlines" role="button" tabindex="0" aria-label="Số điện thoại xác minh. Danh bạ đường dây nóng chính thức khi nghi ngờ.">
            <div class="action-card-icon hotline">📞</div>
            <div style="flex: 1;">
              <strong class="action-card-title">Số điện thoại xác minh</strong>
              <p class="subtitle" style="margin: 2px 0 0; font-size: 0.85rem;">Danh bạ đường dây nóng chính thức khi nghi ngờ</p>
            </div>
            <span class="action-card-right">›</span>
          </div>
        </div>

        <!-- Cột phải -->
        <div class="stack" style="gap: 20px;">
          <p class="eyebrow" style="margin-bottom: 0;">Lịch sử luyện tập gần đây</p>
          <div class="ui-card stack" style="padding: 20px; gap: 12px; background: var(--card); border: 2px solid var(--border);">
            <ul class="flag-list">
              ${historyHtml}
            </ul>
            <div style="background: var(--secondary); border: 1px solid #B6DFC2; border-radius: var(--radius); padding: 12px 16px; margin-top: 4px;">
              <p style="font-size: 0.8rem; color: var(--secondary-foreground); font-weight: 500; margin: 0; line-height: 1.4;">
                💡 <strong>Mẹo:</strong> Luyện tập đều đặn mỗi ngày giúp nhận ra lừa đảo nhanh hơn rất nhiều.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  app.querySelector("#change-name-btn").addEventListener("click", () => {
    acknowledgeTap();
    state.userName = "";
    safeStorageRemove("aisi_user_name");
    renderEntryDashboard();
  });

  const btnScenarios = app.querySelector("#btn-scenarios");
  if (btnScenarios) {
    const actScenarios = () => {
      acknowledgeTap();
      location.hash = "scenarios";
      renderScenarioPicker();
    };
    btnScenarios.addEventListener("click", actScenarios);
    btnScenarios.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        actScenarios();
      }
    });
  }

  const btnHotlines = app.querySelector("#btn-hotlines");
  if (btnHotlines) {
    const actHotlines = () => {
      acknowledgeTap();
      location.hash = "hotlines";
      renderHotlines();
    };
    btnHotlines.addEventListener("click", actHotlines);
    btnHotlines.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        actHotlines();
      }
    });
  }
}

function renderScenarioPicker() {
  const selectedId = state.selectedScenario?.id || null;
  const difficulty = state.selectedDifficulty || "easy";

  const scenariosHtml = state.scenarios.map((scenario) => {
    const isSelected = scenario.id === selectedId;
    const badgeClass = scenario.id === "fake_bank" || scenario.id === "fake_police" ? "popular" : "danger";
    const badgeText = scenario.id === "fake_bank" ? "Phổ biến" : scenario.id === "fake_police" ? "Nguy hiểm" : "Mới";
    
    // Choose matching icon representing Figma app styling
    let icon = "💼";
    if (scenario.id === "fake_bank") icon = "🏦";
    else if (scenario.id === "fake_police") icon = "🏢";
    else if (scenario.id === "fake_relative") icon = "👤";

    return `
      <div class="scenario-card ${isSelected ? "selected" : ""}" data-scenario-id="${escapeHtml(scenario.id)}" role="button" tabindex="0" aria-checked="${isSelected ? "true" : "false"}" aria-label="${escapeHtml(scenario.title)}. ${escapeHtml(scenario.description)}.">
        <div class="scenario-card-icon">
          ${icon}
        </div>
        <div class="scenario-card-content">
          <div class="scenario-card-header">
            <h3>${escapeHtml(scenario.title)}</h3>
            <span class="scenario-badge ${badgeClass}">${badgeText}</span>
          </div>
          <p>${escapeHtml(scenario.description)}</p>
        </div>
        ${isSelected ? '<span class="selected-indicator" aria-hidden="true">✓</span>' : ""}
      </div>
    `;
  }).join("");

  render(`
    <section class="panel">
      <div class="scenarios-layout">
        <!-- Danh sách kịch bản -->
        <div class="scenarios-list stack" style="gap: 16px;">
          <h2 style="font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.4rem;">Chọn tình huống luyện tập</h2>
          <p class="subtitle" style="margin: 0; font-size: 0.9rem;">Hãy chọn một kịch bản dưới đây để bắt đầu đối phó với các kịch bản lừa đảo phổ biến.</p>
          <div class="scenario-grid">
            ${scenariosHtml}
          </div>
        </div>

        <!-- sidebar tùy chọn độ khó -->
        <div class="scenarios-sidebar stack" style="gap: 16px;">
          <div class="ui-card stack" style="padding: 24px; gap: 16px;">
            <p class="eyebrow" style="margin-bottom: 0;">Mức độ thử thách</p>
            <div class="difficulty-picker-row" style="display: grid; gap: 10px;">
              <label class="difficulty-toggle">
                <input type="radio" name="difficulty" value="easy" ${difficulty === "easy" ? "checked" : ""}>
                <span>Dễ - hiển thị gợi ý rõ ràng</span>
              </label>
              <label class="difficulty-toggle">
                <input type="radio" name="difficulty" value="medium" ${difficulty === "medium" ? "checked" : ""}>
                <span>Trung bình - nhắn tin tự nhiên</span>
              </label>
              <label class="difficulty-toggle">
                <input type="radio" name="difficulty" value="hard" ${difficulty === "hard" ? "checked" : ""}>
                <span>Khó - không gợi ý</span>
              </label>
            </div>

            <div class="stack" style="gap: 12px; margin-top: 12px;">
              <button id="start-training-btn" ${!selectedId ? "disabled" : ""} style="width: 100%;"><span aria-hidden="true">▶</span> Tiếp tục</button>
              <button class="outline" id="back-dashboard" style="width: 100%;"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

  app.querySelectorAll("[data-scenario-id]").forEach((card) => {
    const selectCard = () => {
      acknowledgeTap();
      const id = card.dataset.scenarioId;
      state.selectedScenario = scenarioById(id);
      renderScenarioPicker();
    };
    card.addEventListener("click", selectCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCard();
      }
    });
  });

  const diffRadios = app.querySelectorAll('input[name="difficulty"]');
  diffRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.selectedDifficulty = e.target.value;
    });
  });

  app.querySelector("#start-training-btn").addEventListener("click", async () => {
    acknowledgeTap();
    const diff = state.selectedDifficulty || "easy";
    await createTrainingSession(diff);
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
  const diffMap = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
  const diffLabel = diffMap[state.session?.difficulty] || "Dễ";

  render(`
    <section class="panel">
      <div class="consent-layout stack" style="max-width: 520px; margin: 0 auto;">
        <div class="ui-card stack" style="padding: 24px; gap: 20px;">
          <h2 style="font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.4rem; margin: 0;">Xác nhận trước khi bắt đầu</h2>
          
          <!-- Preview Card -->
          <div style="background: var(--background); border: 2px solid var(--border); border-radius: var(--radius); padding: 16px; display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2.25rem; background: var(--card); width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${state.selectedScenario?.id === "fake_bank" ? "🏦" : state.selectedScenario?.id === "fake_police" ? "🏢" : state.selectedScenario?.id === "fake_relative" ? "👤" : "💼"}
            </div>
            <div style="flex: 1;">
              <p style="font-size: 0.75rem; color: var(--muted-foreground); margin: 0;">Tình huống đang luyện</p>
              <p style="font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 1rem; color: var(--foreground); margin: 2px 0 0;">${escapeHtml(state.selectedScenario?.title || scenarioById(state.session?.scenarioId)?.title || "")}</p>
            </div>
            <span class="build-badge" style="border: 0; background: var(--primary-soft); color: var(--primary); padding: 4px 10px; font-weight: 700; border-radius: 100px;">
              ${escapeHtml(diffLabel)}
            </span>
          </div>

          <!-- Warning note -->
          <div class="notice danger-note" style="border-left-color: var(--danger); background: var(--danger-bg); color: #7F1D1D; border-radius: var(--radius); padding: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 1.2rem;">⚠️</span>
              <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem;">Lưu ý quan trọng:</strong>
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; line-height: 1.6;">
              <li>Không cung cấp thông tin cá nhân thật</li>
              <li>Không nhập OTP, CCCD, mật khẩu</li>
              <li>Không nhập số tài khoản thật</li>
              <li>AI đóng vai người lừa đảo để bạn luyện tập phản xạ</li>
              <li>Bạn có thể dừng luyện tập bất cứ lúc nào</li>
            </ul>
          </div>

          <div class="notice" style="border-left-color: var(--primary); background: var(--primary-soft); border-radius: var(--radius); padding: 12px 16px; font-size: 0.85rem; font-weight: 500; color: var(--foreground);">
            🔒 Nội dung trò chuyện <strong>không được lưu lại</strong> và chỉ dùng để luyện tập.
          </div>

          <label class="consent-row" style="display: flex; gap: 12px; align-items: start; padding: 16px; border: 2px solid var(--border); border-radius: var(--radius); background: var(--background); cursor: pointer; user-select: none;">
            <input id="simulation-consent" type="checkbox" style="width: 24px; height: 24px; margin-top: 2px;">
            <span style="font-size: 0.9rem; font-weight: 700; color: var(--foreground); line-height: 1.4;">Tôi hiểu đây là mô phỏng và cam kết không nhập thông tin thật.</span>
          </label>

          <div class="entry-actions" style="display: grid; grid-template-columns: 1fr; gap: 12px;">
            <button id="start-chat" disabled style="width: 100%; min-height: 56px;"><span aria-hidden="true">▶</span> Tôi hiểu, bắt đầu luyện tập</button>
            <button class="outline" id="cancel-consent" style="width: 100%; min-height: 56px;"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
          </div>
        </div>
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
  const diffMap = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
  const diffLabel = diffMap[state.session?.difficulty] || "Dễ";

  let icon = "💼";
  if (scenario?.id === "fake_bank") icon = "🏦";
  else if (scenario?.id === "fake_police") icon = "🏢";
  else if (scenario?.id === "fake_relative") icon = "👤";

  render(`
    <section class="panel">
      <div class="chat-layout">
        <!-- Desktop Sidebar -->
        <aside class="chat-sidebar">
          <div class="stack" style="gap: 8px;">
            <p class="eyebrow" style="margin: 0;">Tình huống đang luyện</p>
            <h3 style="margin: 0; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; color: var(--foreground);">${escapeHtml(scenario?.title || "Mô phỏng lừa đảo")}</h3>
            <p class="subtitle" style="margin: 0; font-size: 0.8rem;">Cấp độ thử thách: <strong>${escapeHtml(diffLabel)}</strong></p>
          </div>

          <div class="notice danger-note" style="border-left-color: var(--danger); background: var(--danger-bg); color: #7F1D1D; font-size: 0.8rem; padding: 14px;">
            <strong>Chú ý:</strong> Đây là kịch bản giả lập để thử phản xạ của bạn. Tuyệt đối không nhập thông tin cá nhân hay tài khoản thật.
          </div>

          <div class="notice" style="border-left-color: var(--success); background: var(--success-bg); color: var(--secondary-foreground); font-size: 0.8rem; padding: 14px;">
            <strong>Mẹo luyện tập:</strong> Hãy phát hiện các dấu hiệu ép buộc chuyển khoản gấp, hối thúc thời gian, hoặc yêu cầu mật khẩu/OTP.
          </div>
        </aside>

        <!-- Chat main window -->
        <div class="chat-main">
          <div class="chat-topbar" style="background: var(--primary); color: white; padding: 12px 20px; border: 0;">
            <div class="chat-topbar-info" style="color: white;">
              <h2 style="margin: 0; color: white; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.1rem;">${escapeHtml(scenario?.title || "Mô phỏng")}</h2>
              <p class="subtitle" style="margin: 2px 0 0; color: rgba(255,255,255,0.7); font-size: 0.75rem;">Mức độ: <strong>${escapeHtml(diffLabel)}</strong></p>
            </div>
            <button class="warning" id="stop-chat" style="min-height: 40px; height: 40px; padding: 8px 16px; font-size: 0.85rem; font-family: 'Nunito', sans-serif; border-radius: 8px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; box-shadow: none;"><span aria-hidden="true">■</span> Dừng luyện tập</button>
          </div>

          <div class="chat-warning-strip" style="background: var(--danger-bg); color: #7F1D1D; font-size: 0.75rem; font-weight: 700; text-align: center; padding: 8px 16px; border-bottom: 1px solid var(--border); font-family: 'Nunito', sans-serif;">
            ⚠️ Không nhập OTP, CCCD, mật khẩu, số tài khoản.
          </div>

          <div class="chat-messages" style="background: #F0EDE8; padding: 20px;">
            ${state.messages.length === 0 ? `<div class="bubble ai" style="background: white; border: 2px solid var(--border); border-radius: 12px; border-top-left-radius: 2px; padding: 12px 16px; font-size: 0.95rem;">Chào bạn, đây là buổi luyện tập. Hãy nhắn tin đầu tiên để bắt đầu.</div>` : ""}
            ${state.messages.map((message) => `
              <div class="bubble ${message.role}" style="font-size: 0.95rem; border-radius: 12px; padding: 12px 16px; max-width: 80%; margin-bottom: 8px; line-height: 1.4; ${message.role === 'user' ? 'background: var(--primary); color: white; align-self: flex-end; border-top-right-radius: 2px;' : 'background: white; border: 2px solid var(--border); color: var(--foreground); align-self: flex-start; border-top-left-radius: 2px;'}">
                <div class="bubble-content">${escapeHtml(message.content)}</div>
              </div>
            `).join("")}
            ${state.isSending ? '<div class="bubble ai typing" style="font-style: italic; color: var(--muted-foreground); background: rgba(255,255,255,0.7); border: 2px solid var(--border); border-radius: 12px; border-top-left-radius: 2px; padding: 12px 16px; align-self: flex-start; font-size: 0.95rem;">AI đang trả lời...</div>' : ""}
            ${state.safetyNotices.map((notice) => `<div class="notice danger-note" style="border-radius: var(--radius); margin-top: 8px; padding: 10px 14px; font-size: 0.85rem;">${escapeHtml(notice)}</div>`).join("")}
          </div>

          <form class="chat-form" id="chat-form" style="padding: 12px 20px; gap: 12px; background: var(--card); border-top: 2px solid var(--border);">
            <textarea id="chat-input" maxlength="${state.runtime.maxMessageLength}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn" ${state.isSending ? "disabled" : ""} style="min-height: 52px; max-height: 120px; font-size: 0.95rem; border-radius: 10px;"></textarea>
            <div class="chat-actions" style="height: 52px;">
              <button type="submit" ${state.isSending ? "disabled" : ""} style="height: 52px; font-size: 1rem; border-radius: 10px; font-family: 'Nunito', sans-serif;"><span aria-hidden="true">➤</span> Gửi</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `, { chatScreen: true });

  const container = app.querySelector(".chat-messages");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }

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
    return "AI chưa sẵn sàng. Đang dùng tin nhắn mẫu an toàn.";
  }
  if (reason === "GEMINI_TIMEOUT") {
    return "AI trả lời chậm. Tạm dùng tin nhắn mẫu an toàn để không bị gián đoạn.";
  }
  if (reason === "GEMINI_HTTP_429") {
    return "AI đang bận. Tạm dùng tin nhắn mẫu an toàn.";
  }
  return "AI gặp lỗi tạm thời. Tạm dùng tin nhắn mẫu an toàn.";
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

function getTaxonomyLabel(technique) {
  const lower = String(technique || "").toLowerCase();
  if (lower.includes("authority")) return "Giả danh cơ quan / uy tín (Authority)";
  if (lower.includes("fear")) return "Thao túng nỗi sợ (Fear)";
  if (lower.includes("urgency")) return "Hối thúc / Cấp bách (Urgency)";
  if (lower.includes("scarcity")) return "Khan hiếm / Cơ hội (Scarcity)";
  if (lower.includes("social proof") || lower.includes("reciprocity")) return "Lòng tin / Quan hệ (Social Proof/Reciprocity)";
  return "Tâm lý thao túng (Psychological Manipulation)";
}

function renderFlags(flags, className, emptyText) {
  if (!flags || flags.length === 0) {
    return `<li class="flag-item ${className}" style="border-left-color: var(--border); background: var(--background); font-weight: normal; color: var(--muted-foreground); font-size: 0.9rem; padding: 12px 16px;">${escapeHtml(emptyText)}</li>`;
  }
  return flags.map((flag) => {
    const taxLabel = getTaxonomyLabel(flag.techniqueLabel || flag.technique);
    return `
      <li class="flag-item ${className}" style="border-left: 6px solid ${className === 'success' ? 'var(--success)' : 'var(--warning)'}; background: ${className === 'success' ? 'var(--success-bg)' : 'var(--warning-bg)'}; border-radius: var(--radius); padding: 14px 18px; margin-bottom: 8px;">
        <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: ${className === 'success' ? '#1A5C35' : '#78350F'};">${escapeHtml(flag.label)}</strong><br>
        <em style="font-size: 0.8rem; font-weight: 700; color: var(--muted-foreground); display: inline-block; margin: 2px 0 6px; font-family: 'Nunito', sans-serif; font-style: normal;">Nhóm dấu hiệu: ${escapeHtml(taxLabel)}</em><br>
        <span style="font-size: 0.85rem; display: block; margin-top: 4px; line-height: 1.4; color: var(--foreground);">${escapeHtml(flag.recommendation || flag.explanation || "")}</span>
      </li>
    `;
  }).join("");
}

function renderDashboardView(dashboard) {
  const diffMap = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
  const diffLabel = diffMap[dashboard.difficulty] || "Dễ";

  const shareCardHtml = `
    <div class="share-card-wrapper" id="share-card-visual" style="background: var(--primary); border-radius: var(--radius); padding: 24px; color: white; position: relative; overflow: hidden; max-width: 600px; margin: 12px 0 24px; font-family: 'Nunito', sans-serif;">
      <div class="share-card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <p class="share-card-title" style="margin: 0; font-weight: 900; font-size: 1.1rem; color: white;">🛡️ Luyện nhận diện lừa đảo</p>
          <p class="share-card-subtitle" style="margin: 2px 0 0; font-size: 0.75rem; opacity: 0.7; text-transform: uppercase;">AI Scam Inoculation</p>
        </div>
        <span class="share-card-badge" style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 700;">${escapeHtml(dashboard.scenarioTitle)}</span>
      </div>
      <div class="share-card-body" style="display: flex; align-items: center; gap: 24px; margin-bottom: 16px;">
        <span class="share-card-score" style="font-size: 3rem; font-weight: 900; line-height: 1;">${dashboard.immunityScore}%</span>
        <div class="share-card-text" style="font-size: 1rem; line-height: 1.4;">
          <strong>Người luyện: ${escapeHtml(state.userName || "Người thân")}</strong><br>
          Đã nhận biết được ${dashboard.recognizedCount} / ${dashboard.totalCount} dấu hiệu lừa đảo.
        </div>
      </div>
      <div class="share-card-lesson" style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 14px 18px; font-style: italic; font-size: 1.05rem; line-height: 1.5; border-left: 4px solid rgba(255,255,255,0.5);">
        <strong>Bài học rút ra:</strong> ${escapeHtml(dashboard.nextRecommendation.replace(/Nên luyện kịch bản.*/, "").trim() || "Luôn chậm lại, kiểm chứng thông tin và không chia sẻ mã OTP cho bất kỳ ai.")}
      </div>
      <div class="share-card-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; opacity: 0.7; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 12px;">
        <span>Luyện tập giúp tăng đề kháng lừa đảo</span>
        <strong>AI Riser Vietnam 2026</strong>
      </div>
    </div>
  `;

  render(`
    <section class="panel">
      <div class="results-layout">
        <!-- Cột trái -->
        <div class="stack" style="gap: 20px;">
          <div class="ui-card stack" style="padding: 24px; gap: 20px;">
            <h2 style="font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.4rem; margin: 0;">Kết quả luyện tập</h2>
            <p class="subtitle" style="margin: -10px 0 0; font-size: 0.85rem; color: var(--muted-foreground);">${escapeHtml(dashboard.scenarioTitle)} - Cấp độ ${escapeHtml(diffLabel)}</p>

            <!-- Score Radial ring wrapper -->
            <div class="score-card" style="background: var(--primary-soft); border: 2px solid var(--border); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px;">
              <div class="score-container-radial" style="width: 80px; height: 80px; position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(26,111,168,0.1)" stroke-width="8" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="var(--primary)" stroke-width="8" fill="none"
                          stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (dashboard.immunityScore / 100) * 251.2}"
                          stroke-linecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <div class="score-number" style="position: absolute; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.35rem; color: var(--primary);">${dashboard.immunityScore}%</div>
              </div>
              <div>
                <strong style="font-family: 'Nunito', sans-serif; font-size: 1rem; color: var(--foreground);">Nhận biết ${dashboard.recognizedCount} / ${dashboard.totalCount} dấu hiệu cảnh báo.</strong>
                <p style="font-size: 0.85rem; color: var(--muted-foreground); margin: 4px 0 0; line-height: 1.3;">
                  ${dashboard.immunityScore >= 80 ? 'Rất tốt! Bạn có đề kháng rất vững vàng trước kịch bản này.' : dashboard.immunityScore >= 50 ? 'Khá tốt! Bạn đã nhận ra một số dấu hiệu, hãy luyện tập thêm.' : 'Hãy chú ý hơn và tiếp tục luyện tập để rèn luyện phản xạ.'}
                </p>
              </div>
            </div>

            <div class="notice" style="border-left-color: var(--warning); background: var(--warning-bg); color: #78350F; border-radius: var(--radius); padding: 16px; font-size: 0.9rem;">
              <strong>Lời khuyên tiếp theo:</strong><br>
              <span style="display: block; margin-top: 4px; line-height: 1.4;">${escapeHtml(dashboard.nextRecommendation)}</span>
            </div>

            <h3 style="font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; margin: 10px 0 0;">Trích đoạn hội thoại cần chú ý</h3>
            <ul class="flag-list">
              ${dashboard.highlights.length === 0 ? '<li class="flag-item" style="border-left-color: var(--border); background: var(--background); font-weight: normal; color: var(--muted-foreground); font-size: 0.9rem; padding: 12px 16px;">Không có trích đoạn nào cần chú ý.</li>' : dashboard.highlights.map((item) => `
                <li class="flag-item ${item.status === "recognized" ? "success" : ""}" style="border-left: 6px solid ${item.status === "recognized" ? "var(--success)" : "var(--warning)"}; background: ${item.status === "recognized" ? "var(--success-bg)" : "var(--warning-bg)"}; border-radius: var(--radius); padding: 14px 18px;">
                  <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: ${item.status === "recognized" ? "#1A5C35" : "#78350F"};">${escapeHtml(item.label)}</strong><br>
                  <span style="font-size: 0.85rem; display: block; margin-top: 4px; font-style: italic; color: var(--foreground);">"${escapeHtml(item.evidenceText || "Không có trích đoạn.")}"</span>
                </li>
              `).join("")}
            </ul>

            <div class="result-actions pt-2" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px;">
              <button id="copy-share" style="flex: 1; min-width: 140px; font-family: 'Nunito', sans-serif; font-weight: 700;"><span aria-hidden="true">⧉</span> Sao chép tin nhắn</button>
              <button class="secondary" id="restart" style="flex: 1; min-width: 140px; font-family: 'Nunito', sans-serif; font-weight: 700;"><span aria-hidden="true">↻</span> Luyện tiếp</button>
              <button class="secondary" id="home" style="flex: 1; min-width: 140px; font-family: 'Nunito', sans-serif; font-weight: 700;"><span aria-hidden="true">⌂</span> Trang chính</button>
            </div>
          </div>
        </div>

        <!-- Cột phải -->
        <div class="stack" style="gap: 20px;">
          <div class="ui-card stack" style="padding: 24px; gap: 16px;">
            <h3 style="font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; margin: 0;">Dấu hiệu bạn đã nhận biết</h3>
            <ul class="flag-list">${renderFlags(dashboard.recognizedRedFlags, "success", "Bạn chưa nhận biết được dấu hiệu nào.")}</ul>

            <h3 style="font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; margin: 10px 0 0;">Dấu hiệu cần chú ý (bỏ sót)</h3>
            <ul class="flag-list">${renderFlags(dashboard.missedRedFlags, "", "Tuyệt vời! Bạn không bỏ sót dấu hiệu nào.")}</ul>

            <h3 style="font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.15rem; margin: 10px 0 0;">Thẻ chia sẻ kết quả</h3>
            <p class="subtitle" style="margin: -10px 0 0; font-size: 0.85rem; color: var(--muted-foreground);">Bạn có thể chụp màn hình thẻ dưới đây để chia sẻ với người thân.</p>
            ${shareCardHtml}

            <div class="stack" style="gap: 6px; margin-top: 8px;">
              <strong style="font-family: 'Nunito', sans-serif; font-size: 0.9rem; color: var(--foreground);">Tóm tắt gửi người thân</strong>
              <textarea id="share-summary" readonly style="min-height: 80px; font-size: 0.85rem; border-radius: 8px; background: var(--background); border: 2px solid var(--border); resize: none; color: var(--foreground);">${escapeHtml(dashboard.shareSummary)}</textarea>
            </div>
          </div>
        </div>
      </div>
    </section>
  `);

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

function renderHotlines() {
  render(`
    <section class="panel">
      <div class="consent-layout stack" style="max-width: 600px; margin: 0 auto;">
        <div class="ui-card stack" style="padding: 24px; gap: 20px;">
          <h2 style="font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.4rem; margin: 0;">Đường dây nóng xác minh chính thức</h2>
          <p class="subtitle" style="margin: -10px 0 0; font-size: 0.85rem; color: var(--muted-foreground);">Khi nhận được thông tin đáng ngờ, hãy lập tức liên hệ các đường dây nóng chính thống dưới đây để xác minh.</p>

          <div class="notice danger-note" style="border-left-color: var(--danger); background: var(--danger-bg); color: #7F1D1D; font-size: 0.85rem; padding: 14px 18px;">
            <strong>Nguyên tắc cốt lõi:</strong> Tuyệt đối không gọi các số điện thoại lạ do người nhắn gửi. Chỉ liên lạc qua các đầu số do nhà nước và các tổ chức công bố chính thức.
          </div>

          <ul class="flag-list">
            <li class="flag-item success" style="border-left: 6px solid var(--success); background: var(--success-bg); border-radius: var(--radius); padding: 14px 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div>
                  <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: #1A5C35;">Phòng chống mua bán người: 111</strong><br>
                  <span style="font-size: 0.8rem; color: var(--muted-foreground); display: block; margin-top: 4px; line-height: 1.3;">Hỗ trợ phòng chống lừa đảo việc làm, lao động cưỡng bức ra nước ngoài.</span>
                </div>
                <a href="tel:111" style="background: var(--success); color: white; padding: 8px 16px; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-family: 'Nunito', sans-serif; display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--shadow);">📞 Gọi</a>
              </div>
            </li>
            <li class="flag-item success" style="border-left: 6px solid var(--success); background: var(--success-bg); border-radius: var(--radius); padding: 14px 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div>
                  <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: #1A5C35;">Cổng cảnh báo an toàn thông tin</strong><br>
                  <span style="font-size: 0.8rem; color: var(--muted-foreground); display: block; margin-top: 4px; line-height: 1.3;">Báo cáo lừa đảo: <strong>canhbao.khonggianmang.vn</strong></span>
                </div>
                <a href="https://canhbao.khonggianmang.vn" target="_blank" rel="noopener noreferrer" style="background: var(--primary); color: white; padding: 8px 16px; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-family: 'Nunito', sans-serif; display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--shadow);">🔗 Mở</a>
              </div>
            </li>
            <li class="flag-item success" style="border-left: 6px solid var(--success); background: var(--success-bg); border-radius: var(--radius); padding: 14px 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div>
                  <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: #1A5C35;">Bảo vệ người tiêu dùng: 1800.6838</strong><br>
                  <span style="font-size: 0.8rem; color: var(--muted-foreground); display: block; margin-top: 4px; line-height: 1.3;">Tư vấn, tiếp nhận phản ánh về các hợp đồng dịch vụ, bẫy du lịch, gói tập gym.</span>
                </div>
                <a href="tel:18006838" style="background: var(--success); color: white; padding: 8px 16px; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-family: 'Nunito', sans-serif; display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--shadow);">📞 Gọi</a>
              </div>
            </li>
            <li class="flag-item" style="border-left: 6px solid var(--border); background: var(--background); border-radius: var(--radius); padding: 14px 18px;">
              <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: var(--foreground);">Ngân hàng của bạn (Số mặt sau thẻ)</strong><br>
              <span style="font-size: 0.8rem; color: var(--muted-foreground); display: block; margin-top: 4px; line-height: 1.3;">Gọi số hotline in trực tiếp ở mặt sau thẻ ngân hàng để yêu cầu khóa tài khoản khẩn cấp.</span>
            </li>
            <li class="flag-item" style="border-left: 6px solid var(--border); background: var(--background); border-radius: var(--radius); padding: 14px 18px;">
              <strong style="font-family: 'Nunito', sans-serif; font-size: 0.95rem; color: var(--foreground);">Đường dây nóng doanh nghiệp</strong><br>
              <span style="font-size: 0.8rem; color: var(--muted-foreground); display: block; margin-top: 4px; line-height: 1.3;">Tìm kiếm thông tin liên hệ chính thức trên trang web có chứng nhận đăng ký để xác minh tin tuyển dụng.</span>
            </li>
          </ul>

          <button class="outline" id="back-dashboard" style="width: 100%; min-height: 56px; font-family: 'Nunito', sans-serif; font-weight: 700; margin-top: 8px;"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
        </div>
      </div>
    </section>
  `);

  app.querySelector("#back-dashboard").addEventListener("click", () => {
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
    state.safetyNotices = ["Đã sao chép tin nhắn tóm tắt."];
    announceStatus("Đã sao chép tin nhắn tóm tắt.");
  } catch {
    state.safetyNotices = ["Lỗi sao chép. Bạn hãy chọn và sao chép thủ công."];
    announceStatus("Lỗi sao chép. Bạn hãy chọn và sao chép thủ công.");
  }
  renderDashboardView({
    ...dashboard,
    shareSummary: text,
  });
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
      <div class="consent-layout stack" style="max-width: 520px; margin: 0 auto;">
        <div class="ui-card stack" style="padding: 24px; gap: 20px;">
          <h2 style="font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.4rem; margin: 0;">Không thể tiếp tục</h2>
          <div class="notice danger-note" style="border-left-color: var(--danger); background: var(--danger-bg); color: #7F1D1D; border-radius: var(--radius); padding: 16px; font-size: 0.9rem;">${escapeHtml(message)}</div>
          <button id="back-home" style="width: 100%; min-height: 56px; font-family: 'Nunito', sans-serif; font-weight: 700;"><span aria-hidden="true">←</span> Hủy bỏ / Quay lại</button>
        </div>
      </div>
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
  if (location.hash.startsWith("#hotlines")) {
    renderHotlines();
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
initAccessibility();
loadScenarios().catch((error) => renderError(error.message));
