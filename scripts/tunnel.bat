@echo off
setlocal enabledelayedexpansion
title 9Router Cloudflare Tunnel

:: ============================================================
:: TradingChat AI - Cloudflare Tunnel for 9Router (Port 20128)
:: Usage:
::   tunnel.bat          -> Start tunnel
::   tunnel.bat stop     -> Stop tunnel
::   tunnel.bat status   -> Show status & URL
:: ============================================================

set "CF_EXE=C:\Program Files (x86)\cloudflared\cloudflared.exe"
set "LOG_FILE=%TEMP%\cloudflared-9router.log"
set "PORT=20128"

:: Check cloudflared installed
if not exist "%CF_EXE%" (
    echo [ERROR] cloudflared.exe not found at:
    echo         %CF_EXE%
    echo.
    echo Install via: winget install --id Cloudflare.cloudflared -e
    pause
    exit /b 1
)

:: Handle arguments
if /i "%1"=="stop" goto :stop
if /i "%1"=="status" goto :status

:: ============================================================
:start
:: ============================================================
echo.
echo  ========================================
echo   TradingChat AI - Cloudflare Tunnel
echo  ========================================
echo.

:: Check if already running
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if not errorlevel 1 (
    echo  [INFO] Tunnel already running.
    goto :show_url
)

:: Clean old log
if exist "%LOG_FILE%" del /f /q "%LOG_FILE%"

:: Check 9router is alive first
echo  [1/3] Checking 9Router on port %PORT%...
curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/v1/models >"%TEMP%\status_check.txt" 2>nul
set /p STATUS_CODE=<"%TEMP%\status_check.txt"
del /f /q "%TEMP%\status_check.txt" 2>nul

if "%STATUS_CODE%"=="200" (
    echo       OK - 9Router responding on port %PORT%
) else (
    echo  [WARN] 9Router may not be running on port %PORT%
    echo         Continuing anyway... Start 9Router/Antigravity first if tunnel fails.
    echo.
)

:: Start cloudflared
echo  [2/3] Starting Cloudflare Tunnel...
start "" /B "%CF_EXE%" tunnel --url http://localhost:%PORT% 2>>"%LOG_FILE%"

:: Wait for public URL
echo  [3/3] Waiting for public URL
set "TUNNEL_URL="
set /a TRIES=0
:wait_loop
timeout /t 1 /nobreak >nul
set /a TRIES+=1
set "FOUND="
for /f "delims=" %%L in ('findstr /i "trycloudflare.com" "%LOG_FILE%" 2^>nul') do (
    echo %%L | findstr /i "https://" >nul
    if not errorlevel 1 (
        for /f "tokens=*" %%U in ('echo %%L') do set "RAW_LINE=%%U"
    )
)

:: Extract URL from raw line
if defined RAW_LINE (
    for %%W in (!RAW_LINE!) do (
        echo %%W | findstr /i "trycloudflare.com" >nul
        if not errorlevel 1 set "TUNNEL_URL=%%W"
    )
)

if defined TUNNEL_URL goto :tunnel_ready
if !TRIES! LSS 15 goto :wait_loop

echo.
echo  [ERROR] Could not obtain public URL after 15 seconds.
echo          Check log: %LOG_FILE%
echo.
pause
exit /b 1

:tunnel_ready
echo.
echo  ========================================
echo   TUNNEL CONNECTED!
echo  ========================================
echo.
echo   Public URL : !TUNNEL_URL!
echo   API Base   : !TUNNEL_URL!/v1
echo.
echo   Set in .env.local or Vercel env vars:
echo.
echo   OPENAI_BASE_URL=!TUNNEL_URL!/v1
echo   OPENAI_API_KEY=sk-783b5861d4435f6f-rm6sil-608be210
echo.
echo  ========================================
echo   Keep this window OPEN while using AI
echo   Close window or run: tunnel.bat stop
echo  ========================================
echo.

:: Save URL to file for reference
echo TUNNEL_URL=!TUNNEL_URL!>"%TEMP%\tunnel-url.txt"
echo API_BASE=!TUNNEL_URL!/v1>>"%TEMP%\tunnel-url.txt"

:: Keep window alive (show heartbeat)
:heartbeat
timeout /t 30 /nobreak >nul
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo  [WARN] Tunnel process stopped unexpectedly.
    echo         Restart with: tunnel.bat
    pause
    exit /b 1
)
echo  [%TIME%] Tunnel active - !TUNNEL_URL!
goto :heartbeat

:: ============================================================
:show_url
:: ============================================================
if exist "%TEMP%\tunnel-url.txt" (
    for /f "tokens=2 delims==" %%U in ('findstr "TUNNEL_URL" "%TEMP%\tunnel-url.txt"') do (
        echo.
        echo  Public URL : %%U
        echo  API Base   : %%U/v1
        echo.
    )
) else (
    echo  [INFO] URL not cached. Check log: %LOG_FILE%
)
goto :eof

:: ============================================================
:stop
:: ============================================================
echo.
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo  [INFO] Tunnel is not running.
) else (
    taskkill /F /IM cloudflared.exe >nul 2>&1
    echo  [OK] Tunnel stopped.
)
if exist "%TEMP%\tunnel-url.txt" del /f /q "%TEMP%\tunnel-url.txt"
echo.
goto :eof

:: ============================================================
:status
:: ============================================================
echo.
echo  ========================================
echo   Tunnel Status
echo  ========================================
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul
if errorlevel 1 (
    echo  Status : STOPPED
) else (
    echo  Status : RUNNING
    call :show_url
)
echo  ========================================
echo.
goto :eof
