@echo off
setlocal EnableDelayedExpansion
title EcoFood - Instalador de App
color 0A

echo ====================================================================
echo                 ECOFOOD - RED SOLIDARIA DE ALIMENTOS
echo                      INSTALADOR PARA WINDOWS
echo ====================================================================
echo.
echo [1/3] Detectando escritorio y carpetas del sistema...

:: Ejecutar script PowerShell autocontenido en una sola llamada sin requerir otros archivos
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; " ^
    "$appData = [Environment]::GetFolderPath('LocalApplicationData'); " ^
    "$ecoDir = Join-Path $appData 'EcoFood'; " ^
    "if (-not (Test-Path $ecoDir)) { New-Item -ItemType Directory -Path $ecoDir -Force | Out-Null }; " ^
    "$icoPath = Join-Path $ecoDir 'ecofood.ico'; " ^
    "try { Invoke-WebRequest -Uri 'http://localhost:5173/ecofood.ico' -OutFile $icoPath -UseBasicParsing -TimeoutSec 3 } catch {}; " ^
    "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
    "$shortcutPath = Join-Path $desktop 'EcoFood.lnk'; " ^
    "$edge = \"${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe\"; " ^
    "if (-not (Test-Path $edge)) { $edge = \"$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe\" }; " ^
    "if (-not (Test-Path $edge)) { $edge = \"$env:ProgramFiles\Google\Chrome\Application\chrome.exe\" }; " ^
    "if (-not (Test-Path $edge)) { $edge = \"${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe\" }; " ^
    "$ws = New-Object -ComObject WScript.Shell; " ^
    "$s = $ws.CreateShortcut($shortcutPath); " ^
    "$s.TargetPath = $edge; " ^
    "$s.Arguments = '--app=http://localhost:5173'; " ^
    "$s.Description = 'EcoFood - Red Solidaria de Rescate de Alimentos'; " ^
    "$s.WorkingDirectory = $desktop; " ^
    "if (Test-Path $icoPath) { $s.IconLocation = \"$icoPath,0\" }; " ^
    "$s.Save(); " ^
    "Write-Host '[2/3] Acceso directo con icono oficial creado en el Escritorio.'; " ^
    "Write-Host '[3/3] Abriendo EcoFood en su propia ventana...'; " ^
    "Start-Process -FilePath $edge -ArgumentList '--app=http://localhost:5173';"

echo.
echo ====================================================================
echo  LISTO: EcoFood ha sido instalada exitosamente en tu Escritorio!
echo ====================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit /b 0
