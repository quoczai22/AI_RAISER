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
    police_authority:
      "Pattern: authority. Kẻ xấu tự xưng công an, đọc đúng thông tin cá nhân nạn nhân với giọng nghiêm trọng. Hãy nhớ: Công an không bao giờ làm việc qua mạng hay tin nhắn chat, luôn yêu cầu trực tiếp tại trụ sở.",
    police_fear:
      "Pattern: fear. Kẻ xấu đe dọa bắt giữ, bịa tội danh liên quan đến rửa tiền/ma túy/lừa đảo, gửi lệnh bắt giả và ép giữ bí mật/cô lập nạn nhân. Đây là hành vi thao túng tâm lý bằng nỗi sợ.",
    police_urgency:
      "Pattern: urgency. Công an không bao giờ yêu cầu chuyển tiền vào tài khoản xác minh, không yêu cầu cài ứng dụng ngoài, không yêu cầu OTP.",
    authority_pressure:
      "Pattern: authority. Họ mượn danh tổ chức hoặc Công an để tạo niềm tin. Hãy nhớ: Công an không bao giờ làm việc qua mạng hay tin nhắn chat, luôn yêu cầu trực tiếp tại trụ sở.",
    urgency_threat:
      "Pattern: urgency + fear. Họ đe dọa tội danh và yêu cầu giữ bí mật để cô lập bạn. Hãy chậm lại và liên hệ trực tiếp với người thân hoặc cơ quan chức năng địa phương.",
    request_for_sensitive_info:
      "Pattern: authority + fear. Họ xin thông tin riêng tư bằng danh nghĩa uy tín. Không bao giờ cung cấp số CCCD, tài khoản ngân hàng hoặc mã OTP qua tin nhắn chat.",
    unofficial_channel:
      "Pattern: authority. Họ tự xưng là tổ chức lớn nhưng kéo bạn sang kênh lạ. Hãy kiểm tra lại ở kênh chính thức hoặc gọi trực tiếp tổng đài.",
    identity_mismatch:
      "Pattern: social proof/reciprocity. Họ lợi dụng lòng tin với người quen. Hãy xác minh danh tính bằng cách gọi trực tiếp số điện thoại cũ.",
    request_to_transfer_money:
      "Pattern: urgency + social proof/reciprocity. Công an không bao giờ yêu cầu chuyển tiền vào tài khoản xác minh, không yêu cầu cài ứng dụng ngoài (.apk), và không yêu cầu OTP.",
    request_to_keep_secret:
      "Pattern: fear + social proof/reciprocity. Họ bảo giữ bí mật để bạn không hỏi người khác. Đây là dấu hiệu nguy hiểm thường gặp trong các vụ lừa đảo.",
    fake_company_authority:
      "Pattern: authority. Tên công ty lớn có thể bị mạo danh. Hãy kiểm tra tin tuyển dụng ở các kênh tuyển dụng chính thức của doanh nghiệp.",
    urgency_scarcity_fee:
      "Pattern: urgency + scarcity. Họ nói sắp hết chỗ và cần đóng phí ngay. Đừng bao giờ trả tiền hoặc cọc trước chỉ vì bị thúc ép thời gian.",
    unrealistic_salary_social_proof:
      "Pattern: social proof/reciprocity. Họ hứa hẹn quà tặng lớn hoặc thu nhập cao để tạo hiệu ứng đám đông. Hãy nghi ngờ các cơ hội quá dễ dàng.",
  };
  return recommendations[key] || `Pattern: ${technique.key}. Hãy nhận diện dấu hiệu chung. Đừng học thuộc một câu trả lời mẫu.`;
}

function techniqueFor(key) {
  const techniques = {
    police_authority: {
      key: "authority",
      label: "authority - tự xưng công an, đọc đúng thông tin cá nhân, giọng nghiêm trọng",
    },
    police_fear: {
      key: "fear",
      label: "fear - đe doạ bắt giữ, bịa tội danh, lệnh bắt giả, yêu cầu giữ bí mật/cô lập",
    },
    police_urgency: {
      key: "urgency",
      label: "urgency - ép hành động ngay, không cho thời gian xác minh",
    },
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
    return "Nên luyện kịch bản Giả công an để tập đối phó với kẻ giả danh Công an.";
  }
  if (currentScenarioId !== "fake_relative" && missedKeys.has("request_to_transfer_money")) {
    return "Nên luyện kịch bản Giả người thân để tập thói quen gọi điện xác minh.";
  }
  if (currentScenarioId !== "fake_job" && missedKeys.has("urgency_scarcity_fee")) {
    return "Nên luyện kịch bản Tuyển dụng giả để tránh bị ép cọc tiền giữ chỗ.";
  }
  if (currentScenarioId !== "fake_bank") {
    return "Nên luyện kịch bản Giả ngân hàng để rèn phản xạ không gửi mã OTP.";
  }
  return "Nên tập lại kịch bản này để thử các câu trả lời khác.";
}

function buildShareSummary({ session, scenario, score }) {
  const missed = score.missedRedFlags.slice(0, 2).map((flag) => flag.label).join(", ");
  const needsPractice = missed || "cách tự bảo vệ mình";
  return `${session.userName || "Mình"} tập nhận biết lừa đảo kịch bản "${scenario.title}" đạt ${score.immunityScore}/100 điểm. Cần lưu ý: ${needsPractice}.`;
}
