import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileDown,
  Trash2,
  Edit3,
  Copy,
  BookOpen,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SoalItem, type TeacherProfile } from '../../db';
import { BankSoalForm } from './BankSoalForm';
import { BankSoalAIModal } from './BankSoalAIModal';
import { exportBankSoalToWord } from '../../utils/exportWord';

interface BankSoalViewProps {
  onNotify: (msg: string) => void;
  profile?: TeacherProfile;
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
}

export const BankSoalView: React.FC<BankSoalViewProps> = ({
  onNotify,
  profile,
  apiKey,
  onOpenApiKeyModal = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMapel, setFilterMapel] = useState('Semua');
  const [filterFase, setFilterFase] = useState('Semua');
  const [filterKesulitan, setFilterKesulitan] = useState('Semua');
  const [filterJenis, setFilterJenis] = useState('Semua');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SoalItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewSoal, setPreviewSoal] = useState<SoalItem | null>(null);

  // Live Query from Dexie IndexedDB
  const soalList = useLiveQuery(() => db.bank_soal.toArray(), []) || [];

  // Filtered list
  const filteredList = useMemo(() => {
    return soalList.filter((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.materiPokok && item.materiPokok.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tujuanPembelajaran && item.tujuanPembelajaran.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchMapel = filterMapel === 'Semua' || item.mataPelajaran === filterMapel;
      const matchFase = filterFase === 'Semua' || (item.faseKelas || item.kelas) === filterFase;
      const matchKesulitan = filterKesulitan === 'Semua' || item.tingkatKesulitan === filterKesulitan;
      const matchJenis = filterJenis === 'Semua' || (item.jenisSoal || item.bentukSoal) === filterJenis;

      return matchSearch && matchMapel && matchFase && matchKesulitan && matchJenis;
    });
  }, [soalList, searchTerm, filterMapel, filterFase, filterKesulitan, filterJenis]);

  // Unique lists for dropdowns
  const mapelOptions = useMemo(() => {
    const set = new Set<string>();
    soalList.forEach((s) => set.add(s.mataPelajaran));
    return Array.from(set);
  }, [soalList]);

  // Selection toggles
  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((s) => s.id!).filter(Boolean));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus butir soal ini dari IndexedDB?')) {
      await db.bank_soal.delete(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      onNotify('Soal berhasil dihapus.');
    }
  };

  const handleDuplicate = async (item: SoalItem) => {
    const copyData: Omit<SoalItem, 'id'> = {
      ...item,
      pertanyaan: `${item.pertanyaan} (Salinan)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.bank_soal.add(copyData);
    onNotify('Soal berhasil diduplikasi ke Bank Soal.');
  };

  // Export to Word
  const handleExportWord = async (selectedOnly: boolean = false) => {
    const targetList = selectedOnly
      ? filteredList.filter((s) => selectedIds.includes(s.id!))
      : filteredList;

    if (targetList.length === 0) {
      onNotify('Tidak ada soal yang dipilih untuk diekspor.');
      return;
    }

    try {
      setIsExporting(true);
      await exportBankSoalToWord(targetList, {
        sekolah: profile?.satuanPendidikan,
        mataPelajaran: filterMapel !== 'Semua' ? filterMapel : targetList[0]?.mataPelajaran,
        faseKelas: filterFase !== 'Semua' ? filterFase : targetList[0]?.faseKelas,
        tahunAjaran: profile?.tahunAjaranAktif || '2024/2025',
        guru: profile?.namaGuru,
        nipGuru: profile?.nipGuru,
        kepalaSekolah: profile?.namaKepalaSekolah,
        nipKepalaSekolah: profile?.nipKepalaSekolah,
        kotaKabupaten: profile?.kotaKabupaten,
        includeKunciJawaban: true,
      });
      onNotify(`Berhasil mengekspor ${targetList.length} soal ke file Word (.docx)!`);
    } catch (err) {
      console.error(err);
      onNotify('Gagal mengekspor soal ke Word.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Bank Soal & Kisi-Kisi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola ribuan butir soal asesmen secara offline di IndexedDB & ekspor naskah ujian ke format Word (.docx).
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-xs transition cursor-pointer"
            title="Generate sekumpulan butir soal HOTS otomatis dengan DeepSeek / AI Gratis"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Soal AI</span>
          </button>

          <button
            onClick={() => handleExportWord(selectedIds.length > 0)}
            disabled={isExporting || filteredList.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Ekspor ke naskah Word (.docx) lengkap dengan kop, petunjuk, dan kunci jawaban"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>
              {selectedIds.length > 0
                ? `Ekspor ${selectedIds.length} Soal (.docx)`
                : 'Ekspor Semua (.docx)'}
            </span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari materi pokok, stimulus, tujuan pembelajaran, atau pertanyaan..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Mapel</option>
              {mapelOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Jenis Soal</option>
              <option value="Pilihan Ganda">Pilihan Ganda</option>
              <option value="Pilihan Ganda Kompleks">Pilihan Ganda Kompleks</option>
              <option value="Menjodohkan">Menjodohkan</option>
              <option value="Isian Singkat">Isian Singkat</option>
              <option value="Uraian / Essay">Uraian / Essay</option>
            </select>

            <select
              value={filterKesulitan}
              onChange={(e) => setFilterKesulitan(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Kesulitan</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sukar / HOTS">Sukar / HOTS</option>
            </select>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
              onChange={selectAll}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="select-all" className="cursor-pointer font-medium text-slate-700">
              Pilih Semua ({filteredList.length} soal ditemukan)
            </label>
          </div>

          {selectedIds.length > 0 && (
            <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {selectedIds.length} butir soal dipilih
            </span>
          )}
        </div>
      </div>

      {/* Question Card Grid / List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Soal yang Sesuai</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Silakan ubah filter pencarian atau tambahkan butir soal baru ke Bank Soal offline Anda.
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Soal Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((item, index) => {
            const isSelected = selectedIds.includes(item.id!);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id!)}
                      className="w-4 h-4 mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />

                    <div className="flex-1 space-y-2">
                      {/* Meta Tags */}
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          {item.mataPelajaran}
                        </span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.faseKelas || item.kelas}
                        </span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.jenisSoal || item.bentukSoal}
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            item.tingkatKesulitan === 'Sukar / HOTS'
                              ? 'bg-rose-50 text-rose-700'
                              : item.tingkatKesulitan === 'Sedang'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.tingkatKesulitan}
                        </span>
                        <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-medium">
                          Skor: {item.bobotNilai}
                        </span>
                      </div>

                      {/* Materi Pokok & TP */}
                      {item.materiPokok && (
                        <p className="text-xs font-semibold text-slate-700">
                          Materi Pokok: <span className="text-slate-900 font-normal">{item.materiPokok}</span>
                        </p>
                      )}

                      {/* Question Text */}
                      <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                        {item.pertanyaan}
                      </p>

                      {/* Pilihan Jawaban */}
                      {item.pilihanJawaban && item.pilihanJawaban.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                          {item.pilihanJawaban.map((pil, idx) => {
                            const isAnswerKey = item.kunciJawaban && pil.trim().startsWith(item.kunciJawaban);
                            return (
                              <div
                                key={idx}
                                className={`px-3 py-1.5 rounded-xl border flex items-center justify-between ${
                                  isAnswerKey
                                    ? 'bg-emerald-50/80 border-emerald-300 font-medium text-emerald-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{pil}</span>
                                {isAnswerKey && (
                                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                                    Kunci
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Kunci Jawaban jika non-PG atau Uraian */}
                      {((item.jenisSoal || item.bentukSoal) === 'Uraian / Essay' || (item.jenisSoal || item.bentukSoal) === 'Essay') && item.kunciJawaban && (
                        <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl text-xs text-amber-900">
                          <span className="font-bold">Kunci/Rubrik: </span>
                          <span>{item.kunciJawaban}</span>
                        </div>
                      )}

                      {/* Pembahasan */}
                      {item.pembahasan && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                          <span className="font-semibold text-slate-600">Pembahasan: </span>
                          {item.pembahasan}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(item)}
                      title="Duplikasi Soal"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsFormOpen(true);
                      }}
                      title="Edit Butir Soal"
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      title="Hapus Soal"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

      {/* Form Modal */}
      <BankSoalForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSuccess={onNotify}
        editItem={editingItem}
        profile={profile}
      />

      {/* AI Question Generator Modal */}
      <BankSoalAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={onNotify}
        profile={profile}
        apiKey={apiKey}
        onOpenApiKeyModal={onOpenApiKeyModal}
      />
    </div>
  );
};
