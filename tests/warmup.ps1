param(
  [string]$BaseUrl = "http://localhost:3000",
  [switch]$IncludeGemini
)

$ErrorActionPreference = "Stop"
$base = $BaseUrl.TrimEnd("/")

function Invoke-Json {
  param(
    [Parameter(Mandatory = $true)][string]$Uri,
    [string]$Method = "GET",
    [object]$Body = $null
  )

  $params = @{
    Uri = $Uri
    Method = $Method
    ContentType = "application/json"
  }
  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 8 -Compress)
  }
  Invoke-RestMethod @params
}

$health = Invoke-Json -Uri "$base/healthz"
$scenarios = Invoke-Json -Uri "$base/api/scenarios"
$homeResponse = Invoke-WebRequest -Uri "$base/" -Method Head -UseBasicParsing

$result = [ordered]@{
  baseUrl = $base
  health = $health.ok
  scenarioCount = $scenarios.scenarios.Count
  homeStatus = $homeResponse.StatusCode
  geminiProvider = ""
  fallbackReason = ""
  completedAt = (Get-Date).ToString("s")
}

if ($IncludeGemini) {
  $session = Invoke-Json `
    -Uri "$base/api/sessions" `
    -Method "POST" `
    -Body @{ scenarioId = "fake_bank"; difficulty = "easy"; userName = "Warmup" }

  $sessionId = $session.session.id
  Invoke-Json `
    -Uri "$base/api/sessions/$sessionId/consent" `
    -Method "POST" `
    -Body @{ consent = $true } | Out-Null

  $chat = Invoke-Json `
    -Uri "$base/api/sessions/$sessionId/messages" `
    -Method "POST" `
    -Body @{ message = "Bạn có đúng là ngân hàng không?" }

  $result.geminiProvider = $chat.safety.provider
  $result.fallbackReason = $chat.safety.fallbackReason
}

$result | ConvertTo-Json -Depth 8
