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

  $scenarios = Invoke-RestMethod -Uri "$baseUrl/api/scenarios"
  if ($scenarios.scenarios.Count -ne 3) {
    throw "Expected 3 scenarios."
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
