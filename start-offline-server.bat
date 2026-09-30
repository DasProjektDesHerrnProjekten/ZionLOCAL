@echo off
REM Offline Exam Platform Server Startup Script
REM This script starts a local HTTP server for the offline exam platform
REM The server listens on port 8080 as configured in SEB

echo Starting Offline Exam Platform Server...
echo Server will listen on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dist-offline exists
if not exist "dist-offline\index.html" (
    echo ERROR: dist-offline folder not found or index.html missing
    echo Please run: npm run build:offline
    pause
    exit /b 1
)

REM Start the server using npx serve
echo Starting server on port 8080...
npx serve dist-offline -l 8080 -s --no-clipboard
