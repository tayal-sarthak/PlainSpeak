@echo off
echo Starting PlainSpeak Web App...
echo.

REM check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo.
echo ========================================
echo PlainSpeak Web App
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001
echo.
echo Make sure the backend is running!
echo.
echo Press Ctrl+C to stop
echo.

call npm run dev
