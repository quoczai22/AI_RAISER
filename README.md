# AI Scam Inoculation

MVP for **AI Riser Vietnam 2026** - anti-fraud / scam inoculation training for Vietnamese families.

The app lets an inviter choose a scam simulation scenario, requires explicit consent, runs a chat-style training session, and shows an immunity score based on recognized red flags.

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

## Configure Gemini

Create `.env` from `.env.example` or set environment variables:

```text
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.6-flash
MAX_CHAT_TURNS=8
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

## Demo Flow

1. Choose `Giả ngân hàng xác minh tài khoản`.
2. Confirm inviter consent.
3. Open participant screen.
4. Confirm participant consent.
5. Send 2-3 chat messages.
6. Stop or identify the scam.
7. Review immunity score and red flag dashboard.

## AI-Native Requirement

The primary chat path uses Gemini through server-side `generateContent` with structured JSON output. The app must not replace this with a fixed decision tree. Deterministic logic is only used for consent, safety validation, stop conditions and scoring.

## Safety

The app masks sensitive input and blocks unsafe AI output patterns such as URLs, phone numbers, card/account-like numbers, app install instructions and requests for OTP/password/CCCD.

Do not use real personal data in demo.
