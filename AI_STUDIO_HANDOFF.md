# AI Studio Handoff - Firestore Spike

## Trạng thái thật

- Product: **AI Scam Inoculation**, ứng dụng huấn luyện phản xạ nhận diện Social Engineering cho người Việt lớn tuổi; không phải công cụ phát hiện lừa đảo.
- Stack hiện tại: React/Vite frontend, Node.js server, Gemini server-side (`gemini-3.6-flash`), Map local mặc định và Firestore wrapper tùy chọn.
- Local đã PASS: `npm.cmd test`, HTTP smoke, production build.
- Chưa xác minh: app import/preview trong AI Studio, Firebase provision, Firestore cloud persistence, Gemini live ổn định.

## Mục tiêu duy nhất trên AI Studio

Provision Firebase Firestore và xác minh một **completed training session** còn lịch sử điểm sau browser refresh. Không thêm tính năng sản phẩm mới.

## Không được thay đổi

- Flow: tên -> dashboard -> chọn tình huống/mức độ -> consent -> chat roleplay -> kết quả/điểm -> lịch sử -> chia sẻ tùy chọn.
- Gemini `gemini-3.6-flash` server-side; không lộ key, không đổi sang AI khác, không thêm temperature/top_p/top_k.
- Validator hai chiều, Stop, safe fallback, workflow guard, scoring deterministic.
- Taxonomy chỉ: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không sửa UI, scenario, prompt Gemini, dependency, Cloud Run hoặc GitHub nếu không bắt buộc để Firestore hoạt động.

## Quy tắc dữ liệu Firestore

Chỉ được lưu: `schemaVersion`, session/scenario ID, difficulty, timestamps, status, turn count, score định lượng (`immunityScore`, `recognizedCount`, `totalCount`, `triggeredKeys`, `createdAt`) và event taxonomy (`redFlagKey`, `status`, `createdAt`).

Tuyệt đối không lưu: `userName`, chat transcript/messages, `evidenceText`, OTP, CCCD/CMND, mật khẩu, số tài khoản/thẻ, điện thoại, link thật, API key/token/credential hoặc mô tả score chi tiết.

## Evidence bắt buộc để claim tích hợp

1. AI Studio Preview chạy app từ project hiện tại.
2. Firebase/Firestore đã provision trong đúng project; không lộ secret trong code/report.
3. Tạo buổi luyện, hoàn thành để có score và ghi session ID + score.
4. Refresh preview.
5. Lịch sử/score của đúng session ID vẫn hiện lại.
6. Có document/log Firestore an toàn chứng minh write/read.
7. Report `QA_REPORT_TASK_032.md`: file thay đổi, trạng thái Firebase, từng bước PASS/FAIL/BLOCKED, evidence; không commit/push trước Codex review.

## Điều kiện dừng

Nếu AI Studio yêu cầu chủ dự án chọn Firebase project, cấp quyền hoặc bật billing: dừng, ghi đúng màn hình/thao tác cần chủ dự án xác nhận. Nếu persistence không đạt trong một phiên làm việc: dừng, giữ Map/JSON local, ghi `CHƯA XÁC MINH ĐƯỢC`. Không đổi kiến trúc để cố đạt.

## Prompt triển khai trực tiếp trong Google AI Studio

```text
Bạn đang làm trong project Google AI Studio Build Mode đã có sẵn ứng dụng AI Scam Inoculation. Hãy thực hiện một spike Firestore nhỏ gọn để chứng minh persistent history, không mở rộng MVP.

Mục tiêu duy nhất:
Provision Firebase Firestore cho project này và lưu lịch sử của một buổi luyện ĐÃ HOÀN THÀNH, để sau browser refresh vẫn đọc lại đúng kết quả/điểm của buổi đó.

Bối cảnh không được thay đổi:
- Đây là ứng dụng huấn luyện nhận diện Social Engineering cho người Việt lớn tuổi, KHÔNG phải scam detection.
- Giữ nguyên flow: tên -> dashboard -> chọn tình huống/mức độ -> consent -> chat roleplay -> kết quả/điểm -> lịch sử -> chia sẻ tùy chọn.
- Giữ Gemini `gemini-3.6-flash` ở server-side. Không lộ API key, không đổi model/AI, không thêm temperature/top_p/top_k.
- Không sửa validator hai chiều, Stop button, safe fallback bank, workflow guard, scoring deterministic hoặc UI/scenario/prompt Gemini nếu không bắt buộc để Firestore chạy.
- Taxonomy chỉ: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không thêm Authentication, Cloud Run, feature mới, dependency mới hoặc refactor kiến trúc rộng.

Code hiện có:
- `src/services/store.js` đã có Firestore wrapper và `sanitizeSessionForFirestore`.
- Ưu tiên dùng/chỉnh tối thiểu wrapper hiện có thay vì thay thế kiến trúc.
- Nếu AI Studio provision Firebase tạo config khác, chỉ tích hợp phần tối thiểu cần thiết và giải thích chính xác file nào thay đổi.

Quy tắc dữ liệu bắt buộc:
Firestore document CHỈ được chứa:
`schemaVersion`, session ID, scenario ID, difficulty, consent/created/started/completed/updated timestamps, status, turnCount, score định lượng (`immunityScore`, `recognizedCount`, `totalCount`, `triggeredKeys`, `createdAt`) và event taxonomy (`redFlagKey`, `status`, `createdAt`).

TUYỆT ĐỐI KHÔNG ghi vào Firestore:
`userName`, chat transcript/messages, `evidenceText`, OTP, CCCD/CMND, mật khẩu, số tài khoản/thẻ, số điện thoại, link thật, API key/token/credential, hoặc `recognizedRedFlags`/`missedRedFlags`/mô tả score.

Quy trình thực hiện:
1. Kiểm tra app hiện chạy trong AI Studio Preview và Gemini vẫn server-side.
2. Provision Firebase/Firestore bằng khả năng tích hợp của AI Studio.
3. Nếu cần chủ dự án chọn Firebase Project, cấp quyền Google hoặc bật billing: DỪNG NGAY. Không tự chọn project, không tự bật billing; báo chính xác màn hình/thao tác cần chủ dự án xác nhận.
4. Sau khi có Firebase hợp lệ, kết nối tối thiểu vào wrapper/session store hiện có, không phá local Map fallback.
5. Đảm bảo document thực ghi theo allowlist ở trên; không dựa vào lời nói, tự đọc code và log/document để kiểm tra.
6. Chạy test local phù hợp: `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check`.
7. Trong AI Studio Preview: tạo buổi luyện -> hoàn thành để có score -> ghi lại session ID và score -> refresh browser -> mở lịch sử/kết quả -> xác nhận cùng session ID và score còn tồn tại.
8. Tạo `QA_REPORT_TASK_032.md` gồm: Firebase database/project status (không ghi secret), danh sách file thay đổi, từng bước PASS/FAIL/BLOCKED, output test, evidence write/read sau refresh và các mục CHƯA XÁC MINH ĐƯỢC.

Acceptance criteria:
- Có evidence refresh persistence trong AI Studio Preview.
- Không có dữ liệu cấm trong document Firestore.
- MVP local không regression; test/build PASS.
- Không claim Gemini live ổn định nếu provider thực tế là `safe_fallback`.

Điều kiện thất bại an toàn:
Nếu Firestore không provision được, cần billing ngoài dự kiến, quyền không đủ, hoặc refresh persistence không đạt trong phiên này: không đổi kiến trúc để cố đạt. Giữ Map/JSON local, tạo report `CHƯA XÁC MINH ĐƯỢC` nêu đúng blocker.

Không commit, không push. Dừng sau khi bàn giao report/evidence để Codex review.
```
