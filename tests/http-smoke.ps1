$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$port = Get-Random -Minimum 20000 -Maximum 29999
$baseUrl = "http://localhost:$port"

function Get-HeaderValue {
  param(
    [Parameter(Mandatory = $true)]$Headers,
    [Parameter(Mandatory = $true)][string]$Name
  )

  foreach ($key in $Headers.Keys) {
    if ([string]::Equals($key, $Name, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $Headers[$key]
    }
  }
  return $null
}

function Wait-ForHealth {
  for ($attempt = 1; $attempt -le 10; $attempt++) {
    try {
      $health = Invoke-RestMethod -Uri "$baseUrl/healthz"
      if ($health.ok -eq $true) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  throw "Expected health check to pass."
}

$process = Start-Process `
  -FilePath powershell `
  -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "`$env:PORT='$port'; node server.js" `
  -WorkingDirectory $root `
  -PassThru `
  -WindowStyle Hidden

try {
  Wait-ForHealth

  try {
    Invoke-WebRequest -Uri "$baseUrl/healthz" -Method Post -UseBasicParsing | Out-Null
    throw "Expected wrong health method to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 405) {
      throw "Expected wrong health method to return 405."
    }
    if ((Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Allow") -ne "GET, HEAD") {
      throw "Expected health 405 to include Allow header."
    }
  }

  $head = Invoke-WebRequest -Uri "$baseUrl/" -Method Head -UseBasicParsing
  if ($head.StatusCode -ne 200) {
    throw "Expected static HEAD request to pass."
  }

  if ((Get-HeaderValue -Headers $head.Headers -Name "X-Content-Type-Options") -ne "nosniff") {
    throw "Expected static security headers."
  }

  if ((Get-HeaderValue -Headers $head.Headers -Name "Cache-Control") -ne "no-store") {
    throw "Expected static cache-control header."
  }

  $permissionsPolicy = Get-HeaderValue -Headers $head.Headers -Name "Permissions-Policy"
  if (-not $permissionsPolicy -or $permissionsPolicy -notmatch "camera=\(\)") {
    throw "Expected static permissions policy header."
  }

  try {
    Invoke-WebRequest -Uri "$baseUrl/" -Method Post -UseBasicParsing | Out-Null
    throw "Expected wrong static method to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 405) {
      throw "Expected wrong static method to return 405."
    }
    if ((Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Allow") -ne "GET, HEAD") {
      throw "Expected static 405 to include Allow header."
    }
  }

  try {
    Invoke-WebRequest -Uri "$baseUrl/%2e%2e%2fserver.js" -Method Get -UseBasicParsing | Out-Null
    throw "Expected encoded path traversal to be blocked."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 404) {
      throw "Expected encoded path traversal to return 404."
    }
    if (-not (Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Content-Security-Policy")) {
      throw "Expected 404 to include security headers."
    }
    if ((Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Cache-Control") -ne "no-store") {
      throw "Expected 404 to include cache-control header."
    }
  }

  try {
    Invoke-WebRequest -Uri "$baseUrl/%E0%A4%A" -Method Get -UseBasicParsing | Out-Null
    throw "Expected malformed encoded path to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 400) {
      throw "Expected malformed encoded path to return 400."
    }
  }

  $scenarios = Invoke-RestMethod -Uri "$baseUrl/api/scenarios"
  if ($scenarios.scenarios.Count -ne 3) {
    throw "Expected 3 scenarios."
  }

  $scenarioResponse = Invoke-WebRequest -Uri "$baseUrl/api/scenarios" -UseBasicParsing
  if (-not (Get-HeaderValue -Headers $scenarioResponse.Headers -Name "Content-Security-Policy")) {
    throw "Expected API security headers."
  }

  $runtimeResponse = Invoke-WebRequest -Uri "$baseUrl/api/runtime-status" -UseBasicParsing
  $runtime = $runtimeResponse.Content | ConvertFrom-Json
  if ($runtime.geminiModel -ne "gemini-3.6-flash") {
    throw "Expected runtime status to include default Gemini model."
  }

  if ($runtime.maxSessions -ne 200) {
    throw "Expected runtime status to include default max sessions."
  }

  if ($runtimeResponse.Content -match "GEMINI_API_KEY") {
    throw "Runtime status must not expose secret names or values."
  }

  try {
    Invoke-WebRequest -Uri "$baseUrl/api/sessions" -Method Get -UseBasicParsing | Out-Null
    throw "Expected wrong API method to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 405) {
      throw "Expected wrong API method to return 405."
    }
    if ((Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Allow") -ne "POST") {
      throw "Expected API 405 to include Allow header."
    }
    if (-not (Get-HeaderValue -Headers $_.Exception.Response.Headers -Name "Content-Security-Policy")) {
      throw "Expected 405 to include security headers."
    }
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

  try {
    Invoke-WebRequest -Uri "$baseUrl/api/sessions/$sessionId/dashboard" -Method Get -UseBasicParsing | Out-Null
    throw "Expected dashboard before consent to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 403) {
      throw "Expected dashboard before consent to return 403."
    }
  }

  $active = Invoke-RestMethod `
    -Uri "$baseUrl/api/sessions/$sessionId/consent" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"consent":true}'

  if ($active.session.status -ne "active") {
    throw "Expected active session."
  }

  try {
    Invoke-WebRequest -Uri "$baseUrl/api/sessions/$sessionId/dashboard" -Method Get -UseBasicParsing | Out-Null
    throw "Expected active dashboard access before completion to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 409) {
      throw "Expected active dashboard access before completion to return 409."
    }
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

  try {
    Invoke-WebRequest `
      -Uri "$baseUrl/api/sessions/$sessionId/consent" `
      -Method Post `
      -ContentType "application/json" `
      -Body '{"consent":true}' `
      -UseBasicParsing | Out-Null
    throw "Expected completed session consent to be rejected."
  }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 409) {
      throw "Expected completed session consent to return 409."
    }
  }

  Write-Output "HTTP smoke test passed."
}
finally {
  if ($process -and -not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }
}
