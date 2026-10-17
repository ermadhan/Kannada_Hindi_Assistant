import React from 'react';
import { BookOpen, FileText, Monitor, HelpCircle, UploadCloud, FileDown, FolderOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'trial' | 'pdf-preview' | 'windows-app' | 'clarifications' | 'custom-upload' | 'library';
  setActiveTab: (tab: 'trial' | 'pdf-preview' | 'windows-app' | 'clarifications' | 'custom-upload' | 'library') => void;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
  currentLanguage: 'kannada' | 'hindi';
  onSelectLanguage: (lang: 'kannada' | 'hindi') => void;
  storedWorksheetsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadPdf,
  isDownloadingPdf,
  currentLanguage,
  onSelectLanguage,
  storedWorksheetsCount = 0,
}) => {
  const isHindi = currentLanguage === 'hindi';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-lg ${
                isHindi
                  ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-indigo-600/20 font-hindi'
                  : 'bg-gradient-to-tr from-amber-600 to-red-600 shadow-amber-600/20 font-kannada'
              }`}
            >
              {isHindi ? 'हिं' : 'ಕ'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {isHindi ? 'Hindi' : 'Kannada'} Worksheet PDF Studio
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  AI Studio Live
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sentence & word-by-word English translation, pronunciation guide, and PDF builder
              </p>
            </div>
          </div>

          {/* Language Switcher & Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher Pill */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => onSelectLanguage('kannada')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  !isHindi
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-kannada font-bold">ಕನ್ನಡ</span>
                <span className="hidden sm:inline">Kannada</span>
              </button>
              <button
                onClick={() => onSelectLanguage('hindi')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  isHindi
                    ? 'bg-white text-indigo-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-hindi font-bold">हिंदी</span>
                <span className="hidden sm:inline">Hindi</span>
              </button>
            </div>

            <button
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-600/20 cursor-pointer active:scale-98"
            >
              <FileDown className="w-4 h-4 text-white" />
              <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-100 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('trial')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'trial'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>1. Example Worksheet ({isHindi ? 'Hindi' : 'Kannada'})</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf-preview')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pdf-preview'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>2. Formatted PDF Sheet Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('clarifications')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'clarifications'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>3. OCR & Layout Clarifications</span>
          </button>

          <button
            onClick={() => setActiveTab('windows-app')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'windows-app'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-600" />
            <span>4. Windows Desktop App (Python)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom-upload')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'custom-upload'
                ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-violet-600" />
            <span>5. Process New {isHindi ? 'Hindi' : 'Kannada'} PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'library'
                ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span>6. Stored Library</span>
            {storedWorksheetsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                {storedWorksheetsCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
