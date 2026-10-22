@echo off
setlocal enabledelayedexpansion
title Kannada & Hindi Assistant - Windows Desktop

echo =========================================================================
echo      Kannada ^& Hindi Worksheet Assistant - Windows Desktop
echo =========================================================================
echo.

:: 1. Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in your system PATH!
    echo Please install Python 3.10 or later from https://www.python.org/
    echo Make sure to check the box "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Check and install dependencies
cd /d "%~dp0windows_app"

echo Checking and installing required Python packages...
python -m pip install -q -r requirements.txt

:: 3. Launch application
echo.
echo Launching Kannada ^& Hindi Assistant Desktop App...
start "" pythonw launcher.py
if %errorlevel% neq 0 (
    python launcher.py
)

exit /b 0
