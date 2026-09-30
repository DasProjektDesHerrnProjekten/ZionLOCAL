@echo off
echo ========================================
echo Starting Exam Platform with SEB
echo ========================================
echo.

cd /d %~dp0

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo Starting server in background...
start /min cmd /c "node server.js"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Server should be running at: http://localhost:8080
echo.

echo Checking if SEB is installed...
if exist "C:\Program Files\SafeExamBrowser\seb.exe" (
    echo SEB found at: C:\Program Files\SafeExamBrowser\seb.exe
    echo.
    echo Starting SEB with exam platform...
    "C:\Program Files\SafeExamBrowser\seb.exe" "http://localhost:8080"
) else if exist "C:\Program Files (x86)\SafeExamBrowser\seb.exe" (
    echo SEB found at: C:\Program Files (x86)\SafeExamBrowser\seb.exe
    echo.
    echo Starting SEB with exam platform...
    "C:\Program Files (x86)\SafeExamBrowser\seb.exe" "http://localhost:8080"
) else (
    echo ERROR: SEB not found!
    echo Please install SEB from https://safeexambrowser.org/
    echo.
    echo You can still access the exam platform at:
    echo http://localhost:8080
    echo.
    pause
)

echo.
echo ========================================
echo Server is running in background
echo Press any key to stop the server...
echo ========================================
pause >nul

echo Stopping server...
taskkill /f /im node.exe >nul 2>&1
echo Server stopped.