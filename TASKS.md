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

## TASK-012 - React Scenario Picker And Consent

### Trạng Thái

`ready-for-execution`

### Mục Tiêu

Migrate màn chọn tình huống và xác nhận consent từ static UI sang React, dùng API/session hiện tại. Chưa migrate chat, result hoặc hotline.

### Phạm Vi

- Được sửa `src/react-app/*`, `README.md`, `TASKS.md`.
- Được sửa `server.js` chỉ khi cần tối thiểu cho React/API.
- Dùng dữ liệu thật từ `/api/scenarios`, `/api/sessions` và consent API hiện tại.
- Giữ `Chữ to`, `Tương phản cao`, tiếng Việt dễ hiểu, nút `Quay lại/Hủy bỏ` và cảnh báo không nhập thông tin thật.

### Không Được Làm

- Không sửa `src/services/*`, Gemini, safety, scoring hoặc database contract.
- Không thêm scenario/feature ngoài MVP.
- Không migrate chat/result trong task này.
- Không xóa static fallback.

### Acceptance Criteria

- React scenario picker render danh sách từ `/api/scenarios`, chọn được scenario và cấp độ.
- Consent tạo/đọc session bằng API thật, checkbox consent bắt buộc trước khi bắt đầu.
- Nút Quay lại/Hủy bỏ hoạt động và không làm mất state ngoài ý muốn.
- Mobile `390x844` và desktop `1440x900` không horizontal overflow.
- Accessibility toggle vẫn hoạt động trên các view mới.
- `node tests/run-tests.js`, HTTP smoke và browser QA pass.

### Prompt Cho Antigravity

```text
Đọc `AGENTS.md` và `TASKS.md`, thực hiện TASK-012 - React Scenario Picker And Consent.

Được sửa: `src/react-app/*`, `README.md`, `TASKS.md`; server/API chỉ sửa nếu cần tối thiểu. Không sửa `src/services/*`, Gemini, safety, scoring, database contract. Không xóa static fallback và không thêm feature/scenario ngoài MVP.

Acceptance criteria:
- React route chọn tình huống lấy dữ liệu từ `/api/scenarios`.
- Consent dùng session API hiện tại, giữ cảnh báo không nhập thông tin thật và nút Hủy bỏ/Quay lại.
- Giữ `Chữ to`, `Tương phản cao`, tiếng Việt dễ hiểu và không horizontal overflow ở mobile 390x844.
- Unit test, HTTP smoke test và browser QA pass.

Sau khi xong: cập nhật TASK-012 thành `done-pending-review`, ghi diff/test/browser evidence thật, không tự commit hoặc push. Nếu chưa kiểm chứng được, ghi `CHƯA XÁC MINH ĐƯỢC`.
```

## Quy Trình Bàn Giao

Sau mỗi task hoặc rework: cập nhật task, ghi prompt copy được ngay bên dưới, chạy test, ghi diff ngắn, chuyển `done-pending-review`, không tự push. Codex review trước khi accept và commit source.

## Quy Tắc Rút Gọn Context

- Sau khi Codex accept task, phải rút gọn mục task đó trong `TASKS.md` thành: trạng thái, mục tiêu tiếp theo, thay đổi đã accept, bằng chứng test/browser, giới hạn `CHƯA XÁC MINH ĐƯỢC` và prompt/task kế tiếp.
- Review log dài, diff lặp lại và prompt cũ chuyển sang `TASKS_ARCHIVE.md` hoặc giữ trong git history.
- Không xóa quyết định kiến trúc, lỗi còn mở, giới hạn an toàn hoặc bằng chứng cần cho audit.
- Antigravity chỉ báo cáo phần thay đổi của task hiện tại; không copy lại các task đã hoàn thành.
- Quy tắc này áp dụng cho cả Codex và Antigravity để giảm token/context nhưng vẫn giữ khả năng truy vết.
