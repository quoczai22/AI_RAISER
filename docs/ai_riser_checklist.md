# AI Riser Checklist

## Feasibility

- App starts with `node server.js`.
- Local URL opens at `http://localhost:3000`.
- Full demo path can finish in 3 minutes.
- Cloud Run deployment is supported by `Dockerfile`.

## AI Necessity / AI-Native

- Primary chat route calls Gemini server-side.
- Scenario templates define goals and red flags, not fixed branches.
- Fallback is clearly marked and not the main demo mode.

## Demo Quality

- Test 3 different participant messages at the same conversation point.
- Gemini replies should be contextually different.
- JSON output must pass validation.

## Innovation

- Dashboard is not only a quiz score.
- It highlights red flags from the conversation.
- It recommends what to practice next.

## Impact

- User can see which red flags were recognized or missed.
- Feedback uses non-judgmental language.
- Consent is explicit before simulation.
- Family share summary is optional and thin.

## Safety

- No real OTP, CCCD, card, account or password should be stored/displayed.
- AI output validator blocks URLs, phone numbers, real payment instructions and app install requests.
- Stop request ends the simulation.
