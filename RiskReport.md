# Risk Report - AI Scam Inoculation

Updated: 2026-08-03

## Summary

Current MVP is runnable locally and has safe fallback, but final AI Riser demo depends on a stable Gemini quota path. The most important live risk observed during testing is `GEMINI_HTTP_429` from the free-tier Gemini API limit.

## Active Risks

| Risk | Severity | Evidence | Impact | Mitigation | Status |
|---|---|---|---|---|---|
| Gemini free-tier quota/rate limit | High | `tests/live-gemini-probe.ps1` returned `fallbackReason = GEMINI_HTTP_429` after repeated live tests | Dynamic AI demo may fall back instead of showing Gemini replies | Use a billing-enabled Google Cloud/AI Studio project, avoid repeated probe runs, use `-DelaySeconds 10`, warm up once before judging | Open |
| Gemini latency/cold start | Medium | Earlier fake police test sometimes timed out before increasing timeout | Chat can feel stalled during judging | `GEMINI_TIMEOUT_MS=45000` default, use `90000` for rehearsal, visible loading state added, warm-up 5-10 minutes before demo | Mitigated |
| In-memory session storage | Medium | Sessions reset when server restarts or Cloud Run instance restarts | Refresh/restart loses current training session | Keep 3-minute demo linear; Firestore optional only if persistence becomes required | Accepted for MVP |
| AI Studio porting gap | Medium | Repo is Node/static; AI Studio may generate React/full-stack structure | Submission environment may need manual port | Keep module boundaries documented in `docs/google_ai_studio_porting.md`; preserve `chatOrchestrator`, `geminiClient.server`, `safetyValidator`, `scoringEngine` | Open |
| Local machine cannot deploy with `gcloud` yet | Medium | `gcloud` command is not recognized in current PowerShell PATH | Cloud Run deploy cannot be completed from this workspace until SDK/auth/project are available | Install Google Cloud CLI or deploy through Google AI Studio/Cloud console; then follow `docs/cloud_run_deploy.md` | Open |
| Over-realistic scam output | High | Product intentionally simulates scam-like social engineering | Unsafe links, phone numbers, CCCD, payment or OTP requests could be shown | System prompt, structured JSON, output validator, one repair retry, fallback, CCCD/OTP/link/phone/account blocking tests | Mitigated |

## Demo Go/No-Go Checklist

Run before presenting:

```powershell
node tests/run-tests.js
powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1
powershell -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1 -DelaySeconds 10
```

Go criteria:

- Main fake bank probe returns `provider = gemini` for at least two of three same-state inputs.
- No reply contains real URL, phone number, bank account, CCCD, card number, OTP or app-install instruction.
- Dashboard recommendations show manipulation patterns such as `authority`, `urgency + fear`, `social proof/reciprocity`, not scripted answers.

No-go criteria:

- Live probe returns only `GEMINI_HTTP_429`.
- Gemini key is missing in the deployed environment.
- Cloud Run/AI Studio app cannot complete scenario -> chat -> dashboard in under 3 minutes.
