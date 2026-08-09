# Decisions

## React + Vite Là Frontend Chính

- Quyết định: dùng React + Vite trong `src/react-app/` làm frontend chính; `src/public/` chỉ là fallback.
- Lý do: TASK-011 đến TASK-014 đã được accept trên React flow; Resource Hub là phần React còn mở.
- Trade-off: phải giữ static fallback xanh cho smoke test, nên một số logic UI tồn tại song song trong thời gian chuyển đổi.
- Ngày cập nhật: 2026-08-06.

## Node Backend Giữ Vai Trò Server Runtime

- Quyết định: tiếp tục dùng Node backend hiện tại cho API/session/Gemini server-side.
- Lý do: MVP đã có test, session API, safety, scoring và fallback ổn định.
- Trade-off: không dùng framework nặng; một số routing/API contract cần kỷ luật thủ công.
- Ngày cập nhật: 2026-08-06.

## Gemini Chỉ Chạy Server-Side

- Quyết định: Gemini API key chỉ ở server; client không gọi Gemini trực tiếp.
- Lý do: bảo vệ secret và cho phép safety validator kiểm soát output trước khi hiển thị.
- Trade-off: chat phụ thuộc latency/backend availability.
- Ngày cập nhật: 2026-08-06.

## Product Scope Là Inoculation, Không Phải Detection

- Quyết định: app mô phỏng để luyện nhận diện pattern, không phân tích tin nhắn thật thay người dùng.
- Lý do: giảm rủi ro safety/legal, đúng PRD và AGENTS.
- Trade-off: không giải quyết use case "kiểm tra tin nhắn thật" trong MVP.
- Ngày cập nhật: 2026-08-06.

## Scoring Là Pure Function

- Quyết định: điểm cuối dựa trên red flags recognized / total red flags, không dựa vào Gemini judgment tự do.
- Lý do: minh bạch, kiểm thử được, tránh AI chấm điểm tùy ý.
- Trade-off: scoring ít mềm mại hơn đánh giá tự nhiên của model.
- Ngày cập nhật: 2026-08-06.

## Hotline/Resource Hub Không Được Tự Đoán Nguồn

- Quyết định: chỉ hiển thị contact/source đã được chấp thuận; chưa có nguồn thì dùng hướng dẫn chung hoặc bỏ mục.
- Lý do: sai hotline có thể gây hại cho người dùng và làm mất tin cậy demo.
- Trade-off: Resource Hub sẽ tối giản hơn, ít thông tin hơn.
- Ngày cập nhật: 2026-08-06.
