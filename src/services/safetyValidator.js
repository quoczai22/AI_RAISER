const sensitivePatterns = [
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

const blockedOutputPatterns = [
  /https?:\/\/\S+/i,
  /\b(?:www\.)\S+/i,
  /\b(?:\+?84|0)(?:\d[\s.-]?){8,10}\b/,
  /\b(?:\d[ -]?){13,19}\b/,
  /(cài|tải|install).{0,40}(app|ứng dụng|apk|remote|điều khiển)/i,
  /(chuyển khoản|gửi tiền).{0,40}\b\d{6,}\b/i,
  /(gửi|cung cấp|đọc).{0,30}(otp|mã xác minh|mật khẩu|password|cccd|số thẻ|số tài khoản)/i,
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
  const reasons = blockedOutputPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.toString());

  return {
    safe: reasons.length === 0,
    reasons,
  };
}

export function isStopRequest(input) {
  return /\b(dừng|stop|kết thúc|thôi|không muốn tiếp tục)\b/i.test(String(input || ""));
}

export function looksLikeScamRecognition(input) {
  return /(lừa đảo|giả mạo|không tin|gọi hotline|xác minh|kiểm tra lại|không cung cấp|không gửi otp|không chuyển tiền)/i.test(
    String(input || ""),
  );
}
