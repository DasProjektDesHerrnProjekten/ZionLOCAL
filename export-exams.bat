@echo off
echo Exporting exams to JSON...
cd /d "%~dp0"
node scripts\export-exams-json.cjs
pause
