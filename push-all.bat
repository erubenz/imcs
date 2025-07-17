@echo off
echo.
echo === Adding all changes...
git add .

echo.
echo === Committing...
git commit -m "Auto: UI refactor, bugfixes, campaign form, chains, tables, UX tweaks"

echo.
echo === Pulling latest from remote (just in case)...
git pull

echo.
echo === Pushing to GitHub...
git push

echo.
echo === DONE!
pause
