import {
  callUniversalAI,
  extractJSON,
  getActiveAIConfig,
  testUniversalAIConnection,
  type AIConfig,
  type AIProvider,
} from './aiEngine';
import { getActiveKnowledgeContext } from './knowledgeBase';

export {
  callUniversalAI,
  extractJSON,
  getActiveAIConfig,
  testUniversalAIConnection,
  type AIConfig,
  type AIProvider,
};

/**
 * Otomatis menentukan Fase Kurikulum Merdeka berdasarkan Kelas/Jenjang
 */
export function dapatkanFase(kelas: string | number): string {
  const k = String(kelas).toLowerCase();
  if (k.includes('7') || k.includes('8') || k.includes('9') || k.includes('smp')) {
    return 'Fase D (SMP Kelas 7-9)';
  } else if (k.includes('10') || k.includes('x')) {
    return 'Fase E (SMA Kelas 10)';
  } else if (k.includes('11') || k.includes('12') || k.includes('xi')) {
    return 'Fase F (SMA Kelas 11-12)';
  }
  return 'Fase D / E / F';
}

export interface ModulAjarParam {
  mataPelajaran: string;
  kelas: string;
  topik: string;
  alokasiWaktu?: string;
  modelPembelajaran?: string;
  profilPancasila?: string[] | string;
}

export interface ModulAjarResultJSON {
  informasiUmum: {
    mataPelajaran: string;
    kelasJenjang: string;
    fase: string;
    alokasiWaktu: string;
    modelPembelajaran: string;
    profilPelajarPancasila: string[];
    kompetensiAwal: string;
    saranaPrasarana: string;
  };
  komponenInti: {
    capaianPembelajaran: string;
    tujuanPembelajaran: string[];
    pemahamanBermakna: string;
    pertanyaanPemantik: string[];
    kegiatanPembelajaran: {
      pendahuluan: string[];
      inti: string[];
      penutup: string[];
    };
    asesmen: {
      diagnostik: string;
      formatif: string;
      sumatif: string;
    };
    pengayaanDanRemedial: {
      pengayaan: string;
      remedial: string;
    };
  };
  lampiran: {
    lkpd: string;
    bahanBacaan: string;
    glosarium: string;
    daftarPustaka: string;
  };
}

/**
 * Mendapatkan API Key aktif (dari argument, localStorage, atau env)
 */
export function getActiveApiKey(customKey?: string): string {
  if (customKey && customKey.trim()) return customKey.trim();
  const config = getActiveAIConfig();
  return config.apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

/**
 * Tes koneksi AI (DeepSeek, Mode Gratis, atau provider aktif)
 */
export async function testGeminiApiKey(apiKey?: string): Promise<boolean> {
  const config = getActiveAIConfig();
  if (apiKey) config.apiKey = apiKey;
  return await testUniversalAIConnection(config);
}

/**
 * Fungsi Generate Modul Ajar Standar Kurikulum Merdeka
 * Mendukung DeepSeek, Mode Gratis (Pollinations), Groq, OpenRouter, & Gemini
 */
export async function generateModulAjarKurikulumMerdeka(
  apiKey: string,
  {
    mataPelajaran,
    kelas,
    topik,
    alokasiWaktu = '2 JP (2 x 40 Menit)',
    modelPembelajaran = 'Problem Based Learning (PBL)',
    profilPancasila = ['Bernalar Kritis', 'Mandiri', 'Gotong Royong'],
  }: ModulAjarParam
): Promise<ModulAjarResultJSON> {
  const fase = dapatkanFase(kelas);
  const knowledgeContext = await getActiveKnowledgeContext(mataPelajaran);

  const isMandarin =
    mataPelajaran.toLowerCase().includes('mandarin') ||
    mataPelajaran.toLowerCase().includes('chinese') ||
    topik.toLowerCase().includes('mandarin') ||
    topik.toLowerCase().includes('hanyu');

  const mandarinSpecialInstruction = isMandarin
    ? `
KHUSUS MATA PELAJARAN BAHASA MANDARIN (汉语 / HUÁYǓ):
- WAJIB menyertakan aksara Hanzi asli (汉字), transkripsi Hanyu Pinyin lengkap dengan tanda 4 nada (ā, á, ǎ, à), serta arti Bahasa Indonesia yang kontekstual.
- Di Capaian Pembelajaran (CP) & Tujuan (TP): Rumuskan penguasaan elemen Menyimak (听), Berbicara (说), Membaca Hanzi (读), dan Menulis goresan Hanzi (写).
- Di Kegiatan Inti: Cantumkan contoh naskah dialog percakapan role-play dua orang lengkap dengan Hanzi, Pinyin, dan terjemahan.
- Di Lampiran LKPD: Buatkan tabel latihan mencocokkan Hanzi-Pinyin-Arti dan panduan urutan goresan Hanzi dasar (笔画 Bǐhuà).
`
    : '';

  const systemPrompt = `
Kamu adalah Pengembang Kurikulum dan Spesialis Administrasi Pembelajaran Kurikulum Merdeka untuk jenjang SMP dan SMA.
Tugasmu adalah membuat **Modul Ajar / Rencana Pelaksanaan Pembelajaran (RPP) Kurikulum Merdeka** yang lengkap, sistematis, dan siap pakai.
Kembalikan HANYA format JSON valid tanpa tanda kutip markdown pembuka atau penutup.
${mandarinSpecialInstruction}
  `.trim();

  const userPrompt = `
INFORMASI INPUT:
- Mata Pelajaran: ${mataPelajaran}
- Kelas / Jenjang: ${kelas} (${fase})
- Topik / Materi Utama: ${topik}
- Alokasi Waktu: ${alokasiWaktu}
- Model Pembelajaran: ${modelPembelajaran}
- Dimensi Profil Pelajar Pancasila: ${Array.isArray(profilPancasila) ? profilPancasila.join(', ') : profilPancasila}

${knowledgeContext ? `DOKUMEN PEDOMAN & KURIKULUM YANG DIUNGGAH OLEH GURU:\n${knowledgeContext}\n(Prioritaskan dan selaraskan isi modul dengan dokumen pedoman di atas!)\n` : ''}

Bentuklah output berupa JSON PERSIS mengikuti struktur kunci di bawah ini:

{
  "informasiUmum": {
    "mataPelajaran": "${mataPelajaran}",
    "kelasJenjang": "${kelas}",
    "fase": "${fase}",
    "alokasiWaktu": "${alokasiWaktu}",
    "modelPembelajaran": "${modelPembelajaran}",
    "profilPelajarPancasila": [${(Array.isArray(profilPancasila) ? profilPancasila : [profilPancasila]).map((p) => `"${p}"`).join(', ')}],
    "kompetensiAwal": "Deskripsi pengetahuan/keterampilan prasyarat siswa sebelum masuk materi ini",
    "saranaPrasarana": "Fasilitas, media pembelajaran, LCD/Laptop, dan sumber belajar yang dibutuhkan"
  },
  "komponenInti": {
    "capaianPembelajaran": "Ringkasan Capaian Pembelajaran (CP) elemen terkait",
    "tujuanPembelajaran": [
      "Tujuan Pembelajaran 1 (memuat kriteria Audience, Behavior, Condition, Degree)",
      "Tujuan Pembelajaran 2"
    ],
    "pemahamanBermakna": "Manfaat nyata yang akan diperoleh peserta didik dalam kehidupan sehari-hari",
    "pertanyaanPemantik": [
      "Pertanyaan pemantik 1 untuk memicu diskusi",
      "Pertanyaan pemantik 2"
    ],
    "kegiatanPembelajaran": {
      "pendahuluan": [
        "Salam, doa, dan pemeriksaaan kehadiran",
        "Apersepsi dan mengaitkan materi dengan pengalaman siswa",
        "Penyampaian tujuan pembelajaran dan alur kegiatan"
      ],
      "inti": [
        "Sintaks 1 (${modelPembelajaran}): Orientasi siswa pada masalah / apersepsi materi",
        "Sintaks 2 (${modelPembelajaran}): Mengorganisasikan siswa untuk belajar",
        "Sintaks 3 (${modelPembelajaran}): Membimbing penyelidikan individu/kelompok",
        "Sintaks 4 (${modelPembelajaran}): Mengembangkan dan menyajikan hasil karya",
        "Sintaks 5 (${modelPembelajaran}): Menganalisis dan mengevaluasi proses pemecahan masalah"
      ],
      "penutup": [
        "Rangkuman/kesimpulan materi bersama peserta didik",
        "Refleksi singkat pembelajaran",
        "Penyampaian tindak lanjut/penugasan dan doa penutup"
      ]
    },
    "asesmen": {
      "diagnostik": "Bentuk pertanyaan/kuis singkat sebelum pembelajaran",
      "formatif": "Observasi sikap, diskusi kelompok, dan performa selama pembelajaran",
      "sumatif": "Tes tertulis/praktik di akhir materi"
    },
    "pengayaanDanRemedial": {
      "pengayaan": "Tugas pendalaman untuk peserta didik yang mencapai KTPM",
      "remedial": "Bimbingan perorangan atau re-teaching untuk yang membutuhkan pendampingan"
    }
  },
  "lampiran": {
    "lkpd": "Draf Lembar Kerja Peserta Didik (petunjuk tugas, soal latihan, atau lembar diskusi)",
    "bahanBacaan": "Ringkasan materi singkat untuk pendukung belajar siswa & guru",
    "glosarium": "Daftar kata/istilah penting beserta artinya",
    "daftarPustaka": "Sumber referensi buku/website"
  }
}
  `.trim();

  const responseText = await callUniversalAI({
    systemPrompt,
    userPrompt,
    jsonMode: true,
    temperature: 0.2,
    config: apiKey ? { apiKey } : undefined,
  });

  return extractJSON<ModulAjarResultJSON>(responseText);
}

/**
 * Helper untuk menyusun teks gabungan Kurikulum Merdeka yang rapi untuk editor atau IndexedDB
 */
export function formatModulAjarText(res: ModulAjarResultJSON): string {
  const profilList = res.informasiUmum?.profilPelajarPancasila;
  const profilStr = Array.isArray(profilList) ? profilList.join(', ') : (profilList || '-');

  const tpList = res.komponenInti?.tujuanPembelajaran;
  const tpStr = Array.isArray(tpList)
    ? tpList.map((tp, i) => `${i + 1}. ${tp}`).join('\n')
    : String(tpList || '-');

  const pemantikList = res.komponenInti?.pertanyaanPemantik;
  const pemantikStr = Array.isArray(pemantikList)
    ? pemantikList.map((p, i) => `${i + 1}. ${p}`).join('\n')
    : String(pemantikList || '-');

  const pendahuluanList = res.komponenInti?.kegiatanPembelajaran?.pendahuluan;
  const pendahuluanStr = Array.isArray(pendahuluanList)
    ? pendahuluanList.map((k) => `- ${k}`).join('\n')
    : String(pendahuluanList || '-');

  const intiList = res.komponenInti?.kegiatanPembelajaran?.inti;
  const intiStr = Array.isArray(intiList)
    ? intiList.map((k) => `- ${k}`).join('\n')
    : String(intiList || '-');

  const penutupList = res.komponenInti?.kegiatanPembelajaran?.penutup;
  const penutupStr = Array.isArray(penutupList)
    ? penutupList.map((k) => `- ${k}`).join('\n')
    : String(penutupList || '-');

  return `
=== I. INFORMASI UMUM ===
Mata Pelajaran : ${res.informasiUmum?.mataPelajaran || '-'}
Kelas / Fase   : ${res.informasiUmum?.kelasJenjang || '-'} (${res.informasiUmum?.fase || '-'})
Alokasi Waktu  : ${res.informasiUmum?.alokasiWaktu || '-'}
Model Belajar  : ${res.informasiUmum?.modelPembelajaran || '-'}
Profil Pancasila: ${profilStr}
Kompetensi Awal: ${res.informasiUmum?.kompetensiAwal || '-'}
Sarana/Prasarana: ${res.informasiUmum?.saranaPrasarana || '-'}

=== II. KOMPONEN INTI ===
1. CAPAIAN PEMBELAJARAN (CP):
${res.komponenInti?.capaianPembelajaran || '-'}

2. TUJUAN PEMBELAJARAN (TP):
${tpStr}

3. PEMAHAMAN BERMAKNA:
${res.komponenInti?.pemahamanBermakna || '-'}

4. PERTANYAAN PEMANTIK:
${pemantikStr}

5. KEGIATAN PEMBELAJARAN:
A. Pendahuluan:
${pendahuluanStr}

B. Kegiatan Inti (${res.informasiUmum?.modelPembelajaran || 'PBL'}):
${intiStr}

C. Penutup:
${penutupStr}

6. ASESMEN PENILAIAN:
- Diagnostik: ${res.komponenInti?.asesmen?.diagnostik || '-'}
- Formatif  : ${res.komponenInti?.asesmen?.formatif || '-'}
- Sumatif   : ${res.komponenInti?.asesmen?.sumatif || '-'}

7. PENGAYAAN & REMEDIAL:
- Pengayaan : ${res.komponenInti?.pengayaanDanRemedial?.pengayaan || '-'}
- Remedial  : ${res.komponenInti?.pengayaanDanRemedial?.remedial || '-'}

=== III. LAMPIRAN ===
1. LKPD / LEMBAR KERJA:
${res.lampiran?.lkpd || '-'}

2. BAHAN BACAAN GURU & SISWA:
${res.lampiran?.bahanBacaan || '-'}

3. GLOSARIUM:
${res.lampiran?.glosarium || '-'}

4. DAFTAR PUSTAKA:
${res.lampiran?.daftarPustaka || '-'}
  `.trim();
}

/**
 * Backward compatibility alias
 */
export async function generateModulAjarAI(
  apiKey: string,
  params: ModulAjarParam
) {
  const res = await generateModulAjarKurikulumMerdeka(apiKey, params);
  const teksTersusun = formatModulAjarText(res);
  return {
    tujuanPembelajaran: Array.isArray(res.komponenInti?.tujuanPembelajaran)
      ? res.komponenInti.tujuanPembelajaran.join('\n')
      : String(res.komponenInti?.tujuanPembelajaran || ''),
    pertanyaanPemantik: Array.isArray(res.komponenInti?.pertanyaanPemantik)
      ? res.komponenInti.pertanyaanPemantik.join('\n')
      : String(res.komponenInti?.pertanyaanPemantik || ''),
    pemahamanBermakna: res.komponenInti?.pemahamanBermakna || '',
    langkahPembelajaran: teksTersusun,
    asesmen: `Diagnostik: ${res.komponenInti?.asesmen?.diagnostik || '-'}\nFormatif: ${res.komponenInti?.asesmen?.formatif || '-'}\nSumatif: ${res.komponenInti?.asesmen?.sumatif || '-'}`,
    raw: res,
  };
}

export interface SoalAIInput {
  mataPelajaran: string;
  kelas: string;
  topik: string;
  bentukSoal: 'Pilihan Ganda' | 'Essay' | 'Campuran';
  jumlahSoal: number;
  tingkatKesulitan?: 'Mudah' | 'Sedang' | 'Sukar' | 'HOTS';
}

export interface SoalItemAI {
  pertanyaan: string;
  bentukSoal: 'Pilihan Ganda' | 'Uraian / Essay';
  opsi?: string[];
  kunciJawaban: string;
  pembahasan?: string;
  bobotNilai?: number;
  tingkatKesulitan?: string;
}

/**
 * Generate Butir Soal Bank Soal Otomatis menggunakan DeepSeek / Free AI
 */
export async function generateSoalAI(
  apiKey: string,
  params: SoalAIInput
): Promise<SoalItemAI[]> {
  const knowledgeContext = await getActiveKnowledgeContext(params.mataPelajaran);

  const isMandarin =
    (params.mataPelajaran || '').toLowerCase().includes('mandarin') ||
    (params.mataPelajaran || '').toLowerCase().includes('chinese') ||
    (params.topik || '').toLowerCase().includes('mandarin');

  const mandarinInstruction = isMandarin
    ? `
KHUSUS BUTIR SOAL BAHASA MANDARIN:
- Setiap soal WAJIB menyertakan aksara Hanzi asli (汉字) dan/atau Hanyu Pinyin lengkap dengan tanda 4 nada (ā, á, ǎ, à), serta terjemahan bahasa Indonesia dalam pertanyaan atau opsi jawaban.
- Menguji aspek: 1) Pemahaman arti kosakata/dialog, 2) Ketepatan nada (Shēngdiào) & Pinyin, 3) Goresan Hanzi dasar (笔画), atau 4) Pola tata bahasa Mandarin.
`
    : '';

  const systemPrompt = `
Anda adalah pembuat soal asesmen standar pendidikan nasional Kurikulum Merdeka.
Kembalikan HANYA format JSON valid berupa array of objects tanpa teks markdown lain.
${mandarinInstruction}
  `.trim();

  const userPrompt = `
Buatkan ${params.jumlahSoal} butir soal asesmen berkualitas dengan data berikut:
- Mata Pelajaran: ${params.mataPelajaran}
- Kelas / Fase: ${params.kelas}
- Topik: ${params.topik}
- Bentuk Soal: ${params.bentukSoal}
- Tingkat Kesulitan: ${params.tingkatKesulitan || 'Sedang / HOTS'}

${knowledgeContext ? `DOKUMEN PEDOMAN KURIKULUM & MATERI GURU:\n${knowledgeContext}\n(Pastikan butir soal mengacu pada pedoman dan materi yang diajarkan di atas!)\n` : ''}

Format JSON persis:
[
  {
    "pertanyaan": "Teks soal dengan stimulus kontekstual yang jelas...",
    "bentukSoal": "Pilihan Ganda",
    "opsi": ["A. Opsi pertama", "B. Opsi kedua", "C. Opsi ketiga", "D. Opsi keempat"],
    "kunciJawaban": "A",
    "pembahasan": "Penjelasan mengapa jawaban A benar...",
    "bobotNilai": 10,
    "tingkatKesulitan": "Sedang"
  }
]
Jika bentukSoal Uraian / Essay, jadikan opsi array kosong [] dan kunciJawaban berupa rubrik/jawaban lengkap.
  `.trim();

  const responseText = await callUniversalAI({
    systemPrompt,
    userPrompt,
    jsonMode: true,
    temperature: 0.3,
    config: apiKey ? { apiKey } : undefined,
  });

  return extractJSON<SoalItemAI[]>(responseText);
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

/**
 * Percakapan Interaktif dengan AI Asisten Guru (DeepSeek / Free AI)
 */
export async function chatWithTeacherAssistant(
  apiKey: string,
  history: ChatMessage[],
  newMessage: string,
  teacherContext?: {
    namaGuru?: string;
    mataPelajaran?: string;
    satuanPendidikan?: string;
    tahunAjaran?: string;
  }
): Promise<string> {
  const teacherInfo = teacherContext?.namaGuru
    ? `Guru: ${teacherContext.namaGuru}, Sekolah: ${teacherContext.satuanPendidikan || '-'}, Mapel: ${teacherContext.mataPelajaran || '-'}`
    : 'Bapak/Ibu Guru';

  const knowledgeContext = await getActiveKnowledgeContext(teacherContext?.mataPelajaran);

  const systemPrompt = `
Anda adalah "GuruPintar AI" — Asisten Konsultan Pedagogi, Kurikulum Merdeka, dan Administrasi Pembelajaran Guru Indonesia yang ramah, profesional, dan solutif (didukung mesin AI cerdas DeepSeek).
Konteks Pengguna: ${teacherInfo}.

${knowledgeContext ? `\n=== BASIS PENGETAHUAN & DOKUMEN YANG DIUNGGAH OLEH GURU ===\n${knowledgeContext}\nAnda HARUS selalu mengingat dan merujuk dokumen kurikulum/materi yang telah diajarkan dan diunggah guru di atas jika guru bertanya tentang modul, materi, atau silabus!\n` : ''}

Keahlian Anda meliputi:
1. Kurikulum Merdeka: Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP ABCD), Alur Tujuan Pembelajaran (ATP), Modul Ajar, Asesmen (Diagnostik, Formatif, Sumatif, KKTP), P5 (Projek Penguatan Profil Pelajar Pancasila).
2. Mata Pelajaran Khusus (Termasuk Bahasa Mandarin 汉语):
   - Jika ditanya tentang Bahasa Mandarin: Berikan karakter Hanzi asli, pinyin lengkap bernada (ā, á, ǎ, à), arti bahasa Indonesia, tata bahasa (S+T+V+O, partikel 的, dll.), serta metode pengajaran komunikatif (Communicative Language Teaching).
3. Mata Pelajaran Umum Lainnya: Matematika, IPA, Bahasa Indonesia, Informatika, Bahasa Inggris, dll.
4. Model & Metode Pembelajaran Inovatif: Problem-Based Learning (PBL), Project-Based Learning (PjBL), Discovery Learning, Inquiry, STEAM, Flipped Classroom.
5. Diferensiasi Pembelajaran: Diferensiasi Konten, Proses, dan Produk untuk peserta didik beragam kesiapan.
6. Pembuatan Asesmen: Butir soal HOTS (C4-C6), kisi-kisi, rubrik penilaian, lembar observasi sikap Profil Pancasila.
7. Manajemen Kelas: Ice breaking kontekstual, resolusi kebosanan belajar, motivasi siswa, interaksi efektif.

Gaya Komunikasi:
- Selalu menyapa dengan santun ("Bapak/Ibu Guru", "Rekan Pendidik").
- Berikan jawaban yang terstruktur jelas dengan poin-poin, format tebal (bold), contoh aplikatif yang langsung bisa dipraktikkan di ruang kelas.
- Jika diminta membuat contoh modul atau soal, berikan contoh konkret dan rapi.
  `.trim();

  // Konstruksi riwayat percakapan
  const recentHistory = history.slice(-6);
  let conversationText = '';

  recentHistory.forEach((msg) => {
    const roleName = msg.sender === 'user' ? 'Guru' : 'GuruPintar AI';
    conversationText += `${roleName}: ${msg.text}\n\n`;
  });

  conversationText += `Guru: ${newMessage}`;

  return await callUniversalAI({
    systemPrompt,
    userPrompt: conversationText,
    temperature: 0.7,
    config: apiKey ? { apiKey } : undefined,
  });
}
