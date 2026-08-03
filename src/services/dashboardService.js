import { getScenario } from "./scenarioService.js";
import { requireCompletedSession, requireConsentedSession } from "./sessionService.js";
import { calculateScore } from "./scoringEngine.js";
import { sessions } from "./store.js";

export async function completeSession(sessionId) {
  const session = await requireConsentedSession(sessionId);
  const scenario = getScenario(session.scenarioId);
  if (!session.score) {
    session.score = calculateScore({ session, scenario });
  }
  session.status = "completed";
  session.completedAt = session.completedAt || new Date().toISOString();
  await sessions.set(session.id, session);
  return buildDashboard({ session, scenario });
}

export async function getDashboard(sessionId) {
  const session = await requireCompletedSession(sessionId);
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
      "Pattern: authority. Họ mượn danh tổ chức để tạo niềm tin. Hãy kiểm chứng qua kênh chính thức trước.",
    urgency_threat:
      "Pattern: urgency + fear. Họ ép bạn làm ngay và làm bạn sợ. Hãy chậm lại trước khi hành động.",
    request_for_sensitive_info:
      "Pattern: authority + fear. Họ xin thông tin riêng tư bằng danh nghĩa uy tín. Không gửi mã, giấy tờ hoặc tài khoản qua chat.",
    unofficial_channel:
      "Pattern: authority. Họ tự xưng là tổ chức lớn nhưng kéo bạn sang kênh lạ. Hãy kiểm tra lại ở kênh chính thức.",
    identity_mismatch:
      "Pattern: social proof/reciprocity. Họ lợi dụng lòng tin với người quen. Hãy xác minh danh tính bằng cách khác.",
    request_to_transfer_money:
      "Pattern: urgency + social proof/reciprocity. Họ dùng chuyện gấp hoặc tình cảm để xin tiền. Hãy gọi xác minh trước.",
    request_to_keep_secret:
      "Pattern: fear + social proof/reciprocity. Họ bảo giữ bí mật để bạn không hỏi người khác. Đây là dấu hiệu nguy hiểm.",
    fake_company_authority:
      "Pattern: authority. Tên công ty lớn có thể bị mạo danh. Hãy kiểm tra tin tuyển dụng ở kênh chính thức.",
    urgency_scarcity_fee:
      "Pattern: urgency + scarcity. Họ nói sắp hết chỗ và cần đóng phí ngay. Đừng trả tiền chỉ vì bị thúc ép.",
    unrealistic_salary_social_proof:
      "Pattern: social proof/reciprocity. Họ hứa lương cao và nói nhiều người đã thành công. Hãy nghi ngờ lời hứa quá tốt.",
  };
  return recommendations[key] || `Pattern: ${technique.key}. Hãy nhận diện dấu hiệu chung. Đừng học thuộc một câu trả lời mẫu.`;
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
      key: "urgency + social proof/reciprocity",
      label: "urgency + social proof/reciprocity - việc gấp cộng quan hệ thân quen",
    },
    request_to_keep_secret: {
      key: "fear + social proof/reciprocity",
      label: "fear + social proof/reciprocity - cô lập nạn nhân bằng bí mật và cảm xúc",
    },
    fake_company_authority: {
      key: "authority",
      label: "authority - mượn danh công ty lớn",
    },
    urgency_scarcity_fee: {
      key: "urgency + scarcity",
      label: "urgency + scarcity - ép giữ chỗ gấp bằng cơ hội khan hiếm",
    },
    unrealistic_salary_social_proof: {
      key: "social proof/reciprocity",
      label: "social proof/reciprocity - lời chứng đám đông và hứa hẹn thu nhập",
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
  if (currentScenarioId !== "fake_job" && missedKeys.has("urgency_scarcity_fee")) {
    return "Luyện tiếp kịch bản tuyển dụng giả để nhận diện phí giữ chỗ và cơ hội khan hiếm giả.";
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
