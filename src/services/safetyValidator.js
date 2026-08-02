const sensitivePatterns = [
  {
    key: "cccd",
    pattern: /\b\d{12}\b/g,
    placeholder: "[MASKED_CCCD]",
  },
  {
    key: "otp",
    pattern: /\b\d{4,8}\b/g,
    placeholder: "[MASKED_OTP]",
  },
  {
    key: "card",
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    placeholder: "[MASKED_CARD]",
  },
  {
    key: "phone",
    pattern: /\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/g,
    placeholder: "[MASKED_PHONE]",
  },
  {
    key: "password",
    pattern: /(mật khẩu|password)\s*[:=]?\s*\S+/gi,
    placeholder: "$1 [MASKED_PASSWORD]",
  },
];

const blockedOutputRules = [
  {
    key: "url",
    pattern: /https?:\/\/\S+|\b(?:www\.)\S+/i,
  },
  {
    key: "phone",
    pattern: /\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/,
  },
  {
    key: "cccd",
    pattern: /\b\d{12}\b/,
  },
  {
    key: "card_or_account",
    pattern: /\b(?:\d[ -]?){13,19}\b/,
  },
  {
    key: "app_install",
    pattern: /(cài|tải|install).{0,40}(app|ứng dụng|apk|remote|điều khiển)/i,
  },
  {
    key: "real_money_transfer",
    pattern: /(chuyển khoản|gửi tiền).{0,40}\b\d{6,}\b/i,
  },
  {
    key: "real_sensitive_request",
    pattern: /(gửi|cung cấp|đọc).{0,40}(otp|mã xác minh|mật khẩu|password|cccd|số thẻ|số tài khoản)/i,
    allowIf: /(giả|mô phỏng|placeholder|\[.*\]|không\s+(gửi|cung cấp|đọc)|không bao giờ|từ chối)/i,
  },
];

export function maskSensitiveInput(input) {
  let masked = String(input || "");
  const detected = new Set();

  for (const item of sensitivePatterns) {
    masked = masked.replace(item.pattern, (match, prefix) => {
      detected.add(item.key);
      if (item.key === "password" && prefix) {
        return `${prefix} [MASKED_PASSWORD]`;
      }
      return item.placeholder;
    });
  }

  return {
    masked,
    detected: Array.from(detected),
    changed: masked !== String(input || ""),
  };
}

export function validateAiReply(reply) {
  const text = String(reply || "");
  const reasons = blockedOutputRules
    .filter((rule) => rule.pattern.test(text) && !(rule.allowIf && rule.allowIf.test(text)))
    .map((rule) => rule.key);

  return {
    safe: reasons.length === 0,
    reasons,
  };
}

export function isStopRequest(input) {
  return /\b(dừng|stop|kết thúc|thôi|không muốn tiếp tục)\b/i.test(String(input || ""));
}

export function looksLikeScamRecognition(input) {
  return /(lừa đảo|giả mạo|không tin|gọi hotline|hotline|xác minh|verify|kiểm tra lại|check|không cung cấp|otp|không gửi otp|không chuyển tiền|scam)/i.test(
    String(input || ""),
  );
}
