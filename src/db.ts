import Dexie, { type Table } from 'dexie';

// --- Tipe Data Entitas Kurikulum & Administrasi Pembelajaran Guru ---

export interface ModulAjarItem {
  id?: number;
  mataPelajaran: string;
  kelas: string;
  topik: string;
  alokasiWaktu: string;
  langkahPembelajaran: string;
  tanggalBuat?: string;
  // Detail opsional kurikulum merdeka
  judulModul?: string;
  semester?: 'Ganjil' | 'Genap' | string;
  tahunAjaran?: string;
  tujuanPembelajaran?: string;
  pertanyaanPemantik?: string;
  pemahamanBermakna?: string;
  asesmen?: {
    diagnostik?: string;
    formatif?: string;
    sumatif?: string;
  } | string;
  profilPelajarPancasila?: string[];
  saranaPrasarana?: string;
  targetPesertaDidik?: string;
  modelPembelajaran?: string;
  kegiatanPembelajaran?: {
    pendahuluan?: string;
    inti?: string;
    penutup?: string;
  };
  pengayaanRemedial?: string;
  glosarium?: string;
  daftarPustaka?: string;
  namaGuru?: string;
  nipGuru?: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  satuanPendidikan?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface SoalItem {
  id?: number;
  mataPelajaran: string;
  kelas: string;
  faseKelas?: string;
  kurikulum?: 'Kurikulum Merdeka' | 'Kurikulum 2013' | string;
  bentukSoal: 'Pilihan Ganda' | 'Essay' | 'Uraian / Essay' | 'Pilihan Ganda Kompleks' | 'Menjodohkan' | 'Isian Singkat' | string;
  jenisSoal?: 'Pilihan Ganda' | 'Essay' | 'Uraian / Essay' | 'Pilihan Ganda Kompleks' | 'Menjodohkan' | 'Isian Singkat' | string;
  tingkatKesulitan: 'Mudah' | 'Sedang' | 'Sukar' | 'Sukar / HOTS' | string;
  pertanyaan: string;
  opsi?: string[]; // Pilihan A, B, C, D
  pilihanJawaban?: string[]; // Kompatibilitas
  kunciJawaban: string;
  materiPokok?: string;
  tujuanPembelajaran?: string;
  pembahasan?: string;
  bobotNilai?: number;
  tahunAjaran?: string;
  tanggalBuat?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProtaRincianItem {
  id: string;
  no: number;
  elemen: string;
  tujuanPembelajaran: string;
  materiPokok: string;
  alokasiWaktu: number;
  semester: 'Ganjil' | 'Genap' | string;
  alokasiBulan?: {
    [bulanKey: string]: number[];
  };
  keterangan?: string;
}

export interface ProtaProsemItem {
  id?: number;
  mataPelajaran: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap' | '1 Tahun Penuh' | string;
  alokasiWaktu: string | number;
  materiPokok: string;
  tipe: 'PROTA' | 'PROSEM';
  judul?: string;
  faseKelas?: string;
  tahunAjaran?: string;
  satuanPendidikan?: string;
  namaGuru?: string;
  nipGuru?: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  totalAlokasiWaktu?: number;
  daftarRincian: ProtaRincianItem[];
  createdAt?: number;
  updatedAt?: number;
}

export interface CpTpAtpItem {
  id?: number;
  mataPelajaran: string;
  kelas: string;
  elemen: string;
  tp: string;
  atp: string;
}

export interface TeacherProfile {
  id?: number;
  namaGuru: string;
  nipGuru: string;
  satuanPendidikan: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  mataPelajaranUtama: string;
  tahunAjaranAktif: string;
  kotaKabupaten: string;
}

export interface DokumenReferensiItem {
  id?: number;
  judul: string;
  mataPelajaran: string; // 'Bahasa Mandarin', 'Semua Mapel', 'Matematika', dll
  kategori: 'Kurikulum / CP' | 'Bahan Ajar / Materi' | 'Contoh Modul' | 'Silabus' | 'Pedoman Guru' | string;
  tipeFile: 'docx' | 'txt' | 'md' | 'json' | 'pdf' | 'manual' | string;
  namaFile: string;
  ukuranFile?: string;
  kontenTeks: string; // Teks yang dipelajari & dibaca oleh AI
  ringkasan?: string;
  faseKelas?: string;
  isAktif: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// --- Definisi Dexie Database ---

export class DatabaseGuruApp extends Dexie {
  modul_ajar!: Table<ModulAjarItem, number>;
  bank_soal!: Table<SoalItem, number>;
  prota_prosem!: Table<ProtaProsemItem, number>;
  cp_tp_atp!: Table<CpTpAtpItem, number>;
  profil_guru!: Table<TeacherProfile, number>;
  dokumen_referensi!: Table<DokumenReferensiItem, number>;

  constructor() {
    super('DatabaseAdministrasiGuru');
    this.version(1).stores({
      cp_tp_atp: '++id, mataPelajaran, kelas, elemen, tp, atp',
      prota_prosem: '++id, mataPelajaran, kelas, semester, alokasiWaktu, materiPokok, tipe, tahunAjaran',
      modul_ajar: '++id, mataPelajaran, kelas, topik, alokasiWaktu, langkahPembelajaran, tanggalBuat',
      bank_soal: '++id, mataPelajaran, kelas, bentukSoal, tingkatKesulitan, pertanyaan, kunciJawaban, tanggalBuat',
      profil_guru: '++id',
    });
    this.version(2).stores({
      cp_tp_atp: '++id, mataPelajaran, kelas, elemen, tp, atp',
      prota_prosem: '++id, mataPelajaran, kelas, semester, alokasiWaktu, materiPokok, tipe, tahunAjaran',
      modul_ajar: '++id, mataPelajaran, kelas, topik, alokasiWaktu, langkahPembelajaran, tanggalBuat',
      bank_soal: '++id, mataPelajaran, kelas, bentukSoal, tingkatKesulitan, pertanyaan, kunciJawaban, tanggalBuat',
      profil_guru: '++id',
      dokumen_referensi: '++id, mataPelajaran, kategori, namaFile, isAktif, createdAt',
    });
  }
}

export const db = new DatabaseGuruApp();

// --- Seeder Data Awal (Contoh Praktis Kurikulum Merdeka) ---

export async function seedInitialDataIfEmpty() {
  const soalCount = await db.bank_soal.count();
  const modulCount = await db.modul_ajar.count();

  if (soalCount === 0 && modulCount === 0) {
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Profil Guru Default
    await db.profil_guru.add({
      namaGuru: 'Siti Rahmawati, S.Pd.',
      nipGuru: '19880415 201101 2 003',
      satuanPendidikan: 'SMP Negeri 1 Merdeka Belajar',
      namaKepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
      nipKepalaSekolah: '19700312 199512 1 002',
      mataPelajaranUtama: 'Matematika',
      tahunAjaranAktif: '2024/2025',
      kotaKabupaten: 'Bandung',
    });

    // 2. Data Awal Modul Ajar
    await db.modul_ajar.bulkAdd([
      {
        mataPelajaran: 'Matematika',
        kelas: 'Kelas 7 (Fase D)',
        topik: 'Operasi Hitung Bilangan Bulat Negatif dan Positif',
        alokasiWaktu: '4 JP (2 Pertemuan x 2 JP @ 40 Menit)',
        langkahPembelajaran: `A. Kegiatan Pendahuluan (10 Menit):
1. Guru menyapa peserta didik, memimpin doa, dan mengecek kehadiran.
2. Apersepsi: Mengaitkan materi suhu kulkas atau kedalaman laut dengan bilangan bulat negatif.
3. Guru menyampaikan tujuan pembelajaran dan alur aktivitas kelompok.

B. Kegiatan Inti (60 Menit):
1. Mengamati stimulus infografis perubahan suhu di daerah bersalju.
2. Siswa dibagi ke dalam kelompok 4 orang dan mengerjakan LKPD eksplorasi garis bilangan.
3. Siswa mendiskusikan sifat-sifat penjumlahan dan pengurangan bilangan bulat.
4. Setiap kelompok mempresentasikan peragaan menggunakan garis bilangan karton.
5. Guru memberikan konfirmasi dan umpan balik formatif.

C. Kegiatan Penutup (10 Menit):
1. Siswa dan guru merangkum simpulan prinsip operasi hitung bilangan bulat.
2. Kuis refleksi cepat 3 butir soal pemahaman.
3. Doa penutup dan salam.`,
        tanggalBuat: todayStr,
        judulModul: 'Modul Ajar 01: Operasi Hitung Bilangan Bulat',
        semester: 'Ganjil',
        tahunAjaran: '2024/2025',
        tujuanPembelajaran: '1. Peserta didik dapat merepresentasikan bilangan bulat pada garis bilangan secara tepat.\n2. Peserta didik dapat menyelesaikan masalah konstekstual sehari-hari yang berkaitan dengan operasi penjumlahan dan pengurangan bilangan bulat.',
        pertanyaanPemantik: 'Pernahkah kalian melihat termometer di ruang pendingin? Mengapa ada angka di bawah nol? Bagaimana jika suhu mula-mula 2°C lalu turun 5°C?',
        pemahamanBermakna: 'Konsep bilangan negatif dan positif banyak digunakan dalam kehidupan nyata, seperti pencatatan suhu cuaca, kedalaman laut, serta keuntungan dan kerugian finansial.',
        asesmen: {
          diagnostik: 'Pertanyaan lisan apersepsi di awal pertemuan mengenai bilangan cacah.',
          formatif: 'Observasi keaktifan diskusi kelompok dan lembar kerja peserta didik (LKPD).',
          sumatif: 'Tes tertulis asesmen sumatif lingkup materi (5 butir PG dan 2 butir uraian).',
        },
        profilPelajarPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
        saranaPrasarana: 'Papan tulis, garis bilangan interaktif, LKPD cetak, dan proyektor.',
        modelPembelajaran: 'Problem-Based Learning (PBL)',
        targetPesertaDidik: 'Peserta didik reguler / tipikal (32 siswa)',
        pengayaanRemedial: 'Pengayaan: Soal penalaran HOTS olimpiade dasar.\nRemedial: Bimbingan tutor sebaya menggunakan garis bilangan.',
        daftarPustaka: 'Kemendikbudristek. Buku Panduan Guru dan Siswa Matematika Kelas VII.',
        namaGuru: 'Siti Rahmawati, S.Pd.',
        nipGuru: '19880415 201101 2 003',
        satuanPendidikan: 'SMP Negeri 1 Merdeka Belajar',
        namaKepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
        nipKepalaSekolah: '19700312 199512 1 002',
        createdAt: now - 86400000,
        updatedAt: now - 86400000,
      },
      {
        mataPelajaran: 'Bahasa Indonesia',
        kelas: 'Kelas 7 (Fase D)',
        topik: 'Menyusun Teks Deskripsi Objek Wisata Lokal',
        alokasiWaktu: '4 JP (2 x 40 Menit)',
        langkahPembelajaran: `A. Pendahuluan (10 Menit):
1. Salam, doa, presensi, dan apersepsi melihat foto pemandangan alam daerah setempat.
2. Penjelasan tujuan pembelajaran menulis teks deskripsi berdaya cerap pancaindra.

B. Inti (60 Menit):
1. Siswa membaca contoh teks deskripsi tentang Pantai Parangtritis atau keindahan alam lokal.
2. Siswa menganalisis struktur: judul, deskripsi umum, dan deskripsi bagian.
3. Siswa secara mandiri menulis draf teks deskripsi objek pilihan dengan kalimat bermajas dan pancaindra.
4. Umpan balik antar teman (peer-review).

C. Penutup (10 Menit):
1. Refleksi pembelajaran dan apresiasi karya siswa terbaik.
2. Pengumpulan tugas draf tulisan dan doa penutup.`,
        tanggalBuat: todayStr,
        judulModul: 'Modul Ajar 02: Teks Deskripsi Berpancaindra',
        semester: 'Ganjil',
        tahunAjaran: '2024/2025',
        tujuanPembelajaran: 'Peserta didik mampu menulis gagasan dan pengamatan dalam bentuk teks deskripsi dengan struktur runtut dan kaidah kebahasaan yang tepat.',
        pertanyaanPemantik: 'Bagaimana cara menceritakan suatu tempat yang indah kepada orang lain agar mereka seolah-olah dapat melihat dan merasakannya sendiri?',
        pemahamanBermakna: 'Kemampuan mendeskripsikan sesuatu dengan detail melatih kepekaan pancaindra dan keterampilan berkomunikasi persuasif.',
        profilPelajarPancasila: ['Kreatif', 'Bernalar Kritis'],
        modelPembelajaran: 'Genre-Based Approach (GBA)',
        createdAt: now - 43200000,
        updatedAt: now - 43200000,
      },
    ]);

    // 3. Data Awal Bank Soal
    await db.bank_soal.bulkAdd([
      {
        mataPelajaran: 'Matematika',
        kelas: 'Kelas 7 (Fase D)',
        bentukSoal: 'Pilihan Ganda',
        tingkatKesulitan: 'Sedang',
        pertanyaan: 'Suhu di dalam lemari es mula-mula -4°C. Ketika listrik padam, suhu naik 3°C setiap 20 menit. Berapakah suhu lemari es setelah padam selama 1 jam?',
        opsi: ['A. 5°C', 'B. 9°C', 'C. -13°C', 'D. 12°C'],
        pilihanJawaban: ['A. 5°C', 'B. 9°C', 'C. -13°C', 'D. 12°C'],
        kunciJawaban: 'A',
        pembahasan: '1 jam = 60 menit. Kenaikan suhu terjadi 60 / 20 = 3 kali. Kenaikan total = 3 x 3°C = 9°C. Suhu akhir = -4°C + 9°C = 5°C.',
        bobotNilai: 10,
        materiPokok: 'Bilangan Bulat',
        tahunAjaran: '2024/2025',
        tanggalBuat: todayStr,
        createdAt: now - 86400000,
        updatedAt: now - 86400000,
      },
      {
        mataPelajaran: 'Matematika',
        kelas: 'Kelas 7 (Fase D)',
        bentukSoal: 'Pilihan Ganda',
        tingkatKesulitan: 'Sukar / HOTS',
        pertanyaan: 'Bentuk sederhana dari operasi aljabar 3(2x - 4y) - 2(x - 5y) adalah...',
        opsi: ['A. 4x - 2y', 'B. 4x - 22y', 'C. 5x - 2y', 'D. 4x + 2y'],
        pilihanJawaban: ['A. 4x - 2y', 'B. 4x - 22y', 'C. 5x - 2y', 'D. 4x + 2y'],
        kunciJawaban: 'A',
        pembahasan: '3(2x - 4y) - 2(x - 5y) = 6x - 12y - 2x + 10y = (6x - 2x) + (-12y + 10y) = 4x - 2y.',
        bobotNilai: 15,
        materiPokok: 'Bentuk Aljabar',
        tahunAjaran: '2024/2025',
        tanggalBuat: todayStr,
        createdAt: now - 43200000,
        updatedAt: now - 43200000,
      },
      {
        mataPelajaran: 'Bahasa Indonesia',
        kelas: 'Kelas 7 (Fase D)',
        bentukSoal: 'Essay',
        tingkatKesulitan: 'Sedang',
        pertanyaan: 'Jelaskan perbedaan mendasar antara teks deskripsi objektif dan teks deskripsi subjektif, serta sertakan masing-masing 1 contoh kalimat!',
        opsi: [],
        pilihanJawaban: [],
        kunciJawaban: 'Teks deskripsi objektif menggambarkan objek apa adanya tanpa opini pribadi penulis (contoh: Meja belajar itu memiliki panjang 120 cm dan terbuat dari kayu jati). Sedangkan teks deskripsi subjektif memuat kesan/opini emosional penulis (contoh: Suasana senja di pesisir pantai itu terasa begitu syahdu dan memesona).',
        pembahasan: 'Skor maksimal 20: 10 poin penjelasan konsep, 10 poin ketepatan contoh kalimat.',
        bobotNilai: 20,
        materiPokok: 'Teks Deskripsi',
        tahunAjaran: '2024/2025',
        tanggalBuat: todayStr,
        createdAt: now - 21600000,
        updatedAt: now - 21600000,
      },
    ]);

    // 4. Data Awal Prota & Prosem
    await db.prota_prosem.add({
      tipe: 'PROTA',
      judul: 'Program Tahunan Matematika Kelas VII',
      mataPelajaran: 'Matematika',
      kelas: 'Kelas 7 (Fase D)',
      faseKelas: 'Fase D (Kelas 7)',
      semester: '1 Tahun Penuh',
      alokasiWaktu: '108 JP',
      materiPokok: 'Bilangan Bulat, Aljabar, Geometri & Statistika',
      totalAlokasiWaktu: 108,
      tahunAjaran: '2024/2025',
      satuanPendidikan: 'SMP Negeri 1 Merdeka Belajar',
      namaGuru: 'Siti Rahmawati, S.Pd.',
      nipGuru: '19880415 201101 2 003',
      namaKepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
      nipKepalaSekolah: '19700312 199512 1 002',
      daftarRincian: [
        {
          id: '1',
          no: 1,
          elemen: 'Bilangan',
          tujuanPembelajaran: 'Memahami konsep bilangan bulat positif dan negatif serta menyelesaikan operasi hitung.',
          materiPokok: 'Bilangan Bulat & Pecahan',
          alokasiWaktu: 24,
          semester: 'Ganjil',
          keterangan: 'Tatap muka & asesmen sumatif bab',
        },
        {
          id: '2',
          no: 2,
          elemen: 'Aljabar',
          tujuanPembelajaran: 'Menyederhanakan bentuk aljabar dan menyelesaikan persamaan linear satu variabel.',
          materiPokok: 'Bentuk Aljabar & PLSV',
          alokasiWaktu: 28,
          semester: 'Ganjil',
          keterangan: 'Termasuk proyek mini aljabar',
        },
        {
          id: '3',
          no: 3,
          elemen: 'Pengukuran & Geometri',
          tujuanPembelajaran: 'Menentukan keliling dan luas bangun datar segi empat serta segitiga.',
          materiPokok: 'Bangun Datar Segiempat & Segitiga',
          alokasiWaktu: 30,
          semester: 'Genap',
          keterangan: 'Eksplorasi visual geometri',
        },
        {
          id: '4',
          no: 4,
          elemen: 'Analisis Data & Peluang',
          tujuanPembelajaran: 'Menyajikan dan menginterpretasikan data dalam diagram batang dan garis.',
          materiPokok: 'Statistika Dasar & Penyajian Data',
          alokasiWaktu: 26,
          semester: 'Genap',
          keterangan: 'Survei data lingkungan sekolah',
        },
      ],
      createdAt: now - 86400000,
      updatedAt: now - 86400000,
    });

    await db.prota_prosem.add({
      tipe: 'PROSEM',
      judul: 'Program Semester Ganjil Matematika Kelas VII',
      mataPelajaran: 'Matematika',
      kelas: 'Kelas 7 (Fase D)',
      faseKelas: 'Fase D (Kelas 7)',
      semester: 'Ganjil',
      alokasiWaktu: '52 JP',
      materiPokok: 'Bilangan Bulat dan Aljabar Linier',
      totalAlokasiWaktu: 52,
      tahunAjaran: '2024/2025',
      satuanPendidikan: 'SMP Negeri 1 Merdeka Belajar',
      namaGuru: 'Siti Rahmawati, S.Pd.',
      nipGuru: '19880415 201101 2 003',
      namaKepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
      nipKepalaSekolah: '19700312 199512 1 002',
      daftarRincian: [
        {
          id: 'ps1',
          no: 1,
          elemen: 'Bilangan',
          tujuanPembelajaran: 'Operasi hitung penjumlahan dan pengurangan bilangan bulat.',
          materiPokok: 'Bilangan Bulat Positif & Negatif',
          alokasiWaktu: 12,
          semester: 'Ganjil',
          alokasiBulan: {
            Juli: [0, 0, 4, 4],
            Agustus: [4, 0, 0, 0],
            September: [0, 0, 0, 0],
            Oktober: [0, 0, 0, 0],
            November: [0, 0, 0, 0],
            Desember: [0, 0, 0, 0],
          },
          keterangan: 'Pekan 3 & 4 Juli, Pekan 1 Agustus',
        },
        {
          id: 'ps2',
          no: 2,
          elemen: 'Bilangan',
          tujuanPembelajaran: 'Operasi hitung perkalian dan pembagian bilangan bulat serta pecahan.',
          materiPokok: 'Perkalian & Pembagian Bilangan Bulat',
          alokasiWaktu: 12,
          semester: 'Ganjil',
          alokasiBulan: {
            Juli: [0, 0, 0, 0],
            Agustus: [0, 4, 4, 4],
            September: [0, 0, 0, 0],
            Oktober: [0, 0, 0, 0],
            November: [0, 0, 0, 0],
            Desember: [0, 0, 0, 0],
          },
          keterangan: 'Pekan 2, 3, 4 Agustus',
        },
        {
          id: 'ps3',
          no: 3,
          elemen: 'Aljabar',
          tujuanPembelajaran: 'Mengenal variabel, koefisien, konstanta, dan suku bentuk aljabar.',
          materiPokok: 'Konsep Dasar Bentuk Aljabar',
          alokasiWaktu: 16,
          semester: 'Ganjil',
          alokasiBulan: {
            Juli: [0, 0, 0, 0],
            Agustus: [0, 0, 0, 0],
            September: [4, 4, 4, 4],
            Oktober: [0, 0, 0, 0],
            November: [0, 0, 0, 0],
            Desember: [0, 0, 0, 0],
          },
          keterangan: 'Pekan 1, 2, 3, 4 September',
        },
      ],
      createdAt: now - 43200000,
      updatedAt: now - 43200000,
    });
  }

  // 5. Cek & Seed Dokumen Referensi Belajar AI (Termasuk Standar Kurikulum Bahasa Mandarin & Umum)
  const docCount = await db.dokumen_referensi.count();
  if (docCount === 0) {
    const now = Date.now();
    await db.dokumen_referensi.bulkAdd([
      {
        judul: 'Pedoman Capaian Pembelajaran & Silabus Bahasa Mandarin (Kurikulum Merdeka)',
        mataPelajaran: 'Bahasa Mandarin',
        kategori: 'Kurikulum / CP',
        tipeFile: 'docx',
        namaFile: 'Silabus_CP_Bahasa_Mandarin_FaseD_FaseE.docx',
        ukuranFile: '42 KB',
        faseKelas: 'Fase D (SMP) & Fase E (SMA)',
        isAktif: true,
        kontenTeks: `PEDOMAN KURIKULUM MERDEKA MATA PELAJARAN BAHASA MANDARIN (汉语)
1. ELEMEN CAPAIAN PEMBELAJARAN (CP):
- Menyimak & Berbicara (Tīng & Shuō / 听与说): Peserta didik mampu merespons instruksi lisan sederhana, melafalkan 4 nada dasar (Shēngdiào) dan Pinyin (Hànyǔ Pīnyīn) dengan benar, serta mempraktikkan dialog sapaan, identitas diri, keluarga, dan lingkungan sekolah.
- Membaca & Memirsa (Dú & Kàn / 读与看): Mengenali goresan dasar karakter Hanzi (Hànzì Bǐhuà), mengenali minimal 50-100 karakter Hanzi frekuensi tinggi pada Fase D, dan 150-250 karakter pada Fase E/F.
- Menulis & Mempresentasikan (Xiě & Biǎodá / 写与表达): Menulis urutan goresan Hanzi (Bǐshùn) sesuai kaidah, menyusun kalimat sederhana dengan pola Subjek + Keterangan Waktu/Tempat + Predikat (S + T + V + O).

2. DAFTAR KOSAKATA & TATA BAHASA INTI FASE D & E:
- Sapaan & Kesopanan: 你好 (Nǐ hǎo), 早上好 (Zǎoshang hǎo), 谢谢 (Xièxie), 不客气 (Bù kèqi), 对不起 (Duìbuqǐ), 没关系 (Méi guānxi), 再见 (Zàijiàn).
- Perkenalan: 叫 (jiào), 姓 (xìng), 是 (shì), 哪国人 (nǎ guó rén), 印度尼西亚 (Yìndùníxīyà), 中国 (Zhōngguó). Pola: 我叫... 我是印度尼西亚人.
- Angka (1-100): 一 (yī), 二 (èr), 三 (sān), 四 (sì), 五 (wǔ), 六 (liù), 七 (qī), 八 (bā), 九 (jiǔ), 十 (shí).
- Anggota Keluarga: 爸爸 (bàba), 妈妈 (māma), 哥哥 (gēge), 姐姐 (jiějie), 弟弟 (dìdi), 妹妹 (mèimei). Kata kepemilikan 的 (de).
- Kata Tanya: 什么 (shénme - apa), 谁 (shéi - siapa), 哪儿 (nǎr - mana), 几 (jǐ - berapa).

3. STRATEGI PEMBELAJARAN:
Gunakan model Problem-Based Learning (PBL) dan Communicative Approach. Setiap Modul Ajar Bahasa Mandarin HARUS menyertakan:
- Teks Hanzi asli
- Transkripsi Pinyin lengkap dengan tanda nada (ā, á, ǎ, à)
- Terjemahan Bahasa Indonesia yang kontekstual
- Lembar Kerja Peserta Didik (LKPD) yang melatih pengucapan, penulisan goresan, dan roleplay percakapan nyata.`,
        ringkasan: 'Pedoman resmi CP elemen Menyimak, Berbicara, Membaca Hanzi, pola tata bahasa S+T+V+O, serta kosakata baku sapaan & perkenalan Kurikulum Merdeka.',
        createdAt: now,
        updatedAt: now,
      },
      {
        judul: 'Contoh Format Modul Ajar Baku Kurikulum Merdeka (Standar Kemendikbudristek)',
        mataPelajaran: 'Semua Mapel',
        kategori: 'Contoh Modul',
        tipeFile: 'md',
        namaFile: 'Format_Baku_Modul_Ajar_Kurikulum_Merdeka.md',
        ukuranFile: '18 KB',
        faseKelas: 'Semua Fase (A-F)',
        isAktif: true,
        kontenTeks: `SISTEMATIKA MODUL AJAR KURIKULUM MERDEKA
I. INFORMASI UMUM
- Identitas Modul (Nama Guru, Satuan Pendidikan, Mapel, Fase/Kelas, Alokasi Waktu)
- Kompetensi Awal
- Profil Pelajar Pancasila (Pilih 2-3 dimensi relevan)
- Sarana dan Prasarana
- Target Peserta Didik (Reguler, Kesulitan Belajar, Pencapaian Tinggi)
- Model Pembelajaran (PBL, PjBL, Discovery Learning, Inquiry)

II. KOMPONEN INTI
- Capaian Pembelajaran (CP) Elemen
- Tujuan Pembelajaran (Kriteria ABCD)
- Pemahaman Bermakna (Manfaat aplikatif dalam kehidupan nyata)
- Pertanyaan Pemantik (Memicu rasa ingin tahu dan nalar kritis)
- Kegiatan Pembelajaran (Pendahuluan, Inti sesuai Sintaks Model, Penutup dengan Refleksi)
- Asesmen (Diagnostik, Formatif proses, Sumatif akhir)
- Pengayaan dan Remedial

III. LAMPIRAN
- Lembar Kerja Peserta Didik (LKPD interaktif)
- Bahan Bacaan Guru dan Peserta Didik
- Glosarium (Istilah penting dan definisi)
- Daftar Pustaka`,
        ringkasan: 'Struktur baku 3 komponen Modul Ajar Kurikulum Merdeka yang wajib ditaati AI saat menyusun administrasi pembelajaran.',
        createdAt: now,
        updatedAt: now,
      }
    ]);
  }
}
