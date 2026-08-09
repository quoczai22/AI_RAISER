# Risks

Chỉ ghi risk còn mở. Nguồn chi tiết: [[../../RiskReport]] và [[../../TASKS]].

## Gemini Free-Tier Quota/Rate Limit

- Mức độ: High
- Mô tả: live Gemini probe từng gặp `GEMINI_HTTP_429`.
- Ảnh hưởng: demo dynamic chat có thể rơi về fallback, làm yếu bằng chứng AI-native.
- Hướng xử lý: dùng Google Cloud/AI Studio project có billing/quota phù hợp, hạn chế probe lặp, warm-up một lần trước demo.
- Trạng thái: Open.

## Gemini Live Stability Nhiều Lượt

- Mức độ: High
- Mô tả: TASKS vẫn ghi Gemini live ổn định nhiều lượt là `CHƯA XÁC MINH ĐƯỢC`.
- Ảnh hưởng: chat có thể không chứng minh được phản hồi động trong demo dài.
- Hướng xử lý: chạy live Gemini probe có delay, kiểm tra 2-3 input khác nhau trong cùng state, ghi provider/fallback reason.
- Trạng thái: Open.

## Resource Hub Có Thể Hiển Thị Sai Contact

- Mức độ: High
- Mô tả: TASK-015 bị reject vì mapping sai `113/NCSC` và label `Hotline:` cho website.
- Ảnh hưởng: người dùng có thể tin vào kênh xác minh sai; task không được accept.
- Hướng xử lý: sửa React `Hotlines.jsx`, không tự đoán hotline, dùng label `Website cảnh báo:` cho website.
- Trạng thái: Open.

## AI Studio/Submission Path

- Mức độ: Medium
- Mô tả: submission chính là Google AI Studio public project link; repo đang có Node + React/Vite và Cloud Run-ready path.
- Ảnh hưởng: cần bảo đảm app có đường nộp đúng yêu cầu chương trình.
- Hướng xử lý: giữ module boundaries rõ ràng, theo [[../../docs/google_ai_studio_porting]], chuẩn bị publish/Cloud Run backup.
- Trạng thái: Open.

## Local Cloud Run Tooling

- Mức độ: Medium
- Mô tả: `gcloud` chưa sẵn trong PowerShell PATH theo RiskReport.
- Ảnh hưởng: không deploy Cloud Run trực tiếp từ workspace cho đến khi SDK/auth/project sẵn sàng.
- Hướng xử lý: deploy qua AI Studio/Cloud console hoặc cài Google Cloud CLI rồi theo [[../../docs/cloud_run_deploy]].
- Trạng thái: Open.
