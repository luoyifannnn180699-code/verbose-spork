import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck, School } from 'lucide-react';
import { db, type TeacherProfile } from '../db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState<TeacherProfile>({
    namaGuru: 'Siti Rahmawati, S.Pd.',
    nipGuru: '19880415 201101 2 003',
    satuanPendidikan: 'SMP Negeri 1 Merdeka Belajar',
    namaKepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
    nipKepalaSekolah: '19700312 199512 1 002',
    mataPelajaranUtama: 'Matematika',
    tahunAjaranAktif: '2024/2025',
    kotaKabupaten: 'Bandung',
  });

  useEffect(() => {
    if (isOpen) {
      db.profil_guru.toArray().then((profiles) => {
        if (profiles.length > 0) {
          setFormData(profiles[0]);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const existing = await db.profil_guru.toArray();
    if (existing.length > 0 && existing[0].id) {
      await db.profil_guru.update(existing[0].id, formData);
    } else {
      await db.profil_guru.add(formData);
    }
    onSaved('Profil & Pengaturan Guru berhasil diperbarui!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Profil Guru & Satuan Pendidikan</h3>
              <p className="text-xs text-slate-500">Data otomatis terpasang pada naskah soal, Prota, Prosem, dan Modul Ajar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Guru (dengan gelar)
              </label>
              <input
                type="text"
                required
                value={formData.namaGuru}
                onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="cth: Budi Santoso, S.Pd."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Guru (kosongkan jika belum ada)
              </label>
              <input
                type="text"
                value={formData.nipGuru}
                onChange={(e) => setFormData({ ...formData, nipGuru: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="1980xxxx xxxx xx x xxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Satuan Pendidikan (Nama Sekolah / Madrasah)
            </label>
            <input
              type="text"
              required
              value={formData.satuanPendidikan}
              onChange={(e) => setFormData({ ...formData, satuanPendidikan: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="cth: SMP Negeri 1 Merdeka"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.namaKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, namaKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="cth: Drs. H. Ahmad, M.Pd."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.nipKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="1970xxxx xxxx xx x xxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mata Pelajaran Utama
              </label>
              <input
                type="text"
                value={formData.mataPelajaranUtama}
                onChange={(e) => setFormData({ ...formData, mataPelajaranUtama: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Matematika"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                value={formData.tahunAjaranAktif}
                onChange={(e) => setFormData({ ...formData, tahunAjaranAktif: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="2024/2025"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota / Kabupaten (Titimangsa)
              </label>
              <input
                type="text"
                value={formData.kotaKabupaten}
                onChange={(e) => setFormData({ ...formData, kotaKabupaten: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Bandung"
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
              <Save className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
