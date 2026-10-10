// src/components/KamusHsk/HskWordCard.tsx
import React from 'react';
import type { HskWord } from '../../types/hsk';

interface Props {
  word: HskWord;
}

export function HskWordCard({ word }: Props) {
  const form = word.forms[0];
  return (
    <div className="p-3 border-b border-slate-100 hover:bg-indigo-50/40 transition-colors">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-slate-800">{word.simplified}</span>
        {form && (
          <span className="text-sm text-indigo-600 font-medium">
            {form.transcriptions.pinyin}
          </span>
        )}
        {word.level?.[0] && (
          <span className="text-[10px] uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {word.level[0].replace('new-', 'HSK ')}
          </span>
        )}
      </div>
      {form && (
        <div className="text-sm text-slate-600 mt-1">
          {form.meanings.join('; ')}
        </div>
      )}
    </div>
  );
}
