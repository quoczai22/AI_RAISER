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

Trạng thái: `done`. React/Vite skeleton, EntryForm, AppShell, Dashboard, accessibility toggle, Node serve React build và static fallback đã được accept.

## TASK-012 - React Scenario Picker And Consent

Trạng thái: `done`. Scenario/API, cấp độ, tạo session, consent bắt buộc, cảnh báo an toàn và quay lại đã được accept; build, test và mobile browser QA pass.

## TASK-013 - React Chat Flow

Trạng thái: `done`. ChatShell đọc session/lịch sử, gửi tin nhắn, fallback an toàn, warning, masking, `Dừng luyện tập` và mobile accessibility QA đã được accept.

Giới hạn chung: Gemini live ổn định nhiều lượt vẫn `CHƯA XÁC MINH ĐƯỢC`.

## TASK-014 - React Result Scorecard

### Trạng Thái

`done`

### Đã Accept

- ResultScorecard đọc dashboard/session data thật sau khi dừng chat.
- Hiển thị score `0/100`, red flags đúng/tổng số và 5 nhóm taxonomy hợp lệ.
- Hiển thị pattern khái quát, gợi ý luyện tiếp và share summary nhẹ có nút sao chép.
- Có `Trang chính` và `Luyện tiếp` hoạt động.
- Browser mobile `390x844` với `Chữ to` + `Tương phản cao`: score/pattern/nút không bị cắt, không tràn ngang.
- Browser desktop `1440x900`: không tràn ngang.
- Build, unit test và HTTP smoke test pass.

Giới hạn: hotline/resource hub React chưa migrate; Gemini live nhiều lượt: `CHƯA XÁC MINH ĐƯỢC`.

## TASK-015 - React Resource Hub / Hotline

Trạng thái: `ready-for-execution`.

### Prompt Cho Antigravity

```text
Đọc `AGENTS.md` và `TASKS.md`, thực hiện TASK-015 - React Resource Hub / Hotline.

Migrate màn Resource Hub/Số điện thoại xác minh từ static UI sang React, chỉ hiển thị nguồn/kênh xác minh đã được phép trong PRD và nghiên cứu hiện tại. Được sửa `src/react-app/*`, `README.md`, `TASKS.md`; server chỉ sửa tối thiểu nếu cần.

Không sửa Gemini, safety, scoring, database contract; không tự đoán số hotline; không thêm feature/scenario; không xóa static fallback. Với thông tin chưa có nguồn chính thức, dùng hướng dẫn chung như gọi số ở mặt sau thẻ hoặc website chính thức, không gắn nhãn hotline đã xác minh.

Acceptance criteria:
- React Resource Hub có thể mở từ Dashboard bằng thao tác rõ ràng.
- Nội dung thuần Việt, dễ hiểu, chỉ dùng contact/source đã được chấp thuận.
- Không có số điện thoại placeholder hoặc số tự đoán.
- Mobile 390x844 và desktop 1440x900 không tràn ngang.
- `Chữ to` + `Tương phản cao` hoạt động.
- Unit test, HTTP smoke test và browser QA pass.

Sau khi xong: cập nhật TASK-015 thành `done-pending-review`, ghi diff/test/browser evidence thật, không tự commit/push. Chưa kiểm chứng được thì ghi `CHƯA XÁC MINH ĐƯỢC`.
```

## Quy Trình Bàn Giao

Sau mỗi task/rework: ghi diff ngắn, test/browser evidence, prompt copy được ngay bên dưới, chuyển `done-pending-review`, không tự push. Codex review trước khi accept và commit source.

Sau khi accept: rút gọn task, giữ quyết định/lỗi/giới hạn quan trọng; chuyển log dài sang `TASKS_ARCHIVE.md`.
