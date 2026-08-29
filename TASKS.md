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

## TASK-037 - Deploy Security Rules và Verify Cloud Persistence - PARTIALLY ACCEPTED

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

### Cloud evidence recheck (2026-08-22)

- Runtime log report đã trỏ đúng `gen-lang-client-0936873228` và named database `ai-studio-airaiser-5eff3d82-fcb2-4a70-9917-52c580ed5631` sau owner-approved IAM/config.
- Canonical session `b60cf6cf-3d64-41f5-bb5a-7c0b687345f2` có session ID, score `25`, total `4`, 2 triggered keys và 2 red-flag events được report là khớp sau `inMemoryMap.clear()` và Firestore read-back. Đây là **PASS server-side persistence evidence**; allowlist không lộ PII trong report.
- Chưa accept toàn bộ browser-refresh criterion: report không nêu thao tác refresh Preview/browser thật. Giữ mục này `CHƯA XÁC MINH ĐƯỢC` cho đến khi có một lần refresh UI và lịch sử/score đọc lại đúng.

### Prompt recheck cho Antigravity

> Chỉ QA browser evidence cho TASK-037, không sửa code/config/rules/IAM, không commit/push. Trên Preview AI Studio đã kết nối Firestore, tạo hoặc mở completed session `b60cf6cf-3d64-41f5-bb5a-7c0b687345f2`; ghi score/total/triggered key count trước refresh. Thực hiện browser refresh thật (Ctrl+R hoặc Reload Preview), mở lịch sử/dashboard và xác nhận session/score còn tồn tại. Cập nhật `QA_REPORT_TASK_037.md` với thao tác refresh, giá trị trước/sau và PASS/FAIL. Nếu session không hiện do UI chỉ giữ metadata an toàn, ghi BLOCKED/CHƯA XÁC MINH ĐƯỢC, không sửa source hay nới bảo mật.

## TASK-038 - Căn Chỉnh Firestore Project và Server IAM - ACCEPTED

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

## TASK-040 - Firestore Server Config Alignment - ACCEPTED

### Mục tiêu

Loại bỏ việc backend vô tình dùng runtime project/database mặc định trong AI Studio. Server phải nhận rõ `FIRESTORE_PROJECT_ID` và optional `FIRESTORE_DATABASE_ID` qua môi trường server-side, không đưa ID thật hay credential vào Git.

### Phạm vi

- Chỉ: `src/services/store.js`, `.env.example`, `README.md`, `tests/run-tests.js`, `LOCAL_STATUS.md`, `TASKS.md`.
- Không đổi Firestore rules, IAM, cloud config, UI, Gemini, validator, scoring, fallback hoặc dependency.

### Acceptance criteria

1. Không có project ID thì giữ Map in-memory.
2. Có project ID thì tạo Firestore server-side đúng project; có database ID thì dùng named database đó, để trống thì dùng `(default)`.
3. Không có Firebase Web SDK/browser access hay secret/ID thật trong Git.
4. Unit test, HTTP smoke, production build và `git diff --check` PASS.

### Prompt cho Antigravity

> Làm QA/review TASK-040, không sửa code/config, không mở AI Studio/Firebase/Cloud Console và không commit/push. Đọc `src/services/store.js`, `.env.example`, `README.md`, `tests/run-tests.js`. Xác nhận `FIRESTORE_PROJECT_ID` và optional `FIRESTORE_DATABASE_ID` chỉ được đọc server-side; thiếu project ID phải giữ Map fallback, named database phải được truyền vào `@google-cloud/firestore`, không có project/database ID thật, Firebase Web SDK hay browser direct access. Chạy `npm.cmd test`, HTTP smoke, production build và `git diff --check`. Báo cáo diff ngắn, output thật và mọi mục CHƯA XÁC MINH ĐƯỢC cloud. Không commit/push.

### Codex implementation review (2026-08-22)

- Đã thêm `getFirestoreConfig`: server ưu tiên `FIRESTORE_PROJECT_ID`, nhận optional `FIRESTORE_DATABASE_ID`; chỉ khi database ID để trống mới dùng `(default)`.
- Không có project ID thì tiếp tục Map in-memory; không đổi rule/IAM/cloud setting hay browser boundary.
- Bổ sung test config thuần, `.env.example` và README; không có ID/credential thật trong source.
- Codex chạy `npm.cmd test`, HTTP smoke, production build và `git diff --check`: PASS.
- Cloud vẫn `CHƯA XÁC MINH ĐƯỢC`: cần owner xác định một database ID hiện hành, cấu hình 2 biến trong **server environment AI Studio** rồi chạy canonical persistence test. Không đoán ID từ các report cũ.

## TASK-041 - Nguồn Tham Khảo Chính Thức - ACCEPTED LOCAL

### Mục tiêu

Giữ Resource Hub/Số xác minh là công cụ hỗ trợ người dùng, không thành web browser. Phần nguồn phía trên có đúng 7 thẻ mở tab mới; danh mục cảnh báo 7 địa phương phía dưới không thay đổi.

### Phạm vi

- Chỉ `src/react-app/components/Hotlines.jsx`, `TASKS.md`, `LOCAL_STATUS.md` nếu cần.
- Nguồn mới phải là link trực tiếp, mô tả thuần Việt ngắn. Chỉ thêm số điện thoại theo địa phương khi có link nguồn cơ quan chính thức ngay trên thẻ đó.

### Cấm

- Không nhúng iframe/web browsing trong app, không sửa catalog 7 địa phương, workflow, Gemini, safety/scoring hoặc Firestore.

### Acceptance criteria

1. Có đúng 7 thẻ trong `onlineChecks`; mọi link dùng `target="_blank"` và `rel="noopener noreferrer"`.
2. Giữ nguyên 7 item danh mục cảnh báo theo địa phương. Chỉ Hải Phòng và Đà Nẵng có contact địa phương đã được source chính thức xác minh; không suy diễn số cho các địa phương khác.
3. Test và production build PASS.

### Prompt cho Antigravity

> Chỉ review/QA TASK-041, không sửa source/config và không commit/push. Đọc `src/react-app/components/Hotlines.jsx`, app CSS và data catalog địa phương. Xác nhận `onlineChecks` có đúng 7 thẻ, tất cả link mở tab mới an toàn, mô tả ngắn thuần Việt; catalog giữ đúng 7 item, chỉ Hải Phòng/Đà Nẵng có số liên hệ địa phương và mỗi số có source URL chính thức. Xác nhận không iframe/browser embed, không suy diễn số cho tỉnh khác. Chạy `npm.cmd test`, HTTP smoke, production build và `git diff --check`. Báo cáo số lượng, output test và mọi lỗi link/build, không tự kết luận link ngoài còn hoạt động nếu không mở kiểm tra.

### Codex review (2026-08-22)

- `onlineChecks`: 7 thẻ; catalog địa phương: 7 item, giữ nguyên.
- Các link mới là nguồn tham khảo mở tab mới; không có iframe hoặc browser embed.
- `npm.cmd test`, HTTP smoke, production build và `git diff --check`: PASS.
- Độ sẵn sàng theo thời gian của từng website ngoài vẫn cần người dùng/browser xác minh khi Public; không ảnh hưởng local build.
- Bổ sung duy nhất hai contact địa phương có nguồn cơ quan chính thức: Hải Phòng `0766 05 05 05` và Đà Nẵng `0694 260 319`; mỗi contact có link nguồn ngay trên thẻ. Không có số được suy diễn cho 5 địa phương còn lại.
- TASK-041: **ACCEPTED LOCAL**.

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

## TASK-042 - Cô lập phiên ẩn danh cho Public UAT - ACCEPTED IN AI STUDIO EXPORT

### Mục tiêu

Giữ trải nghiệm không mật khẩu nhưng không để session ID một mình trở thành quyền đọc/ghi phiên. Mỗi browser phải có một capability ngẫu nhiên riêng; server xác minh capability này cho mọi route đọc/ghi session.

### Phạm vi

- Chỉ: `server.js`, `src/services/sessionService.js`, `src/services/store.js`, `src/react-app/App.jsx`, các component gọi `/api/sessions/*`, `tests/run-tests.js`, `tests/http-smoke.ps1`, `LOCAL_STATUS.md`, `TASKS.md`, `RiskReport.md`.
- Có thể thêm field capability hash vào Firestore allowlist nếu cần, nhưng tuyệt đối không lưu username, transcript, OTP, CCCD, mật khẩu, tài khoản, link thật hoặc raw capability.

### Không được làm

- Không thêm Firebase Web SDK, Firebase Auth, rule public, tài khoản/mật khẩu, UI đăng nhập, dependency mới, thay đổi Gemini/validator/scoring/workflow, commit hay push trước review.

### Acceptance criteria

1. Session ID đơn lẻ trả `403` cho GET/messages/consent/chat/complete/dashboard.
2. Browser đã tạo session vẫn hoàn tất đầy đủ flow và refresh cùng browser vẫn đọc lại được session; browser khác hoặc URL copy không có capability không đọc/ghi được.
3. Raw capability không vào Firestore/log/report; chỉ server-side hash hoặc verifier tương đương.
4. `npm.cmd test`, HTTP smoke, production build và `git diff --check` PASS; report ghi rõ test thật và mọi giới hạn.

### Prompt cho Antigravity

> Làm duy nhất TASK-042. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md`, `RiskReport.md` trước. Mục tiêu: giữ UX không mật khẩu nhưng buộc mọi API `/api/sessions/*` xác minh một anonymous per-browser session capability, để UUID session đơn lẻ không mở hoặc sửa phiên. Chỉ được sửa `server.js`, `src/services/sessionService.js`, `src/services/store.js`, `src/react-app/App.jsx`, component gọi API, test/smoke và tài liệu task/status/risk. Không thêm Firebase Web SDK/Auth, public Firestore rule, dependency, login UI; không đổi Gemini, safety validator, scoring hay workflow. Không lưu raw capability, username, transcript hoặc PII vào Firestore/log/report; chỉ dùng hash/verifier server-side. Thêm test: không credential -> 403 cho GET/messages/consent/chat/complete/dashboard; đúng browser capability -> workflow vẫn hoàn tất và refresh cùng browser đọc lại được; capability sai -> 403. Chạy `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check`. Tạo/cập nhật QA report với command output thật, browser evidence nếu có, mọi mục CHƯA XÁC MINH ĐƯỢC. Không commit/push; bàn giao diff ngắn để Codex review.

### Codex review from AI Studio export (2026-08-23)

- Đã tự đọc ZIP export, không dựa riêng report: `randomBytes(32)`, SHA-256, `timingSafeEqual`, Firestore hash allowlist và header ở React/legacy client có mặt.
- `npm.cmd test`: PASS; HTTP smoke: PASS; production build: PASS khi chạy ngoài sandbox OneDrive. Không phát hiện secret thực trong export.
- **Không accept:** POST `/api/sessions` đang trả raw capability hai lần trong cùng response: `session.capability` và top-level `capability`. Chỉ top-level `capability` được phép có raw value; object `session` phải luôn là public summary.
- Smoke hiện chỉ chứng minh missing/wrong capability cho GET session và missing capability dashboard. Cần regression HTTP cho cả GET messages, POST consent, POST messages/chat, POST complete, GET dashboard với missing và wrong capability; tất cả phải `403` trước khi kiểm tra state.
- `QA_REPORT_TASK_042.md` chưa có trong ZIP; browser B thực tế mở URL `#share/<sessionId>` không có localStorage capability cũng chưa có evidence.

### Prompt rework cho Google AI Studio

> Rework duy nhất TASK-042 theo findings đã xác minh. Không đổi UI, workflow, Gemini, validator, scoring, Firestore rules, dependency hay cấu trúc project. 1) Trong `server.js`, sau `createSession`, destructure raw capability và chỉ trả `{ session: publicSummary, capability }`; cấm `publicSummary.capability`, `sessionCapabilityHash` hoặc raw capability xuất hiện trong bất kỳ GET response/log/report nào. Frontend chỉ đọc top-level `data.capability`, không fallback sang `data.session.capability`. 2) Mở rộng `tests/http-smoke.ps1`: với cùng session, thiếu capability VÀ capability sai phải trả 403 cho GET session, GET messages, POST consent, POST messages, POST complete, GET dashboard. Chỉ sau đó mới dùng capability đúng để chạy flow. 3) Tạo `QA_REPORT_TASK_042.md` với file changed, output thật của test/smoke/build/diff check, và browser test: copy URL `#share/<sessionId>` sang browser profile/Incognito khác không có localStorage capability phải quay về trang chính hoặc không tải dữ liệu. Không ghi raw capability/session hash vào report. Chạy `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check`. Không commit/push.

### Codex rework review 2 (2026-08-23)

- ZIP rework 2: server destructures correctly; HTTP smoke thật có 12 checks 403 và `npm.cmd test`, smoke, production build đều PASS. Rules/package không đổi; không thấy secret thật.
- **REJECTED:** `src/react-app/App.jsx` vẫn có `const cap = data.capability || sess?.capability;`. Đây là fallback bị cấm.
- Test source-level cho fallback là false positive: chỉ quét `data.session.capability`/`data.session?.capability`, không quét `sess?.capability`; report vì thế claim “đã xóa hoàn toàn” không đúng với source.
- QA report mô tả Incognito nhưng ZIP không kèm ảnh/clip/log browser độc lập. Giữ `CHƯA XÁC MINH ĐƯỢC`, không gọi là Browser Evidence PASS.

### Prompt rework 2 cho Google AI Studio

> Sửa duy nhất lỗi TASK-042 đã xác minh, không đổi UI/workflow/Gemini/safety/scoring/Firestore rules/dependency. Trong `src/react-app/App.jsx`, thay đúng dòng `const cap = data.capability || sess?.capability;` bằng `const cap = data.capability;`. Không được đọc `sess?.capability`, `session.capability`, `data.session.capability` hay `data.session?.capability` ở React hoặc legacy client. Sửa `tests/run-tests.js` để test không false positive: assert chính xác source có `const cap = data.capability;` và regex phải fail nếu xuất hiện bất kỳ `(data|sess|session)\\??.capability` nào ngoài object `sessionCapability` hợp lệ. Cập nhật `QA_REPORT_TASK_042.md`: bỏ claim Browser/Incognito PASS nếu không đính kèm screenshot/clip/log thực; ghi `CHƯA XÁC MINH ĐƯỢC` thay vào đó. Giữ 12 HTTP 403 test. Chạy `npm.cmd test`, HTTP smoke, production build và `git diff --check`; không commit/push.

### Codex acceptance review 3 (2026-08-23)

- Đã tự đọc ZIP rework 3: server chỉ trả raw capability top-level lúc tạo; React và legacy client chỉ đọc `data`/`payload.capability`; raw/hash không xuất hiện trong GET response.
- Đã tự chạy trên ZIP: `npm.cmd test` PASS, HTTP smoke PASS (12 trường hợp 403: 6 endpoint x thiếu/sai capability), production build PASS. `firestore.rules` và `package.json` không đổi; secret scan không phát hiện credential thật.
- `QA_REPORT_TASK_042.md` đã đánh dấu Incognito/browser là `CHƯA XÁC MINH ĐƯỢC` khi không có evidence thực.
- TASK-042: **ACCEPTED IN AI STUDIO EXPORT**. GitHub/local `master` chưa có patch do AI Studio push ngược lỗi; không gọi là synced GitHub.

## TASK-043 - Sửa Dashboard `undefined` Và Lịch Sử Capability - OPEN

### Mục tiêu

Sửa lỗi runtime đã xác minh: API/dashboard trả `sessionId` nhưng React Dashboard mở `history[0].id`, tạo URL `#dashboard/undefined`. Đồng thời không để lịch sử cũ thiếu capability tạo redirect chớp nhoáng.

### Phạm vi

- Chỉ `src/react-app/App.jsx`, `src/react-app/components/Dashboard.jsx`, `src/react-app/components/ResultScorecard.jsx`, `src/react-app/components/ShareCard.jsx`, `src/react-app/sessionCapability.js`, test/smoke và report QA.
- Không sửa server capability, Gemini, validator, scoring, Firestore rules, UI visual design, dependency hay workflow chính.

### Acceptance criteria

1. Mọi history item dùng một ID chuẩn: `id = item.id || item.sessionId`; Dashboard không bao giờ tạo `#dashboard/undefined`.
2. Dashboard chỉ dùng lịch sử có capability local tương ứng; session lịch sử cũ không còn quyền mở không được tính là “kết quả gần đây”.
3. Truy cập `#dashboard/<id>` hoặc `#share/<id>` không có capability hiển thị thông báo thuần Việt rõ ràng và nút về trang chính, không redirect chớp nhoáng.
4. Session mới tạo sau TASK-042 vẫn mở kết quả/chia sẻ bình thường cùng browser, kể cả refresh.
5. Test/build/smoke PASS; không xóa session Firestore, không ghi capability/hash vào UI/log/report.

### Prompt cho Google AI Studio

> Làm duy nhất TASK-043. Đọc `AGENTS.md`, `TASKS.md`, `LOCAL_STATUS.md`. Bug đã xác minh trong source: `dashboardService` trả `sessionId`, `ChatShell` lưu dashboard object vào `aisi_history`, nhưng `Dashboard.jsx` mở `history[0].id`; vì vậy URL thành `#dashboard/undefined`. Sửa tối thiểu: khi lưu/đọc history, chuẩn hóa `id: item.id || item.sessionId`; Dashboard chỉ tạo route khi có ID hợp lệ và dùng ID chuẩn đó. Filter history được hiển thị để chỉ giữ item có `aisi_cap_<id>` trong localStorage; không xóa Firestore, không tự tạo capability mới. Với `ResultScorecard` và `ShareCard`, khi API trả 403/missing capability thì hiển thị màn hình tiếng Việt: “Kết quả này chỉ mở được trên thiết bị đã thực hiện buổi luyện tập.” và một nút “Về trang chính”; không tự đổi hash/redirect. Giữ 404/409 xử lý phù hợp, không hiển thị raw error/capability. Thêm regression: tạo session mới → consent/chat/complete → dashboard history phải có `id === sessionId`; click Xem kết quả gần đây không tạo `undefined`; session thiếu capability không load kết quả. Tạo `QA_REPORT_TASK_043.md`; chạy `npm.cmd test`, HTTP smoke, production build, `git diff --check`. Không đổi server security, Gemini, Firestore rules, scoring, UI design/dependency; không commit/push.

Không biến người thân thành actor chính, không giám sát âm thầm và không đưa backlog vào MVP trước khi nộp.

## TASK-044 - Giảm chi phí Gemini khi nhiều người dùng - ACCEPTED LOCAL

### Mục tiêu

Giảm số request và token Gemini trên mỗi buổi luyện để nhiều người có thể dùng MVP hơn, nhưng vẫn giữ đủ trải nghiệm học. Không yêu cầu người dùng tự nhập API key. Khi Gemini gặp 429/lỗi tạm thời, app tiếp tục bằng `safeFallbackResponseBank.json` và phải nói minh bạch đây là phản hồi an toàn dự phòng.

### Quyết định phạm vi

- Không chuyển API key xuống trình duyệt.
- Không lưu câu trả lời chat hoặc transcript vào Firestore.
- Không đưa ngân hàng fallback vào Firestore chỉ để giảm quota; file JSON tĩnh hiện tại là đủ và không tiêu tốn request Gemini.
- Firestore chỉ lưu session/result theo allowlist hiện có.
- Không thêm Cloud Run cho task này. Cloud Run chỉ là lựa chọn triển khai sau nếu cần backend public độc lập.

### Phạm vi được phép sửa

- `src/services/chatOrchestrator.js`
- `src/data/safeFallbackResponseBank.json` chỉ khi cần bổ sung nội dung an toàn
- `.env.example`
- `src/react-app/components/ChatShell.jsx` và thông báo fallback nếu cần
- `tests/run-tests.js`, test quota/fallback và tài liệu QA/status

### Yêu cầu kỹ thuật cần đánh giá

1. Giảm mặc định `MAX_CHAT_TURNS` từ 8 xuống mức MVP hợp lý, ưu tiên 4 hoặc 5 lượt; không giảm xuống 1-2 nếu chưa chứng minh đủ cơ hội luyện.
2. Giữ giới hạn mỗi tin nhắn và không gửi transcript dài không cần thiết. Nếu rút gọn context, vẫn phải giữ scenario, difficulty, red flags đã gặp và trạng thái phiên.
3. Không gọi Gemini thêm để tạo feedback sau khi phiên đã hoàn thành; dùng scoring deterministic và feedback đã có.
4. Khi nhận HTTP 429, timeout hoặc lỗi Gemini, chuyển ngay sang fallback an toàn, giữ `provider: "safe_fallback"` và `fallbackReason` thật.
5. Không ghi `provider: "gemini"` cho phản hồi fallback.
6. UI phải báo ngắn gọn “Đang dùng phản hồi mẫu an toàn” mà không làm người dùng tưởng Gemini live vẫn đang phản hồi.
7. Không thay đổi năm taxonomy, safety validator, scoring formula, workflow guard hoặc session capability.

### Acceptance criteria

1. Một phiên bình thường kết thúc trong tối đa 4-5 lượt theo cấu hình mặc định và vẫn hiển thị kết quả, bài học, dấu hiệu đã nhận diện/bỏ lỡ.
2. Test chứng minh không có request Gemini sau khi session đã completed hoặc bị dừng.
3. Test fallback cho 429/timeout/no key: phản hồi an toàn vẫn hiển thị, `provider` là `safe_fallback`, không có lỗi 500 cho người dùng.
4. Test xác nhận context gửi lên Gemini không chứa transcript dài hơn giới hạn đã chọn và không chứa secret/PII.
5. Không có dữ liệu chat/fallback response được thêm vào Firestore.
6. `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check` PASS.
7. Report phải ghi rõ trade-off: ít lượt hơn giúp giảm quota nhưng có thể giảm độ sâu luyện; không tuyên bố quota đã giải quyết hoàn toàn nếu chưa có số liệu trước/sau.

### Prompt cho Antigravity

> Làm duy nhất TASK-044. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Mục tiêu là giảm request/token Gemini trên mỗi buổi khi có nhiều người dùng mà vẫn đủ trải nghiệm MVP. Không yêu cầu người dùng nhập API key; không thêm Firebase Web SDK, Cloud Run, Firebase Auth hoặc Firestore fallback bank. Không lưu transcript/câu trả lời chat vào Firestore. Đánh giá và ưu tiên cấu hình mặc định `MAX_CHAT_TURNS=4` hoặc `5` thay vì 8, giữ context cần thiết gồm scenario, difficulty, red flags và trạng thái phiên; không gửi transcript dài không cần thiết. Giữ `safeFallbackResponseBank.json` ở mã nguồn. Với 429/timeout/no key, phản hồi phải có `provider: "safe_fallback"`, `fallbackReason` đúng và UI thông báo rõ đây là phản hồi mẫu an toàn; tuyệt đối không ghi Gemini live cho fallback. Không gọi Gemini sau khi session completed/stopped. Chỉ được sửa file trong phạm vi TASK-044; không đổi taxonomy, validator, scoring, workflow, capability hoặc security rules. Thêm test cho max turns, 429/timeout/no key, không gọi sau completed/stop, giới hạn context và không lưu chat vào Firestore. Chạy `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check`. Báo cáo diff ngắn, số lượt/request trước-sau nếu đo được, trade-off và mục còn CHƯA XÁC MINH ĐƯỢC. Không commit, không push.

## TASK-045 - Regression UAT Sau Tối Ưu Quota - ACCEPTED LOCAL

### Mục tiêu

Kiểm tra thực tế sau TASK-044 để chắc chắn giới hạn 5 lượt và context rút gọn không làm hỏng workflow MVP. Đây là task QA/evidence, không phải task thêm tính năng.

### Phạm vi và giới hạn

- Localhost hiện tại; Preview chỉ khi snapshot đã đồng bộ TASK-044.
- Desktop viewport và responsive mobile viewport.
- Luồng nhập tên -> dashboard -> tình huống -> consent -> chat -> dừng/hoàn thành -> kết quả -> lịch sử -> chia sẻ.
- Fallback khi Gemini 429/timeout/no key, Firestore persistence và session capability.
- Không sửa source/config/test/UI; không đổi `MAX_CHAT_TURNS`, taxonomy, scoring, safety, capability hoặc Firestore rules.
- Không chạy load test nhiều người dùng thật và không tạo API key mới.

### Acceptance criteria

1. Phiên mới chạy được từ đầu đến kết quả trong tối đa 5 lượt; kết quả có điểm, dấu hiệu và bài học.
2. Bấm Dừng khi đang tải không tạo tin nhắn đến muộn; request sau completed bị chặn.
3. Khi Gemini lỗi/quota, UI nói rõ phản hồi mẫu an toàn và response có `provider=safe_fallback`.
4. Dashboard, lịch sử, `#aisi-share/<sessionId>`, Web Share, sao chép liên kết, Facebook và lưu ảnh không bị regression; không còn nút Zalo.
5. Responsive mobile không có chữ tràn/chồng; không kết luận UAT điện thoại thật từ viewport giả lập.
6. Firestore/read-back và capability isolation chỉ ghi PASS khi có HTTP/log evidence thật.
7. Báo cáo tách PASS, FAIL và CHƯA XÁC MINH ĐƯỢC; không ghi “quota đã giải quyết” nếu không có đo lường production.

### Prompt cho Antigravity

> Làm duy nhất TASK-045, chỉ QA/evidence, không sửa code. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Kiểm thử bản sau TASK-044 tại localhost: chạy `npm.cmd test`, `npm.cmd run frontend:build`, `git diff --check`, sau đó mở app và chạy một session mới với tối đa 5 lượt. Kiểm tra dashboard, chọn tình huống, consent, chat, Dừng khi đang tải, hoàn thành, điểm/kết quả, lịch sử không có `undefined`, route `#aisi-share/<sessionId>`, thẻ chia sẻ, Web Share nếu trình duyệt hỗ trợ, sao chép liên kết, Facebook và lưu ảnh. Xác nhận không còn nút/URL/SDK Zalo. Kiểm tra responsive viewport 390x844 nhưng ghi rõ đó không phải UAT điện thoại vật lý. Kiểm tra fallback bằng môi trường không có key hoặc mô phỏng 429/timeout an toàn; phải ghi `provider=safe_fallback`, không gọi là Gemini live. Nếu có Firestore runtime, ghi HTTP/log evidence của ghi và đọc lại; không ghi secret, capability, transcript hoặc PII. Không chạy load test và không đốt quota bằng nhiều probe. Tạo `QA_REPORT_TASK_045.md`, lưu screenshot/evidence nếu có. Với mỗi mục ghi PASS chỉ khi quan sát trực tiếp, nếu không thì FAIL hoặc CHƯA XÁC MINH ĐƯỢC. Không sửa code, không commit, không push.

## TASK-046 - Thông Báo Chờ Ba Tầng Khi Gemini Phản Hồi Chậm - ACCEPTED LOCAL

### Mục tiêu

Bổ sung tầng thông báo chờ trung gian để người dùng không thấy giao diện im lặng khi Gemini phản hồi chậm. Giữ nguyên fallback và không làm tăng số request Gemini.

### Phạm vi

- `src/react-app/components/ChatShell.jsx`
- `tests/run-tests.js`
- QA report/status liên quan nếu cần

### Yêu cầu

1. Tầng 1 xuất hiện ngay khi gửi tin nhắn: trạng thái đang xử lý hiện rõ.
2. Tầng 2 dùng timer frontend khoảng 5-8 giây nếu chưa nhận chunk/kết quả: thông báo “Có thể đang có nhiều người luyện tập cùng lúc. Bạn vui lòng chờ trong giây lát.”
3. Tầng 3 giữ nguyên thông báo fallback hiện tại khi server thực sự trả 429/timeout/no key/lỗi.
4. Timer phải được hủy khi nhận chunk đầu tiên, nhận done/error, bấm Dừng, request abort hoặc component unmount.
5. Không hiển thị tầng 2 sau khi đã nhận phản hồi; không tạo nhiều timer cho một request; request mới phải reset trạng thái cũ.
6. Không đổi API, prompt, Gemini model, Firestore, scoring, safety, workflow hoặc giao diện ngoài thông báo chờ.

### Acceptance criteria

- Không có khoảng im lặng sau khi người dùng gửi tin nhắn.
- Tầng 2 không bị nhầm là fallback và không gắn `provider` giả.
- Tầng 3 vẫn hiển thị đúng `safe_fallback` và `fallbackReason`.
- Stop/abort không làm timer cũ hiện lên sau khi phiên kết thúc.
- Test/build/diff check PASS.

### Prompt cho Antigravity

> Làm duy nhất TASK-046. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Sửa chỉ `src/react-app/components/ChatShell.jsx`, `tests/run-tests.js` và QA/status nếu cần. Bổ sung đúng 3 tầng trạng thái khi gửi chat: tầng 1 hiển thị ngay; tầng 2 dùng một frontend timer khoảng 5-8 giây nếu chưa có chunk/kết quả, báo “Có thể đang có nhiều người luyện tập cùng lúc. Bạn vui lòng chờ trong giây lát.”; tầng 3 giữ nguyên fallback notice khi server trả 429/timeout/no key/lỗi. Hủy timer khi có chunk đầu tiên, done, error, abort, Stop hoặc unmount; reset timer đúng cho mỗi request, không tạo timer trùng hoặc hiển thị tầng 2 sau khi đã có phản hồi. Không đổi API, prompt, Gemini, Firestore, scoring, safety, workflow, session capability hoặc UI khác; không tăng số request. Thêm test/source assertion cho đủ 3 tầng và cleanup timer. Chạy `npm.cmd test`, `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`, `npm.cmd run frontend:build`, `git diff --check`. Báo cáo file/diff/test/evidence thật, không claim browser PASS nếu chưa quan sát. Không commit, không push.

## TASK-047 - Kiểm Tra Node.js Runtime Trong Google AI Studio - OPEN

### Mục tiêu

Xác minh bản import hiện tại trong Google AI Studio có chạy đúng full-stack Node.js server hay chỉ hiển thị static frontend. Đây là task QA/runtime evidence duy nhất; không sửa mã nguồn và không kiểm tra quota bằng cách spam request.

### Phạm vi bắt buộc

- Đọc `AGENTS.md`, `LOCAL_STATUS.md` và task này trước khi kiểm tra.
- Kiểm tra startup log, port/runtime, endpoint API và Preview bằng request/browser evidence thật.
- Phân biệt rõ lỗi source app, lỗi Node runtime/host, lỗi Gemini quota, lỗi Firestore/IAM và lỗi Google AI Studio.
- Không dùng localhost làm bằng chứng cho Google AI Studio.

### Acceptance criteria

1. Startup log chứng minh server Node đang chạy và lắng nghe `0.0.0.0:3000`, không chỉ có Vite/static preview.
2. `GET /api/runtime-status` trả HTTP 200 và xác nhận model `gemini-3.6-flash`; không ghi secret.
3. `GET /api/scenarios` trả HTTP 200 với danh sách kịch bản.
4. `POST /api/sessions` tạo session thành công hoặc ghi đúng lỗi runtime; không ghi raw capability.
5. Preview tạo được session, consent và chat/kết quả tối thiểu nếu quota cho phép.
6. Nếu Gemini lỗi, ghi đúng `provider=safe_fallback` và `fallbackReason`; không gọi fallback là Gemini live.
7. Firestore chỉ được kết luận PASS khi có log/read-back thật từ đúng project/database; nếu không, ghi `CHƯA XÁC MINH ĐƯỢC`.
8. Phân loại PASS/FAIL/CHƯA XÁC MINH ĐƯỢC theo evidence trực tiếp. Không lấy báo cáo tự khai làm bằng chứng.

### Cấm

- Không sửa source, `package.json`, `.env`, rules, UI, Gemini prompt/model, workflow, scoring, safety hoặc capability.
- Không import lại project, không đổi Cloud Run, không tạo API key mới, không nới lỏng Firestore rules.
- Không chạy load test hoặc gửi nhiều tin nhắn để thử quota.
- Không ghi API key, raw capability, capability hash, OTP, CCCD, mật khẩu, tài khoản, transcript hoặc PII vào report.
- Không commit/push.

### Prompt cho Antigravity

> Làm duy nhất TASK-047, chỉ QA/runtime evidence trên bản Google AI Studio đang mở. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Không sửa code/config/package/UI, không import lại project, không đổi model, không đổi Cloud Run, không tạo key mới, không nới lỏng Firestore rules, không chạy load test và không commit/push.
>
> Kiểm tra theo đúng thứ tự: (1) startup log có Node server chạy trên `0.0.0.0:3000`, chứng minh đây không chỉ là static frontend; (2) gọi thực tế `GET /api/runtime-status`, `GET /api/scenarios`, `POST /api/sessions` và ghi HTTP status + response shape an toàn; (3) trong Preview tạo session, consent, gửi tối đa một tin nhắn chat và mở kết quả nếu môi trường cho phép; (4) kiểm tra fallback. Nếu Gemini quota/lỗi, ghi chính xác `provider=safe_fallback` và `fallbackReason`, tuyệt đối không ghi Gemini live; không gửi thêm request để thử quota; (5) chỉ ghi Firestore PASS khi có log/read-back thật từ đúng project/database, nếu không ghi `CHƯA XÁC MINH ĐƯỢC`.
>
> Tạo `QA_REPORT_TASK_047.md` gồm: commit/import reference nếu nhìn thấy; startup evidence; từng endpoint với HTTP status; browser route; lỗi console chỉ liên quan app; trạng thái Gemini, Firestore và phân loại nguyên nhân. PASS chỉ khi quan sát trực tiếp; lỗi host/AI Studio phải tách khỏi lỗi source. Tuyệt đối không ghi API key, raw capability, capability hash, OTP, CCCD, mật khẩu, tài khoản, transcript hoặc PII. Bàn giao diff ngắn, lệnh đã chạy, evidence thật và mục còn lại; không sửa, không commit, không push.

## TASK-048 - Rút Ngắn Thời Gian Chờ Gemini Cho Demo - ACCEPTED LOCAL

### Mục tiêu

Giảm cảm giác app bị treo khi Gemini phản hồi chậm, nhưng vẫn giữ Gemini server-side, `safe_fallback`, safety, workflow và kiến trúc hiện tại.

### Phạm vi được phép sửa

- Cấu hình timeout Gemini và thông báo chờ frontend.
- Test liên quan timeout, timer cleanup và HTTP 429.
- QA report/status liên quan nếu cần.

### Yêu cầu bắt buộc

1. Thông báo chờ tầng 2 xuất hiện sau khoảng `4 giây`.
2. Gemini timeout ở `9000ms` (`GEMINI_TIMEOUT_MS=9000`).
3. HTTP 429 chuyển sang `provider: "safe_fallback"` ngay, không chờ đủ timeout.
4. Câu trả lời fallback vẫn lấy từ `safeFallbackResponseBank.json`.
5. Timer được hủy khi có chunk, done, error, abort, Stop và unmount.

### Cấm

- Không đổi model khỏi `gemini-3.6-flash`.
- Không thêm model phụ, không đổi prompt, safety validator, scoring, Firestore, workflow hoặc session capability.
- Không yêu cầu người dùng nhập API key.
- Không chạy nhiều request thật để thử quota.
- Không commit/push trước khi review.

### Acceptance criteria

1. UI báo chờ sau khoảng 4 giây nếu chưa có phản hồi.
2. Timeout 9 giây dẫn đến fallback an toàn, không lỗi 500 và không hiển thị Gemini live.
3. 429 được chuyển fallback ngay.
4. Không có timer cũ hiển thị sau khi request kết thúc hoặc người dùng bấm Dừng.
5. `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build` và `git diff --check` PASS.

### Prompt cho Antigravity

> Làm duy nhất TASK-048. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Mục tiêu: rút ngắn thời gian chờ Gemini cho demo. Chỉ sửa cấu hình timeout, thông báo chờ frontend, test và QA/status nếu cần. Đặt thông báo chờ tầng 2 khoảng 4 giây và `GEMINI_TIMEOUT_MS=9000`. Khi Gemini trả HTTP 429, chuyển ngay sang `provider: "safe_fallback"` với `fallbackReason` thật; không chờ đủ 9 giây. Câu trả lời fallback phải lấy từ `src/data/safeFallbackResponseBank.json`.
>
> Giữ nguyên `gemini-3.6-flash`, server-side API key, prompt, safety validator, scoring, Firestore, workflow, session capability và toàn bộ UI khác. Không thêm model phụ, không yêu cầu người dùng nhập key, không chạy load test hoặc nhiều request thật, không commit/push. Xác nhận timer được hủy khi có chunk, done, error, abort, Stop và unmount. Chạy `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check`. Báo cáo diff ngắn, giá trị timeout/timer thực tế, test output và các mục CHƯA XÁC MINH ĐƯỢC. Không tuyên bố Gemini live ổn định chỉ từ một lượt thử.

## TASK-049 - Sửa Notice Fallback Và Fallback Bank Khi Gemini Lỗi - OPEN

### Mục tiêu

Làm cho trạng thái lỗi/chờ trong chat rõ ràng theo từng lượt gửi: không giữ notice đỏ của lượt trước khi người dùng gửi tin nhắn mới, không tạo chuỗi xanh/đỏ/xanh gây hiểu nhầm là app bị lỗi, và luôn có câu trả lời an toàn nếu ngân hàng fallback thiếu dữ liệu.

### Phạm vi được phép sửa

- `src/react-app/components/ChatShell.jsx`
- `src/services/chatOrchestrator.js`
- `src/data/safeFallbackResponseBank.json` chỉ khi phát hiện entry rỗng/thiếu
- `tests/run-tests.js`
- QA/status report liên quan nếu cần

### Yêu cầu bắt buộc

1. Notice chờ tầng 2 chỉ là trạng thái tạm thời; khi có chunk, done, error, abort hoặc Stop phải biến mất.
2. Notice fallback tầng 3 phải gắn với lượt request hiện tại, không nối vô hạn vào danh sách notice cũ.
3. Khi bắt đầu lượt gửi mới, xóa notice tạm của lượt trước hoặc thay thế bằng trạng thái mới; không để người dùng thấy notice đỏ cũ xen giữa các tin nhắn xanh.
4. Nếu Gemini fallback vì 429/timeout/no key/lỗi, vẫn hiển thị đúng một notice minh bạch và một câu trả lời an toàn.
5. Rà soát đủ 10 scenario trong `safeFallbackResponseBank.json`: `clarify`, `delay` và `default` phải có nội dung không rỗng, an toàn, không OTP/CCCD/tài khoản/link/số điện thoại thật.
6. Nếu scenario không có entry hoặc entry bị thiếu trường, dùng câu fallback tổng quát an toàn có hướng dẫn người dùng thử lại sau; không để chat đứng, reply rỗng hoặc chỉ hiện notice chờ.
7. Không đổi model, không thêm model phụ, không tăng request Gemini và không thay đổi Firestore/safety/scoring/workflow.

### Acceptance criteria

1. Sau lỗi 429, UI hiển thị notice fallback đỏ cùng reply an toàn; ở lượt gửi tiếp theo notice cũ không còn nằm giữa các trạng thái mới.
2. Không xuất hiện chuỗi notice gây hiểu nhầm kiểu xanh → đỏ → xanh cho cùng một lượt chat.
3. Khi bank thiếu scenario/trường, API vẫn trả reply không rỗng, `provider: "safe_fallback"`, `fallbackReason` thật; UI hiển thị hướng dẫn thử lại sau.
4. Test chứng minh đủ 10 scenario có fallback hợp lệ và không có dữ liệu nhạy cảm.
5. Timer 4000ms vẫn cleanup đúng; không có notice chờ xuất hiện sau done/error/Stop/unmount.
6. `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check` PASS.

### Prompt cho Antigravity

> Làm duy nhất TASK-049. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Sửa lỗi UX fallback trong chat: `safetyNotices` không được nối vô hạn qua các lượt gửi; notice fallback đỏ của lượt trước phải được xóa/thay thế khi bắt đầu lượt mới để không tạo chuỗi xanh/đỏ/xanh gây hiểu nhầm. Notice chờ 4000ms là trạng thái tạm thời và phải biến mất khi có chunk, done, error, abort, Stop hoặc unmount. Notice fallback phải gắn với request hiện tại, hiển thị minh bạch đúng một lần.
>
> Rà soát `src/data/safeFallbackResponseBank.json` đủ 10 scenario; mỗi entry phải có `clarify`, `delay`, `default` không rỗng và an toàn. Nếu scenario hoặc trường fallback bị thiếu, `getSafeFallbackReply` phải trả một câu tổng quát an toàn có hướng dẫn người dùng thử lại sau, không trả reply rỗng và không để chat đứng; vẫn giữ `provider: "safe_fallback"` và `fallbackReason` thật. Không thêm model phụ, không đổi `gemini-3.6-flash`, không đổi prompt, Firestore, safety validator, scoring, workflow hoặc session capability; không tăng số request và không yêu cầu nhập API key.
>
> Chỉ sửa các file trong phạm vi TASK-049. Thêm test cho: notice cũ không tồn tại ở lượt mới; không có chuỗi notice gây hiểu nhầm; đủ 10 scenario có fallback hợp lệ; bank thiếu entry vẫn có reply an toàn; 429/timeout/no key giữ đúng provider/fallbackReason; timer cleanup. Chạy `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check`. Báo cáo diff ngắn, test output và screenshot nếu có. Không commit, không push, không tự sửa ngoài phạm vi.

## TASK-050 - Làm Sâu Fallback Theo Từng Tình Huống - OPEN

### Mục tiêu

Làm phản hồi dự phòng hữu ích hơn khi Gemini lỗi hoặc hết quota bằng cách mở rộng nội dung trong **10 tình huống hiện có**, không thêm tình huống mới và không gọi thêm AI.

### Thiết kế được duyệt

- Giữ nguyên 10 `scenarioId` và taxonomy hiện tại.
- Mỗi scenario có khoảng 8-10 phản hồi fallback an toàn, phân theo ý định đơn giản: hỏi làm rõ, trì hoãn, muốn xác minh kênh chính thức, từ chối cung cấp thông tin, từ chối chuyển tiền, nghi ngờ, muốn dừng và mặc định.
- Có thể dùng cấu trúc JSON rõ ràng như `clarify`, `delay`, `verify`, `refuse`, `suspicious`, `stop`, `default`; giữ tương thích với dữ liệu cũ nếu cần.
- Chọn phản hồi bằng rule/if-else nhẹ dựa trên nội dung người dùng; đây chỉ là fallback deterministic, không thay thế hội thoại Gemini và không được ghi là AI live.
- Nếu không khớp ý định hoặc entry bị thiếu, trả câu tổng quát an toàn: hệ thống đang bận, người dùng vui lòng thử lại sau; không để reply rỗng hoặc chat đứng.

### Cấm

- Không thêm scenario mới, actor mới hoặc decision tree cho Gemini.
- Không lưu fallback response/transcript vào Firestore.
- Không chứa OTP, CCCD, mật khẩu, tài khoản, số điện thoại, link thật, QR hoặc hướng dẫn lừa đảo có thể tái sử dụng.
- Không đổi model `gemini-3.6-flash`, safety, scoring, workflow, capability hoặc quota policy.
- Không commit/push.

### Acceptance criteria

1. Cả 10 scenario đều có bộ phản hồi fallback phong phú, không rỗng và vượt kiểm tra an toàn.
2. Các câu hỏi/ý định phổ biến được chọn đúng phản hồi phù hợp theo rule đơn giản.
3. Input không khớp vẫn trả câu fallback tổng quát có hướng dẫn thử lại sau.
4. Mọi fallback giữ `provider: "safe_fallback"` và `fallbackReason` thật.
5. Không phát sinh request Gemini, không lưu thêm dữ liệu Firestore.
6. `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check` PASS.

### Prompt cho Antigravity

> Làm duy nhất TASK-050. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước. Mục tiêu: mở rộng ngân hàng fallback trong 10 scenario hiện có để mỗi tình huống có khoảng 8-10 câu an toàn theo ý định người dùng: hỏi làm rõ, trì hoãn, xác minh kênh chính thức, từ chối thông tin, từ chối chuyển tiền, nghi ngờ, dừng và mặc định. Chỉ sửa `src/data/safeFallbackResponseBank.json`, logic chọn fallback trong `src/services/chatOrchestrator.js`, test và QA/status khi cần.
>
> Dùng rule/if-else nhẹ cho fallback deterministic; không biến thành decision tree của Gemini, không gọi thêm AI, không thêm scenario/actor/taxonomy. Nếu không khớp intent hoặc thiếu entry, trả câu tổng quát an toàn hướng dẫn người dùng thử lại sau, không reply rỗng hoặc đứng chat. Giữ `provider: "safe_fallback"`, `fallbackReason` thật và không lưu transcript/fallback response vào Firestore.
>
> Cấm OTP, CCCD, mật khẩu, tài khoản, số điện thoại, link thật, QR hoặc hướng dẫn lừa đảo có thể tái sử dụng. Giữ model `gemini-3.6-flash`, safety, scoring, workflow, capability và quota policy. Thêm test đủ 10 scenario, từng intent chính, input không khớp, dữ liệu thiếu, provider/fallbackReason và safety. Chạy `npm.cmd test`, HTTP smoke, `npm.cmd run frontend:build`, `git diff --check`. Báo cáo diff ngắn và test output. Không commit, không push.

## TASK-051 - QA Workflow Chuẩn Bị Demo Video - OPEN

### Mục tiêu

Chạy một workflow sạch trên local để chuẩn bị quay video demo, kiểm tra các màn hình và thao tác chính mà không sửa mã nguồn hoặc tiêu tốn quota không cần thiết.

### Prompt cho Antigravity

> Làm duy nhất TASK-051, chỉ QA/evidence để chuẩn bị quay video demo trên localhost. Không sửa code/config/UI, không commit và không push. Đọc `AGENTS.md`, `LOCAL_STATUS.md`, `TASKS.md` trước.
>
> Chạy trước: `npm.cmd test`, `npm.cmd run frontend:build`, `git diff --check`. Sau đó mở localhost và thực hiện đúng một workflow sạch: nhập tên → dashboard → chọn `fake_bank` hoặc scenario phù hợp → chọn độ khó → đồng ý → gửi tối đa 2 tin nhắn → dừng/hoàn thành → xem phân tích/điểm → dashboard/lịch sử → chia sẻ kết quả → xem thẻ chia sẻ → lưu ảnh hoặc sao chép liên kết. Không gửi nhiều request Gemini thật và không cố tạo 429.
>
> Kiểm tra trực tiếp: layout desktop/mobile responsive; chữ và nút không tràn; nút Dừng; điểm số; 5 nhóm taxonomy; thông báo fallback nếu môi trường đang fallback; `provider` không được ghi là Gemini nếu là mẫu an toàn; route chia sẻ không mở Chat/Remix Google AI Studio; ảnh tải xuống được nếu trình duyệt hỗ trợ.
>
> Nếu Gemini live phản hồi, ghi `provider: "gemini"` cho đúng lượt quan sát. Nếu fallback, ghi `provider: "safe_fallback"` và `fallbackReason` thật. Không kết luận quota nhiều người dùng từ một lượt chạy. Không ghi API key, capability, transcript, OTP, CCCD, mật khẩu, tài khoản hoặc PII.
>
> Tạo `QA_REPORT_TASK_051.md` gồm checklist từng bước, route, trạng thái PASS/FAIL/CHƯA XÁC MINH ĐƯỢC, lỗi console liên quan trực tiếp và đề xuất thứ tự màn hình để quay video 2-2 phút 30 giây. Đây là QA evidence, không phải task sửa lỗi. Nếu phát hiện lỗi, dừng và ghi rõ bước tái hiện, không tự sửa.
