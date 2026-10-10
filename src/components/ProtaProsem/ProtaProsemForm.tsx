import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Calendar, Clock, Layers } from 'lucide-react';
import { db, type ProtaProsemItem, type TeacherProfile } from '../../db';

interface ProtaProsemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  editItem?: ProtaProsemItem | null;
  defaultType: 'PROTA' | 'PROSEM';
  profile?: TeacherProfile;
}

export const ProtaProsemForm: React.FC<ProtaProsemFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  defaultType,
  profile,
}) => {
  const [tipe, setTipe] = useState<'PROTA' | 'PROSEM'>(defaultType);
  const [judul, setJudul] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('Matematika');
  const [faseKelas, setFaseKelas] = useState('Fase D (Kelas 7)');
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap' | '1 Tahun Penuh'>('1 Tahun Penuh');
  const [satuanPendidikan, setSatuanPendidikan] = useState('SMP Negeri 1 Merdeka Belajar');
  const [namaGuru, setNamaGuru] = useState('Siti Rahmawati, S.Pd.');
  const [nipGuru, setNipGuru] = useState('19880415 201101 2 003');
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState('Drs. H. Ahmad Fauzi, M.Pd.');
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState('19700312 199512 1 002');

  const [daftarRincian, setDaftarRincian] = useState<ProtaProsemItem['daftarRincian']>([
    {
      id: '1',
      no: 1,
      elemen: 'Bilangan',
      tujuanPembelajaran: 'Menjelaskan konsep bilangan bulat positif dan negatif.',
      materiPokok: 'Bilangan Bulat',
      alokasiWaktu: 12,
      semester: 'Ganjil',
      keterangan: 'Tatap muka',
    },
  ]);

  useEffect(() => {
    if (editItem) {
      setTipe(editItem.tipe);
      setJudul(editItem.judul || '');
      setMataPelajaran(editItem.mataPelajaran || 'Matematika');
      setFaseKelas(editItem.faseKelas || editItem.kelas || 'Fase D (Kelas 7)');
      setTahunAjaran(editItem.tahunAjaran || '2024/2025');
      setSemester((editItem.semester as any) || '1 Tahun Penuh');
      setSatuanPendidikan(editItem.satuanPendidikan || profile?.satuanPendidikan || '');
      setNamaGuru(editItem.namaGuru || profile?.namaGuru || '');
      setNipGuru(editItem.nipGuru || profile?.nipGuru || '');
      setNamaKepalaSekolah(editItem.namaKepalaSekolah || profile?.namaKepalaSekolah || '');
      setNipKepalaSekolah(editItem.nipKepalaSekolah || profile?.nipKepalaSekolah || '');
      setDaftarRincian(editItem.daftarRincian || []);
    } else {
      setTipe(defaultType);
      const isProsem = defaultType === 'PROSEM';
      setSemester(isProsem ? 'Ganjil' : '1 Tahun Penuh');
      setJudul(
        isProsem
          ? `Program Semester Ganjil ${profile?.mataPelajaranUtama || 'Matematika'} Kelas 7`
          : `Program Tahunan ${profile?.mataPelajaranUtama || 'Matematika'} Kelas 7`
      );
      if (profile) {
        setMataPelajaran(profile.mataPelajaranUtama || 'Matematika');
        setTahunAjaran(profile.tahunAjaranAktif || '2024/2025');
        setSatuanPendidikan(profile.satuanPendidikan || '');
        setNamaGuru(profile.namaGuru || '');
        setNipGuru(profile.nipGuru || '');
        setNamaKepalaSekolah(profile.namaKepalaSekolah || '');
        setNipKepalaSekolah(profile.nipKepalaSekolah || '');
      }
      setDaftarRincian([
        {
          id: '1',
          no: 1,
          elemen: 'Elemen 1',
          tujuanPembelajaran: 'Tujuan pembelajaran pertama.',
          materiPokok: 'Materi 1',
          alokasiWaktu: 10,
          semester: isProsem ? 'Ganjil' : 'Ganjil',
          keterangan: '',
        },
      ]);
    }
  }, [editItem, defaultType, isOpen, profile]);

  if (!isOpen) return null;

  // Add row
  const addRow = () => {
    const nextNo = daftarRincian.length + 1;
    setDaftarRincian([
      ...daftarRincian,
      {
        id: String(Date.now()),
        no: nextNo,
        elemen: '',
        tujuanPembelajaran: '',
        materiPokok: '',
        alokasiWaktu: 6,
        semester: semester === 'Genap' ? 'Genap' : 'Ganjil',
        keterangan: '',
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (daftarRincian.length <= 1) return;
    const updated = daftarRincian.filter((_, i) => i !== index).map((r, i) => ({ ...r, no: i + 1 }));
    setDaftarRincian(updated);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...daftarRincian];
    updated[index] = { ...updated[index], [field]: value };
    setDaftarRincian(updated);
  };

  // Calculate total JP
  const totalJP = daftarRincian.reduce((acc, curr) => acc + (Number(curr.alokasiWaktu) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();

    const data: Omit<ProtaProsemItem, 'id'> = {
      tipe,
      judul,
      mataPelajaran,
      kelas: faseKelas,
      faseKelas,
      tahunAjaran,
      semester,
      alokasiWaktu: `${totalJP} JP`,
      materiPokok: daftarRincian.map((r) => r.materiPokok).filter(Boolean).join(', ') || judul,
      satuanPendidikan,
      namaGuru,
      nipGuru,
      namaKepalaSekolah,
      nipKepalaSekolah,
      totalAlokasiWaktu: totalJP,
      daftarRincian,
      createdAt: editItem?.createdAt || now,
      updatedAt: now,
    };

    if (editItem?.id) {
      await db.prota_prosem.update(editItem.id, data);
      onSuccess(`${tipe} berhasil diperbarui di IndexedDB!`);
    } else {
      await db.prota_prosem.add(data);
      onSuccess(`${tipe} baru berhasil disimpan secara offline!`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {editItem ? `Edit Dokumen ${tipe}` : `Buat Dokumen ${tipe} Baru`}
              </h3>
              <p className="text-xs text-slate-500">
                {tipe === 'PROTA'
                  ? 'Program Tahunan Kurikulum Merdeka (Alur Tujuan Pembelajaran & Alokasi JP)'
                  : 'Program Semester dengan Matriks Distribusi Pekan'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Judul Dokumen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Dokumen Administratif *
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="cth: Program Tahunan Matematika Kelas VII"
            />
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Program</label>
              <select
                value={tipe}
                onChange={(e) => {
                  const val = e.target.value as 'PROTA' | 'PROSEM';
                  setTipe(val);
                  if (val === 'PROTA') setSemester('1 Tahun Penuh');
                  else setSemester('Ganjil');
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-indigo-700"
              >
                <option value="PROTA">Program Tahunan (PROTA)</option>
                <option value="PROSEM">Program Semester (PROSEM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {tipe === 'PROTA' ? (
                  <>
                    <option value="1 Tahun Penuh">1 Tahun Penuh (Ganjil & Genap)</option>
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </>
                ) : (
                  <>
                    <option value="Ganjil">Semester Ganjil (Juli - Des)</option>
                    <option value="Genap">Semester Genap (Jan - Juni)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                required
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fase / Kelas</label>
              <input
                type="text"
                required
                value={faseKelas}
                onChange={(e) => setFaseKelas(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Tabel Rincian Alur Pembelajaran / ATP */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Daftar Elemen, Tujuan Pembelajaran & Alokasi JP
                </h4>
                <p className="text-[11px] text-slate-500">
                  Total Terhitung: <strong className="text-indigo-600">{totalJP} JP</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris TP
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-36">Elemen / CP</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Tujuan Pembelajaran (TP)</th>
                    <th className="py-2.5 px-3 w-36">Materi Pokok</th>
                    <th className="py-2.5 px-3 w-20 text-center">JP</th>
                    <th className="py-2.5 px-3 w-24 text-center">Semester</th>
                    <th className="py-2.5 px-3 w-10 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {daftarRincian.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.elemen}
                          onChange={(e) => updateRow(idx, 'elemen', e.target.value)}
                          placeholder="cth: Bilangan"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          rows={2}
                          value={row.tujuanPembelajaran}
                          onChange={(e) => updateRow(idx, 'tujuanPembelajaran', e.target.value)}
                          placeholder="Deskripsi tujuan pembelajaran..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={row.materiPokok}
                          onChange={(e) => updateRow(idx, 'materiPokok', e.target.value)}
                          placeholder="Materi pokok"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={row.alokasiWaktu}
                          onChange={(e) => updateRow(idx, 'alokasiWaktu', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center font-bold text-indigo-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <select
                          value={row.semester}
                          onChange={(e) => updateRow(idx, 'semester', e.target.value)}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none"
                        >
                          <option value="Ganjil">Ganjil</option>
                          <option value="Genap">Genap</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        {daftarRincian.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-right">
                      TOTAL ALOKASI JAM PELAJARAN (JP):
                    </td>
                    <td className="py-2.5 px-3 text-center text-indigo-700 font-bold text-sm">
                      {totalJP} JP
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Dokumen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
