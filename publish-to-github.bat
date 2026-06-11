@echo off
setlocal
cd /d "%~dp0"

echo Building site...
call npm run build
if errorlevel 1 (
  echo Build failed. Aborting publish.
  exit /b 1
)

echo Waiting 1 second...
timeout /t 1 /nobreak >nul

echo Staging changes...
git add -A
if errorlevel 1 (
  echo git add failed.
  exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
  echo Committing...
  git commit -m "publishing to github"
  if errorlevel 1 (
    echo Commit failed.
    exit /b 1
  )
) else (
  echo No changes to commit.
)

echo Pushing to remote...
git push
if errorlevel 1 (
  echo Push failed.
  exit /b 1
)

echo Done. Published to GitHub.
endlocal
