# Kannada Worksheet PDF Translator & Study Guide Builder (Windows)

A standalone Windows desktop application designed to read Kannada worksheets in PDF or image format, extract and normalize Kannada script using Gemini Vision AI, and generate a new study PDF featuring:
- Accurate Kannada sentences (correcting any OCR errors or broken ottaksharas)
- Phonetic English pronunciation guide for every sentence and word
- Word-by-word English translation matching context
- Fluent whole-sentence English translation
- High-resolution PDF export with embedded Google Noto Sans Kannada font

---

## 🚀 Quick Setup on Windows

### Prerequisites
- Windows 10 or 11
- Python 3.10 or later installed (ensure **"Add Python to PATH"** was checked during Python installation)
- A Google Gemini API Key

---

### Step 1: Install Dependencies
Open **Command Prompt** (`cmd`) or **PowerShell**, navigate to this folder, and run:
```cmd
pip install -r requirements.txt
```

---

### Step 2: Set your Gemini API Key (Optional)
You can set it in Windows environment variables:
```cmd
setx GEMINI_API_KEY "YOUR_GEMINI_API_KEY_HERE"
```
*(Or simply type your API key directly into the application GUI when launched)*

---

### Step 3: Run the Application
```cmd
python kannada_worksheet_translator.py
```

---

## 📦 How to Build a Standalone Windows Executable (.exe)
To package the app into a double-clickable Windows `.exe` that does not require Python on other PCs:
1. Double-click `build_exe.bat`  
   OR run in Command Prompt:
   ```cmd
   pyinstaller --onedir --windowed --name "KannadaWorksheetTranslator" kannada_worksheet_translator.py
   ```
2. The executable will be generated inside the `dist/KannadaWorksheetTranslator/` directory!

---

## 🎨 Layout Options
The application supports:
1. **Interlinear Gloss**: Word with pronunciation and meaning badges beneath.
2. **Structured Table**: Clean aligned vocabulary table for school revisions.
3. **Side-by-Side Dual Column**: Parallel Kannada and English bilingual sheets.
