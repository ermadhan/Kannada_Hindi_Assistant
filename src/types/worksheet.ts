export interface WordBreakdown {
  kannada: string;
  pronunciation: string;
  englishMeaning: string;
  grammaticalRole?: string;
  notes?: string;
}

export interface WorksheetItem {
  id: string;
  itemNumber?: string;
  type: 'vocabulary' | 'question' | 'answer' | 'sentence' | 'heading';
  kannadaText: string;
  englishPronunciation: string;
  englishTranslation: string;
  words: WordBreakdown[];
  ocrComparison?: {
    rawTesseractOcr: string;
    identifiedIssues: string[];
    geminiCleaned: string;
  };
}

export interface WorksheetSection {
  id: string;
  sectionNumber: string;
  titleKannada: string;
  titlePronunciation: string;
  titleEnglish: string;
  page: number;
  items: WorksheetItem[];
}

export interface WorksheetData {
  id?: string;
  school: string;
  subject: string;
  grade: string;
  chapterName?: string;
  description?: string;
  date?: string;
  titleKannada: string;
  titlePronunciation: string;
  titleEnglish: string;
  sections: WorksheetSection[];
  createdAt?: string;
  updatedAt?: string;
}
