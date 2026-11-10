@echo off
setlocal
cd /d "%~dp0"
title Ueberleben - Hochladen zu Firebase
echo ============================================
echo   Ueberleben! - Hochladen zu Firebase
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [FEHLER] Node.js fehlt. Bitte von https://nodejs.org installieren ^(LTS^), dann neu starten.
  goto ende
)

findstr /c:"DEIN_API_KEY" public\firebase-config.js >nul
if not errorlevel 1 (
  echo [FEHLER] Zuerst "node einrichten.js" ausfuehren.
  goto ende
)

echo [1/4] Firebase-Werkzeug pruefen ...
where firebase >nul 2>nul
if errorlevel 1 (
  echo       wird installiert ...
  call npm install -g firebase-tools
  if errorlevel 1 goto fehler
)

echo.
echo [2/4] Google-Anmeldung ...
set FIREBASE_PROJECT=
set GCLOUD_PROJECT=
node fix-projekt.js
call firebase use --clear >nul 2>nul
call firebase login --project azubi-survival
if errorlevel 1 goto fehler

echo.
echo [3/4] Server-Teil vorbereiten ...
node tools\version.js
if errorlevel 1 goto fehler
pushd functions
call npm install --no-audit --no-fund
set ERR=%errorlevel%
popd
if not "%ERR%"=="0" goto fehler

echo.
echo [4/4] Hochladen ...
call firebase deploy --project azubi-survival
if errorlevel 1 goto fehler

echo.
echo ============================================
echo   FERTIG! Dein Spiel: https://azubi-survival.web.app
echo ============================================
goto ende

:fehler
echo.
echo [FEHLER] Etwas ist schiefgelaufen - bitte Screenshot von diesem Fenster schicken.

:ende
echo.
pause
