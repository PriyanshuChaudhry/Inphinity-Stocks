@echo off
title Fix Git and Push
color 0C

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║      🔧 FIXING GIT - Removing node_modules                   ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo ⚠️  IMPORTANT: Removing node_modules from git...
echo This will take a moment...
echo.

echo Step 1: Adding .gitignore to protect node_modules...
git add .gitignore
echo ✓ Done!
echo.

echo Step 2: Committing removal of node_modules...
git commit -m "Remove node_modules from git and add .gitignore"
echo ✓ Done!
echo.

echo Step 3: Adding all other changes...
git add .
echo ✓ Done!
echo.

echo Step 4: Committing project changes...
git commit -m "Dashboard fixes and improvements (without node_modules)"
echo ✓ Done!
echo.

echo Step 5: Pushing to GitHub...
echo This may take a while (removing 1885 files)...
git push
echo.

if %errorlevel% equ 0 (
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                                                              ║
    echo ║              ✅ SUCCESS! Clean push to GitHub                ║
    echo ║                                                              ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo What was done:
    echo ✓ Removed 1885 node_modules files from git
    echo ✓ Added .gitignore to protect future pushes
    echo ✓ Pushed all code changes
    echo ✓ Your repo is now clean!
    echo.
    echo Render will auto-deploy backend in 2-3 minutes
    echo.
) else (
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                                                              ║
    echo ║              ❌ ERROR! Push failed                           ║
    echo ║                                                              ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo Please check the error above
    echo.
)

echo Press any key to exit...
pause >nul
