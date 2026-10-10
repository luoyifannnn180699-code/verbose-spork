import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, FileQuestion } from 'lucide-react';
import { db, type SoalItem, type TeacherProfile } from '../../db';

interface BankSoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  editItem?: SoalItem | null;
  profile?: TeacherProfile;
}

export const BankSoalForm: React.FC<BankSoalFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  profile,
}) => {
  const [mataPelajaran, setMataPelajaran] = useState('Matematika');
  const [faseKelas, setFaseKelas] = useState('Fase D (Kelas 7)');
  const [kurikulum, setKurikulum] = useState<'Kurikulum Merdeka' | 'Kurikulum 2013'>('Kurikulum Merdeka');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<'Mudah' | 'Sedang' | 'Sukar / HOTS'>('Sedang');
  const [jenisSoal, setJenisSoal] = useState<'Pilihan Ganda' | 'Pilihan Ganda Kompleks' | 'Menjodohkan' | 'Isian Singkat' | 'Uraian / Essay'>('Pilihan Ganda');
  const [materiPokok, setMateriPokok] = useState('');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');
  const [pilihanJawaban, setPilihanJawaban] = useState<string[]>([
    'A. ',
    'B. ',
    'C. ',
    'D. ',
  ]);
  const [kunciJawaban, setKunciJawaban] = useState('A');
  const [pembahasan, setPembahasan] = useState('');
  const [bobotNilai, setBobotNilai] = useState<number>(10);
  const [tahunAjaran, setTahunAjaran] = useState('2024/2025');

  useEffect(() => {
    if (editItem) {
      setMataPelajaran(editItem.mataPelajaran || 'Matematika');
      setFaseKelas(editItem.faseKelas || editItem.kelas || 'Fase D (Kelas 7 SMP)');
      setKurikulum((editItem.kurikulum as any) || 'Kurikulum Merdeka');
      setTingkatKesulitan((editItem.tingkatKesulitan as any) || 'Sedang');
      setJenisSoal((editItem.jenisSoal as any) || (editItem.bentukSoal as any) || 'Pilihan Ganda');
      setMateriPokok(editItem.materiPokok || '');
      setTujuanPembelajaran(editItem.tujuanPembelajaran || '');
      setPertanyaan(editItem.pertanyaan);
      setPilihanJawaban(
        editItem.pilihanJawaban && editItem.pilihanJawaban.length > 0
          ? editItem.pilihanJawaban
          : ['A. ', 'B. ', 'C. ', 'D. ']
      );
      setKunciJawaban(editItem.kunciJawaban || '');
      setPembahasan(editItem.pembahasan || '');
      setBobotNilai(editItem.bobotNilai || 10);
      setTahunAjaran(editItem.tahunAjaran || '2024/2025');
    } else {
      // Reset or use profile defaults
      if (profile?.mataPelajaranUtama) setMataPelajaran(profile.mataPelajaranUtama);
      if (profile?.tahunAjaranAktif) setTahunAjaran(profile.tahunAjaranAktif);
      setMateriPokok('');
      setTujuanPembelajaran('');
      setPertanyaan('');
      setPilihanJawaban(['A. ', 'B. ', 'C. ', 'D. ']);
      setKunciJawaban('A');
      setPembahasan('');
      setBobotNilai(10);
    }
  }, [editItem, isOpen, profile]);

  if (!isOpen) return null;

  const handlePilihanChange = (index: number, val: string) => {
    const updated = [...pilihanJawaban];
    updated[index] = val;
    setPilihanJawaban(updated);
  };

  const addOption = () => {
    const prefixes = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextPrefix = prefixes[pilihanJawaban.length] || `Pilihan ${pilihanJawaban.length + 1}`;
    setPilihanJawaban([...pilihanJawaban, `${nextPrefix}. `]);
  };

  const removeOption = (index: number) => {
    if (pilihanJawaban.length <= 2) return;
    const updated = pilihanJawaban.filter((_, i) => i !== index);
    setPilihanJawaban(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();

    const data: Omit<SoalItem, 'id'> = {
      mataPelajaran,
      kelas: faseKelas,
      faseKelas,
      kurikulum,
      tingkatKesulitan,
      jenisSoal,
      bentukSoal: jenisSoal,
      materiPokok,
      tujuanPembelajaran,
      pertanyaan,
      opsi: jenisSoal === 'Pilihan Ganda' || jenisSoal === 'Pilihan Ganda Kompleks' ? pilihanJawaban : [],
      pilihanJawaban: jenisSoal === 'Pilihan Ganda' || jenisSoal === 'Pilihan Ganda Kompleks' ? pilihanJawaban : [],
      kunciJawaban,
      pembahasan,
      bobotNilai: Number(bobotNilai) || 10,
      tahunAjaran,
      tanggalBuat: editItem?.tanggalBuat || new Date().toISOString().slice(0, 10),
      createdAt: editItem?.createdAt || now,
      updatedAt: now,
    };

    if (editItem?.id) {
      await db.bank_soal.update(editItem.id, data);
      onSuccess('Soal berhasil diperbarui di IndexedDB!');
    } else {
      await db.bank_soal.add(data);
      onSuccess('Soal baru berhasil ditambahkan ke Bank Soal offline!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {editItem ? 'Edit Butir Soal' : 'Tambah Soal Baru ke Bank Soal'}
              </h3>
              <p className="text-xs text-slate-500">Tersimpan otomatis secara offline di IndexedDB perangkat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Baris 1: Mata Pelajaran & Fase/Kelas & Kurikulum */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                required
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Matematika"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fase / Kelas</label>
              <select
                value={faseKelas}
                onChange={(e) => setFaseKelas(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                <option value="Fase D (Kelas 7 SMP)">Fase D (Kelas 7 SMP)</option>
                <option value="Fase D (Kelas 8 SMP)">Fase D (Kelas 8 SMP)</option>
                <option value="Fase D (Kelas 9 SMP)">Fase D (Kelas 9 SMP)</option>
                <option value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</option>
                <option value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kurikulum</label>
              <select
                value={kurikulum}
                onChange={(e) => setKurikulum(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                <option value="Kurikulum 2013">Kurikulum 2013 (K13)</option>
              </select>
            </div>
          </div>

          {/* Baris 2: Jenis Soal, Tingkat Kesulitan, Bobot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Soal</label>
              <select
                value={jenisSoal}
                onChange={(e) => setJenisSoal(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Pilihan Ganda">Pilihan Ganda (PG)</option>
                <option value="Pilihan Ganda Kompleks">Pilihan Ganda Kompleks</option>
                <option value="Menjodohkan">Menjodohkan</option>
                <option value="Isian Singkat">Isian Singkat</option>
                <option value="Uraian / Essay">Uraian / Essay</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
              <select
                value={tingkatKesulitan}
                onChange={(e) => setTingkatKesulitan(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Mudah">Mudah (LOTS)</option>
                <option value="Sedang">Sedang (MOTS)</option>
                <option value="Sukar / HOTS">Sukar / HOTS (C4-C6)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bobot Nilai / Skor</label>
              <input
                type="number"
                min="1"
                max="100"
                value={bobotNilai}
                onChange={(e) => setBobotNilai(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Materi Pokok & Tujuan Pembelajaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Materi Pokok / Bab</label>
              <input
                type="text"
                value={materiPokok}
                onChange={(e) => setMateriPokok(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="cth: Bilangan Bulat / Aljabar"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Pembelajaran (TP) / Indikator</label>
              <input
                type="text"
                value={tujuanPembelajaran}
                onChange={(e) => setTujuanPembelajaran(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="cth: Siswa mampu menghitung operasi aljabar"
              />
            </div>
          </div>

          {/* Teks Pertanyaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pertanyaan / Butir Soal *
            </label>
            <textarea
              required
              rows={4}
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
              placeholder="Tuliskan stimulus, narasi cerita, dan pertanyaan di sini..."
            />
          </div>

          {/* Opsi Pilihan Jawaban (Jika Pilihan Ganda) */}
          {(jenisSoal === 'Pilihan Ganda' || jenisSoal === 'Pilihan Ganda Kompleks') && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Opsi Pilihan Jawaban:
                </label>
                {pilihanJawaban.length < 5 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Opsi (E)
                  </button>
                )}
              </div>

              {pilihanJawaban.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handlePilihanChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {pilihanJawaban.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus opsi ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Kunci Jawaban & Pembahasan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kunci Jawaban *
              </label>
              {jenisSoal === 'Pilihan Ganda' ? (
                <select
                  value={kunciJawaban}
                  onChange={(e) => setKunciJawaban(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-blue-600"
                >
                  <option value="A">Opsi A</option>
                  <option value="B">Opsi B</option>
                  <option value="C">Opsi C</option>
                  <option value="D">Opsi D</option>
                  {pilihanJawaban.length >= 5 && <option value="E">Opsi E</option>}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={kunciJawaban}
                  onChange={(e) => setKunciJawaban(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Kunci / inti jawaban"
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pembahasan / Pedoman Rubrik Penskoran
              </label>
              <input
                type="text"
                value={pembahasan}
                onChange={(e) => setPembahasan(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Penjelasan langkah penyelesaian atau rubrik skor..."
              />
            </div>
          </div>

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
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editItem ? 'Simpan Perubahan' : 'Tambahkan ke Bank Soal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
