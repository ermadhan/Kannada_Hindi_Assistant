import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { WorksheetData } from '../types/worksheet';

/**
 * Exports targeted page elements into a clean multi-page A4 PDF file directly in browser.
 */
export async function generateAndDownloadPdf(
  pageElementIds: string[],
  filename: string = 'Kannada_Worksheet_Annotated.pdf',
  onProgress?: (status: string) => void
): Promise<void> {
  onProgress?.('Preparing pages for PDF generation...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageElementIds.length; i++) {
    const elementId = pageElementIds[i];
    const element = document.getElementById(elementId);

    if (!element) continue;

    onProgress?.(`Rendering Page ${i + 1} of ${pageElementIds.length}...`);

    // Render page element to canvas at high resolution (scale: 2)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
    } else {
      // If a single page content exceeds one A4 page, slice it gracefully
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }
  }

  onProgress?.('Finalizing and downloading PDF file...');
  pdf.save(filename);
}

/**
 * Downloads a standalone, self-contained HTML file of the worksheet with embedded CSS and Noto Sans Kannada font.
 */
export function downloadOfflineHtml(worksheet: WorksheetData, filename: string = 'Kannada_Worksheet_Study_Guide.html') {
  const htmlContent = `<!DOCTYPE html>
<html lang="kn">
<head>
  <meta charset="UTF-8">
  <title>${worksheet.chapterName || worksheet.titleKannada} - Study Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .kannada { font-family: 'Noto Sans Kannada', 'Noto Sans Devanagari', sans-serif; }
    .sheet { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .meta-badge { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 6px; margin-top: 4px; }
    .section-title { background: #f1f5f9; padding: 10px 14px; border-left: 4px solid #d97706; margin-top: 24px; margin-bottom: 16px; border-radius: 6px; }
    .item-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
    .word-chip { display: inline-block; background: white; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; margin: 4px; vertical-align: top; }
    .pronunciation { color: #0f766e; font-weight: 600; font-size: 13px; }
    .translation { color: #3730a3; font-weight: 600; font-size: 14px; }
    @media print {
      body { background: white; padding: 0; }
      .sheet { box-shadow: none; padding: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div style="font-size: 20px; font-weight: 800;">${worksheet.school}</div>
      <div style="margin-top: 6px;">
        <span class="meta-badge">Subject: ${worksheet.subject}</span>
        ${worksheet.grade ? `<span class="meta-badge">${worksheet.grade}</span>` : ''}
        ${worksheet.date ? `<span class="meta-badge">Date: ${worksheet.date}</span>` : ''}
      </div>
      ${worksheet.chapterName ? `<div style="font-size: 13px; font-weight: 700; color: #4338ca; margin-top: 10px;">CHAPTER: ${worksheet.chapterName}</div>` : ''}
      <div class="kannada" style="font-size: 22px; font-weight: 700; margin-top: 6px;">${worksheet.titleKannada}</div>
      <div style="font-size: 14px; color: #475569;">${worksheet.titlePronunciation} — <b>${worksheet.titleEnglish}</b></div>
      ${worksheet.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 8px; font-style: italic; background: #f8fafc; padding: 8px; border-radius: 6px;">${worksheet.description}</div>` : ''}
    </div>

    ${worksheet.sections
      .map(
        (sec) => `
      <div class="section-title">
        <div class="kannada" style="font-size: 17px; font-weight: 700;">${sec.titleKannada}</div>
        <div style="font-size: 12px; color: #64748b;">${sec.titlePronunciation} (${sec.titleEnglish})</div>
      </div>
      ${sec.items
        .map(
          (itm) => `
        <div class="item-card">
          <div class="kannada" style="font-size: 18px; font-weight: 700;">${itm.kannadaText}</div>
          <div class="pronunciation">Pronunciation: ${itm.englishPronunciation}</div>
          <div class="translation">English: ${itm.englishTranslation}</div>
          <div style="margin-top: 10px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Word-by-Word Analysis:</div>
            ${itm.words
              .map(
                (w) => `
              <div class="word-chip">
                <div class="kannada" style="font-size: 15px; font-weight: 700;">${w.kannada}</div>
                <div style="font-size: 11px; color: #0f766e;">[${w.pronunciation}]</div>
                <div style="font-size: 11px; color: #1e293b; margin-top: 2px;">${w.englishMeaning}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    `
      )
      .join('')}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
