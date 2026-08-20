# TASKS - AI Scam Inoculation

File này chỉ giữ context và trạng thái đang còn hiệu lực. Lịch sử chi tiết nằm trong `TASKS_ARCHIVE.md`.

## Context Cốt Lõi

- Sản phẩm là training/inoculation, không phải scam detection; không đổi scope MVP.
- Frontend React + Vite, backend Node.js, Gemini gọi server-side.
- AI sản phẩm chỉ dùng `gemini-3.6-flash`; không `temperature`, `top_p`, `top_k`.
- Taxonomy chỉ: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Score là pure function: red flags nhận diện đúng / tổng red flags.
- Không lưu/yêu cầu OTP, CCCD, mật khẩu, tài khoản hoặc link thật.
- Không tin báo cáo tự khai; chỉ PASS khi có source/test/browser evidence thật.

## Trạng Thái Release Candidate

- Local MVP: PASS.
- `npm.cmd test`: PASS.
- Production build: PASS.
- HTTP smoke test: PASS.
- `git diff --check`: PASS.
- Secret scan: PASS.
- Worktree: 14 file modified, chưa commit/push.
- TASK-025 release candidate audit: `accepted`.

## Các Phần Đã Accept

- React migration, scenario picker, consent, chat và result scorecard.
- Resource Hub/hotline và đường chạy React mặc định.
- Workflow guards cho desktop/mobile và direct hash route.
- Web Share, Clipboard fallback, lưu ảnh, Facebook và Zalo source integration.
- OTP chỉ mask khi có ngữ cảnh rõ; CCCD 9/12 số, điện thoại 03/05/07/08/09, mật khẩu và tài khoản được bảo vệ.
- TASKS/LOCAL_STATUS đã được chuẩn hóa và audit theo diff thật.

Chi tiết tương ứng: TASK-011 đến TASK-025 trong `TASKS_ARCHIVE.md`.

## Chưa Xác Minh Được

1. Gemini live 2-3 lượt liên tiếp không fallback do quota/rate limit.
2. Google AI Studio public link/import chạy được.
3. Zalo share trên public HTTPS URL.
4. Firestore thật với credential và persistence sau restart.
5. Codex chưa audit độc lập trên điện thoại thật; người dùng đã test và báo ổn.

Không báo PASS cho các mục này nếu chưa có URL, credential hoặc evidence thật.

## Bước Tiếp Theo

1. Chủ dự án xác nhận release-candidate snapshot commit.
2. Commit 14 file hiện tại bằng một snapshot commit vì source, test và tài liệu đang liên kết trong cùng worktree.
3. Push sau khi commit được kiểm tra.
4. Chỉ mở task Gemini/AI Studio/Zalo/Firestore khi có môi trường thật.

Hiện không có task code mới cho Antigravity.

## TASK-026 - Progressive rendering an toàn - ACCEPTED

- Gemini không phát chunk trực tiếp ra UI. Hệ thống dùng pipeline `sendChatMessage` hiện có để parse, retry và validate toàn bộ output trước.
- Chỉ reply đã qua `safetyValidator` mới được chia theo từ và hiển thị tuần tự qua SSE.
- Đã xóa đường `streamGenerateContent` và parser JSON dở dang.
- Fallback đi qua cùng cổng validation trước khi emit.
- Nút Dừng dùng `AbortController`; server không emit dữ liệu đến muộn và bảo đảm session kết thúc sau cancel.
- Bổ sung rule chặn OTP có nhãn trong AI output.
- Regression tests chặn OTP, điện thoại và URL trước callback; kiểm tra cancel, fallback và model lock.
- `npm.cmd test`: PASS.
- Production build: PASS.
- HTTP smoke test: PASS.
- `git diff --check`: PASS, chỉ có cảnh báo LF/CRLF của Windows.
- Giới hạn: đây là progressive rendering sau full validation, không phải Gemini live streaming.
- Browser automation chưa chạy được do plugin browser từ chối trusted code path; cần kiểm tra cảm giác hiển thị và nút Dừng trên UI local trước release.

Chi tiết review và nguồn pitch của TASK-026 được lưu trong `TASKS_ARCHIVE.md`.

## Archive Reference - TASK-027 QA thủ công

TASK-027 đã được thay bởi TASK-029. Kết quả còn hiệu lực: full workflow và local fallback QA đã PASS; progressive text, Stop E2E, Gemini live và Zalo public HTTPS không được claim PASS khi thiếu evidence. Chi tiết ở `TASKS_ARCHIVE.md` và `QA_REPORT_TASK_027.md`.

## TASK-029 - Xác minh UI E2E còn mở - PARTIALLY ACCEPTED

### Trạng thái đã kiểm chứng

- Code progressive đã sửa: một bubble AI, placeholder ở trong bubble đó, full-output validation trước chunk và delay 70 ms/từ.
- Ảnh `qa-evidence/task-029/01_single_ai_bubble_placeholder.png` xác minh single bubble: PASS.
- `npm.cmd test`, HTTP smoke và production build: PASS.
- Gemini live và Zalo public HTTPS vẫn không thuộc task này, giữ `CHƯA XÁC MINH ĐƯỢC`.

### Còn mở

1. Browser E2E: một clip thấy text AI thật tăng dần.
2. Browser E2E: một clip thấy bấm `Dừng luyện tập` lúc loading và sau đó không có output AI muộn.

Không có lỗi code mới. Hai mục này chỉ là evidence thủ công, không chặn local MVP demo.

### Phạm vi nếu cần xác minh lại

- Chỉ tạo `QA_REPORT_TASK_029.md` và `qa-evidence/task-029/`.
- Không sửa source/config/test, không commit/push.
- Nếu có evidence, dùng MP4 H.264 5-15 giây và kiểm tra bằng `ffprobe`.
- Không quay được thì giữ `CHƯA XÁC MINH ĐƯỢC`, không suy đoán PASS.

### Prompt cho Antigravity

> Chỉ QA evidence, không sửa code/config/test và không commit/push. Dùng Chrome mở http://localhost:3000 sau Ctrl+F5. Nếu quay được, tạo 2 MP4 H.264 5-15 giây trong `qa-evidence/task-029/`: clip 1 thấy text thật trong một bubble AI tăng dần; clip 2 thấy bấm Dừng khi loading rồi dashboard/kết quả giữ >=3 giây không có bubble AI mới. Chạy ffprobe để xác minh codec h264 và duration. Cập nhật `QA_REPORT_TASK_029.md` với URL, viewport, thời điểm, provider thật và evidence. Nếu không có clip hợp lệ, giữ hai mục `CHƯA XÁC MINH ĐƯỢC`; không ghi PASS, không tạo file rỗng/WebP lỗi.

## Backlog Sau MVP

- Baseline và lịch sử điểm theo 5 taxonomy.
- Gợi ý bài luyện từ nhóm dấu hiệu còn yếu; scoring vẫn deterministic.
- Link chia sẻ riêng tư, chỉ đọc, có thời hạn và không chứa transcript.
- Nhắc luyện định kỳ trong app; chưa gửi Zalo tự động.
- Dashboard thống kê ẩn danh cho tổ chức.

Không biến người thân thành actor chính, không giám sát âm thầm và không đưa backlog vào MVP trước khi nộp.
