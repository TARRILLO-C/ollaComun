param(
    [string]$Url = "http://localhost:5173"
)

$appData = [Environment]::GetFolderPath('LocalApplicationData')
$ecoDir = Join-Path $appData 'EcoFood'
if (-not (Test-Path $ecoDir)) {
    New-Item -ItemType Directory -Path $ecoDir -Force | Out-Null
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceIco = Join-Path $scriptDir "ecofood.ico"
$targetIco = Join-Path $ecoDir "ecofood.ico"

if (Test-Path $sourceIco) {
    Copy-Item $sourceIco $targetIco -Force
}

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "EcoFood.lnk"

# Detectar navegador Edge o Chrome
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) {
    $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
}
if (-not (Test-Path $edge)) {
    $edge = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $edge)) {
    $edge = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
}

$ws = New-Object -ComObject WScript.Shell
$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $edge
$shortcut.Arguments = "--app=$Url"
$shortcut.Description = "EcoFood - Red Solidaria de Rescate de Alimentos"
$shortcut.WorkingDirectory = $desktop

if (Test-Path $targetIco) {
    $shortcut.IconLocation = "$targetIco,0"
}

$shortcut.Save()

Write-Host "Acceso directo con icono oficial creado en: $shortcutPath"
