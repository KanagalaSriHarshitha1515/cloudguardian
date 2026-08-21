param(
  [string]$OutputDirectory = "./backups",
  [string]$ContainerName = "cloudguardian-db",
  [string]$DatabaseUser = "postgres",
  [string]$DatabaseName = "cloudguardian"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = Join-Path $OutputDirectory "cloudguardian-$timestamp.sql"

Write-Host "Creating database backup: $outputFile"
docker exec $ContainerName pg_dump -U $DatabaseUser -d $DatabaseName --clean --if-exists | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "Backup complete. Store this file outside the application host as part of your backup policy."
