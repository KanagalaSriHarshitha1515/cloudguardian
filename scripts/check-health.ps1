param(
  [string]$BackendUrl = "http://localhost:5000/health",
  [string]$FrontendUrl = "http://localhost:8080/"
)

$ErrorActionPreference = "Stop"

$backend = Invoke-WebRequest -Uri $BackendUrl -UseBasicParsing
$frontend = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing

if ($backend.StatusCode -ne 200 -or $frontend.StatusCode -ne 200) {
  throw "Health check failed: backend=$($backend.StatusCode), frontend=$($frontend.StatusCode)"
}

Write-Host "CloudGuardian health check passed: backend=$($backend.StatusCode), frontend=$($frontend.StatusCode)"
