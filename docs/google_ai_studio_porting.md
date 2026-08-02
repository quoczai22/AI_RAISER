# Google AI Studio Porting Guide

## Purpose

This repo is intentionally dependency-light so it can run locally and on Cloud Run. If the AI Riser Vietnam 2026 submission/demo expects work inside **Google AI Studio Build Mode**, use this guide to port the same module boundaries.

## What To Keep

Keep these modules conceptually the same:

| Current File | AI Studio Equivalent |
|---|---|
| `src/data/scenarios.json` | Scenario seed/data file |
| `src/services/chatOrchestrator.js` | Server action or backend route |
| `src/services/geminiClient.server.js` | Server-only Gemini call |
| `src/services/safetyValidator.js` | Shared validator, called before/after Gemini |
| `src/services/scoringEngine.js` | Pure scoring function |
| `src/services/dashboardService.js` | Dashboard aggregation |
| `src/public/app.js` | UI flow/state to recreate as AI Studio React components if needed |
| `src/public/app.css` | App styles |
| `tests/live-gemini-probe.ps1` | Manual/live rehearsal checklist |
| `tests/warmup.ps1` | Cloud Run warm-up checklist |

## Porting Steps

1. Create a new web app in Google AI Studio Build Mode.
2. Recreate 5 UI screens:
   - Entry/personal dashboard.
   - Scenario + difficulty picker.
   - Simulation consent.
   - Chat.
   - Result dashboard + share summary.
3. Copy scenario data from `src/data/scenarios.json`.
4. Put Gemini calls in server-side code only.
5. Copy the prompt strategy from `AIDesign.md`.
6. Use the same JSON schema from `src/services/chatOrchestrator.js`.
7. Keep the safety validator before showing AI replies.
8. Preserve dashboard taxonomy labels and deterministic scoring formula.
9. Deploy/publish to Cloud Run from AI Studio.
10. Run the same pre-demo checks from `docs/demo_script.md`.

## Non-Negotiables

- Do not move `GEMINI_API_KEY` into client code.
- Do not turn chat into fixed if/else branches.
- Do not remove consent screens.
- Do not remove output validation.
- Do not show raw OTP/password/CCCD/card/account/phone input.
- Do not send `temperature`, `top_p`, or `top_k` for `gemini-3.6-flash`.
- Do not replace `GEMINI_HTTP_429`/timeout visibility with a silent fallback.

## Demo Recommendation

Use the local repo for fast development and fallback demo. Use the AI Studio version for final AI Riser submission. If Gemini quota is tight, avoid repeated live probes and run one warm-up shortly before judging.

Both versions should tell the same story:

```text
Entry -> Scenario + difficulty -> Consent -> Gemini dynamic chat -> Red flag scoring -> Shareable dashboard
```

## Submission Checklist

- Open the AI Studio project and verify the 5-screen flow works end to end.
- Verify the Gemini API key is configured through AI Studio/server-side secrets, not client code.
- Run one dynamic response check with 2-3 different participant messages.
- Use Share -> Public for the AI Studio project link.
- Open the public link in a clean/incognito browser before submitting.
- Keep the GitHub repo and Cloud Run URL as backup evidence only.
