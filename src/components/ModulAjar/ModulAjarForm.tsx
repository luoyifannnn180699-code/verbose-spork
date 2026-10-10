import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Key,
  Check,
  FileDown,
  Loader2,
  Brain,
  FileCheck,
} from 'lucide-react';
import { db, type ModulAjarItem, type TeacherProfile } from '../../db';
import {
  generateModulAjarKurikulumMerdeka,
  formatModulAjarText,
  getActiveApiKey,
  getActiveAIConfig,
} from '../../utils/geminiAi';
import { exportModulAjarToWord } from '../../utils/exportWord';
import { ContohModulModal } from './ContohModulModal';
import { KnowledgeBaseModal } from '../KnowledgeBase/KnowledgeBaseModal';
import type { ContohModulTemplate } from '../../data/contohModulData';

interface ModulAjarFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  editItem?: ModulAjarItem | null;
  profile?: TeacherProfile;
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
}

const PROFIL_PANCASILA_OPTIONS = [
  'Bernalar Kritis',
  'Gotong Royong',
  'Mandiri',
  'Kreatif',
  'Berkebinekaan Global',
  'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
];

export const ModulAjarForm: React.FC<ModulAjarFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  profile,
  apiKey,
  onOpenApiKeyModal,
}) => {
  // Input Utama Sesuai Spesifikasi Singkat & Cepat
  const [mataPelajaran, setMataPelajaran] = useState('Matematika');
  const [kelas, setKelas] = useState('Kelas 7 (Fase D)');
  const [topik, setTopik] = useState('');
  const [alokasiWaktu, setAlokasiWaktu] = useState('2 JP (2 x 40 Menit)');
  const [langkahPembelajaran, setLangkahPembelajaran] = useState('');

  // AI State
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form Lanjutan Kurikulum Merdeka (Accordion)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState('');
  const [pertanyaanPemantik, setPertanyaanPemantik] = useState('');
  const [pemahamanBermakna, setPemahamanBermakna] = useState('');
  const [asesmenDiagnostik, setAsesmenDiagnostik] = useState('');
  const [asesmenFormatif, setAsesmenFormatif] = useState('');
  const [asesmenSumatif, setAsesmenSumatif] = useState('');
  const [profilPelajarPancasila, setProfilPelajarPancasila] = useState<string[]>([
    'Bernalar Kritis',
    'Gotong Royong',
    'Mandiri',
  ]);
  const [modelPembelajaran, setModelPembelajaran] = useState('Problem-Based Learning (PBL)');
  const [saranaPrasarana, setSaranaPrasarana] = useState('');

  // Knowledge Base & Preset Modal State
  const [isContohModalOpen, setIsContohModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  const handleApplyContoh = (modul: ContohModulTemplate) => {
    setMataPelajaran(modul.mataPelajaran);
    setKelas(modul.kelas);
    setTopik(modul.topik);
    setAlokasiWaktu(modul.alokasiWaktu);
    setModelPembelajaran(modul.modelPembelajaran);
    setProfilPelajarPancasila(modul.profilPancasila);
    setLangkahPembelajaran(modul.kontenLengkap);
    if (modul.dataParsed?.komponenInti?.tujuanPembelajaran) {
      setTujuanPembelajaran(modul.dataParsed.komponenInti.tujuanPembelajaran.join('\n'));
    }
    if (modul.dataParsed?.komponenInti?.pertanyaanPemantik) {
      setPertanyaanPemantik(modul.dataParsed.komponenInti.pertanyaanPemantik.join('\n'));
    }
    if (modul.dataParsed?.komponenInti?.pemahamanBermakna) {
      setPemahamanBermakna(modul.dataParsed.komponenInti.pemahamanBermakna);
    }
    if (modul.dataParsed?.komponenInti?.asesmen) {
      setAsesmenDiagnostik(modul.dataParsed.komponenInti.asesmen.diagnostik || '');
      setAsesmenFormatif(modul.dataParsed.komponenInti.asesmen.formatif || '');
      setAsesmenSumatif(modul.dataParsed.komponenInti.asesmen.sumatif || '');
    }
    if (modul.dataParsed?.informasiUmum?.saranaPrasarana) {
      setSaranaPrasarana(modul.dataParsed.informasiUmum.saranaPrasarana);
    }
    setShowAdvanced(true);
  };

  useEffect(() => {
    if (editItem) {
      setMataPelajaran(editItem.mataPelajaran || 'Matematika');
      setKelas(editItem.kelas || 'Kelas 7 (Fase D)');
      setTopik(editItem.topik || editItem.judulModul || '');
      setAlokasiWaktu(editItem.alokasiWaktu || '2 JP (2 x 40 Menit)');
      setLangkahPembelajaran(editItem.langkahPembelajaran || '');

      setTujuanPembelajaran(editItem.tujuanPembelajaran || '');
      setPertanyaanPemantik(editItem.pertanyaanPemantik || '');
      setPemahamanBermakna(editItem.pemahamanBermakna || '');
      setProfilPelajarPancasila(editItem.profilPelajarPancasila || ['Bernalar Kritis', 'Gotong Royong']);
      setModelPembelajaran(editItem.modelPembelajaran || 'Problem-Based Learning (PBL)');
      setSaranaPrasarana(editItem.saranaPrasarana || '');

      if (typeof editItem.asesmen === 'object') {
        setAsesmenDiagnostik(editItem.asesmen.diagnostik || '');
        setAsesmenFormatif(editItem.asesmen.formatif || '');
        setAsesmenSumatif(editItem.asesmen.sumatif || '');
      } else if (typeof editItem.asesmen === 'string') {
        setAsesmenFormatif(editItem.asesmen);
      }
    } else {
      if (profile) {
        setMataPelajaran(profile.mataPelajaranUtama || 'Matematika');
      }
      setTopik('');
      setAlokasiWaktu('2 JP (2 x 40 Menit)');
      setLangkahPembelajaran('');
      setTujuanPembelajaran('');
      setPertanyaanPemantik('');
      setPemahamanBermakna('');
      setAsesmenDiagnostik('');
      setAsesmenFormatif('');
      setAsesmenSumatif('');
      setSaranaPrasarana('Papan tulis, LKPD, proyektor, buku siswa.');
    }
    setAiError(null);
  }, [editItem, isOpen, profile]);

  if (!isOpen) return null;

  const togglePancasila = (dimensi: string) => {
    if (profilPelajarPancasila.includes(dimensi)) {
      setProfilPelajarPancasila(profilPelajarPancasila.filter((d) => d !== dimensi));
    } else {
      setProfilPelajarPancasila([...profilPelajarPancasila, dimensi]);
    }
  };

  // Generate Otomatis dengan AI (DeepSeek / Mode Gratis)
  const handleGenerateAI = async () => {
    if (!mataPelajaran.trim() || !topik.trim()) {
      alert('Mohon isi Mata Pelajaran dan Topik terlebih dahulu!');
      return;
    }

    const aiCfg = getActiveAIConfig();
    const activeKey = aiCfg.apiKey || getActiveApiKey(apiKey);
    if (aiCfg.provider !== 'free_pollinations' && !activeKey) {
      if (onOpenApiKeyModal) {
        onOpenApiKeyModal();
      } else {
        alert('Silakan masukkan API Key di menu atas terlebih dahulu!');
      }
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      const res = await generateModulAjarKurikulumMerdeka(activeKey, {
        mataPelajaran,
        kelas,
        topik,
        alokasiWaktu,
        modelPembelajaran,
        profilPancasila: profilPelajarPancasila,
      });

      // Menyusun teks gabungan untuk disimpan di Dexie / ditampilkan di editor
      const teksTersusun = formatModulAjarText(res);

      setLangkahPembelajaran(teksTersusun);

      // Sinkronisasi komponen rincian
      if (res.komponenInti?.tujuanPembelajaran) {
        setTujuanPembelajaran(
          Array.isArray(res.komponenInti.tujuanPembelajaran)
            ? res.komponenInti.tujuanPembelajaran.join('\n')
            : String(res.komponenInti.tujuanPembelajaran)
        );
      }
      if (res.komponenInti?.pertanyaanPemantik) {
        setPertanyaanPemantik(
          Array.isArray(res.komponenInti.pertanyaanPemantik)
            ? res.komponenInti.pertanyaanPemantik.join('\n')
            : String(res.komponenInti.pertanyaanPemantik)
        );
      }
      if (res.komponenInti?.pemahamanBermakna) {
        setPemahamanBermakna(res.komponenInti.pemahamanBermakna);
      }
      if (res.komponenInti?.asesmen) {
        setAsesmenDiagnostik(res.komponenInti.asesmen.diagnostik || '');
        setAsesmenFormatif(res.komponenInti.asesmen.formatif || '');
        setAsesmenSumatif(res.komponenInti.asesmen.sumatif || '');
      }
      if (res.informasiUmum?.saranaPrasarana) {
        setSaranaPrasarana(res.informasiUmum.saranaPrasarana);
      }

      onSuccess('✨ Modul Ajar Kurikulum Merdeka berhasil disiapkan oleh AI!');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Gagal menyusun modul ajar dengan Gemini AI.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);

    const data: Omit<ModulAjarItem, 'id'> = {
      mataPelajaran,
      kelas,
      topik,
      alokasiWaktu,
      langkahPembelajaran,
      tanggalBuat: editItem?.tanggalBuat || todayStr,
      judulModul: topik,
      semester: editItem?.semester || 'Ganjil',
      tahunAjaran: profile?.tahunAjaranAktif || '2024/2025',
      satuanPendidikan: profile?.satuanPendidikan || 'SMP Negeri 1 Merdeka Belajar',
      namaGuru: profile?.namaGuru || 'Siti Rahmawati, S.Pd.',
      nipGuru: profile?.nipGuru || '',
      namaKepalaSekolah: profile?.namaKepalaSekolah || 'Drs. H. Ahmad Fauzi, M.Pd.',
      nipKepalaSekolah: profile?.nipKepalaSekolah || '',
      tujuanPembelajaran,
      pertanyaanPemantik,
      pemahamanBermakna,
      asesmen: {
        diagnostik: asesmenDiagnostik,
        formatif: asesmenFormatif,
        sumatif: asesmenSumatif,
      },
      profilPelajarPancasila,
      saranaPrasarana,
      modelPembelajaran,
      targetPesertaDidik: 'Peserta didik reguler / tipikal',
      createdAt: editItem?.createdAt || now,
      updatedAt: now,
    };

    if (editItem?.id) {
      await db.modul_ajar.update(editItem.id, data);
      onSuccess('Modul Ajar berhasil diperbarui di IndexedDB!');
    } else {
      await db.modul_ajar.add(data);
      onSuccess('Modul Ajar berhasil disimpan secara offline!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {editItem ? 'Edit Modul Ajar' : 'Tambah Modul Ajar / Lesson Plan'}
              </h3>
              <p className="text-xs text-slate-500">
                Penyusunan modul Kurikulum Merdeka tersimpan 100% offline di browser (IndexedDB).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Helper Bar: Contoh Modul & Ajari AI */}
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50/50 to-rose-50/50 p-3.5 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Referensi & AI:</span>
              <button
                type="button"
                onClick={() => setIsContohModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-xl transition cursor-pointer shadow-2xs"
                title="Buka contoh modul ajar nyata khusus Mandarin atau mapel lain"
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                <span>🇨🇳 Contoh Modul (Mandarin & Mapel Lain)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-xl transition cursor-pointer shadow-2xs"
                title="Unggah file kurikulum/silabus Anda untuk diajarkan kepada AI"
              >
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>🧠 Ajari AI / Upload File</span>
              </button>
            </div>

            {/* Quick Mapel Switcher */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 hidden sm:inline">Pintasan:</span>
              <button
                type="button"
                onClick={() => {
                  setMataPelajaran('Bahasa Mandarin');
                  setKelas('Kelas 7 (Fase D)');
                  setTopik('Sapaan & Perkenalan Diri (问候与自我介绍)');
                }}
                className="px-2 py-0.5 font-bold rounded-lg bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 cursor-pointer"
              >
                🇨🇳 Mandarin
              </button>
              <button
                type="button"
                onClick={() => {
                  setMataPelajaran('Informatika');
                  setKelas('Kelas 7 (Fase D)');
                  setTopik('Berpikir Komputasional');
                }}
                className="px-2 py-0.5 font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
              >
                Informatika
              </button>
              <button
                type="button"
                onClick={() => {
                  setMataPelajaran('Matematika');
                  setKelas('Kelas 8 (Fase D)');
                  setTopik('Sistem Persamaan Linear Dua Variabel (SPLDV)');
                }}
                className="px-2 py-0.5 font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
              >
                Matematika
              </button>
            </div>
          </div>

          {/* Baris 1: Mata Pelajaran & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mata Pelajaran *
              </label>
              <input
                type="text"
                placeholder="cth: Matematika, Bahasa Indonesia"
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas / Fase *
              </label>
              <input
                type="text"
                placeholder="cth: Kelas 7 (Fase D)"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Baris 2: Topik & Alokasi Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik / Materi Utama *
              </label>
              <input
                type="text"
                placeholder="cth: Operasi Hitung Bilangan Bulat, Teks Deskripsi"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alokasi Waktu
              </label>
              <input
                type="text"
                placeholder="cth: 2 JP (2 x 40 Menit)"
                value={alokasiWaktu}
                onChange={(e) => setAlokasiWaktu(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Tombol AI Generator */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={loadingAI}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>⏳ Menyusun Modul dengan AI (DeepSeek)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>✨ Generate Isi Modul Otomatis (DeepSeek / Mode Gratis)</span>
                </>
              )}
            </button>

            {aiError && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {aiError}
              </div>
            )}
          </div>

          {/* Langkah Pembelajaran Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Langkah-Langkah Pembelajaran (Pendahuluan, Inti, Penutup) *
            </label>
            <textarea
              placeholder="A. Pendahuluan (10 Menit): Salam, apersepsi, tujuan...\nB. Kegiatan Inti (60 Menit): Eksplorasi, diskusi, presentasi...\nC. Penutup (10 Menit): Refleksi, rangkuman, kuis formatif, doa."
              value={langkahPembelajaran}
              onChange={(e) => setLangkahPembelajaran(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm h-36 font-sans focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
              required
            />
          </div>

          {/* Toggle Accordion: Kurikulum Merdeka Lengkap (Opsional) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>Rincian Kurikulum Merdeka Lengkap (Tujuan, Pemantik, Asesmen & Pancasila)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Opsional
                </span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-white border-t border-slate-200 space-y-3.5 text-xs">
                {/* Profil Pelajar Pancasila */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Dimensi Profil Pelajar Pancasila:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROFIL_PANCASILA_OPTIONS.map((dimensi) => {
                      const isChecked = profilPelajarPancasila.includes(dimensi);
                      return (
                        <button
                          key={dimensi}
                          type="button"
                          onClick={() => togglePancasila(dimensi)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                          <span>{dimensi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tujuan & Pemantik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tujuan Pembelajaran (TP)
                    </label>
                    <textarea
                      rows={2}
                      value={tujuanPembelajaran}
                      onChange={(e) => setTujuanPembelajaran(e.target.value)}
                      placeholder="1. Peserta didik dapat..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pertanyaan Pemantik
                    </label>
                    <textarea
                      rows={2}
                      value={pertanyaanPemantik}
                      onChange={(e) => setPertanyaanPemantik(e.target.value)}
                      placeholder="Mengapa materi ini penting..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Asesmen */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Asesmen Diagnostik
                    </label>
                    <textarea
                      rows={2}
                      value={asesmenDiagnostik}
                      onChange={(e) => setAsesmenDiagnostik(e.target.value)}
                      placeholder="Tanya jawab apersepsi..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Asesmen Formatif
                    </label>
                    <textarea
                      rows={2}
                      value={asesmenFormatif}
                      onChange={(e) => setAsesmenFormatif(e.target.value)}
                      placeholder="Observasi diskusi kelompok..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Asesmen Sumatif
                    </label>
                    <textarea
                      rows={2}
                      value={asesmenSumatif}
                      onChange={(e) => setAsesmenSumatif(e.target.value)}
                      placeholder="Tes akhir lingkup materi..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Database Lokal</span>
            </button>
          </div>
        </form>
      </div>

      {/* Catalog Preset Modal */}
      <ContohModulModal
        isOpen={isContohModalOpen}
        onClose={() => setIsContohModalOpen(false)}
        onSelectModul={handleApplyContoh}
        onNotify={onSuccess}
      />

      {/* Knowledge Base (Ajari AI) Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onNotify={onSuccess}
        defaultMataPelajaran={mataPelajaran}
      />
    </div>
  );
};
