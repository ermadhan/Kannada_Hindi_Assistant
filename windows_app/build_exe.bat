@echo off
setlocal
echo =========================================================================
echo Building Kannada ^& Hindi Worksheet PDF Translators for Windows (.exe)
echo =========================================================================

cd /d "%~dp0"

echo [1/3] Installing/verifying dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [2/3] Building standalone Windows executables using PyInstaller...
echo [A] Building KannadaWorksheetTranslator.exe ...
pyinstaller --noconfirm --onedir --windowed --name "KannadaWorksheetTranslator" kannada_worksheet_translator.py

echo.
echo [B] Building HindiWorksheetTranslator.exe ...
pyinstaller --noconfirm --onedir --windowed --name "HindiWorksheetTranslator" hindi_worksheet_translator.py

echo.
echo =========================================================================
echo [3/3] Build Complete!
echo Standalone executables are located in:
echo   - %~dp0dist\KannadaWorksheetTranslator\KannadaWorksheetTranslator.exe
echo   - %~dp0dist\HindiWorksheetTranslator\HindiWorksheetTranslator.exe
echo =========================================================================
pause
