@echo off
REM Exam Results Viewer
REM Displays the summary of all completed exams and opens the exam-results folder

echo ========================================================================================
echo                          EXAM RESULTS AND ANSWERS SUMMARY                               
echo ========================================================================================
echo.

if exist "exam-results\summary.txt" (
    type "exam-results\summary.txt"
) else (
    echo No exam submissions saved in exam-results\ folder yet.
    echo Submit an exam in the platform to see student results here.
)

echo.
echo ========================================================================================
echo Opening exam-results folder in File Explorer...
start "" "exam-results"
echo.
pause
