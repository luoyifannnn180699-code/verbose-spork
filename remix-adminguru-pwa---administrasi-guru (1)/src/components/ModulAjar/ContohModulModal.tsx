import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Check,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Filter,
  GraduationCap,
  Layers,
  FileText,
  Share2,
} from 'lucide-react';
import { CONTOH_MODUL_PRESETS, type ContohModulTemplate } from '../../data/contohModulData';
import { simpanDokumenReferensi } from '../../utils/knowledgeBase';

interface ContohModulModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModul: (modul: ContohModulTemplate) => void;
  onNotify?: (msg: string) => void;
}

export const ContohModulModal: React.FC<ContohModulModalProps> = ({
  isOpen,
  onClose,
  onSelectModul,
  onNotify,
}) => {
  const [selectedKategori, setSelectedKategori] = useState<'semua' | 'mandarin' | 'smp' | 'sma'>('mandarin');
  const [activePreview, setActivePreview] = useState<ContohModulTemplate | null>(CONTOH_MODUL_PRESETS[0]);
  const [savedToKnowledge, setSavedToKnowledge] = useState<{ [id: string]: boolean }>({});

  if (!isOpen) return null;

  const filteredModul = CONTOH_MODUL_PRESETS.filter((item) => {
    if (selectedKategori === 'mandarin') return item.isMandarinSpecial;
    if (selectedKategori === 'smp') return item.kelas.includes('SMP');
    if (selectedKategori === 'sma') return item.kelas.includes('SMA');
    return true;
  });

  const handleSimpanKeAI = async (item: ContohModulTemplate) => {
    try {
      await simpanDokumenReferensi({
        judul: `Contoh Modul: ${item.judul}`,
        mataPelajaran: item.mataPelajaran,
        kategori: 'Contoh Modul',
        tipeFile: 'md',
        namaFile: `${item.id}.md`,
        ukuranFile: `${Math.round(item.kontenLengkap.length / 1024) || 2} KB`,
        kontenTeks: item.kontenLengkap,
        ringkasan: item.deskripsiSingkat,
        faseKelas: item.fase,
        isAktif: true,
      });

      setSavedToKnowledge((prev) => ({ ...prev, [item.id]: true }));
      onNotify?.(`✨ Contoh modul "${item.mataPelajaran}" berhasil diajarkan & disimpan ke Memori Referensi AI!`);
    } catch (err: any) {
      alert(`Gagal menyimpan ke referensi AI: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs shadow-xs">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Katalog Contoh Modul Ajar Kurikulum Merdeka</h3>
                <span className="text-[11px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Khusus Mandarin & Mapel Lain
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Pilih modul ajar siap pakai dengan standar Kurikulum Merdeka, atau pelajari dan jadikan acuan bagi AI Anda.
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

        {/* Filter Pills */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          <button
            onClick={() => setSelectedKategori('mandarin')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              selectedKategori === 'mandarin'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🇨🇳 Khusus Bahasa Mandarin (汉语)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-black">2</span>
          </button>
          <button
            onClick={() => setSelectedKategori('semua')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedKategori === 'semua'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua Mapel ({CONTOH_MODUL_PRESETS.length})
          </button>
          <button
            onClick={() => setSelectedKategori('smp')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedKategori === 'smp'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Jenjang SMP
          </button>
          <button
            onClick={() => setSelectedKategori('sma')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              selectedKategori === 'sma'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Jenjang SMA
          </button>
        </div>

        {/* Content: Left List & Right Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* List (col-5) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
            {filteredModul.map((item) => {
              const isSelected = activePreview?.id === item.id;
              const isMandarin = item.isMandarinSpecial;

              return (
                <div
                  key={item.id}
                  onClick={() => setActivePreview(item)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-rose-500 shadow-sm ring-1 ring-rose-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isMandarin
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {item.mataPelajaran}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{item.kelas}</span>
                    </div>

                    {isMandarin && (
                      <span className="text-xs bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                        🇨🇳 Hanzi + Pinyin
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{item.judul}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.deskripsiSingkat}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="truncate max-w-[170px]">{item.modelPembelajaran}</span>
                    <span className="font-semibold text-rose-600 flex items-center gap-0.5">
                      Lihat Detail <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview Panel (col-7) */}
          <div className="md:col-span-7 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between bg-white">
            {activePreview ? (
              <div className="space-y-4">
                {/* Header Info */}
                <div className="bg-gradient-to-br from-slate-50 to-rose-50/30 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-rose-600 text-white">
                      {activePreview.mataPelajaran}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-200 text-slate-700">
                      {activePreview.kelas} &bull; {activePreview.fase}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {activePreview.alokasiWaktu}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{activePreview.judul}</h3>
                  <p className="text-xs text-slate-600">{activePreview.deskripsiSingkat}</p>
                </div>

                {/* Mandarin Highlights Banner */}
                {activePreview.isMandarinSpecial && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-800">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      Fitur Khusus Modul Bahasa Mandarin Kurikulum Merdeka:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-900 pl-1">
                      <li>Dilengkapi aksara Hanzi asli (汉字) dan sistem Hanyu Pinyin bernada (声调).</li>
                      <li>Memuat dialog percakapan role-play dua arah dan latihan nada beruntun (Tone Sandhi).</li>
                      <li>Lampiran Lembar Kerja Peserta Didik (LKPD) latihan goresan Hanzi (笔画) dan Tianzige.</li>
                    </ul>
                  </div>
                )}

                {/* Tujuan Pembelajaran */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Tujuan Pembelajaran (TP):
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 pl-4 list-disc bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {activePreview.dataParsed.komponenInti.tujuanPembelajaran.map((tp, i) => (
                      <li key={i} className="leading-relaxed">
                        {tp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cuplikan Teks Modul Lengkap */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Naskah Modul Ajar Tersusun:
                  </h4>
                  <div className="bg-slate-950 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto border border-slate-800 whitespace-pre-wrap select-all">
                    {activePreview.kontenLengkap}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Pilih salah satu contoh modul di sebelah kiri.
              </div>
            )}

            {/* Bottom Actions */}
            {activePreview && (
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSimpanKeAI(activePreview)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    savedToKnowledge[activePreview.id]
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title="Simpan struktur modul ini ke Knowledge Base AI agar AI bisa meniru formatnya"
                >
                  {savedToKnowledge[activePreview.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersimpan di Memori AI</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ajarkan ke Memori AI</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModul(activePreview);
                      onClose();
                      onNotify?.(`✨ Berhasil menerapkan template contoh "${activePreview.judul}" ke formulir!`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-rose-600 via-red-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Gunakan Contoh Ini di Modul Saya</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
