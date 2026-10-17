import React, { useState } from 'react';
import { WorksheetData, WorksheetItem } from '../types/worksheet';
import { AudioPronounceButton } from './AudioPronounceButton';
import {
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Columns,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
} from 'lucide-react';

interface TrialRunViewerProps {
  worksheet: WorksheetData;
  onGoToPdfPreview: () => void;
}

export type LayoutMode = 'interlinear' | 'table' | 'side-by-side';

export const TrialRunViewer: React.FC<TrialRunViewerProps> = ({ worksheet, onGoToPdfPreview }) => {
  const [selectedPage, setSelectedPage] = useState<'all' | '1' | '2'>('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('interlinear');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOcrId, setExpandedOcrId] = useState<string | null>(null);

  const isHindi = /[\u0900-\u097F]/.test(worksheet.titleKannada);
  const scriptFont = isHindi ? 'font-hindi' : 'font-kannada';

  const toggleOcr = (id: string) => {
    setExpandedOcrId(expandedOcrId === id ? null : id);
  };

  const filteredSections = worksheet.sections.filter((section) => {
    if (selectedPage === '1' && section.page !== 1) return false;
    if (selectedPage === '2' && section.page !== 2) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Trial Run Info & Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{worksheet.chapterName ? `Chapter: ${worksheet.chapterName}` : 'Worksheet Verified'}</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${scriptFont} tracking-wide`}>
              {worksheet.titleKannada}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              {worksheet.titlePronunciation} • <span className="text-amber-300">{worksheet.titleEnglish}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-slate-200 font-medium">📚 {worksheet.subject}</span>
              {worksheet.date && (
                <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-emerald-400 font-medium">📅 {worksheet.date}</span>
              )}
              {worksheet.school && (
                <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">🏫 {worksheet.school}</span>
              )}
              {worksheet.grade && (
                <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">🎓 {worksheet.grade}</span>
              )}
            </div>
            {worksheet.description && (
              <p className="text-xs text-slate-300 pt-1 border-t border-slate-700/60 italic max-w-3xl">
                {worksheet.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0">
            <button
              onClick={onGoToPdfPreview}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>View Generated PDF Output</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Page filter, Search, Layout mode */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Page Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setSelectedPage('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedPage === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Pages (1 & 2)
          </button>
          <button
            onClick={() => setSelectedPage('1')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedPage === '1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Page 1 (Sec I & II)
          </button>
          <button
            onClick={() => setSelectedPage('2')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedPage === '2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Page 2 (Sec III Long Ans)
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Kannada word, pronunciation, or English meaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg self-end sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase px-2 hidden lg:inline">Layout:</span>
          <button
            onClick={() => setLayoutMode('interlinear')}
            title="Interlinear Gloss (Under-Word)"
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              layoutMode === 'interlinear'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Interlinear</span>
          </button>
          <button
            onClick={() => setLayoutMode('table')}
            title="Structured Vocabulary Table"
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              layoutMode === 'table'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table Grid</span>
          </button>
          <button
            onClick={() => setLayoutMode('side-by-side')}
            title="Parallel Side-by-Side Dual Column"
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              layoutMode === 'side-by-side'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {filteredSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              item.kannadaText.toLowerCase().includes(q) ||
              item.englishPronunciation.toLowerCase().includes(q) ||
              item.englishTranslation.toLowerCase().includes(q) ||
              item.words.some(
                (w) =>
                  w.kannada.toLowerCase().includes(q) ||
                  w.pronunciation.toLowerCase().includes(q) ||
                  w.englishMeaning.toLowerCase().includes(q)
              )
            );
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.id} className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              {/* Section Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 uppercase">
                      Page {section.page}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-kannada">
                      {section.titleKannada}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    <span className="text-amber-800">{section.titlePronunciation}</span> — {section.titleEnglish}
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 p-6 space-y-6">
                {visibleItems.map((item) => (
                  <ItemRenderer
                    key={item.id}
                    item={item}
                    layoutMode={layoutMode}
                    scriptFont={scriptFont}
                    isOcrExpanded={expandedOcrId === item.id}
                    onToggleOcr={() => toggleOcr(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ItemRendererProps {
  item: WorksheetItem;
  layoutMode: LayoutMode;
  scriptFont: string;
  isOcrExpanded: boolean;
  onToggleOcr: () => void;
}

const ItemRenderer: React.FC<ItemRendererProps> = ({
  item,
  layoutMode,
  scriptFont,
  isOcrExpanded,
  onToggleOcr,
}) => {
  const isQuestion = item.type === 'question';
  const isAnswer = item.type === 'answer';

  return (
    <div
      className={`rounded-xl p-5 transition-all ${
        isQuestion
          ? 'bg-amber-50/40 border border-amber-200/60'
          : isAnswer
          ? 'bg-sky-50/40 border border-sky-200/60'
          : 'bg-slate-50/50 border border-slate-200/70'
      }`}
    >
      {/* Header Row: Sentence, Audio, Tag, OCR Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {isQuestion && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-200 text-amber-900 uppercase">
                Question
              </span>
            )}
            {isAnswer && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-200 text-sky-900 uppercase">
                Answer
              </span>
            )}
            {item.itemNumber && !isQuestion && !isAnswer && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 text-slate-800">
                #{item.itemNumber}
              </span>
            )}
            <h4 className={`text-base sm:text-lg font-bold text-slate-900 ${scriptFont} tracking-wide`}>
              {item.kannadaText}
            </h4>
            <AudioPronounceButton
              kannadaText={item.kannadaText}
              phoneticText={item.englishPronunciation}
              size="md"
            />
          </div>

          {/* Full Sentence Pronunciation & Translation */}
          <div className="text-xs sm:text-sm space-y-0.5 pt-1">
            <p className="text-teal-800 font-medium">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mr-1.5">Pronunciation:</span>
              {item.englishPronunciation}
            </p>
            <p className="text-indigo-900 font-semibold">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mr-1.5">English:</span>
              {item.englishTranslation}
            </p>
          </div>
        </div>

        {/* OCR Debug inspection toggle */}
        {item.ocrComparison && (
          <button
            onClick={onToggleOcr}
            className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs self-start shrink-0 cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>OCR Diff</span>
            {isOcrExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* OCR Comparison Drawer */}
      {isOcrExpanded && item.ocrComparison && (
        <div className="mb-4 bg-slate-900 text-slate-100 rounded-xl p-4 text-xs space-y-2 border border-slate-700">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="font-bold text-amber-400">OCR Engine Comparison for this line:</span>
            <span className="text-[10px] text-slate-400">Tesseract OCR vs Gemini Vision</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-red-950/40 p-2.5 rounded-lg border border-red-900/50">
              <p className="text-red-400 font-semibold mb-1">Raw Tesseract OCR:</p>
              <p className={`font-mono text-slate-200 ${scriptFont} bg-black/30 p-1.5 rounded`}>
                {item.ocrComparison.rawTesseractOcr}
              </p>
            </div>

            <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50">
              <p className="text-emerald-400 font-semibold mb-1">Gemini Vision AI (Cleaned):</p>
              <p className={`font-mono text-slate-200 ${scriptFont} bg-black/30 p-1.5 rounded`}>
                {item.ocrComparison.geminiCleaned}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Word-by-Word Breakdown Renderers */}
      <div className="mt-3">
        {layoutMode === 'interlinear' && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {item.words.map((word, wIdx) => (
              <div
                key={wIdx}
                className="bg-white rounded-lg p-2.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col min-w-[110px]"
              >
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1 mb-1.5">
                  <span className={`text-base font-bold text-slate-900 ${scriptFont}`}>
                    {word.kannada}
                  </span>
                  <AudioPronounceButton kannadaText={word.kannada} phoneticText={word.pronunciation} size="sm" />
                </div>
                <div className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded mb-1">
                  🗣️ {word.pronunciation}
                </div>
                <div className="text-[11px] font-medium text-slate-700">
                  {word.englishMeaning}
                </div>
                {word.grammaticalRole && (
                  <span className="text-[9px] text-slate-600 bg-slate-100 px-1 py-0.2 rounded mt-1.5 self-start">
                    {word.grammaticalRole}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {layoutMode === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-left">Word</th>
                  <th className="px-3 py-2 text-left">Pronunciation</th>
                  <th className="px-3 py-2 text-left">English Meaning</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-2 py-2 text-center w-12">Audio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {item.words.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className={`px-3 py-2 font-bold text-slate-900 ${scriptFont} text-sm`}>{w.kannada}</td>
                    <td className="px-3 py-2 font-medium text-teal-800">{w.pronunciation}</td>
                    <td className="px-3 py-2 text-slate-700">{w.englishMeaning}</td>
                    <td className="px-3 py-2 text-slate-600 text-[10px]">{w.grammaticalRole || '—'}</td>
                    <td className="px-2 py-2 text-center">
                      <AudioPronounceButton kannadaText={w.kannada} phoneticText={w.pronunciation} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {layoutMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-slate-200">
            {/* Left */}
            <div className="border-r-0 md:border-r border-slate-200 md:pr-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Original Words</span>
              <div className="flex flex-wrap gap-1.5">
                {item.words.map((w, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 text-slate-900 ${scriptFont} font-bold text-sm`}
                  >
                    <span>{w.kannada}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">English Breakdown</span>
              <div className="space-y-1">
                {item.words.map((w, i) => (
                  <div key={i} className="text-xs flex items-center justify-between py-0.5 border-b border-slate-100 last:border-none">
                    <span className={`font-semibold text-teal-800 ${scriptFont}`}>{w.kannada} ({w.pronunciation}):</span>
                    <span className="text-slate-700 text-right">{w.englishMeaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

