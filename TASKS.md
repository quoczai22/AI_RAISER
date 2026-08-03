# TASKS - AI Scam Inoculation

File này là task artifact cho Antigravity thực thi. Codex giữ vai trò manager/reviewer: không tự viết code tính năng, chỉ cập nhật định hướng, acceptance criteria và review theo `AGENTS.md`.

## Context Snapshot

- Repo hiện tại: Node.js server + static web UI, không framework nặng.
- Commit mới nhất đã thấy: `c58d8d4 feat: optimize mobile layout for senior users`.
- App đã có luồng MVP: nhập tên -> trang chính -> chọn scam/cấp độ -> consent -> chat Gemini/fallback -> dashboard điểm -> share summary.
- Gemini phải là AI duy nhất trong sản phẩm cuối: `gemini-3.6-flash`, server-side, không `temperature`, `top_p`, `top_k`.
- Submission chính: Google AI Studio project link public. GitHub/Cloud Run chỉ là bonus/fallback.
- Rủi ro lớn nhất hiện tại: chưa test Import from GitHub vào Google AI Studio Build mode.

## Review Checklist Bắt Buộc

Mọi task/commit của Antigravity phải được Codex review theo checklist này trước khi chấp nhận:

- Không biến sản phẩm thành scam detection. Đây vẫn là training/inoculation app.
- Gemini vẫn là AI duy nhất trong runtime sản phẩm cuối và chỉ gọi server-side.
- Chat vẫn dynamic, không chuyển thành decision tree cố định.
- Feedback chỉ dùng 5 taxonomy: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không đưa "câu trả lời đúng" kiểu học thuộc; chỉ dạy pattern thao túng khái quát.
- Score vẫn là pure function: red flags đúng / tổng red flags.
- `safetyValidator` vẫn chặn/mask OTP, CCCD, tài khoản, phone, link thật, mật khẩu.
- Nút Stop/Dừng luôn có trong chat.
- Accessibility không bị phá: chữ to, tương phản cao, nút lớn, mobile layout dễ bấm.
- Không đụng remote config, production database, secret, hoặc kiến trúc lớn nếu chưa có approval.

## P0 - Spike: Chuẩn Bị Test Import From GitHub Vào Google AI Studio

### Mục Tiêu

Chuẩn bị repo ở trạng thái sạch và dễ import vào Google AI Studio Build mode để người dùng test sớm khả năng tương thích của kiến trúc Node/static hiện tại.

### Scope Cho Antigravity

- Chỉ kiểm tra và chỉnh tài liệu/cấu hình tối thiểu nếu cần để repo dễ hiểu khi import.
- Không refactor sang React/Next.js trước khi người dùng test Import from GitHub.
- Không đổi backend/module boundaries.
- Không thay model Gemini hoặc thêm AI khác.
- Không commit `.env`, key, local-only notes, artifact tạm.

### Việc Cần Làm

1. Kiểm tra repo sạch:
   - `git status --short --ignored`
   - Xác nhận chỉ `.env` và `LOCAL_STATUS.md` là ignored/local-only.

2. Kiểm tra README có đủ thông tin import/demo:
   - Project là training, không detection.
   - Stack hiện tại: Node.js server + static UI.
   - Cách chạy local: `node server.js`.
   - Cách test: `node tests/run-tests.js` và `tests/http-smoke.ps1`.
   - Gemini key server-side qua env, không lộ client.
   - Hướng nộp chính là AI Studio project public link.

3. Kiểm tra file rác/build artifact:
   - Không có `node_modules`, logs, coverage, screenshot tạm, secret.
   - `.gitignore` và `.dockerignore` vẫn chặn `.env`, local notes, runtime artifacts.

4. Chạy test tối thiểu trước khi người dùng import:
   - `node tests/run-tests.js`
   - `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`

5. Nếu phát hiện AI Studio Import có thể không nhận custom Express/server:
   - Không tự rewrite kiến trúc.
   - Ghi rủi ro vào phần "Cần quyết định" bên dưới.
   - Đề xuất 2 hướng: giữ Node/static để fallback hoặc port sang AI Studio/React sau khi test import thất bại.

### Acceptance Criteria

- Repo import candidate không chứa secret/trash tracked.
- README đủ để người dùng hoặc judge hiểu cách chạy và mục tiêu.
- Unit test và HTTP smoke test pass.
- Không có thay đổi code sản phẩm ngoài phạm vi cleanup/tài liệu.
- Nếu có commit, commit message phải rõ ràng và diff nhỏ.

### Priority

P0 - làm trước mọi feature khác.

## P1 - Review Sau Khi Người Dùng Test Import

### Mục Tiêu

Khi người dùng báo kết quả Import from GitHub vào AI Studio, Codex/Antigravity quyết định bước tiếp theo dựa trên dữ liệu thật.

### Nhánh Quyết Định

- Nếu import OK:
  - Tập trung kiểm thử demo flow trong AI Studio.
  - Xác nhận Gemini key server-side.
  - Chuẩn bị public share link.

- Nếu import fail do custom server:
  - Tạo plan port tối thiểu sang pattern AI Studio Build mode.
  - Giữ nguyên module boundaries: orchestrator, Gemini client server-side, safety validator, scoring engine, dashboard service.
  - Không mở rộng MVP.

- Nếu import OK nhưng Gemini key/quota lỗi:
  - Không sửa bằng fallback giả làm AI thật.
  - Ghi rõ risk và chuẩn bị demo script nói thẳng về quota.

### Acceptance Criteria

- Có quyết định rõ: keep current architecture, port minimal, hoặc fix config.
- Không rewrite lớn khi chưa có kết quả import.
- Vẫn bám `AGENTS.md`.

### Priority

P1 - sau P0 và sau khi người dùng có kết quả import.

## P1 - Demo Readiness Audit

### Mục Tiêu

Đảm bảo demo 3 phút ổn định trước khi nộp.

### Việc Cần Làm

- Chạy full MVP flow local từ đầu đến dashboard.
- Kiểm tra mobile viewport cho nhóm người lớn tuổi/người ít dùng công nghệ.
- Kiểm tra fallback message không quá kỹ thuật.
- Kiểm tra Stop button trong chat.
- Kiểm tra feedback không có câu trả lời mẫu.
- Nếu Gemini quota còn `GEMINI_HTTP_429`, ghi risk rõ trong `RiskReport.md` hoặc docs test.

### Acceptance Criteria

- Test pass.
- Demo script phản ánh đúng trạng thái Gemini thật/fallback.
- Không có raw OTP/CCCD/số tài khoản/link thật hiển thị trong UI.

### Priority

P1.

## Cần Người Dùng Làm Song Song

- Vào Google AI Studio (`ai.dev`) -> Build -> nút `+` -> `Import from GitHub`.
- Chọn repo hiện tại và thử import sớm.
- Báo lại cho Codex:
  - Import thành công hay lỗi.
  - Nếu lỗi, chụp/ghi nguyên văn lỗi.
  - AI Studio tạo app theo cấu trúc nào.
  - Gemini key/server-side config có được nhận không.

## Cần Quyết Định

- Chưa quyết định port sang React/Next.js/AI Studio native vì cần kết quả Import from GitHub trước.
- Chưa deploy Cloud Run vì nộp chính là AI Studio public link; Cloud Run chỉ backup nếu còn thời gian.

## Manager Notes

- Codex không tự sửa code tính năng trong mode này.
- Nếu Antigravity commit lệch `AGENTS.md`, Codex ghi "Cần sửa: ..." vào file này thay vì tự vá code.
- Mọi thay đổi lớn về kiến trúc phải chờ người dùng xác nhận.

## Review Log - Antigravity Firestore/Accessibility Changes

Ngày review: 2026-08-03.

### Đã Kiểm Tra

- Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `git log --oneline -12`.
- Kiểm tra worktree: có thay đổi chưa commit ở `package.json`, `server.js`, `src/public/app.css`, `src/public/app.js`, `src/services/chatOrchestrator.js`, `src/services/dashboardService.js`, `src/services/sessionService.js`, `src/services/store.js`, `tests/run-tests.js`; có `package-lock.json` mới; `node_modules/` ignored.
- Chạy `node tests/run-tests.js`: pass.
- Chạy `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: pass.

### Kết Luận Manager

- Accessibility/UI changes nhỏ nhìn chung phù hợp: toggle chữ to/tương phản cao đã xuất hiện thêm ở màn kết quả, màu muted/primary/warning tăng contrast.
- Firestore persistence là thay đổi kiến trúc lớn hơn P0 Import-from-GitHub spike. Không reject tuyệt đối vì `TechnicalDesign.md` từng ghi Firestore optional, nhưng cần sửa trước khi commit/chấp nhận.

### Cần Sửa: Persist Session Sau Mỗi Chat Turn

Mức độ: P0.

Vấn đề:

- `sendChatMessage()` trong `src/services/chatOrchestrator.js` mutate `session.messages`, `session.turnCount`, `session.redFlagEvents`, `session.status`, `session.completedAt`, `session.isProcessing`.
- Sau khi chuyển store sang Firestore async, function không gọi `await sessions.set(session.id, session)` trước khi return/finally.
- Test pass vì in-memory path trả object reference, nhưng Firestore path trả plain object từ `doc.data()`; mutate object đó không tự persist.

Acceptance criteria:

- Sau mỗi chat turn, transcript, red flags, turnCount, status/completedAt phải persist được qua `getSessionMessages()` và `getDashboard()` khi Firestore bật.
- `isProcessing` lock phải được lưu/clear đúng nếu mục tiêu là chống concurrent cross-request; nếu chỉ in-process lock thì ghi rõ giới hạn.
- Thêm test cover store không trả object reference hoặc mock async store để bắt lỗi missing persist.

### Cần Sửa: Không Nuốt Lỗi Firestore Set/Delete Quan Trọng

Mức độ: P1.

Vấn đề:

- `src/services/store.js` đang `console.error(...)` rồi tiếp tục trả success khi Firestore `set/delete` lỗi.
- API có thể báo tạo session/chat thành công nhưng dữ liệu chỉ nằm in-memory trong instance hiện tại, trái kỳ vọng persistence.

Acceptance criteria:

- Quyết định rõ chế độ: strict Firestore khi đã cấu hình project, hoặc fallback minh bạch.
- Nếu strict: throw lỗi 5xx khi Firestore write fail.
- Nếu fallback: response/runtime status/docs phải nói rõ đang fallback in-memory do Firestore unavailable.

### Cần Sửa: Cập Nhật Docs/Test Theo Firestore Hoặc Hoãn Firestore Sau P0

Mức độ: P1.

Vấn đề:

- `Testing.md` vẫn ghi limitation: "Session storage is in-memory".
- `README.md` chưa nói biến môi trường Firestore hoặc cách chạy/deploy với Firestore.
- P0 hiện là test Import from GitHub vào AI Studio; thêm dependency Firestore có thể làm import surface phức tạp hơn trước khi biết AI Studio xử lý custom Node server ra sao.

Acceptance criteria:

- Nếu giữ Firestore: cập nhật README/Testing/RiskReport/runtime docs và đảm bảo package-lock được commit.
- Nếu chưa cần persistence cho P0: revert/hoãn Firestore, giữ repo đơn giản để test AI Studio Import trước.

### Chấp Nhận Được Nếu Sửa Xong

- Vẫn giữ training/inoculation, không detection.
- Gemini vẫn server-side và không thêm AI khác.
- Feedback taxonomy không đổi.
- Safety validator không bị đụng.
- Score engine pure function không bị đụng.
