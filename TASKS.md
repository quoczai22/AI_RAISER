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
- Worktree có thay đổi local chưa commit, gồm TASK-031 và tài liệu/QA local; xem `git status` trước khi tạo snapshot tiếp theo.
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

1. Khi quota hồi, xác minh Gemini live bằng evidence thật theo TASK-030.
2. Mở AI Studio/public URL bằng thiết bị hoặc tài khoản khác.
3. Test Facebook/Zalo trên HTTPS public.

## TASK-031 - Ngân hàng phản hồi dự phòng theo kịch bản - ACCEPTED LOCAL

- Chỉ dùng khi provider Gemini lỗi, chậm hoặc hết quota; `provider` vẫn là `safe_fallback`, không được ghi là Gemini live.
- Có câu phản hồi được biên soạn sẵn cho đủ 10 kịch bản, chọn theo ngữ cảnh câu hỏi ở mức thô: hỏi làm rõ, trì hoãn hoặc tiếp tục mô phỏng.
- Không thay Gemini trong đường chạy bình thường, không phải decision tree của hội thoại chính, không có OTP/CCCD/tài khoản/đường link thật.
- Đã có regression test cho `fake_bank` và `fake_job`, kèm validator output.
- Cần chạy lại toàn bộ test/build trước khi snapshot commit tiếp theo.

### Prompt cho Antigravity

> Chỉ review/QA, không sửa source/config và không commit/push. Kiểm tra `src/data/safeFallbackResponseBank.json`, `src/services/chatOrchestrator.js` và `tests/run-tests.js`. Xác nhận ngân hàng chỉ được gọi khi `safe_fallback`, đủ 10 scenario, không chứa OTP/CCCD/số tài khoản/điện thoại/link thật và không thay Gemini trong nhánh thành công. Chạy `npm.cmd test`, HTTP smoke và production build. Báo cáo diff ngắn, output test và mọi điểm CHƯA XÁC MINH ĐƯỢC.

## TASK-032 - Spike Firestore trong Google AI Studio - LOCAL HARDENING COMPLETE / AI STUDIO EVIDENCE PENDING

### Mục tiêu

Xác minh Firestore được provision và chạy được **ngay trong AI Studio Build Mode** để lưu tối thiểu lịch sử buổi luyện/điểm sau refresh. Đây là spike lấy evidence cho Google Tech integration, không mở rộng MVP.

### Code đã kiểm chứng local

- `src/services/store.js` chỉ serialize vào Firestore: session/scenario ID, difficulty, timestamps, score, trạng thái và red-flag taxonomy keys.
- Không serialize `userName`, `messages`, `evidenceText`, OTP/CCCD/mật khẩu/tài khoản/điện thoại/link thật.
- Regression test, HTTP smoke và production build: PASS.
- Chưa có Firebase project/config hoặc evidence refresh persistence trong AI Studio; do đó chưa được claim tích hợp.

### Phạm vi và điều kiện dừng

- Chỉ lưu: session ID ngẫu nhiên, scenario ID, level, thời gian, red-flag key, score, trạng thái hoàn thành. Không lưu OTP/CCCD/mật khẩu/tài khoản/điện thoại/link thật hoặc transcript không đã qua masking.
- Giữ Gemini server-side, validator, scoring deterministic, workflow và `safe_fallback` hiện tại.
- Chạy trong preview AI Studio trước; không cần Cloud Run cho bước này.
- Nếu AI Studio không provision được Firebase/Firestore, cần billing ngoài dự kiến hoặc test persistence không đạt trong một phiên làm việc: dừng, giữ Map/JSON hiện tại, ghi `CHƯA XÁC MINH ĐƯỢC`. Không cố ép thay đổi kiến trúc.
- Chỉ gọi Firestore “đã tích hợp” khi có evidence: tạo session → ghi → refresh → đọc lại cùng session/score trong AI Studio.

### Checklist xác minh bắt buộc

1. Trong AI Studio Build Mode, xác nhận project hiện tại đã import/chạy được; không dùng local làm bằng chứng AI Studio.
2. Provision Firebase/Firestore bằng công cụ AI Studio. Nếu màn hình yêu cầu chủ dự án chọn Firebase project, billing hoặc quyền Google thì dừng tại đó và báo đúng thao tác cần chủ dự án làm.
3. Kiểm tra code/config thực tế: Gemini vẫn server-side; không lộ secret/client config nhạy cảm; chỉ các trường allowlist được ghi.
4. Test luồng: tạo buổi luyện → hoàn thành để có score → mở lịch sử và ghi lại session ID/score → Ctrl+R/refresh preview → mở lại lịch sử, session ID/score phải trùng.
5. Kiểm tra Firestore Console hoặc log AI Studio cho document tồn tại; không chụp/ghi API key, token hay dữ liệu nhạy cảm.
6. Test lỗi tối thiểu: tạm làm thao tác ghi thất bại theo cách an toàn nếu AI Studio hỗ trợ, hoặc ghi `CHƯA XÁC MINH ĐƯỢC`; không được kết luận graceful fallback chỉ từ code.
7. Handover bằng `QA_REPORT_TASK_032.md`: URL preview đã che nếu private, Firebase project/database status, file diff, từng bước PASS/FAIL/BLOCKED, screenshot/log an toàn. Không commit/push.

### Prompt cho Antigravity / AI Studio

> Mục tiêu: cấu hình và QA Firestore cho lịch sử buổi luyện ngay trong project Google AI Studio Build Mode đang mở. Chỉ được sửa các file cần cho Firestore persistence/rules/test report; không đổi UI, flow MVP, Gemini server-side, validator hai chiều, scoring deterministic, workflow guard, Stop hay safe fallback. Chỉ ghi allowlist: session ID, scenario ID, difficulty, timestamps, taxonomy keys, score, completion status; cấm OTP, CCCD, mật khẩu, tài khoản/thẻ, điện thoại, link thật, API key hoặc transcript chưa masking. Trong AI Studio, xác nhận preview chạy, provision Firebase/Firestore; nếu cần chủ dự án chọn project/billing/quyền thì dừng và ghi BLOCKED cùng đúng bước cần xác nhận. Test bắt buộc: tạo buổi → hoàn thành → ghi session ID/score → Ctrl+R preview → lịch sử phải trả lại đúng session ID/score; kiểm tra document/log Firestore không lộ secret. Tạo `QA_REPORT_TASK_032.md` gồm file diff, trạng thái Firebase database, từng bước PASS/FAIL/BLOCKED và evidence an toàn. Không commit/push; không claim tích hợp nếu thiếu refresh-persistence evidence.

## TASK-033 - Firestore Preflight Trước AI Studio - READY FOR ANTIGRAVITY

### Mục tiêu

Review độc lập phần code-ready Firestore trước khi đưa repo vào Google AI Studio. Xác nhận dữ liệu ghi cloud đã đúng allowlist và local MVP không bị regression.

### Phạm vi được phép

- Đọc `AGENTS.md`, `LOCAL_STATUS.md`, TASK-032 và các file: `src/services/store.js`, `src/services/sessionService.js`, `src/services/dashboardService.js`, `tests/run-tests.js`, `README.md`.
- Chạy test local; tạo duy nhất `QA_REPORT_TASK_033.md` và evidence text an toàn nếu cần.
- Chỉ sửa source/test khi phát hiện lỗi có thể chứng minh bằng code/test. Trước khi sửa phải nêu file, lỗi và lý do; không tự refactor.

### Cấm

- Không mở AI Studio/Firebase Console, không provision Firebase, không thêm Project ID/credential vào `.env`, không dùng/gửi secret.
- Không sửa UI, flow MVP, prompt Gemini, taxonomy, scoring, workflow guard, safe fallback hoặc dependency.
- Không commit/push.

### Acceptance criteria

1. `sanitizeSessionForFirestore` chỉ có: schema version, ID, scenario ID, difficulty, timestamps, status, turn count, score và `redFlagKey`/status/time.
2. Không có `userName`, `messages`, `evidenceText`, OTP, CCCD, mật khẩu, tài khoản/thẻ, điện thoại, link hoặc API key trong Firestore document.
3. Đọc Firestore trả shape mà dashboard/score vẫn dùng được; local Map giữ nguyên đầy đủ session để chat local không hỏng.
4. `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check` đều PASS.
5. Báo cáo có diff thật, lệnh/output test, trạng thái từng criterion và `CHƯA XÁC MINH ĐƯỢC`: Firebase/AI Studio/restart persistence thật.

### Prompt cho Antigravity

> Bạn đang làm TASK-033, chỉ Firestore preflight local trước AI Studio. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, TASK-032/033 trước. Review bằng code thật: `src/services/store.js` phải chỉ serialize allowlist gồm schemaVersion, session/scenario ID, difficulty, consent/created/started/completed/updated timestamps, status, turnCount, score và redFlagEvents chỉ có redFlagKey/status/createdAt. Xác nhận tuyệt đối không serialize userName, messages, evidenceText, OTP, CCCD, password, bank/account/card number, phone, real link hay API key. Kiểm tra hydrate Firestore còn đủ cho dashboard/scoring, trong khi Map local giữ session đầy đủ để chat không hỏng. Chạy `npm.cmd test`; `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`; `npm.cmd run frontend:build`; `git diff --check`. Chỉ khi thấy lỗi chứng minh được mới sửa phạm vi hẹp và nêu rõ lý do. Tạo `QA_REPORT_TASK_033.md` với file diff, output test, PASS/FAIL từng criterion và các mục CHƯA XÁC MINH ĐƯỢC (Firebase/AI Studio/restart persistence thật). Không mở AI Studio/Firebase Console, không thêm secret/config cloud, không sửa UI/Gemini/safety/scoring/fallback, không commit/push.

### Codex review / rework (2026-08-20)

- `QA_REPORT_TASK_033.md` có report/test hợp lệ, nhưng phần `score` ban đầu được copy nguyên object nên chưa phải allowlist chặt.
- Đã sửa `sanitizeSessionForFirestore`: `score` chỉ còn `immunityScore`, `recognizedCount`, `totalCount`, `triggeredKeys`, `createdAt`; không lưu mô tả/array red flag đầy đủ.
- `dashboardService` tự tính lại mô tả score từ `redFlagEvents` khi đọc document Firestore rút gọn.
- Codex chạy lại `npm.cmd test`, HTTP smoke, production build và `git diff --check`: PASS.
- Firebase/AI Studio/restart persistence thật vẫn `CHƯA XÁC MINH ĐƯỢC`.

### Prompt recheck cho Antigravity

> Chỉ recheck TASK-033 sau Codex rework, không sửa code/config, không mở AI Studio/Firebase và không commit/push. Đọc `src/services/store.js`, `src/services/dashboardService.js`, `tests/run-tests.js`. Xác nhận `score` Firestore chỉ gồm immunityScore, recognizedCount, totalCount, triggeredKeys, createdAt; không có recognizedRedFlags/missedRedFlags/explanation/evidence hay nội dung chat. Xác nhận `getDashboard` tự tính lại display score khi document Firestore rút gọn. Chạy `npm.cmd test` và `git diff --check`; thêm một mục recheck ngắn vào `QA_REPORT_TASK_033.md`, ghi rõ Firebase/AI Studio/restart vẫn CHƯA XÁC MINH ĐƯỢC. Không claim Firestore cloud hoạt động.

## TASK-034 - Handoff Triển Khai AI Studio - READY FOR CLAUDE/AI STUDIO

- Nguồn context duy nhất để soạn prompt: `AI_STUDIO_HANDOFF.md`, `AGENTS.md`, `LOCAL_STATUS.md` mục 7.
- Claude chỉ soạn một prompt triển khai; AI Studio agent mới thực hiện provision/test. Không tự mở rộng MVP hay đổi kiến trúc.
- Sau AI Studio run, bắt buộc tạo `QA_REPORT_TASK_032.md` theo evidence refresh persistence. Không có evidence thì giữ `CHƯA XÁC MINH ĐƯỢC`.

### Prompt cho Claude

> Đọc `AI_STUDIO_HANDOFF.md`, `AGENTS.md` và `LOCAL_STATUS.md` mục 7. Trả về đúng một prompt tiếng Việt, copy-ready cho Google AI Studio Build Mode. Prompt phải giữ nguyên toàn bộ MVP và Gemini server-side, chỉ provision Firestore để lưu completed-session history theo allowlist, cấm mọi dữ liệu nhạy cảm/transcript, yêu cầu dừng nếu cần owner chọn project/billing/quyền, yêu cầu test create -> complete -> refresh -> same session score, tạo `QA_REPORT_TASK_032.md`, không commit/push và không claim PASS nếu thiếu evidence. Không brainstorm và không đề xuất feature/stack khác.

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

## TASK-030 - Xác minh Gemini live và Firestore thật - BLOCKED

### Kết quả review hiện tại

- `docs/live_gemini_test_report.md` và `docs/fake_job_dynamic_test_report.md` chỉ là report ngày 2026-08-03; chúng ghi có mẫu provider `gemini` cũ nhưng không có raw probe output mới cho 2-3 lượt liên tiếp.
- Report cũng ghi `GEMINI_HTTP_429`; không có evidence về giới hạn quota cụ thể hoặc đối chiếu Project ID có billing 300k. Không được kết luận Gemini live ổn định.
- `.env` có Gemini key/model nhưng không có `FIRESTORE_PROJECT_ID`, `GOOGLE_CLOUD_PROJECT` hay `ENABLE_FIRESTORE=true`. Firestore không được bật trong local runtime hiện tại.
- `src/services/store.js` đã có wrapper Firestore trong snapshot, nhưng runtime hiện không nhận cấu hình Firestore. Chưa có test persistence thật; policy khi Firestore lỗi chỉ được chấp nhận sau evidence runtime, không suy đoán từ code.

### Điều kiện để mở task

Chủ dự án phải cung cấp hoặc cấu hình cục bộ, không gửi secret vào chat/Git:

1. Một Project ID được xác định rõ đã bật billing/quota Gemini và Firestore API.
2. Credential Google Application Default Credentials hoặc service account đặt ngoài Git, đủ quyền Firestore.
3. Xác nhận được phép dùng quota để chạy live probe.

### Acceptance criteria khi có môi trường thật

1. Lưu raw JSON output của `tests/live-gemini-probe.ps1` cho ít nhất 2-3 lượt liên tiếp: `provider=gemini`, `fallbackReason` rỗng, model `gemini-3.6-flash`.
2. Ghi Project ID đã dùng trong report, nhưng không ghi API key/credential; đối chiếu được billing/quota bằng console/log thực tế, không đoán requests/phút.
3. Firestore: tạo session, ghi session ID, restart server, đọc lại chính session ID và message/red-flag/score; report phải có output trước/sau restart.
4. Khi Firestore tạm lỗi: chứng minh app fallback in-memory có chủ đích và runtime/report nói rõ persistence không bảo đảm; hoặc chọn strict 5xx. Không chấp nhận nuốt lỗi không minh bạch.
5. Cập nhật `LOCAL_STATUS.md` chỉ sau khi evidence đạt; không commit/push trước Codex review.

### Prompt cho Antigravity

> Không sửa code và không commit/push. TASK-030 đang BLOCKED cho đến khi chủ dự án cấu hình Project ID, billing/quota và Google credentials ngoài Git. Khi đủ môi trường, chạy `tests/live-gemini-probe.ps1` với delay; lưu raw JSON output vào report, chỉ ghi PASS nếu 2-3 lượt liên tiếp có `provider=gemini`, `fallbackReason` rỗng và model `gemini-3.6-flash`. Không gọi fallback là Gemini live; không đoán quota limit, phải ghi evidence console/log của Project ID thực dùng. Với Firestore, tạo session, restart server rồi đọc lại đúng session ID và dữ liệu; ghi output trước/sau restart. Đồng thời kiểm tra tình huống Firestore lỗi: fallback phải minh bạch hoặc strict 5xx, không nuốt lỗi rồi claim persistence. Chỉ tạo `QA_REPORT_TASK_030.md` và evidence/report; không sửa source/config/.env/test. Nếu thiếu Project ID/credential hoặc quota, ghi BLOCKED/CHƯA XÁC MINH ĐƯỢC.

### Codex review (2026-08-20)

- `QA_REPORT_TASK_030.md` tồn tại và đánh dấu Gemini/Firestore là `BLOCKED / CHƯA XÁC MINH ĐƯỢC`: đạt tính trung thực.
- `src/services/store.js` đã được trả về sạch; không còn thay đổi Firestore uncommitted.
- Claim `generate_content_free_tier_requests = 20 RPM` trong report chưa có console/log của Project ID hiện tại. Google xác nhận quota phụ thuộc model/tier và active limits phải xem trong AI Studio; không dùng con số 20 RPM làm fact của dự án.
- Không có raw live probe mới, Project ID/billing evidence, Firestore credential hay restart persistence evidence. TASK-030 giữ `BLOCKED`.
- Chủ dự án UAT xác nhận Gemini phản hồi được 2 lượt rồi quota/rate limit sau nhiều lượt test, và nút Dừng hoạt động. Gemini live chuyển từ “chưa từng phản hồi” sang `PARTIALLY VERIFIED`; chưa đủ để claim ổn định hoặc bỏ safe fallback.

### Prompt rework report cho Antigravity

> Không sửa code/config/test và không commit/push. Chỉ sửa `QA_REPORT_TASK_030.md`: đổi claim cụ thể “20 RPM” thành “quota chưa xác minh; rate limit phụ thuộc model/tier, xem Active rate limits trong Google AI Studio”. Không thêm số RPM nếu không có screenshot/log console của đúng Project ID. Giữ Gemini live và Firestore ở BLOCKED/CHƯA XÁC MINH ĐƯỢC; không tạo evidence giả.

### Prompt cho Antigravity khi quota hồi

> Không sửa code/config/test và không commit/push. Khi chủ dự án xác nhận quota Gemini đã hồi, chạy đúng một live probe có delay; lưu raw JSON vào `QA_REPORT_TASK_030.md`. Ghi `provider`, `fallbackReason`, `model` cho từng lượt. Chỉ gọi Gemini ổn định nếu có ít nhất 3 lượt liên tiếp `provider=gemini`, fallback reason rỗng. Nếu 429 sau 1-2 lượt, ghi `PARTIALLY VERIFIED` và dừng probe để giữ quota. Không đụng Firestore khi chưa có Project ID/credential.

## Backlog Sau MVP

- Baseline và lịch sử điểm theo 5 taxonomy.
- Gợi ý bài luyện từ nhóm dấu hiệu còn yếu; scoring vẫn deterministic.
- Link chia sẻ riêng tư, chỉ đọc, có thời hạn và không chứa transcript.
- Nhắc luyện định kỳ trong app; chưa gửi Zalo tự động.
- Dashboard thống kê ẩn danh cho tổ chức.

Không biến người thân thành actor chính, không giám sát âm thầm và không đưa backlog vào MVP trước khi nộp.
