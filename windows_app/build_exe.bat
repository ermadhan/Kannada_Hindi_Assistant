@echo off
echo =========================================================================
echo Building Kannada Worksheet PDF Translator for Windows (Standalone .exe)
echo =========================================================================

echo [1/3] Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [2/3] Building executable using PyInstaller...
pyinstaller --noconfirm --onedir --windowed --name "KannadaWorksheetTranslator" ^
    --add-data "NotoSansKannada-Regular.ttf;." ^
    kannada_worksheet_translator.py

echo [3/3] Done!
echo The standalone application is located in: dist\KannadaWorksheetTranslator\
pause
