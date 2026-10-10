import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Maximize2,
  Key,
  Loader2,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  chatWithTeacherAssistant,
  type ChatMessage,
  getActiveApiKey,
} from '../../utils/geminiAi';
import { getActiveAIConfig, AI_PROVIDERS_METADATA } from '../../utils/aiEngine';
import type { TeacherProfile } from '../../db';

interface FloatingAIAssistantProps {
  apiKey?: string;
  profile?: TeacherProfile;
  onOpenApiKeyModal: () => void;
  onOpenFullAssistantTab: () => void;
  onNotify: (msg: string) => void;
}

const STORAGE_KEY = 'ADMIN_GURU_AI_ASSISTANT_CHAT';

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  apiKey,
  profile,
  onOpenApiKeyModal,
  onOpenFullAssistantTab,
  onNotify,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'floating-init',
        sender: 'assistant',
        text: `Halo Bapak/Ibu Guru! 👋 Butuh ide cepat untuk Modul Ajar, butir soal asesmen, rubrik, atau ice breaking kelas? Tanyakan di sini!`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const aiCfg = getActiveAIConfig();
  const activeKey = aiCfg.apiKey || getActiveApiKey(apiKey);
  const isAIReady = aiCfg.provider === 'free_pollinations' || Boolean(activeKey && activeKey.trim());

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  const handleSend = async () => {
    if (!inputPrompt.trim() || loading) return;

    if (!isAIReady) {
      onOpenApiKeyModal();
      return;
    }

    const userMessage: ChatMessage = {
      id: `float-user-${Date.now()}`,
      sender: 'user',
      text: inputPrompt.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const reply = await chatWithTeacherAssistant(
        activeKey,
        messages,
        userMessage.text,
        {
          namaGuru: profile?.namaGuru,
          mataPelajaran: profile?.mataPelajaranUtama,
          satuanPendidikan: profile?.satuanPendidikan,
        }
      );

      const botMessage: ChatMessage = {
        id: `float-bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `float-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Gagal menghubungi AI: ${err.message || 'Periksa koneksi atau beralih ke Mode AI Gratis.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Teks jawaban disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group border border-white/20"
          title="Buka AI Asisten Guru (Ai 文静)"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
          </span>
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs sm:text-sm font-bold tracking-tight">AI Asisten Guru</span>
        </button>
      )}

      {/* Floating Chat Window / Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[95vw] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 to-indigo-700 px-4 py-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>Ai 文静</span>
                  <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded">
                    {AI_PROVIDERS_METADATA[aiCfg.provider]?.badge || 'DeepSeek'}
                  </span>
                </div>
                <div className="text-[10px] text-indigo-200">Asisten Pedagogi & Kurikulum</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullAssistantTab();
                }}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition"
                title="Buka di Layar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition"
                title="Tutup Widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Pill */}
          <div className="bg-indigo-50/70 border-b border-indigo-100 px-3 py-1.5 flex items-center justify-between text-[11px] text-indigo-900">
            <span className="truncate">
              Guru: <strong>{profile?.namaGuru || 'Bapak/Ibu'}</strong> ({profile?.mataPelajaranUtama || 'Umum'})
            </span>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'init-reset',
                    sender: 'assistant',
                    text: 'Percakapan direset. Silakan tanyakan hal pedagogi atau administrasi pembelajaran!',
                    timestamp: Date.now(),
                  },
                ]);
              }}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] ${
                      isUser ? 'bg-indigo-600' : 'bg-purple-600'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-2.5 shadow-2xs text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {!isUser && (
                      <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 font-medium"
                          title="Salin jawaban"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>Mengetik jawaban...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2.5 border-t border-slate-200 bg-white space-y-1.5">
            {!isAIReady && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center justify-between">
                <span>API Key belum diisi atau pilih Mode Gratis.</span>
                <button
                  onClick={onOpenApiKeyModal}
                  className="font-bold underline text-amber-950 cursor-pointer"
                >
                  Atur AI
                </button>
              </div>
            )}

            <div className="flex items-end gap-1.5">
              <textarea
                ref={inputRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ketik pertanyaan pedagogi atau materi... (Enter untuk kirim)"
                rows={2}
                disabled={loading}
                className="flex-1 p-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none bg-slate-50/50"
              />

              <button
                onClick={handleSend}
                disabled={loading || !inputPrompt.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition cursor-pointer disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
