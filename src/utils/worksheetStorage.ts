import { WorksheetData } from '../types/worksheet';
import { sampleWorksheetData } from '../data/trialWorksheet';
import { sampleHindiWorksheetData } from '../data/trialHindiWorksheet';

const STORAGE_KEY = 'worksheet_studio_library_v1';

// Seed default worksheets with IDs and dates if not yet stored
export const DEFAULT_WORKSHEETS: WorksheetData[] = [
  {
    ...sampleWorksheetData,
    id: 'kannada-trial-1',
    subject: 'Kannada (ಕನ್ನಡ)',
    chapterName: 'ಪದ್ಯ – ಸರ್ವಜ್ಞನ ತ್ರಿಪದಿಗಳು (Sarvajna Tripadigalu)',
    description: 'Class IV Kannada Writing Notes covering word meanings, QA, and long answer tripadis.',
    date: '2026-09-25',
    createdAt: new Date('2026-09-25T10:00:00Z').toISOString(),
  },
  {
    ...sampleHindiWorksheetData,
    id: 'hindi-trial-1',
    subject: 'Hindi (हिंदी)',
    chapterName: 'पाठ – मन के भोले-भाले बादल (Man Ke Bhole-Bhale Badal)',
    description: 'Class IV Hindi Rimjhim textbook writing notes with shabdarth, questions, and long answers.',
    date: '2026-09-26',
    createdAt: new Date('2026-09-26T10:00:00Z').toISOString(),
  },
];

/**
 * Loads all stored worksheets from localStorage (seeds initial defaults on first launch).
 */
export function getStoredWorksheets(): WorksheetData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredWorksheets(DEFAULT_WORKSHEETS);
      return DEFAULT_WORKSHEETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse worksheets from localStorage, initializing defaults:', err);
  }
  return DEFAULT_WORKSHEETS;
}

/**
 * Saves the full list of worksheets to localStorage.
 */
export function saveStoredWorksheets(worksheets: WorksheetData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(worksheets));
  } catch (err) {
    console.error('Failed to save worksheets to localStorage:', err);
  }
}

/**
 * Saves or updates a single worksheet.
 */
export function saveOrUpdateWorksheet(worksheet: WorksheetData): WorksheetData[] {
  const current = getStoredWorksheets();
  const id = worksheet.id || `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const prepared: WorksheetData = {
    ...worksheet,
    id,
    date: worksheet.date || new Date().toISOString().split('T')[0],
    chapterName: worksheet.chapterName || worksheet.titleKannada || 'Worksheet Chapter',
    description: worksheet.description || '',
    createdAt: worksheet.createdAt || now,
    updatedAt: now,
  };

  const existingIndex = current.findIndex((w) => w.id === id);
  let updatedList: WorksheetData[];

  if (existingIndex >= 0) {
    updatedList = [...current];
    updatedList[existingIndex] = prepared;
  } else {
    updatedList = [prepared, ...current];
  }

  saveStoredWorksheets(updatedList);
  return updatedList;
}

/**
 * Deletes a worksheet by ID.
 */
export function deleteStoredWorksheet(id: string): WorksheetData[] {
  const current = getStoredWorksheets();
  const updated = current.filter((w) => w.id !== id);
  saveStoredWorksheets(updated);
  return updated;
}
