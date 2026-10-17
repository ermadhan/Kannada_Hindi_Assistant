"""
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
    """Downloads Google Noto Sans Devanagari font if not locally present for ReportLab PDF rendering."""
    try:
        FONT_DIR.mkdir(parents=True, exist_ok=True)
        if not FONT_PATH.exists():
            print("Downloading Noto Sans Devanagari font for PDF generation...")
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
        print(f"Warning: Could not fetch Noto Sans Devanagari font: {e}")
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
        self.root.minsize(850, 600)

        self.pdf_path = None
        self.parsed_pages_data = []

        self.build_ui()

    def build_ui(self):
        header = tk.Frame(self.root, bg="#1e1b4b", padx=20, pady=16)
        header.pack(fill="x")

        lbl_title = tk.Label(
            header,
            text="हिंदी Hindi Worksheet Study Guide & PDF Builder",
            font=("Segoe UI", 16, "bold"),
            fg="#f8fafc",
            bg="#1e1b4b"
        )
        lbl_title.pack(anchor="w")

        lbl_sub = tk.Label(
            header,
            text="Extracts Hindi Devanagari worksheets, provides word-by-word English translation & pronunciation, and builds PDFs",
            font=("Segoe UI", 10),
            fg="#c7d2fe",
            bg="#1e1b4b"
        )
        lbl_sub.pack(anchor="w")

        # Setup panel
        ctrl_frame = tk.LabelFrame(self.root, text=" 1. Setup & Hindi Worksheet Selection ", padx=15, pady=10)
        ctrl_frame.pack(fill="x", padx=16, pady=8)

        tk.Label(ctrl_frame, text="Gemini API Key:").grid(row=0, column=0, sticky="w", pady=4)
        self.entry_key = ttk.Entry(ctrl_frame, width=45, show="*")
        self.entry_key.grid(row=0, column=1, sticky="w", padx=8, pady=4)
        saved_key = load_saved_key()
        if saved_key:
            self.entry_key.insert(0, saved_key)

        btn_save_key = ttk.Button(ctrl_frame, text="Save Key", command=self.save_api_key_clicked)
        btn_save_key.grid(row=0, column=2, sticky="w", padx=4, pady=4)

        tk.Label(ctrl_frame, text="Hindi Worksheet:").grid(row=1, column=0, sticky="w", pady=4)
        self.lbl_file = ttk.Label(ctrl_frame, text="No PDF or Image selected yet", foreground="#64748b")
        self.lbl_file.grid(row=1, column=1, sticky="w", padx=8, pady=4)

        btn_browse = ttk.Button(ctrl_frame, text="Browse PDF / Image...", command=self.browse_file)
        btn_browse.grid(row=1, column=2, sticky="w", padx=4, pady=4)

        btn_bar = tk.Frame(self.root, padx=16, pady=4)
        btn_bar.pack(fill="x")

        self.btn_process = tk.Button(
            btn_bar,
            text="▶ 2. Process Hindi Worksheet with Gemini Vision",
            command=self.start_processing_thread,
            bg="#4f46e5",
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

        self.progress_bar = ttk.Progressbar(self.root, mode="indeterminate")
        self.lbl_status = tk.Label(self.root, text="Ready. Select a Hindi PDF worksheet to begin.", fg="#334155")
        self.lbl_status.pack(fill="x", padx=20, pady=4)

        # Notebook
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=16, pady=8)

        self.tab_preview = tk.Frame(self.notebook)
        self.notebook.add(self.tab_preview, text="📖 Study Breakdown Preview")
        self.txt_preview = tk.Text(self.tab_preview, wrap="word", font=("Segoe UI", 10))
        scroll_p = ttk.Scrollbar(self.tab_preview, orient="vertical", command=self.txt_preview.yview)
        self.txt_preview.configure(yscrollcommand=scroll_p.set)
        self.txt_preview.pack(side="left", fill="both", expand=True)
        scroll_p.pack(side="right", fill="y")

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
            messagebox.showinfo("Saved", "Gemini API key saved.")

    def browse_file(self):
        path = filedialog.askopenfilename(
            title="Select Hindi Worksheet PDF or Image",
            filetypes=[("PDF/Images", "*.pdf;*.png;*.jpg;*.jpeg;*.webp")]
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
            messagebox.showerror("File Required", "Please select a file first.")
            return

        save_key(api_key)
        self.btn_process.config(state="disabled")
        self.btn_export.config(state="disabled")
        self.progress_bar.pack(fill="x", padx=20, pady=4)
        self.progress_bar.start(10)
        self.lbl_status.config(text="Processing Hindi worksheet with Gemini Vision AI...", fg="#4f46e5")

        threading.Thread(target=self.process_file, args=(api_key,), daemon=True).start()

    def process_file(self, api_key: str):
        try:
            client = genai.Client(api_key=api_key)
            results = []

            if self.pdf_path.lower().endswith(".pdf"):
                doc = fitz.open(self.pdf_path)
                for page_num in range(len(doc)):
                    self.update_status_thread(f"Processing Page {page_num + 1} of {len(doc)}...")
                    page = doc[page_num]
                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("jpeg")

                    page_data = self.call_gemini_vision(client, img_bytes, f"Hindi Page {page_num + 1}")
                    page_data["pageNumber"] = page_num + 1
                    results.append(page_data)
            else:
                self.update_status_thread("Processing Hindi page image...")
                with open(self.pdf_path, "rb") as f:
                    img_bytes = f.read()
                page_data = self.call_gemini_vision(client, img_bytes, "Hindi Page 1")
                page_data["pageNumber"] = 1
                results.append(page_data)

            self.parsed_pages_data = results
            self.root.after(0, self.on_processing_success)
        except Exception as e:
            self.root.after(0, self.on_processing_error, str(e))

    def update_status_thread(self, text):
        self.root.after(0, lambda: self.lbl_status.config(text=text, fg="#4f46e5"))

    def call_gemini_vision(self, client: genai.Client, img_bytes: bytes, page_label: str) -> dict:
        prompt = (
            f"Analyze this Hindi worksheet ({page_label}). Perform precise Hindi Devanagari OCR, "
            "correct any matra or conjunct errors, and break down each sentence word-by-word with "
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
                response_schema=HINDI_SCHEMA
            )
        )
        return json.loads(response.text)

    def on_processing_success(self):
        self.progress_bar.stop()
        self.progress_bar.pack_forget()
        self.btn_process.config(state="normal")
        self.btn_export.config(state="normal")
        self.lbl_status.config(text=f"Success! Processed {len(self.parsed_pages_data)} Hindi page(s).", fg="#059669")

        self.txt_json.delete("1.0", "end")
        self.txt_json.insert("1.0", json.dumps(self.parsed_pages_data, indent=2, ensure_ascii=False))

        self.txt_preview.delete("1.0", "end")
        for page in self.parsed_pages_data:
            p_num = page.get("pageNumber", 1)
            title = page.get("worksheetTitle", "Hindi Worksheet")
            self.txt_preview.insert("end", f"================ PAGE {p_num}: {title} ================\\n\\n")

            for sec in page.get("sections", []):
                self.txt_preview.insert("end", f"### {sec.get('sectionTitleKannada')} ###\\n\\n")
                for itm in sec.get("items", []):
                    self.txt_preview.insert("end", f"• Hindi: {itm.get('kannadaText')}\\n")
                    self.txt_preview.insert("end", f"  Pronunciation: {itm.get('englishPronunciation')}\\n")
                    self.txt_preview.insert("end", f"  Translation:   {itm.get('englishTranslation')}\\n")
                    self.txt_preview.insert("end", "  [Word-by-Word]:\\n")
                    for w in itm.get("words", []):
                        self.txt_preview.insert(
                            "end",
                            f"    - {w.get('kannada')} [{w.get('pronunciation')}]: {w.get('englishMeaning')}\\n"
                        )
                    self.txt_preview.insert("end", "\\n")

    def on_processing_error(self, err: str):
        self.progress_bar.stop()
        self.progress_bar.pack_forget()
        self.btn_process.config(state="normal")
        self.lbl_status.config(text=f"Error: {err}", fg="#dc2626")
        messagebox.showerror("Error", str(err))

    def export_pdf_clicked(self):
        if not self.parsed_pages_data:
            return

        out_path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF files", "*.pdf")],
            title="Save Translated Hindi Study PDF"
        )
        if not out_path:
            return

        try:
            self.build_reportlab_pdf(out_path)
            messagebox.showinfo("Success", f"Hindi Study PDF saved to:\\n{out_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate PDF: {e}")

    def build_reportlab_pdf(self, out_path: str):
        doc = SimpleDocTemplate(out_path, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
        font_name = "NotoSansDevanagari" if FONT_PATH.exists() else "Helvetica"
        font_bold = "NotoSansDevanagari-Bold" if FONT_BOLD_PATH.exists() else "Helvetica-Bold"

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('HTitle', fontName=font_bold, fontSize=16, leading=20, textColor=colors.HexColor('#1e1b4b'))
        sec_style = ParagraphStyle('HSec', fontName=font_bold, fontSize=12, leading=16, textColor=colors.HexColor('#4f46e5'), spaceBefore=10, spaceAfter=4)
        hindi_style = ParagraphStyle('HHindi', fontName=font_bold, fontSize=11, leading=15, textColor=colors.HexColor('#0f172a'))
        pronounce_style = ParagraphStyle('HPron', fontName='Helvetica-Oblique', fontSize=9, textColor=colors.HexColor('#0f766e'))
        meaning_style = ParagraphStyle('HMean', fontName='Helvetica', fontSize=9.5, textColor=colors.HexColor('#312e81'))

        story = []
        for p_idx, page in enumerate(self.parsed_pages_data):
            if p_idx > 0:
                story.append(PageBreak())

            title = page.get("worksheetTitle", "Hindi Worksheet Study Guide")
            story.append(Paragraph(f"<b>{title}</b>", title_style))
            story.append(Spacer(1, 8))

            for sec in page.get("sections", []):
                story.append(Paragraph(sec.get('sectionTitleKannada', ''), sec_style))
                story.append(Spacer(1, 4))

                for item in sec.get("items", []):
                    item_elements = []
                    item_elements.append(Paragraph(f"<b>{item.get('kannadaText', '')}</b>", hindi_style))
                    item_elements.append(Paragraph(f"Pronunciation: {item.get('englishPronunciation', '')}", pronounce_style))
                    item_elements.append(Paragraph(f"English: {item.get('englishTranslation', '')}", meaning_style))
                    item_elements.append(Spacer(1, 3))

                    table_rows = [["Hindi Word", "Pronunciation", "English Meaning"]]
                    for w in item.get("words", []):
                        table_rows.append([
                            Paragraph(w.get("kannada", ""), hindi_style),
                            w.get("pronunciation", ""),
                            w.get("englishMeaning", "")
                        ])

                    tbl = Table(table_rows, colWidths=[140, 160, 220])
                    tbl.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
                        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
                        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0,0), (-1,-1), 8.5),
                        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                    ]))
                    item_elements.append(tbl)
                    item_elements.append(Spacer(1, 8))
                    story.append(KeepTogether(item_elements))

        doc.build(story)


def main():
    app = HindiTranslatorApp()
    app.root.mainloop()


if __name__ == "__main__":
    main()
