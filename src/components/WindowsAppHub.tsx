import React, { useState } from 'react';
import { windowsPythonScript, windowsHindiPythonScript } from '../data/windowsPythonAppCode';
import { windowsCSharpCode } from '../data/windowsCSharpAppCode';
import {
  Monitor,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const WindowsAppHub: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'python-kannada' | 'python-hindi' | 'csharp'>('python-kannada');
  const [copied, setCopied] = useState(false);

  let activeCode = windowsPythonScript;
  if (selectedLang === 'python-hindi') activeCode = windowsHindiPythonScript;
  if (selectedLang === 'csharp') activeCode = windowsCSharpCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPythonKannada = () => {
    const blob = new Blob([windowsPythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kannada_worksheet_translator.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPythonHindi = () => {
    const blob = new Blob([windowsHindiPythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hindi_worksheet_translator.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRequirements = () => {
    const reqs = `google-genai>=2.4.0
pymupdf>=1.23.0
reportlab>=4.1.0
pillow>=10.0.0
`;
    const blob = new Blob([reqs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows Desktop Application Source</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Native Windows Application (Python & C# WPF)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Standalone GUI desktop apps for both Kannada and Hindi worksheets with Gemini Vision OCR and PDF export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPythonKannada}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Kannada Python App (.py)</span>
            </button>
            <button
              onClick={handleDownloadPythonHindi}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Hindi Python App (.py)</span>
            </button>
            <button
              onClick={handleDownloadRequirements}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Windows Quick Start Guide */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>Quick Setup on Windows (3 Easy Steps)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Install Python Packages</span>
            </div>
            <pre className="bg-slate-900 text-emerald-300 p-2 rounded text-[11px] overflow-x-auto mt-1 font-mono">
              pip install google-genai pymupdf reportlab pillow
            </pre>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Set Your Gemini Key</span>
            </div>
            <pre className="bg-slate-900 text-emerald-300 p-2 rounded text-[11px] overflow-x-auto mt-1 font-mono">
              setx GEMINI_API_KEY "YOUR_KEY"
            </pre>
            <p className="text-[10px] text-slate-500">Or type it directly in the app GUI input box.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Launch Desktop GUI</span>
            </div>
            <pre className="bg-slate-900 text-emerald-300 p-2 rounded text-[11px] overflow-x-auto mt-1 font-mono">
              python {selectedLang === 'python-hindi' ? 'hindi_worksheet_translator.py' : 'kannada_worksheet_translator.py'}
            </pre>
          </div>
        </div>
      </div>

      {/* Code Viewer & Language Switcher */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        {/* Code Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-wrap bg-slate-800 p-1 rounded-lg text-xs gap-1">
              <button
                onClick={() => setSelectedLang('python-kannada')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedLang === 'python-kannada' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python (Kannada App)
              </button>
              <button
                onClick={() => setSelectedLang('python-hindi')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedLang === 'python-hindi' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python (Hindi App)
              </button>
              <button
                onClick={() => setSelectedLang('csharp')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedLang === 'csharp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                C# (.NET 8 WPF)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="p-4 overflow-x-auto max-h-[500px] text-xs font-mono text-slate-200 leading-relaxed scrollbar-thin">
          <pre>{activeCode}</pre>
        </div>
      </div>
    </div>
  );
};

