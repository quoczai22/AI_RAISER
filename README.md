# AI Scam Inoculation

**AI Scam Inoculation** là MVP tham gia **AI Riser Vietnam 2026**. Sản phẩm không phát hiện lừa đảo thay người dùng; mục tiêu là **huấn luyện khả năng nhận diện social engineering** bằng các tình huống lừa đảo mô phỏng có kiểm soát.

Người dùng nhập tên, chọn tình huống/cấp độ, đồng ý tham gia mô phỏng, trò chuyện với Gemini trong vai kẻ lừa đảo giả lập, sau đó xem điểm miễn dịch và các dấu hiệu thao túng đã nhận diện hoặc bỏ lỡ.

## Điểm Chính

- Training scam-immunity app, **không phải scam detection**.
- Gemini `gemini-3.6-flash` là AI chính trong sản phẩm cuối.
- Không dùng `temperature`, `top_p`, `top_k`.
- Gemini được gọi server-side, không lộ API key ra client.
- Chat động, không phải decision tree cố định.
- Có 10 kịch bản MVP: giả ngân hàng, giả người thân, giả công an/cơ quan chức năng, tuyển dụng giả, deepfake, du lịch giá rẻ, gói tập/tín dụng ngầm, chuyển nhầm tiền, hoàn tiền TMĐT, VNeID/dịch vụ công giả.
- Score minh bạch: số red flags nhận diện đúng / tổng red flags của kịch bản.
- Feedback chỉ dạy pattern thao túng: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Safety validator mask/chặn OTP, CCCD, số tài khoản, số thẻ, số điện thoại, mật khẩu, link thật.
- Có hỗ trợ accessibility nhẹ: chữ to, tương phản cao, nút lớn, phản hồi khi bấm.
- UI ưu tiên người lớn tuổi/người ít dùng công nghệ tại Việt Nam trên điện thoại: nhãn thuần Việt, không yêu cầu mật khẩu/OTP, nút to, có nút `Hủy bỏ / Quay lại` rõ ràng.

## Stack

- Node.js server, không cần framework nặng.
- React + Vite web UI (được tự động phục vụ tại `dist/` khi server chạy).
- Gemini API server-side.
- Session storage mặc định dùng Map in-memory an toàn cho demo; Firestore chỉ bật khi cấu hình rõ ràng.
- Dockerfile sẵn sàng cho Cloud Run nếu cần public backup URL.

## Luồng Demo

```text
Nhập tên
→ Trang chính cá nhân
→ Chọn loại scam + cấp độ
→ Đồng ý mô phỏng
→ Chat roleplay với Gemini
→ Kết thúc
→ Trang kết quả điểm miễn dịch + dấu hiệu cảnh báo + tóm tắt chia sẻ
```

## Cách Chạy Local (React UI)

Yêu cầu:
- Node.js 20 trở lên.
- PowerShell nếu chạy script test trên Windows.

Chạy demo chính (React UI):

```bash
# Step 1: Build React bundle
npm run frontend:build

# Step 2: Launch server
node server.js
```

Mở trình duyệt:
```text
http://localhost:3000
```

*Ghi chú phục vụ:*
- Backend Node server mặc định tự động phục vụ React UI tại thư mục `dist/` (sau khi đã build `npm run frontend:build`).
- Nếu muốn phục vụ giao diện tĩnh legacy cũ để đối chiếu, chạy với `USE_REACT=false`:
  - Windows PowerShell: `$env:USE_REACT="false"; node server.js`
  - Linux/macOS: `USE_REACT=false node server.js`

Health check:
```text
http://localhost:3000/healthz
```

Runtime status (không lộ secret):
```text
http://localhost:3000/api/runtime-status
```

## Cấu Hình Môi Trường

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
FIRESTORE_PROJECT_ID=your_gcp_project_id
ENABLE_FIRESTORE=false
FRAME_ANCESTORS='self' https://aistudio.google.com https://*.googleusercontent.com https://*.run.app
```

- **Firestore (Lưu trữ lâu dài & Bảo mật IAM)**: Mặc định app dùng Map in-memory để demo. Firestore chỉ bật khi cấu hình `FIRESTORE_PROJECT_ID`, hoặc set `ENABLE_FIRESTORE=true`. Toàn bộ thao tác read/write Firestore đều thực hiện ở Node.js server qua IAM/Admin SDK server-side (`@google-cloud/firestore`), không import Firebase Web SDK ở trình duyệt. Mọi truy cập client trực tiếp bị chặn hoàn toàn bởi `firestore.rules` (default deny `allow read, write: if false`). Khi bật, document chỉ lưu metadata buổi luyện, score dạng số/mã dấu hiệu và mã taxonomy theo allowlist; tuyệt đối không lưu tên người dùng, transcript, OTP/CCCD/tài khoản/điện thoại/link thật, `evidenceText` hoặc mô tả chi tiết của score.
- **AI Studio / Cloud Run iframe**: `FRAME_ANCESTORS` mặc định cho phép Google AI Studio và Cloud Run preview nhúng app. Nếu triển khai môi trường riêng, có thể siết lại biến này.
- **Gemini AI**: Nếu chưa có `GEMINI_API_KEY`, app vẫn chạy bằng fallback an toàn để demo luồng sản phẩm. Tuy nhiên demo cuối cho AI Riser cần cấu hình Gemini thật để chứng minh tính AI-native.

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
- `docs/accessibility_compliance.md`: ghi chú áp dụng accessibility theo Thông tư 26/2020/TT-BTTTT và WCAG.

## Lưu Ý An Toàn

Không dùng dữ liệu thật khi demo. Không nhập OTP, CCCD, số tài khoản, số thẻ, mật khẩu hoặc link thật vào chat.
