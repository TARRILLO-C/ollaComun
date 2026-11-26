@echo off
setlocal
title EcoFood - Instalador de App
echo ======================================================
echo    INSTALADOR DE ECOFOOD APP PARA WINDOWS
echo ======================================================
echo.
echo Instalando aplicacion en tu Escritorio...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $shortcutPath = Join-Path $desktop 'EcoFood.lnk'; $edge = '${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe'; if (-not (Test-Path $edge)) { $edge = '$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe' }; if (-not (Test-Path $edge)) { $edge = '$env:ProgramFiles\Google\Chrome\Application\chrome.exe' }; $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut($shortcutPath); $s.TargetPath = $edge; $s.Arguments = '--app=http://localhost:5173'; $s.Description = 'EcoFood - Red Solidaria'; $s.WorkingDirectory = $desktop; $s.Save(); Start-Process -FilePath $edge -ArgumentList '--app=http://localhost:5173'"

echo.
echo [EXITO] EcoFood se instalo en tu Escritorio y se abrio como app independiente.
exit /b 0
