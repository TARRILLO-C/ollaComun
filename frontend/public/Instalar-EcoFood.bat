@echo off
title EcoFood - Instalador de Acceso Directo
echo ======================================================
echo           ECOFOOD - RED DE RESCATE DE ALIMENTOS
echo ======================================================
echo.
echo Creando acceso directo en tu Escritorio...
set "TARGET_URL=http://localhost:5173"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\EcoFood.url"

echo [InternetShortcut] > "%SHORTCUT_PATH%"
echo URL=%TARGET_URL% >> "%SHORTCUT_PATH%"
echo IconIndex=0 >> "%SHORTCUT_PATH%"

echo.
echo [OK] Acceso directo 'EcoFood' creado exitosamente en tu Escritorio.
echo Abriendo aplicacion...
start "" "%TARGET_URL%"
exit
