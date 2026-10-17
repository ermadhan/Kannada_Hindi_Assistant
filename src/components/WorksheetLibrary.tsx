import React, { useState, useRef } from 'react';
import { WorksheetData } from '../types/worksheet';
import {
  FolderOpen,
  Calendar,
  Book,
  FileText,
  Trash2,
  Download,
  Upload,
  Eye,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface WorksheetLibraryProps {
  worksheets: WorksheetData[];
  activeWorksheetId?: string;
  onSelectWorksheet: (worksheet: WorksheetData) => void;
  onDeleteWorksheet: (id: string) => void;
  onExportAllJson: () => void;
  onImportJson?: (imported: WorksheetData[]) => void;
  onGoToUpload: () => void;
}

export const WorksheetLibrary: React.FC<WorksheetLibraryProps> = ({
  worksheets,
  activeWorksheetId,
  onSelectWorksheet,
  onDeleteWorksheet,
  onExportAllJson,
  onImportJson,
  onGoToUpload,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Kannada' | 'Hindi'>('all');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const toAdd: WorksheetData[] = Array.isArray(parsed) ? parsed : [parsed];
          if (toAdd.length > 0 && onImportJson) {
            onImportJson(toAdd);
            setImportStatus(`Successfully imported ${toAdd.length} worksheet(s)!`);
            setTimeout(() => setImportStatus(null), 3500);
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const filtered = worksheets.filter((ws) => {
    const matchesSearch =
      (ws.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ws.chapterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ws.titleKannada || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ws.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ws.date || '').includes(searchTerm);

    if (!matchesSearch) return false;

    if (subjectFilter === 'all') return true;
    return (ws.subject || '').toLowerCase().includes(subjectFilter.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Persistent Stored Worksheets ({worksheets.length})</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Worksheet Library & Storage Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Each worksheet saves its Subject Name, Chapter Name, Description, and Date. Stored locally in your browser so you never lose your translations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleJsonFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Import previously saved worksheet JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={onExportAllJson}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Export all worksheets as a backup JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup Library (JSON)</span>
          </button>

          <button
            onClick={onGoToUpload}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Worksheet</span>
          </button>
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 border border-emerald-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{importStatus}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject, chapter name, date, or keywords..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">Filter:</span>
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              subjectFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSubjectFilter('Kannada')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              subjectFilter === 'Kannada'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kannada
          </button>
          <button
            onClick={() => setSubjectFilter('Hindi')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              subjectFilter === 'Hindi'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hindi
          </button>
        </div>
      </div>

      {/* Grid of Stored Worksheets */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No worksheets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, or upload a new Kannada/Hindi worksheet to add it to your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isActive = item.id === activeWorksheetId;
            const isHindi = (item.subject || '').toLowerCase().includes('hindi');
            const totalItems = (item.sections || []).reduce(
              (acc, s) => acc + (s.items || []).length,
              0
            );

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isActive
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isHindi
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      <Book className="w-3 h-3" />
                      <span>{item.subject}</span>
                    </span>

                    <span className="inline-flex items-center space-x-1 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{item.date || 'No Date'}</span>
                    </span>
                  </div>

                  {/* Chapter Name */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {item.chapterName || item.titleKannada}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.titleEnglish}
                    </p>
                  </div>

                  {/* Description */}
                  {item.description ? (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {item.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      No description provided
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                    <span>
                      <strong>{item.sections?.length || 0}</strong> Sections
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{totalItems}</strong> Questions & Words
                    </span>
                    {item.grade && (
                      <>
                        <span>•</span>
                        <span>{item.grade}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectWorksheet(item)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Currently Active</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open & Translate</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (
                        item.id &&
                        confirm(
                          `Delete "${item.chapterName || item.titleKannada}" from your stored worksheets?`
                        )
                      ) {
                        onDeleteWorksheet(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete worksheet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
