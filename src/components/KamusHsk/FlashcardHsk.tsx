import React, { useMemo, useState } from 'react';
import type { HskWord } from '../../types/hsk';
import { getContohKalimat } from '../../data/contohKalimat';

interface Props {
  words: HskWord[];
  onExit: () => void;
}

const MAX_KARTU = 50;

export function FlashcardHsk({ words, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [benar, setBenar] = useState(0);
  const [salah, setSalah] = useState(0);
  const [sesiUlang, setSesiUlang] = useState(0);

  const deck = useMemo(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_KARTU);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, sesiUlang]);

  const resetSesi = () => {
    setIndex(0);
    setFlipped(false);
    setBenar(0);
    setSalah(0);
    setSesiUlang((n) => n + 1);
  };

  if (deck.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-slate-500">
        Tidak ada kata untuk dilatih. Coba ubah filter level atau kosongkan pencarian.
      </div>
    );
  }

  const isDone = index >= deck.length;

  if (isDone) {
    const total = benar + salah;
    const persen = total > 0 ? Math.round((benar / total) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="text-6xl mb-4">{persen >= 80 ? '🎉' : persen >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold mb-2">Sesi Selesai!</h2>
        <p className="text-slate-500 mb-6">Kamu menyelesaikan {total} kartu</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-700">{benar}</div>
            <div className="text-xs text-green-700">Benar</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-red-700">{salah}</div>
            <div className="text-xs text-red-700">Salah</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-indigo-700">{persen}%</div>
            <div className="text-xs text-indigo-700">Akurasi</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetSesi}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Sesi Baru
          </button>
          <button
            onClick={onExit}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const current = deck[index];
  const form = current.forms[0];
  const contoh = getContohKalimat(current.simplified);

  const handleJawab = (benarJawab: boolean) => {
    if (benarJawab) setBenar((b) => b + 1);
    else setSalah((s) => s + 1);
    setFlipped(false);
    // Delay kecil biar animasi reset halus
    setTimeout(() => setIndex((i) => i + 1), 200);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header progress */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-slate-500">
          Kartu <span className="font-bold text-slate-700">{index + 1}</span> / {deck.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-semibold">✓ {benar}</span>
          <span className="text-xs text-red-600 font-semibold">✗ {salah}</span>
          <button
            onClick={onExit}
            className="text-sm text-slate-400 hover:text-slate-700 transition"
            title="Keluar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(index / deck.length) * 100}%` }}
        />
      </div>

      {/* ⭐ KARTU FLIP 3D */}
      <div
        className="[perspective:1200px] w-full"
        style={{ minHeight: '360px' }}
      >
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full h-[360px] cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Sisi Depan — Hanzi */}
          <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-2xl shadow-lg border-2 border-slate-200 flex flex-col items-center justify-center p-8">
            <div className="text-7xl sm:text-8xl font-bold text-slate-800 text-center">
              {current.simplified}
            </div>
            {current.level?.[0] && (
              <div className="mt-6 text-xs uppercase bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
                {current.level[0].replace('new-', 'HSK ')}
              </div>
            )}
            <div className="mt-8 text-xs text-slate-400">
              👆 Klik untuk lihat jawaban
            </div>
          </div>

          {/* Sisi Belakang — Pinyin, Arti, Contoh Kalimat */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border-2 border-indigo-200 flex flex-col items-center justify-center p-6 overflow-auto"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="text-5xl font-bold text-slate-800 mb-3">
              {current.simplified}
            </div>
            <div className="text-2xl text-indigo-600 mb-2 font-semibold">
              {form?.transcriptions.pinyin}
            </div>
            <div className="text-slate-700 text-center text-base mb-4 max-w-md">
              {form?.meanings.join('; ')}
            </div>

            {contoh && (
              <div className="w-full max-w-md bg-white/70 rounded-xl p-3 border border-indigo-100">
                <div className="text-[10px] text-indigo-500 uppercase font-bold mb-1">
                  Contoh Kalimat
                </div>
                <div className="text-base font-medium text-slate-800 mb-0.5">
                  {contoh.kalimat}
                </div>
                <div className="text-xs text-indigo-600 italic mb-0.5">
                  {contoh.pinyin}
                </div>
                <div className="text-xs text-slate-500">
                  {contoh.arti}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tombol aksi */}
      {flipped ? (
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => handleJawab(false)}
            className="py-3.5 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition border-2 border-red-200"
          >
            ✗ Salah
          </button>
          <button
            onClick={() => handleJawab(true)}
            className="py-3.5 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition border-2 border-green-200"
          >
            ✓ Benar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full mt-5 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          Lihat Jawaban
        </button>
      )}
    </div>
  );
}