import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Trash2,
  Download,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  FileCheck,
  RotateCcw,
  Key,
  ExternalLink,
  Loader2,
  ChevronRight,
  Flame,
  Award,
  BookCheck,
  Settings2,
  Brain,
} from 'lucide-react';
import {
  chatWithTeacherAssistant,
  type ChatMessage,
  getActiveApiKey,
} from '../../utils/geminiAi';
import { getActiveAIConfig, AI_PROVIDERS_METADATA } from '../../utils/aiEngine';
import { KnowledgeBaseModal } from '../KnowledgeBase/KnowledgeBaseModal';
import type { TeacherProfile } from '../../db';

interface AIAssistantViewProps {
  onNotify: (msg: string) => void;
  profile?: TeacherProfile;
  apiKey?: string;
  onOpenApiKeyModal: () => void;
  onNavigateToTab?: (tab: 'modul_ajar' | 'bank_soal' | 'prota_prosem' | 'backup_restore' | 'ai_asisten') => void;
}

const STORAGE_KEY = 'ADMIN_GURU_AI_ASSISTANT_CHAT';

const QUICK_PROMPTS = [
  {
    icon: '🧊',
    title: 'Ice Breaking 5 Menit',
    desc: 'Aktivitas penyemangat belajar kontekstual',
    prompt: 'Buatkan 3 ide ice breaking seru berdurasi 3-5 menit yang relevan untuk memulai pembelajaran di kelas, tanpa membutuhkan alat rumit!',
  },
  {
    icon: '🎯',
    title: 'Rumuskan Tujuan (ABCD)',
    desc: 'Audience, Behavior, Condition, Degree',
    prompt: 'Bantu saya menyusun 3 Tujuan Pembelajaran Kurikulum Merdeka yang memenuhi kriteria ABCD (Audience, Behavior, Condition, Degree) untuk materi: ',
  },
  {
    icon: '📊',
    title: 'Rubrik Penilaian Autentik',
    desc: 'Format skala skor 1-4 & deskriptor',
    prompt: 'Buatkan rubrik penilaian autentik lengkap dengan skala 1-4 dan deskriptor performa untuk tugas presentasi kelompok siswa.',
  },
  {
    icon: '💡',
    title: 'Diferensiasi Pembelajaran',
    desc: 'Strategi konten, proses, dan produk',
    prompt: 'Bagaimana langkah konkret menerapkan pembelajaran terdiferensiasi (diferensiasi konten, proses, dan produk) di kelas yang siswanya memiliki variasi kemampuan belajar?',
  },
  {
    icon: '🧠',
    title: 'Susun Soal HOTS (C4-C6)',
    desc: 'Stimulus kontekstual & penalaran',
    prompt: 'Buatkan 3 butir soal HOTS (High Order Thinking Skills) lengkap dengan stimulus cerita dunia nyata, kunci jawaban, dan rubrik pembahasannya untuk materi: ',
  },
  {
    icon: '🌟',
    title: 'Ide Projek P5',
    desc: 'Profil Pelajar Pancasila tematik',
    prompt: 'Berikan ide tema dan modul projek P5 (Projek Penguatan Profil Pelajar Pancasila) yang aplikatif dan berdampak positif bagi lingkungan sekitar sekolah.',
  },
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onNotify,
  profile,
  apiKey,
  onOpenApiKeyModal,
}) => {
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
        id: 'welcome-1',
        sender: 'assistant',
        text: `Halo Bapak/Ibu Guru **${profile?.namaGuru || 'Pendidik'}**! 👋\n\nSaya **Ai 文静**, asisten cerdas pedagogi dan Kurikulum Merdeka Anda. Ada yang bisa saya bantu hari ini?\n\nAnda bisa menanyakan penyusunan **Tujuan Pembelajaran (TP)**, ide **Ice Breaking seru**, strategi **Diferensiasi Pembelajaran**, penyusunan **Rubrik Penilaian**, maupun pembuatan **Soal HOTS** kontekstual.`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const aiCfg = getActiveAIConfig();
  const activeKey = aiCfg.apiKey || getActiveApiKey(apiKey);
  const isAIReady = aiCfg.provider === 'free_pollinations' || Boolean(activeKey && activeKey.trim());

  // Simpan riwayat chat ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error(e);
      }
    }
  }, [messages]);

  // Scroll otomatis ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    if (!isAIReady) {
      onOpenApiKeyModal();
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const reply = await chatWithTeacherAssistant(
        activeKey,
        messages,
        textToSend.trim(),
        {
          namaGuru: profile?.namaGuru,
          mataPelajaran: profile?.mataPelajaranUtama,
          satuanPendidikan: profile?.satuanPendidikan,
          tahunAjaran: profile?.tahunAjaranAktif,
        }
      );

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Maaf, terjadi kendala saat memproses permintaan:**\n${err.message || 'Gagal menghubungi server AI.'}\n\n*Tips: Anda dapat beralih ke Mode AI Gratis (DeepSeek) atau memeriksa API Key Anda di menu atas.*`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      onNotify('Gagal mendapatkan balasan dari AI.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Teks berhasil disalin ke papan klip!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearChat = () => {
    if (confirm('Bersihkan seluruh riwayat percakapan dengan AI Asisten?')) {
      const resetMessages: ChatMessage[] = [
        {
          id: 'welcome-reset',
          sender: 'assistant',
          text: `Percakapan telah direset. Silakan ajukan pertanyaan pedagogi atau materi Kurikulum Merdeka yang ingin Anda diskusikan! 🚀`,
          timestamp: Date.now(),
        },
      ];
      setMessages(resetMessages);
      localStorage.removeItem(STORAGE_KEY);
      onNotify('Riwayat chat telah dibersihkan.');
    }
  };

  const handleExportChat = () => {
    const formatted = messages
      .map((m) => {
        const sender = m.sender === 'user' ? 'Guru' : 'Ai 文静';
        const time = new Date(m.timestamp).toLocaleTimeString('id-ID');
        return `[${time}] ${sender}:\n${m.text}\n\n-------------------------\n`;
      })
      .join('\n');

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Konsultasi_AI_Guru_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Riwayat percakapan berhasil diunduh!');
  };

  // Render sederhana teks markdown (bold, list, headings)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Heading 3 / 2
      if (line.startsWith('### ') || line.startsWith('## ')) {
        const clean = line.replace(/^#{2,3}\s+/, '');
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1 text-indigo-950">
            {clean}
          </h4>
        );
      }
      // Bullet list
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed text-slate-800">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s+/.test(line.trim())) {
        return (
          <div key={idx} className="ml-1 text-xs leading-relaxed text-slate-800 font-medium">
            {renderInlineMarkdown(line)}
          </div>
        );
      }
      // Normal paragraph
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-800">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    // Basic bold parsing: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Header Asisten */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Ai 文静
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-xs">
                  {AI_PROVIDERS_METADATA[aiCfg.provider]?.badge || 'DeepSeek AI'}
                </span>
                <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <Check className="w-3 h-3" /> Kurikulum Merdeka
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Konsultan cerdas pedagogi guru: rancang modul ajar, rubrik asesmen, ice breaking, soal HOTS, dan diferensiasi kelas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs shadow transition cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isAIReady ? 'Ganti Mesin AI' : 'Atur AI'}</span>
            </button>

            <button
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/80 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer border border-purple-300/40"
              title="Ajari AI dengan mengunggah file kurikulum/silabus Anda"
            >
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Ajari AI (Upload File)</span>
              <span className="sm:hidden">Ajari AI</span>
            </button>

            <button
              onClick={handleExportChat}
              disabled={messages.length <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer disabled:opacity-40"
              title="Unduh percakapan ke berkas .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Chat</span>
            </button>

            <button
              onClick={handleClearChat}
              disabled={messages.length <= 1}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-rose-500/30 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer disabled:opacity-40"
              title="Bersihkan riwayat percakapan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Kolom Kiri (Desktop): Kartu Ide & Inspirasi Prompts Cepat */}
        <div className="hidden lg:block lg:col-span-1 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Inspirasi Tanya Cepat</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Klik salah satu topik di bawah untuk langsung berkonsultasi dengan asisten AI:
            </p>

            <div className="space-y-2">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(q.prompt);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base">{q.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                        <span>{q.title}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{q.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <BookCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fokus Guru:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500 pl-1">
                <li>Menyesuaikan alur TP Kurikulum Merdeka</li>
                <li>Menciptakan stimulus kontekstual</li>
                <li>Penyusunan LKPD berdifferensiasi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Kolom Kanan / Utama: Area Percakapan & Input */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs h-[640px] overflow-hidden">
          {/* Quick Prompts Mobile Carousel */}
          <div className="lg:hidden p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-2">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputPrompt(q.prompt);
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs whitespace-nowrap text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium cursor-pointer shadow-2xs"
              >
                <span>{q.icon}</span>
                <span>{q.title}</span>
              </button>
            ))}
          </div>

          {/* Message Thread Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                      isUser
                        ? 'bg-indigo-600'
                        : 'bg-gradient-to-tr from-purple-700 to-indigo-600'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-2xs relative group ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                      </p>
                    ) : (
                      <div className="space-y-1.5 font-sans">
                        {renderFormattedText(msg.text)}

                        {/* Action Toolbar for Assistant Response */}
                        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-[10px]">
                            {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <button
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 font-medium transition cursor-pointer"
                            title="Salin jawaban ini"
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
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs text-xs text-slate-600 flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Ai 文静 sedang menyusun jawaban terbaik untuk Anda...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2">
            {!isAIReady && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>API Key belum dimasukkan atau Anda dapat beralih ke Mode AI Gratis (Tanpa API Key).</span>
                </div>
                <button
                  onClick={onOpenApiKeyModal}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 ml-2"
                >
                  Atur AI
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
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
                placeholder="Tanyakan apa saja tentang Kurikulum Merdeka, ide pembelajaran, rubrik, atau soal... (Tekan Enter untuk mengirim)"
                rows={2}
                disabled={loading}
                className="flex-1 p-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50/50 leading-relaxed disabled:opacity-50"
              />

              <button
                onClick={() => handleSend()}
                disabled={loading || !inputPrompt.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Kirim Pertanyaan"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Shift + Enter untuk baris baru &bull; Respons didukung model Gemini 1.5 Flash</span>
              <span className="hidden sm:inline">100% Khusus Konteks Pendidikan Indonesia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ajari AI / Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onNotify={onNotify}
        defaultMataPelajaran={profile?.mataPelajaranUtama || 'Bahasa Mandarin'}
      />
    </div>
  );
};
