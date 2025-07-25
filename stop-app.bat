@echo off
REM AgenticOmics Platform Stop Script for Windows
REM This script stops all running services

echo 🛑 Stopping AgenticOmics Platform...
echo ====================================

echo 🧹 Stopping all services...

REM Stop Java processes (Spring Boot services)
echo    Stopping backend services...
taskkill /f /im java.exe 2>nul >nul
if %errorlevel% equ 0 (
    echo    ✅ Stopped Spring Boot services
) else (
    echo    ℹ️  No Java processes found
)

REM Stop Node.js processes (React development server)
echo    Stopping frontend service...
taskkill /f /im node.exe 2>nul >nul
if %errorlevel% equ 0 (
    echo    ✅ Stopped React development server
) else (
    echo    ℹ️  No Node.js processes found
)

REM Close any command windows that might be running services
echo    Closing service windows...
taskkill /f /fi "WindowTitle eq API Gateway*" 2>nul >nul
taskkill /f /fi "WindowTitle eq Auth Service*" 2>nul >nul
taskkill /f /fi "WindowTitle eq Frontend*" 2>nul >nul

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

echo.
echo ✅ AgenticOmics Platform stopped successfully!
echo.
echo 💡 To start again, run:
echo    start-app.bat
echo.
pause