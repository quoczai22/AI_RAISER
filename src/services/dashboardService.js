import { getScenario } from "./scenarioService.js";
import { requireCompletedSession, requireConsentedSession } from "./sessionService.js";
import { calculateScore } from "./scoringEngine.js";
import { sessions } from "./store.js";

export function completeSession(sessionId) {
  const session = requireConsentedSession(sessionId);
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
  const session = requireCompletedSession(sessionId);
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
    userName: session.userName,
    difficulty: session.difficulty,
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
    shareSummary: buildShareSummary({ session, scenario, score }),
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
  const technique = techniqueFor(flag.key);
  return {
    key: flag.key,
    label: flag.label,
    technique: technique.key,
    techniqueLabel: technique.label,
    explanation: flag.explanation,
  };
}

function recommendationFor(key) {
  const technique = techniqueFor(key);
  const recommendations = {
    authority_pressure:
      "Pattern: authority. Khi một người tự xưng có quyền lực và yêu cầu hành động ngay, hãy nhận diện đây là áp lực thẩm quyền trước khi tin vào danh xưng.",
    urgency_threat:
      "Pattern: urgency + fear. Khi bị thúc phải làm ngay hoặc bị dọa hậu quả, điểm đáng học là nhận ra áp lực thời gian đang làm giảm khả năng kiểm chứng.",
    request_for_sensitive_info:
      "Pattern: authority + fear. Yêu cầu thông tin nhạy cảm thường đi kèm danh nghĩa uy tín hoặc đe dọa; red flag là hành vi đòi bí mật, không phải câu chữ cụ thể.",
    unofficial_channel:
      "Pattern: authority. Kẻ thao túng thường mượn danh tổ chức nhưng kéo bạn sang kênh không chính thức; hãy nhận diện mâu thuẫn giữa danh xưng và kênh liên hệ.",
    identity_mismatch:
      "Pattern: reciprocity/social proof. Scam giả người quen lợi dụng lòng tin sẵn có; red flag là danh tính chưa được kiểm chứng, không phải chỉ một câu nhắn lạ.",
    request_to_transfer_money:
      "Pattern: urgency + reciprocity. Yêu cầu tiền thường được bọc bằng tình huống gấp hoặc quan hệ thân quen; hãy nhận diện kỹ thuật kéo cảm xúc đi trước kiểm chứng.",
    request_to_keep_secret:
      "Pattern: fear + reciprocity. Yêu cầu giữ bí mật cô lập bạn khỏi người có thể giúp kiểm chứng; đây là kỹ thuật thao túng quan hệ và nỗi sợ.",
  };
  return recommendations[key] || `Pattern: ${technique.key}. Hãy luyện nhận diện kỹ thuật thao túng chung thay vì học thuộc một câu trả lời mẫu.`;
}

function techniqueFor(key) {
  const techniques = {
    authority_pressure: {
      key: "authority",
      label: "authority - giả danh quyền lực/uy tín",
    },
    urgency_threat: {
      key: "urgency + fear",
      label: "urgency + fear - ép gấp và đe dọa hậu quả",
    },
    request_for_sensitive_info: {
      key: "authority + fear",
      label: "authority + fear - dùng danh nghĩa/đe dọa để xin dữ liệu nhạy cảm",
    },
    unofficial_channel: {
      key: "authority",
      label: "authority - danh xưng uy tín nhưng kênh liên hệ bất thường",
    },
    identity_mismatch: {
      key: "social proof/reciprocity",
      label: "social proof/reciprocity - lợi dụng lòng tin quan hệ",
    },
    request_to_transfer_money: {
      key: "urgency + reciprocity",
      label: "urgency + reciprocity - việc gấp cộng quan hệ thân quen",
    },
    request_to_keep_secret: {
      key: "fear + reciprocity",
      label: "fear + reciprocity - cô lập nạn nhân bằng bí mật và cảm xúc",
    },
  };
  return techniques[key] || {
    key: "authority",
    label: "authority - tín hiệu thao túng cần kiểm chứng",
  };
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

function buildShareSummary({ session, scenario, score }) {
  const missed = score.missedRedFlags.slice(0, 2).map((flag) => flag.label).join(", ");
  const needsPractice = missed || "duy trì thói quen kiểm tra nguồn trước khi hành động";
  return `${session.userName || "Mình"} vừa hoàn thành buổi luyện AI Scam Inoculation: ${scenario.title}. Điểm miễn dịch: ${score.immunityScore}/100. Cần luyện thêm: ${needsPractice}.`;
}
