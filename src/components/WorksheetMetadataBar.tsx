import React, { useState, useEffect } from 'react';
import { WorksheetData } from '../types/worksheet';
import {
  Edit3,
  Calendar,
  Book,
  FileText,
  Save,
  CheckCircle2,
  X,
  PlusCircle,
  FolderOpen,
} from 'lucide-react';

interface WorksheetMetadataBarProps {
  worksheet: WorksheetData;
  onUpdateMetadata: (updated: {
    subject: string;
    chapterName: string;
    description: string;
    date: string;
    school?: string;
    grade?: string;
  }) => void;
  onSaveToLibrary: () => void;
  isSaved?: boolean;
}

export const WorksheetMetadataBar: React.FC<WorksheetMetadataBarProps> = ({
  worksheet,
  onUpdateMetadata,
  onSaveToLibrary,
  isSaved = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(worksheet.subject || '');
  const [chapterName, setChapterName] = useState(worksheet.chapterName || worksheet.titleKannada || '');
  const [description, setDescription] = useState(worksheet.description || '');
  const [date, setDate] = useState(worksheet.date || new Date().toISOString().split('T')[0]);
  const [school, setSchool] = useState(worksheet.school || '');
  const [grade, setGrade] = useState(worksheet.grade || '');
  const [justSaved, setJustSaved] = useState(false);

  // Sync when worksheet changes externally
  useEffect(() => {
    setSubject(worksheet.subject || '');
    setChapterName(worksheet.chapterName || worksheet.titleKannada || '');
    setDescription(worksheet.description || '');
    setDate(worksheet.date || new Date().toISOString().split('T')[0]);
    setSchool(worksheet.school || '');
    setGrade(worksheet.grade || '');
  }, [worksheet]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMetadata({
      subject: subject.trim() || worksheet.subject,
      chapterName: chapterName.trim() || worksheet.titleKannada,
      description: description.trim(),
      date: date || new Date().toISOString().split('T')[0],
      school: school.trim() || worksheet.school,
      grade: grade.trim() || worksheet.grade,
    });
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 no-print transition-all">
      {!isEditing ? (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Metadata Display Chips */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold">
                <Book className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Subject: {worksheet.subject || 'Not Specified'}</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200/80 text-xs font-bold">
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Chapter: {worksheet.chapterName || worksheet.titleKannada}</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Date: {worksheet.date || new Date().toISOString().split('T')[0]}</span>
              </span>

              {worksheet.grade && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                  {worksheet.grade}
                </span>
              )}

              {justSaved && (
                <span className="inline-flex items-center space-x-1 text-emerald-600 text-xs font-semibold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Metadata Saved!</span>
                </span>
              )}
            </div>

            {/* Description text */}
            {worksheet.description ? (
              <p className="text-xs text-slate-600 pl-0.5 line-clamp-2">
                <strong className="text-slate-800 font-semibold">Description: </strong>
                {worksheet.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic pl-0.5">
                No description added yet. Click &quot;Edit Details&quot; to add notes, teacher remarks, or exam tags.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              title="Edit Subject, Chapter Name, Description, and Date"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={onSaveToLibrary}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title="Store this worksheet in your browser library"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved to Library' : 'Save Worksheet'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Worksheet Details & Storage Metadata</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Kannada (ಕನ್ನಡ) or Hindi (हिंदी)"
                required
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Chapter Name *
              </label>
              <input
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="e.g. Sarvajna Tripadigalu / Man Ke Bhole Badal"
                required
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                School / Class
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="School"
                  className="w-2/3 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Class"
                  className="w-1/3 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Description & Notes (Tags, Unit Test remarks, Syllabus reference)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Term-1 exam preparation worksheet covering 5 vocabulary synonyms and 4 short answers..."
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply & Save</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
