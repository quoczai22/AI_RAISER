const sensitivePatterns = [
  {
    key: "account",
    pattern: /\b(số tài khoản|stk|tài khoản)\s*[:=]?\s*(?:\d[\s.-]?){6,19}\b/gi,
    placeholder: "$1 [MASKED_ACCOUNT]",
  },
  {
    key: "phone",
    pattern: /(?:\+?84|0)(?:3|5|7|8|9)(?:[\s.-]?\d){8}\b/g,
    placeholder: "[MASKED_PHONE]",
  },
  {
    key: "cccd_12",
    pattern: /\b\d{12}\b/g,
    placeholder: "[MASKED_CCCD]",
  },
  {
    key: "cccd_9",
    pattern: /\b\d{9}\b/g,
    placeholder: "[MASKED_CCCD]",
  },
  {
    key: "card",
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    placeholder: "[MASKED_CARD]",
  },
  {
    key: "otp_labeled",
    pattern: /\b(otp|mã otp|mã xác nhận|mã xác minh|mã bảo mật)\b[^.\n]{0,20}?\b\d{4,8}\b/gi,
    placeholder: "$1 [MASKED_OTP]",
  },
  {
    key: "password",
    pattern: /(mật khẩu|password)\b.*/gi,
    placeholder: "$1 [MASKED_PASSWORD]",
  },
];

const blockedOutputRules = [
  {
    key: "otp_labeled",
    pattern: /\b(otp|mã otp|mã xác nhận|mã xác minh|mã bảo mật)\b[^.\n]{0,20}?\b\d{4,8}\b/i,
  },
  {
    key: "url",
    pattern: /https?:\/\/\S+|\b(?:www\.)\S+/i,
  },
  {
    key: "phone",
    pattern: /(?:\+?84|0)(?:3|5|7|8|9)(?:[\s.-]?\d){8}\b/,
  },
  {
    key: "cccd",
    pattern: /\b(\d{12}|\d{9})\b/,
  },
  {
    key: "card_or_account",
    pattern: /\b(?:\d[ -]?){13,19}\b/,
  },
  {
    key: "account_number",
    pattern: /\b(số tài khoản|stk|tài khoản)\s*[:=]?\s*(?:\d[\s.-]?){6,19}\b/i,
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
      let normalizedKey = item.key;
      if (item.key.startsWith("cccd")) normalizedKey = "cccd";
      if (item.key.startsWith("otp")) normalizedKey = "otp";
      detected.add(normalizedKey);
      if (prefix && (item.key === "account" || item.key === "otp_labeled" || item.key === "password")) {
        return `${prefix} [MASKED_${normalizedKey.toUpperCase()}]`;
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
  return /(lừa đảo|giả mạo|scam|không tin|gọi hotline|hotline|xác minh|verify|kiểm tra lại|check|không chuyển tiền|không\s+(cung cấp|gửi|đọc|cho).{0,40}(otp|mã xác minh|mật khẩu|password|cccd|thông tin|số thẻ|số tài khoản))/i.test(
    String(input || ""),
  );
}
