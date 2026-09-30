@echo off
echo ========================================
echo Exam Access Configuration Tool
echo ========================================
echo.
echo This tool automatically:
echo - Creates a mock exam with 10 general questions
echo - Grants access to all students
echo - Configures for offline SEB deployment
echo.
cd /d "%~dp0"
node scripts\configure-exam-access.cjs
echo.
pause
