import React, { useState } from 'react';
import { WorksheetData } from '../types/worksheet';
import { generateAndDownloadPdf, downloadOfflineHtml } from '../utils/pdfExport';
import {
  Download,
  Printer,
  FileDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  LayoutTemplate,
} from 'lucide-react';

interface PrintPdfPreviewProps {
  worksheet: WorksheetData;
  onPrint: () => void;
}

export const PrintPdfPreview: React.FC<PrintPdfPreviewProps> = ({ worksheet, onPrint }) => {
  const [printFormat, setPrintFormat] = useState<'study-gloss' | 'vocab-table'>('study-gloss');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Group sections by page
  const page1Sections = worksheet.sections.filter((s) => s.page === 1);
  const page2Sections = worksheet.sections.filter((s) => s.page === 2);

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pageIds = ['pdf-page-1'];
      if (page2Sections.length > 0) {
        pageIds.push('pdf-page-2');
      }

      await generateAndDownloadPdf(
        pageIds,
        `${worksheet.subject}_Class4_Worksheet_Translated.pdf`,
        (status) => setExportStatus(status)
      );

      setSuccessMessage('Translated PDF successfully downloaded to your computer!');
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setErrorMessage(
        'Could not generate PDF directly in browser: ' +
          (err.message || 'Please try the Offline HTML or Print option.')
      );
    } finally {
      setIsExportingPdf(false);
      setExportStatus(null);
    }
  };

  const handleDownloadOfflineHtml = () => {
    downloadOfflineHtml(
      worksheet,
      `${worksheet.subject}_Class4_Worksheet_Study_Guide.html`
    );
    setSuccessMessage('Offline HTML guide downloaded! You can open it in any browser or print to PDF.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const downloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(worksheet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'kannada_worksheet_annotated.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Direct PDF Download Controls */}
      <div className="no-print bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct PDF Export Ready</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Download Translated Study PDF
            </h2>
            <p className="text-xs text-slate-500">
              Generates a multi-page A4 PDF matching the original 2-page worksheet with complete word-by-word pronunciation and meanings.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer ${
                isExportingPdf
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 active:scale-98'
              }`}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{exportStatus || 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Translated PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadOfflineHtml}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              title="Download standalone HTML file with embedded fonts"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Offline HTML</span>
            </button>

            <button
              onClick={downloadJson}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>JSON</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Layout Style Toggle & Format Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-600">Style for PDF:</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setPrintFormat('study-gloss')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  printFormat === 'study-gloss'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Interlinear Badges (Under-Word)
              </button>
              <button
                onClick={() => setPrintFormat('vocab-table')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  printFormat === 'vocab-table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structured Vocabulary Table
              </button>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Embedded font: <strong className="text-slate-700">Noto Sans Kannada</strong> (ligatures preserved)
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ================= PAGE 1 A4 SHEET ================= */}
      <div
        id="pdf-page-1"
        className="printable-area bg-white mx-auto max-w-[800px] p-8 sm:p-10 shadow-lg rounded-2xl border border-slate-200 text-slate-900 font-sans"
      >
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-wide text-slate-900">
                {worksheet.school}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Subject: {worksheet.subject}
                </span>
                {worksheet.grade && <span>• {worksheet.grade}</span>}
                {worksheet.date && (
                  <span className="text-slate-600 font-semibold lowercase">
                    • Date: <strong className="uppercase">{worksheet.date}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                PAGE 1 OF 2
              </span>
            </div>
          </div>

          {/* Chapter Name & Worksheet Title */}
          <div className="mt-3 pt-2 border-t border-slate-200">
            {worksheet.chapterName && worksheet.chapterName !== worksheet.titleKannada && (
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-0.5">
                Chapter: {worksheet.chapterName}
              </div>
            )}
            <h2 className="text-lg sm:text-xl font-bold font-kannada text-slate-950">
              {worksheet.titleKannada}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              <span className="text-teal-800">{worksheet.titlePronunciation}</span> —{' '}
              <span className="text-slate-800 font-semibold">{worksheet.titleEnglish}</span>
            </p>
            {worksheet.description && (
              <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                Note / Description: {worksheet.description}
              </p>
            )}
          </div>
        </div>

        {/* Page 1 Sections (Section I & Section II) */}
        <div className="space-y-6">
          {page1Sections.map((section) => (
            <div key={section.id} className="avoid-break-inside space-y-3">
              {/* Section Header */}
              <div className="bg-slate-100 p-2 rounded-lg border-l-4 border-amber-600 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-950 font-kannada">
                    {section.titleKannada}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {section.titlePronunciation} ({section.titleEnglish})
                  </p>
                </div>
              </div>

              {/* Items in Section */}
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                  >
                    <div>
                      <div className="text-base font-bold text-slate-950 font-kannada">
                        {item.kannadaText}
                      </div>
                      <div className="text-xs space-y-0.5 mt-0.5">
                        <p className="text-teal-900 font-medium">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mr-1">
                            Pronunciation:
                          </span>
                          {item.englishPronunciation}
                        </p>
                        <p className="text-slate-900 font-semibold">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mr-1">
                            English Meaning:
                          </span>
                          {item.englishTranslation}
                        </p>
                      </div>
                    </div>

                    {/* Word Breakdown */}
                    {printFormat === 'study-gloss' ? (
                      <div className="pt-1.5 border-t border-slate-200/80">
                        <div className="flex flex-wrap gap-1.5">
                          {item.words.map((w, wIdx) => (
                            <div
                              key={wIdx}
                              className="bg-white px-2 py-1 rounded-md border border-slate-200 text-xs shadow-2xs"
                            >
                              <div className="font-bold text-slate-900 font-kannada text-sm">
                                {w.kannada}
                              </div>
                              <div className="text-[10px] text-teal-800 font-medium">
                                [{w.pronunciation}]
                              </div>
                              <div className="text-[10px] text-slate-700 font-medium">
                                {w.englishMeaning}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-slate-200/80">
                        <table className="w-full text-xs text-left border-collapse border border-slate-200">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-bold">
                              <th className="p-1 border border-slate-200">Kannada</th>
                              <th className="p-1 border border-slate-200">Pronunciation</th>
                              <th className="p-1 border border-slate-200">English Meaning</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.words.map((w, wIdx) => (
                              <tr key={wIdx} className="bg-white">
                                <td className="p-1 border border-slate-200 font-bold font-kannada">
                                  {w.kannada}
                                </td>
                                <td className="p-1 border border-slate-200 text-teal-900">
                                  {w.pronunciation}
                                </td>
                                <td className="p-1 border border-slate-200 text-slate-800">
                                  {w.englishMeaning}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Page 1 Footer */}
        <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[11px] text-slate-500 flex justify-between items-center">
          <span>Delhi Public School, Bangalore E-City • Class IV Kannada</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* ================= PAGE 2 A4 SHEET ================= */}
      {page2Sections.length > 0 && (
        <div
          id="pdf-page-2"
          className="printable-area bg-white mx-auto max-w-[800px] p-8 sm:p-10 shadow-lg rounded-2xl border border-slate-200 text-slate-900 font-sans mt-8 page-break-before"
        >
          {/* Page 2 Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-wide text-slate-900">
                  {worksheet.school}
                </h2>
                <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  <span>Subject: {worksheet.subject}</span>
                  <span>•</span>
                  <span>{worksheet.grade}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                  PAGE 2 OF 2
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200">
              <h3 className="text-base sm:text-lg font-bold font-kannada text-slate-950">
                {worksheet.titleKannada} — (Continued)
              </h3>
            </div>
          </div>

          {/* Page 2 Sections (Section III) */}
          <div className="space-y-6">
            {page2Sections.map((section) => (
              <div key={section.id} className="avoid-break-inside space-y-3">
                <div className="bg-slate-100 p-2 rounded-lg border-l-4 border-amber-600 flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-bold text-slate-950 font-kannada">
                      {section.titleKannada}
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {section.titlePronunciation} ({section.titleEnglish})
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
                    >
                      <div>
                        <div className="text-base font-bold text-slate-950 font-kannada leading-relaxed">
                          {item.kannadaText}
                        </div>
                        <div className="text-xs space-y-1 mt-1">
                          <p className="text-teal-900 font-medium">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mr-1">
                              Pronunciation:
                            </span>
                            {item.englishPronunciation}
                          </p>
                          <p className="text-slate-900 font-semibold leading-relaxed">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mr-1">
                              English Meaning:
                            </span>
                            {item.englishTranslation}
                          </p>
                        </div>
                      </div>

                      {/* Word Breakdown */}
                      {printFormat === 'study-gloss' ? (
                        <div className="pt-2 border-t border-slate-200/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                            Detailed Word-by-Word Analysis:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.words.map((w, wIdx) => (
                              <div
                                key={wIdx}
                                className="bg-white px-2 py-1 rounded-md border border-slate-200 text-xs shadow-2xs"
                              >
                                <div className="font-bold text-slate-900 font-kannada text-sm">
                                  {w.kannada}
                                </div>
                                <div className="text-[10px] text-teal-800 font-medium">
                                  [{w.pronunciation}]
                                </div>
                                <div className="text-[10px] text-slate-700 font-medium">
                                  {w.englishMeaning}
                                </div>
                                {w.grammaticalRole && (
                                  <div className="text-[9px] text-slate-400 mt-0.5">
                                    {w.grammaticalRole}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-200/80">
                          <table className="w-full text-xs text-left border-collapse border border-slate-200">
                            <thead>
                              <tr className="bg-slate-100 text-slate-800 font-bold">
                                <th className="p-1.5 border border-slate-200">Kannada</th>
                                <th className="p-1.5 border border-slate-200">Pronunciation</th>
                                <th className="p-1.5 border border-slate-200">English Meaning</th>
                                <th className="p-1.5 border border-slate-200">Grammar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.words.map((w, wIdx) => (
                                <tr key={wIdx} className="bg-white">
                                  <td className="p-1.5 border border-slate-200 font-bold font-kannada">
                                    {w.kannada}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 text-teal-900">
                                    {w.pronunciation}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 text-slate-800">
                                    {w.englishMeaning}
                                  </td>
                                  <td className="p-1.5 border border-slate-200 text-slate-500 text-[10px]">
                                    {w.grammaticalRole || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Page 2 Footer */}
          <div className="mt-12 pt-3 border-t border-slate-300 text-center text-[11px] text-slate-500 flex justify-between items-center">
            <span>Delhi Public School, Bangalore E-City • Class IV Kannada</span>
            <span>Page 2 of 2 (Complete)</span>
          </div>
        </div>
      )}
    </div>
  );
};
