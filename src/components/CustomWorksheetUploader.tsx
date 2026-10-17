import React, { useState } from 'react';
import { WorksheetData } from '../types/worksheet';
import { UploadCloud, FileText, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CustomWorksheetUploaderProps {
  onWorksheetLoaded: (data: WorksheetData) => void;
}

export const CustomWorksheetUploader: React.FC<CustomWorksheetUploaderProps> = ({
  onWorksheetLoaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [uploadLanguage, setUploadLanguage] = useState<'kannada' | 'hindi'>('kannada');
  const [subjectName, setSubjectName] = useState('Kannada (ಕನ್ನಡ)');
  const [chapterName, setChapterName] = useState('');
  const [worksheetDate, setWorksheetDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processUploadedFile = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    if (!chapterName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setChapterName(cleanName);
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!previewBase64 && !textInput.trim()) {
      setErrorMessage('Please upload a Kannada worksheet file or paste Kannada text.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/process-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewBase64,
          mimeType: selectedFile?.type || 'image/jpeg',
          textInput: textInput.trim(),
          language: uploadLanguage,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to process worksheet');
      }

      const result = await response.json();

      // Transform backend format to standard WorksheetData format with user-entered Subject, Chapter, Date & Description
      const finalSubject = subjectName.trim() || result.subject || (uploadLanguage === 'hindi' ? 'Hindi (हिंदी)' : 'Kannada (ಕನ್ನಡ)');
      const finalChapter = chapterName.trim() || result.worksheetTitle || (uploadLanguage === 'hindi' ? 'हिंदी पाठ' : 'ಕನ್ನಡ ಪಾಠ');

      const formattedData: WorksheetData = {
        id: `worksheet-${Date.now()}`,
        school: result.school || 'DELHI PUBLIC SCHOOL',
        subject: finalSubject,
        grade: result.grade || 'CLASS IV',
        chapterName: finalChapter,
        description: description.trim(),
        date: worksheetDate || new Date().toISOString().split('T')[0],
        titleKannada: result.worksheetTitle || finalChapter,
        titlePronunciation: result.worksheetTitle || 'Study Notes',
        titleEnglish: finalChapter,
        sections: (result.sections || []).map((sec: any, idx: number) => ({
          id: `custom-sec-${idx}`,
          sectionNumber: `${idx + 1}`,
          titleKannada: sec.sectionTitleKannada || (uploadLanguage === 'hindi' ? `भाग ${idx + 1}` : `ವಿಭಾಗ ${idx + 1}`),
          titlePronunciation: sec.sectionTitlePronunciation || 'Section',
          titleEnglish: sec.sectionTitleEnglish || `Section ${idx + 1}`,
          page: 1,
          items: (sec.items || []).map((item: any, iIdx: number) => ({
            id: `custom-item-${idx}-${iIdx}`,
            itemNumber: item.itemNumber || `${iIdx + 1}`,
            type: item.type || 'sentence',
            kannadaText: item.kannadaText,
            englishPronunciation: item.englishPronunciation,
            englishTranslation: item.englishTranslation,
            words: item.words || [],
          })),
        })),
        createdAt: new Date().toISOString(),
      };

      setSuccessMessage('Successfully parsed worksheet! Navigating to trial preview...');
      setTimeout(() => {
        onWorksheetLoaded(formattedData);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while contacting server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Process New Worksheet ({uploadLanguage === 'hindi' ? 'Hindi' : 'Kannada'})
              </h2>
              <p className="text-xs text-slate-500">
                Upload any page image or paste text to generate sentence & word-by-word breakdowns
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setUploadLanguage('kannada');
                setSubjectName('Kannada (ಕನ್ನಡ)');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                uploadLanguage === 'kannada' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kannada (ಕನ್ನಡ)
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadLanguage('hindi');
                setSubjectName('Hindi (हिंदी)');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                uploadLanguage === 'hindi' ? 'bg-white text-indigo-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hindi (हिंदी)
            </button>
          </div>
        </div>

        {/* Custom Metadata Inputs: Subject Name, Chapter Name, Date, Description */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Worksheet Identification & Storage Metadata</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Kannada (ಕನ್ನಡ) or Hindi (हिंदी)"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Chapter / Topic Name *
              </label>
              <input
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="e.g. Lesson 3 - Sarvajna Tripadigalu"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={worksheetDate}
                onChange={(e) => setWorksheetDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Class 4 midterm writing notes - vocabulary synonyms and short answers"
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Upload box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* File Upload Area with Drag and Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                : 'border-slate-200 hover:border-violet-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-2 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-violet-700 hover:underline">
                {selectedFile ? selectedFile.name : 'Click to browse or drag & drop files here'}
              </span>
              <p className="text-[11px] text-slate-500">
                Supports worksheet scan images (PNG, JPG, JPEG, WEBP) & PDF pages
              </p>
            </label>

            {previewBase64 && (
              <div className="mt-4 max-h-36 overflow-hidden rounded-lg border border-slate-200 shadow-2xs">
                <img src={previewBase64} alt="Uploaded worksheet preview" className="max-h-36 object-contain" />
              </div>
            )}
          </div>

          {/* Or Text Input */}
          <div className="space-y-2 flex flex-col">
            <label className="text-xs font-bold text-slate-700">
              Or paste Kannada worksheet text:
            </label>
            <textarea
              rows={6}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g.:&#10;೧. ಯಾರ ಮನೆಯ ಜ್ಯೋತಿಯು ಹೀನವಲ್ಲ ?&#10;ಉತ್ತರ : ಜಾತಿಹೀನನ ಮನೆಯ ಜ್ಯೋತಿಯು ಹೀನವಲ್ಲ."
              className="flex-1 w-full p-3 text-xs sm:text-sm font-kannada bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Status alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Process button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleProcess}
            disabled={isLoading || (!previewBase64 && !textInput.trim())}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer ${
              isLoading || (!previewBase64 && !textInput.trim())
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with Gemini Vision...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process & Generate Study Breakdown</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
