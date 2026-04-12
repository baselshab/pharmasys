@echo off
REM PharmaSys Development Environment Setup Script for Windows

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo    PharmaSys - Development Environment Setup
echo    Frontend + Backend Integration with Offline Support
echo ============================================================
echo.

REM Check Node.js
echo [1/3] Checking prerequisites...
where node >nul 2>nul
if !errorlevel! equ 0 (
    echo [OK] Node.js found
) else (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)

where npm >nul 2>nul
if !errorlevel! equ 0 (
    echo [OK] npm found
) else (
    echo [ERROR] npm not found
    exit /b 1
)

echo.

REM Setup Backend
echo [2/3] Setting up Backend...
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env file...
    echo # Backend Environment Variables > .env
    echo DATABASE_URL=postgresql://user:password@localhost:5432/pharmasys >> .env
    echo JWT_SECRET=your-secret-key-here >> .env
    echo PORT=4000 >> .env
    echo NODE_ENV=development >> .env
    echo.
    echo [ATTENTION] Please edit backend\.env with your database credentials
)

echo [OK] Backend setup complete
echo.

REM Setup Frontend
echo [3/3] Setting up Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating .env file...
    (
        echo # Frontend Environment Variables
        echo VITE_API_URL=http://localhost:4000/api
        echo VITE_APP_NAME=PharmaSys
    ) > .env
    echo [OK] .env created for frontend
)

echo [OK] Frontend setup complete
echo.

REM Final Instructions
echo ============================================================
echo    ✓ Setup Complete!
echo ============================================================
echo.

echo NEXT STEPS:
echo.
echo 1. Start Backend (Terminal 1):
echo    cd backend
echo    npm run db:generate
echo    npm run db:push
echo    npm run dev
echo.
echo 2. Start Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 3. Test Connection:
echo    Backend:  http://localhost:4000/api/health
echo    Frontend: http://localhost:5173
echo.
echo 4. Test Offline Mode:
echo    - Open DevTools (F12)
echo    - Network tab
echo    - Set Throttling to 'Offline'
echo    - Try adding/editing data
echo    - Switch back to Online
echo    - Watch data sync automatically!
echo.

echo DOCUMENTATION:
echo    - Backend:     backend\README.md
echo    - Frontend:    FRONTEND_INTEGRATION.md
echo    - Quick Start: QUICK_START.md
echo.

echo Happy coding!
pause
