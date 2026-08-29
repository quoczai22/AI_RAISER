# LOCAL STATUS - AI Scam Inoculation

Ngày cập nhật: 2026-08-29
Trạng thái: **Local MVP ổn định; TASK-049 và TASK-050 đã kiểm thử local; TASK-051 đang chờ QA chuẩn bị video. Google AI Studio cần đồng bộ/xác minh lại sau snapshot mới.**

## 1. Bản mã nguồn chuẩn

- Branch: `master`
- Commit mới nhất đã push: `b927322 feat: optimize Gemini quota and loading feedback`
- Stack: React 19 + Vite frontend, native Node.js HTTP server.
- Gemini: `gemini-3.6-flash`, chỉ gọi server-side.
- Firestore: server-side, browser không dùng Firebase Web SDK/direct access.
- Firestore rules: default-deny.

## 2. Đã hoàn thành và kiểm chứng

- Luồng MVP: nhập tên -> dashboard -> chọn tình huống/mức độ -> consent -> chat -> kết quả -> lịch sử -> chia sẻ tùy chọn.
- Taxonomy cố định: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Điểm số deterministic, không phụ thuộc hoàn toàn vào Gemini.
- Safety validator hai chiều; không lưu OTP, CCCD, mật khẩu, tài khoản, link thật hoặc transcript vào Firestore.
- Session capability bảo vệ các API session-specific; capability raw chỉ trả lúc tạo session.
- Nút Dừng hủy request và chặn tin nhắn đến muộn sau khi phiên hoàn tất.
- Dashboard/history đã xử lý lỗi `dashboard/undefined` và route chia sẻ nội bộ dùng `#aisi-share/<sessionId>`.
- Giao diện responsive desktop/mobile, Chữ to và Tương phản cao.
- Trang Số xác minh có nguồn tham khảo và hotline theo danh mục hiện có.
- Zalo đã bị loại bỏ hoàn toàn trên mobile và desktop vì không hoàn tất chia sẻ thực tế. Giữ lại Web Share, sao chép liên kết, Facebook và Lưu ảnh.
- Firestore live persistence đã PASS: ghi canonical session, xóa in-memory cache, đọc lại từ đúng database và đối chiếu các trường kết quả.
- TASK-048: timeout Gemini `9000ms`, thông báo chờ frontend `4000ms`, 429 chuyển ngay sang `safe_fallback`.
- TASK-049: notice fallback được giới hạn theo lượt gửi, không giữ notice đỏ cũ.
- TASK-050: 10 scenario, mỗi scenario có đúng 10 fallback theo intent và có câu dự phòng khi thiếu dữ liệu.

## 3. Kiểm thử mã nguồn gần nhất

- `npm.cmd test`: PASS toàn bộ 10 stage, gồm TASK-048 đến TASK-050.
- `npm.cmd run frontend:build`: PASS.
- `git diff --check`: không có lỗi nội dung.
- Quét mã chia sẻ: không còn `ZaloSocialSDK`, `zalo.me/share`, `chat.zalo.me` hoặc nút Zalo.
- Firestore test có thể in lỗi `PERMISSION_DENIED` ở nhánh kiểm tra rules mặc định-deny; đây là kết quả mong đợi của test bảo mật, không phải lỗi persistence đã xác minh.

## 4. Firestore hiện tại

- Project: `gen-lang-client-0936873228`
- Database: `ai-studio-airaiser-5eff3d82-fcb2-4a70-9917-52c580ed5631`
- Runtime đã ghi/đọc lại session thành công sau khi xóa cache.
- Chỉ lưu session/result allowlist và capability hash cần thiết.
- `safeFallbackResponseBank.json` vẫn là file tĩnh trong mã nguồn, không lưu Firestore.

## 5. Gemini và fallback

- Gemini live đã phản hồi được trong thực tế nhưng có thể gặp quota/rate limit sau nhiều lượt.
- Cấu hình timeout: `GEMINI_TIMEOUT_MS=9000` (9 giây). Timer thông báo chờ tầng 2 trên frontend: 4000ms (~4 giây). TASK-048, TASK-049 và TASK-050 đã đạt implementation/test local; UI Preview mới vẫn cần kiểm tra.
- Khi lỗi, timeout hoặc HTTP 429, app chuyển sang `provider=safe_fallback` ngay lập tức với fallbackReason thật, lấy câu phản hồi từ `safeFallbackResponseBank.json` (10 scenario x 10 câu).
- Không được gọi fallback là Gemini live.
- Chưa có bằng chứng quota ổn định cho nhiều người dùng đồng thời.

## 6. Chưa hoàn tất hoặc chưa xác minh

1. TASK-047: report trong repo vẫn là bản localhost cũ; evidence Google AI Studio do runtime báo cáo chưa được đồng bộ về repo để audit độc lập.
2. TASK-051: QA workflow chuẩn bị video demo chưa hoàn tất.
3. Chưa xác minh UAT điện thoại vật lý bằng evidence độc lập cho mọi nút chia sẻ.
4. Link Google AI Studio có thể yêu cầu đăng nhập Google; chưa được coi là truy cập ẩn danh hoàn toàn.
5. Cần kiểm tra lại public link sau khi Google AI Studio đồng bộ snapshot `b927322` và các thay đổi TASK-048/050.
6. Chưa có bằng chứng video riêng cho text streaming và Dừng khi đang tải.
7. Zalo không còn là chức năng của sản phẩm và không cần test tiếp.

## 7. Việc tiếp theo

### Sau TASK-050

- Chạy TASK-051 trên localhost để kiểm tra workflow và chuẩn bị video demo.
- Đồng bộ TASK-050 lên Google AI Studio rồi kiểm tra link fullscreen và route chia sẻ trên Preview.

## 8. Worktree

- `LOCAL_STATUS.md`, `TASKS.md`, `RiskReport.md` đang là file local có thay đổi chưa commit.
- `VIDEO_DEMO_SCRIPT.md`, QA reports, evidence và DOCX là file local/untracked; không tự động đưa toàn bộ lên GitHub.
- Các thay đổi TASK-048 đến TASK-050 trong source/test hiện đang là thay đổi local chưa commit; không được coi là đã có trên GitHub hoặc AI Studio.

## 9. Chạy local

```powershell
npm.cmd install
npm.cmd run frontend:build
node server.js
```

Mở `http://localhost:3000`.

Kiểm thử:

```powershell
npm.cmd test
powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```
