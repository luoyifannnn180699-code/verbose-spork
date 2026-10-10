import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Layers,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  HardDrive,
  Info,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as fileSaverModule from 'file-saver';
import { db, seedInitialDataIfEmpty } from '../../db';

const saveAs = (fileSaverModule as any).saveAs || (fileSaverModule as any).default || fileSaverModule;

interface BackupRestoreViewProps {
  onNotify: (msg: string) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ onNotify }) => {
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live queries for real-time counts
  const modulList = useLiveQuery(() => db.modul_ajar.toArray(), []) || [];
  const soalList = useLiveQuery(() => db.bank_soal.toArray(), []) || [];
  const protaProsemList = useLiveQuery(() => db.prota_prosem.toArray(), []) || [];
  const profilList = useLiveQuery(() => db.profil_guru.toArray(), []) || [];

  // Ekspor seluruh database ke file JSON
  const handleExportBackup = async () => {
    try {
      setIsProcessing(true);
      const backupData = {
        app: 'AdminGuru PWA',
        version: 1,
        exportedAt: new Date().toISOString(),
        modul_ajar: modulList,
        bank_soal: soalList,
        prota_prosem: protaProsemList,
        profil_guru: profilList,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const filename = `Backup_AdminGuru_${new Date().toISOString().slice(0, 10)}.json`;

      saveAs(blob, filename);
      onNotify('Backup data berhasil diunduh ke format .json!');
    } catch (err: any) {
      console.error(err);
      onNotify('Gagal mengekspor data cadangan.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Impor file JSON ke IndexedDB
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.modul_ajar && !data.bank_soal && !data.prota_prosem) {
        throw new Error('Format file JSON tidak valid. Pastikan file merupakan hasil backup AdminGuru.');
      }

      if (importMode === 'replace') {
        // Hapus data lama
        await db.modul_ajar.clear();
        await db.bank_soal.clear();
        await db.prota_prosem.clear();
        if (data.profil_guru) await db.profil_guru.clear();
      }

      let countModul = 0;
      let countSoal = 0;
      let countProta = 0;

      // Masukkan data modul ajar
      if (Array.isArray(data.modul_ajar) && data.modul_ajar.length > 0) {
        const cleanedModul = data.modul_ajar.map((item: any) => {
          const { id, ...rest } = item;
          return importMode === 'replace' ? item : rest;
        });
        await db.modul_ajar.bulkAdd(cleanedModul);
        countModul = cleanedModul.length;
      }

      // Masukkan data bank soal
      if (Array.isArray(data.bank_soal) && data.bank_soal.length > 0) {
        const cleanedSoal = data.bank_soal.map((item: any) => {
          const { id, ...rest } = item;
          return importMode === 'replace' ? item : rest;
        });
        await db.bank_soal.bulkAdd(cleanedSoal);
        countSoal = cleanedSoal.length;
      }

      // Masukkan data prota & prosem
      if (Array.isArray(data.prota_prosem) && data.prota_prosem.length > 0) {
        const cleanedProta = data.prota_prosem.map((item: any) => {
          const { id, ...rest } = item;
          return importMode === 'replace' ? item : rest;
        });
        await db.prota_prosem.bulkAdd(cleanedProta);
        countProta = cleanedProta.length;
      }

      // Masukkan profil jika mode replace
      if (importMode === 'replace' && Array.isArray(data.profil_guru) && data.profil_guru.length > 0) {
        await db.profil_guru.bulkAdd(data.profil_guru);
      }

      onNotify(
        `Berhasil memulihkan data: ${countModul} Modul Ajar, ${countSoal} Soal, dan ${countProta} Program Pembelajaran!`
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal memproses file cadangan.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Reset ke data contoh (Seed)
  const handleResetToSample = async () => {
    try {
      setIsProcessing(true);
      await db.modul_ajar.clear();
      await db.bank_soal.clear();
      await db.prota_prosem.clear();
      await db.profil_guru.clear();
      await seedInitialDataIfEmpty();
      setShowConfirmReset(false);
      onNotify('Database berhasil dipulihkan ke data contoh Kurikulum Merdeka!');
    } catch (err: any) {
      console.error(err);
      onNotify('Gagal mereset data.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Hapus seluruh data
  const handleClearAll = async () => {
    try {
      setIsProcessing(true);
      await db.modul_ajar.clear();
      await db.bank_soal.clear();
      await db.prota_prosem.clear();
      setShowConfirmClear(false);
      onNotify('Seluruh data administrasi berhasil dibersihkan.');
    } catch (err: any) {
      console.error(err);
      onNotify('Gagal mengosongkan data.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Backup & Restore Database Lokal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola keamanan data administrasi guru Anda. Seluruh data tersimpan secara offline di peramban (IndexedDB) dan dapat dicadangkan kapan saja ke berkas .json.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Cadangan (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Data Saat Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{modulList.length}</div>
            <div className="text-xs text-slate-500 font-medium">Modul Ajar Tersimpan</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{soalList.length}</div>
            <div className="text-xs text-slate-500 font-medium">Butir Bank Soal</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{protaProsemList.length}</div>
            <div className="text-xs text-slate-500 font-medium">Dokumen Prota & Prosem</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">IndexedDB Dexie</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Offline Lokal
            </div>
          </div>
        </div>
      </div>

      {/* Panel Tindakan: Ekspor & Impor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom 1: Ekspor Cadangan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Ekspor Seluruh Database</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unduh salinan lengkap seluruh modul ajar, bank soal, dan program tahunan/semester ke berkas format JSON. Berkas ini aman untuk disimpan di flashdisk, Google Drive, atau dipindahkan ke komputer/laptop lain.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Isi data yang dicadangkan:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-500">
                <li>Semua Modul Ajar (termasuk langkah pembelajaran & asesmen)</li>
                <li>Seluruh Butir Bank Soal (beserta kunci & opsi pilihan)</li>
                <li>Program Tahunan (Prota) & Program Semester (Prosem)</li>
                <li>Profil Pengajar & Sekolah (Kop Tanda Tangan)</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Berkas Backup (.json)</span>
          </button>
        </div>

        {/* Kolom 2: Impor & Pulihkan Cadangan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-800">Impor & Pulihkan Cadangan</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih berkas JSON cadangan AdminGuru yang pernah Anda unduh sebelumnya untuk memulihkan seluruh data ke peramban saat ini.
            </p>

            {/* Pilihan Mode Impor */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700">Metode Penggabungan:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    importMode === 'merge'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">Gabungkan (Merge)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Tambahkan data baru tanpa menghapus yang lama.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    importMode === 'replace'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">Gantikan (Replace)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Hapus data saat ini lalu pasang dari backup.</div>
                </button>
              </div>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas Cadangan (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Opsi Pemeliharaan Data: Reset & Bersihkan */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Pemeliharaan & Reset Database
        </h4>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="font-semibold text-xs text-slate-800">Muat Ulang Contoh Data Kurikulum Merdeka</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Kembalikan template contoh modul ajar, bank soal, dan program tahunan bawaan aplikasi.
            </div>
          </div>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer shrink-0"
          >
            Muat Data Contoh
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <div>
            <div className="font-semibold text-xs text-rose-900">Kosongkan Seluruh Data Lokal</div>
            <div className="text-[11px] text-rose-700 mt-0.5">
              Hapus seluruh isi modul ajar, bank soal, dan prota/prosem yang tersimpan di browser ini. Tindakan ini tidak dapat dibatalkan kecuali Anda memiliki cadangan .json.
            </div>
          </div>
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shrink-0"
          >
            Kosongkan Database
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Reset Sample */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <RefreshCw className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-800">Muat Contoh Data Kurikulum Merdeka?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mengosongkan data yang ada saat ini dan mengisi ulang dengan contoh template Modul Ajar Matematika & Bahasa Indonesia, Bank Soal, serta Prota/Prosem Kurikulum Merdeka.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleResetToSample}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
              >
                Ya, Muat Contoh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Clear All */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-800">Hapus Seluruh Data Administrasi?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus seluruh data dari IndexedDB lokal? Pastikan Anda sudah mengunduh cadangan berkas .json jika masih membutuhkan data tersebut.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow"
              >
                Ya, Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
