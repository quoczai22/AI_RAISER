# TASKS - AI Scam Inoculation

File này là task artifact cho Antigravity thực thi. Codex giữ vai trò manager/reviewer: không tự viết code tính năng, chỉ cập nhật định hướng, acceptance criteria và review theo `AGENTS.md`.

## Context Snapshot

- Repo hiện tại: Node.js server + static web UI, không framework nặng.
- Commit mới nhất đã thấy: `c58d8d4 feat: optimize mobile layout for senior users`.
- App đã có luồng MVP: nhập tên -> trang chính -> chọn scam/cấp độ -> consent -> chat Gemini/fallback -> dashboard điểm -> share summary.
- Gemini phải là AI duy nhất trong sản phẩm cuối: `gemini-3.6-flash`, server-side, không `temperature`, `top_p`, `top_k`.
- Submission chính: Google AI Studio project link public. GitHub/Cloud Run chỉ là bonus/fallback.
- Rủi ro lớn nhất hiện tại: chưa test Import from GitHub vào Google AI Studio Build mode.

## Review Checklist Bắt Buộc

Mọi task/commit của Antigravity phải được Codex review theo checklist này trước khi chấp nhận:

- Không biến sản phẩm thành scam detection. Đây vẫn là training/inoculation app.
- Gemini vẫn là AI duy nhất trong runtime sản phẩm cuối và chỉ gọi server-side.
- Chat vẫn dynamic, không chuyển thành decision tree cố định.
- Feedback chỉ dùng 5 taxonomy: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không đưa "câu trả lời đúng" kiểu học thuộc; chỉ dạy pattern thao túng khái quát.
- Score vẫn là pure function: red flags đúng / tổng red flags.
- `safetyValidator` vẫn chặn/mask OTP, CCCD, tài khoản, phone, link thật, mật khẩu.
- Nút Stop/Dừng luôn có trong chat.
- Accessibility không bị phá: chữ to, tương phản cao, nút lớn, mobile layout dễ bấm.
- Không đụng remote config, production database, secret, hoặc kiến trúc lớn nếu chưa có approval.

## P0 - Spike: Chuẩn Bị Test Import From GitHub Vào Google AI Studio

### Mục Tiêu

Chuẩn bị repo ở trạng thái sạch và dễ import vào Google AI Studio Build mode để người dùng test sớm khả năng tương thích của kiến trúc Node/static hiện tại.

### Scope Cho Antigravity

- Chỉ kiểm tra và chỉnh tài liệu/cấu hình tối thiểu nếu cần để repo dễ hiểu khi import.
- Không refactor sang React/Next.js trước khi người dùng test Import from GitHub.
- Không đổi backend/module boundaries.
- Không thay model Gemini hoặc thêm AI khác.
- Không commit `.env`, key, local-only notes, artifact tạm.

### Việc Cần Làm

1. Kiểm tra repo sạch:
   - `git status --short --ignored`
   - Xác nhận chỉ `.env` và `LOCAL_STATUS.md` là ignored/local-only.

2. Kiểm tra README có đủ thông tin import/demo:
   - Project là training, không detection.
   - Stack hiện tại: Node.js server + static UI.
   - Cách chạy local: `node server.js`.
   - Cách test: `node tests/run-tests.js` và `tests/http-smoke.ps1`.
   - Gemini key server-side qua env, không lộ client.
   - Hướng nộp chính là AI Studio project public link.

3. Kiểm tra file rác/build artifact:
   - Không có `node_modules`, logs, coverage, screenshot tạm, secret.
   - `.gitignore` và `.dockerignore` vẫn chặn `.env`, local notes, runtime artifacts.

4. Chạy test tối thiểu trước khi người dùng import:
   - `node tests/run-tests.js`
   - `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`

5. Nếu phát hiện AI Studio Import có thể không nhận custom Express/server:
   - Không tự rewrite kiến trúc.
   - Ghi rủi ro vào phần "Cần quyết định" bên dưới.
   - Đề xuất 2 hướng: giữ Node/static để fallback hoặc port sang AI Studio/React sau khi test import thất bại.

### Acceptance Criteria

- Repo import candidate không chứa secret/trash tracked.
- README đủ để người dùng hoặc judge hiểu cách chạy và mục tiêu.
- Unit test và HTTP smoke test pass.
- Không có thay đổi code sản phẩm ngoài phạm vi cleanup/tài liệu.
- Nếu có commit, commit message phải rõ ràng và diff nhỏ.

### Priority

P0 - làm trước mọi feature khác.

## P1 - Review Sau Khi Người Dùng Test Import

### Mục Tiêu

Khi người dùng báo kết quả Import from GitHub vào AI Studio, Codex/Antigravity quyết định bước tiếp theo dựa trên dữ liệu thật.

### Nhánh Quyết Định

- Nếu import OK:
  - Tập trung kiểm thử demo flow trong AI Studio.
  - Xác nhận Gemini key server-side.
  - Chuẩn bị public share link.

- Nếu import fail do custom server:
  - Tạo plan port tối thiểu sang pattern AI Studio Build mode.
  - Giữ nguyên module boundaries: orchestrator, Gemini client server-side, safety validator, scoring engine, dashboard service.
  - Không mở rộng MVP.

- Nếu import OK nhưng Gemini key/quota lỗi:
  - Không sửa bằng fallback giả làm AI thật.
  - Ghi rõ risk và chuẩn bị demo script nói thẳng về quota.

### Acceptance Criteria

- Có quyết định rõ: keep current architecture, port minimal, hoặc fix config.
- Không rewrite lớn khi chưa có kết quả import.
- Vẫn bám `AGENTS.md`.

### Priority

P1 - sau P0 và sau khi người dùng có kết quả import.

## P1 - Demo Readiness Audit

### Mục Tiêu

Đảm bảo demo 3 phút ổn định trước khi nộp.

### Việc Cần Làm

- Chạy full MVP flow local từ đầu đến dashboard.
- Kiểm tra mobile viewport cho nhóm người lớn tuổi/người ít dùng công nghệ.
- Kiểm tra fallback message không quá kỹ thuật.
- Kiểm tra Stop button trong chat.
- Kiểm tra feedback không có câu trả lời mẫu.
- Nếu Gemini quota còn `GEMINI_HTTP_429`, ghi risk rõ trong `RiskReport.md` hoặc docs test.

### Acceptance Criteria

- Test pass.
- Demo script phản ánh đúng trạng thái Gemini thật/fallback.
- Không có raw OTP/CCCD/số tài khoản/link thật hiển thị trong UI.

### Priority

P1.

## Cần Người Dùng Làm Song Song

- Vào Google AI Studio (`ai.dev`) -> Build -> nút `+` -> `Import from GitHub`.
- Chọn repo hiện tại và thử import sớm.
- Báo lại cho Codex:
  - Import thành công hay lỗi.
  - Nếu lỗi, chụp/ghi nguyên văn lỗi.
  - AI Studio tạo app theo cấu trúc nào.
  - Gemini key/server-side config có được nhận không.

## Cần Quyết Định

- Chưa quyết định port sang React/Next.js/AI Studio native vì cần kết quả Import from GitHub trước.
- Chưa deploy Cloud Run vì nộp chính là AI Studio public link; Cloud Run chỉ backup nếu còn thời gian.
- Chưa chấp nhận các thay đổi source pending về `travel_sales`, `gym_sales`, tab hotline và Firestore auto-detect credentials. Các diff này phải được review/sửa theo task bên dưới trước khi commit.

## Manager Notes

- Codex không tự sửa code tính năng trong mode này.
- Nếu Antigravity commit lệch `AGENTS.md`, Codex ghi "Cần sửa: ..." vào file này thay vì tự vá code.
- Mọi thay đổi lớn về kiến trúc phải chờ người dùng xác nhận.

## TASK-006 - Branch B: Scenario Tuyển Dụng "Việc Nhẹ Lương Cao"

### Trạng Thái

done-pending-review - ưu tiên kế tiếp sau TASK-007. Đã có báo cáo Nhánh B đủ cấu trúc để giao Antigravity. Codex không tự sửa code sản phẩm.

### Mục Tiêu

Cập nhật hoặc thay thế scenario tuyển dụng hiện có thành một scenario huấn luyện nhận diện bẫy "việc nhẹ lương cao" có nguy cơ dẫn tới mua bán người/lao động cưỡng bức ở nước ngoài. Chỉ mô phỏng giai đoạn tuyển dụng ban đầu; không mô phỏng giai đoạn giam giữ, cưỡng bức, vượt biên hoặc vận hành đường dây.

### Scope Cho Antigravity

- Được sửa:
  - `src/data/scenarios.json`
  - `src/services/dashboardService.js` nếu cần thêm recommendation cho red flag mới
  - `tests/run-tests.js`
  - `tests/http-smoke.ps1`
  - tài liệu liên quan nếu cần ghi rõ giới hạn nguồn
- Không được sửa:
  - `geminiClient.server.js`
  - `chatOrchestrator.js` system/model settings
  - `safetyValidator.js`
  - `scoringEngine.js`
  - kiến trúc backend/deploy/Firestore
- Không thêm scenario ngoài chủ đề tuyển dụng "việc nhẹ lương cao" trong task này.

### Nguồn Cho Phép

- File nghiên cứu người dùng cung cấp: `Nghien-Cuu-Tuyen-Dung-Viec-Nhe-Luong-Cao.md`.
- Luật Phòng, chống mua bán người 2024, Luật số 53/2024/QH15, hiệu lực 01/07/2025.
- Nghị định 162/2025/NĐ-CP, Điều 4 và Điều 5 về Tổng đài điện thoại quốc gia phòng, chống mua bán người 111.
- Cổng TTĐT Bộ Công an: cảnh báo thủ đoạn "việc nhẹ, lương cao" dụ xuất cảnh trái phép.
- Báo Chính phủ/Nhân Dân về Tổng đài 111 phòng, chống mua bán người.
- Luật Người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng 2020, Luật số 69/2020/QH14.

### Acceptance Criteria

- Scenario chỉ ở giai đoạn tuyển dụng: tin nhắn mời chào, phỏng vấn ảo, hứa thu nhập cao, yêu cầu quyết định nhanh, yêu cầu giấy tờ để "làm thủ tục".
- Không mô phỏng: giam giữ, đánh đập, cưỡng bức lao động chi tiết, hướng dẫn vượt biên, đường tiểu ngạch, cách vận hành cơ sở lừa đảo.
- Red flags bắt buộc gồm:
  - mô tả công việc mơ hồ/không nêu công ty cụ thể
  - tuyển qua mạng xã hội cá nhân hoặc người quen thay vì kênh chính thức
  - hối thúc quyết định/xuất cảnh gấp
  - không có hợp đồng lao động rõ ràng hoặc từ chối cho xem hợp đồng trước
  - đề nghị đi bằng kênh không chính ngạch hoặc nói "không cần visa/giấy tờ"
- Taxonomy chỉ dùng 5 nhóm đã khóa: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Feedback không đưa câu trả lời mẫu; chỉ dạy pattern và khuyên xác minh doanh nghiệp đưa lao động đi nước ngoài hợp pháp.
- Resource Hub/chỉ dẫn được phép dùng số `111` cho phòng, chống mua bán người; không tự thêm hotline cấp tỉnh hoặc số doanh nghiệp nếu báo cáo ghi chưa có nguồn chính thống dùng chung toàn quốc.
- Không copy nguyên văn báo chí quá 1 câu ngắn; nội dung phải paraphrase.
- Unit test và HTTP smoke test pass.

### Ghi Chú Thực Thi

- **Lệnh giao việc cho Antigravity:** Thực hiện TASK-006 ngay ở sprint kế tiếp. Chỉ sửa các file trong Scope Cho Antigravity. Sau khi hoàn tất, đổi trạng thái task thành `done-pending-review`, ghi diff ngắn, test đã chạy, và không tự push nếu chưa được Codex review.
- Nếu dùng id mới, đề xuất `job_offer_scam`; nếu giữ id hiện có `fake_job`, phải bảo đảm README/test/demo không bị lệch.
- Do chủ đề có yếu tố buôn người/lao động cưỡng bức, lời thoại Gemini cần có tông mô phỏng vừa đủ, không tăng nặng mô tả tổn hại.
- Mọi claim về số liệu tổng quy mô nạn nhân toàn quốc phải ghi **CHƯA XÁC MINH ĐƯỢC** hoặc không đưa vào sản phẩm.
- **Thực thi:**
  - Đã cập nhật và thay thế kịch bản tuyển dụng hiện tại thành kịch bản nhận diện bẫy "Việc nhẹ lương cao" (giữ nguyên ID `fake_job` để tránh phá vỡ test/demo).
  - Đã định nghĩa 5 red flags bắt buộc (`job_vague_description`, `unofficial_recruitment_channel`, `urgent_departure_pressure`, `no_clear_contract`, `illegal_border_crossing_offer`) trong `scenarios.json`.
  - Đã cấu hình các đề xuất và định nghĩa kỹ thuật tương ứng trong `src/services/dashboardService.js` bám sát các nhóm taxonomy có sẵn (`authority`, `social proof/reciprocity`, `urgency`, `scarcity`, `fear`).
  - Đã thêm chỉ dẫn số hotline `111` phòng, chống mua bán người vào Resource Hub trong `src/public/app.js`.
  - Đã cập nhật các assertions trong `tests/run-tests.js`.
  - Đã chạy kiểm tra: Unit tests và HTTP smoke test chạy thành công.
  - Trạng thái mobile viewport vật lý điện thoại thật: **CHƯA XÁC MINH ĐƯỢC** (UNVERIFIED) do chạy trong môi trường headless/shell.

### Review Checklist Riêng Cho TASK-006

- Codex phải đọc `git diff` thật sau khi Antigravity báo xong.
- Codex phải đối chiếu từng red flag với báo cáo `Nghien-Cuu-Tuyen-Dung-Viec-Nhe-Luong-Cao.md`.
- Nếu scenario mô phỏng giai đoạn giam giữ/cưỡng bức/vượt biên hoặc hướng dẫn vận hành đường dây, reject.
- Nếu thêm hotline ngoài `111` mà không có nguồn chính thống trong báo cáo, reject.
- Nếu sửa file ngoài scope mà không có ghi chú giải thích, reject hoặc yêu cầu tách commit.
- Chỉ đánh dấu `done` sau khi unit test, HTTP smoke test và review taxonomy pass.

## TASK-007 - Review/Sửa Pending Diff Resource Hub & Scenario Scope

### Trạng Thái

done - Codex đã review commit `8ba0965` bằng diff/source/test/browser trực tiếp.

### Mục Tiêu

Làm sạch diff đang pending để chỉ giữ phần phù hợp với MVP và nguồn đã xác minh, trước khi commit source.

### Scope Cho Antigravity

- Rà soát các file đang pending:
  - `src/data/scenarios.json`
  - `src/public/app.js`
  - `src/public/app.css`
  - `src/services/dashboardService.js`
  - `src/services/store.js`
  - `tests/run-tests.js`
  - `tests/http-smoke.ps1`
- Tách hoặc loại bỏ thay đổi ngoài task nếu không có nguồn cho phép.

### Nguồn Cho Phép

- `AGENTS.md`.
- `Nghien-Cuu-Tuyen-Dung-Viec-Nhe-Luong-Cao.md`.
- Nguồn official đã nêu ở TASK-006 cho 111/phòng chống mua bán người.
- Với `113` và `canhbao.khonggianmang.vn`, chỉ dùng nếu có nguồn nhà nước/chính thức đã đối chiếu; nếu chưa đối chiếu trực tiếp thì wording phải là hướng dẫn chung, không ghi "đã xác minh".

### Acceptance Criteria

- Nếu giữ `travel_sales` và `gym_sales`, phải có task/nghiên cứu riêng với nguồn cho phép riêng. Nếu chưa có, loại khỏi diff trước commit.
- Tab "Số điện thoại xác minh" không được hiển thị placeholder hoặc số tự đoán. Được phép hướng dẫn người dùng gọi kênh chính thức của tổ chức liên quan.
- Không thêm hotline cụ thể ngoài `111` cho nhánh tuyển dụng/mua bán người nếu chưa có nguồn chính thống.
- Không sửa Firestore/store credential detection chung trong cùng commit scenario/hotline; nếu cần Firestore thì tạo task riêng.
- Mobile QA phải được kiểm tra lại sau khi tab Resource Hub thay đổi. Nếu chưa ép được viewport điện thoại thật, ghi **CHƯA XÁC MINH ĐƯỢC**.
- Unit test và HTTP smoke test pass.

### Ghi Chú Thực Thi

- Diff hiện tại có thay đổi `src/services/store.js` tự bật Firestore khi có `GOOGLE_APPLICATION_CREDENTIALS` hoặc `FIRESTORE_EMULATOR_HOST`. Đây là thay đổi hạ tầng, không thuộc scope scenario/resource hub; cần tách task hoặc revert khỏi commit này.
- **Thực thi:**
  - Đã revert hoàn toàn file `src/services/store.js` về trạng thái HEAD sạch.
  - Đã loại bỏ các kịch bản du lịch (`travel_sales`) và gym (`gym_sales`) khỏi `src/data/scenarios.json` vì chưa có nghiên cứu/nguồn chính thống cho phép riêng.
  - Đã cập nhật `src/public/app.js` loại bỏ phần chỉ dẫn hotline Kỳ nghỉ du lịch và Phòng tập Gym để đồng bộ.
  - Đã cập nhật số lượng kịch bản mong đợi từ 6 về 4 trong `tests/run-tests.js` và `tests/http-smoke.ps1`.
  - Kết quả kiểm tra: Unit tests và HTTP smoke test chạy thành công.
  - Mobile QA ban đầu của Antigravity: Do chạy trong môi trường headless/shell không mô phỏng viewport vật lý điện thoại thật nên ghi nhận trạng thái **CHƯA XÁC MINH ĐƯỢC** cho mobile viewport thực tế; Codex đã kiểm tra lại bằng browser ở phần review bên dưới.

### Codex Review Commit 8ba0965

- **Đã xác minh:** `src/services/store.js` không còn trong diff của commit `8ba0965`; thay đổi Firestore auto-detect credentials đã được tách khỏi commit scenario/resource hub.
- **Đã xác minh:** `travel_sales` và `gym_sales` không còn trong `src`/`tests`; chỉ còn xuất hiện trong lịch sử task/review của `TASKS.md`.
- **Đã xác minh:** Resource Hub chỉ còn 4 mục: `113`, `canhbao.khonggianmang.vn`, hướng dẫn gọi số trên thẻ ngân hàng, hướng dẫn gọi hotline trên website chính thức của công ty tuyển dụng.
- **Đã xác minh:** không còn chỉ dẫn hotline du lịch/gym trong UI.
- **Đã xác minh:** unit/implementation test pass với `node tests/run-tests.js`.
- **Đã xác minh:** HTTP smoke test pass với `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`.
- **Đã xác minh:** `git diff HEAD~1..HEAD --check` sạch.
- **Đã xác minh:** browser QA tại viewport `390x844`: `documentWidth=375`, `horizontalOverflow=false`, tab `Luyện tập` và `Số điện thoại xác minh` hiển thị, Resource Hub render 4 mục, không có text du lịch/gym.
- **CHƯA XÁC MINH ĐƯỢC:** Firestore thật sau restart và concurrency nhiều process; không thuộc scope TASK-007.

## Review Log - Antigravity Firestore/Accessibility Changes

Ngày review: 2026-08-03.

### Đã Kiểm Tra

- Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `git log --oneline -12`.
- Kiểm tra worktree: có thay đổi chưa commit ở `package.json`, `server.js`, `src/public/app.css`, `src/public/app.js`, `src/services/chatOrchestrator.js`, `src/services/dashboardService.js`, `src/services/sessionService.js`, `src/services/store.js`, `tests/run-tests.js`; có `package-lock.json` mới; `node_modules/` ignored.
- Chạy `node tests/run-tests.js`: pass.
- Chạy `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: pass.

### Kết Luận Manager

- Accessibility/UI changes nhỏ nhìn chung phù hợp: toggle chữ to/tương phản cao đã xuất hiện thêm ở màn kết quả, màu muted/primary/warning tăng contrast.
- Firestore persistence là thay đổi kiến trúc lớn hơn P0 Import-from-GitHub spike. Không reject tuyệt đối vì `TechnicalDesign.md` từng ghi Firestore optional, nhưng cần sửa trước khi commit/chấp nhận.

### Cần Sửa: Persist Session Sau Mỗi Chat Turn

Mức độ: P0.

Vấn đề:

- `sendChatMessage()` trong `src/services/chatOrchestrator.js` mutate `session.messages`, `session.turnCount`, `session.redFlagEvents`, `session.status`, `session.completedAt`, `session.isProcessing`.
- Sau khi chuyển store sang Firestore async, function không gọi `await sessions.set(session.id, session)` trước khi return/finally.
- Test pass vì in-memory path trả object reference, nhưng Firestore path trả plain object từ `doc.data()`; mutate object đó không tự persist.

Acceptance criteria:

- Sau mỗi chat turn, transcript, red flags, turnCount, status/completedAt phải persist được qua `getSessionMessages()` và `getDashboard()` khi Firestore bật.
- `isProcessing` lock phải được lưu/clear đúng nếu mục tiêu là chống concurrent cross-request; nếu chỉ in-process lock thì ghi rõ giới hạn.
- Thêm test cover store không trả object reference hoặc mock async store để bắt lỗi missing persist.

### Cần Sửa: Không Nuốt Lỗi Firestore Set/Delete Quan Trọng

Mức độ: P1.

Vấn đề:

- `src/services/store.js` đang `console.error(...)` rồi tiếp tục trả success khi Firestore `set/delete` lỗi.
- API có thể báo tạo session/chat thành công nhưng dữ liệu chỉ nằm in-memory trong instance hiện tại, trái kỳ vọng persistence.

Acceptance criteria:

- Quyết định rõ chế độ: strict Firestore khi đã cấu hình project, hoặc fallback minh bạch.
- Nếu strict: throw lỗi 5xx khi Firestore write fail.
- Nếu fallback: response/runtime status/docs phải nói rõ đang fallback in-memory do Firestore unavailable.

### Cần Sửa: Cập Nhật Docs/Test Theo Firestore Hoặc Hoãn Firestore Sau P0

Mức độ: P1.

Vấn đề:

- `Testing.md` vẫn ghi limitation: "Session storage is in-memory".
- `README.md` chưa nói biến môi trường Firestore hoặc cách chạy/deploy với Firestore.
- P0 hiện là test Import from GitHub vào AI Studio; thêm dependency Firestore có thể làm import surface phức tạp hơn trước khi biết AI Studio xử lý custom Node server ra sao.

Acceptance criteria:

- Nếu giữ Firestore: cập nhật README/Testing/RiskReport/runtime docs và đảm bảo package-lock được commit.
- Nếu chưa cần persistence cho P0: revert/hoãn Firestore, giữ repo đơn giản để test AI Studio Import trước.

### Cần Sửa: Dọn Test Async Và Làm Rõ Store Contract

Mức độ: P2.

Vấn đề:

- `tests/run-tests.js` đã chuyển phần lớn sang `await assert.rejects(...)`, nhưng helper sync `expectThrows()` vẫn còn tồn tại dù không còn usage.
- Test hiện vẫn chủ yếu verify in-memory object-reference behavior; chưa mô phỏng store trả object copy như Firestore.

Acceptance criteria:

- Xóa helper `expectThrows()` nếu không dùng nữa.
- Thêm test regression cho store không trả reference, hoặc tách store adapter để unit test `sendChatMessage()` buộc persist explicit.
- Test phải fail nếu `sendChatMessage()` quên lưu session sau khi mutate.

### Manager Gate Trước Khi Commit Code Antigravity

Trước khi Antigravity commit phần Firestore, phải chọn 1 trong 2 hướng:

1. **Hoãn Firestore đến sau AI Studio Import P0**:
   - Revert các thay đổi Firestore/package async không cần thiết.
   - Giữ accessibility/result toggle nếu muốn vì scope nhỏ.
   - Ưu tiên repo đơn giản để người dùng test Import from GitHub.

2. **Giữ Firestore ngay bây giờ**:
   - Sửa P0 persist chat turn.
   - Sửa/ghi rõ policy khi Firestore write fail.
   - Cập nhật README/Testing/RiskReport/env docs.
   - Commit `package-lock.json`, không commit `node_modules/`.
   - Chạy lại unit + HTTP smoke.

### Chấp Nhận Được Nếu Sửa Xong

- Vẫn giữ training/inoculation, không detection.
- Gemini vẫn server-side và không thêm AI khác.
- Feedback taxonomy không đổi.
- Safety validator không bị đụng.
- Score engine pure function không bị đụng.

## Review Loop - Antigravity Status Recheck

Ngày review: 2026-08-03.

### Kết Luận

- Chưa chấp nhận các thay đổi đang nằm trong worktree.
- P0 persist session sau mỗi chat turn chưa được sửa: `sendChatMessage()` vẫn mutate session nhưng không gọi `sessions.set(...)` trước khi trả kết quả.
- `LOCAL_STATUS.md` không đồng bộ với Git: file ghi worktree sạch và commit `8b44996`, trong khi thực tế có 9 file source đã sửa và `package-lock.json` chưa tracked.

### Cần Sửa Tiếp

- Sửa và test explicit persistence sau mỗi chat turn với store trả object copy, không dựa vào object reference của `Map`.
- Quyết định policy khi Firestore write fail: strict error hoặc fallback minh bạch; cập nhật runtime status/docs tương ứng.
- Cập nhật `LOCAL_STATUS.md` sau khi Antigravity commit thật, không ghi trạng thái giả định trước commit.
- Chỉ sau khi các điểm trên đạt acceptance criteria mới xem xét commit/đẩy phần Firestore.

## Review Loop - Strict Source Verification

Ngày review: 2026-08-03.

### Bằng Chứng Đã Xác Minh Từ Source

- **Đã xác minh:** `geminiClient.server.js` gọi Gemini server-side và không gửi `temperature`, `top_p`, `top_k` trong `generationConfig`.
- **Đã xác minh:** `chatOrchestrator.js` dùng system prompt cho roleplay động và có validator output trước khi hiển thị.
- **Đã xác minh:** `scoringEngine.js` là hàm tính điểm riêng, dùng `recognized / total`.
- **Đã xác minh:** nút Stop gọi flow `POST /api/sessions/{id}/complete` thông qua `renderDashboard()`.
- **Đã xác minh:** `safetyValidator.js` có mask input và chặn output cho OTP, CCCD, phone, account/card, password và link.
- **Đã xác minh:** chat turn hiện có các lệnh `sessions.set(...)` trước, trong và sau xử lý; đây mới chỉ là kiểm tra code tĩnh.

### Chưa Đạt / Chưa Xác Minh Được

- **Cần sửa - taxonomy:** `dashboardService.js` phát sinh key/label `urgency + reciprocity` và `fear + reciprocity`. Checklist `AGENTS.md` chỉ cho phép các nhóm `Urgency`, `Authority`, `Fear`, `Social Proof/Reciprocity`, `Scarcity`; không được phát sinh `reciprocity` như một nhóm độc lập trong biểu thức kỹ thuật.
- **Cần sửa - model lock:** `geminiClient.server.js` và `chatOrchestrator.js` dùng `process.env.GEMINI_MODEL`, nên source cho phép chạy model khác `gemini-3.6-flash`. Chưa có guard ép model đúng yêu cầu `AGENTS.md`.
- **CHƯA XÁC MINH ĐƯỢC:** Firestore persistence thật sau restart hoặc với Firestore emulator/Google Cloud. Unit test hiện không bật Firestore và chưa có fake store trả object copy để chứng minh toàn bộ lifecycle.
- **CHƯA XÁC MINH ĐƯỢC:** concurrency lock chống hai request đồng thời trên nhiều process; TTL 30 giây chỉ được thấy trong code, chưa có integration test.
- **CHƯA XÁC MINH ĐƯỢC:** Accessibility mobile bằng screenshot/browser sau diff mới; source có CSS/controls nhưng chưa phải bằng chứng visual.

### Test Đã Chạy Trong Vòng Này

- `node tests/run-tests.js`: pass.
- `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: pass.
- Hai test trên chưa đủ để kết luận Firestore, model lock hoặc accessibility visual là Đạt.

## Review Loop - Commit aa105a8

Ngày review: 2026-08-03.

### Kết Luận Bằng Chứng

- **Đã xác minh:** model bị khóa về `gemini-3.6-flash`; test có trường hợp đặt model cấm và bắt lỗi.
- **Đã xác minh:** feedback key đã dùng `social proof/reciprocity` thay cho `reciprocity` độc lập; test tách key và đối chiếu với allow-list.
- **Đã xác minh:** in-memory store copy-on-read và `sendChatMessage()` explicit persist có regression test.
- **Đã xác minh:** unit test, HTTP smoke test và `git diff --check` pass trên commit.
- Commit `aa105a8` đã được push sau review.

### Trạng Thái Còn Lại

- **CHƯA XÁC MINH ĐƯỢC:** Firestore thật sau restart hoặc emulator/Google Cloud.
- **CHƯA XÁC MINH ĐƯỢC:** lock chống concurrent request giữa nhiều process/instance.
- **Đã xác minh:** accessibility/mobile visual QA bằng browser tại viewport 390x844; không tràn ngang, không còn voice button, nút `Dừng` và `Gửi` hiển thị, flow chọn tình huống → consent → chat chạy được.

## P1 - Remove Voice Input From MVP Demo

### Mục Tiêu

Loại bỏ tính năng nhập giọng nói khỏi MVP vì không ổn định trên môi trường demo. Giữ luồng nhập văn bản đơn giản làm luồng tương tác chính.

### Phạm Vi Antigravity

- Xóa nút `Nói` và toàn bộ event handler Web Speech API khỏi UI.
- Xóa các test/assertion và wording chỉ dành cho voice input.
- Không xóa hỗ trợ chữ to, tương phản cao, nút lớn, phản hồi khi bấm hoặc nút Stop.
- Không đổi flow MVP, Gemini, safety validator, scoring hoặc taxonomy.

### Acceptance Criteria

- `rg` trên source không còn `SpeechRecognition`, `webkitSpeechRecognition`, `startVietnameseSpeech`, `voice-input` hoặc nhãn `Nói`.
- Màn hình chat vẫn gửi được tin nhắn bằng textarea và nút `Gửi`.
- Unit test và HTTP smoke test pass.
- Kiểm tra mobile không còn khoảng trống hoặc layout thừa do nút voice bị xóa.
- Antigravity báo diff ngắn và commit riêng; không commit `.env`, `LOCAL_STATUS.md` hoặc `node_modules/`.

### Review Kết Quả Commit 3c9abc1

- **Đã xác minh:** đã xóa nút `Nói`, handler Web Speech API, hàm `startVietnameseSpeech` và các assertion voice khỏi source/test.
- **Đã xác minh:** `rg` không còn dấu vết voice trong `src`, `tests`, `README.md` hoặc `docs`.
- **Đã xác minh:** unit test và HTTP smoke test pass.
- Commit `3c9abc1` đã được push.
- **CHƯA XÁC MINH ĐƯỢC:** mobile visual layout sau khi xóa nút bằng screenshot/browser.

## Live Gemini Verification - 2026-08-05

- Đã gọi trực tiếp `GET /api/runtime-status`: `geminiConfigured=true`, model `gemini-3.6-flash`.
- Đã tạo session local, xác nhận consent và gửi một lượt chat thật.
- Kết quả source response: `provider=gemini`, `fallbackReason=""`, `aiOutputValidated=true`.
- Kết luận: Gemini hiện hoạt động trong local demo; lỗi fallback `GEMINI_HTTP_429` trước đó là trạng thái quota/rate limit tại thời điểm cũ.
- **CHƯA XÁC MINH ĐƯỢC:** độ ổn định qua nhiều lượt chat, Firestore thật sau restart, concurrency nhiều process và mobile visual QA.

## Mobile Browser Verification - 2026-08-05

- Đã kiểm tra trực tiếp local app bằng browser ở viewport `390x844`.
- **Đã xác minh:** không có horizontal overflow; sau khi bỏ voice, DOM không còn `#voice-input`/`#voice-name`.
- **Đã xác minh:** nút `Dừng và xem kết quả` và nút `Gửi` hiển thị rõ trên màn hình chat.
- **Đã xác minh:** flow chọn tình huống → consent → chat mở được ở mobile viewport.
- Kết luận cập nhật: mobile visual QA cơ bản đã xác minh; Firestore thật sau restart và concurrency nhiều process vẫn **CHƯA XÁC MINH ĐƯỢC**.

## Bắt Buộc: Review Bằng Chứng Trực Tiếp

- Không tin hoặc dùng báo cáo tự khai của Antigravity làm bằng chứng.
- Tự đọc `git diff`, nội dung system prompt, feedback taxonomy và implementation thực tế.
- Đối chiếu từng kết luận với checklist trong `AGENTS.md`.
- Nếu chưa kiểm chứng được bằng code, diff hoặc test có thể tái lập, phải ghi đúng: **CHƯA XÁC MINH ĐƯỢC**.
- Không ghi “Đạt” dựa trên `LOCAL_STATUS.md`, commit message, README hoặc lời báo cáo nếu chưa đối chiếu với source thật.

## Review Loop - Pending Diff After Status Refresh

Ngày review: 2026-08-05.

### Phạm Vi Diff Đã Đọc Trực Tiếp

- `src/data/scenarios.json`
- `src/public/app.js`
- `src/public/app.css`
- `src/services/dashboardService.js`
- `tests/run-tests.js`
- `tests/http-smoke.ps1`

### Bằng Chứng Đã Xác Minh

- **Đã xác minh:** unit/implementation test pass với `node tests/run-tests.js`.
- **Đã xác minh:** HTTP smoke test pass với `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`.
- **Đã xác minh:** diff không đổi model Gemini, không thêm `temperature`, `top_p`, `top_k`, không đụng `geminiClient.server.js`.
- **Đã xác minh:** diff không đụng `safetyValidator.js` hoặc `scoringEngine.js`.
- **Đã xác minh:** dashboard thêm tab `Luyện tập` và `Số điện thoại xác minh`; tab hotline hiện các hướng dẫn xác minh thay vì placeholder số điện thoại giả.
- **Đã xác minh:** `fake_police` đã được tách thành các red flag mới `police_authority`, `police_fear`, `police_urgency`; `dashboardService.js` có recommendation tương ứng.
- **Đã xác minh:** browser mở được app ở `http://127.0.0.1:3000/`; tab hotline render được 6 mục và không báo horizontal overflow trong viewport thực tế của browser hiện tại.

### Findings / Rủi Ro Cần Quyết Trước Commit

- **P1 - Scope MVP:** diff thêm 2 scenario mới `travel_sales` và `gym_sales`. Đây có thể là mở rộng ngoài MVP nếu PRD/demo hiện đang chỉ cần các tình huống scam chính. Cần PM quyết định giữ vì phù hợp "Social Engineering ngoài ngân hàng" hoặc bỏ để demo gọn.
- **P1 - Mobile QA chưa đủ:** browser capability chưa ép được viewport `390x844`; trang vẫn báo viewport thực tế `1280x720`. Vì vậy mobile QA sau diff mới vẫn **CHƯA XÁC MINH ĐƯỢC**, dù desktop/in-app render không tràn ngang.
- **P1 - Official contact data:** hotline connector không có dữ liệu scam/Công an/NCSC. Web search tìm được nguồn Chính phủ cho `113` và nguồn MIC/NCSC cho `canhbao.khonggianmang.vn`, nhưng danh sách ngân hàng/tuyển dụng/du lịch/gym chỉ là hướng dẫn chung. Không được ghi các mục này là hotline chính thức cụ thể.
- **P2 - Legal wording risk:** các câu "Công an không bao giờ..." trong `dashboardService.js` là wording mạnh. Có lợi cho demo chống lừa đảo, nhưng nên đảm bảo bám nguồn/pháp lý hoặc đổi thành "không yêu cầu qua chat/cuộc gọi chuyển tiền, OTP, cài app lạ" để tránh tuyệt đối hóa quá rộng.
- **P2 - Scenario safety:** `fake_police` mới mô phỏng đe dọa nặng hơn. Source có safety constraint dừng sau yêu cầu chuyển tiền/cài app và cấm coercion cực đoan, nhưng chưa có live Gemini test riêng cho scenario này.

### Trạng Thái

- Chưa commit/push diff này.
- Có thể commit sau khi xử lý quyết định MVP + mobile QA, hoặc rollback/thu gọn các phần vượt scope.
- Firestore restart thật và concurrency nhiều process vẫn **CHƯA XÁC MINH ĐƯỢC**.
