# Kannada & Hindi Worksheet Assistant

A bilingual educational assistant and study guide builder for Kannada and Hindi worksheets. It performs high-accuracy OCR, corrects broken conjuncts/matras, provides phonetic English transliteration, word-by-word meanings, and exports printable study PDFs.

---

## 🚀 Running on Windows Desktop

For complete, step-by-step setup and packaging instructions, see:
👉 **[WINDOWS_DESKTOP_SETUP.md](file:///d:/Code/Kannada_Hindi_Assistant/WINDOWS_DESKTOP_SETUP.md)**

### Quick Start (Double-Click)
1. Double-click **`run_desktop_app.bat`** in this folder.
2. Select **Kannada** or **Hindi** in the launcher window.

### Command Line
```cmd
cd windows_app
pip install -r requirements.txt
python launcher.py
```

### Standalone Executable (.exe)
Double-click `windows_app\build_exe.bat` to package the application into a standalone `.exe` using PyInstaller.

---

## 🔒 Security & Privacy (PII) Audit
- **Zero hardcoded API keys or credentials**: API keys are securely read from system environment variables or user profile configs.
- **Zero personal identifying information (PII)**: No personal names, personal email addresses, phone numbers, or private user directories are stored in the codebase.
- **Sample Educational Content**: Sample trial worksheets contain standard curriculum poems and sample school metadata.

---

## 🛠️ Project Structure

- `run_desktop_app.bat` - 1-click Windows desktop launcher.
- `WINDOWS_DESKTOP_SETUP.md` - Comprehensive Windows installation and execution guide.
- `windows_app/` - Python desktop GUI application (Tkinter / CustomTkinter + PyMuPDF + ReportLab + PyInstaller).
  - `launcher.py` - Unified language selector launcher.
  - `kannada_worksheet_translator.py` - Kannada OCR & Study Guide application.
  - `hindi_worksheet_translator.py` - Hindi OCR & Study Guide application.
  - `build_exe.bat` - PyInstaller build script for standalone Windows `.exe`.
  - `requirements.txt` - Python desktop dependencies.
- `src/` - React 19 + TypeScript web application frontend.
- `server.ts` - Express backend with `@google/genai` integration.
