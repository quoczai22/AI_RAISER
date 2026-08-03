# AI Scam Inoculation

**AI Scam Inoculation** là MVP tham gia **AI Riser Vietnam 2026**. Sản phẩm không phát hiện lừa đảo thay người dùng; mục tiêu là **huấn luyện khả năng nhận diện social engineering** bằng các tình huống lừa đảo mô phỏng có kiểm soát.

Người dùng nhập tên, chọn tình huống/cấp độ, đồng ý tham gia mô phỏng, trò chuyện với Gemini trong vai kẻ lừa đảo giả lập, sau đó xem điểm miễn dịch và các dấu hiệu thao túng đã nhận diện hoặc bỏ lỡ.

## Điểm Chính

- Training scam-immunity app, **không phải scam detection**.
- Gemini `gemini-3.6-flash` là AI chính trong sản phẩm cuối.
- Không dùng `temperature`, `top_p`, `top_k`.
- Gemini được gọi server-side, không lộ API key ra client.
- Chat động, không phải decision tree cố định.
- Có 4 kịch bản MVP: giả ngân hàng, giả người thân, giả công an/cơ quan chức năng, tuyển dụng giả.
- Score minh bạch: số red flags nhận diện đúng / tổng red flags của kịch bản.
- Feedback chỉ dạy pattern thao túng: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Safety validator mask/chặn OTP, CCCD, số tài khoản, số thẻ, số điện thoại, mật khẩu, link thật.
- Có hỗ trợ accessibility nhẹ: chữ to, tương phản cao, nút lớn, phản hồi khi bấm và nhập giọng nói tiếng Việt nếu trình duyệt hỗ trợ.

## Stack

- Node.js server, không cần framework nặng.
- Static web UI.
- Gemini API server-side.
- In-memory session storage cho MVP demo.
- Dockerfile sẵn sàng cho Cloud Run nếu cần public backup URL.

## Luồng Demo

```text
Nhập tên
→ Dashboard cá nhân
→ Chọn loại scam + cấp độ
→ Consent mô phỏng
→ Chat roleplay với Gemini
→ Kết thúc
→ Dashboard điểm miễn dịch + red flags + share summary
```

## Cách Chạy Local

Yêu cầu:

- Node.js 20 trở lên.
- PowerShell nếu chạy script test trên Windows.

Chạy app:

```bash
node server.js
```

Mở trình duyệt:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/healthz
```

Runtime status, không lộ secret:

```text
http://localhost:3000/api/runtime-status
```

## Cấu Hình Gemini

Tạo file `.env` từ `.env.example` hoặc set biến môi trường:

```text
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.6-flash
MAX_CHAT_TURNS=8
GEMINI_TIMEOUT_MS=45000
MAX_MESSAGE_LENGTH=1000
MAX_JSON_BODY_BYTES=65536
MAX_SESSIONS=200
PORT=3000
```

Nếu chưa có `GEMINI_API_KEY`, app vẫn chạy bằng fallback an toàn để demo luồng sản phẩm. Tuy nhiên demo cuối cho AI Riser cần cấu hình Gemini thật để chứng minh tính AI-native.

## Cách Test

Unit/implementation test:

```bash
node tests/run-tests.js
```

Kết quả mong đợi:

```text
Implementation tests passed.
```

HTTP smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

Kết quả mong đợi:

```text
HTTP smoke test passed.
```

Live Gemini probe trước demo:

```powershell
powershell -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1 -DelaySeconds 10
```

Warm-up local hoặc Cloud Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/warmup.ps1 -BaseUrl "http://localhost:3000"
```

## Kịch Bản Demo Nhanh

1. Mở `http://localhost:3000`.
2. Nhập tên hiển thị, ví dụ `Cô Lan`.
3. Chọn `Giả ngân hàng xác minh tài khoản` hoặc `Tuyển dụng giả lương cao`.
4. Chọn cấp độ `Vừa`.
5. Tick consent và bắt đầu mô phỏng.
6. Gửi thử:

```text
Bạn có đúng là ngân hàng không?
```

7. Gửi tiếp:

```text
Tôi sẽ gọi hotline chính thức để kiểm tra lại.
```

8. Xem dashboard điểm miễn dịch, red flags và copy tóm tắt chia sẻ.

Trong chat, có thể bấm `🎙 Nói` để đọc tin nhắn bằng tiếng Việt nếu trình duyệt hỗ trợ Web Speech API.

## Nộp Bài

Artifact nộp chính: **Google AI Studio project link**, bật `Share -> Public`.

GitHub repo và Cloud Run chỉ là bằng chứng phụ/backup. Nếu cần port sang AI Studio, xem:

```text
docs/google_ai_studio_porting.md
```

## Tài Liệu Quan Trọng

- `AGENTS.md`: quy tắc làm việc tối giản của dự án.
- `PRD.md`: yêu cầu sản phẩm.
- `TechnicalDesign.md`: thiết kế kỹ thuật.
- `AIDesign.md`: thiết kế Gemini/prompt/safety.
- `Testing.md`: kế hoạch và coverage test.
- `RiskReport.md`: rủi ro demo, quota, deploy.
- `docs/ai_riser_checklist.md`: checklist trước khi nộp.

## Lưu Ý An Toàn

Không dùng dữ liệu thật khi demo. Không nhập OTP, CCCD, số tài khoản, số thẻ, mật khẩu hoặc link thật vào chat.
