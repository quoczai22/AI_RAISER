# Architecture

## Tổng Quan

AI Scam Inoculation hiện là app Node backend + React/Vite frontend, có static fallback để giữ đường chạy cũ. Gemini chỉ được gọi server-side; client không giữ API key.

## Frontend React

- Root app: `src/react-app/App.jsx`.
- Entry/dashboard/accessibility shell: `src/react-app/components/`.
- Các màn chính đã migrate theo sprint: nhập tên, dashboard, chọn tình huống, consent, chat, result scorecard.
- Resource Hub/Hotline React là task đang mở: [[../../TASKS#TASK-015 - React Resource Hub / Hotline|TASK-015 - React Resource Hub / Hotline]].
- Build bằng `npm.cmd run frontend:build`; Node serve React build khi `USE_REACT=true`.

## Backend Node

- Server chính: `server.js`.
- API chịu trách nhiệm scenario/session/consent/chat/result/dashboard.
- Static fallback vẫn tồn tại để bảo toàn smoke test và demo path cũ.
- Runtime status không được lộ secret.

## Gemini

- Gemini client server-only: `src/services/geminiClient.server.js`.
- Model sản phẩm cuối: `gemini-3.6-flash`.
- Không dùng `temperature`, `top_p`, `top_k`.
- Chat phải dynamic theo history/state, không dùng decision tree cố định.
- Thiết kế prompt và guardrails: [[../../AIDesign]].

## Safety Validator

- Module: `src/services/safetyValidator.js`.
- Mask/chặn OTP-like, CCCD/CMND, số tài khoản, số thẻ, số điện thoại, mật khẩu, link thật.
- Validator chạy hai chiều: participant input và Gemini output.
- Unsafe model output phải bị block/retry/fallback trước khi hiển thị.

## Scoring Engine

- Module: `src/services/scoringEngine.js`.
- Score minh bạch theo công thức red flags recognized / total red flags.
- Feedback taxonomy chỉ gồm Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity.
- Không dùng Gemini judgment làm nguồn điểm cuối cùng.

## Session API

- Session service: `src/services/sessionService.js`.
- Dashboard aggregation: `src/services/dashboardService.js`.
- Chat orchestration: `src/services/chatOrchestrator.js`.
- Scenario seed: `src/data/scenarios.json`.
- API contract nền: [[../../TechnicalDesign#4 API / Server Actions]].

## Tài Liệu Kỹ Thuật

- [[../../TechnicalDesign]]
- [[../../AIDesign]]
- [[../../Testing]]
- [[../../README]]
