import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileCode,
  Cpu,
  Type,
  Layout,
  ArrowRight,
} from 'lucide-react';

interface ClarificationViewProps {
  onGoToTrial: () => void;
  onGoToWindowsApp: () => void;
}

export const ClarificationView: React.FC<ClarificationViewProps> = ({
  onGoToTrial,
  onGoToWindowsApp,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Technical Clarifications: Layout, OCR & Windows Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Key engineering decisions before finalizing the Windows Python / C# desktop application
            </p>
          </div>
        </div>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-3">
          Translating Kannada worksheets into study guides involves three core challenges:
          <strong> complex script OCR (Ottaksharas)</strong>,
          <strong> multi-layered layout design (word-by-word gloss)</strong>, and
          <strong> proper Indic font shaping in Windows PDF generation</strong>. Here is the breakdown and trial verification.
        </p>
      </div>

      {/* 1. OCR Processing Clarification */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              OCR Processing: Why Traditional OCR Failed & How We Handle It
            </h3>
            <p className="text-xs text-slate-500">
              Analysis of the raw OCR text provided in your initial prompt
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
            <div className="flex items-center space-x-2 text-red-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Issues in Traditional OCR (Tesseract / EasyOCR):</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 pl-1">
              <li>
                <span className="font-semibold text-red-900">Broken Conjuncts (Ottakshara):</span>
                <br />
                Scanned <code>ಕುಲಗೋತ್ರ</code> became <code>ಕುಲಗೆ ೋತರ</code>; <code>ಆಪತ್ತು</code> became <code>ಆಪತುು</code>.
              </li>
              <li>
                <span className="font-semibold text-red-900">Vowel Diacritic Splitting:</span>
                <br />
                <code>ಕೊಟ್ಟಿದ್ದು</code> became <code>ಕೆ ಟ್ಟಟದುು</code>; <code>ಜ್ಯೋತಿಯು</code> became <code>ಜೆ ಯೋತಿಯು</code>.
              </li>
              <li>
                <span className="font-semibold text-red-900">Confused Consonants:</span>
                <br />
                <code>ವ</code> (va) misidentified as <code>ರ</code> (ra) in <code>ವಂಶ</code> → <code>ರ್ಂಶ</code> and <code>ಯಾವುದು</code> → <code>ಯಾರ್ುದು</code>.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Our Vision AI Pipeline Solution:</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 pl-1">
              <li>
                <span className="font-semibold text-emerald-900">Multimodal Context Understanding:</span>
                <br />
                Gemini Vision analyzes the full visual layout alongside linguistic grammar rules, recognizing words holistically.
              </li>
              <li>
                <span className="font-semibold text-emerald-900">Automatic Ligature Normalization:</span>
                <br />
                All Kannada Unicode characters are unified into valid UTF-8 character sequences without fragmented combining characters.
              </li>
              <li>
                <span className="font-semibold text-emerald-900">Instant Word Segmentation:</span>
                <br />
                Compound words (e.g. <code>ಕುಲಗೋತ್ರ</code> = <code>ಕುಲ</code> + <code>ಗೋತ್ರ</code>) and sandhi forms are cleanly split for individual English translation.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. PDF Layout Strategy */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              PDF Layout Options: How Should the New PDF Look?
            </h3>
            <p className="text-xs text-slate-500">
              Three layout paradigms implemented in our trial run for your selection
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              <Layout className="w-4 h-4 text-amber-600" />
              <span>Option A: Interlinear Gloss</span>
            </div>
            <p className="text-slate-600">
              Each Kannada word is accompanied directly beneath by its phonetic pronunciation badge and its English meaning.
            </p>
            <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] space-y-1">
              <div className="text-slate-900 font-bold font-kannada">ಸರ್ವಜ್ಞನು</div>
              <div className="text-teal-700">[sar-vaj-ña-nu]</div>
              <div className="text-amber-800">Sarvajna poet</div>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              Best for: Grade 4 students learning to read and pronounce words in context.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Option B: Structured Table</span>
            </div>
            <p className="text-slate-600">
              The full Kannada sentence is displayed at the top, followed by a 3-column vocabulary table and a complete fluent English translation.
            </p>
            <div className="bg-white p-2 rounded border border-slate-200 text-[10px]">
              <div className="font-bold border-b pb-1">Kannada | Pronounce | Meaning</div>
              <div className="text-slate-600 pt-1">ಗರ್ವ | gar-va | Pride</div>
            </div>
            <p className="text-[11px] text-blue-700 font-medium">
              Best for: Exam preparation, revision notes, and traditional worksheet printing.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Option C: Side-by-Side Dual</span>
            </div>
            <p className="text-slate-600">
              Left half retains the original worksheet layout; right half provides matching transliteration and line-by-line translation.
            </p>
            <div className="bg-white p-2.5 rounded border border-slate-200 text-[10px] grid grid-cols-2 gap-1">
              <div className="border-r pr-1 font-kannada">೧. ಯಾರ ಮನೆಯ...</div>
              <div className="text-slate-600">1. Whose house lamp...</div>
            </div>
            <p className="text-[11px] text-indigo-700 font-medium">
              Best for: Bilingual comparison and teacher reference materials.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Windows Implementation: Python vs C# */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Windows Native Application: Python vs C# Recommendation
            </h3>
            <p className="text-xs text-slate-500">
              How Indic font shaping & PDF rasterization behave in Windows desktop environments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Python Architecture (Recommended)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Easiest Setup</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li><strong>GUI:</strong> Tkinter (built into Python on Windows) or CustomTkinter (modern dark/light mode).</li>
              <li><strong>PDF Rasterization:</strong> <code>PyMuPDF</code> (fitz) renders PDF pages to images in ~20 milliseconds.</li>
              <li><strong>AI Engine:</strong> Official <code>google-genai</code> Python SDK.</li>
              <li><strong>PDF Output & Font Shaping:</strong> ReportLab or HTML-to-PDF with <code>Noto Sans Kannada</code>.</li>
              <li><strong>Packaging:</strong> Single executable <code>.exe</code> created in one command via <code>pyinstaller --onefile</code>.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">C# .NET 8 WPF Architecture</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Enterprise Performance</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li><strong>GUI:</strong> Windows Presentation Foundation (WPF) with modern XAML styling.</li>
              <li><strong>PDF Generation:</strong> <code>QuestPDF</code> (powered by SkiaSharp) provides automatic HarfBuzz complex font shaping for Kannada ligatures out-of-the-box.</li>
              <li><strong>AI Engine:</strong> Direct HTTP calls via <code>HttpClient</code> to Gemini REST API.</li>
              <li><strong>Deployment:</strong> Self-contained .NET single-file publish (requires no .NET runtime installation on user PC).</li>
            </ul>
          </div>
        </div>

        {/* Action button to explore code */}
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={onGoToTrial}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Explore Example Trial Run (DPS Class IV)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGoToWindowsApp}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Get Windows Python / C# Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
