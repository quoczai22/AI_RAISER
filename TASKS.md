# TASKS - AI Scam Inoculation

File này chỉ giữ context và task đang hoạt động. Lịch sử review cũ của static UI nằm tại `TASKS_ARCHIVE.md`.

## Context Hiện Tại

- Sản phẩm: AI Scam Inoculation, training/inoculation, không phải scam detection.
- Backend: Node.js, Gemini server-side, safety validator, scoring engine và session API.
- Frontend chính: React + Vite trong `src/react-app/`; static `src/public/` chỉ là fallback.
- Build: `npm.cmd run frontend:build`.
- React qua Node: `USE_REACT=true` rồi chạy `node server.js`.
- Submission chính: Google AI Studio public project link.

## Luật Review

- Không đổi scope MVP hoặc biến sản phẩm thành detection.
- Gemini chỉ `gemini-3.6-flash`, server-side; không temperature/top_p/top_k.
- Chat dynamic; taxonomy chỉ Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không lưu/yêu cầu OTP, CCCD, mật khẩu, số tài khoản hoặc link thật.
- Nút `Dừng luyện tập` luôn có; score là pure function.
- Không tin báo cáo tự khai; đọc diff/source/test/browser thật.
- Chưa kiểm chứng phải ghi `CHƯA XÁC MINH ĐƯỢC`.

## TASK-009 / TASK-010 - Static UI Legacy

Trạng thái: `rejected-needs-rework`; không còn là đường triển khai chính. Static UI dirty local chưa commit/push. Chi tiết ở `TASKS_ARCHIVE.md`.

## TASK-011 - React Frontend Migration, Sprint 1

Trạng thái: `done`.

Đã accept: React/Vite skeleton, EntryForm, AppShell, Dashboard, accessibility toggle, Node serve React build và static fallback. Build, unit test, HTTP smoke và browser dashboard QA pass.

Giới hạn: các route nghiệp vụ đã được migrate ở Sprint 2/3; result/hotline còn chờ.

## TASK-012 - React Scenario Picker And Consent

Trạng thái: `done`.

Đã accept: ScenarioPicker lấy `/api/scenarios`, chọn scenario/cấp độ; tạo session thật; SimulationConsent đọc session, cảnh báo an toàn, checkbox bắt buộc, Hủy bỏ/Quay lại; browser mobile `390x844`, build, unit và HTTP smoke pass.

## TASK-013 - React Chat Flow

### Trạng Thái

`done`

### Đã Accept

- ChatShell React đọc session và lịch sử qua API hiện tại.
- Gửi tin nhắn qua `/api/sessions/:id/messages`, hiển thị user/AI/fallback message và trạng thái đang xử lý.
- Giữ warning an toàn, masking hiển thị dữ liệu nhạy cảm, textarea, `Gửi` và `Dừng luyện tập`.
- Dừng chat gọi complete API và chuyển sang result stub.
- Browser `390x844` với `Chữ to` + `Tương phản cao`: gửi tin nhắn, fallback hiển thị minh bạch, không tràn ngang, safety controls đầy đủ.
- Build, unit test và HTTP smoke pass.

Giới hạn: result/scorecard/share card và hotline React chưa migrate; Gemini live ổn định nhiều lượt: `CHƯA XÁC MINH ĐƯỢC`.

## TASK-014 - React Result Scorecard

Trạng thái: `ready-for-execution`.

### Prompt Cho Antigravity

```text
Đọc `AGENTS.md` và `TASKS.md`, thực hiện TASK-014 - React Result Scorecard.

Migrate màn kết quả từ static UI sang React, dùng dashboard/session data và scoring API hiện tại. Được sửa `src/react-app/*`, `README.md`, `TASKS.md`; server chỉ sửa tối thiểu nếu cần. Không sửa Gemini service, safety, scoring engine hoặc database contract; không xóa static fallback và không thêm feature/scenario.

Acceptance criteria:
- React result đọc đúng session/dashboard data sau khi kết thúc chat.
- Hiển thị score theo pure function hiện tại, số red flags đúng/tổng số và nhóm taxonomy hợp lệ.
- Chỉ dạy pattern khái quát, không đưa “đáp án đúng” để học thuộc.
- Có nút quay lại trang chính và luyện tiếp; share card nhẹ nếu đã có contract, không biến thành mạng xã hội.
- `Chữ to` + `Tương phản cao` không cắt score, cảnh báo hoặc nút; mobile 390x844 và desktop 1440x900 không tràn ngang.
- Unit test, HTTP smoke test và browser QA pass.

Sau khi xong: cập nhật TASK-014 thành `done-pending-review`, ghi diff/test/browser evidence thật, không tự commit/push. Chưa kiểm chứng được thì ghi `CHƯA XÁC MINH ĐƯỢC`.
```

## Quy Trình Bàn Giao

Sau mỗi task/rework: ghi diff ngắn, test/browser evidence, prompt copy được ngay bên dưới, chuyển `done-pending-review`, không tự push. Codex review trước khi accept và commit source.

Sau khi accept: rút gọn task, giữ quyết định/lỗi/giới hạn quan trọng; chuyển log dài sang `TASKS_ARCHIVE.md`.
