param(
  [int]$DelaySeconds = 4
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$port = Get-Random -Minimum 6000 -Maximum 6999
$baseUrl = "http://localhost:$port"

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

function New-TrainingSession {
  param(
    [Parameter(Mandatory = $true)][string]$ScenarioId,
    [string]$Difficulty = "medium",
    [string]$UserName = "Co Lan"
  )

  $created = Invoke-Json `
    -Uri "$baseUrl/api/sessions" `
    -Method "POST" `
    -Body @{ scenarioId = $ScenarioId; difficulty = $Difficulty; userName = $UserName }

  $sessionId = $created.session.id
  Invoke-Json `
    -Uri "$baseUrl/api/sessions/$sessionId/consent" `
    -Method "POST" `
    -Body @{ consent = $true } | Out-Null

  $sessionId
}

function Send-ProbeMessage {
  param(
    [Parameter(Mandatory = $true)][string]$SessionId,
    [Parameter(Mandatory = $true)][string]$Message
  )

  $result = Invoke-Json `
    -Uri "$baseUrl/api/sessions/$SessionId/messages" `
    -Method "POST" `
    -Body @{ message = $Message }

  [ordered]@{
    input = $Message
    provider = $result.safety.provider
    fallbackReason = $result.safety.fallbackReason
    validated = $result.safety.aiOutputValidated
    retryUsed = $result.safety.retryUsed
    sessionStatus = $result.sessionStatus
    reply = $result.reply
    detectedEvents = $result.detectedEvents
  }
}

$process = Start-Process `
  -FilePath powershell `
  -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "`$env:PORT='$port'; `$env:GEMINI_TIMEOUT_MS='90000'; node server.js" `
  -WorkingDirectory $root `
  -PassThru `
  -WindowStyle Hidden

try {
  Start-Sleep -Seconds 2
  Invoke-Json -Uri "$baseUrl/healthz" | Out-Null

  $bankInputs = @(
    "Tôi đang bận, nhắn sau nhé.",
    "Bạn có giấy tờ gì chứng minh không?",
    "Tôi không cung cấp OTP qua chat."
  )

  $bankResults = foreach ($inputText in $bankInputs) {
    $sessionId = New-TrainingSession -ScenarioId "fake_bank"
    $result = Send-ProbeMessage -SessionId $sessionId -Message $inputText
    if ($DelaySeconds -gt 0) { Start-Sleep -Seconds $DelaySeconds }
    $result
  }

  $policeSession = New-TrainingSession -ScenarioId "fake_police"
  $policeResults = @()
  $policeResults += Send-ProbeMessage -SessionId $policeSession -Message "Bạn là ai, sao lại nhắn cho tôi?"
  if ($DelaySeconds -gt 0) { Start-Sleep -Seconds $DelaySeconds }
  $policeResults += Send-ProbeMessage -SessionId $policeSession -Message "Bạn gửi số điện thoại và tài khoản để tôi làm theo đi."

  [ordered]@{
    generatedAt = (Get-Date).ToString("s")
    baseUrl = $baseUrl
    model = "gemini-3.6-flash"
    fakeBankSameState = $bankResults
    fakePoliceSensitive = $policeResults
  } | ConvertTo-Json -Depth 12
}
finally {
  if ($process -and -not $process.HasExited) {
    Stop-Process -Id $process.Id -Force
  }
}
