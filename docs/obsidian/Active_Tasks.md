# Active Tasks

File này chỉ hiển thị task đang hoạt động. Nguồn trạng thái là [[../../TASKS]].

## Đang Hoạt Động

### [[../../TASKS#TASK-015 - React Resource Hub / Hotline|TASK-015 - React Resource Hub / Hotline]]

- Trạng thái hiện tại: `rejected-needs-rework`
- Mục tiêu: migrate Resource Hub/Số điện thoại xác minh sang React với nội dung thuần Việt, không tự đoán hotline.
- Lỗi đã xác minh:
  - `Hotlines.jsx` gán `113` cho nhãn `Hotline NCSC`, mapping này sai.
  - `canhbao.khonggianmang.vn` là website nhưng UI ghi `Hotline:`, gây hiểu nhầm.
- Phạm vi rework theo TASKS: `src/react-app/components/Hotlines.jsx`, `src/react-app/*` nếu cần cho label/layout, `TASKS.md`.
- Không được sửa: Gemini, safety, scoring, database, static fallback, feature/scenario mới.
- Bàn giao cần có: `done-pending-review`, diff ngắn, test thật, browser evidence, không tự commit/push.

## Task Tiếp Theo

Review TASK-015 sau rework bằng source thật, `npm.cmd run frontend:build`, `node tests/run-tests.js`, HTTP smoke, mobile `390x844`, desktop `1440x900`, và kiểm tra `Chữ to` + `Tương phản cao`.

## Không Còn Là Đường Chính

TASK-009/TASK-010 static UI legacy đã chuyển sang archive và không còn là hướng triển khai chính. Xem [[../../TASKS_ARCHIVE]] khi cần audit.
