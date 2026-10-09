import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Trash2,
  Save,
  HelpCircle,
  FileQuestion,
  Flame,
  Check,
  Brain,
} from 'lucide-react';
import { db, type SoalItem, type TeacherProfile } from '../../db';
import { generateSoalAI, type SoalItemAI, getActiveApiKey } from '../../utils/geminiAi';
import { getActiveAIConfig, AI_PROVIDERS_METADATA } from '../../utils/aiEngine';
import { KnowledgeBaseModal } from '../KnowledgeBase/KnowledgeBaseModal';

interface BankSoalAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  profile?: TeacherProfile;
  apiKey?: string;
  onOpenApiKeyModal: () => void;
}

export const BankSoalAIModal: React.FC<BankSoalAIModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  profile,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const [mataPelajaran, setMataPelajaran] = useState(profile?.mataPelajaranUtama || 'Matematika');
  const [faseKelas, setFaseKelas] = useState('Fase D (Kelas 7 SMP)');
  const [topik, setTopik] = useState('');
  const [bentukSoal, setBentukSoal] = useState<'Pilihan Ganda' | 'Essay' | 'Campuran'>('Pilihan Ganda');
  const [jumlahSoal, setJumlahSoal] = useState<number>(5);
  const [tingkatKesulitan, setTingkatKesulitan] = useState<'Mudah' | 'Sedang' | 'Sukar' | 'HOTS'>('HOTS');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedList, setGeneratedList] = useState<SoalItemAI[]>([]);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  if (!isOpen) return null;

  const aiCfg = getActiveAIConfig();
  const activeKey = aiCfg.apiKey || getActiveApiKey(apiKey);
  const isAIReady = aiCfg.provider === 'free_pollinations' || Boolean(activeKey && activeKey.trim());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topik.trim()) {
      setErrorMsg('Harap masukkan materi atau topik pembelajaran!');
      return;
    }

    if (!isAIReady) {
      onOpenApiKeyModal();
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setGeneratedList([]);

    try {
      const items = await generateSoalAI(activeKey, {
        mataPelajaran,
        kelas: faseKelas,
        topik,
        bentukSoal,
        jumlahSoal,
        tingkatKesulitan,
      });

      if (!items || items.length === 0) {
        throw new Error('Tidak ada butir soal yang berhasil dibentuk oleh AI.');
      }

      setGeneratedList(items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal membuat soal. Periksa koneksi internet atau pengaturan AI Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setGeneratedList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (generatedList.length === 0) return;

    const now = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10);

    const itemsToSave: Omit<SoalItem, 'id'>[] = generatedList.map((item) => {
      const isPG = item.bentukSoal === 'Pilihan Ganda';
      return {
        mataPelajaran,
        kelas: faseKelas,
        faseKelas,
        kurikulum: 'Kurikulum Merdeka',
        bentukSoal: item.bentukSoal || (isPG ? 'Pilihan Ganda' : 'Uraian / Essay'),
        jenisSoal: item.bentukSoal || (isPG ? 'Pilihan Ganda' : 'Uraian / Essay'),
        tingkatKesulitan: item.tingkatKesulitan || tingkatKesulitan,
        materiPokok: topik,
        tujuanPembelajaran: `Peserta didik mampu memahami dan menganalisis materi ${topik}.`,
        pertanyaan: item.pertanyaan,
        opsi: isPG && item.opsi ? item.opsi : [],
        pilihanJawaban: isPG && item.opsi ? item.opsi : [],
        kunciJawaban: item.kunciJawaban || '-',
        pembahasan: item.pembahasan || '',
        bobotNilai: item.bobotNilai || 10,
        tahunAjaran: profile?.tahunAjaranAktif || '2024/2025',
        tanggalBuat: dateStr,
        createdAt: now,
        updatedAt: now,
      };
    });

    try {
      await db.bank_soal.bulkAdd(itemsToSave);
      onSuccess(`Berhasil menyimpan ${itemsToSave.length} butir soal ke Bank Soal offline!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal menyimpan soal ke IndexedDB.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Generate Butir Soal Asesmen (AI)</h3>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase">
                  {AI_PROVIDERS_METADATA[aiCfg.provider]?.badge || 'DeepSeek AI'}
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Buat sekumpulan butir soal HOTS / Kurikulum Merdeka otomatis dengan kunci jawaban & pembahasan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Form Input Generator */}
          <form onSubmit={handleGenerate} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            {/* Quick Helper Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Pintasan Mapel:</span>
                <button
                  type="button"
                  onClick={() => {
                    setMataPelajaran('Bahasa Mandarin');
                    setFaseKelas('Fase D (Kelas 7 SMP)');
                    setTopik('Sapaan, Perkenalan & Kosakata Sehari-hari (问候与自我介绍)');
                  }}
                  className="px-2 py-0.5 font-bold rounded-lg bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 cursor-pointer"
                >
                  🇨🇳 Bahasa Mandarin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMataPelajaran('Informatika');
                    setFaseKelas('Fase D (Kelas 7 SMP)');
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
                    setFaseKelas('Fase D (Kelas 8 SMP)');
                    setTopik('Sistem Persamaan Linear Dua Variabel');
                  }}
                  className="px-2 py-0.5 font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                >
                  Matematika
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsKnowledgeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition cursor-pointer"
                title="Unggah file kisi-kisi atau materi agar AI membuat soal persis sesuai acuan"
              >
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>Ajari AI dengan File Kurikulum</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  value={mataPelajaran}
                  onChange={(e) => setMataPelajaran(e.target.value)}
                  placeholder="Contoh: Matematika, IPA, Bahasa Indonesia"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fase / Jenjang Kelas</label>
                <select
                  value={faseKelas}
                  onChange={(e) => setFaseKelas(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Fase D (Kelas 7 SMP)">Fase D (Kelas 7 SMP)</option>
                  <option value="Fase D (Kelas 8 SMP)">Fase D (Kelas 8 SMP)</option>
                  <option value="Fase D (Kelas 9 SMP)">Fase D (Kelas 9 SMP)</option>
                  <option value="Fase E (Kelas 10 SMA)">Fase E (Kelas 10 SMA)</option>
                  <option value="Fase F (Kelas 11 SMA)">Fase F (Kelas 11 SMA)</option>
                  <option value="Fase F (Kelas 12 SMA)">Fase F (Kelas 12 SMA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bentuk Soal</label>
                <select
                  value={bentukSoal}
                  onChange={(e) => setBentukSoal(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Pilihan Ganda">Pilihan Ganda (Opsi A-D)</option>
                  <option value="Essay">Uraian / Essay</option>
                  <option value="Campuran">Campuran (PG & Essay)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topik / Pokok Bahasan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  placeholder="Contoh: Operasi Aljabar, Ekosistem & Rantai Makanan, Cerita Fantasi"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Soal</label>
                  <select
                    value={jumlahSoal}
                    onChange={(e) => setJumlahSoal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value={3}>3 Butir</option>
                    <option value={5}>5 Butir</option>
                    <option value={10}>10 Butir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={tingkatKesulitan}
                    onChange={(e) => setTingkatKesulitan(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="HOTS">HOTS (C4-C6)</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Mudah">Mudah</option>
                    <option value="Sukar">Sukar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generate Trigger */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Mesin Aktif:</span>
                <span className="font-semibold text-slate-700">{AI_PROVIDERS_METADATA[aiCfg.provider]?.name}</span>
                <button
                  type="button"
                  onClick={onOpenApiKeyModal}
                  className="text-indigo-600 hover:underline font-bold text-[11px] ml-1 cursor-pointer"
                >
                  (Ubah)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>{loading ? 'AI Sedang Menyusun Soal...' : 'Mulai Generate Soal'}</span>
              </button>
            </div>
          </form>

          {/* Generated Preview List */}
          {generatedList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Hasil ({generatedList.length} Butir Soal Terbentuk)
                </h4>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Semua ({generatedList.length}) ke Bank Soal</span>
                </button>
              </div>

              <div className="space-y-3">
                {generatedList.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.bentukSoal}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {item.tingkatKesulitan || tingkatKesulitan}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus butir ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pl-8">
                      {item.pertanyaan}
                    </p>

                    {item.opsi && item.opsi.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
                        {item.opsi.map((ops, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg text-xs border ${
                              item.kunciJawaban && (ops.startsWith(item.kunciJawaban) || ops.includes(item.kunciJawaban))
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {ops}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pl-8 pt-1 text-xs space-y-1">
                      <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kunci Jawaban: {item.kunciJawaban}</span>
                      </div>
                      {item.pembahasan && (
                        <div className="text-slate-600 italic bg-slate-50 p-2 rounded-lg text-[11px] border border-slate-100">
                          <strong>Pembahasan:</strong> {item.pembahasan}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition"
          >
            Tutup
          </button>

          {generatedList.length > 0 && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua ({generatedList.length} Soal)</span>
            </button>
          )}
        </div>
      </div>

      {/* Ajari AI / Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onNotify={onSuccess}
        defaultMataPelajaran={mataPelajaran}
      />
    </div>
  );
};
