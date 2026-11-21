param(
    [string]$ReleaseDir = 'src-tauri/target/release'
)

$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding $false

$files = @(Get-Item -LiteralPath (Join-Path $ReleaseDir 'ZAVZ.exe'))
$files += @(Get-ChildItem -Path (Join-Path $ReleaseDir 'bundle/nsis') -Filter '*.exe' | Sort-Object Name)
if ($files.Count -lt 2) {
    throw "ZAVZ.exe and the NSIS installer were not both found in $ReleaseDir"
}

$rows = foreach ($file in $files) {
    [pscustomobject]@{
        Name = $file.Name
        Size = [string]::Format([System.Globalization.CultureInfo]::InvariantCulture, '{0:N1} MB', $file.Length / 1MB)
        Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToLowerInvariant()
    }
}

$sums = ($rows | ForEach-Object { "$($_.Hash)  $($_.Name)" }) -join "`n"
[System.IO.File]::WriteAllText((Join-Path $ReleaseDir 'SHA256SUMS.txt'), "$sums`n", $utf8)

foreach ($row in $rows) {
    Write-Output "$($row.Hash)  $($row.Name)"
    Write-Output "::notice title=SHA-256 $($row.Name)::$($row.Hash)"
}

$lines = @(
    '### ZAVZ SHA-256'
    ''
    '| File | Size | SHA-256 |'
    '| --- | --- | --- |'
)
$lines += $rows | ForEach-Object { '| `{0}` | {1} | `{2}` |' -f $_.Name, $_.Size, $_.Hash }
$lines += @(
    ''
    'Check a download in PowerShell: `Get-FileHash .\ZAVZ.exe -Algorithm SHA256`'
)
$markdown = ($lines -join "`n") + "`n"
[System.IO.File]::WriteAllText((Join-Path $ReleaseDir 'SHA256SUMS.md'), $markdown, $utf8)

if ($env:GITHUB_STEP_SUMMARY) {
    [System.IO.File]::AppendAllText($env:GITHUB_STEP_SUMMARY, $markdown, $utf8)
}
