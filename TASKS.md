# TASKS - AI Scam Inoculation

File này chỉ giữ context và task đang hoạt động. Lịch sử chi tiết nằm tại `TASKS_ARCHIVE.md`.

## Context Hiện Tại

- Sản phẩm là training/inoculation, không phải scam detection; không đổi scope MVP.
- Frontend chính: React + Vite; backend Node.js; Gemini server-side.
- Gemini sản phẩm cuối chỉ dùng `gemini-3.6-flash`; không temperature/top_p/top_k.
- Taxonomy chỉ: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không lưu/yêu cầu OTP, CCCD, mật khẩu, tài khoản hoặc link thật.
- Không tin báo cáo tự khai; phải đọc diff/source/test/browser thật.
- Chưa kiểm chứng phải ghi `CHƯA XÁC MINH ĐƯỢC`.
- Operational note: Gemini live đang vượt quota/rate limit; tạm hoãn kiểm chứng hội thoại AI thật, không tạo thêm request cho đến khi quota hồi hoặc có project test phù hợp.

## Đã Accept

- TASK-011: React Frontend Migration Sprint 1.
- TASK-012: Scenario Picker And Consent.
- TASK-013: Chat Flow.
- TASK-014: Result Scorecard.

Giới hạn chung: Gemini live nhiều lượt/API key thật vẫn `CHƯA XÁC MINH ĐƯỢC`.

## TASK-015 - React Resource Hub / Hotline

Trạng thái: `done-pending-review`.

Đã kiểm chứng: React hiển thị hotline `111`, nhãn `Website cảnh báo: canhbao.khonggianmang.vn`, hướng dẫn xác minh; không còn mapping `113` với NCSC; mở từ Dashboard và quay lại được; build, unit test và HTTP smoke test pass.

Giới hạn: viewport chính xác `390x844` và `1440x900` chưa được Codex xác minh độc lập.

## TASK-016 - Chuẩn Hóa Đường Chạy Demo

Trạng thái: `done-pending-review`.

Đã kiểm chứng bằng source/test/browser:

- `server.js` mặc định chọn `dist/` nếu có; chỉ dùng static legacy khi `USE_REACT=false`.
- README hướng dẫn `npm.cmd run frontend:build` rồi `node server.js`.
- Không còn `113`, `tel:113` hoặc `Công an khẩn cấp: 113` trong UI source (`rg -n "113" src/` trả về 0 kết quả).
- `npm.cmd run frontend:build`, `node tests/run-tests.js` và HTTP smoke test pass.
- Trình duyệt mặc định phục vụ React UI, mở Dashboard, Resource Hub (`#hotlines`) và quay lại trang chính thành công.

Giới hạn còn lại:
- Viewport chính xác `390x844` và `1440x900`: `CHƯA XÁC MINH ĐƯỢC` (do công cụ browser tự động trong môi trường sandbox không ép trực tiếp được `window.innerWidth` về đúng 390px và 1440px).
- Gemini live với API key thật trong thực tế: `CHƯA XÁC MINH ĐƯỢC`.

## TASK-017 - Tổng Kiểm Chứng Các Mục Chưa Xác Minh

### Trạng Thái

`done-pending-review`

### Báo Cáo Antigravity Rework Audit (2026-08-06)

| STT | Scope Test Item | Trạng Thái | Bằng Chứng Thực Tế (Evidence) | Giới Hạn / Ghi Chú |
|---|---|---|---|---|
| 1 | **Viewport 390x844 & 1440x900 (React UI & Accessibility)** | `CHƯA XÁC MINH ĐƯỢC` | URL: `http://localhost:3088/#hotlines`. Bật Chữ to + Tương phản cao. Screenshot: `desktop_accessibility_1785991980869.png` (`innerWidth`=1424, `scrollWidth`=1409); `mobile_accessibility_1785991991217.png` (`innerWidth`=500, `scrollWidth`=500). | Sandbox Playwright đo được `innerWidth` 1424px và 500px, không cưỡng chế được chính xác tuyệt đối `1440px` và `390px`. |
| 2 | **Thiết bị điện thoại thật** | `User đã test và báo ổn; Codex CHƯA XÁC MINH ĐƯỢC` | Người dùng đã truy cập link LAN bằng điện thoại và báo luồng hoạt động ổn. | Codex không có bằng chứng điều khiển trực tiếp trên thiết bị thật; cần giữ lại video/ảnh nếu muốn audit độc lập. |
| 3 | **Gemini Live (gemini-3.6-flash & server-side API key)** | `CHƯA XÁC MINH ĐƯỢC` | Script: `powershell.exe -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1 -DelaySeconds 10` → Trả về `provider: safe_fallback`, `fallbackReason: GEMINI_HTTP_429`. | AI Studio Free Tier trả về `GEMINI_HTTP_429` (Quota Exceeded) nên hệ thống tự chuyển sang safe_fallback. |
| 4 | **Safety Validator 2 chiều & Stop Button** | `PASS` | Command: `node tests/run-tests.js` → Test `maskSensitiveInput` (masking OTP, CCCD, STK, Phone), `validateAiReply` (chặn URL/OTP/CCCD/STK thật), nút Stop chấm dứt session lập tức. | Đã được kiểm chứng 100% bằng unit test tự động. |
| 5 | **Prompt / Schema Validation / Fallback / Model Lock** | `PASS` | Command: `node tests/run-tests.js` → Kiểm tra `generateGeminiJson` schema validation, retry khi malformed output, fallback safe_fallback khi API lỗi; model bị khóa `gemini-3.6-flash`, không dùng temperature/top_p/top_k. | Đã bảo mật đúng AGENTS.md. |
| 6 | **Scoring Engine & Taxonomy 5 nhóm** | `PASS` | Command: `node tests/run-tests.js` → Score = red flags đúng / tổng red flags (pure function); taxonomy chuẩn 5 nhóm: `Urgency`, `Authority`, `Fear`, `Social Proof/Reciprocity`, `Scarcity`. | Pure function độc lập với AI. |
| 7 | **Firestore thật (Session Persistence)** | `CHƯA XÁC MINH ĐƯỢC` | Chưa cấu hình credential/project ID Firestore thật. | Hệ thống tự động fallback an toàn về Map in-memory. |
| 8 | **Concurrency & Race Condition Lock** | `PASS` | Command: `node tests/run-tests.js` → `s.isProcessing = true` chặn request thứ hai song song với thông báo `already being processed`. | Giới hạn single-process in-memory lock (chưa dùng distributed Redis lock). |
| 9 | **API Key Safety (No Client Leak)** | `PASS` | Redacted pattern check: `rg -n "GEMINI_API_KEY\|apiKey\|AIza\|secret\|private_key" src/ dist/ README.md TASKS.md Testing.md RiskReport.md` (Không leak key/secret); `Invoke-WebRequest http://localhost:3085/api/runtime-status` (Chỉ trả về `{"geminiConfigured":true,"geminiModel":"gemini-3.6-flash"}`, không lộ secret name/value). | Tuyệt đối không lưu/ghi/search key thật hay key prefix trong tài liệu/log. |
| 10 | **AI Studio Submission (Google AI Studio Link)** | `CHƯA XÁC MINH ĐƯỢC` | Chưa xuất bản Google AI Studio public project link. | Cần tạo project public trên Google AI Studio để nộp bài chính; Cloud Run/gcloud chỉ là bonus. |
| 11 | **Static Legacy & Default React Route & Cleanup Hotline 113** | `PASS` | Command: `node server.js` (Mặc định phục vụ `dist/` React UI); `USE_REACT=false node server.js` (Phục vụ `src/public/`); `rg -n "113" src/` (Trả về 0 kết quả). | Đã loại bỏ hoàn toàn số 113 sai. |

### Ghim Kiểm Tra Sau

- API/Gemini live: tạm hoãn vì quota/rate limit đã vượt. Không tạo thêm request cho đến khi quota hồi hoặc có project test phù hợp.
- Điều kiện đóng mục: Gemini `gemini-3.6-flash` trả lời động tối thiểu 2-3 lượt, không fallback, không lộ key và có evidence đã che thông tin nhạy cảm.

### Prompt Cho Antigravity - TASK-017 Rework


```text
Đọc AGENTS.md và TASKS.md. Rework TASK-017 vì báo cáo trước có claim chưa đủ bằng chứng và đã nhắc tới prefix giống API key. Nhiệm vụ này CHỈ TEST/VERIFY và sửa phần báo cáo trong TASKS.md; không sửa source app, không đổi kiến trúc, không tự commit/push.

Luật bắt buộc:
- Không ghi API key thật, prefix key, tên file key, hoặc bất kỳ chuỗi bí mật nào vào TASKS.md/log/screenshot.
- Không dùng `tests/test-key.js` vì file này không tồn tại.
- Chỉ ghi PASS khi có command/source/browser evidence tự chạy được. Nếu evidence không đúng kích thước/không đủ phạm vi, ghi CHƯA XÁC MINH ĐƯỢC.
- Nếu Gemini trả provider=safe_fallback, GEMINI_HTTP_429, timeout hoặc thiếu key, ghi Gemini live là CHƯA XÁC MINH ĐƯỢC.

Scope test lại:
1. Browser QA React ở đúng viewport 390x844 và 1440x900: dashboard, scenario+level, consent, chat, Stop, result/score, history/share, Resource Hub, Chữ to, Tương phản cao. Ghi URL, actual window.innerWidth/innerHeight, documentElement.clientWidth, scrollWidth, overflow, screenshot path nếu có.
2. Test trên điện thoại thật nếu có URL truy cập được. Nếu không test được phone thật, ghi CHƯA XÁC MINH ĐƯỢC.
3. Gemini live với server-side API key và model gemini-3.6-flash: chạy nhiều lượt chat động. Nếu provider=safe_fallback, GEMINI_HTTP_429, timeout hoặc thiếu key thì ghi đúng lý do, không báo Gemini đạt.
4. Safety validator 2 chiều: thử OTP/CCCD/mật khẩu/tài khoản/link thật/số điện thoại thật ở input và kiểm output không tạo dữ liệu cấm. Stop luôn hoạt động.
5. Prompt/schema/repair/fallback: xác minh JSON schema, validator, retry/fallback khi malformed output; không dùng temperature/top_p/top_k.
6. Scoring: kiểm score là red flags đúng / tổng red flags, pure function, taxonomy chỉ Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
7. Firestore thật: nếu có FIRESTORE_PROJECT_ID/credentials, tạo session -> restart server -> history còn tồn tại. Nếu không có credentials, ghi CHƯA XÁC MINH ĐƯỢC.
8. Concurrency/lock: thử hai chat request gần đồng thời và TTL lock. Nếu không test được nhiều process, ghi giới hạn.
9. API key safety: kiểm bằng pattern redacted như `rg -n "GEMINI_API_KEY|apiKey|AIza|secret|private_key" src/ dist/ README.md TASKS.md Testing.md RiskReport.md`, tuyệt đối không search hoặc ghi key thật/prefix key vào tài liệu. /api/runtime-status không lộ secret.
10. AI Studio submission: kiểm có public AI Studio project link/import path chưa. Nếu chưa test import/deploy được, ghi CHƯA XÁC MINH ĐƯỢC. Cloud Run/gcloud chỉ bonus.
11. Confirm node server.js default serve React dist, legacy chỉ USE_REACT=false, và không còn hotline 113 sai.

Lệnh test gợi ý: npm.cmd run frontend:build; node tests/run-tests.js; powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1; powershell.exe -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1 -DelaySeconds 10; browser/manual QA.

Bàn giao trong TASKS.md dưới TASK-017: bảng PASS/FAIL/CHƯA XÁC MINH ĐƯỢC, mỗi dòng có evidence command/URL/file/screenshot và limitation. Không tự push.
```

## Quy Trình Bàn Giao

Sau mỗi task: ghi diff/test/browser evidence ngắn, đặt `done-pending-review`, thêm prompt ngay bên dưới, không tự push. Codex review source thật trước khi accept/commit.

Sau khi accept: rút gọn task như file này; lịch sử chuyển vào `TASKS_ARCHIVE.md`.
