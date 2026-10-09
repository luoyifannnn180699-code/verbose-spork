import React, { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { HskWord } from '../../types/hsk';
import { HskWordCard } from './HskWordCard';
import { HskFilterBar } from './HskFilterBar';
import hskData from '../../data/hskVocabulary.json';

export function KamusHskView() {
  const [level, setLevel] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const words = hskData as unknown as HskWord[];

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
