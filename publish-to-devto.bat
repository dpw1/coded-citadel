@echo off
setlocal
cd /d "%~dp0"

if /I "%~1"=="--sync-only" goto sync

echo Building site...
set SKIP_DEVTO_PUBLISH=1
call npm run build
if errorlevel 1 (
  echo Build failed. Aborting dev.to publish.
  pause
  exit /b 1
)

:sync
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

if /I not "%~1"=="--sync-only" pause
exit /b %SYNC_EXIT%
