@echo off
setlocal
title EcoFood - Instalador de App
echo ======================================================
echo    INSTALADOR DE ECOFOOD APP PARA WINDOWS
echo ======================================================
echo.
echo Configurando e instalando EcoFood con icono oficial...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"

echo.
echo [EXITO] EcoFood se instalo en tu Escritorio con el logo oficial.
exit /b 0
