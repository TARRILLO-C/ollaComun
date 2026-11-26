@echo off
setlocal
echo ======================================================
echo    INSTALADOR DE ECOFOOD APP PARA WINDOWS
echo ======================================================
echo.
echo Creando aplicacion independiente en tu Escritorio...

set "APP_URL=http://localhost:5173"
set "DESKTOP_PATH=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP_PATH%\EcoFood.lnk"

:: Buscar ejecutable de Microsoft Edge o Google Chrome
set "BROWSER_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)

if "%BROWSER_EXE%"=="" (
    echo [AVISO] Navegador no encontrado en ruta habitual. Creando enlace directo...
    echo [InternetShortcut] > "%DESKTOP_PATH%\EcoFood.url"
    echo URL=%APP_URL% >> "%DESKTOP_PATH%\EcoFood.url"
    start "" "%APP_URL%"
    exit /b 0
)

:: Crear acceso directo tipo App Standalone (sin barras de navegador, ventana propia de app)
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%BROWSER_EXE%'; $s.Arguments = '--app=%APP_URL%'; $s.Description = 'EcoFood - Red Solidaria de Rescate de Alimentos'; $s.Save()"

echo.
echo [EXITO] La aplicacion 'EcoFood' ha sido instalada en tu Escritorio.
echo Abriendo como aplicacion de ventana independiente...
start "" "%SHORTCUT%"
exit /b 0
