import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to process Kannada or Hindi worksheet image or text
app.post('/api/process-worksheet', async (req, res) => {
  try {
    const { imageBase64, mimeType, textInput, mode, language = 'kannada' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const langName = language === 'hindi' ? 'Hindi' : 'Kannada';
    const scriptName = language === 'hindi' ? 'Devanagari' : 'Kannada script';

    const systemInstruction = `You are an expert ${langName} linguist, educator, and OCR specialist for Indian school curricula (CBSE, ICSE, State Boards).
Your task is to take a ${langName} worksheet (either page image or text) and break it down systematically into study-ready sentences and words with:
1. Exact, grammatically clean ${langName} text in ${scriptName} (correcting any OCR errors, broken conjuncts/ottaksharas, or missing matras).
2. Accurate English phonetic pronunciation (transliteration with intuitive pronunciation guides).
3. Accurate word-by-word English translation matching the context.
4. Complete sentence meaning in fluent, natural English.
5. Section titles and question/answer categorization.

Return structured JSON strictly adhering to the schema.`;

    const contents: any[] = [];

    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
    }

    const promptText = textInput
      ? `Please process this ${langName} worksheet text into sentence-by-sentence and word-by-word breakdowns:\n\n${textInput}`
      : `Please perform high-accuracy ${langName} OCR on this worksheet page and produce a full word-by-word English translation, English pronunciation guide, and complete sentence translations. Ensure all ${langName} conjuncts and matras are properly joined and spelled.`;

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            worksheetTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionTitleKannada: { type: Type.STRING },
                  sectionTitleEnglish: { type: Type.STRING },
                  sectionTitlePronunciation: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        itemNumber: { type: Type.STRING },
                        itemType: { type: Type.STRING, description: 'vocabulary | question | answer | sentence' },
                        kannadaText: { type: Type.STRING },
                        englishPronunciation: { type: Type.STRING },
                        englishTranslation: { type: Type.STRING },
                        words: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              kannada: { type: Type.STRING },
                              pronunciation: { type: Type.STRING },
                              englishMeaning: { type: Type.STRING },
                              grammaticalRole: { type: Type.STRING },
                            },
                            required: ['kannada', 'pronunciation', 'englishMeaning'],
                          },
                        },
                      },
                      required: ['kannadaText', 'englishPronunciation', 'englishTranslation', 'words'],
                    },
                  },
                },
                required: ['sectionTitleKannada', 'items'],
              },
            },
          },
          required: ['worksheetTitle', 'sections'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error processing worksheet:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process worksheet',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
