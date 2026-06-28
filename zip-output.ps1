$src = "$PSScriptRoot\.output"
$dst = "$PSScriptRoot\output.zip"
$serverModules = "$src\server\node_modules"
$projectModules = "$PSScriptRoot\node_modules"

# STEP 1: Verify nitro.mjs is complete (anti-OOM truncation)
$nitroFile = "$src\server\chunks\_\nitro.mjs"
if (-not (Test-Path $nitroFile)) {
    Write-Error "ERROR: nitro.mjs tidak ditemukan. Jalankan npm run build dulu!"
    exit 1
}
$nitroSize = (Get-Item $nitroFile).Length
if ($nitroSize -lt 150000) {
    Write-Error "ERROR: nitro.mjs terlalu kecil ($nitroSize bytes). Build belum selesai, jalankan npm run build ulang!"
    exit 1
}
Write-Host "OK: nitro.mjs = $nitroSize bytes"

# STEP 2: Fix package.json
$pkgJson = "$src\server\package.json"
[System.IO.File]::WriteAllText($pkgJson, '{"type":"module"}')
Write-Host "OK: package.json fixed"

# STEP 3: Copy mysql2 deps
if (-not (Test-Path $serverModules)) {
    New-Item -ItemType Directory -Path $serverModules | Out-Null
}

$packages = @(
    'mysql2',
    'denque',
    'generate-function',
    'iconv-lite',
    'safer-buffer',
    'long',
    'lru-cache',
    'named-placeholders',
    'seq-queue',
    'sqlstring'
)

foreach ($pkg in $packages) {
    $srcPkg = "$projectModules\$pkg"
    $dstPkg = "$serverModules\$pkg"
    if (Test-Path $srcPkg) {
        if (Test-Path $dstPkg) { Remove-Item $dstPkg -Recurse -Force }
        Copy-Item -Path $srcPkg -Destination $dstPkg -Recurse -Force
        Write-Host "Copied: $pkg"
    } else {
        Write-Host "WARNING: $pkg tidak ditemukan"
    }
}

# STEP 4: Create zip with UNIX permissions (fixes cPanel extract Permission denied / 503)
if (Test-Path $dst) { Remove-Item $dst -Force }

$pyCode = @'
import zipfile, os, stat, sys
src = sys.argv[1]
out = sys.argv[2]
base = os.path.dirname(src)  # parent dir, so arcnames start with ".output/"
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(src):
        for d in dirs:
            p = os.path.join(root, d)
            arc = os.path.relpath(p, base).replace(os.sep, '/') + '/'
            zi = zipfile.ZipInfo(arc)
            zi.create_system = 3                       # 3 = Unix
            zi.external_attr = (stat.S_IFDIR | 0o755) << 16
            zf.writestr(zi, b'')
        for f in files:
            p = os.path.join(root, f)
            arc = os.path.relpath(p, base).replace(os.sep, '/')
            zi = zipfile.ZipInfo(arc)
            zi.create_system = 3                       # 3 = Unix
            zi.external_attr = (stat.S_IFREG | 0o644) << 16
            with open(p, 'rb') as fh:
                zf.writestr(zi, fh.read())
print("OK: zip dibuat dengan Unix permission ->", out)
'@

$pyFile = "$PSScriptRoot\_zip_unix.py"
[System.IO.File]::WriteAllText($pyFile, $pyCode)

$python = $null
foreach ($cmd in @('python', 'py', 'python3')) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) { $python = $cmd; break }
}

if ($python) {
    & $python $pyFile $src $dst
    Remove-Item $pyFile -Force
    Write-Host "Done (UNIX perms, no chmod needed): $dst"
} else {
    Remove-Item $pyFile -Force
    Write-Warning "Python tidak ditemukan -> pakai fallback Compress-Archive."
    Write-Warning "WAJIB jalankan di server: chmod -R 755 .output  (setelah extract)"
    Compress-Archive -Path $src -DestinationPath $dst -CompressionLevel Optimal
    Write-Host "Done (fallback Windows zip): $dst"
}
