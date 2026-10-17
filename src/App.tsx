/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrialRunViewer } from './components/TrialRunViewer';
import { PrintPdfPreview } from './components/PrintPdfPreview';
import { ClarificationView } from './components/ClarificationView';
import { WindowsAppHub } from './components/WindowsAppHub';
import { CustomWorksheetUploader } from './components/CustomWorksheetUploader';
import { WorksheetMetadataBar } from './components/WorksheetMetadataBar';
import { WorksheetLibrary } from './components/WorksheetLibrary';
import { sampleWorksheetData } from './data/trialWorksheet';
import { sampleHindiWorksheetData } from './data/trialHindiWorksheet';
import { WorksheetData } from './types/worksheet';
import { generateAndDownloadPdf } from './utils/pdfExport';
import {
  getStoredWorksheets,
  saveOrUpdateWorksheet,
  deleteStoredWorksheet,
  DEFAULT_WORKSHEETS,
} from './utils/worksheetStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trial' | 'pdf-preview' | 'windows-app' | 'clarifications' | 'custom-upload' | 'library'>('trial');
  const [currentLanguage, setCurrentLanguage] = useState<'kannada' | 'hindi'>('kannada');
  const [storedWorksheets, setStoredWorksheets] = useState<WorksheetData[]>([]);
  const [worksheet, setWorksheet] = useState<WorksheetData>(() => DEFAULT_WORKSHEETS[0]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavedInLibrary, setIsSavedInLibrary] = useState(false);

  // Initialize stored worksheets on mount
  useEffect(() => {
    const list = getStoredWorksheets();
    setStoredWorksheets(list);
    if (list.length > 0) {
      setWorksheet(list[0]);
      setIsSavedInLibrary(true);
    }
  }, []);

  // Check if current active worksheet exists in stored list
  useEffect(() => {
    if (worksheet.id) {
      const exists = storedWorksheets.some((w) => w.id === worksheet.id);
      setIsSavedInLibrary(exists);
    } else {
      setIsSavedInLibrary(false);
    }
  }, [worksheet, storedWorksheets]);

  const handleSelectLanguage = (lang: 'kannada' | 'hindi') => {
    setCurrentLanguage(lang);
    const target = storedWorksheets.find((w) =>
      lang === 'hindi'
        ? (w.subject || '').toLowerCase().includes('hindi')
        : (w.subject || '').toLowerCase().includes('kannada')
    );
    if (target) {
      setWorksheet(target);
    } else {
      setWorksheet(lang === 'hindi' ? DEFAULT_WORKSHEETS[1] : DEFAULT_WORKSHEETS[0]);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    // Switch to preview tab so elements are rendered
    setActiveTab('pdf-preview');

    setTimeout(async () => {
      try {
        const pageIds = ['pdf-page-1'];
        if (document.getElementById('pdf-page-2')) {
          pageIds.push('pdf-page-2');
        }
        const safeName = (worksheet.chapterName || worksheet.subject || 'Worksheet')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .substring(0, 30);
        await generateAndDownloadPdf(
          pageIds,
          `${safeName}_Translated_${worksheet.date || 'Study'}.pdf`
        );
      } catch (err) {
        console.error('Download error:', err);
      } finally {
        setIsDownloadingPdf(false);
      }
    }, 400);
  };

  const handleCustomLoaded = (newData: WorksheetData) => {
    const updatedList = saveOrUpdateWorksheet(newData);
    setStoredWorksheets(updatedList);
    setWorksheet(newData);
    setIsSavedInLibrary(true);
    setActiveTab('trial');
  };

  const handleUpdateMetadata = (updatedMeta: {
    subject: string;
    chapterName: string;
    description: string;
    date: string;
    school?: string;
    grade?: string;
  }) => {
    const merged: WorksheetData = {
      ...worksheet,
      ...updatedMeta,
      subject: updatedMeta.subject || worksheet.subject,
      chapterName: updatedMeta.chapterName,
      description: updatedMeta.description,
      date: updatedMeta.date,
      school: updatedMeta.school || worksheet.school,
      grade: updatedMeta.grade || worksheet.grade,
      updatedAt: new Date().toISOString(),
    };
    setWorksheet(merged);
    const updatedList = saveOrUpdateWorksheet(merged);
    setStoredWorksheets(updatedList);
    setIsSavedInLibrary(true);
  };

  const handleSaveToLibrary = () => {
    const updatedList = saveOrUpdateWorksheet(worksheet);
    setStoredWorksheets(updatedList);
    setIsSavedInLibrary(true);
  };

  const handleDeleteWorksheet = (id: string) => {
    const updatedList = deleteStoredWorksheet(id);
    setStoredWorksheets(updatedList);
    if (worksheet.id === id && updatedList.length > 0) {
      setWorksheet(updatedList[0]);
    }
  };

  const handleImportJson = (imported: WorksheetData[]) => {
    let currentList = getStoredWorksheets();
    for (const item of imported) {
      currentList = saveOrUpdateWorksheet(item);
    }
    setStoredWorksheets(currentList);
    if (imported.length > 0) {
      setWorksheet(imported[0]);
      setIsSavedInLibrary(true);
    }
  };

  const handleExportAllJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(storedWorksheets, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Worksheet_Library_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        storedWorksheetsCount={storedWorksheets.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Persistent Worksheet Metadata Bar (Editable Subject, Chapter, Description, Date) */}
        {(activeTab === 'trial' || activeTab === 'pdf-preview') && (
          <WorksheetMetadataBar
            worksheet={worksheet}
            onUpdateMetadata={handleUpdateMetadata}
            onSaveToLibrary={handleSaveToLibrary}
            isSaved={isSavedInLibrary}
          />
        )}

        {activeTab === 'trial' && (
          <TrialRunViewer
            worksheet={worksheet}
            onGoToPdfPreview={() => setActiveTab('pdf-preview')}
          />
        )}

        {activeTab === 'pdf-preview' && (
          <PrintPdfPreview
            worksheet={worksheet}
            onPrint={() => window.print()}
          />
        )}

        {activeTab === 'library' && (
          <WorksheetLibrary
            worksheets={storedWorksheets}
            activeWorksheetId={worksheet.id}
            onSelectWorksheet={(ws) => {
              setWorksheet(ws);
              if ((ws.subject || '').toLowerCase().includes('hindi')) {
                setCurrentLanguage('hindi');
              } else {
                setCurrentLanguage('kannada');
              }
              setActiveTab('trial');
            }}
            onDeleteWorksheet={handleDeleteWorksheet}
            onExportAllJson={handleExportAllJson}
            onImportJson={handleImportJson}
            onGoToUpload={() => setActiveTab('custom-upload')}
          />
        )}

        {activeTab === 'clarifications' && (
          <ClarificationView
            onGoToTrial={() => setActiveTab('trial')}
            onGoToWindowsApp={() => setActiveTab('windows-app')}
          />
        )}

        {activeTab === 'windows-app' && (
          <WindowsAppHub />
        )}

        {activeTab === 'custom-upload' && (
          <CustomWorksheetUploader
            onWorksheetLoaded={handleCustomLoaded}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Kannada & Hindi Worksheet PDF Studio • Storing Subject, Chapter, Description & Date
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('library')}
              className="text-indigo-700 font-semibold hover:underline cursor-pointer"
            >
              Worksheet Library ({storedWorksheets.length})
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('clarifications')}
              className="text-amber-700 hover:underline cursor-pointer"
            >
              OCR & Layout Clarifications
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('windows-app')}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              Windows Python App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
