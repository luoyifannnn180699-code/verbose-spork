import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  X,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Brain,
  Sparkles,
  BookOpen,
  FolderOpen,
  Eye,
  Check,
  FileCheck,
  Plus,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Database,
  Code2,
  Edit3,
  Layers,
  Copy,
} from 'lucide-react';
import { db, type DokumenReferensiItem } from '../../db';
import {
  extractTextFromFile,
  parseTextDocumentViaFileAPI,
  simpanDokumenReferensi,
} from '../../utils/knowledgeBase';

interface ParsedFileItem {
  file: File;
  name: string;
  sizeStr: string;
  type: string;
  charCount: number;
  wordCount: number;
  lineCount: number;
  hasChineseChars: boolean;
  text: string;
  judul: string;
  mapel: string;
  kategori: string;
  fase: string;
}

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
  defaultMataPelajaran?: string;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  defaultMataPelajaran = 'Bahasa Mandarin',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'list'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<DokumenReferensiItem | null>(null);

  // File Upload State (Browser File API)
  const [parsedFiles, setParsedFiles] = useState<ParsedFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isEditingParsedText, setIsEditingParsedText] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Form Manual Input State
  const [manualJudul, setManualJudul] = useState<string>('');
  const [manualMapel, setManualMapel] = useState<string>(defaultMataPelajaran || 'Bahasa Mandarin');
  const [manualKategori, setManualKategori] = useState<string>('Kurikulum / CP');
  const [manualKonten, setManualKonten] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Query live documents from dedicated Dexie table: db.dokumen_referensi
  const dokumenList = useLiveQuery(
    () => db.dokumen_referensi.orderBy('createdAt').reverse().toArray(),
    []
  );

  if (!isOpen) return null;

  const totalAktif = dokumenList?.filter((d) => d.isAktif).length || 0;
  const currentItem = parsedFiles[activeFileIndex] || null;

  // Process files directly using browser File API
  const processFilesViaFileAPI = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const parsedResults: ParsedFileItem[] = [];

      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';

        let extracted;
        if (['txt', 'md', 'markdown', 'text', 'json', 'csv', 'tsv'].includes(ext)) {
          // Direct browser File API parsing
          extracted = await parseTextDocumentViaFileAPI(file);
        } else {
          // Docx / PDF / other parsing
          extracted = await extractTextFromFile(file);
        }

        const baseTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        const isMandarin =
          (file.name + ' ' + extracted.text.slice(0, 600)).toLowerCase().includes('mandarin') ||
          (file.name + ' ' + extracted.text.slice(0, 600)).toLowerCase().includes('hanyu') ||
          (file.name + ' ' + extracted.text.slice(0, 600)).toLowerCase().includes('chinese') ||
          !!extracted.hasChineseChars;

        parsedResults.push({
          file,
          name: file.name,
          sizeStr: extracted.sizeStr,
          type: extracted.type || ext,
          charCount: extracted.charCount || extracted.text.length,
          wordCount: extracted.wordCount || extracted.text.split(/\s+/).filter(Boolean).length,
          lineCount: extracted.lineCount || extracted.text.split(/\n/).length,
          hasChineseChars: !!extracted.hasChineseChars,
          text: extracted.text,
          judul: baseTitle,
          mapel: isMandarin ? 'Bahasa Mandarin' : (defaultMataPelajaran || 'Semua Mapel'),
          kategori: ext === 'md' ? 'Silabus' : 'Kurikulum / CP',
          fase: 'Semua Fase',
        });
      }

      setParsedFiles(parsedResults);
      setActiveFileIndex(0);
      setIsEditingParsedText(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membaca isi dokumen menggunakan browser File API.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFilesViaFileAPI(e.dataTransfer.files);
    }
  };

  // Input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFilesViaFileAPI(e.target.files);
    }
  };

  // Save the currently active parsed file to dedicated Dexie table
  const handleSaveCurrentFile = async () => {
    if (!currentItem || !currentItem.text.trim()) {
      setErrorMessage('Dokumen kosong atau belum diparse.');
      return;
    }
    if (!currentItem.judul.trim()) {
      setErrorMessage('Judul dokumen wajib diisi.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await simpanDokumenReferensi({
        judul: currentItem.judul.trim(),
        mataPelajaran: currentItem.mapel.trim(),
        kategori: currentItem.kategori,
        tipeFile: currentItem.type,
        namaFile: currentItem.name,
        ukuranFile: currentItem.sizeStr,
        kontenTeks: currentItem.text,
        faseKelas: currentItem.fase,
        isAktif: true,
      });

      // Remove from queue or reset if last
      const remaining = parsedFiles.filter((_, idx) => idx !== activeFileIndex);
      setParsedFiles(remaining);
      setActiveFileIndex(0);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (remaining.length === 0) {
        setActiveTab('list');
      }

      onNotify?.(`✨ Dokumen "${currentItem.judul}" berhasil disimpan ke tabel Dexie untuk konteks AI!`);
    } catch (err: any) {
      setErrorMessage(`Gagal menyimpan ke Dexie: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save all parsed files at once to dedicated Dexie table
  const handleSaveAllFiles = async () => {
    if (parsedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      for (const item of parsedFiles) {
        await simpanDokumenReferensi({
          judul: item.judul.trim() || item.name,
          mataPelajaran: item.mapel.trim() || 'Semua Mapel',
          kategori: item.kategori,
          tipeFile: item.type,
          namaFile: item.name,
          ukuranFile: item.sizeStr,
          kontenTeks: item.text,
          faseKelas: item.fase,
          isAktif: true,
        });
      }

      setParsedFiles([]);
      setActiveFileIndex(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('list');
      onNotify?.(`✨ Berhasil menyimpan ${parsedFiles.length} dokumen ke tabel Dexie AI context!`);
    } catch (err: any) {
      setErrorMessage(`Gagal menyimpan batch dokumen: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to load sample files via File API for quick testing
  const handleLoadSampleFile = (type: 'mandarin-md' | 'kurikulum-txt') => {
    let sampleContent = '';
    let fileName = '';

    if (type === 'mandarin-md') {
      fileName = 'Silabus_Bahasa_Mandarin_Fase_D.md';
      sampleContent = `# PEDOMAN PEMBELAJARAN BAHASA MANDARIN (Fase D / SMP)

## Capaian Pembelajaran (CP) Elemen Menyimak & Berbicara:
Peserta didik mampu memahami instruksi lisan sederhana, memperkenalkan identitas diri dan anggota keluarga, serta merespon sapaan harian dengan pelafalan Shengmu (konsonan), Yunmu (vokal), dan Shengdiao (nada 1-4) yang tepat.

## Kosakata Inti Pembelajaran (Shengci):
1. 你好 (nǐ hǎo) = Halo / Apa kabar
2. 谢谢 (xièxie) = Terima kasih
3. 不客气 (bù kèqi) = Sama-sama
4. 再见 (zàijiàn) = Sampai jumpa
5. 爸爸 (bàba) = Ayah
6. 妈妈 (māma) = Ibu
7. 老师 (lǎoshī) = Guru
8. 学生 (xuésheng) = Siswa

## Aturan Sintaks & Tata Bahasa:
- Pola kalimat deklaratif: Subjek + 是 (shì) + Objek (Contoh: 我是学生 - Wǒ shì xuésheng)
- Pola kepemilikan: Subjek + 的 (de) + Kata Benda (Contoh: 我的老师 - Wǒ de lǎoshī)
- Soal evaluasi harus menyertakan Hanzi baku, Pinyin bertanda nada akurat, dan arti bahasa Indonesia.`;
    } else {
      fileName = 'Standar_Capaian_Pembelajaran_Merdeka.txt';
      sampleContent = `STANDAR CAPAIAN PEMBELAJARAN KURIKULUM MERDEKA
KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI

A. PRINSIP UTAMA MODUL AJAR:
1. Berpusat pada peserta didik (Student-Centered Learning).
2. Memuat Profil Pelajar Pancasila: Bernalar Kritis, Kreatif, dan Gotong Royong.
3. Asesmen Berkelanjutan: Asesmen Diagnostik (Awal), Asesmen Formatif (Proses), dan Asesmen Sumatif (Akhir).

B. FORMAT SISTEMATIKA MODUL AJAR:
- Identitas Umum (Nama Guru, Satuan Pendidikan, Fase/Kelas, Alokasi Waktu).
- Komponen Inti (Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik).
- Kegiatan Pembelajaran (Pendahuluan, Inti dengan sintaks model pembelajaran PBL/PjBL, Penutup).
- Lampiran (LKPD / Lembar Kerja Peserta Didik, Rubrik Asesmen, Glosarium).`;
    }

    const mime = type === 'mandarin-md' ? 'text/markdown' : 'text/plain';
    const sampleBlob = new Blob([sampleContent], { type: mime });
    const sampleFile = new File([sampleBlob], fileName, { type: mime, lastModified: Date.now() });

    processFilesViaFileAPI([sampleFile]);
  };

  // Handler simpan teks manual
  const handleSaveManualDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJudul.trim() || !manualKonten.trim()) {
      setErrorMessage('Judul dan isi teks materi wajib diisi.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await simpanDokumenReferensi({
        judul: manualJudul.trim(),
        mataPelajaran: manualMapel.trim(),
        kategori: manualKategori,
        tipeFile: 'txt',
        namaFile: `${manualJudul.replace(/\s+/g, '_').slice(0, 25)}.txt`,
        ukuranFile: `${Math.max(1, Math.round(manualKonten.length / 1024))} KB`,
        kontenTeks: manualKonten.trim(),
        faseKelas: 'Semua Fase',
        isAktif: true,
      });

      setManualJudul('');
      setManualKonten('');
      setActiveTab('list');
      onNotify?.('✨ Materi teks berhasil disimpan ke tabel Dexie memori AI!');
    } catch (err: any) {
      setErrorMessage(`Gagal menyimpan materi: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle status aktif dokumen
  const handleToggleAktif = async (doc: DokumenReferensiItem) => {
    if (!doc.id) return;
    try {
      await db.dokumen_referensi.update(doc.id, {
        isAktif: !doc.isAktif,
        updatedAt: Date.now(),
      });
      onNotify?.(
        !doc.isAktif
          ? `📖 Dokumen "${doc.judul}" sekarang aktif dijadikan acuan AI.`
          : `⏸️ Dokumen "${doc.judul}" dinonaktifkan dari acuan AI.`
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  // Hapus dokumen
  const handleDeleteDoc = async (doc: DokumenReferensiItem) => {
    if (!doc.id) return;
    if (confirm(`Hapus dokumen "${doc.judul}" dari memori AI?`)) {
      await db.dokumen_referensi.delete(doc.id);
      if (selectedDocPreview?.id === doc.id) setSelectedDocPreview(null);
      onNotify?.('🗑️ Dokumen referensi berhasil dihapus dari tabel Dexie.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs shadow-xs">
              <Brain className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">Pusat Referensi & Ajari AI Guru</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" /> Dexie AI Context
                </span>
                <span className="text-[10px] font-bold bg-indigo-500/40 text-white border border-white/20 px-2 py-0.5 rounded-full">
                  Browser File API Ready (.txt, .md)
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Unggah & parse dokumen teks langsung dari peramban Anda. Dokumen disimpan di tabel Dexie lokal dan diinjeksikan otomatis sebagai konteks AI saat menyusun Modul & Soal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('upload');
                setErrorMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Unggah Dokumen File API (.txt, .md, .docx)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('manual');
                setErrorMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Ketik / Tempel Teks Silabus</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('list');
                setErrorMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-purple-600" />
              <span>Tabel Dexie AI Context</span>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-full">
                {dokumenList?.length || 0}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{totalAktif} Dokumen Aktif</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* TAB 1: UPLOAD & PARSE DOKUMEN DENGAN BROWSER FILE API */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                {/* Header info & Sample loader */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      Unggah File Teks (.txt, .md, .markdown) atau Word (.docx)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Diparsing langsung di browser menggunakan File API (tanpa dikirim ke server pihak ketiga).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Uji Coba Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleFile('mandarin-md')}
                      className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Muat contoh format silabus Mandarin Markdown"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      .md Mandarin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleFile('kurikulum-txt')}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Muat contoh standar CP Kurikulum Merdeka Teks"
                    >
                      <FileText className="w-3 h-3 text-slate-600" />
                      .txt Standar CP
                    </button>
                  </div>
                </div>

                {/* File Drop Area with Drag and Drop Support */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group ${
                    isDraggingOver
                      ? 'border-indigo-600 bg-indigo-100/70 scale-[1.01]'
                      : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".txt,.md,.markdown,.text,.docx,.pdf,.json,.csv"
                    multiple
                    className="hidden"
                  />

                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-700 py-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      <span className="text-xs font-bold">Membaca dan mem-parse dokumen via browser File API...</span>
                    </div>
                  ) : parsedFiles.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 py-1">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900">
                          {parsedFiles.length} file berhasil diparse dari File API
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Klik untuk memilih file lain atau tarik & letakkan file tambahan di sini.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-indigo-100/70 text-indigo-700 rounded-2xl group-hover:scale-105 transition">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Tarik & letakkan file dokumen ke sini, atau klik untuk memilih
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex flex-wrap justify-center items-center gap-1.5">
                          Format diutamakan:
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">.txt (Text)</span>
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded">.md (Markdown)</span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded">.docx (Word)</span>
                          <span>(Mendukung multi-file sekaligus)</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Multi-file tabs if more than 1 file parsed */}
                {parsedFiles.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">File Terpilih:</span>
                    {parsedFiles.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveFileIndex(idx)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                          activeFileIndex === idx
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className="uppercase text-[9px] px-1 bg-black/20 rounded font-mono">
                          {p.type}
                        </span>
                        <span className="max-w-[140px] truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Parsed File Details & Editor */}
                {currentItem && (
                  <div className="space-y-4 pt-1">
                    {/* File Statistics Banner */}
                    <div className="p-3 bg-slate-900 text-slate-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="uppercase font-mono font-black px-2 py-0.5 bg-indigo-500 text-white rounded text-[10px]">
                          .{currentItem.type}
                        </span>
                        <span className="font-bold text-white max-w-[200px] sm:max-w-xs truncate">
                          {currentItem.name}
                        </span>
                        {currentItem.hasChineseChars && (
                          <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-700/60 font-bold text-[10px] rounded-full">
                            🇨🇳 Terdeteksi Karakter Hanzi / Mandarin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Ukuran: <strong className="text-slate-200">{currentItem.sizeStr}</strong></span>
                        <span>&bull;</span>
                        <span>Karakter: <strong className="text-slate-200">{currentItem.charCount.toLocaleString()}</strong></span>
                        <span>&bull;</span>
                        <span>Kata: <strong className="text-slate-200">{currentItem.wordCount.toLocaleString()}</strong></span>
                        <span>&bull;</span>
                        <span>Baris: <strong className="text-slate-200">{currentItem.lineCount}</strong></span>
                      </div>
                    </div>

                    {/* Metadata Input Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Judul Dokumen di Tabel Dexie <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentItem.judul}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParsedFiles((prev) =>
                              prev.map((item, idx) => (idx === activeFileIndex ? { ...item, judul: val } : item))
                            );
                          }}
                          placeholder="Contoh: Silabus Bahasa Mandarin Fase D SMP Kelas 7"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mata Pelajaran Terkait <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentItem.mapel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParsedFiles((prev) =>
                              prev.map((item, idx) => (idx === activeFileIndex ? { ...item, mapel: val } : item))
                            );
                          }}
                          placeholder="Contoh: Bahasa Mandarin, Informatika, Semua Mapel"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kategori Dokumen
                        </label>
                        <select
                          value={currentItem.kategori}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParsedFiles((prev) =>
                              prev.map((item, idx) => (idx === activeFileIndex ? { ...item, kategori: val } : item))
                            );
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                        >
                          <option value="Kurikulum / CP">Kurikulum / Capaian Pembelajaran (CP)</option>
                          <option value="Silabus">Silabus / ATP Pembelajaran</option>
                          <option value="Bahan Ajar / Materi">Bahan Ajar / Daftar Kosakata & Materi</option>
                          <option value="Contoh Modul">Contoh Modul Ajar Acuan</option>
                          <option value="Pedoman Guru">Pedoman Guru & Rubrik Penilaian</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fase / Jenjang Kelas
                        </label>
                        <select
                          value={currentItem.fase}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParsedFiles((prev) =>
                              prev.map((item, idx) => (idx === activeFileIndex ? { ...item, fase: val } : item))
                            );
                          }}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                        >
                          <option value="Semua Fase">Semua Fase (Umum)</option>
                          <option value="Fase D (SMP Kelas 7-9)">Fase D (SMP Kelas 7-9)</option>
                          <option value="Fase E (SMA Kelas 10)">Fase E (SMA Kelas 10)</option>
                          <option value="Fase F (SMA Kelas 11-12)">Fase F (SMA Kelas 11-12)</option>
                        </select>
                      </div>
                    </div>

                    {/* Preview / Edit of Parsed Text Content */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          Hasil Parse Dokumen (Konteks yang Akan Disimpan ke Dexie):
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentItem.text);
                              setCopiedPreview(true);
                              setTimeout(() => setCopiedPreview(false), 1500);
                            }}
                            className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedPreview ? 'Disalin!' : 'Salin'}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingParsedText(!isEditingParsedText)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            {isEditingParsedText ? 'Kunci Teks' : 'Edit Teks'}
                          </button>
                        </div>
                      </div>

                      {isEditingParsedText ? (
                        <textarea
                          rows={8}
                          value={currentItem.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParsedFiles((prev) =>
                              prev.map((item, idx) =>
                                idx === activeFileIndex
                                  ? {
                                      ...item,
                                      text: val,
                                      charCount: val.length,
                                      wordCount: val.split(/\s+/).filter(Boolean).length,
                                      lineCount: val.split(/\n/).length,
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-full p-3 font-mono text-[11px] leading-relaxed border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white text-slate-800"
                        />
                      ) : (
                        <div className="bg-slate-950 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto border border-slate-800 whitespace-pre-wrap select-all">
                          {currentItem.text.slice(0, 3500)}
                          {currentItem.text.length > 3500 && (
                            <span className="text-amber-400 italic">
                              {'\n'}...[bagian teks lanjutan ({currentItem.text.length.toLocaleString()} karakter) lengkap tersimpan di tabel Dexie]...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Tersimpan di IndexedDB tabel: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">dokumen_referensi</code></span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {parsedFiles.length > 1 && (
                          <button
                            type="button"
                            onClick={handleSaveAllFiles}
                            disabled={isProcessing}
                            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Simpan Semua ({parsedFiles.length} File)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleSaveCurrentFile}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 hover:from-purple-800 hover:to-indigo-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                          <Brain className="w-4 h-4 text-amber-300" />
                          <span>Simpan ke Memori AI (Dexie)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL TEXT INPUT */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSaveManualDoc} className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Catatan / Dokumen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualJudul}
                      onChange={(e) => setManualJudul(e.target.value)}
                      placeholder="Contoh: Silabus Kosakata & Tata Bahasa Mandarin SMP"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualMapel}
                      onChange={(e) => setManualMapel(e.target.value)}
                      placeholder="Contoh: Bahasa Mandarin, Semua Mapel"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teks Materi, Silabus, atau Format Baku Kurikulum <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={manualKonten}
                    onChange={(e) => setManualKonten(e.target.value)}
                    placeholder="Salin atau ketik teks materi kurikulum Anda di sini... (Misal daftar kosakata Hanzi, Pinyin, nada, aturan tata bahasa, capaian pembelajaran, atau sintaks modul yang Anda inginkan agar dipatuhi AI)."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tip: Teks akan disimpan ke tabel Dexie <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">dokumen_referensi</code> dan otomatis diumpankan ke AI saat menyusun Modul Ajar dan Bank Soal.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan ke Tabel Dexie AI</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: DAFTAR MEMORI REFERENSI DI TABEL DEXIE */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Berikut adalah dokumen yang tersimpan dalam tabel Dexie IndexedDB <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">dokumen_referensi</code>. Dokumen dengan status <strong>Aktif</strong> otomatis diinjeksikan ke prompt AI.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah File Baru (.txt/.md)</span>
                </button>
              </div>

              {!dokumenList || dokumenList.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl inline-block">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Tabel Dexie AI Context Masih Kosong</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Unggah file teks .txt atau .md silabus Anda agar AI dapat membaca dan memahami pedoman kurikulum Anda.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleLoadSampleFile('mandarin-md')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Muat Contoh .md Mandarin</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah File Dokumen</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dokumenList.map((doc) => {
                    const isMandarin =
                      (doc.mataPelajaran || '').toLowerCase().includes('mandarin') ||
                      (doc.judul || '').toLowerCase().includes('mandarin');

                    const isMd = doc.tipeFile?.toLowerCase() === 'md';
                    const isTxt = doc.tipeFile?.toLowerCase() === 'txt';

                    return (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition bg-white ${
                          doc.isAktif
                            ? 'border-indigo-300 shadow-xs'
                            : 'border-slate-200 opacity-70 bg-slate-50/60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isMandarin
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}
                              >
                                {doc.mataPelajaran}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {doc.kategori}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                                  isMd
                                    ? 'bg-purple-100 text-purple-800'
                                    : isTxt
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                .{doc.tipeFile}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {doc.ukuranFile || '10 KB'} &bull; {doc.kontenTeks?.length.toLocaleString() || 0} karakter
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">{doc.judul}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{doc.ringkasan}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* Toggle Aktif */}
                            <button
                              type="button"
                              onClick={() => handleToggleAktif(doc)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                                doc.isAktif
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title={doc.isAktif ? 'Klik untuk nonaktifkan acuan AI' : 'Klik untuk aktifkan acuan AI'}
                            >
                              {doc.isAktif ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                                  <span>Aktif di AI</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                                  <span>Nonaktif</span>
                                </>
                              )}
                            </button>

                            {/* Preview */}
                            <button
                              type="button"
                              onClick={() => setSelectedDocPreview(doc)}
                              className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                              title="Lihat teks konteks lengkap"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc)}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer"
                              title="Hapus dari tabel Dexie"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Doc Preview Modal Overlay */}
        {selectedDocPreview && (
          <div className="absolute inset-0 z-20 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedDocPreview.judul}</h4>
                  <p className="text-xs text-slate-500">
                    Mapel: {selectedDocPreview.mataPelajaran} &bull; Tipe: .{selectedDocPreview.tipeFile} &bull; {selectedDocPreview.kontenTeks.length.toLocaleString()} karakter
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDocPreview(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed bg-slate-950 text-slate-100 whitespace-pre-wrap select-all">
                {selectedDocPreview.kontenTeks}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Tersimpan di Dexie <code className="text-indigo-600 font-mono">dokumen_referensi</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedDocPreview.kontenTeks);
                      onNotify?.('Teks dokumen berhasil disalin ke clipboard.');
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
                  >
                    Salin Teks
                  </button>
                  <button
                    onClick={() => setSelectedDocPreview(null)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl cursor-pointer"
                  >
                    Tutup Pratinjau
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
