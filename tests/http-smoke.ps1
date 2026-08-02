$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$port = Get-Random -Minimum 4100 -Maximum 4999
$baseUrl = "http://localhost:$port"
$process = Start-Process `
  -FilePath powershell `
  -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "`$env:PORT='$port'; node server.js" `
  -WorkingDirectory $root `
  -PassThru `
  -WindowStyle Hidden

try {
  Start-Sleep -Seconds 2

  $health = Invoke-RestMethod -Uri "$baseUrl/healthz"
  if ($health.ok -ne $true) {
    throw "Expected health check to pass."
  }

  $head = Invoke-WebRequest -Uri "$baseUrl/" -Method Head -UseBasicParsing
  if ($head.StatusCode -ne 200) {
    throw "Expected static HEAD request to pass."
  }

  if ($head.Headers["X-Content-Type-Options"] -ne "nosniff") {
    throw "Expected static security headers."
  }

  try {
    Invoke-WebRequest -Uri "$baseUrl/%2e%2e%2fserver.js" -Method Get -UseBasicParsing | Out-Null
    throw "Expected encoded path traversal to be blocked."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 404) {
      throw "Expected encoded path traversal to return 404."
    }
  }

  $scenarios = Invoke-RestMethod -Uri "$baseUrl/api/scenarios"
  if ($scenarios.scenarios.Count -ne 3) {
    throw "Expected 3 scenarios."
  }

  $scenarioResponse = Invoke-WebRequest -Uri "$baseUrl/api/scenarios" -UseBasicParsing
  if (-not $scenarioResponse.Headers["Content-Security-Policy"]) {
    throw "Expected API security headers."
  }

  try {
    Invoke-RestMethod `
      -Uri "$baseUrl/api/sessions" `
      -Method Post `
      -ContentType "application/json" `
      -Body ("{""payload"":""" + ("x" * 70000) + """}") | Out-Null
    throw "Expected large body to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 413) {
      throw "Expected large body to return 413."
    }
  }

  $session = Invoke-RestMethod `
    -Uri "$baseUrl/api/sessions" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"scenarioId":"fake_bank","difficulty":"medium","userName":"Co Lan"}'

  $sessionId = $session.session.id
  $active = Invoke-RestMethod `
    -Uri "$baseUrl/api/sessions/$sessionId/consent" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"consent":true}'

  if ($active.session.status -ne "active") {
    throw "Expected active session."
  }

  $chat = Invoke-RestMethod `
    -Uri "$baseUrl/api/sessions/$sessionId/messages" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"message":"I will call hotline to check."}'

  if (-not $chat.reply) {
    throw "Expected chat reply."
  }

  $messages = Invoke-RestMethod -Uri "$baseUrl/api/sessions/$sessionId/messages"
  if ($messages.messages.Count -lt 2) {
    throw "Expected stored chat transcript."
  }

  if (($messages.messages | Where-Object { $_.role -eq "participant" }).Count -gt 0) {
    throw "Expected participant role to be mapped to UI user role."
  }

  $dashboard = Invoke-RestMethod `
    -Uri "$baseUrl/api/sessions/$sessionId/complete" `
    -Method Post

  if ($dashboard.totalCount -lt 1) {
    throw "Expected dashboard score data."
  }

  if ($dashboard.recognizedCount -lt 1) {
    throw "Expected at least one recognized red flag."
  }

  if (-not $dashboard.shareSummary) {
    throw "Expected share summary."
  }

  Write-Output "HTTP smoke test passed."
}
finally {
  if ($process -and -not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }
}
