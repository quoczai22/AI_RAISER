# Cloud Run Deployment Guide

## Prerequisites

- Google Cloud project.
- Billing enabled.
- `gcloud` CLI authenticated.
- Gemini API key from Google AI Studio.
- Secret Manager API enabled.

## Local Check

```bash
node tests/run-tests.js
powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

## Build and Deploy with gcloud

Set variables:

```bash
PROJECT_ID=your-project-id
REGION=asia-southeast1
SERVICE=ai-scam-inoculation
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.6-flash
```

Create or update the secret:

```bash
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --project $PROJECT_ID \
  --replication-policy=automatic \
  --data-file=-
```

If the secret already exists, add a new version:

```bash
echo -n "$GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
  --project $PROJECT_ID \
  --data-file=-
```

Deploy from source with Secret Manager:

```bash
gcloud run deploy $SERVICE \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=$GEMINI_MODEL,MAX_CHAT_TURNS=8,GEMINI_TIMEOUT_MS=9000 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

## Windows PowerShell Variant

```powershell
$PROJECT_ID="your-project-id"
$REGION="asia-southeast1"
$SERVICE="ai-scam-inoculation"
$GEMINI_API_KEY="your-key"
$GEMINI_MODEL="gemini-3.6-flash"

Set-Content -Path "$env:TEMP\gemini-key.txt" -Value $GEMINI_API_KEY -NoNewline
gcloud secrets create gemini-api-key `
  --project $PROJECT_ID `
  --replication-policy automatic `
  --data-file "$env:TEMP\gemini-key.txt"

gcloud run deploy $SERVICE `
  --source . `
  --project $PROJECT_ID `
  --region $REGION `
  --allow-unauthenticated `
  --set-env-vars "GEMINI_MODEL=$GEMINI_MODEL,MAX_CHAT_TURNS=8,GEMINI_TIMEOUT_MS=9000" `
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest"

Remove-Item -Path "$env:TEMP\gemini-key.txt" -Force
```

If the secret already exists, replace the create command with:

```powershell
Set-Content -Path "$env:TEMP\gemini-key.txt" -Value $GEMINI_API_KEY -NoNewline
gcloud secrets versions add gemini-api-key `
  --project $PROJECT_ID `
  --data-file "$env:TEMP\gemini-key.txt"

Remove-Item -Path "$env:TEMP\gemini-key.txt" -Force
```

## Post-Deploy Check

Open:

```text
https://SERVICE-xxxxx-REGION.a.run.app/healthz
```

Expected:

```json
{ "ok": true }
```

Then run the demo flow:

```text
Scenario -> Consent -> Gemini Chat -> Dashboard
```

Warm up before judging:

```powershell
powershell -ExecutionPolicy Bypass -File tests/warmup.ps1 -BaseUrl "https://SERVICE-xxxxx-REGION.a.run.app"
```

If quota is available and you want to verify the Gemini path too:

```powershell
powershell -ExecutionPolicy Bypass -File tests/warmup.ps1 -BaseUrl "https://SERVICE-xxxxx-REGION.a.run.app" -IncludeGemini
```

## Demo Risk Notes

- If Gemini API key is missing or Gemini times out, UI will show a fallback notice. This is acceptable for local development but not final AI Riser demo.
- In-memory sessions reset when Cloud Run instance restarts.
- Keep demo flow linear and avoid refreshing the page mid-session.
- Send a warm-up request 5-10 minutes before judging to reduce cold-start risk.
- Docker image runs as the non-root `node` user.
