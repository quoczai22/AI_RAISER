# AI Scam Inoculation

MVP for **AI Riser Vietnam 2026** - anti-fraud / scam inoculation training for Vietnamese families.

The app lets a user self-train against scam simulations, requires explicit consent, runs a Gemini-driven chat session, shows an immunity score based on recognized red flags, and provides a lightweight family share summary.

## Stack

- Node.js server with no external dependencies
- Static web UI
- Gemini API server-side integration
- In-memory session storage for MVP demo
- Cloud Run-ready Dockerfile

## Run Locally

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/healthz
```

## Configure Gemini

Create `.env` from `.env.example` or set environment variables. The app loads `.env` automatically when you run `node server.js`.

```text
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.6-flash
MAX_CHAT_TURNS=8
GEMINI_TIMEOUT_MS=45000
PORT=3000
```

Without `GEMINI_API_KEY`, the app uses a safe fallback response so the demo flow still works. For final AI Riser demo, configure Gemini API so the chat is truly dynamic.

## Test

PowerShell may block `npm.ps1` depending on execution policy. Use Node directly:

```bash
node tests/run-tests.js
```

Expected:

```text
Implementation tests passed.
```

HTTP smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

Live Gemini probe for final demo rehearsal:

```powershell
powershell -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1
```

The live probe prints provider, fallback reason, validation status and verbatim replies for the same-state fake bank test plus the sensitive fake police test. It never prints `GEMINI_API_KEY`. Use `-DelaySeconds 10` if the free-tier quota is tight.

Cloud Run/local warm-up:

```powershell
powershell -ExecutionPolicy Bypass -File tests/warmup.ps1 -BaseUrl "http://localhost:3000"
```

## Demo Flow

1. Enter a display name.
2. Choose `Giả ngân hàng xác minh tài khoản`.
3. Pick a difficulty.
4. Confirm simulation consent.
5. Send 2-3 chat messages.
6. Stop or identify the scam.
7. Review immunity score and red flag dashboard.
8. Copy/share the family summary.

## AI-Native Requirement

The primary chat path uses Gemini through server-side `generateContent` with structured JSON output. The app must not replace this with a fixed decision tree. Deterministic logic is only used for consent, safety validation, stop conditions and scoring.

## Demo Risks

See `RiskReport.md` before final rehearsal, especially the `GEMINI_HTTP_429` quota/rate-limit risk.

## Safety

The app masks sensitive input and blocks unsafe AI output patterns such as URLs, phone numbers, card/account-like numbers, app install instructions and requests for OTP/password/CCCD.

Do not use real personal data in demo.
