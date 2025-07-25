@echo off
REM AgenticOmics Platform Startup Script for Windows
REM This script starts all necessary services for the platform

REM Set JAVA_HOME if not already set
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17*" (
        for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set JAVA_HOME=%%i
    ) else if exist "C:\Program Files\Java\jdk-17*" (
        for /d %%i in ("C:\Program Files\Java\jdk-17*") do set JAVA_HOME=%%i
    ) else if exist "C:\Program Files\OpenJDK\openjdk-17*" (
        for /d %%i in ("C:\Program Files\OpenJDK\openjdk-17*") do set JAVA_HOME=%%i
    )
)

echo 🚀 Starting AgenticOmics Platform...
echo ======================================

REM Check if we're in the right directory
if not exist "run-services.sh" (
    echo ❌ Error: Please run this script from the AgenticOmics project root directory
    echo    Current directory: %CD%
    echo    Expected files: run-services.sh, backend\, frontend\
    pause
    exit /b 1
)

REM Create logs directory
if not exist "logs" mkdir logs

REM Clean up any existing processes
echo 🧹 Cleaning up any existing processes...
taskkill /f /im java.exe 2>nul >nul
taskkill /f /im node.exe 2>nul >nul
timeout /t 2 /nobreak >nul

REM Step 1: Build backend (if needed)
echo.
echo 🔨 Building backend services...
cd backend
if not exist "auth\target" (
    echo    First time setup - building all modules...
    call mvn clean install -DskipTests -q
    echo ✅ Backend build completed!
) else (
    echo ✅ Backend already built (skipping)
)
cd ..

REM Step 2: Start API Gateway
echo.
echo 🌐 Starting API Gateway (port 8080)...
start "API Gateway" /min cmd /c "run-services.sh gateway > logs\gateway.log 2>&1"

REM Step 3: Start Authentication Service
echo 🔐 Starting Authentication Service (port 8081)...
start "Auth Service" /min cmd /c "run-services.sh auth > logs\auth.log 2>&1"

REM Wait for backend services
echo ⏳ Waiting for backend services to start...
timeout /t 15 /nobreak >nul

REM Step 4: Start Frontend
echo.
echo 🎨 Starting Frontend Application (port 3000)...
cd frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo    Installing frontend dependencies...
    call npm install --silent
)

REM Start the frontend
echo    Starting React development server...
start "Frontend" /min cmd /c "npm start > ..\logs\frontend.log 2>&1"
cd ..

REM Wait for frontend
echo ⏳ Waiting for frontend to start...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 AgenticOmics Platform Started Successfully!
echo ==============================================
echo.
echo 📱 Access the application:
echo    🌐 Main Application: http://localhost:3000
echo    🔧 API Gateway:      http://localhost:8080
echo    🔐 Auth Service:     http://localhost:8081
echo.
echo 📋 Services are starting in background windows
echo    (You can minimize or close those windows)
echo.
echo 📁 Logs available in:
echo    - logs\gateway.log
echo    - logs\auth.log
echo    - logs\frontend.log
echo.
echo 🛑 To stop all services:
echo    .\stop-app.bat
echo.
echo 🎯 Open your browser and go to: http://localhost:3000
echo.
echo ⏳ Please wait 30-60 seconds for all services to fully start
echo    before accessing the application in your browser.
echo.

REM Open browser automatically
echo 🌐 Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo Press any key to exit (services will continue running)...
pause >nul