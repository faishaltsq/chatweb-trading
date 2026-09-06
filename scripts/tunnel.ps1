# Cloudflare Tunnel Launcher for 9Router (Port 20128)
param (
    [switch]$Stop,
    [switch]$Status
)

$cfPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$logFile = "$env:TEMP\cloudflared-9router.log"

if ($Stop) {
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Cloudflare Tunnel stopped." -ForegroundColor Yellow
    exit 0
}

if ($Status) {
    $proc = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "Tunnel is RUNNING (PID: $($proc.Id))" -ForegroundColor Green
        if (Test-Path $logFile) {
            $content = Get-Content $logFile -Raw
            if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
                Write-Host "Public URL: $($matches[0])" -ForegroundColor Cyan
                Write-Host "API Base:   $($matches[0])/v1" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "Tunnel is STOPPED." -ForegroundColor Red
    }
    exit 0
}

# Check if already running
$existing = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Tunnel already running (PID: $($existing.Id))" -ForegroundColor Green
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
            Write-Host "Public URL: $($matches[0])" -ForegroundColor Cyan
            Write-Host "API Base:   $($matches[0])/v1" -ForegroundColor Cyan
        }
    }
    exit 0
}

if (Test-Path $logFile) { Remove-Item $logFile -Force }

Write-Host "Starting Cloudflare Tunnel for 9Router (port 20128)..." -ForegroundColor Yellow
$proc = Start-Process -FilePath $cfPath -ArgumentList "tunnel","--url","http://localhost:20128" -RedirectStandardError $logFile -WindowStyle Hidden -PassThru

$url = $null
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') {
            $url = $matches[0]
            break
        }
    }
}

if ($url) {
    Write-Host "Tunnel connected successfully!" -ForegroundColor Green
    Write-Host "Public URL: $url" -ForegroundColor Cyan
    Write-Host "API Base:   $url/v1" -ForegroundColor Cyan
    Write-Host "`nSet this in your production / Vercel Environment Variables:" -ForegroundColor White
    Write-Host "OPENAI_BASE_URL=$url/v1" -ForegroundColor Yellow
} else {
    Write-Host "Failed to obtain public URL. Check log: $logFile" -ForegroundColor Red
}
