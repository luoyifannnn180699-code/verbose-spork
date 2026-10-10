import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { HskWord } from '../../types/hsk';
import { HskWordCard } from './HskWordCard';
import { HskFilterBar } from './HskFilterBar';

export function KamusHskView() {
  const [words, setWords] = useState<HskWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'hskVocabulary.json')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data: HskWord[]) => {
        setWords(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal load hskVocabulary.json:', err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return words.filter((w) => {
      const matchLevel = level === 'all' || w.level.includes(level);
      if (!matchLevel) return false;
      if (!q) return true;
      const form = w.forms[0];
      return (
        w.simplified.includes(q) ||
        (form?.transcriptions.pinyin.toLowerCase().includes(q) ?? false) ||
        (form?.meanings.some((m) => m.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [words, level, search]);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 12,
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-slate-500">
        Memuat kamus HSK... (11.000+ kata)
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <HskFilterBar
        level={level}
        setLevel={setLevel}
        search={search}
        setSearch={setSearch}
        total={filtered.length}
      />

      <div
        ref={parentRef}
        className="h-[70vh] overflow-auto bg-white rounded-lg mt-3 border border-slate-200"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const word = filtered[virtualRow.index];
            return (
              <div
                key={word.simplified + '-' + virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <HskWordCard word={word} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}