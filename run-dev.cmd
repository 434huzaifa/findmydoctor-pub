@echo off
setlocal
cd /d "%~dp0"

call :runStep "Installing dependencies" "npm i"
call :runStep "Running migrations" "npm run migration:run"
call :runStep "Starting development server" "npm run dev"

echo.
echo Process finished. Press any key to close this window...
pause >nul

goto :eof

:runStep
set "stepName=%~1"
set "stepCommand=%~2"

echo.
echo [%stepName%]
cmd /c "%stepCommand%"
set "exitCode=%errorlevel%"

if not "%exitCode%"=="0" (
	echo [ERROR] %stepName% failed with exit code %exitCode%.
) else (
	echo [OK] %stepName% completed.
)

goto :eof
