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

## TASK-035 - Rework Firestore Rules và Evidence AI Studio - SECURITY BLOCKER

### Findings Codex đã xác minh từ runtime note

- Runtime note xác nhận Firestore database active và có document persistence, nhưng rule được report là `allow read, write: if true` cho `sessions/{sessionId}`. Đây là **public read/write**, không phải least privilege; bất kỳ client nào có Firebase config có thể đọc/sửa/xóa document nếu đang dùng Firebase Web SDK không Auth.
- Report có hai document/score samples mâu thuẫn cho cùng session: một sample ghi `totalCount: 2`, `triggeredKeys: ["Urgency"]`, `redFlagEvents: []`; raw output sau đó ghi `totalCount: 4`, `triggeredKeys` khác và 4 events. Không được ghi “khớp 100%” khi chưa chọn canonical evidence.
- Source/rules/config AI Studio chưa export về GitHub, nên claim source-level không thể audit từ repo local.

### Điều kiện accept

1. Không có Firestore client access public. Mọi read/write session đi qua server-side identity/IAM; browser không có credential đặc quyền.
2. `firestore.rules` default deny, gồm collection `sessions`; không có `allow read, write: if true` hoặc wildcard public.
3. Nếu AI Studio runtime không thể dùng Firestore server-side sau default deny, dừng và báo BLOCKED; không mở Firebase Auth hay thêm feature ngoài MVP để lách rule.
4. Một canonical evidence duy nhất cho session persistence: session ID, score, `totalCount`, `triggeredKeys`, event count phải khớp trước/sau clear cache + refresh.
5. `QA_REPORT_TASK_032.md` sửa lại có rule source, deployment status, canonical raw output và liệt kê `CHƯA XÁC MINH ĐƯỢC` nếu không export source về GitHub.

### Prompt rework cho AI Studio / Antigravity

> SECURITY REWORK ONLY. Do not change the MVP UI, flow, Gemini model/server-side handling, validator, deterministic scoring, taxonomy, safe fallback, or add Firebase Authentication/Cloud Run/dependencies unless strictly required to restore server-side Firestore access. The current Firestore rule `allow read, write: if true` for `sessions/{sessionId}` is unacceptable because it exposes session documents publicly. Move all Firestore session read/write to a server-side identity/IAM path; browser code must not call Firestore directly and must not receive privileged credentials. Replace deployed `firestore.rules` with default deny for every document, including `sessions`. If the current AI Studio runtime cannot persist after default deny, STOP and report BLOCKED; do not weaken rules or add auth as a workaround. Then rerun persistence test with one canonical completed session: record session ID, score, totalCount, triggeredKeys and event count; clear in-memory cache, refresh, and prove every value matches from the active database. Fix QA_REPORT_TASK_032.md by removing contradictory samples, including actual deployed rule source, database ID, safe raw output, test outputs and file-change list. Do not claim source audit/export to GitHub unless it really occurs. Do not commit/push.

## TASK-036 - Server-Side Firestore Security Preflight - ACCEPTED LOCAL

### Mục tiêu

Sửa và kiểm thử source trong repo trước khi đưa lại vào AI Studio: server-side Firestore only, default-deny rules, không public client access. GitHub là nguồn code chuẩn; AI Studio chỉ provision/configure/test sau khi Codex accept.

### Phạm vi được phép

- `src/services/store.js`, server route/service liên quan nếu bắt buộc, `firestore.rules` (tạo mới), `.gitignore`, `.env.example`, `README.md`, `tests/run-tests.js`, `QA_REPORT_TASK_036.md`.
- Giữ `@google-cloud/firestore` server-side hoặc server identity tương đương. Không thêm Firebase Web SDK vào React/browser.

### Cấm

- Không đổi UI/flow/scenario/Gemini/prompt/validator/scoring/taxonomy/safe fallback/share.
- Không thêm Firebase Authentication, Cloud Run, Firestore client SDK, credentials/config applet, project ID thật hay secret.
- Không mở AI Studio/Firebase Console, không commit/push.

### Acceptance criteria

1. `firestore.rules` default deny hoàn toàn; không có public allow hay wildcard `if true`.
2. Không có import/call Firestore ở `src/react-app/` hay browser bundle; session API vẫn qua Node server.
3. Khi Firestore được cấu hình, write/read failure không im lặng giả thành persistence thành công.
4. Local Map fallback vẫn chạy khi Firestore chưa cấu hình.
5. Có regression test source-level cho rules default deny và không client Firestore import; `npm.cmd test`, HTTP smoke, production build, `git diff --check` PASS.
6. `QA_REPORT_TASK_036.md` nêu diff, test output, các giới hạn cloud `CHƯA XÁC MINH ĐƯỢC`.

### Prompt cho Antigravity

> Làm TASK-036, chỉ server-side Firestore security preflight trong repo trước AI Studio. Đọc AGENTS.md, LOCAL_STATUS.md và TASK-035/036. Sửa tối thiểu để GitHub là source chuẩn: tạo `firestore.rules` default deny cho mọi document, gồm `/sessions/{sessionId}`; tuyệt đối không có `allow read, write: if true`. Giữ mọi session read/write ở Node server qua `@google-cloud/firestore`/server IAM, không Firebase Web SDK/import Firestore trong `src/react-app` hoặc browser. Không thêm Firebase Auth, Cloud Run, secret, project ID/config applet hoặc feature mới. Kiểm tra Firestore errors không bị nuốt; local Map fallback phải giữ khi không cấu hình Firestore. Bổ sung test source-level cho default-deny rules và không có client Firestore import. Chạy `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check`. Tạo `QA_REPORT_TASK_036.md` có diff thật, test output, PASS/FAIL và ghi rõ AI Studio/cloud persistence là CHƯA XÁC MINH ĐƯỢC. Không mở AI Studio/Firebase Console, không commit/push.

### Codex review (2026-08-20)

- `firestore.rules` default deny cho wildcard và `sessions`; không có public `if true`.
- `rg` độc lập xác nhận `src/react-app/` và `src/public/` hiện không có reference Firebase/Firestore; package chỉ dùng server-side `@google-cloud/firestore`.
- Codex chạy `npm.cmd test`, HTTP smoke, production build và `git diff --check`: PASS. `Permission Denied` trong output test là mock để kiểm tra exception được throw, không phải lỗi runtime.
- Giới hạn còn lại: rules chưa được deploy lại và persistence server-side sau default deny chưa được xác minh trên AI Studio. TASK-035 vẫn là blocker cloud.

## TASK-037 - Deploy Security Rules và Verify Cloud Persistence - PENDING CODEX SNAPSHOT

### Thứ tự bắt buộc

1. Codex commit/push source TASK-036 lên GitHub. Không dùng applet/source AI Studio cũ có public rule.
2. AI Studio cập nhật/import đúng commit hash đó.
3. AI Studio deploy `firestore.rules` default deny và chỉ test persistence qua Node server-side identity/IAM.

### Scope

- Không sửa source trừ khi cloud test chứng minh blocker; trước khi sửa phải report blocker cho Codex.
- Không dùng Firebase Web SDK/client direct access, không Firebase Auth, không Cloud Run, không secret/project ID trong Git.
- Không thay UI/MVP/Gemini/validator/scoring/taxonomy/safe fallback.

### Acceptance criteria

1. AI Studio code đang dùng đúng `firestore.rules` default deny từ GitHub source mới.
2. Browser không gọi Firestore trực tiếp; app vẫn dùng API Node.
3. Server-side Firestore write/read thành công khi rule default deny đã deploy; nếu fail thì BLOCKED, không nới rule.
4. Một completed session canonical: session ID, immunity score, total count, triggered keys, event count được ghi lại.
5. Clear in-memory cache + browser refresh; đọc lại đúng toàn bộ giá trị canonical từ cùng active database.
6. `QA_REPORT_TASK_037.md` có commit hash, Project/Database ID, deployed rule source, raw output an toàn, PASS/FAIL/BLOCKED từng bước. Không đưa API key/credential/PII vào report.

### Prompt cho Antigravity / AI Studio

> Làm TASK-037 sau khi Codex cung cấp commit hash source mới. Trong Google AI Studio, cập nhật/import ĐÚNG commit đó; xác nhận `firestore.rules` là default deny và không chứa public `allow ... if true`. Không sửa UI, MVP, Gemini server-side, safety, scoring, taxonomy, safe fallback; không thêm Firebase Auth, Cloud Run, Firebase Web SDK client, dependency, secret hoặc project config vào Git. Deploy đúng rules default deny. Chỉ cho Node server-side identity/IAM đọc/ghi Firestore; browser tiếp tục gọi API Node, không Firestore direct. Tạo một completed session canonical, ghi session ID, immunityScore, totalCount, triggeredKeys, event count. Xóa in-memory cache, refresh browser, đọc lại cùng session và xác nhận mọi giá trị khớp. Nếu server-side access fail sau default deny: dừng, ghi BLOCKED với raw safe error; không nới rule. Tạo `QA_REPORT_TASK_037.md` gồm commit hash, Project/Database ID, rule source đã deploy, file change list, raw output an toàn, test kết quả và mọi CHƯA XÁC MINH ĐƯỢC. Không commit/push.

### Kết quả external report (2026-08-20)

- Source/rules security từ commit `ddfb3d9` được report là đã dùng; cloud test dừng an toàn với `7 PERMISSION_DENIED: Cloud Firestore API has not been used in project ais-asia-east1-779d7537e66b415 before or it is disabled`.
- Không accept cloud persistence: canonical session/allowlist chỉ được xem là evidence local/server attempt cho đến khi read/write thật vào database active thành công sau default deny.
- Có lệch project: database Firestore trước đó report ở `gen-lang-client-0936873228`, nhưng server runtime attempt dùng `ais-asia-east1-779d7537e66b415`. Không tự bật API/billing hay cấp IAM cho project nào khi chưa có owner confirmation.

## TASK-038 - Căn Chỉnh Firestore Project và Server IAM - PENDING OWNER CONFIRMATION

### Mục tiêu

Xác định đúng Firebase/Firestore project do chủ dự án sở hữu, sau đó cấu hình server runtime dùng đúng project và least-privilege IAM để TASK-037 cloud persistence có thể được test lại an toàn.

### Owner cần xác nhận trước

1. Project nào là Firestore project hợp lệ/chủ dự án kiểm soát: `gen-lang-client-0936873228` hay project khác.
2. Có cho phép bật Cloud Firestore API/billing nếu console yêu cầu hay không.
3. Service identity chính xác của AI Studio server runtime và có cho phép cấp quyền Firestore tối thiểu cho identity đó trên đúng project hay không.

### Cấm

- Không tự bật API/billing, không tự cấp IAM, không tự đổi `FIRESTORE_PROJECT_ID` trong Git, không đưa credential vào source/report.
- Không nới `firestore.rules`, không dùng Firebase Web SDK client/Firebase Auth để lách, không thay MVP.

### Acceptance criteria sau owner confirmation

1. Runtime log chỉ ra cùng Project ID/Database ID đã được owner xác nhận.
2. Server-side `@google-cloud/firestore` write/read thành công với rules default deny vẫn deploy.
3. TASK-037 canonical session persistence sau cache clear + refresh PASS.
4. `QA_REPORT_TASK_038.md` ghi evidence an toàn, IAM role ở mức tổng quát không secret và không claim nếu thiếu raw success output.

### Prompt cho Antigravity / AI Studio

> TASK-038 is blocked until the owner explicitly confirms the Firestore project, whether enabling Firestore API/billing is allowed, and the AI Studio server runtime identity may receive least-privilege Firestore access. Do not enable any API, billing, IAM role, rule change, secret, or source config on your own. First report the exact server runtime project/identity and the configured Firestore Project/Database IDs without exposing credentials. After owner confirmation only, use the owner-approved project through server-side `@google-cloud/firestore` and least-privilege IAM; keep firestore.rules default deny and browser API-only. Rerun TASK-037 canonical write -> clear cache -> refresh -> read. If any permission/API mismatch remains, report BLOCKED with raw safe error. Do not add Firebase Web SDK client/Auth, do not change MVP, and do not commit/push.

## TASK-039 - Final Local Import Gate - LOCAL AUDIT COMPLETE / PASS LOCAL

### Mục tiêu

Tạo evidence local cuối cùng cho source GitHub trước khi import vào Google AI Studio. Đây là task Antigravity duy nhất ở vòng hiện tại. Chưa import AI Studio và không thực hiện bất kỳ thao tác Google Cloud/Firebase nào.

### Phạm vi được phép

- Đọc: `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md`, `AI_STUDIO_IMPORT_CHECKLIST.md`.
- Kiểm tra source/rules/config: `firestore.rules`, `.gitignore`, `.env.example`, `src/`, `server.js`, `tests/run-tests.js`, `README.md`.
- Chỉ tạo hoặc cập nhật `QA_REPORT_TASK_039.md` và evidence text an toàn nếu cần.

### Cấm

- Không sửa source, dependency, UI, workflow, Gemini prompt/model, safety validator, scoring, fallback, Firestore rules hoặc config.
- Không mở/import/publish Google AI Studio; không mở Firebase/Google Cloud Console; không bật API/billing; không cấp IAM; không thêm secret hoặc Project ID thật vào Git.
- Không commit/push.

### Acceptance criteria

1. `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check`: PASS.
2. `firestore.rules` là default deny; không có public `allow ... if true`.
3. Browser bundle/source frontend không có Firebase Web SDK hoặc Firestore direct access; chỉ server-side được phép dùng `@google-cloud/firestore`.
4. Secret scan không phát hiện API key/credential bị track; `.gitignore` chặn các mẫu key/service-account hiện có.
5. Ghi chính xác commit HEAD, tracked diff và untracked files; không tự coi QA/Word/evidence untracked là source cần import.
6. Báo cáo tách rõ `PASS local` với `CHƯA XÁC MINH ĐƯỢC cloud`: Gemini ổn định, AI Studio public link, Firestore persistence thật, Facebook/Zalo trên HTTPS public.

### Prompt cho Antigravity

> Làm duy nhất TASK-039 Final Local Import Gate. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` và `AI_STUDIO_IMPORT_CHECKLIST.md`. Chỉ audit local, không sửa bất kỳ source/config/dependency nào, không mở Google AI Studio/Firebase/Cloud Console, không import/publish, không bật API/billing/IAM, không commit/push. Chạy: `npm.cmd test`; `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`; `npm.cmd run frontend:build`; `git diff --check`. Tự đọc `firestore.rules` xác nhận default deny, quét `src/react-app/` và `src/public/` xác nhận không Firebase Web SDK/Firestore direct access, kiểm tra `git ls-files` và `.gitignore` để không có secret/credential bị track. Ghi `QA_REPORT_TASK_039.md` gồm commit HEAD, tracked/untracked status, output tóm tắt từng lệnh, PASS/FAIL từng criterion và mục CHƯA XÁC MINH ĐƯỢC: Gemini live ổn định, AI Studio public, Firestore cloud persistence, Facebook/Zalo HTTPS public. Không tự kết luận import-ready nếu có criterion FAIL; bàn giao diff ngắn và browser evidence nếu có.

### Codex review (2026-08-20)

- Đã tự đọc report, rules, Git status và source frontend; không chỉ dựa vào report Antigravity.
- `npm.cmd test` và HTTP smoke: PASS. Production build: PASS khi chạy ngoài sandbox OneDrive; lỗi access directory ở lần chạy sandbox đầu là giới hạn môi trường, không phải lỗi build source.
- `firestore.rules` default deny; quét độc lập `src/react-app/` và `src/public/` không có Firebase/Firestore; Firestore chỉ có ở server-side `src/services/store.js` qua `@google-cloud/firestore`.
- Secret-content scan không phát hiện key/credential tracked. Workflow Cloud Run chỉ tham chiếu tên Secret Manager `gemini-api-key`, không chứa secret.
- Source code không có diff; worktree hiện chỉ có thay đổi tài liệu/trạng thái và QA/Word/evidence untracked. Trước import, chủ dự án cần chọn snapshot GitHub sạch chứa Markdown cần giữ; không tự thêm toàn bộ QA/Word/evidence untracked.
- TASK-039: **ACCEPTED LOCAL**. Gemini live ổn định, public URL AI Studio, Firestore persistence cloud, Facebook/Zalo trên HTTPS public: **CHƯA XÁC MINH ĐƯỢC**.

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
