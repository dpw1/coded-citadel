@echo off
setlocal
cd /d "%~dp0"

echo Building site...
call npm run build
if errorlevel 1 (
  echo Build failed. Aborting dev.to publish.
  pause
  exit /b 1
)

echo.
echo Syncing blog posts to dev.to...
node back-end/sync-devto.mjs
set SYNC_EXIT=%ERRORLEVEL%

echo.
if %SYNC_EXIT% equ 0 (
  echo Done. Published to dev.to.
) else (
  echo dev.to sync finished with errors. See log above.
)

pause
exit /b %SYNC_EXIT%
