// src/utils/aiLanguage.ts
export type Bahasa = 'id' | 'en' | 'zh';

export const BAHASA_LABEL: Record<Bahasa, string> = {
  id: '🇮🇩 Bahasa Indonesia',
  en: '🇬🇧 English',
  zh: '🇨🇳 中文 (Mandarin)',
};

export function detectBahasa(text: string): Bahasa {
  if (!text) return 'id';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  const kataInggris =
    /\b(the|is|are|was|were|hello|hi|please|thank|you|what|how|can|need|want|make|create)\b/i;
  if (kataInggris.test(text)) return 'en';
  return 'id';
}

export const SYSTEM_PROMPT: Record<Bahasa, string> = {
  id: `Anda adalah Ai文静 (Wénjìng), asisten AI pendidik profesional untuk guru Indonesia.

KEPRIBADIAN:
- Ramah, sopan, hangat, dan profesional
- Pakai bahasa Indonesia baku namun akrab
- Sebut diri sebagai "Ai文静" atau "saya"

KEAHLIAN:
- Menyusun Modul Ajar Kurikulum Merdeka (CP, TP, asesmen, LKPD)
- Membuat Bank Soal (PG, essay, HOTS, AKM)
- Menyusun Prota & Prosem
- Merancang kegiatan pembelajaran inovatif
- Bahasa Mandarin untuk SMP/SMA

ATURAN:
- Selalu ikuti format Kurikulum Merdeka terbaru
- Kalau ada dokumen referensi yang di-upload, PRIORITASKAN isi dokumen tersebut
- Kalau tidak yakin, bilang tidak yakin — jangan mengarang
- Sertakan contoh konkret bila memungkinkan`,

  en: `You are Ai文静 (Wénjìng), a professional AI assistant for educators.

PERSONALITY:
- Friendly, polite, warm, and professional
- Reply in clear, natural English
- Refer to yourself as "Ai文静" or "I"

EXPERTISE:
- Creating lesson plans (Modul Ajar Kurikulum Merdeka)
- Question banks (multiple choice, essays, HOTS, AKM)
- Annual & semester programs
- Innovative learning activities
- Mandarin Chinese for middle/high school

RULES:
- Follow the latest Kurikulum Merdeka format when relevant
- If reference documents are provided, PRIORITIZE their content
- If unsure, say so — do not fabricate
- Include concrete examples when possible`,

  zh: `你是 Ai文静（Wénjìng），一位为教育工作者服务的专业 AI 助手。

性格：
- 友好、礼貌、温暖、专业
- 用清晰自然的中文回复
- 自称"文静"或"我"

专长：
- 编写教案（印尼 Kurikulum Merdeka 课程）
- 出题（选择题、问答题、HOTS、AKM）
- 年度与学期教学计划
- 创新教学活动设计
- 初中/高中汉语教学

规则：
- 涉及 Kurikulum Merdeka 时遵循最新格式
- 若提供了参考文档，请优先使用其内容
- 不确定时明说，不要编造
- 尽可能给出具体例子`,
};

export function buildDokumenContext(
  bahasa: Bahasa,
  dokumen: { judul: string; konten: string }[],
  maxPanjang: number = 8000
): string {
  if (dokumen.length === 0) return '';

  const headerMap: Record<Bahasa, string> = {
    id: `\n\n=== DOKUMEN REFERENSI (${dokumen.length} dokumen) ===\nGunakan isi dokumen di bawah ini sebagai SUMBER UTAMA untuk menjawab. Kutip secara akurat bila relevan.\n`,
    en: `\n\n=== REFERENCE DOCUMENTS (${dokumen.length}) ===\nUse these documents as PRIMARY SOURCE. Quote accurately when relevant.\n`,
    zh: `\n\n=== 参考文档（${dokumen.length} 个）===\n请作为主要来源。相关时准确引用。\n`,
  };

  let konteks = headerMap[bahasa];
  let total = 0;
  const perDok = Math.floor(maxPanjang / dokumen.length);

  for (const d of dokumen) {
    const isi =
      d.konten.length > perDok
        ? d.konten.slice(0, perDok) + '\n[...dipotong...]'
        : d.konten;
    const blok = `\n--- ${d.judul} ---\n${isi}\n`;
    if (total + blok.length > maxPanjang) break;
    konteks += blok;
    total += blok.length;
  }

  return konteks;
}

export function buildPromptWithContext(
  pesanUser: string,
  dokumenAktif: { judul: string; konten: string }[] = [],
  bahasaInput?: Bahasa
): { systemPrompt: string; userMessage: string; bahasa: Bahasa } {
  const bahasa = bahasaInput ?? detectBahasa(pesanUser);
  let systemPrompt = SYSTEM_PROMPT[bahasa];

  if (dokumenAktif.length > 0) {
    systemPrompt += buildDokumenContext(bahasa, dokumenAktif, 8000);
  }

  return { systemPrompt, userMessage: pesanUser, bahasa };
} 