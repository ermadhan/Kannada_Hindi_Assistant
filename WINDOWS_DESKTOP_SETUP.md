# Running Kannada & Hindi Assistant on Windows Desktop

This guide explains how to set up, run, and package the **Kannada & Hindi Worksheet Assistant** on Windows 10/11.

---

## 📋 Table of Contents
1. [Overview & Application Modes](#overview--application-modes)
2. [Method 1: One-Click Desktop Launcher (Recommended)](#method-1-one-click-desktop-launcher-recommended)
3. [Method 2: Command Line (PowerShell / Command Prompt)](#method-2-command-line-powershell--command-prompt)
4. [Method 3: Build Standalone Windows Executable (.exe)](#method-3-build-standalone-windows-executable-exe)
5. [Configuring your Google Gemini API Key](#configuring-your-google-gemini-api-key)
6. [Method 4: Running the Web Application Mode (Node.js)](#method-4-running-the-web-application-mode-nodejs)
7. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## Overview & Application Modes

The project offers two ways to run on Windows:

| Mode | Technology | Best For | Prerequisites |
|---|---|---|---|
| **Native Windows GUI** | Python (Tkinter / CustomTkinter), PyMuPDF, ReportLab | Offline PDF processing, double-click desktop app, export to standalone `.exe` | Python 3.10+ (Already present on this system) |
| **Web Interface** | React 19, TypeScript, Express, Vite | Rich interactive browser UI, audio pronunciation previews | Node.js (v18+) & npm |

---

## Method 1: One-Click Desktop Launcher (Recommended)

A batch script is provided at the root of the project to automate environment verification, package installation, and app launching.

1. Open File Explorer and navigate to the project folder:
   ```text
   Kannada_Hindi_Assistant
   ```
2. Double-click **`run_desktop_app.bat`**.
3. The script will:
   - Verify Python is installed and accessible in your `PATH`.
   - Automatically install any missing packages from `windows_app\requirements.txt`.
   - Launch the unified **Kannada & Hindi Desktop Launcher**.
4. From the launcher window, click either:
   - **Launch Kannada Worksheet Translator (ಕನ್ನಡ)**
   - **Launch Hindi Worksheet Translator (हिंदी)**

---

## Method 2: Command Line (PowerShell / Command Prompt)

If you prefer using PowerShell or CMD:

### Step 1: Open PowerShell or Command Prompt
Navigate to the `windows_app` directory:
```powershell
cd Kannada_Hindi_Assistant\windows_app
```

### Step 2: Install Python Dependencies
```powershell
pip install -r requirements.txt
```

> **Note:** The dependencies installed are:
> - `google-genai`: Official Google Gemini API client
> - `pymupdf`: PDF page rasterization and text extraction
> - `reportlab`: Generation of styled study PDFs with Unicode fonts
> - `customtkinter` / `pillow`: Modern Windows desktop interface
> - `pyinstaller`: Packaging the app into `.exe`

### Step 3: Run the Application
You can launch any of the following:

- **Unified Launcher (Menu):**
  ```powershell
  python launcher.py
  ```
- **Kannada Translator directly:**
  ```powershell
  python kannada_worksheet_translator.py
  ```
- **Hindi Translator directly:**
  ```powershell
  python hindi_worksheet_translator.py
  ```

---

## Method 3: Build Standalone Windows Executable (.exe)

You can compile the Python code into a self-contained `.exe` that can be distributed to other Windows PCs without requiring Python to be installed.

### Option A: Double-Click the Build Script
1. Navigate to `Kannada_Hindi_Assistant\windows_app`.
2. Double-click **`build_exe.bat`**.

### Option B: Run via Command Prompt
```cmd
cd Kannada_Hindi_Assistant\windows_app
build_exe.bat
```

### Output Location
Once the build completes, the executable files will be located in:
- `windows_app\dist\KannadaWorksheetTranslator\KannadaWorksheetTranslator.exe`
- `windows_app\dist\HindiWorksheetTranslator\HindiWorksheetTranslator.exe`

You can create a desktop shortcut directly to these `.exe` files.

---

## Configuring your Google Gemini API Key

The application uses the Google Gemini API (model `gemini-3.8-flash`) for high-accuracy OCR, linguistic breakdown, and transliteration.

You can set your API key in **one of three ways**:

### Option 1: Directly inside the Desktop GUI
When you open the app, paste your API key into the **"Gemini API Key"** input field and click **"Save Key"**. The app securely stores it in your user profile:
- `%USERPROFILE%\.kannada_worksheet_translator_config.json`
- `%USERPROFILE%\.hindi_worksheet_translator_config.json`

### Option 2: Persistent Windows Environment Variable
Run in Command Prompt or PowerShell:
```cmd
setx GEMINI_API_KEY "AIzaSyYourActualKeyHere"
```
*(Restart your terminal or app after running `setx` for the variable to take effect)*

### Option 3: PowerShell Session Variable
```powershell
$env:GEMINI_API_KEY="AIzaSyYourActualKeyHere"
python kannada_worksheet_translator.py
```

To get a free API key, visit: [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## Method 4: Running the Web Application Mode (Node.js)

If you wish to run the interactive React web application on your local machine:

1. **Install Node.js**:
   Download and install Node.js LTS (v18 or v20+) from [https://nodejs.org/](https://nodejs.org/).
2. **Configure `.env`**:
   In the root directory, copy `.env.example` to `.env`:
   ```cmd
   copy .env.example .env
   ```
   Open `.env` and set your key:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   PORT=3000
   ```
3. **Install Dependencies & Start**:
   ```cmd
   npm install
   npm run dev
   ```
4. **Open in Browser**:
   Open [http://localhost:3000](http://localhost:3000) in Microsoft Edge, Google Chrome, or your default browser.

---

## Troubleshooting & FAQs

### 1. `python` is not recognized
- Ensure Python 3.10+ is installed.
- In Windows search, type **"Edit the system environment variables"** -> **Environment Variables** -> ensure Python's installation path and `Scripts` path are in `Path`.

### 2. Kannada / Hindi Font Rendering in PDF
- The app automatically downloads `NotoSansKannada` and `NotoSansDevanagari` from Google Fonts on first run and saves them to:
  - `%USERPROFILE%\.kannada_fonts\`
  - `%USERPROFILE%\.hindi_fonts\`
- Ensure your computer has internet access during the initial run so fonts can be fetched.

### 3. PyMuPDF or Pillow installation fails
Run:
```cmd
python -m pip install --upgrade pip setuptools wheel
pip install pymupdf pillow reportlab customtkinter google-genai
```
