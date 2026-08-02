# AI Riser Current Context Check

Last checked: 2026-08-03

This note records the current public context used to keep the MVP aligned with AI Riser Vietnam 2026.

## Confirmed Context

- Program/event naming should use **AI Riser Vietnam 2026**, not "AI Raiser".
- Public GDG Cloud HCMC event page positions AI Riser Vietnam 2026 around **#BuildwithGoogleAI**, **#VibeCoding**, Gemini, Google AI Studio and Cloud Run.
- The Vibe Coding Day event is listed for **Sunday, August 9, 2026**, at Diamond Place, Ho Chi Minh City.
- Google AI Studio Build mode supports web apps with a default React frontend and a server-side Node.js runtime for secure API calls.
- Google AI Studio docs state Gemini API keys are kept server-side and are not included in client-side code.
- Google AI Studio can deploy apps to Cloud Run; if code is exported or hosted elsewhere, `GEMINI_API_KEY` must be configured in the hosting environment.

## Product Implications

- Keep Gemini as the only product AI model.
- Keep API key access server-side only.
- Keep the current dependency-light Node/static implementation as a local/Cloud Run-ready MVP, with documented porting path to Google AI Studio Build Mode if submission flow requires it.
- Do not expand the MVP just because AI Studio supports Firebase, Auth, Workspace integrations or Android apps.

## Sources

- GDG Cloud HCMC: AI Riser Vietnam 2026: Vibe Coding Day: <https://gdg.community.dev/events/details/google-gdg-cloud-hcmc-presents-ai-riser-vietnam-2026-vibe-coding-day/>
- Google AI for Developers: Build apps in Google AI Studio: <https://ai.google.dev/gemini-api/docs/aistudio-build-mode>
- Google Cloud Blog: The Starter Tier for Google AI Studio explained: <https://cloud.google.com/blog/topics/developers-practitioners/the-starter-tier-for-google-ai-studio-explained>
