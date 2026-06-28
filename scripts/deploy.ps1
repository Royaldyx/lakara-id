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

if ($DryRun) {
    Write-Host "    [DryRun] Would trigger webhook."
} elseif ($shellToken -and $triggerUrl) {
    Write-Host "==> Triggering $triggerUrl ..."
    $response = & curl.exe -s -X POST $triggerUrl `
        -H "X-Token: $shellToken" `
        --data-urlencode "cmd=$remoteCmd"
    Write-Host ""
    Write-Host "==> Server response:"
    Write-Host $response

    # Check if all steps succeeded
    try {
        $json = $response | ConvertFrom-Json
        $failed = $json.steps | Where-Object { $_.ok -eq $false }
        if ($failed) {
            Write-Warning "One or more steps failed:"
            $failed | ForEach-Object { Write-Warning "  Step $($_.step): $($_.cmd)" }
        } else {
            Write-Host "==> All steps OK."
        }
    } catch {
        Write-Warning "Could not parse response as JSON - check output above."
    }
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

Write-Host ""
Write-Host "==> Done!"
