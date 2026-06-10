@echo off
setlocal
cd /d "%~dp0"

echo Importing blog screenshots...
node back-end/import-blog-screenshots.mjs
if errorlevel 1 (
  echo Import failed.
  exit /b 1
)

echo Regenerating blog manifest...
call npm run generate-blog-manifest
if errorlevel 1 (
  echo Blog manifest generation failed.
  exit /b 1
)

echo Done.
endlocal
