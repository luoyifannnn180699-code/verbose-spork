import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  FileDown,
  Trash2,
  Edit3,
  Copy,
  Eye,
  CheckCircle2,
  Layers,
  Sparkles,
  X,
  FileText,
  Search,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ModulAjarItem, type TeacherProfile } from '../../db';
import { ModulAjarForm } from './ModulAjarForm';
import { ContohModulModal } from './ContohModulModal';
import { KnowledgeBaseModal } from '../KnowledgeBase/KnowledgeBaseModal';
import { exportModulAjarToWord } from '../../utils/exportWord';
import type { ContohModulTemplate } from '../../data/contohModulData';
import { Brain } from 'lucide-react';

interface ModulAjarViewProps {
  onNotify: (msg: string) => void;
  profile?: TeacherProfile;
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
}

export const ModulAjarView: React.FC<ModulAjarViewProps> = ({
  onNotify,
  profile,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModulAjarItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ModulAjarItem | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isContohModalOpen, setIsContohModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  const handleSelectPresetFromView = (preset: ContohModulTemplate) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setEditingItem({
      mataPelajaran: preset.mataPelajaran,
      kelas: preset.kelas,
      topik: preset.topik,
      alokasiWaktu: preset.alokasiWaktu,
      langkahPembelajaran: preset.kontenLengkap,
      tanggalBuat: todayStr,
      judulModul: preset.topik,
      semester: 'Ganjil',
      tahunAjaran: profile?.tahunAjaranAktif || '2024/2025',
      satuanPendidikan: profile?.satuanPendidikan || 'SMP Negeri 1 Merdeka Belajar',
      namaGuru: profile?.namaGuru || 'Siti Rahmawati, S.Pd.',
      nipGuru: profile?.nipGuru || '',
      namaKepalaSekolah: profile?.namaKepalaSekolah || 'Drs. H. Ahmad Fauzi, M.Pd.',
      nipKepalaSekolah: profile?.nipKepalaSekolah || '',
      tujuanPembelajaran: preset.dataParsed.komponenInti.tujuanPembelajaran.join('\n'),
      pertanyaanPemantik: preset.dataParsed.komponenInti.pertanyaanPemantik.join('\n'),
      pemahamanBermakna: preset.dataParsed.komponenInti.pemahamanBermakna,
      asesmen: {
        diagnostik: preset.dataParsed.komponenInti.asesmen.diagnostik,
        formatif: preset.dataParsed.komponenInti.asesmen.formatif,
        sumatif: preset.dataParsed.komponenInti.asesmen.sumatif,
      },
      profilPelajarPancasila: preset.profilPancasila,
      saranaPrasarana: preset.dataParsed.informasiUmum.saranaPrasarana,
      modelPembelajaran: preset.modelPembelajaran,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsFormOpen(true);
  };

  const modulList = useLiveQuery(() => db.modul_ajar.toArray(), []) || [];

  const filteredModul = modulList.filter((m) => {
    const term = searchTerm.toLowerCase();
    const topik = (m.topik || m.judulModul || '').toLowerCase();
    const mapel = (m.mataPelajaran || '').toLowerCase();
    const langkah = (m.langkahPembelajaran || '').toLowerCase();
    return topik.includes(term) || mapel.includes(term) || langkah.includes(term);
  });

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus Modul Ajar ini dari penyimpanan IndexedDB?')) {
      await db.modul_ajar.delete(id);
      onNotify('Modul Ajar berhasil dihapus.');
    }
  };

  const handleDuplicate = async (modul: ModulAjarItem) => {
    const copyData: Omit<ModulAjarItem, 'id'> = {
      ...modul,
      topik: `${modul.topik || modul.judulModul} (Salinan)`,
      judulModul: `${modul.judulModul || modul.topik} (Salinan)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.modul_ajar.add(copyData);
    onNotify('Modul Ajar berhasil diduplikasi.');
  };

  // Ekspor satu modul
  const handleExportSingle = async (modul: ModulAjarItem) => {
    try {
      setIsExporting(true);
      await exportModulAjarToWord(modul, profile);
      onNotify('Modul Ajar berhasil diekspor ke format Word (.docx)!');
    } catch (err) {
      console.error(err);
      onNotify('Gagal mengekspor Modul Ajar ke Word.');
    } finally {
      setIsExporting(false);
    }
  };

  // Ekspor seluruh modul
  const handleExportAll = async () => {
    if (modulList.length === 0) {
      onNotify('Belum ada modul tersimpan untuk diekspor.');
      return;
    }
    try {
      setIsExporting(true);
      await exportModulAjarToWord();
      onNotify('Kumpulan Modul Ajar berhasil diekspor ke Word (.docx)!');
    } catch (err) {
      console.error(err);
      onNotify('Gagal mengekspor dokumen Word.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Modul Ajar / Lesson Plan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyusunan modul ajar Kurikulum Merdeka didukung AI Generator (DeepSeek / Mode Gratis), IndexedDB offline, dan ekspor Word (.docx).
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsContohModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition cursor-pointer shadow-2xs"
            title="Lihat katalog contoh modul ajar nyata khusus Bahasa Mandarin atau mapel lain"
          >
            <BookOpen className="w-4 h-4 text-rose-600" />
            <span>🇨🇳 Contoh Modul (Mandarin & Lainnya)</span>
          </button>

          <button
            onClick={() => setIsKnowledgeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-xl transition cursor-pointer shadow-2xs"
            title="Unggah file kurikulum/silabus Anda untuk diajarkan kepada AI"
          >
            <Brain className="w-4 h-4 text-purple-600" />
            <span>🧠 Ajari AI / Upload File</span>
          </button>

          <button
            onClick={handleExportAll}
            disabled={isExporting || modulList.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Ekspor seluruh Modul Ajar tersimpan ke berkas Word .docx"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>Ekspor Semua (.docx)</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Modul Ajar</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {modulList.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari modul ajar berdasarkan topik, mata pelajaran, atau langkah pembelajaran..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:block">
            {filteredModul.length} dari {modulList.length} modul
          </div>
        </div>
      )}

      {/* Grid of Modul Ajar */}
      {filteredModul.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Modul Ajar Tersimpan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Susun modul pembelajaran Kurikulum Merdeka dengan cepat memanfaatkan asisten AI Gemini Flash.
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Modul Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModul.map((modul) => (
            <div
              key={modul.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {modul.mataPelajaran}
                  </span>
                  <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {modul.kelas}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {modul.topik || modul.judulModul || 'Modul Pembelajaran'}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-800">Langkah Pembelajaran: </span>
                  {modul.langkahPembelajaran || '-'}
                </p>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100">
                  <span>Alokasi: <span className="font-medium text-slate-700">{modul.alokasiWaktu || '2 JP'}</span></span>
                  <span>Dibuat: {modul.tanggalBuat || '-'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => setPreviewItem(modul)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Pratinjau
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExportSingle(modul)}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                    title="Ekspor ke dokumen Word (.docx) lengkap dengan tanda tangan"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(modul)}
                    title="Duplikasi Modul Ajar"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(modul);
                      setIsFormOpen(true);
                    }}
                    title="Edit Modul Ajar"
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(modul.id!)}
                    title="Hapus Modul Ajar"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Pratinjau Modul Ajar */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Pratinjau Modul Ajar</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportSingle(previewItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" /> Unduh Dokumen (.docx)
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900 uppercase">
                  {previewItem.topik || previewItem.judulModul}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {previewItem.mataPelajaran} &bull; {previewItem.kelas} &bull; {previewItem.alokasiWaktu}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-indigo-800 border-b border-indigo-100 pb-1 mb-2">
                  LANGKAH-LANGKAH PEMBELAJARAN
                </h4>
                <div className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {previewItem.langkahPembelajaran}
                </div>
              </div>

              {previewItem.tujuanPembelajaran && (
                <div>
                  <h4 className="font-bold text-sm text-indigo-800 border-b border-indigo-100 pb-1 mb-2">
                    TUJUAN PEMBELAJARAN
                  </h4>
                  <p className="whitespace-pre-line text-slate-600 pl-2">
                    {previewItem.tujuanPembelajaran}
                  </p>
                </div>
              )}

              {previewItem.pertanyaanPemantik && (
                <div>
                  <h4 className="font-bold text-sm text-indigo-800 border-b border-indigo-100 pb-1 mb-2">
                    PERTANYAAN PEMANTIK
                  </h4>
                  <p className="whitespace-pre-line text-slate-600 pl-2">
                    {previewItem.pertanyaanPemantik}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <ModulAjarForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSuccess={onNotify}
        editItem={editingItem}
        profile={profile}
        apiKey={apiKey}
        onOpenApiKeyModal={onOpenApiKeyModal}
      />

      {/* Katalog Contoh Modul Modal */}
      <ContohModulModal
        isOpen={isContohModalOpen}
        onClose={() => setIsContohModalOpen(false)}
        onSelectModul={handleSelectPresetFromView}
        onNotify={onNotify}
      />

      {/* Ajari AI / Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onNotify={onNotify}
        defaultMataPelajaran="Bahasa Mandarin"
      />
    </div>
  );
};
