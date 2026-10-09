import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  FileDown,
  Trash2,
  Edit3,
  Copy,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ProtaProsemItem, type TeacherProfile } from '../../db';
import { ProtaProsemForm } from './ProtaProsemForm';
import { exportProtaToWord, exportProsemToWord } from '../../utils/exportWord';

interface ProtaProsemViewProps {
  onNotify: (msg: string) => void;
  profile?: TeacherProfile;
}

export const ProtaProsemView: React.FC<ProtaProsemViewProps> = ({ onNotify, profile }) => {
  const [activeSubTab, setActiveSubTab] = useState<'PROTA' | 'PROSEM'>('PROTA');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProtaProsemItem | null>(null);
  const [expandedDocIds, setExpandedDocIds] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState<number | null>(null);

  const docList =
    useLiveQuery(
      () => db.prota_prosem.where('tipe').equals(activeSubTab).toArray(),
      [activeSubTab]
    ) || [];

  const toggleExpand = (id: number) => {
    if (expandedDocIds.includes(id)) {
      setExpandedDocIds(expandedDocIds.filter((item) => item !== id));
    } else {
      setExpandedDocIds([...expandedDocIds, id]);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(`Yakin ingin menghapus dokumen ${activeSubTab} ini dari IndexedDB?`)) {
      await db.prota_prosem.delete(id);
      onNotify(`Dokumen ${activeSubTab} berhasil dihapus.`);
    }
  };

  const handleDuplicate = async (doc: ProtaProsemItem) => {
    const copyData: Omit<ProtaProsemItem, 'id'> = {
      ...doc,
      judul: `${doc.judul} (Salinan)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.prota_prosem.add(copyData);
    onNotify(`Dokumen ${doc.tipe} berhasil diduplikasi.`);
  };

  const handleExportWord = async (doc: ProtaProsemItem) => {
    try {
      setIsExporting(doc.id!);
      if (doc.tipe === 'PROTA') {
        await exportProtaToWord(doc, profile);
        onNotify('Program Tahunan (PROTA) berhasil diekspor ke Word (.docx)!');
      } else {
        await exportProsemToWord(doc, profile);
        onNotify('Program Semester (PROSEM) berhasil diekspor ke Word (.docx)!');
      }
    } catch (err) {
      console.error(err);
      onNotify('Gagal mengekspor dokumen ke Word.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Program Tahunan (PROTA) & Semester (PROSEM)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perencanaan alokasi jam pelajaran (JP) dan alur tujuan pembelajaran Kurikulum Merdeka tersimpan offline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat {activeSubTab} Baru</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: PROTA vs PROSEM */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('PROTA')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === 'PROTA'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Program Tahunan (PROTA)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PROSEM')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeSubTab === 'PROSEM'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Program Semester (PROSEM)</span>
        </button>
      </div>

      {/* Document List */}
      {docList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Belum Ada Dokumen {activeSubTab}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Mulai susun alokasi waktu JP dan alur tujuan pembelajaran untuk tahun ajaran baru.
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat {activeSubTab} Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {docList.map((doc) => {
            const isExpanded = expandedDocIds.includes(doc.id!);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition"
              >
                {/* Header Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      <span className="font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {doc.tipe}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                        {doc.mataPelajaran}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                        {doc.faseKelas}
                      </span>
                      <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-md font-semibold">
                        {doc.totalAlokasiWaktu} JP Total
                      </span>
                      <span className="text-slate-400">| TA: {doc.tahunAjaran}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{doc.judul}</h3>
                    <p className="text-xs text-slate-500">
                      {doc.satuanPendidikan} &bull; Guru: {doc.namaGuru} &bull; {doc.daftarRincian?.length || 0} Butir Capaian/TP
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportWord(doc)}
                      disabled={isExporting === doc.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition cursor-pointer"
                      title="Ekspor dokumen resmi lengkap dengan tabel dan tanda tangan ke file Word (.docx)"
                    >
                      <FileDown className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isExporting === doc.id ? 'Mengekspor...' : 'Ekspor Word (.docx)'}</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(doc.id!)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Tutup Tabel</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Lihat Rincian</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDuplicate(doc)}
                      title="Duplikasi Dokumen"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingItem(doc);
                        setIsFormOpen(true);
                      }}
                      title="Edit Dokumen"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id!)}
                      title="Hapus Dokumen"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4">
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 w-10 text-center">No</th>
                            <th className="py-2 px-3 w-36">Elemen / CP</th>
                            <th className="py-2 px-3">Tujuan Pembelajaran (TP)</th>
                            <th className="py-2 px-3 w-36">Materi Pokok</th>
                            <th className="py-2 px-3 w-20 text-center">Alokasi JP</th>
                            <th className="py-2 px-3 w-20 text-center">Semester</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {doc.daftarRincian?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="py-2 px-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                              <td className="py-2 px-3 font-semibold text-slate-700">{item.elemen || '-'}</td>
                              <td className="py-2 px-3 text-slate-800">{item.tujuanPembelajaran}</td>
                              <td className="py-2 px-3 text-slate-600">{item.materiPokok || '-'}</td>
                              <td className="py-2 px-3 text-center font-bold text-indigo-700">
                                {item.alokasiWaktu} JP
                              </td>
                              <td className="py-2 px-3 text-center text-slate-600">{item.semester}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                          <tr>
                            <td colSpan={4} className="py-2.5 px-3 text-right">
                              TOTAL ALOKASI WAKTU TAHUNAN:
                            </td>
                            <td className="py-2.5 px-3 text-center text-indigo-700">
                              {doc.totalAlokasiWaktu} JP
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <ProtaProsemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSuccess={onNotify}
        editItem={editingItem}
        defaultType={activeSubTab}
        profile={profile}
      />
    </div>
  );
};
