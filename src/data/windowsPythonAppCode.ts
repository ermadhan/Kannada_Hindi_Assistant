import { windowsCSharpCode } from './windowsCSharpAppCode';

export const windowsPythonScript = `"""
=============================================================================
Kannada Worksheet PDF Translator & Study Guide Builder - Windows Desktop App
Language: Python 3.10+
GUI: CustomTkinter / Tkinter
AI Engine: Google GenAI SDK (gemini-2.5-flash / gemini-3.8-flash)
PDF Engine: PyMuPDF (fitz) + ReportLab with Noto Sans Kannada font
=============================================================================
"""

import os
import sys
import json
import base64
import urllib.request
import threading
from pathlib import Path

# GUI Imports: try CustomTkinter for sleek modern Windows look, fallback to Tkinter
try:
    import customtkinter as ctk
    HAS_CUSTOMTKINTER = True
except ImportError:
    HAS_CUSTOMTKINTER = False

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

# PDF & Processing Imports
import fitz  # PyMuPDF
from PIL import Image, ImageTk
from google import genai
from google.genai import types

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


# System instruction for high-accuracy Kannada linguistic analysis
SYSTEM_INSTRUCTION = """You are an expert Kannada linguist, educator, and OCR specialist for Karnataka school curricula.
Your task is to take a Kannada worksheet page (image or scanned PDF page) and output:
1. Cleaned, grammatically flawless Kannada text (correcting any broken ottaksharas, missing matras, or OCR artifacts).
2. English phonetic pronunciation for each sentence and word (e.g. 'Sarvajñanu', 'maneya', 'jyōtiyu').
3. Accurate word-by-word English translation matching the context.
4. Fluent complete sentence English translation.
5. Identification of worksheet sections and question-answer pairs.

Return strictly structured JSON matching the provided schema.
"""

KANNADA_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "worksheetTitle": {"type": "STRING"},
        "school": {"type": "STRING"},
        "grade": {"type": "STRING"},
        "subject": {"type": "STRING"},
        "sections": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "sectionTitleKannada": {"type": "STRING"},
                    "sectionTitlePronunciation": {"type": "STRING"},
                    "sectionTitleEnglish": {"type": "STRING"},
                    "items": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "itemNumber": {"type": "STRING"},
                                "type": {"type": "STRING", "description": "vocabulary | question | answer | sentence"},
                                "kannadaText": {"type": "STRING"},
                                "englishPronunciation": {"type": "STRING"},
                                "englishTranslation": {"type": "STRING"},
                                "words": {
                                    "type": "ARRAY",
                                    "items": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "kannada": {"type": "STRING"},
                                            "pronunciation": {"type": "STRING"},
                                            "englishMeaning": {"type": "STRING"},
                                            "grammaticalRole": {"type": "STRING"}
                                        },
                                        "required": ["kannada", "pronunciation", "englishMeaning"]
                                    }
                                }
                            },
                            "required": ["kannadaText", "englishPronunciation", "englishTranslation", "words"]
                        }
                    }
                },
                "required": ["sectionTitleKannada", "items"]
            }
        }
    },
    "required": ["worksheetTitle", "sections"]
}

CONFIG_FILE = Path.home() / ".kannada_worksheet_translator_config.json"
FONT_DIR = Path.home() / ".kannada_fonts"
FONT_PATH = FONT_DIR / "NotoSansKannada-Regular.ttf"
FONT_BOLD_PATH = FONT_DIR / "NotoSansKannada-Bold.ttf"


def ensure_kannada_fonts():
    """Downloads Google Noto Sans Kannada font if not locally present for ReportLab PDF rendering."""
    try:
        FONT_DIR.mkdir(parents=True, exist_ok=True)
        if not FONT_PATH.exists():
            print("Downloading Noto Sans Kannada font for PDF generation...")
            url = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Regular.ttf"
            urllib.request.urlretrieve(url, FONT_PATH)

        if not FONT_BOLD_PATH.exists():
            url_bold = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Bold.ttf"
            urllib.request.urlretrieve(url_bold, FONT_BOLD_PATH)

        if FONT_PATH.exists():
            pdfmetrics.registerFont(TTFont("NotoSansKannada", str(FONT_PATH)))
        if FONT_BOLD_PATH.exists():
            pdfmetrics.registerFont(TTFont("NotoSansKannada-Bold", str(FONT_BOLD_PATH)))
        return True
    except Exception as e:
        print(f"Warning: Could not fetch Noto Sans Kannada font: {e}")
        return False


def load_saved_key():
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
                return data.get("api_key", "")
        except Exception:
            pass
    return os.environ.get("GEMINI_API_KEY", "")


def save_key(api_key):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump({"api_key": api_key}, f)
    except Exception as e:
        print(f"Could not save config: {e}")


class KannadaTranslatorApp:
    def __init__(self):
        ensure_kannada_fonts()

        if HAS_CUSTOMTKINTER:
            ctk.set_appearance_mode("System")
            ctk.set_default_color_theme("blue")
            self.root = ctk.CTk()
        else:
            self.root = tk.Tk()

        self.root.title("Kannada Worksheet PDF Translator (Windows)")
        self.root.geometry("1024x768")
        self.root.minsize(850, 600)

        self.pdf_path = None
        self.parsed_pages_data = []
        self.current_page_idx = 0
        self.total_pages = 0

        self.build_ui()

    def build_ui(self):
        # 1. Top Header Banner
        header = tk.Frame(self.root, bg="#0f172a", padx=20, pady=16)
        header.pack(fill="x")

        lbl_title = tk.Label(
            header,
            text="ಕನ್ನಡ Kannada Worksheet Study Guide & PDF Builder",
            font=("Segoe UI", 16, "bold"),
            fg="#f8fafc",
            bg="#0f172a"
        )
        lbl_title.pack(anchor="w")

        lbl_sub = tk.Label(
            header,
            text="High-accuracy OCR, word-by-word English translation, phonetic pronunciation & study PDF generation",
            font=("Segoe UI", 10),
            fg="#94a3b8",
            bg="#0f172a"
        )
        lbl_sub.pack(anchor="w")

        # 2. Control & Setup Panel
        ctrl_frame = tk.LabelFrame(self.root, text=" 1. Setup & Worksheet Selection ", padx=15, pady=10)
        ctrl_frame.pack(fill="x", padx=16, pady=8)

        # Row 0: API Key
        tk.Label(ctrl_frame, text="Gemini API Key:").grid(row=0, column=0, sticky="w", pady=4)
        self.entry_key = ttk.Entry(ctrl_frame, width=45, show="*")
        self.entry_key.grid(row=0, column=1, sticky="w", padx=8, pady=4)
        saved_key = load_saved_key()
        if saved_key:
            self.entry_key.insert(0, saved_key)

        btn_save_key = ttk.Button(ctrl_frame, text="Save Key", command=self.save_api_key_clicked)
        btn_save_key.grid(row=0, column=2, sticky="w", padx=4, pady=4)

        # Row 1: File selection
        tk.Label(ctrl_frame, text="Worksheet File:").grid(row=1, column=0, sticky="w", pady=4)
        self.lbl_file = ttk.Label(ctrl_frame, text="No PDF or Image selected yet", foreground="#64748b")
        self.lbl_file.grid(row=1, column=1, sticky="w", padx=8, pady=4)

        btn_browse = ttk.Button(ctrl_frame, text="Browse PDF / Image...", command=self.browse_file)
        btn_browse.grid(row=1, column=2, sticky="w", padx=4, pady=4)

        # Row 2: Layout mode selection
        tk.Label(ctrl_frame, text="Output PDF Layout:").grid(row=2, column=0, sticky="w", pady=4)
        self.layout_var = tk.StringVar(value="Interlinear Gloss (Under-Word)")
        cmb_layout = ttk.Combobox(
            ctrl_frame,
            textvariable=self.layout_var,
            values=[
                "Interlinear Gloss (Under-Word)",
                "Structured Vocabulary Table",
                "Side-by-Side Dual Column"
            ],
            state="readonly",
            width=32
        )
        cmb_layout.grid(row=2, column=1, sticky="w", padx=8, pady=4)

        # 3. Action Buttons & Status Row
        btn_bar = tk.Frame(self.root, padx=16, pady=4)
        btn_bar.pack(fill="x")

        self.btn_process = tk.Button(
            btn_bar,
            text="▶ 2. Process Worksheet with Gemini Vision",
            command=self.start_processing_thread,
            bg="#0284c7",
            fg="white",
            font=("Segoe UI", 10, "bold"),
            padx=14,
            pady=8,
            relief="flat",
            cursor="hand2"
        )
        self.btn_process.pack(side="left", padx=4)

        self.btn_export = tk.Button(
            btn_bar,
            text="⬇ 3. Export Formatted Study PDF...",
            command=self.export_pdf_clicked,
            state="disabled",
            bg="#059669",
            fg="white",
            font=("Segoe UI", 10, "bold"),
            padx=14,
            pady=8,
            relief="flat",
            cursor="hand2"
        )
        self.btn_export.pack(side="left", padx=4)

        self.btn_export_json = tk.Button(
            btn_bar,
            text="Export JSON",
            command=self.export_json_clicked,
            state="disabled",
            bg="#475569",
            fg="white",
            font=("Segoe UI", 9),
            padx=10,
            pady=8,
            relief="flat"
        )
        self.btn_export_json.pack(side="left", padx=4)

        self.progress_bar = ttk.Progressbar(self.root, mode="indeterminate")
        self.lbl_status = tk.Label(self.root, text="Ready. Select a PDF worksheet and click Process.", fg="#334155")
        self.lbl_status.pack(fill="x", padx=20, pady=4)

        # 4. Results Notebook (Tabs)
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=16, pady=8)

        # Tab 1: Formatted Study View
        self.tab_preview = tk.Frame(self.notebook)
        self.notebook.add(self.tab_preview, text="📖 Study Breakdown Preview")
        self.txt_preview = tk.Text(self.tab_preview, wrap="word", font=("Segoe UI", 10))
        scroll_p = ttk.Scrollbar(self.tab_preview, orient="vertical", command=self.txt_preview.yview)
        self.txt_preview.configure(yscrollcommand=scroll_p.set)
        self.txt_preview.pack(side="left", fill="both", expand=True)
        scroll_p.pack(side="right", fill="y")

        # Tab 2: Raw JSON
        self.tab_json = tk.Frame(self.notebook)
        self.notebook.add(self.tab_json, text="{ } Structured JSON")
        self.txt_json = tk.Text(self.tab_json, wrap="none", font=("Consolas", 9))
        scroll_j = ttk.Scrollbar(self.tab_json, orient="vertical", command=self.txt_json.yview)
        self.txt_json.configure(yscrollcommand=scroll_j.set)
        self.txt_json.pack(side="left", fill="both", expand=True)
        scroll_j.pack(side="right", fill="y")

    def save_api_key_clicked(self):
        k = self.entry_key.get().strip()
        if k:
            save_key(k)
            messagebox.showinfo("Saved", "Gemini API key saved successfully.")

    def browse_file(self):
        path = filedialog.askopenfilename(
            title="Select Kannada Worksheet PDF or Image",
            filetypes=[
                ("Supported files", "*.pdf;*.png;*.jpg;*.jpeg;*.webp"),
                ("PDF files", "*.pdf"),
                ("Image files", "*.png;*.jpg;*.jpeg;*.webp")
            ]
        )
        if path:
            self.pdf_path = path
            self.lbl_file.config(text=os.path.basename(path), foreground="#0f172a")

    def start_processing_thread(self):
        api_key = self.entry_key.get().strip()
        if not api_key:
            messagebox.showerror("Key Required", "Please enter your Gemini API key.")
            return

        if not self.pdf_path:
            messagebox.showerror("File Required", "Please select a Kannada PDF or image file first.")
            return

        save_key(api_key)

        self.btn_process.config(state="disabled")
        self.btn_export.config(state="disabled")
        self.btn_export_json.config(state="disabled")
        self.progress_bar.pack(fill="x", padx=20, pady=4)
        self.progress_bar.start(10)
        self.lbl_status.config(text="Extracting pages and processing with Gemini Vision AI...", fg="#0284c7")

        threading.Thread(target=self.process_file, args=(api_key,), daemon=True).start()

    def process_file(self, api_key: str):
        try:
            client = genai.Client(api_key=api_key)
            results = []

            if self.pdf_path.lower().endswith(".pdf"):
                doc = fitz.open(self.pdf_path)
                self.total_pages = len(doc)

                for page_num in range(len(doc)):
                    self.update_status_thread(f"Processing Page {page_num + 1} of {len(doc)} with Gemini Vision...")
                    page = doc[page_num]
                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("jpeg")

                    page_data = self.call_gemini_vision(client, img_bytes, f"Worksheet Page {page_num + 1}")
                    page_data["pageNumber"] = page_num + 1
                    results.append(page_data)
            else:
                self.total_pages = 1
                self.update_status_thread("Processing image with Gemini Vision...")
                with open(self.pdf_path, "rb") as f:
                    img_bytes = f.read()
                page_data = self.call_gemini_vision(client, img_bytes, "Worksheet Page 1")
                page_data["pageNumber"] = 1
                results.append(page_data)

            self.parsed_pages_data = results
            self.root.after(0, self.on_processing_success)
        except Exception as e:
            self.root.after(0, self.on_processing_error, str(e))

    def update_status_thread(self, text):
        self.root.after(0, lambda: self.lbl_status.config(text=text, fg="#0284c7"))

    def call_gemini_vision(self, client: genai.Client, img_bytes: bytes, page_label: str) -> dict:
        prompt = (
            f"Analyze this Kannada worksheet ({page_label}). Perform precise Kannada OCR, "
            "correct any split ottaksharas or missing matras, break down each sentence word-by-word with "
            "English phonetic pronunciation, word meaning, and fluent sentence translation."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                types.Part.from_text(text=prompt)
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=KANNADA_SCHEMA
            )
        )
        return json.loads(response.text)

    def on_processing_success(self):
        self.progress_bar.stop()
        self.progress_bar.pack_forget()
        self.btn_process.config(state="normal")
        self.btn_export.config(state="normal")
        self.btn_export_json.config(state="normal")
        self.lbl_status.config(text=f"Success! Processed {len(self.parsed_pages_data)} page(s).", fg="#059669")

        # Update JSON tab
        self.txt_json.delete("1.0", "end")
        self.txt_json.insert("1.0", json.dumps(self.parsed_pages_data, indent=2, ensure_ascii=False))

        # Update Preview tab
        self.txt_preview.delete("1.0", "end")
        for page in self.parsed_pages_data:
            p_num = page.get("pageNumber", 1)
            title = page.get("worksheetTitle", "Kannada Worksheet")
            self.txt_preview.insert("end", f"================ PAGE {p_num}: {title} ================\\n\\n")

            for sec in page.get("sections", []):
                self.txt_preview.insert("end", f"### {sec.get('sectionTitleKannada')} ###\\n")
                if sec.get("sectionTitlePronunciation"):
                    self.txt_preview.insert("end", f"Pronunciation: {sec.get('sectionTitlePronunciation')}\\n")
                if sec.get("sectionTitleEnglish"):
                    self.txt_preview.insert("end", f"Meaning: {sec.get('sectionTitleEnglish')}\\n\\n")

                for itm in sec.get("items", []):
                    self.txt_preview.insert("end", f"• Kannada: {itm.get('kannadaText')}\\n")
                    self.txt_preview.insert("end", f"  Pronunciation: {itm.get('englishPronunciation')}\\n")
                    self.txt_preview.insert("end", f"  Translation:   {itm.get('englishTranslation')}\\n")
                    self.txt_preview.insert("end", "  [Word-by-Word]:\\n")
                    for w in itm.get("words", []):
                        self.txt_preview.insert(
                            "end",
                            f"    - {w.get('kannada')} [{w.get('pronunciation')}]: {w.get('englishMeaning')}\\n"
                        )
                    self.txt_preview.insert("end", "\\n")
            self.txt_preview.insert("end", "\\n")

    def on_processing_error(self, err: str):
        self.progress_bar.stop()
        self.progress_bar.pack_forget()
        self.btn_process.config(state="normal")
        self.lbl_status.config(text=f"Error: {err}", fg="#dc2626")
        messagebox.showerror("Processing Failed", f"An error occurred while calling Gemini AI:\\n\\n{err}")

    def export_json_clicked(self):
        if not self.parsed_pages_data:
            return
        out_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json")],
            title="Save Structured JSON"
        )
        if out_path:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(self.parsed_pages_data, f, indent=2, ensure_ascii=False)
            messagebox.showinfo("Saved", f"JSON successfully saved to:\\n{out_path}")

    def export_pdf_clicked(self):
        if not self.parsed_pages_data:
            return

        out_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")],
            title="Save Translated Kannada Study PDF"
        )
        if not out_path:
            return

        try:
            self.build_reportlab_pdf(out_path)
            messagebox.showinfo("PDF Generated", f"Study PDF successfully generated at:\\n{out_path}")
        except Exception as e:
            messagebox.showerror("PDF Export Failed", f"Could not generate PDF:\\n{e}")

    def build_reportlab_pdf(self, out_path: str):
        doc = SimpleDocTemplate(
            out_path,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        font_name = "NotoSansKannada" if FONT_PATH.exists() else "Helvetica"
        font_bold = "NotoSansKannada-Bold" if FONT_BOLD_PATH.exists() else "Helvetica-Bold"

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'KDocTitle',
            fontName=font_bold,
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=10
        )
        sec_style = ParagraphStyle(
            'KSectionTitle',
            fontName=font_bold,
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#0369a1'),
            spaceBefore=12,
            spaceAfter=6
        )
        kannada_style = ParagraphStyle(
            'KKannadaText',
            fontName=font_bold,
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#0f172a')
        )
        pronounce_style = ParagraphStyle(
            'KPronounceText',
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0f766e')
        )
        meaning_style = ParagraphStyle(
            'KMeaningText',
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#312e81')
        )

        story = []

        for p_idx, page in enumerate(self.parsed_pages_data):
            if p_idx > 0:
                story.append(PageBreak())

            title = page.get("worksheetTitle", "Kannada Worksheet Study Guide")
            school = page.get("school", "")
            grade = page.get("grade", "")

            header_text = f"<b>{title}</b>"
            if school or grade:
                header_text = f"<b>{school}</b> — {grade}<br/>{header_text}"
            story.append(Paragraph(header_text, title_style))
            story.append(Spacer(1, 6))

            for sec in page.get("sections", []):
                sec_title = f"{sec.get('sectionTitleKannada', '')}"
                if sec.get('sectionTitleEnglish'):
                    sec_title += f" ({sec.get('sectionTitleEnglish')})"
                story.append(Paragraph(sec_title, sec_style))
                story.append(Spacer(1, 4))

                for item in sec.get("items", []):
                    item_elements = []
                    item_elements.append(Paragraph(f"<b>{item.get('kannadaText', '')}</b>", kannada_style))
                    item_elements.append(Paragraph(f"Pronunciation: {item.get('englishPronunciation', '')}", pronounce_style))
                    item_elements.append(Paragraph(f"English: {item.get('englishTranslation', '')}", meaning_style))
                    item_elements.append(Spacer(1, 3))

                    # Table of words
                    table_rows = [["Kannada", "Pronunciation", "English Meaning"]]
                    for w in item.get("words", []):
                        table_rows.append([
                            Paragraph(w.get("kannada", ""), kannada_style),
                            w.get("pronunciation", ""),
                            w.get("englishMeaning", "")
                        ])

                    tbl = Table(table_rows, colWidths=[140, 160, 220])
                    tbl.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
                        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
                        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0,0), (-1,-1), 8.5),
                        ('TOPPADDING', (0,0), (-1,-1), 3),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                    ]))
                    item_elements.append(tbl)
                    item_elements.append(Spacer(1, 8))

                    story.append(KeepTogether(item_elements))

        doc.build(story)


def main():
    app = KannadaTranslatorApp()
    app.root.mainloop()


if __name__ == "__main__":
    main()
`;

export const windowsHindiPythonScript = `"""
=============================================================================
Hindi Worksheet PDF Translator & Study Guide Builder - Windows Desktop App
Language: Python 3.10+
GUI: CustomTkinter / Tkinter
AI Engine: Google GenAI SDK (gemini-2.5-flash / gemini-3.8-flash)
PDF Engine: PyMuPDF (fitz) + ReportLab with Noto Sans Devanagari font
=============================================================================
"""

import os
import sys
import json
import base64
import urllib.request
import threading
from pathlib import Path

try:
    import customtkinter as ctk
    HAS_CUSTOMTKINTER = True
except ImportError:
    HAS_CUSTOMTKINTER = False

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

import fitz  # PyMuPDF
from PIL import Image, ImageTk
from google import genai
from google.genai import types

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


SYSTEM_INSTRUCTION = """You are an expert Hindi linguist, educator, and OCR specialist for Indian school curricula (CBSE, ICSE, State Boards).
Your task is to take a Hindi worksheet page (image or scanned PDF page) and output:
1. Cleaned, grammatically flawless Hindi text in Devanagari script (correcting any broken conjuncts, missing matras, or OCR artifacts).
2. English phonetic pronunciation for each sentence and word (e.g. 'Bādal', 'apnē sāth', 'tūfān').
3. Accurate word-by-word English translation matching the context.
4. Fluent complete sentence English translation.
5. Identification of worksheet sections and question-answer pairs.

Return strictly structured JSON matching the provided schema.
"""

HINDI_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "worksheetTitle": {"type": "STRING"},
        "school": {"type": "STRING"},
        "grade": {"type": "STRING"},
        "subject": {"type": "STRING"},
        "sections": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "sectionTitleKannada": {"type": "STRING", "description": "Section title in Hindi Devanagari"},
                    "sectionTitlePronunciation": {"type": "STRING"},
                    "sectionTitleEnglish": {"type": "STRING"},
                    "items": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "itemNumber": {"type": "STRING"},
                                "type": {"type": "STRING", "description": "vocabulary | question | answer | sentence"},
                                "kannadaText": {"type": "STRING", "description": "Hindi sentence text in Devanagari"},
                                "englishPronunciation": {"type": "STRING"},
                                "englishTranslation": {"type": "STRING"},
                                "words": {
                                    "type": "ARRAY",
                                    "items": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "kannada": {"type": "STRING", "description": "Hindi word in Devanagari"},
                                            "pronunciation": {"type": "STRING"},
                                            "englishMeaning": {"type": "STRING"},
                                            "grammaticalRole": {"type": "STRING"}
                                        },
                                        "required": ["kannada", "pronunciation", "englishMeaning"]
                                    }
                                }
                            },
                            "required": ["kannadaText", "englishPronunciation", "englishTranslation", "words"]
                        }
                    }
                },
                "required": ["sectionTitleKannada", "items"]
            }
        }
    },
    "required": ["worksheetTitle", "sections"]
}

CONFIG_FILE = Path.home() / ".hindi_worksheet_translator_config.json"
FONT_DIR = Path.home() / ".hindi_fonts"
FONT_PATH = FONT_DIR / "NotoSansDevanagari-Regular.ttf"
FONT_BOLD_PATH = FONT_DIR / "NotoSansDevanagari-Bold.ttf"


def ensure_devanagari_fonts():
    try:
        FONT_DIR.mkdir(parents=True, exist_ok=True)
        if not FONT_PATH.exists():
            url = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf"
            urllib.request.urlretrieve(url, FONT_PATH)

        if not FONT_BOLD_PATH.exists():
            url_bold = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf"
            urllib.request.urlretrieve(url_bold, FONT_BOLD_PATH)

        if FONT_PATH.exists():
            pdfmetrics.registerFont(TTFont("NotoSansDevanagari", str(FONT_PATH)))
        if FONT_BOLD_PATH.exists():
            pdfmetrics.registerFont(TTFont("NotoSansDevanagari-Bold", str(FONT_BOLD_PATH)))
        return True
    except Exception as e:
        return False


class HindiTranslatorApp:
    def __init__(self):
        ensure_devanagari_fonts()

        if HAS_CUSTOMTKINTER:
            ctk.set_appearance_mode("System")
            ctk.set_default_color_theme("blue")
            self.root = ctk.CTk()
        else:
            self.root = tk.Tk()

        self.root.title("Hindi Worksheet PDF Translator (Windows)")
        self.root.geometry("1024x768")
        self.pdf_path = None
        self.parsed_pages_data = []

        header = tk.Frame(self.root, bg="#1e1b4b", padx=20, pady=16)
        header.pack(fill="x")
        tk.Label(header, text="हिंदी Hindi Worksheet Study Guide & PDF Builder", font=("Segoe UI", 16, "bold"), fg="#f8fafc", bg="#1e1b4b").pack(anchor="w")

        ctrl = tk.LabelFrame(self.root, text=" 1. Worksheet & Key ", padx=15, pady=10)
        ctrl.pack(fill="x", padx=16, pady=8)

        tk.Label(ctrl, text="Gemini API Key:").grid(row=0, column=0, sticky="w", pady=4)
        self.entry_key = ttk.Entry(ctrl, width=45, show="*")
        self.entry_key.grid(row=0, column=1, sticky="w", padx=8, pady=4)
        self.entry_key.insert(0, os.environ.get("GEMINI_API_KEY", ""))

        tk.Label(ctrl, text="Hindi File:").grid(row=1, column=0, sticky="w", pady=4)
        self.lbl_file = ttk.Label(ctrl, text="No PDF or Image selected yet", foreground="#64748b")
        self.lbl_file.grid(row=1, column=1, sticky="w", padx=8, pady=4)

        ttk.Button(ctrl, text="Browse...", command=self.browse).grid(row=1, column=2, padx=4)

        btn_bar = tk.Frame(self.root, padx=16, pady=4)
        btn_bar.pack(fill="x")
        self.btn_proc = tk.Button(btn_bar, text="▶ Process Hindi Worksheet", command=self.process, bg="#4f46e5", fg="white", font=("Segoe UI", 10, "bold"), padx=12, pady=6)
        self.btn_proc.pack(side="left", padx=4)
        self.btn_exp = tk.Button(btn_bar, text="⬇ Export Hindi Study PDF...", command=self.export_pdf, state="disabled", bg="#059669", fg="white", font=("Segoe UI", 10, "bold"), padx=12, pady=6)
        self.btn_exp.pack(side="left", padx=4)

        self.txt = tk.Text(self.root, wrap="word", font=("Segoe UI", 10))
        self.txt.pack(fill="both", expand=True, padx=16, pady=8)

    def browse(self):
        f = filedialog.askopenfilename(filetypes=[("PDF/Images", "*.pdf;*.png;*.jpg;*.jpeg")])
        if f:
            self.pdf_path = f
            self.lbl_file.config(text=os.path.basename(f))

    def process(self):
        key = self.entry_key.get().strip()
        if not key or not self.pdf_path:
            messagebox.showerror("Error", "Please provide API Key and File")
            return
        threading.Thread(target=self._run_proc, args=(key,), daemon=True).start()

    def _run_proc(self, key):
        try:
            client = genai.Client(api_key=key)
            doc = fitz.open(self.pdf_path) if self.pdf_path.endswith(".pdf") else None
            pages = []
            if doc:
                for p in range(len(doc)):
                    pix = doc[p].get_pixmap(dpi=200)
                    resp = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=[types.Part.from_bytes(data=pix.tobytes("jpeg"), mime_type="image/jpeg"), types.Part.from_text(text="Extract Hindi worksheet.")],
                        config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION, response_mime_type="application/json", response_schema=HINDI_SCHEMA)
                    )
                    pages.append(json.loads(resp.text))
            self.parsed_pages_data = pages
            self.root.after(0, lambda: self.btn_exp.config(state="normal"))
            self.root.after(0, lambda: self.txt.insert("1.0", json.dumps(pages, indent=2, ensure_ascii=False)))
            messagebox.showinfo("Done", "Hindi worksheet processed!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def export_pdf(self):
        out = filedialog.asksaveasfilename(defaultextension=".pdf")
        if not out: return
        doc = SimpleDocTemplate(out, pagesize=A4)
        story = [Paragraph("<b>Hindi Worksheet Study Guide</b>", getSampleStyleSheet()['Heading1'])]
        for page in self.parsed_pages_data:
            for sec in page.get("sections", []):
                story.append(Paragraph(sec.get("sectionTitleKannada", ""), getSampleStyleSheet()['Heading2']))
                for itm in sec.get("items", []):
                    story.append(Paragraph(f"<b>{itm.get('kannadaText')}</b>", getSampleStyleSheet()['Normal']))
                    story.append(Paragraph(f"Pronunciation: {itm.get('englishPronunciation')}", getSampleStyleSheet()['Italic']))
                    story.append(Paragraph(f"English: {itm.get('englishTranslation')}", getSampleStyleSheet()['Normal']))
                    story.append(Spacer(1, 6))
        doc.build(story)
        messagebox.showinfo("Saved", f"Saved to {out}")

if __name__ == "__main__":
    app = HindiTranslatorApp()
    app.root.mainloop()
`;

