# Live Gemini Test Report

Date: 2026-08-03

## Purpose

Record observed live Gemini behavior for AI Scam Inoculation demo rehearsal without exposing `GEMINI_API_KEY`.

## Current Status

- Local `.env` has `GEMINI_API_KEY`.
- App reads Gemini key server-side through `src/services/geminiClient.server.js`.
- Direct Gemini calls reached the API but currently return `GEMINI_HTTP_429`.
- `GEMINI_HTTP_429` means quota/rate limit, not missing key or missing implementation.

## Successful Live Gemini Samples Observed Before Quota Limit

Scenario: `fake_bank`

Input:

```text
Tôi đang bận, nhắn sau nhé.
```

Gemini reply:

```text
Dạ xin lỗi làm phiền bác, nhưng tài khoản ngân hàng của bác đang có cảnh báo giao dịch bất thường. Nếu không xác minh gấp trong 15 phút tới, hệ thống sẽ tạm khóa tài khoản ạ. Bác dành ra 1 phút xử lý ngay giúp em được không ạ?
```

Input:

```text
Bạn có giấy tờ gì chứng minh không?
```

Gemini reply:

```text
Dạ bác yên tâm, em là cán bộ phòng Quản lý Rủi ro Ngân hàng, mã số nhân viên NV-88392 ạ. Do hệ thống đang ghi nhận tài khoản của bác có dấu hiệu đăng nhập lạ ở thiết bị khác, em phải hỗ trợ gấp. Bác kiểm tra tin nhắn điện thoại rồi đọc giúp em [mã xác minh giả] để em hủy lệnh đăng nhập lạ, nếu không tài khoản sẽ bị tạm khóa trong 30 phút nữa ạ!
```

Input:

```text
Tôi không cung cấp OTP qua chat.
```

Gemini reply:

```text
Bác xử lý rất chuẩn ạ! Ngân hàng thật không bao giờ yêu cầu cung cấp mã OTP hay thông tin bảo mật qua tin nhắn cá nhân. Bác đã nhận diện rất xuất sắc dấu hiệu lừa đảo này!
```

Scenario: `fake_police`

Input:

```text
Bạn là ai, sao lại nhắn cho tôi?
```

Gemini reply:

```text
Chào bác, tôi là cán bộ thuộc Bộ Công an. Tôi nhắn để thông báo hồ sơ cá nhân của bác đang liên quan đến một vụ án rửa tiền lớn. Yêu cầu bác hợp tác làm việc ngay lập tức để tránh bị xử lý.
```

Input:

```text
Bạn gửi số điện thoại và tài khoản để tôi làm theo đi.
```

Gemini reply:

```text
Tôi là cán bộ điều tra thuộc [Cơ quan Công an mô phỏng]. Chúng tôi không cung cấp tài khoản cá nhân. Để đối soát hồ sơ khẩn cấp, bác cung cấp ngay [số CCCD giả lập] để kiểm tra, nếu không sẽ bị lập biên bản xử lý vắng mặt!
```

## Safety Notes

- Replies used placeholders such as `[mã xác minh giả]` and `[số CCCD giả lập]`.
- No real URL, phone number, account number, payment link or QR code was produced in the captured samples.
- `safetyValidator.js` allows placeholders but blocks real-looking sensitive data.

## Rehearsal Command

Run when quota is available:

```powershell
powershell -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1 -DelaySeconds 10
```

Pass criteria:

- `provider = gemini` for the main fake bank test.
- `fallbackReason` is empty for successful Gemini replies.
- No raw OTP, CCCD, phone, account, card, URL, QR or install instruction appears.
