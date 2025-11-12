# Online Examination System - Server Startup Script
# This script starts the development server with proper error handling

Write-Host "Starting Online Examination System..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "MongoDB service exists but is not running" -ForegroundColor Yellow
        Write-Host "   Please start MongoDB manually or run as Administrator" -ForegroundColor Yellow
    }
} else {
    Write-Host "MongoDB service not found" -ForegroundColor Yellow
    Write-Host "   Make sure MongoDB is installed and running" -ForegroundColor Yellow
}

Write-Host ""

# Check if port 5000 is already in use
Write-Host "Checking if port 5000 is available..." -ForegroundColor Yellow
$portInUse = netstat -ano | Select-String ":5000" | Select-String "LISTENING"

if ($portInUse) {
    Write-Host "Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "   Stopping existing Node.js processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Cleaned up existing processes" -ForegroundColor Green
} else {
    Write-Host "Port 5000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting server on http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Set environment and start server
$env:NODE_ENV = "development"
npm run dev
