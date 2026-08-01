import { getScenario } from "./scenarioService.js";
import { requireStoredSession } from "./sessionService.js";
import { calculateScore } from "./scoringEngine.js";
import { sessions } from "./store.js";

export function completeSession(sessionId) {
  const session = requireStoredSession(sessionId);
  const scenario = getScenario(session.scenarioId);
  if (!session.score) {
    session.score = calculateScore({ session, scenario });
  }
  session.status = "completed";
  session.completedAt = session.completedAt || new Date().toISOString();
  sessions.set(session.id, session);
  return buildDashboard({ session, scenario });
}

export function getDashboard(sessionId) {
  const session = requireStoredSession(sessionId);
  const scenario = getScenario(session.scenarioId);
  if (!session.score) {
    session.score = calculateScore({ session, scenario });
  }
  return buildDashboard({ session, scenario });
}

export function buildDashboard({ session, scenario }) {
  const score = session.score || calculateScore({ session, scenario });
  const highlights = buildHighlights({ session, scenario });
  return {
    sessionId: session.id,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    status: session.status,
    immunityScore: score.immunityScore,
    recognizedCount: score.recognizedCount,
    totalCount: score.totalCount,
    recognizedRedFlags: score.recognizedRedFlags.map(formatFlag),
    missedRedFlags: score.missedRedFlags.map((flag) => ({
      ...formatFlag(flag),
      recommendation: recommendationFor(flag.key),
    })),
    highlights,
    nextRecommendation: recommendNextScenario(scenario.id, score.missedRedFlags),
  };
}

function buildHighlights({ session, scenario }) {
  return session.redFlagEvents.slice(-6).map((event) => {
    const flag = scenario.redFlags.find((item) => item.key === event.redFlagKey);
    return {
      redFlagKey: event.redFlagKey,
      label: flag?.label || event.redFlagKey,
      status: event.status,
      evidenceText: event.evidenceText,
    };
  });
}

function formatFlag(flag) {
  return {
    key: flag.key,
    label: flag.label,
    explanation: flag.explanation,
  };
}

function recommendationFor(key) {
  const recommendations = {
    authority_pressure: "Dừng lại và xác minh qua kênh chính thức trước khi làm theo yêu cầu.",
    urgency_threat: "Không quyết định khi bị ép thời gian; gọi người thân hoặc hotline chính thức để kiểm tra.",
    request_for_sensitive_info: "Không gửi OTP, mật khẩu, CCCD, số thẻ hoặc số tài khoản qua chat.",
    unofficial_channel: "Không xử lý yêu cầu tài chính qua kênh lạ; mở app hoặc gọi hotline chính thức.",
    identity_mismatch: "Gọi lại số cũ của người thân hoặc hỏi câu chỉ người thật biết.",
    request_to_transfer_money: "Không chuyển tiền trước khi xác minh bằng cuộc gọi hoặc gặp trực tiếp.",
    request_to_keep_secret: "Không giữ bí mật khi bị yêu cầu chuyển tiền; hỏi thêm người thân đáng tin cậy.",
  };
  return recommendations[key] || "Luyện thói quen dừng lại, kiểm tra nguồn và hỏi người thân trước khi hành động.";
}

function recommendNextScenario(currentScenarioId, missedFlags) {
  const missedKeys = new Set(missedFlags.map((flag) => flag.key));
  if (currentScenarioId !== "fake_police" && missedKeys.has("authority_pressure")) {
    return "Luyện tiếp kịch bản giả công an/cơ quan chức năng để xử lý áp lực thẩm quyền.";
  }
  if (currentScenarioId !== "fake_relative" && missedKeys.has("request_to_transfer_money")) {
    return "Luyện tiếp kịch bản giả người thân cần tiền gấp để rèn xác minh danh tính.";
  }
  if (currentScenarioId !== "fake_bank") {
    return "Luyện tiếp kịch bản giả ngân hàng để rèn phản xạ không cung cấp mã xác minh.";
  }
  return "Luyện lại cùng kịch bản với câu trả lời khác để kiểm tra phản xạ trước áp lực mới.";
}
