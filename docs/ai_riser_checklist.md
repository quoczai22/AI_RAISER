# AI Riser Checklist

## Feasibility

- App starts with `node server.js`.
- Local URL opens at `http://localhost:3000`.
- Full demo path can finish in 3 minutes.
- Submission target is a Google AI Studio project shared as Public.
- GitHub/Cloud Run are bonus/fallback delivery paths, not the primary submission artifact.
- Cloud Run deployment is supported by `Dockerfile` if a public backup URL is needed.
- Evidence: `node tests/run-tests.js`, `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`.
- Current event/tooling context: `docs/ai_riser_current_context.md`.
- Cloud Run blocker to clear only for the bonus path: current machine does not have `gcloud` in PATH; see `RiskReport.md`.

## Submission

- Create or port the app in Google AI Studio Build Mode.
- Confirm Gemini calls stay server-side and no API key is exposed in client code.
- Use Share -> Public for the AI Studio project link.
- Open the public link in a clean browser session before submitting.
- Keep GitHub repo and Cloud Run URL ready only as supporting evidence.

## AI Necessity / AI-Native

- Primary chat route calls Gemini server-side.
- Scenario templates define goals and red flags, not fixed branches.
- Fallback is clearly marked and not the main demo mode.
- Evidence: `tests/live-gemini-probe.ps1` and `docs/live_gemini_test_report.md`.
- No-go: final demo returns only `GEMINI_HTTP_429`.

## Demo Quality

- Test 3 different participant messages at the same conversation point.
- Gemini replies should be contextually different.
- JSON output must pass validation.
- Warm-up: `powershell -ExecutionPolicy Bypass -File tests/warmup.ps1 -BaseUrl "<demo-url>"`.

## Innovation

- Dashboard is not only a quiz score.
- It highlights red flags from the conversation.
- It recommends what to practice next.
- Feedback uses stable manipulation taxonomy: `authority`, `urgency + fear`, `social proof/reciprocity`, `scarcity`.

## Impact

- User can see which red flags were recognized or missed.
- Feedback uses non-judgmental language.
- Feedback teaches manipulation patterns, not memorized response scripts.
- Consent is explicit before simulation.
- Family share summary is optional and thin.

## Safety

- No real OTP, CCCD, card, account or password should be stored/displayed.
- AI output validator blocks URLs, phone numbers, real payment instructions and app install requests.
- Input masking covers OTP-like, CCCD-like, phone/card-like and password-like values.
- Stop request ends the simulation.
