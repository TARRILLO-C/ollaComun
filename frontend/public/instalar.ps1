param(
    [string]$Url = "http://localhost:5173"
)

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "EcoFood.lnk"

# Detectar navegador
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
$shortcut.Save()

Write-Host "Acceso directo creado exitosamente en: $shortcutPath"

# Lanzar la app como ventana independiente
Start-Process -FilePath $edge -ArgumentList "--app=$Url"
