// src/components/KamusHsk/HskFilterBar.tsx
import React from 'react';

interface Props {
  level: string;
  setLevel: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  total: number;
}

const LEVELS = ['all', 'new-1', 'new-2', 'new-3', 'new-4', 'new-5', 'new-6', 'new-7', 'new-8', 'new-9'];

export function HskFilterBar({ level, setLevel, search, setSearch, total }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 p-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              level === lv
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {lv === 'all' ? 'Semua' : lv.replace('new-', 'HSK ')}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari hanzi / pinyin / arti..."
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="text-xs text-slate-500">
        Menampilkan <span className="font-semibold text-slate-700">{total}</span> kata
      </div>
    </div>
  );
}
