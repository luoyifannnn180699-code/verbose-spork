export interface HskWordForm {
  traditional: string;
  transcriptions: {
    pinyin: string;
    numeric: string;
  };
  meanings: string[];
  classifiers?: string[];
}

export interface HskWord {
  simplified: string;
  radical?: string;
  level: string[];
  frequency?: number;
  pos?: string[];
  forms: HskWordForm[];
}

export const HSK_LEVEL_LABELS: Record<string, string> = {
  'new-1': 'HSK 1',
  'new-2': 'HSK 2',
  'new-3': 'HSK 3',
  'new-4': 'HSK 4',
  'new-5': 'HSK 5',
  'new-6': 'HSK 6',
  'new-7': 'HSK 7',
  'new-8': 'HSK 8',
  'new-9': 'HSK 9',
};