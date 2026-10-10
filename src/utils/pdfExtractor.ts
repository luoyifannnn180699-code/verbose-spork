import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface HasilEkstraksi {
  teks: string;
  jumlahHalaman?: number;
  metadata?: { title?: string; author?: string };
}

export async function extractTextFromPDF(file: File): Promise<HasilEkstraksi> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  }).promise;

  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let pageText = '';

    for (const item of textContent.items as any[]) {
      if (!item.str) continue;
      const y = item.transform ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(lastY - y) > 2) {
        pageText += '\n';
      } else if (
        pageText.length > 0 &&
        !pageText.endsWith(' ') &&
        !item.str.startsWith(' ')
      ) {
        pageText += ' ';
      }
      pageText += item.str;
      lastY = y;
    }

    fullText += `\n--- Halaman ${i} ---\n${pageText.trim()}\n`;
  }

  fullText = fullText.replace(/\n{3,}/g, '\n\n').trim();
  const meta = await pdf.getMetadata().catch(() => null);

  return {
    teks: fullText,
    jumlahHalaman: pdf.numPages,
    metadata: {
      title: (meta?.info as any)?.Title,
      author: (meta?.info as any)?.Author,
    },
  };
}

export async function extractTextFromDOCX(file: File): Promise<HasilEkstraksi> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return {
    teks: result.value.replace(/\n{3,}/g, '\n\n').trim(),
  };
}

export async function extractTextFromTXT(file: File): Promise<HasilEkstraksi> {
  const teks = await file.text();
  return { teks: teks.trim() };
}

export async function extractTextFromFile(file: File): Promise<HasilEkstraksi> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }
  if (
    type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  }
  if (
    type.startsWith('text/') ||
    name.endsWith('.txt') ||
    name.endsWith('.md')
  ) {
    return extractTextFromTXT(file);
  }

  throw new Error(
    `Format tidak didukung: ${name}. Gunakan PDF, DOCX, TXT, atau MD.`
  );
}