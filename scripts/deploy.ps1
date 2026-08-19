# Lakara - Windows deploy script
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
# Or:     right-click deploy.ps1 -> "Run with PowerShell"
#
# Requires: curl.exe (built into Windows 10+)
# Config:   fill in scripts\.deploy.env before running

param(
    [switch]$DryRun  # show what would happen without doing it
)

$ErrorActionPreference = "Stop"

# -- Paths ---------------------------------------------------------------------
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$EnvFile     = Join-Path $ScriptDir ".deploy.env"
$OutputDir   = Join-Path $ProjectRoot ".output"
$ZipName     = "deploy-lakara.zip"
$ZipPath     = Join-Path $env:TEMP $ZipName

# -- Load .deploy.env ----------------------------------------------------------
if (-not (Test-Path $EnvFile)) {
    Write-Error "Error: $EnvFile not found. Fill in your credentials first."
    exit 1
}

$cfg = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^#' -or $line -eq '') { return }
    if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        $cfg[$Matches[1]] = $Matches[2].Trim().Trim('"').Trim("'")
    }
}

$ftpHost     = $cfg["FTP_HOST"]
$ftpPort     = if ($cfg["FTP_PORT"])   { $cfg["FTP_PORT"]   } else { "21" }
$ftpUser     = $cfg["FTP_USER"]
$ftpPass     = $cfg["FTP_PASS"]
$ftpDir      = if ($cfg["FTP_DIR"])    { $cfg["FTP_DIR"]    } else { "/lakara" }
$remoteDir   = if ($cfg["REMOTE_DIR"]) { $cfg["REMOTE_DIR"] } else { "/home/lakaraid/lakara" }
$shellToken  = if ($cfg["SHELL_TOKEN"]) { $cfg["SHELL_TOKEN"] } else { "" }
$triggerUrl  = if ($cfg["TRIGGER_URL"]) { $cfg["TRIGGER_URL"] } else { "" }

if (-not $ftpHost -or -not $ftpUser -or -not $ftpPass) {
    Write-Error "Error: FTP_HOST, FTP_USER, FTP_PASS must be set in $EnvFile"
    exit 1
}

# -- Step 0: npm install + build -----------------------------------------------
if ($DryRun) {
    Write-Host "    [DryRun] Would run npm install + npm run build in $ProjectRoot"
} else {
    Write-Host "==> Running npm install..."
    Push-Location $ProjectRoot
    & npm install
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "npm install failed"; exit 1 }

    Write-Host "==> Running npm run build..."
    & npm run build
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "npm run build failed"; exit 1 }
    Pop-Location
    Write-Host "    Build OK."
}

# -- Check .output -------------------------------------------------------------
if (-not (Test-Path $OutputDir)) {
    Write-Error ".output not found after build - something went wrong."
    exit 1
}

$outputSizeBytes = (Get-ChildItem $OutputDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
$outputSizeMB    = [Math]::Round($outputSizeBytes / 1MB, 1)
Write-Host "==> .output size: $outputSizeMB MB"

# if ($outputSizeMB -lt 15) {
#     Write-Warning "WARNING: .output is only $outputSizeMB MB (expected ~20+ MB). Build may be incomplete."
#     $confirm = Read-Host "Continue anyway? (y/N)"
#     if ($confirm -notmatch '^[yY]$') { exit 1 }
# }

# -- Step 1: Zip .output contents (no wrapper folder) -------------------------
# ZipFile with includeBaseDirectory=$false zips the CONTENTS of .output
# so `unzip -d .output` on server produces .output/server/ .output/public/ etc.
Write-Host "==> Zipping .output contents..."
if ($DryRun) {
    Write-Host "    [DryRun] Would zip $OutputDir to $ZipPath"
} else {
    if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem

    # Build zip manually with forward-slash paths so Linux unzip works correctly.
    # ZipFile::CreateFromDirectory uses backslashes on Windows which breaks unzip on Linux.
    $zip     = [System.IO.Compression.ZipFile]::Open($ZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    $base    = [System.IO.Path]::GetFullPath($OutputDir).TrimEnd('\') + '\'
    try {
        Get-ChildItem $OutputDir -Recurse -File | ForEach-Object {
            $entry = $_.FullName.Substring($base.Length).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $zip, $_.FullName, $entry,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    } finally {
        $zip.Dispose()
    }
    $zipSizeMB = [Math]::Round((Get-Item $ZipPath).Length / 1MB, 1)
    Write-Host "    $zipSizeMB MB -> $ZipPath"
}

# -- Step 2: Upload zip via WinSCP --------------------------------------------
$ftpDir      = $ftpDir.TrimEnd("/")
$remoteDest  = "${ftpDir}/${ZipName}"
Write-Host "==> Uploading $ZipName to ${ftpHost}${remoteDest} ..."

# Find WinSCP.com
$winscpPaths = @(
    "C:\Program Files (x86)\WinSCP\WinSCP.com",
    "C:\Program Files\WinSCP\WinSCP.com",
    "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com"
)
$winscp = $winscpPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $winscp) {
    $wcCmd = Get-Command "WinSCP.com" -ErrorAction SilentlyContinue
    if ($wcCmd) { $winscp = $wcCmd.Source }
}
if (-not $winscp) {
    Write-Error "WinSCP.com not found. Install WinSCP or add it to PATH."
    exit 1
}
Write-Host "    Using: $winscp"

if ($DryRun) {
    Write-Host "    [DryRun] Would upload $ZipPath -> ${ftpHost}${remoteDest}"
} else {
    # URL-encode credentials — special chars like ; and @ in username/password
    # break the FTP URL if not encoded (@ splits at wrong position, ; truncates pass)
    $ftpUserEnc = [Uri]::EscapeDataString($ftpUser)
    $ftpPassEnc = [Uri]::EscapeDataString($ftpPass)

    # WinSCP script: open FTP, upload file, exit
    $winscpScript = @"
option batch abort
option confirm off
open ftp://${ftpUserEnc}:${ftpPassEnc}@${ftpHost}:${ftpPort}/ -passive=on -explicit=off
put "$ZipPath" "$remoteDest"
exit
"@
    $tmpScript = Join-Path $env:TEMP "winscp-deploy.txt"
    $winscpScript | Set-Content $tmpScript -Encoding UTF8

    & $winscp /script=$tmpScript /log="$env:TEMP\winscp-deploy.log"
    $exitCode = $LASTEXITCODE
    Remove-Item $tmpScript -Force -ErrorAction SilentlyContinue

    if ($exitCode -ne 0) {
        Write-Error "WinSCP upload failed (exit $exitCode). Check log: $env:TEMP\winscp-deploy.log"
        exit 1
    }
    Write-Host "    Upload OK."
}

# -- Step 3: Remote - delete old .output, extract new, restart -----------------
$remoteDir  = $remoteDir.TrimEnd("/")
$remoteCmd  = "cd $remoteDir"
$remoteCmd += " && rm -rf .output"
$remoteCmd += " && mkdir -p .output"
$remoteCmd += " && unzip -o -qq $ZipName -d .output"
$remoteCmd += " && rm -f $ZipName"
# $remoteCmd += " && /home/lakaraid/nodevenv/lakara/22/bin/npm install"
$remoteCmd += " && mkdir -p tmp"
$remoteCmd += " && touch tmp/restart.txt"
$remoteCmd += " && curl -s https://lakara.id -o /dev/null"
$remoteCmd += " && echo DEPLOY_OK"

Write-Host ""
Write-Host "==> Remote command:"
Write-Host "    $remoteCmd"
Write-Host ""

$deployConfirmed = $false

if ($DryRun) {
    Write-Host "    [DryRun] Would trigger webhook."
} elseif ($shellToken -and $triggerUrl) {
    Write-Host "==> Triggering $triggerUrl ..."

    # Capture HTTP status separately from body so a silent 4xx/5xx can't hide as success.
    $tmpBody = Join-Path $env:TEMP "deploy-trigger-response.json"
    $httpCode = & curl.exe -s -o $tmpBody -w "%{http_code}" -X POST $triggerUrl `
        -H "X-Token: $shellToken" `
        --data-urlencode "cmd=$remoteCmd"
    $curlExit = $LASTEXITCODE
    $response = if (Test-Path $tmpBody) { Get-Content $tmpBody -Raw } else { "" }
    Remove-Item $tmpBody -Force -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "==> HTTP status: $httpCode"
    Write-Host "==> Server response:"
    Write-Host $(if ($response) { $response } else { "(empty response)" })
    Write-Host ""

    # -- Hard validation. Any of these failing means the remote deploy did NOT
    #    happen, even if curl itself exited 0. Do not print a success message
    #    unless we can actually prove the remote commands ran.
    $failReasons = @()

    if ($curlExit -ne 0) { $failReasons += "curl exited with code $curlExit (network/connection error)" }
    if ($httpCode -notmatch '^2\d\d$') { $failReasons += "HTTP status was $httpCode (expected 2xx)" }
    if ([string]::IsNullOrWhiteSpace($response)) { $failReasons += "response body was empty" }

    $json = $null
    if ($failReasons.Count -eq 0) {
        try {
            $json = $response | ConvertFrom-Json -ErrorAction Stop
        } catch {
            $failReasons += "response is not valid JSON"
        }
    }

    if ($failReasons.Count -eq 0) {
        if (-not $json.steps -or @($json.steps).Count -eq 0) {
            $failReasons += "response JSON has no 'steps' array - nothing to confirm"
        } else {
            $failed = @($json.steps) | Where-Object { $_.ok -ne $true }
            if ($failed) {
                $failReasons += "one or more remote steps reported failure:"
                $failed | ForEach-Object { $failReasons += "    step $($_.step): $($_.cmd)" }
            }
        }
    }

    # Final proof: the remote command chain ends with `echo DEPLOY_OK`. If that
    # literal string isn't anywhere in the response, treat the deploy as unconfirmed
    # even if every individual step claimed ok:true.
    if ($failReasons.Count -eq 0 -and $response -notmatch 'DEPLOY_OK') {
        $failReasons += "response did not contain 'DEPLOY_OK' - remote command likely never completed"
    }

    if ($failReasons.Count -gt 0) {
        Write-Host ""
        Write-Error "==> DEPLOY NOT CONFIRMED. The zip was uploaded but the remote extract/restart could NOT be verified:"
        $failReasons | ForEach-Object { Write-Warning "  - $_" }
        Write-Host ""
        Write-Host "    Run this manually on the server (cPanel Terminal or SSH) instead:"
        Write-Host ""
        Write-Host "    $remoteCmd"
        Write-Host ""
        Write-Host "    Then verify with:"
        Write-Host "    curl -s https://lakara.id/ | grep -o '<title>[^<]*</title>'"
        exit 1
    }

    Write-Host "==> All steps OK. Remote deploy confirmed (DEPLOY_OK received)."
    $deployConfirmed = $true
} else {
    Write-Host "==> SHELL_TOKEN or TRIGGER_URL not configured."
    Write-Host "    Run this manually on the server (cPanel Terminal or SSH):"
    Write-Host ""
    Write-Host "    $remoteCmd"
}

# -- Cleanup -------------------------------------------------------------------
if (-not $DryRun -and (Test-Path $ZipPath)) {
    Remove-Item $ZipPath -Force
    Write-Host "==> Local zip removed."
}

# -- Step 4: Live sanity check --------------------------------------------------
# Belt-and-suspenders: even a "DEPLOY_OK" response doesn't prove the live site
# actually changed (e.g. app didn't reload). Fetch the homepage title so the
# person running this sees real evidence, not just a trusted log line.
if (-not $DryRun -and $deployConfirmed) {
    Write-Host ""
    Write-Host "==> Sanity check: fetching https://lakara.id/ ..."
    Start-Sleep -Seconds 2
    try {
        $html = & curl.exe -s "https://lakara.id/?_cachebust=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
        if ($html -match '<title>([^<]*)</title>') {
            Write-Host "    Live <title>: $($Matches[1])"
        } else {
            Write-Warning "    Could not find <title> in response - check the site manually."
        }
    } catch {
        Write-Warning "    Sanity check request failed: $_"
    }
    Write-Host "    If this still looks stale, the app may not have reloaded -"
    Write-Host "    restart it manually via cPanel Node.js App Manager (Stop, then Start)."
}

Write-Host ""
Write-Host "==> Done!"
