# LOCAL STATUS - AI Scam Inoculation

Ngày cập nhật: 2026-08-20 (sau TASK-031)
Trạng thái: Đã nộp. Local MVP và snapshot GitHub sẵn sàng làm bản demo/backup.

## 1. Snapshot hiện hành

- Branch: `master`, đồng bộ với `origin/master`.
- Snapshot đã push: `13fac8d feat: harden scam training flow and sharing`.
- Snapshot gồm React UI, chat progressive an toàn, safety masking, sharing, workflow guard, test và tài liệu trạng thái.
- Có các thay đổi local chưa commit cho TASK-036: tạo `firestore.rules` default-deny, hardening server-side Firestore IAM, regression test chặn import client Firestore, test error throwing/fallback, và tạo `QA_REPORT_TASK_036.md`. Local tests PASS; Firebase Cloud/AI Studio persistence thật giữ `CHƯA XÁC MINH ĐƯỢC`.
- Các file untracked chỉ là tài liệu/QA local: `.docx_qa/`, Word demo, QA reports và `qa-evidence/`. Chúng không nằm trong snapshot GitHub.

## 2. Đã hoàn thành và kiểm chứng

### MVP

- Luồng: tên → dashboard → chọn tình huống/mức độ → consent → chat → kết quả/điểm → lịch sử → chia sẻ tùy chọn.
- React + Vite ở frontend, Node.js ở backend.
- Gemini gọi server-side, model bị khóa là `gemini-3.6-flash`.
- Không dùng `temperature`, `top_p` hoặc `top_k`.
- Ứng dụng là huấn luyện phản xạ chống Social Engineering, không phải công cụ phát hiện lừa đảo.

### Safety và scoring

- Validator hai chiều cho input và output AI.
- Không yêu cầu/lưu OTP, CCCD, mật khẩu, tài khoản, thẻ hoặc link thật.
- Che OTP theo ngữ cảnh, CCCD/CMND 9-12 số, điện thoại Việt Nam, mật khẩu và số tài khoản.
- Taxonomy phản hồi chỉ: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Score deterministic: dấu hiệu nhận diện đúng / tổng dấu hiệu của tình huống.
- Nút Dừng và cancel request có regression test.

### Trải nghiệm và chia sẻ

- Responsive desktop/mobile, Chữ to và Tương phản cao.
- Workflow guard ngăn nhảy sang bước chưa hợp lệ.
- Lưu thẻ kết quả, Web Share/Clipboard fallback, Facebook và nhánh Zalo public URL.
- Chat progressive chỉ phát từng từ sau khi toàn bộ output đã qua validation; UI có một bubble AI duy nhất.
- Khi Gemini timeout/lỗi/quota, backend dùng ngân hàng phản hồi an toàn theo kịch bản thay cho một câu chung chung. Đây là nội dung biên soạn sẵn, luôn báo `provider=safe_fallback`, không giả là Gemini và không thay luồng Gemini bình thường.
- Firestore code-ready: nếu được bật bằng cấu hình Google hợp lệ, chỉ lưu metadata buổi luyện, score định lượng/mã flag và taxonomy; không lưu tên người dùng, transcript hay mô tả score. Chưa có evidence kết nối/persistence trong AI Studio.

### Kiểm thử gần nhất

- `npm.cmd test`: PASS sau TASK-031.
- `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: PASS sau TASK-031.
- `npm.cmd run frontend:build`: PASS sau TASK-031 khi chạy ngoài sandbox OneDrive.
- 10 kịch bản / 40 câu trong ngân hàng fallback: PASS `safetyValidator`.
- Firestore serialization allowlist: PASS regression test.
- `git diff --check`: PASS; chỉ có cảnh báo LF/CRLF của Windows.

## 3. Trạng thái Gemini hiện tại

- Gemini có thể timeout hoặc bị giới hạn quota sau nhiều lượt test, khi đó app dùng `safe_fallback`.
- Đây là phản hồi dự phòng an toàn để demo không bị ngắt; không được gọi là Gemini live.
- Khi Gemini trả lời thật, report phải ghi provider `gemini`; khi fallback, ghi `safe_fallback`.
- Chủ dự án đã kiểm tra thủ công ngày 2026-08-20: Gemini live phản hồi được 2 lượt, sau đó hết quota/rate limit sau nhiều lượt test trong ngày; nút `Dừng luyện tập` hoạt động. Đây là xác nhận UAT, chưa thay thế raw probe 2-3 lượt liên tiếp không fallback.

## 4. Cải tiến sau khi nộp

Không cần thêm feature MVP. Các việc đáng làm, theo thứ tự ưu tiên:

1. **Xác minh Gemini live**: khi quota hồi, chạy 2-3 lượt chat liên tiếp và lưu provider/fallback reason thật. Hiện đã có UAT 2 lượt phản hồi trước quota limit.
2. **Xác minh public deployment**: mở link AI Studio/Cloud Run bằng một thiết bị hoặc tài khoản khác; đảm bảo workflow và secret không lộ.
3. **Xác minh share HTTPS**: test Zalo/Facebook trên URL public thật, đặc biệt ở điện thoại.
4. **Xác minh Firestore thật**: chỉ khi cần persistence sau restart/đa thiết bị. Hiện `.env` chưa bật Firestore và chưa có test persistence thật.
5. **QA UI bổ sung**: quay video ngắn chứng minh text progressive hiện dần và Stop không có output đến muộn. Đây là evidence bổ sung, không chặn demo local.
6. **Sau MVP**: baseline/lịch sử theo taxonomy, gợi ý bài luyện từ dấu hiệu yếu, link chia sẻ có thời hạn, nhắc luyện trong app và dashboard tổ chức ẩn danh.

## 5. Những điều không được claim

- Không nói Gemini live đã ổn định khi quota/rate limit còn chặn.
- Không nói AI Studio public/import đã xác minh nếu chưa mở bằng URL public thật.
- Không nói Zalo đã hoạt động trên HTTPS public khi mới test local.
- Không nói Firestore persistence đã hoàn tất khi chưa test restart với project thật.
- Không nói Project billing/quota Gemini đã được đối chiếu khi chưa có Project ID/log console tương ứng.
- Không nói progressive/Stop browser E2E đã có video timeline; code/test đã PASS nhưng evidence video chưa đạt.

## 6. Cách chạy local

```powershell
npm.cmd install
npm.cmd run frontend:build
node server.js
```

Mở desktop: `http://localhost:3000`
Cùng Wi-Fi, mở điện thoại: `http://192.168.1.50:3000`

```powershell
npm.cmd test
powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

Chi tiết task/review: `TASKS.md`, `TASKS_ARCHIVE.md`, `QA_REPORT_TASK_029.md`.

## 7. Yêu cầu hiện tại: Google AI Studio + Firestore

- Mục tiêu kế tiếp: import/chạy app trong Google AI Studio Build Mode và provision Firestore để giữ **lịch sử kết quả tối thiểu** sau refresh.
- Code local đã sẵn sàng: Firestore document chỉ có metadata session, score định lượng/mã flag và taxonomy; local test/build PASS.
- Chưa có Firebase Project ID, secret, Firebase rules, AI Studio preview evidence hay refresh-persistence evidence. Không được nói “đã tích hợp Firestore” trước khi có đủ evidence.
- Không cần Cloud Run ở bước này. Chỉ triển khai/publish sau khi preview AI Studio PASS và chủ dự án đồng ý.
- Handoff/prompt chi tiết: `AI_STUDIO_HANDOFF.md`; task kiểm chứng: TASK-032 và TASK-034 trong `TASKS.md`.
- AI Studio runtime note đã báo Firestore provision/persistence, nhưng Codex chưa accept: rule được report `allow read, write: if true` là public access và evidence score có mâu thuẫn. TASK-035 là security blocker; không claim Firestore integration hoàn tất trước rework/evidence canonical.
- TASK-036 local security preflight đã PASS: repo có `firestore.rules` default deny, frontend không có Firebase/Firestore client access, test/build/smoke PASS. Chưa deploy rule này hoặc xác minh persistence trong AI Studio sau default deny.
