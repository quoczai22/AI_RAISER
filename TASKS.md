# TASKS - AI Scam Inoculation

File này chỉ giữ context và task đang hoạt động. Lịch sử review cũ của static UI nằm tại `TASKS_ARCHIVE.md`.

## Context Hiện Tại

- Sản phẩm: AI Scam Inoculation, training/inoculation, không phải scam detection.
- Backend: Node.js, Gemini server-side, safety validator, scoring engine và session API.
- Frontend mới: React + Vite trong `src/react-app/`.
- Static frontend cũ: `src/public/`, chỉ là fallback trong migration.
- Build React: `npm.cmd run frontend:build`.
- Chạy React qua Node: `USE_REACT=true` rồi chạy `node server.js`.
- Submission chính: Google AI Studio public project link.

## Luật Review

- Không đổi scope MVP hoặc biến sản phẩm thành detection.
- Gemini chỉ dùng `gemini-3.6-flash`, server-side; không temperature/top_p/top_k.
- Chat dynamic; taxonomy chỉ gồm Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không lưu/yêu cầu OTP, CCCD, mật khẩu, số tài khoản hoặc link thật.
- Nút `Dừng luyện tập` luôn có; score là pure function.
- Không tin báo cáo tự khai; đọc diff/source/test/browser thật.
- Chưa kiểm chứng phải ghi `CHƯA XÁC MINH ĐƯỢC`.

## TASK-009 / TASK-010 - Static UI Legacy

Trạng thái: `rejected-needs-rework`; không còn là đường triển khai chính. Static UI dirty local chưa commit/push. Chi tiết ở `TASKS_ARCHIVE.md`.

## TASK-011 - React Frontend Migration, Sprint 1

Trạng thái: `done`.

Đã accept: React/Vite skeleton, EntryForm, AppShell, Dashboard, accessibility toggle, Node serve React build và static fallback. Build, unit test, HTTP smoke và browser dashboard QA đã pass.

Giới hạn: scenario, consent, chat, result, hotline chưa migrate ở Sprint 1.

## TASK-012 - React Scenario Picker And Consent

### Trạng Thái

`done`

### Đã Accept

- ScenarioPicker lấy dữ liệu thật từ `/api/scenarios`, chọn scenario và cấp độ bằng UI React.
- Tiếp tục tạo session thật qua `/api/sessions`.
- SimulationConsent đọc session/scenario, hiển thị cảnh báo an toàn và yêu cầu checkbox trước khi xác nhận consent.
- Nút `Hủy bỏ/Quay lại` hoạt động; sau consent chuyển đúng sang chat stub của Sprint 2.
- Browser mobile `390x844`: không horizontal overflow, accessibility controls vẫn hoạt động.
- `npm.cmd run frontend:build`: pass với quyền filesystem phù hợp.
- `node tests/run-tests.js`: pass.
- `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: pass.

Giới hạn: chat, result và hotline React vẫn chưa migrate; Gemini flow đầy đủ: `CHƯA XÁC MINH ĐƯỢC`.

## TASK-013 - React Chat Flow

Trạng thái: `ready-for-execution`.

### Prompt Cho Antigravity

```text
Đọc `AGENTS.md` và `TASKS.md`, thực hiện TASK-013 - React Chat Flow.

Migrate chat roleplay từ static UI sang React, dùng session/chat API hiện tại và giữ Gemini server-side. Được sửa `src/react-app/*`, `README.md`, `TASKS.md`; server chỉ sửa tối thiểu nếu cần. Không sửa service Gemini, safety, scoring, database contract; không xóa static fallback; không thêm feature/scenario.

Acceptance criteria:
- React chat đọc đúng session, hiển thị lịch sử và gửi tin nhắn qua API thật.
- Giữ dynamic roleplay, safety warning, nút `Dừng luyện tập`, textarea và `Gửi`.
- Không hiển thị/lưu OTP, CCCD, mật khẩu, số tài khoản hoặc link thật.
- Mobile 390x844 và desktop 1440x900 không tràn ngang; `Chữ to` + `Tương phản cao` không cắt safety control.
- Unit test, HTTP smoke test và browser QA pass; Gemini fallback phải hiển thị minh bạch nếu xảy ra.

Sau khi xong: cập nhật TASK-013 thành `done-pending-review`, ghi diff/test/browser evidence thật, không tự commit/push. Chưa kiểm chứng được thì ghi `CHƯA XÁC MINH ĐƯỢC`.
```

## Quy Trình Bàn Giao

Sau mỗi task/rework: ghi diff ngắn, test/browser evidence, prompt copy được ngay bên dưới, chuyển `done-pending-review`, không tự push. Codex review trước khi accept và commit source.

Sau khi accept: rút gọn task, giữ quyết định/lỗi/giới hạn quan trọng; chuyển log dài sang `TASKS_ARCHIVE.md`.
