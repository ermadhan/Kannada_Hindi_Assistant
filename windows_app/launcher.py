"""
Kannada & Hindi Worksheet Assistant - Desktop Launcher
Provides a unified desktop entry point to launch either the Kannada or Hindi worksheet translator.
"""

import os
import sys
import subprocess
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox

APP_DIR = Path(__file__).resolve().parent


def launch_kannada():
    script = APP_DIR / "kannada_worksheet_translator.py"
    subprocess.Popen([sys.executable, str(script)], cwd=str(APP_DIR))


def launch_hindi():
    script = APP_DIR / "hindi_worksheet_translator.py"
    subprocess.Popen([sys.executable, str(script)], cwd=str(APP_DIR))


def open_build_folder():
    dist_dir = APP_DIR / "dist"
    if not dist_dir.exists():
        messagebox.showinfo(
            "Build Folder",
            "The 'dist' folder has not been created yet. Run 'build_exe.bat' to generate the standalone .exe binaries.",
        )
        return
    os.startfile(str(dist_dir))


def main():
    root = tk.Tk()
    root.title("Kannada & Hindi Assistant - Windows Desktop")
    root.geometry("520x420")
    root.resizable(False, False)
    root.configure(bg="#f8fafc")

    # Header
    header_frame = tk.Frame(root, bg="#1e293b", padx=20, pady=20)
    header_frame.pack(fill="x")

    lbl_title = tk.Label(
        header_frame,
        text="Worksheet Study Guide Assistant",
        font=("Segoe UI", 16, "bold"),
        fg="#ffffff",
        bg="#1e293b",
    )
    lbl_title.pack(anchor="w")

    lbl_subtitle = tk.Label(
        header_frame,
        text="Kannada & Hindi PDF / Image OCR, Phonetics, and Study Guide Builder",
        font=("Segoe UI", 9),
        fg="#94a3b8",
        bg="#1e293b",
    )
    lbl_subtitle.pack(anchor="w", pady=(4, 0))

    # Body
    body_frame = tk.Frame(root, bg="#f8fafc", padx=30, pady=24)
    body_frame.pack(fill="both", expand=True)

    lbl_choose = tk.Label(
        body_frame,
        text="Select the language module to launch:",
        font=("Segoe UI", 11, "bold"),
        fg="#334155",
        bg="#f8fafc",
    )
    lbl_choose.pack(anchor="w", pady=(0, 16))

    # Kannada button
    btn_kannada = tk.Button(
        body_frame,
        text=" Launch Kannada Worksheet Translator (ಕನ್ನಡ)",
        font=("Segoe UI", 11, "bold"),
        bg="#0284c7",
        fg="white",
        activebackground="#0369a1",
        activeforeground="white",
        relief="flat",
        cursor="hand2",
        padx=12,
        pady=10,
        command=launch_kannada,
    )
    btn_kannada.pack(fill="x", pady=6)

    # Hindi button
    btn_hindi = tk.Button(
        body_frame,
        text=" Launch Hindi Worksheet Translator (हिंदी)",
        font=("Segoe UI", 11, "bold"),
        bg="#ea580c",
        fg="white",
        activebackground="#c2410c",
        activeforeground="white",
        relief="flat",
        cursor="hand2",
        padx=12,
        pady=10,
        command=launch_hindi,
    )
    btn_hindi.pack(fill="x", pady=6)

    # Separator
    sep = ttk.Separator(body_frame, orient="horizontal")
    sep.pack(fill="x", pady=18)

    # Secondary actions
    action_frame = tk.Frame(body_frame, bg="#f8fafc")
    action_frame.pack(fill="x")

    btn_dist = tk.Button(
        action_frame,
        text="Open Executable (dist) Folder",
        font=("Segoe UI", 9),
        bg="#e2e8f0",
        fg="#1e293b",
        relief="flat",
        cursor="hand2",
        padx=8,
        pady=6,
        command=open_build_folder,
    )
    btn_dist.pack(side="left")

    btn_exit = tk.Button(
        action_frame,
        text="Exit",
        font=("Segoe UI", 9),
        bg="#f1f5f9",
        fg="#64748b",
        relief="flat",
        cursor="hand2",
        padx=12,
        pady=6,
        command=root.destroy,
    )
    btn_exit.pack(side="right")

    # Status footnote
    lbl_foot = tk.Label(
        root,
        text="Powered by Google Gemini Vision AI & ReportLab",
        font=("Segoe UI", 8),
        fg="#94a3b8",
        bg="#f8fafc",
    )
    lbl_foot.pack(side="bottom", pady=10)

    root.mainloop()


if __name__ == "__main__":
    main()
