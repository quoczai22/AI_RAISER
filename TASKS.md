# TASKS - AI Scam Inoculation

File này chỉ giữ context và task đang hoạt động. Lịch sử review cũ của static UI được lưu tại `TASKS_ARCHIVE.md`; không cần đọc lại cho task mới trừ khi cần audit.

## Context Hiện Tại

- Sản phẩm: AI Scam Inoculation, training/inoculation, không phải scam detection.
- Backend hiện tại: Node.js, Gemini server-side, safety validator, scoring engine và session API đã có.
- Frontend mới: React + Vite trong `src/react-app/`.
- Static frontend cũ: `src/public/`, chỉ giữ làm fallback trong giai đoạn migration.
- React production build: `npm.cmd run frontend:build`.
- React qua Node: `USE_REACT=true` rồi chạy `node server.js`.
- Static fallback: chạy `node server.js` không đặt `USE_REACT=true`.
- Submission chính: Google AI Studio public project link.

## Luật Review

- Không đổi scope MVP, không biến sản phẩm thành detection.
- Gemini sản phẩm cuối chỉ dùng `gemini-3.6-flash`, server-side; không temperature/top_p/top_k.
- Chat dynamic, không decision tree cố định.
- Taxonomy chỉ gồm Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không lưu hoặc yêu cầu OTP, CCCD, mật khẩu, số tài khoản, link thật.
- Nút `Dừng luyện tập` luôn có trong chat.
- Score là pure function: red flags đúng / tổng red flags.
- Không chấp nhận báo cáo tự khai; Codex phải đọc diff/source/test/browser thật.
- Phần chưa kiểm chứng phải ghi đúng `CHƯA XÁC MINH ĐƯỢC`.

## TASK-009 / TASK-010 - Static UI Legacy

Trạng thái: `rejected-needs-rework` và không còn là đường triển khai chính. Các thay đổi static UI hiện còn dirty trong local chưa được commit/push. Không tiếp tục vá static UI nếu không mở task riêng.

Chi tiết lịch sử: `TASKS_ARCHIVE.md`.

## TASK-011 - React Frontend Migration, Sprint 1

### Trạng Thái

`done`

### Đã Chấp Nhận

- React/Vite skeleton trong `src/react-app/`.
- EntryForm, AppShell và Dashboard render được dữ liệu thật cơ bản.
- `Chữ to` và `Tương phản cao` hoạt động.
- Node có thể serve React build khi `USE_REACT=true`.
- Static fallback vẫn giữ nguyên.
- `npm.cmd run frontend:build`: pass khi chạy với quyền filesystem phù hợp.
- `node tests/run-tests.js`: pass.
- `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: pass.
- Browser đã xác minh React boot, nhập tên, dashboard và accessibility toggle tại port riêng.

### Giới Hạn Còn Lại

- React route scenario, consent, chat, result và hotline hiện vẫn là stub.
- Full React flow và Gemini integration trong React: `CHƯA XÁC MINH ĐƯỢC`.
- Chưa được coi là hoàn tất migration frontend.

### Prompt Sprint Tiếp Theo

```text
Đọc `AGENTS.md`, `TASKS.md` và `TASKS_ARCHIVE.md` chỉ khi cần đối chiếu lịch sử. Tiếp tục migration React từ TASK-011, chỉ triển khai Sprint 2: Scenario Picker và Consent.

Được sửa: `src/react-app/*`, `README.md`, `TASKS.md`; server/API chỉ sửa nếu cần tối thiểu. Không sửa `src/services/*`, Gemini, safety, scoring, database contract. Không xóa static fallback và không thêm feature/scenario ngoài MVP.

Acceptance criteria:
- React route chọn tình huống lấy dữ liệu từ `/api/scenarios`.
- Consent dùng session API hiện tại, giữ cảnh báo không nhập thông tin thật và nút Hủy bỏ/Quay lại.
- Giữ `Chữ to`, `Tương phản cao`, tiếng Việt dễ hiểu và không horizontal overflow ở mobile 390x844.
- Unit test, HTTP smoke test và browser QA pass.

Sau khi xong: cập nhật trạng thái `done-pending-review`, ghi diff/test/browser evidence thật, không tự commit hoặc push. Nếu chưa kiểm chứng được, ghi `CHƯA XÁC MINH ĐƯỢC`.
```

## Quy Trình Bàn Giao

Sau mỗi task hoặc rework: cập nhật task, ghi prompt copy được ngay bên dưới, chạy test, ghi diff ngắn, chuyển `done-pending-review`, không tự push. Codex review trước khi accept và commit source.
