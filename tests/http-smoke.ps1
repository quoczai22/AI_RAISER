$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$process = Start-Process -FilePath node -ArgumentList "server.js" -WorkingDirectory $root -PassThru -WindowStyle Hidden

try {
  Start-Sleep -Seconds 2

  $scenarios = Invoke-RestMethod -Uri "http://localhost:3000/api/scenarios"
  if ($scenarios.scenarios.Count -ne 3) {
    throw "Expected 3 scenarios."
  }

  $session = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/sessions" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"scenarioId":"fake_bank","inviterConsent":true}'

  $sessionId = $session.session.id
  $active = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/sessions/$sessionId/participant-consent" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"participantConsent":true}'

  if ($active.session.status -ne "active") {
    throw "Expected active session."
  }

  $chat = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/sessions/$sessionId/messages" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"message":"I will call hotline to check."}'

  if (-not $chat.reply) {
    throw "Expected chat reply."
  }

  $dashboard = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/sessions/$sessionId/complete" `
    -Method Post

  if ($dashboard.totalCount -lt 1) {
    throw "Expected dashboard score data."
  }

  if ($dashboard.recognizedCount -lt 1) {
    throw "Expected at least one recognized red flag."
  }

  Write-Output "HTTP smoke test passed."
}
finally {
  Stop-Process -Id $process.Id -Force
}
