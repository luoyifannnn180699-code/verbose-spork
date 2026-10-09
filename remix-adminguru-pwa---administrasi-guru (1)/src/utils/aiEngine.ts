import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'free_pollinations' | 'deepseek' | 'groq' | 'openrouter' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  customEndpoint?: string;
}

export const AI_PROVIDERS_METADATA: Record<
  AIProvider,
  {
    name: string;
    description: string;
    requiresKey: boolean;
    defaultModel: string;
    keyPlaceholder: string;
    keyHelpUrl: string;
    badge: string;
  }
> = {
  free_pollinations: {
    name: 'Mode AI Gratis (Tanpa API Key - Model DeepSeek)',
    description: 'Langsung aktif 100% gratis tanpa perlu registrasi atau kartu kredit. Didukung model DeepSeek R1/V3.',
    requiresKey: false,
    defaultModel: 'deepseek',
    keyPlaceholder: 'Tidak memerlukan API Key (Gratis Otomatis)',
    keyHelpUrl: '',
    badge: '100% Gratis',
  },
  deepseek: {
    name: 'DeepSeek AI Resmi (API Key)',
    description: 'Model DeepSeek-V3 & DeepSeek-R1 resmi langsung dari platform.deepseek.com. Sangat hemat & cerdas.',
    requiresKey: true,
    defaultModel: 'deepseek-chat',
    keyPlaceholder: 'sk-... (dari platform.deepseek.com)',
    keyHelpUrl: 'https://platform.deepseek.com/api_keys',
    badge: 'DeepSeek V3/R1',
  },
  groq: {
    name: 'Groq Cloud (Super Cepat & Gratis)',
    description: 'LPU inference super cepat dari Groq. Menyediakan model DeepSeek R1 & Llama 3.3 gratis.',
    requiresKey: true,
    defaultModel: 'deepseek-r1-distill-llama-70b',
    keyPlaceholder: 'gsk_... (dari console.groq.com)',
    keyHelpUrl: 'https://console.groq.com/keys',
    badge: 'Groq LPU',
  },
  openrouter: {
    name: 'OpenRouter (Akses Multi-Model)',
    description: 'Gerbang multi-model AI dengan banyak model gratis (DeepSeek R1 free, Llama 3 free).',
    requiresKey: true,
    defaultModel: 'deepseek/deepseek-r1:free',
    keyPlaceholder: 'sk-or-... (dari openrouter.ai)',
    keyHelpUrl: 'https://openrouter.ai/keys',
    badge: 'OpenRouter',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Model Gemini dari Google AI Studio.',
    requiresKey: true,
    defaultModel: 'gemini-1.5-flash',
    keyPlaceholder: 'AIzaSy... (dari aistudio.google.com)',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    badge: 'Gemini',
  },
};

/**
 * Mendapatkan konfigurasi AI aktif dari localStorage
 */
export function getActiveAIConfig(): AIConfig {
  if (typeof window === 'undefined') {
    return { provider: 'free_pollinations', apiKey: '', model: 'deepseek' };
  }

  const savedProvider = (localStorage.getItem('AI_PROVIDER') as AIProvider) || 'free_pollinations';
  const savedKey = localStorage.getItem('AI_API_KEY') || localStorage.getItem('GEMINI_API_KEY') || '';
  const savedModel = localStorage.getItem('AI_MODEL') || '';

  return {
    provider: savedProvider,
    apiKey: savedKey,
    model: savedModel || AI_PROVIDERS_METADATA[savedProvider]?.defaultModel || 'deepseek',
  };
}

/**
 * Menyimpan konfigurasi AI ke localStorage
 */
export function saveActiveAIConfig(config: Partial<AIConfig>) {
  if (typeof window === 'undefined') return;
  if (config.provider) localStorage.setItem('AI_PROVIDER', config.provider);
  if (config.apiKey !== undefined) {
    localStorage.setItem('AI_API_KEY', config.apiKey);
    if (config.provider === 'gemini') {
      localStorage.setItem('GEMINI_API_KEY', config.apiKey);
    }
  }
  if (config.model) localStorage.setItem('AI_MODEL', config.model);
}

/**
 * Helper untuk mengekstrak JSON bersih dari balasan AI yang mungkin memuat markdown block
 */
export function extractJSON<T = any>(rawText: string): T {
  let cleaned = rawText.trim();

  // Bersihkan markdown ```json ... ``` atau ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  // Jika masih ada teks pengantar sebelum { atau [
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Failed to parse JSON from AI response:', rawText);
    throw new Error(`Format balasan AI tidak dapat diproses: ${err.message}`);
  }
}

export interface UniversalAICallParams {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  jsonMode?: boolean;
  config?: Partial<AIConfig>;
}

/**
 * Universal AI Caller yang mendukung DeepSeek, Mode Gratis (Pollinations), Groq, OpenRouter, dan Gemini
 */
export async function callUniversalAI({
  systemPrompt = '',
  userPrompt,
  temperature = 0.3,
  jsonMode = false,
  config: overrideConfig,
}: UniversalAICallParams): Promise<string> {
  const activeConfig = { ...getActiveAIConfig(), ...overrideConfig };
  const provider = activeConfig.provider;
  const apiKey = activeConfig.apiKey;

  // 1. MODE GRATIS 100% (Pollinations - Model DeepSeek / OpenAI tanpa API key)
  if (provider === 'free_pollinations') {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const payload: any = {
      messages,
      model: 'deepseek', // Mengarahkan langsung ke DeepSeek engine
      jsonMode: jsonMode,
      temperature: temperature,
    };

    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server AI Gratis merespons status ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      return text;
    } catch (err: any) {
      // Fallback cadangan jika pollinations offline: coba alternatif
      console.warn('Pollinations call error, retrying with simple text format...', err);
      const promptCombined = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
      const resFallback = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptCombined)}?model=deepseek`);
      if (!resFallback.ok) throw new Error('Gagal menghubungi layanan AI Gratis. Periksa koneksi internet Anda.');
      return await resFallback.text();
    }
  }

  // 2. DEEPSEEK RESMI (OpenAI-compatible)
  if (provider === 'deepseek') {
    if (!apiKey) throw new Error('API Key DeepSeek belum diisi! Dapatkan di platform.deepseek.com');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const payload: any = {
      model: activeConfig.model || 'deepseek-chat',
      messages,
      temperature,
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`DeepSeek API Error (${res.status}): ${errBody || res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // 3. GROQ CLOUD (OpenAI-compatible)
  if (provider === 'groq') {
    if (!apiKey) throw new Error('API Key Groq belum diisi! Dapatkan di console.groq.com');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const payload: any = {
      model: activeConfig.model || 'deepseek-r1-distill-llama-70b',
      messages,
      temperature,
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Groq API Error (${res.status}): ${errBody || res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // 4. OPENROUTER (OpenAI-compatible)
  if (provider === 'openrouter') {
    if (!apiKey) throw new Error('API Key OpenRouter belum diisi! Dapatkan di openrouter.ai');

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const payload: any = {
      model: activeConfig.model || 'deepseek/deepseek-r1:free',
      messages,
      temperature,
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://adminguru.app',
        'X-Title': 'Portal Administrasi Guru',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenRouter Error (${res.status}): ${errBody || res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // 5. GOOGLE GEMINI (Fallback)
  if (provider === 'gemini') {
    const key = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    if (!key) throw new Error('Gemini API Key belum diisi! Dapatkan di aistudio.google.com');

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: activeConfig.model || 'gemini-1.5-flash',
      generationConfig: {
        temperature,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    });

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }

  throw new Error(`Penyedia AI tidak dikenali: ${provider}`);
}

/**
 * Uji koneksi AI berdasarkan provider yang dipilih
 */
export async function testUniversalAIConnection(config: AIConfig): Promise<boolean> {
  const reply = await callUniversalAI({
    userPrompt: 'Katakan "Koneksi Berhasil" dalam 2 kata saja.',
    config,
  });
  return !!reply && reply.length > 0;
}
