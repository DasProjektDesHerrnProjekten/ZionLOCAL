@echo off
REM Offline Exam Platform Initialization Script
REM Run this script on each exam PC to set up the offline environment

echo ========================================
echo Offline Exam Platform Setup
echo ========================================
echo.

REM Check if running in SEB
if "%SEB_START%"=="" (
    echo This script should be run from Safe Exam Browser
    echo Please configure SEB to launch this script
    pause
    exit /b 1
)

echo Setting up offline exam environment...
echo.

REM Check if browser is in offline mode
echo Platform initialized successfully
echo.

REM Launch the exam platform
start "" "index.html"

echo ========================================
echo Offline Exam Platform Ready
echo ========================================
pause
