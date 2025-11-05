@echo off
echo.
echo ========================================
echo Online Examination System - Server
echo ========================================
echo.
echo Starting development server...
echo Server will run on http://localhost:5000
echo Client will run on http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
set NODE_ENV=development
npm run dev
