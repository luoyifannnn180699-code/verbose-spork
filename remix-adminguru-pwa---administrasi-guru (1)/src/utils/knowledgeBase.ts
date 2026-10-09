import mammoth from 'mammoth';
import { db, type DokumenReferensiItem } from '../db';

/**
 * Parse file teks (seperti .txt, .md, .markdown) langsung menggunakan Browser File API (file.text() atau FileReader)
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

  // 1. Coba browser File API modern file.text()
  if (typeof file.text === 'function') {
    try {
      rawText = await file.text();
    } catch {
      rawText = '';
    }
  }

  // 2. Fallback menggunakan FileReader API
  if (!rawText) {
    rawText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve((event.target?.result as string) || '');
      };
      reader.onerror = () => {
        reject(new Error(`Gagal membaca file ${file.name} melalui browser FileReader API.`));
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error(`File ${file.name} kosong atau tidak memiliki teks yang dapat diparse.`);
  }

  const sizeKb = Math.round(file.size / 1024);
  const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, sizeKb)} KB`;
  const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
  const charCount = trimmed.length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const lineCount = trimmed.split(/\r\n|\r|\n/).length;

  // Cek keberadaan karakter Hanzi Mandarin (CJK Unified Ideographs)
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
 * Ekstraksi teks dari berbagai format file yang diunggah pengguna (DOCX, TXT, MD, JSON, CSV, PDF)
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

  // Dokumen teks murni & Markdown: Gunakan browser File API langsung
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
      throw new Error(`Gagal membaca file Word .docx: ${err?.message || 'Format tidak didukung'}`);
    }
  } else if (extension === 'pdf') {
    // Untuk file PDF sederhana atau jika text plain dapat dibaca
    try {
      const raw = await file.text();
      // Bersihkan karakter aneh jika teks murni
      const clean = raw.replace(/[^\x20-\x7E\s\u4e00-\u9fa5]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length > 50) {
        extractedText = clean;
      } else {
        throw new Error('PDF terenkripsi atau berbasis gambar pindai (scan). Mohon gunakan format dokumen teks .txt, Markdown .md, atau Word .docx.');
      }
    } catch (e: any) {
      throw new Error(e.message || 'File PDF tidak dapat diekstrak secara langsung. Disarankan mengunggah format teks .txt, .md, atau .docx.');
    }
  } else {
    // Coba fallback dengan File API
    try {
      const parsed = await parseTextDocumentViaFileAPI(file);
      return parsed;
    } catch {
      throw new Error(`Format .${extension} belum didukung. Silakan gunakan format teks .txt, .md (Markdown), atau .docx.`);
    }
  }

  // Bersihkan whitespace berlebihan
  const trimmed = extractedText.trim();
  if (!trimmed) {
    throw new Error('Dokumen yang diunggah kosong atau teks tidak dapat terbaca.');
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
 * Simpan dokumen baru ke dalam database IndexedDB pengetahuan AI
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
 * Ambil cuplikan ringkasan pengetahuan AI yang relevan dengan mata pelajaran saat ini
 * untuk diinjeksikan langsung ke dalam prompt AI (In-Context RAG Offline).
 */
export async function getActiveKnowledgeContext(targetMataPelajaran?: string): Promise<string> {
  try {
    const allDocs = await db.dokumen_referensi.toArray();
    const activeDocs = allDocs.filter(d => d.isAktif);

    if (activeDocs.length === 0) {
      return '';
    }

    // Urutkan prioritas: dokumen yang mata pelajarannya cocok terlebih dahulu, lalu 'Semua Mapel' / umum
    const normalizedTarget = (targetMataPelajaran || '').toLowerCase().trim();
    const relevantDocs = activeDocs.filter(d => {
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

    let output = `\n\n=== [DOKUMEN PEDOMAN KURIKULUM & MATERI YANG TELAH DIAJARKAN/DIUNGGAH OLEH GURU] ===\n`;
    output += `PENTING: Guru telah membekali Anda dengan dokumen referensi kurikulum dan bahan ajar lokal berikut ini. Anda WAJIB membaca, memahami, dan memprioritaskan pedoman, kaidah, kosakata (termasuk Hanzi, Pinyin, dan nada jika Bahasa Mandarin), dan format yang ada dalam dokumen ini:\n\n`;

    docsToUse.forEach((doc, idx) => {
      // Ambil hingga 2500 karakter per dokumen agar tidak membebani token tetapi mencukupi kebutuhan konteks
      const snippet = doc.kontenTeks.length > 2500 ? doc.kontenTeks.slice(0, 2500) + '\n...[bagian lanjutan disingkat]...' : doc.kontenTeks;
      output += `[Dokumen ${idx + 1}: ${doc.judul} (Mapel: ${doc.mataPelajaran} | Tipe: ${doc.kategori})]\n${snippet}\n\n`;
    });

    output += `=== [AKHIR DOKUMEN PEDOMAN GURU] ===\n\n`;
    return output;
  } catch (err) {
    console.warn('Gagal memuat dokumen referensi AI:', err);
    return '';
  }
}
