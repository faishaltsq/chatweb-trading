@echo off
setlocal enabledelayedexpansion
title TradingChat - 9Router Tunnel

:: ================================================
::  Cloudflare Tunnel untuk 9Router (port 20128)
::  Double-click untuk start, ketik 'stop' untuk stop
:: ================================================

set PORT=20128
set LOGFILE=%TEMP%\cf-tunnel.log

:: Cari cloudflared.exe di beberapa lokasi umum
set CF=
if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" set CF=C:\Program Files (x86)\cloudflared\cloudflared.exe
if exist "C:\Program Files\cloudflared\cloudflared.exe" set CF=C:\Program Files\cloudflared\cloudflared.exe
for /f "delims=" %%P in ('where cloudflared 2^>nul') do set CF=%%P

if "%CF%"=="" (
    echo.
    echo  [ERROR] cloudflared tidak ditemukan!
    echo.
    echo  Install dulu dengan perintah:
    echo    winget install --id Cloudflare.cloudflared -e
    echo.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo    TradingChat AI ^| Cloudflare Tunnel
echo  ============================================
echo    Port  : %PORT% ^(9Router / Antigravity^)
echo    Tool  : %CF%
echo  ============================================
echo.

:: Handle argumen stop
if /i "%1"=="stop" (
    echo  Menghentikan tunnel...
    taskkill /F /IM cloudflared.exe >nul 2>&1
    if exist "%TEMP%\tunnel-url.txt" del "%TEMP%\tunnel-url.txt"
    echo  [OK] Tunnel dihentikan.
    echo.
    pause
    exit /b 0
)

:: Cek apakah tunnel sudah jalan
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul 2>&1
if not errorlevel 1 (
    echo  [INFO] Tunnel sudah berjalan.
    echo.
    call :tampilkan_url
    echo.
    echo  Untuk stop: jalankan tunnel.bat stop
    echo.
    pause
    exit /b 0
)

:: Bersihkan log lama
if exist "%LOGFILE%" del /f /q "%LOGFILE%"

:: Cek 9Router aktif
echo  Mengecek 9Router di port %PORT%...
curl -s -o nul --max-time 3 http://localhost:%PORT%/v1/models
if errorlevel 1 (
    echo  [WARN] 9Router/Antigravity sepertinya belum aktif di port %PORT%
    echo         Pastikan Antigravity sudah berjalan terlebih dahulu!
    echo.
) else (
    echo  [OK] 9Router aktif.
    echo.
)

:: Jalankan cloudflared di background
echo  Memulai Cloudflare Tunnel...
start "" /b "%CF%" tunnel --url http://localhost:%PORT% 2>>"%LOGFILE%"

:: Tunggu URL muncul (max 20 detik)
echo  Menunggu URL publik
set URL=
set /a N=0
:cek
timeout /t 1 /nobreak >nul
set /a N+=1
if not exist "%LOGFILE%" goto lanjut
findstr /i "trycloudflare.com" "%LOGFILE%" >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%A in ('findstr /i "trycloudflare.com" "%LOGFILE%"') do (
        set LINE=%%A
        for %%W in (!LINE!) do (
            echo %%W | findstr /i "https://" >nul 2>&1
            if not errorlevel 1 (
                echo %%W | findstr /i "trycloudflare" >nul 2>&1
                if not errorlevel 1 set URL=%%W
            )
        )
    )
)
:lanjut
if defined URL goto sukses
if %N% lss 20 goto cek

echo.
echo  [ERROR] URL tidak muncul setelah 20 detik.
echo  Cek log: %LOGFILE%
echo.
pause
exit /b 1

:sukses
echo.
echo  ============================================
echo    TUNNEL BERHASIL TERHUBUNG!
echo  ============================================
echo.
echo    URL Publik : !URL!
echo    API Base   : !URL!/v1
echo.
echo  ============================================
echo    Set variabel berikut di Vercel / .env:
echo  ============================================
echo.
echo    OPENAI_BASE_URL=!URL!/v1
echo    OPENAI_API_KEY=sk-783b5861d4435f6f-rm6sil-608be210
echo.
echo  ============================================
echo    JANGAN TUTUP window ini selama pakai AI!
echo    Ketik 'stop' atau jalankan: tunnel.bat stop
echo  ============================================

:: Simpan URL ke file
(
    echo  URL Publik : !URL!
    echo  API Base   : !URL!/v1
    echo.
    echo  OPENAI_BASE_URL=!URL!/v1
) > "%TEMP%\tunnel-url.txt"

echo.
echo  Tekan ENTER untuk minimize, atau tutup window untuk stop tunnel.
echo.

:: Heartbeat loop
:loop
timeout /t 30 /nobreak >nul
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>nul | find /I "cloudflared.exe" >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [!] Tunnel berhenti tidak terduga!
    echo  Jalankan tunnel.bat lagi untuk restart.
    echo.
    pause
    exit /b 1
)
echo  [%TIME%]  Tunnel aktif ^| !URL!
goto loop

:: ============================================================
:tampilkan_url
:: Cari URL dari cache file dulu, lalu scan semua log
:: ============================================================
set FOUND_URL=

:: 1. Dari cache
if exist "%TEMP%\tunnel-url.txt" (
    for /f "tokens=*" %%L in ('findstr /i "https://" "%TEMP%\tunnel-url.txt" 2^>nul') do (
        for %%W in (%%L) do (
            echo %%W | findstr /i "trycloudflare" >nul 2>&1
            if not errorlevel 1 if not defined FOUND_URL set FOUND_URL=%%W
        )
    )
)

:: 2. Dari log files (coba semua nama yang mungkin)
if not defined FOUND_URL (
    for %%F in ("%TEMP%\cf-tunnel.log" "%TEMP%\cloudflared-9router.log" "%TEMP%\cloudflared.log") do (
        if exist %%F if not defined FOUND_URL (
            for /f "tokens=*" %%L in ('findstr /i "trycloudflare.com" %%F 2^>nul') do (
                for %%W in (%%L) do (
                    echo %%W | findstr /i "trycloudflare" >nul 2>&1
                    if not errorlevel 1 if not defined FOUND_URL set FOUND_URL=%%W
                )
            )
        )
    )
)

if defined FOUND_URL (
    echo.
    echo  ============================================
    echo    URL TUNNEL AKTIF:
    echo  ============================================
    echo.
    echo    URL Publik  : !FOUND_URL!
    echo    API Base    : !FOUND_URL!/v1
    echo.
    echo    Set di Vercel / .env.local:
    echo    OPENAI_BASE_URL=!FOUND_URL!/v1
    echo.
    echo  ============================================
) else (
    echo.
    echo  [WARN] URL tidak ditemukan.
    echo         Coba: tunnel.bat stop, lalu tunnel.bat lagi.
    echo.
)
exit /b 0
