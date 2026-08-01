# Cloud Run Deployment Guide

## Prerequisites

- Google Cloud project.
- Billing enabled.
- `gcloud` CLI authenticated.
- Gemini API key from Google AI Studio.

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

Deploy from source:

```bash
gcloud run deploy $SERVICE \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=$GEMINI_MODEL,MAX_CHAT_TURNS=8 \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
```

## Windows PowerShell Variant

```powershell
$PROJECT_ID="your-project-id"
$REGION="asia-southeast1"
$SERVICE="ai-scam-inoculation"
$GEMINI_API_KEY="your-key"
$GEMINI_MODEL="gemini-3.6-flash"

gcloud run deploy $SERVICE `
  --source . `
  --project $PROJECT_ID `
  --region $REGION `
  --allow-unauthenticated `
  --set-env-vars "GEMINI_MODEL=$GEMINI_MODEL,MAX_CHAT_TURNS=8,GEMINI_API_KEY=$GEMINI_API_KEY"
```

## Safer Secret Option

For a real deployment, prefer Secret Manager instead of passing the key directly:

```bash
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

gcloud run deploy $SERVICE \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=$GEMINI_MODEL,MAX_CHAT_TURNS=8 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
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

## Demo Risk Notes

- If Gemini API key is missing, UI will show fallback notice. This is acceptable for development but not final AI Riser demo.
- In-memory sessions reset when Cloud Run instance restarts.
- Keep demo flow linear and avoid refreshing the page mid-session.
