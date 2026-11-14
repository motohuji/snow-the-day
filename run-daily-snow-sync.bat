@echo off
setlocal
cd /d C:\Users\mssik\python\snow-the-day
set LOG_FILE=C:\Users\mssik\python\snow-the-day\data\sync.log

if not exist C:\Users\mssik\python\snow-the-day\data mkdir C:\Users\mssik\python\snow-the-day\data

echo [%date% %time%] === SNOW THE DAY SYNC START === >> %LOG_FILE%
set NODE_OPTIONS=--use-system-ca

echo [%date% %time%] 1. Scraping artificial snow reports... >> %LOG_FILE%
call node scripts/sync-snow-reports.cjs >> %LOG_FILE% 2>&1

echo [%date% %time%] 2. Checking git status... >> %LOG_FILE%
git add src/data/snow-reports.json >> %LOG_FILE% 2>&1
git diff --staged --quiet
if errorlevel 1 (
    echo [%date% %time%] Pushing updated snow reports to GitHub... >> %LOG_FILE%
    git commit -m "chore: sync artificial snow depth reports [skip ci]" >> %LOG_FILE% 2>&1
    git pull --rebase origin main >> %LOG_FILE% 2>&1
    git push origin main >> %LOG_FILE% 2>&1
    echo [%date% %time%] Push completed. >> %LOG_FILE%
) else (
    echo [%date% %time%] No changes detected. >> %LOG_FILE%
)

echo [%date% %time%] === SYNC FINISHED === >> %LOG_FILE%
echo. >> %LOG_FILE%
