import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { db, type DokumenReferensiItem } from '../db';

// Set worker PDF.js dari CDN
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Parse file teks (.txt, .md, .markdown) via Browser File API
 */
export async function parseTextDocumentViaFileAPI(file: File): Promise<{
  text: string;
  type: string;
  sizeStr: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  hasChineseChars: boolean;
}> {
  let rawText = '';

  if (typeof file.text === 'function') {
    try {
      rawText = await file.text();
    } catch {
      rawText = '';
    }
  }

  if (!rawText) {
    rawText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve((event.target?.result as string) || '');
      };
      reader.onerror = () => {
        reject(new Error(`Gagal membaca file ${file.name}.`));
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error(`File ${file.name} kosong.`);
  }

  const sizeKb = Math.round(file.size / 1024);
  const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, sizeKb)} KB`;
  const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
  const charCount = trimmed.length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const lineCount = trimmed.split(/\r\n|\r|\n/).length;
  const hasChineseChars = /[\u4e00-\u9fa5\u3400-\u4dbf]/.test(trimmed);

  return {
    text: trimmed,
    type: extension,
    sizeStr,
    charCount,
    wordCount,
    lineCount,
    hasChineseChars,
  };
}

/**
 * ⭐ EKSTRAKSI PDF yang BENAR menggunakan pdfjs-dist
 */
async function extractTextFromPDF(file: File): Promise<string> {
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

      // Deteksi ganti baris (Y berubah signifikan)
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

  return fullText.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Ekstraksi teks dari berbagai format file
 */
export async function extractTextFromFile(file: File): Promise<{
  text: string;
  type: string;
  sizeStr: string;
  charCount?: number;
  wordCount?: number;
  lineCount?: number;
  hasChineseChars?: boolean;
}> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const sizeKb = Math.round(file.size / 1024);
  const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, sizeKb)} KB`;

  // Teks murni & Markdown
  if (['txt', 'md', 'markdown', 'text', 'json', 'csv', 'tsv'].includes(extension)) {
    return await parseTextDocumentViaFileAPI(file);
  }

  let extractedText = '';

  if (extension === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value || '';
    } catch (err: any) {
      throw new Error(`Gagal membaca file .docx: ${err?.message || 'Format tidak didukung'}`);
    }
  } else if (extension === 'pdf') {
    // ⭐ FIX: Gunakan pdfjs-dist, BUKAN file.text()
    try {
      extractedText = await extractTextFromPDF(file);

      if (!extractedText || extractedText.replace(/--- Halaman \d+ ---/g, '').trim().length < 20) {
        throw new Error(
          'PDF tidak memiliki teks yang bisa diekstrak. Kemungkinan PDF hasil scan (gambar). ' +
          'Solusi: gunakan PDF dengan teks, atau convert ke .txt/.docx dulu.'
        );
      }
    } catch (e: any) {
      throw new Error(e.message || 'Gagal membaca file PDF.');
    }
  } else {
    // Fallback
    try {
      const parsed = await parseTextDocumentViaFileAPI(file);
      return parsed;
    } catch {
      throw new Error(
        `Format .${extension} belum didukung. Gunakan .txt, .md, .docx, atau .pdf.`
      );
    }
  }

  const trimmed = extractedText.trim();
  if (!trimmed) {
    throw new Error('Dokumen kosong atau teks tidak dapat terbaca.');
  }

  const hasChineseChars = /[\u4e00-\u9fa5\u3400-\u4dbf]/.test(trimmed);

  return {
    text: trimmed,
    type: extension,
    sizeStr,
    charCount: trimmed.length,
    wordCount: trimmed.split(/\s+/).filter(Boolean).length,
    lineCount: trimmed.split(/\r\n|\r|\n/).length,
    hasChineseChars,
  };
}

/**
 * Simpan dokumen ke Dexie
 */
export async function simpanDokumenReferensi(data: {
  judul: string;
  mataPelajaran: string;
  kategori: string;
  tipeFile: string;
  namaFile: string;
  ukuranFile?: string;
  kontenTeks: string;
  ringkasan?: string;
  faseKelas?: string;
  isAktif?: boolean;
}): Promise<number> {
  const now = Date.now();
  const ringkasanOtomatis =
    data.ringkasan ||
    (data.kontenTeks.length > 250
      ? data.kontenTeks.slice(0, 240).replace(/\s+/g, ' ') + '...'
      : data.kontenTeks);

  const id = await db.dokumen_referensi.add({
    judul: data.judul,
    mataPelajaran: data.mataPelajaran || 'Semua Mapel',
    kategori: data.kategori || 'Kurikulum / CP',
    tipeFile: data.tipeFile || 'txt',
    namaFile: data.namaFile,
    ukuranFile: data.ukuranFile || '10 KB',
    kontenTeks: data.kontenTeks,
    ringkasan: ringkasanOtomatis,
    faseKelas: data.faseKelas || 'Semua Fase',
    isAktif: data.isAktif ?? true,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Ambil konteks AI dari dokumen yang aktif
 */
export async function getActiveKnowledgeContext(targetMataPelajaran?: string): Promise<string> {
  try {
    const allDocs = await db.dokumen_referensi.toArray();
    const activeDocs = allDocs.filter((d) => d.isAktif);

    if (activeDocs.length === 0) return '';

    const normalizedTarget = (targetMataPelajaran || '').toLowerCase().trim();
    const relevantDocs = activeDocs.filter((d) => {
      const docMapel = (d.mataPelajaran || '').toLowerCase().trim();
      if (!targetMataPelajaran) return true;
      if (docMapel === 'semua mapel' || docMapel === 'umum') return true;
      return (
        normalizedTarget.includes(docMapel) ||
        docMapel.includes(normalizedTarget) ||
        (normalizedTarget.includes('mandarin') && docMapel.includes('mandarin')) ||
        (normalizedTarget.includes('chinese') && docMapel.includes('mandarin'))
      );
    });

    const docsToUse = relevantDocs.length > 0 ? relevantDocs : activeDocs.slice(0, 3);

    let output = `\n\n=== [DOKUMEN PEDOMAN KURIKULUM & MATERI DARI GURU] ===\n`;
    output += `PENTING: Guru telah membekali Anda dengan dokumen referensi berikut. Anda WAJIB membaca, memahami, dan memprioritaskan isinya:\n\n`;

    docsToUse.forEach((doc, idx) => {
      const snippet =
        doc.kontenTeks.length > 2500
          ? doc.kontenTeks.slice(0, 2500) + '\n...[dipotong]...'
          : doc.kontenTeks;
      output += `[Dokumen ${idx + 1}: ${doc.judul} (Mapel: ${doc.mataPelajaran})]\n${snippet}\n\n`;
    });

    output += `=== [AKHIR DOKUMEN] ===\n\n`;
    return output;
  } catch (err) {
    console.warn('Gagal memuat dokumen referensi:', err);
    return '';
  }
}