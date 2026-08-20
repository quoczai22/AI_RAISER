# AI Studio Import Checklist

Trạng thái: **Chưa được thực hiện.** Chỉ dùng sau khi `TASK-039` được Codex review và accept.

## Mục đích

Import đúng source đã kiểm chứng vào Google AI Studio Build Mode, không yêu cầu AI Studio xây lại ứng dụng từ đầu và không làm lệch kiến trúc React + Vite + Node.js hiện tại.

## Không dùng prompt rebuild cũ

Không dán prompt yêu cầu tạo SPA Vanilla JavaScript/Tailwind hoặc "build complete app from scratch". Nó có thể ghi đè source React/Node, safety validator, scoring deterministic và workflow guard hiện có.

## Điều kiện mở import

- `TASK-039` PASS local, có `QA_REPORT_TASK_039.md` được Codex review.
- Có commit GitHub sạch được chọn làm source import; ghi chính xác SHA vào báo cáo.
- Không có secret/credential/Project ID thật trong Git.
- Chủ dự án tự xác nhận nếu muốn tiếp tục phần Firestore cloud/IAM. Nếu chưa xác nhận, import chỉ để preview app; Firestore vẫn là `BLOCKED / CHƯA XÁC MINH ĐƯỢC`.

## Thứ tự import sau khi được mở

1. Trong AI Studio, import đúng repository và commit đã được Codex chốt. Không tạo project mới từ prompt.
2. Build và mở preview. Xác nhận app chạy qua Node server, Gemini vẫn server-side và không có ô nhập API key cho người dùng.
3. Test một workflow MVP: tên -> dashboard -> tình huống + mức -> consent -> chat -> Stop/kết quả -> lịch sử -> share tùy chọn.
4. Nếu có lỗi import/build, lưu raw error an toàn và dừng. Không để AI Studio tự đổi stack, UI hay security boundary để "sửa nhanh".
5. Firestore chỉ làm sau bước 1-4 và sau owner approval của TASK-038. Giữ `firestore.rules` default deny, browser chỉ gọi Node API.
6. Chỉ chia sẻ Public khi preview đã PASS. Public URL cần được mở thử bằng thiết bị/tài khoản khác trước khi claim đã hoạt động.

## Bằng chứng cần lưu sau import

- Commit SHA, build log không chứa secret, URL preview/public phù hợp.
- Kết quả workflow, provider thực tế (`gemini` hoặc `safe_fallback`) và trạng thái quota nếu có.
- Với Firestore: Project/Database đã được owner xác nhận, write -> clear cache -> refresh -> read cùng canonical session. Nếu thiếu, ghi `CHƯA XÁC MINH ĐƯỢC`.

## Các điều không được claim

- Không gọi `safe_fallback` là Gemini live.
- Không gọi Firestore đã tích hợp nếu chưa có persistence thật sau refresh.
- Không gọi Facebook/Zalo PASS nếu mới chạy ở localhost.
- Không gọi public link PASS nếu chưa mở bằng người dùng/thiết bị khác.
