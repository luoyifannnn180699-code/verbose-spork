export interface ContohModulTemplate {
  id: string;
  judul: string;
  mataPelajaran: string;
  kelas: string;
  fase: string;
  topik: string;
  alokasiWaktu: string;
  modelPembelajaran: string;
  profilPancasila: string[];
  deskripsiSingkat: string;
  isMandarinSpecial?: boolean;
  kontenLengkap: string;
  dataParsed: {
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
  };
}

export const CONTOH_MODUL_PRESETS: ContohModulTemplate[] = [
  {
    id: 'mandarin-smp-7-sapaan',
    judul: 'Modul Ajar Mandarin: Sapaan & Perkenalan Diri (问候与自我介绍)',
    mataPelajaran: 'Bahasa Mandarin',
    kelas: 'Kelas 7 (SMP)',
    fase: 'Fase D (SMP Kelas 7-9)',
    topik: 'Sapaan Formal/Informal & Perkenalan Diri (Wènhòu yǔ Zìwǒ Jièshào)',
    alokasiWaktu: '2 JP x 40 Menit (80 Menit)',
    modelPembelajaran: 'Problem Based Learning (PBL) & Communicative Approach',
    profilPancasila: ['Berkebhinekaan Global', 'Bernalar Kritis', 'Mandiri'],
    deskripsiSingkat: 'Modul lengkap Kurikulum Merdeka Bahasa Mandarin SMP Kelas 7. Memuat Hanzi, Pinyin bernada, 4 nada dasar, role-play sapaan, dan LKPD penulisan goresan.',
    isMandarinSpecial: true,
    dataParsed: {
      informasiUmum: {
        mataPelajaran: 'Bahasa Mandarin',
        kelasJenjang: 'Kelas 7 (SMP)',
        fase: 'Fase D (SMP Kelas 7-9)',
        alokasiWaktu: '2 JP x 40 Menit (80 Menit)',
        modelPembelajaran: 'Problem Based Learning (PBL) & Communicative Language Teaching',
        profilPelajarPancasila: ['Berkebhinekaan Global', 'Bernalar Kritis', 'Mandiri'],
        kompetensiAwal: 'Peserta didik belum mengenal aksara Hanzi dan sistem ejaan Hanyu Pinyin serta 4 nada bahasa Mandarin.',
        saranaPrasarana: 'Flashcard Hanzi & Pinyin, Audio pelafalan nada, LCD proyektor / speaker bluetooth, Papan tulis latihan goresan (Tianzige).'
      },
      komponenInti: {
        capaianPembelajaran: 'Elemen Menyimak-Berbicara: Peserta didik mampu menyimak dan membedakan pelafalan 4 nada Pinyin serta mempraktikkan sapaan dasar dan perkenalan diri secara lisan. Elemen Membaca-Menulis: Mengenali karakter Hanzi dasar sapaan (你, 好, 我, 叫) dan urutan goresan dasarnya.',
        tujuanPembelajaran: [
          'Peserta didik mampu melafalkan 4 nada dasar Hanyu Pinyin (ā, á, ǎ, à) dengan tepat melalui latihan drill audio.',
          'Peserta didik mampu mengucapkan ungkapan sapaan (你好 Nǐ hǎo, 老师好 Lǎoshī hǎo, 再见 Zàijiàn) sesuai situasi formal dan santai.',
          'Peserta didik mampu melakukan dialog perkenalan diri sederhana (nama dan asal negara) menggunakan pola kalimat 我叫... (Wǒ jiào...) dengan intonasi jelas dan santun.'
        ],
        pemahamanBermakna: 'Bahasa Mandarin adalah salah satu bahasa internasional dunia. Kemampuan menyapa dan memperkenalkan diri dalam bahasa Mandarin membuka jalan pertemanan global, menghargai keberagaman budaya, dan menumbuhkan rasa percaya diri lintas budaya.',
        pertanyaanPemantik: [
          'Mengapa kata yang sama dalam bahasa Mandarin jika dibaca dengan nada naik atau turun bisa memiliki arti yang berbeda?',
          'Bagaimana cara memberi salam yang sopan kepada guru dan teman baru dalam kebudayaan Tionghoa?'
        ],
        kegiatanPembelajaran: {
          pendahuluan: [
            'Guru membuka kelas dengan salam ramah: "同学们好！(Tóngxuémen hǎo!)" dan membimbing doa bersama.',
            'Apersepsi: Guru memutarkan klip lagu sapaan Mandarin singkat "你好歌 (Nǐ Hǎo Gē)" untuk mencairkan suasana.',
            'Guru menyampaikan tujuan pembelajaran hari ini, yaitu menguasai 4 nada Pinyin dan berani memperkenalkan diri dalam bahasa Mandarin.'
          ],
          inti: [
            'Sintaks 1 (Orientasi Masalah): Guru menyajikan video pendek dua siswa di sekolah internasional saling menyapa tetapi salah nada sehingga menimbulkan kebingungan arti (misal: mā [ibu] vs mǎ [kuda]). Siswa mengamati pentingnya nada.',
            'Sintaks 2 (Organisasi Belajar): Guru membagikan lembar panduan nada & flashcard Hanzi-Pinyin. Siswa dibagi berpasangan (Peer Pairing).',
            'Sintaks 3 (Penyelidikan & Drill Terbimbing): Siswa berlatih menirukan pengucapan guru: 你好 (Nǐ hǎo), 谢谢 (Xièxie), 不客气 (Bù kèqi), 再见 (Zàijiàn), 我叫... (Wǒ jiào...). Guru berkeliling mengoreksi artikulasi dan intonasi siswa.',
            'Sintaks 4 (Pengembangan & Unjuk Karya): Siswa bersama pasangan memainkan peran (Role Play) dialog perkenalan diri di depan kelas:\n  A: 你好！(Nǐ hǎo!)\n  B: 你好！(Nǐ hǎo!)\n  A: 你叫什么名字？(Nǐ jiào shénme míngzi?)\n  B: 我叫 Andi。你呢？(Wǒ jiào Andi. Nǐ ne?)\n  A: 我叫 Siti。很高兴认识你！(Wǒ jiào Siti. Hěn gāoxìng rènshi nǐ!)\n  B: 我也很高兴认识你！(Wǒ yě hěn gāoxìng rènshi nǐ!)',
            'Sintaks 5 (Evaluasi & Refleksi Masalah): Rekan sekelas memberikan apresiasi, guru memberikan penguatan atas kelancaran, ketepatan nada, dan etika komunikasi.'
          ],
          penutup: [
            'Rangkuman bersama: Mereview kembali 4 nada dan kosakata sapaan yang telah dipelajari dengan teknik tepuk nada.',
            'Refleksi siswa: Mengisi lembar refleksi emotikon ("Bagian mana yang paling mudah/menantang hari ini?").',
            'Tindak lanjut: Latihan menulis goresan Hanzi kata 你 dan 好 di buku kotak Tianzige di rumah, lalu berdoa dan salam penutup "再见！(Zàijiàn!)".'
          ]
        },
        asesmen: {
          diagnostik: 'Kuis lisan awal: Meminta siswa menirukan 3 bunyi vokal Mandarin untuk memetakan kepekaan intonasi.',
          formatif: 'Observasi unjuk kerja saat role-play percakapan berpasangan dengan rubrik penilaian (ketepatan nada Pinyin, kelancaran, kesantunan).',
          sumatif: 'Tes lisan individu (perkenalan diri 30 detik) dan tes tulis singkat mencocokkan Hanzi dengan Pinyin dan artinya.'
        },
        pengayaanDanRemedial: {
          pengayaan: 'Peserta didik yang telah mahir diajak menambahkan kosakata asal kota/negara: 我是印度尼西亚人 (Wǒ shì Yìndùníxīyà rén) dan membuat video pendek perkenalan di Canva/Tiktok edukasi.',
          remedial: 'Bimbingan khusus klinik pelafalan nada ke-3 dan kombinasi nada bersambung (Tone sandhi) dengan audio drill 1-on-1.'
        }
      },
      lampiran: {
        lkpd: `LEMBAR KERJA PESERTA DIDIK (LKPD) BAHASA MANDARIN
Topik: 问候与自我介绍 (Sapaan dan Perkenalan Diri)
Nama: _______________ Kelas: 7 ___

BAGIAN A: MENCOCOKKAN HANZI, PINYIN & ARTI
Tarik garis dari Kolom A ke Kolom B dan Kolom C:
1. 你好        • [Xièxie]         • Terima kasih
2. 谢谢        • [Nǐ hǎo]         • Sampai jumpa
3. 再见        • [Zàijiàn]        • Halo / Hai
4. 老师        • [Wǒ jiào...]     • Nama saya...
5. 我叫...     • [Lǎoshī]         • Guru

BAGIAN B: LENGKAPI DIALOG PERCAKAPAN
Lengkapilah titik-titik di bawah ini dengan kata yang tepat:
A: 你好！(Nǐ hǎo!)
B: _________！(Nǐ hǎo!)
A: 你叫______名字？(Nǐ jiào ______ míngzi?)
B: 我叫 Budi。(Wǒ jiào Budi.) 你呢？(Nǐ ne?)
A: 我叫 Dewi。很高兴认识你！
B: 我也很高兴________你！(rènshi)

BAGIAN C: LATIHAN GORESAN HANZI (笔画)
Tuliskan karakter Hanzi di bawah ini sebanyak 4 kali dengan urutan goresan benar:
1. 你 (nǐ) :撇、竖、撇、横钩、竖钩、撇、点
2. 好 (hǎo):撇点、撇、提、横撇、竖钩、横`,
        bahanBacaan: `RINGKASAN MATERI BAHASA MANDARIN KELAS 7
1. Sistem Ejaan Hanyu Pinyin (汉语拼音):
   Terdiri atas Inisial (Konsonan / 声母), Final (Vokal / 韵母), dan Nada (声调).
2. Empat Nada Dasar:
   - Nada 1 ( - ): Datar, tinggi, panjang (mā - Ibu)
   - Nada 2 ( / ): Naik dari sedang ke tinggi (má - Rami)
   - Nada 3 ( v ): Turun lalu naik (mǎ - Kuda)
   - Nada 4 ( \\ ): Turun tajam dan tegas (mà - Memarahi)
3. Aturan Nada Bersambung (变调):
   Jika dua nada ke-3 bertemu (misal: 你 nǐ + 好 hǎo), maka kata pertama dibaca menjadi nada ke-2 (ní hǎo).`,
        glosarium: '你好 (Nǐ hǎo: Halo) | 老师 (Lǎoshī: Guru) | 谢谢 (Xièxie: Terima kasih) | 不客气 (Bù kèqi: Sama-sama) | 再见 (Zàijiàn: Sampai jumpa) | 叫 (Jiào: Dipanggil/bernama) | 什么 (Shénme: Apa) | 名字 (Míngzi: Nama) | 认识 (Rènshi: Mengenal/berkenalan) | 高兴 (Gāoxìng: Senang/gembira).',
        daftarPustaka: '1. Kemendikbudristek RI. (2022). Buku Panduan Guru Bahasa Mandarin SMP Kelas VII Kurikulum Merdeka. Jakarta: Pusat Perbukuan.\n2. Hanban / Confucius Institute Headquarters. (2018). Standard Course HSK 1. Beijing Language and Culture University Press.'
      }
    },
    kontenLengkap: `=== I. INFORMASI UMUM ===
Mata Pelajaran : Bahasa Mandarin
Kelas / Fase   : Kelas 7 (SMP) (Fase D (SMP Kelas 7-9))
Alokasi Waktu  : 2 JP x 40 Menit (80 Menit)
Model Belajar  : Problem Based Learning (PBL) & Communicative Language Teaching
Profil Pancasila: Berkebhinekaan Global, Bernalar Kritis, Mandiri
Kompetensi Awal: Peserta didik belum mengenal aksara Hanzi dan sistem ejaan Hanyu Pinyin serta 4 nada bahasa Mandarin.
Sarana/Prasarana: Flashcard Hanzi & Pinyin, Audio pelafalan nada, LCD proyektor / speaker bluetooth, Papan tulis latihan goresan (Tianzige).

=== II. KOMPONEN INTI ===
1. CAPAIAN PEMBELAJARAN (CP):
Elemen Menyimak-Berbicara: Peserta didik mampu menyimak dan membedakan pelafalan 4 nada Pinyin serta mempraktikkan sapaan dasar dan perkenalan diri secara lisan. Elemen Membaca-Menulis: Mengenali karakter Hanzi dasar sapaan (你, 好, 我, 叫) dan urutan goresan dasarnya.

2. TUJUAN PEMBELAJARAN (TP):
1. Peserta didik mampu melafalkan 4 nada dasar Hanyu Pinyin (ā, á, ǎ, à) dengan tepat melalui latihan drill audio.
2. Peserta didik mampu mengucapkan ungkapan sapaan (你好 Nǐ hǎo, 老师好 Lǎoshī hǎo, 再见 Zàijiàn) sesuai situasi formal dan santai.
3. Peserta didik mampu melakukan dialog perkenalan diri sederhana (nama dan asal negara) menggunakan pola kalimat 我叫... (Wǒ jiào...) dengan intonasi jelas dan santun.

3. PEMAHAMAN BERMAKNA:
Bahasa Mandarin adalah salah satu bahasa internasional dunia. Kemampuan menyapa dan memperkenalkan diri dalam bahasa Mandarin membuka jalan pertemanan global, menghargai keberagaman budaya, dan menumbuhkan rasa percaya diri lintas budaya.

4. PERTANYAAN PEMANTIK:
1. Mengapa kata yang sama dalam bahasa Mandarin jika dibaca dengan nada naik atau turun bisa memiliki arti yang berbeda?
2. Bagaimana cara memberi salam yang sopan kepada guru dan teman baru dalam kebudayaan Tionghoa?

5. KEGIATAN PEMBELAJARAN:
A. Pendahuluan:
- Guru membuka kelas dengan salam ramah: "同学们好！(Tóngxuémen hǎo!)" dan membimbing doa bersama.
- Apersepsi: Guru memutarkan klip lagu sapaan Mandarin singkat "你好歌 (Nǐ Hǎo Gē)" untuk mencairkan suasana.
- Guru menyampaikan tujuan pembelajaran hari ini, yaitu menguasai 4 nada Pinyin dan berani memperkenalkan diri dalam bahasa Mandarin.

B. Kegiatan Inti (Problem Based Learning (PBL)):
- Sintaks 1: Orientasi masalah perbedaan nada nada 1-4 yang merubah arti kata melalui video pendek.
- Sintaks 2: Membagi peserta didik secara berpasangan dan mendistribusikan flashcard Hanzi-Pinyin.
- Sintaks 3: Penyelidikan pelafalan nada dan latihan membaca kosakata sapaan dan perkenalan diri.
- Sintaks 4: Role play dialog percakapan perkenalan di depan kelas secara bergantian.
- Sintaks 5: Evaluasi bersama terhadap ketepatan intonasi dan kepercayaan diri siswa.

C. Penutup:
- Rangkuman bersama mereview 4 nada dan kosakata baru dengan tepuk nada.
- Refleksi pengalaman belajar siswa menggunakan kartu emotikon.
- Pemberian tugas latihan menulis goresan Hanzi dasar dan doa serta salam penutup "再见！".

6. ASESMEN PENILAIAN:
- Diagnostik: Kuis lisan awal menirukan bunyi nada vokal dasar.
- Formatif  : Observasi unjuk kerja role play perkenalan berpasangan dengan rubrik penilaian nada dan kelancaran.
- Sumatif   : Tes lisan individu (perkenalan diri 30 detik) dan tes tertulis mencocokkan Hanzi-Pinyin.

7. PENGAYAAN & REMEDIAL:
- Pengayaan : Menambahkan kosakata negara asal dan hobi sederhana serta membuat rekaman perkenalan kreatif.
- Remedial  : Bimbingan perorangan klinik pelafalan nada ke-3 dan kombinasi nada bersambung (Tone Sandhi).

=== III. LAMPIRAN ===
1. LKPD / LEMBAR KERJA:
Tabel latihan mencocokkan Hanzi-Pinyin-Arti, melengkapi dialog rumpang percakapan perkenalan, dan lembar kerja penulisan goresan karakter 你 dan 好 di kotak Tianzige.

2. BAHAN BACAAN GURU & SISWA:
Materi sistem Hanyu Pinyin, bagan 4 nada dasar beserta contoh kata, tabel aturan nada bersambung (变调 Biàndiào), dan transkrip dialog percakapan sehari-hari.

3. GLOSARIUM:
你好 (Nǐ hǎo: Halo) | 老师 (Lǎoshī: Guru) | 谢谢 (Xièxie: Terima kasih) | 不客气 (Bù kèqi: Sama-sama) | 再见 (Zàijiàn: Sampai jumpa) | 我叫 (Wǒ jiào: Nama saya) | 名字 (Míngzi: Nama) | 认识 (Rènshi: Mengenal).

4. DAFTAR PUSTAKA:
Buku Panduan Guru Bahasa Mandarin SMP Kelas VII Kurikulum Merdeka (Kemendikbudristek 2022); Standard Course HSK 1 (Beijing Language and Culture University Press).`
  },
  {
    id: 'mandarin-sma-10-keluarga',
    judul: 'Modul Ajar Mandarin: Keluarga & Profesi (我的家人与职业)',
    mataPelajaran: 'Bahasa Mandarin',
    kelas: 'Kelas 10 (SMA)',
    fase: 'Fase E (SMA Kelas 10)',
    topik: 'Anggota Keluarga, Kepemilikan (的), & Profesi (Jiārén yǔ Zhíyè)',
    alokasiWaktu: '3 JP x 45 Menit (135 Menit)',
    modelPembelajaran: 'Project Based Learning (PjBL) & Cooperative Learning',
    profilPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Kreatif'],
    deskripsiSingkat: 'Modul Bahasa Mandarin SMA Kelas 10 Fase E: Menggali silsilah keluarga, kata kepemilikan 的 (de), kata kerja 是 (shì) & 有 (yǒu), dan profesi orang tua.',
    isMandarinSpecial: true,
    dataParsed: {
      informasiUmum: {
        mataPelajaran: 'Bahasa Mandarin',
        kelasJenjang: 'Kelas 10 (SMA)',
        fase: 'Fase E (SMA Kelas 10)',
        alokasiWaktu: '3 JP x 45 Menit (135 Menit)',
        modelPembelajaran: 'Project Based Learning (PjBL)',
        profilPelajarPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Kreatif'],
        kompetensiAwal: 'Peserta didik telah menguasai Pinyin dasar, angka 1-100, dan sapaan dasar bahasa Mandarin.',
        saranaPrasarana: 'Foto keluarga (bawaan siswa), Canva/Kertas Manila untuk pohon silsilah keluarga (Jiāpǔ), Proyektor.'
      },
      komponenInti: {
        capaianPembelajaran: 'Elemen Menyimak-Berbicara: Peserta didik mampu mendeskripsikan anggota keluarga dan profesinya secara lisan menggunakan pola tata bahasa yang runtut. Elemen Membaca-Menulis: Mampu membaca teks narasi pendek keluarga ber-Hanzi dan menyusun paragraf deskripsi pohon keluarga.',
        tujuanPembelajaran: [
          'Peserta didik mampu mengidentifikasi sebutan 8 anggota keluarga dalam bahasa Mandarin (bàba, māma, gēge, jiějie, dìdi, mèimei, yéye, nǎinai).',
          'Peserta didik mampu menggunakan partikel kepemilikan 的 (de) dan kata kerja 有 (yǒu) / 没有 (méiyǒu) dalam kalimat.',
          'Peserta didik mampu mempresentasikan pohon silsilah keluarga (家谱 Jiāpǔ) lengkap dengan nama dan profesi dalam bahasa Mandarin secara kreatif.'
        ],
        pemahamanBermakna: 'Memahami nilai kekeluargaan dan bakti kepada orang tua (孝顺 Xiàoshùn) yang dijunjung tinggi dalam kebudayaan Tionghoa maupun kearifan lokal Indonesia, serta mampu mengomunikasikan identitas keluarga dalam percakapan global.',
        pertanyaanPemantik: [
          'Bagaimana sebutan untuk kakak laki-laki dan adik perempuan dalam bahasa Mandarin? Apakah berbeda dengan bahasa Indonesia?',
          'Bagaimana cara menceritakan profesi orang tua kita dalam bahasa Mandarin?'
        ],
        kegiatanPembelajaran: {
          pendahuluan: [
            'Guru menyapa: "各位同学，大家早上好！" dan mengecek kehadiran.',
            'Apersepsi: Menampilkan foto keluarga kartun populer dan menanyakan "这是谁？(Zhè shì shéi?)"',
            'Menjelaskan tujuan proyek membuat poster pohon silsilah keluarga (家谱).'
          ],
          inti: [
            'Sintaks 1 (Penentuan Pertanyaan Mendasar): Bagaimana cara mendeskripsikan struktur keluarga dan pekerjaan keluarga dalam bahasa Mandarin yang komunikatif?',
            'Sintaks 2 (Mendesain Perencanaan Proyek): Siswa merencanakan bagan silsilah keluarga dan membagi peran kosakata profesi: 医生 (dokter), 老师 (guru), 商人 (pedagang), 工程师 (insinyur), 警察 (polisi).',
            'Sintaks 3 (Menyusun Jadwal): 30 menit eksplorasi kosakata & pola kalimat, 45 menit pembuatan poster/Canva, 35 menit presentasi.',
            'Sintaks 4 (Memonitor Siswa & Kemajuan Proyek): Siswa menuliskan kalimat deskripsi di bawah setiap foto keluarga: 这是我爸爸。他是一名医生。(Zhè shì wǒ bàba. Tā shì yī míng yīshēng).',
            'Sintaks 5 (Menguji Hasil): Tiap kelompok melakukan mini pameran galeri (Gallery Walk) mempresentasikan keluarganya.',
            'Sintaks 6 (Evaluasi Pengalaman): Refleksi bersama mengenai kesulitan tata bahasa dan keindahan penulisan Hanzi.'
          ],
          penutup: [
            'Guru memberikan apresiasi atas kreativitas poster keluarga siswa.',
            'Refleksi nilai kasih sayang keluarga dalam bahasa Mandarin.',
            'Doa dan penutupan pembelajaran.'
          ]
        },
        asesmen: {
          diagnostik: 'Tanya jawab singkat tentang sebutan keluarga inti.',
          formatif: 'Penilaian proses pembuatan poster pohon keluarga dan ketepatan ejaan Hanzi/Pinyin.',
          sumatif: 'Rubrik presentasi lisan mendeskripsikan poster keluarga (artikulasi, kosakata, tata bahasa S+V+O).'
        },
        pengayaanDanRemedial: {
          pengayaan: 'Menambahkan deskripsi usia dan hobi masing-masing anggota keluarga menggunakan kata suka (喜欢 xǐhuan).',
          remedial: 'Latihan mandiri melengkapi bagan sebutan keluarga dengan bantuan flashcard visual.'
        }
      },
      lampiran: {
        lkpd: 'Template lembar kerja pohon keluarga (家谱), tabel pengelompokan sebutan keluarga pihak ayah dan ibu, serta lembar latihan menulis Hanzi 家 (jiā) dan 爸 (bà).',
        bahanBacaan: 'Penjelasan konsep keluarga dalam budaya Tionghoa, daftar kosakata 15 profesi populer beserta Pinyin dan aksara Hanzi, serta contoh teks monolog keluarga pendek.',
        glosarium: '家 (Jiā: Rumah/Keluarga) | 爸爸 (Bàba: Ayah) | 妈妈 (Māma: Ibu) | 哥哥 (Gēge: Kakak Laki-laki) | 姐姐 (Jiějie: Kakak Perempuan) | 弟弟 (Dìdi: Adik Laki-laki) | 妹妹 (Mèimei: Adik Perempuan) | 医生 (Yīshēng: Dokter) | 老师 (Lǎoshī: Guru) | 的 (De: Partikel Kepemilikan).',
        daftarPustaka: 'Buku Teks Bahasa Mandarin SMA Kelas X Kurikulum Merdeka (Kemendikbudristek 2023); Kamus Praktis Mandarin-Indonesia.'
      }
    },
    kontenLengkap: `=== I. INFORMASI UMUM ===
Mata Pelajaran : Bahasa Mandarin
Kelas / Fase   : Kelas 10 (SMA) (Fase E (SMA Kelas 10))
Alokasi Waktu  : 3 JP x 45 Menit (135 Menit)
Model Belajar  : Project Based Learning (PjBL)
Profil Pancasila: Bernalar Kritis, Gotong Royong, Kreatif
Kompetensi Awal: Peserta didik telah menguasai Pinyin dasar dan sapaan dasar bahasa Mandarin.
Sarana/Prasarana: Foto keluarga, Canva/Kertas Manila untuk pohon silsilah keluarga, Proyektor.

=== II. KOMPONEN INTI ===
1. CAPAIAN PEMBELAJARAN (CP):
Peserta didik mampu menyimak, membaca teks pendek, dan mempresentasikan deskripsi anggota keluarga dan profesi menggunakan pola partikel kepemilikan 的 (de) dan kata kerja 是 (shì) serta 有 (yǒu).

2. TUJUAN PEMBELAJARAN (TP):
1. Mengidentifikasi sebutan 8 anggota keluarga inti dan besar dalam bahasa Mandarin dengan benar.
2. Menggunakan partikel kepemilikan 的 (de) dalam menyusun kalimat deskripsi keluarga.
3. Mempresentasikan pohon silsilah keluarga (家谱 Jiāpǔ) secara lisan di depan kelas dengan percaya diri.

3. PEMAHAMAN BERMAKNA:
Menghargai nilai kekeluargaan dan bakti kepada orang tua (孝顺 Xiàoshùn) serta mampu memperkenalkan keluarga kepada masyarakat global dalam bahasa Mandarin.

4. PERTANYAAN PEMANTIK:
1. Mengapa sebutan anggota keluarga dalam bahasa Mandarin sangat spesifik membedakan usia dan pihak ayah/ibu?
2. Bagaimana cara menyatakan "Ini adalah ibuku, dia adalah seorang guru" dalam bahasa Mandarin?

5. KEGIATAN PEMBELAJARAN:
A. Pendahuluan: Salam pembuka "大家早上好", apersepsi foto keluarga kartun, dan penyampaian misi proyek poster silsilah keluarga.
B. Kegiatan Inti (PjBL): Penentuan pertanyaan mendasar, perancangan poster pohon keluarga, penyusunan kalimat deskripsi foto, pameran mini galeri walk, dan evaluasi hasil proyek.
C. Penutup: Refleksi nilai kasih sayang keluarga, penarikan kesimpulan materi, doa dan salam penutup.

6. ASESMEN PENILAIAN:
- Diagnostik: Tanya jawab awal sebutan keluarga.
- Formatif: Penilaian proses kerja kelompok poster pohon keluarga.
- Sumatif: Rubrik unjuk kerja presentasi lisan deskripsi keluarga.

7. PENGAYAAN & REMEDIAL:
- Pengayaan: Menambahkan hobi dan deskripsi karakter anggota keluarga.
- Remedial: Latihan menjodohkan foto dengan sebutan keluarga dasar.

=== III. LAMPIRAN ===
1. LKPD: Template pohon silsilah keluarga dan latihan menulis Hanzi 家, 爸, 妈.
2. BAHAN BACAAN: Ringkasan kosakata keluarga dan daftar 15 profesi dalam bahasa Mandarin.
3. GLOSARIUM: 家 (jiā), 爸爸 (bàba), 妈妈 (māma), 哥哥 (gēge), 姐姐 (jiějie), 弟弟 (dìdi), 妹妹 (mèimei), 的 (de), 医生 (yīshēng).
4. DAFTAR PUSTAKA: Buku Panduan Guru Bahasa Mandarin SMA Kelas X Kurikulum Merdeka (Kemendikbudristek).`
  },
  {
    id: 'informatika-smp-7-computational-thinking',
    judul: 'Modul Ajar Informatika: Berpikir Komputasional (Dekomposisi & Pola)',
    mataPelajaran: 'Informatika',
    kelas: 'Kelas 7 (SMP)',
    fase: 'Fase D (SMP Kelas 7-9)',
    topik: 'Landasan Berpikir Komputasional (Dekomposisi, Pola, Abstraksi, Algoritma)',
    alokasiWaktu: '2 JP x 40 Menit (80 Menit)',
    modelPembelajaran: 'Problem Based Learning (PBL) & Unplugged Activity',
    profilPancasila: ['Bernalar Kritis', 'Kreatif', 'Mandiri'],
    deskripsiSingkat: 'Modul Informatika Kurikulum Merdeka SMP Kelas 7 untuk mengasah 4 pilar berpikir komputasional melalui simulasi teka-teki logika kehidupan sehari-hari (tanpa komputer / unplugged).',
    isMandarinSpecial: false,
    dataParsed: {
      informasiUmum: {
        mataPelajaran: 'Informatika',
        kelasJenjang: 'Kelas 7 (SMP)',
        fase: 'Fase D (SMP Kelas 7-9)',
        alokasiWaktu: '2 JP x 40 Menit (80 Menit)',
        modelPembelajaran: 'Problem Based Learning (PBL) Unplugged',
        profilPelajarPancasila: ['Bernalar Kritis', 'Kreatif', 'Mandiri'],
        kompetensiAwal: 'Peserta didik terbiasa memecahkan masalah rutinitas sehari-hari tetapi belum mengenal terminologi 4 pilar computational thinking.',
        saranaPrasarana: 'Kartu tantangan teka-teki logika Bebras, Papan tulis, Kertas post-it warna-warni, Stopwatch.'
      },
      komponenInti: {
        capaianPembelajaran: 'Elemen Berpikir Komputasional (BK): Peserta didik mampu menerapkan berpikir komputasional untuk memecahkan masalah sehari-hari secara logis, terstruktur, dan efisien.',
        tujuanPembelajaran: [
          'Peserta didik mampu menjelaskan konsep 4 pilar berpikir komputasional (dekomposisi, pengenalan pola, abstraksi, algoritma) dengan bahasa sendiri.',
          'Peserta didik mampu menerapkan teknik dekomposisi untuk memecah masalah kompleks menjadi bagian-bagian kecil yang dapat dikelola.',
          'Peserta didik mampu merancang algoritma langkah demi langkah untuk menyelesaikan tantangan logis.'
        ],
        pemahamanBermakna: 'Berpikir komputasional bukan hanya tentang komputer atau coding, melainkan keterampilan berpikir kritis dan memecahkan masalah hidup secara sistematis.',
        pertanyaanPemantik: [
          'Bagaimana cara robot atau komputer memahami instruksi yang kita berikan?',
          'Jika kalian ingin mengatur pesta ulang tahun besar, dari mana langkah awal kalian agar tidak ada yang terlewat?'
        ],
        kegiatanPembelajaran: {
          pendahuluan: [
            'Guru membuka dengan salam, doa, dan apersepsi permainan tebak pola bilangan.',
            'Penyampaian tujuan pembelajaran berpikir komputasional.'
          ],
          inti: [
            'Sintaks 1: Orientasi masalah tantangan "Menemukan rute tercepat pengantaran paket".',
            'Sintaks 2: Pembagian kelompok 4 orang dan distribusi kartu kasus unplugged.',
            'Sintaks 3: Penyelidikan kelompok menerapkan 4 pilar BK.',
            'Sintaks 4: Presentasi alur algoritma di papan tulis.',
            'Sintaks 5: Evaluasi efisiensi langkah antar kelompok.'
          ],
          penutup: [
            'Kesimpulan bersama mengenai 4 pilar BK.',
            'Refleksi belajar dan penyampaian materi pekan depan.'
          ]
        },
        asesmen: {
          diagnostik: 'Kuis tebak pola logika cepat.',
          formatif: 'Observasi diskusi kelompok dan lembar kerja pilar BK.',
          sumatif: 'Soal pemecahan masalah model tantangan Bebras.'
        },
        pengayaanDanRemedial: {
          pengayaan: 'Mencoba tantangan logika Bebras level kompetisi nasional.',
          remedial: 'Pendampingan khusus latihan menyusun urutan langkah resep makanan sehari-hari.'
        }
      },
      lampiran: {
        lkpd: 'Lembar analisis studi kasus rute kurir dan lembar identifikasi 4 pilar BK.',
        bahanBacaan: 'Penjelasan 4 pilar Berpikir Komputasional dan contoh penerapannya.',
        glosarium: 'Dekomposisi | Pengenalan Pola | Abstraksi | Algoritma | Computational Thinking.',
        daftarPustaka: 'Buku Siswa Informatika SMP Kelas VII Kemendikbudristek RI.'
      }
    },
    kontenLengkap: `=== I. INFORMASI UMUM ===
Mata Pelajaran : Informatika
Kelas / Fase   : Kelas 7 (SMP) (Fase D (SMP Kelas 7-9))
Alokasi Waktu  : 2 JP x 40 Menit (80 Menit)
Model Belajar  : Problem Based Learning (PBL) Unplugged
Profil Pancasila: Bernalar Kritis, Kreatif, Mandiri
Kompetensi Awal: Mengamati rutinitas pemecahan masalah sehari-hari.
Sarana/Prasarana: Kartu tantangan Bebras, kertas plano, post-it note.

=== II. KOMPONEN INTI ===
1. CAPAIAN PEMBELAJARAN (CP):
Menerapkan computational thinking untuk menyelesaikan masalah kontekstual yang melibatkan dekomposisi dan algoritma terstruktur.

2. TUJUAN PEMBELAJARAN (TP):
1. Menjelaskan 4 pilar berpikir komputasional secara akurat.
2. Memecah masalah kompleks menjadi sub-masalah melalui dekomposisi.
3. Menyusun langkah terurut (algoritma) yang efisien.

3. PEMAHAMAN BERMAKNA:
Keterampilan computational thinking melatih nalar kritis dalam menyelesaikan berbagai persoalan di abad ke-21.

4. PERTANYAAN PEMANTIK:
Bagaimana komputer memproses data begitu cepat dan tidak pernah salah menghitung?

5. KEGIATAN PEMBELAJARAN:
Pendahuluan (10 menit), Inti (60 menit: investigasi tantangan rute logis), Penutup (10 menit: refleksi).

6. ASESMEN PENILAIAN:
Formatif unjuk kerja kelompok dan sumatif soal logika Bebras.

=== III. LAMPIRAN ===
LKPD simulasi rute efisien, bacaan materi 4 pilar BK, glosarium, dan pustaka Kemendikbudristek.`
  },
  {
    id: 'bahasa-indonesia-sma-10-lho',
    judul: 'Modul Ajar Bhs. Indonesia: Menulis Teks Laporan Hasil Observasi (LHO)',
    mataPelajaran: 'Bahasa Indonesia',
    kelas: 'Kelas 10 (SMA)',
    fase: 'Fase E (SMA Kelas 10)',
    topik: 'Menyingkap Fakta Objektif Lewat Teks Laporan Hasil Observasi',
    alokasiWaktu: '4 JP x 45 Menit (180 Menit)',
    modelPembelajaran: 'Discovery Learning & Project Based Learning',
    profilPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
    deskripsiSingkat: 'Modul Bahasa Indonesia SMA Kelas 10 Fase E: Struktur teks LHO (pernyataan umum, deskripsi bagian, deskripsi manfaat) dan kaidah kebahasaan kalimat definisi/deskripsi.',
    isMandarinSpecial: false,
    dataParsed: {
      informasiUmum: {
        mataPelajaran: 'Bahasa Indonesia',
        kelasJenjang: 'Kelas 10 (SMA)',
        fase: 'Fase E (SMA Kelas 10)',
        alokasiWaktu: '4 JP x 45 Menit (180 Menit)',
        modelPembelajaran: 'Discovery Learning & Problem Based Learning',
        profilPelajarPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
        kompetensiAwal: 'Peserta didik memahami perbedaan teks deskripsi subjektif dengan laporan fakta objektif.',
        saranaPrasarana: 'Objek observasi di lingkungan sekolah (taman, perpustakaan, kantin), Papan tulis, Buku teks.'
      },
      komponenInti: {
        capaianPembelajaran: 'Mengevaluasi informasi berupa gagasan, pikiran, pandangan, arahan atau pesan dari teks laporan hasil observasi dan menyusun teks LHO secara logis dan runtut.',
        tujuanPembelajaran: [
          'Peserta didik mampu menganalisis struktur teks LHO (pernyataan umum, deskripsi bagian, deskripsi manfaat) dengan cermat.',
          'Peserta didik mampu membedakan kalimat fakta objektif dan kalimat opini dalam laporan.',
          'Peserta didik mampu menyusun draf teks LHO berdasarkan pengamatan lingkungan sekolah.'
        ],
        pemahamanBermakna: 'Menyampaikan informasi berdasarkan fakta akurat mencegah penyebaran hoaks dan melatih integritas intelektual peserta didik.',
        pertanyaanPemantik: [
          'Bagaimana kita tahu sebuah artikel berita didasarkan pada fakta pengamatan nyata atau hanya karangan fiktif?',
          'Apa yang membedakan teks deskripsi keindahan pantai dengan teks laporan observasi ekosistem pantai?'
        ],
        kegiatanPembelajaran: {
          pendahuluan: ['Salam, doa, apersepsi membedakan teks fiksi dan nonfiksi, penjelasan tujuan.'],
          inti: ['Orientasi teks LHO model, observasi lapangan lingkungan sekolah, penulisan draf laporan, evaluasi kaidah kebahasaan.'],
          penutup: ['Refleksi, rangkuman struktur teks LHO, penugasan akhir dan doa.']
        },
        asesmen: {
          diagnostik: 'Kuis membedakan fakta vs opini.',
          formatif: 'Rubrik penulisan draf teks LHO berstruktur lengkap.',
          sumatif: 'Penilaian naskah final laporan observasi.'
        },
        pengayaanDanRemedial: {
          pengayaan: 'Menyusun laporan observasi ilmiah populer untuk mading/web sekolah.',
          remedial: 'Latihan menyortir kalimat fakta dari potongan artikel surat kabar.'
        }
      },
      lampiran: {
        lkpd: 'Lembar observasi lapangan dan format penulisan teks LHO.',
        bahanBacaan: 'Panduan struktur dan kaidah kebahasaan teks LHO.',
        glosarium: 'Observasi | Pernyataan Umum | Deskripsi Bagian | Objektif | Valid.',
        daftarPustaka: 'Cerdas Cergas Berbahasa Indonesia SMA Kelas X Kemendikbudristek.'
      }
    },
    kontenLengkap: `=== I. INFORMASI UMUM ===
Mata Pelajaran : Bahasa Indonesia
Kelas / Fase   : Kelas 10 (SMA) (Fase E (SMA Kelas 10))
Alokasi Waktu  : 4 JP x 45 Menit (180 Menit)
Model Belajar  : Discovery Learning
Profil Pancasila: Bernalar Kritis, Gotong Royong, Mandiri
Kompetensi Awal: Mengidentifikasi kalimat fakta dan opini.
Sarana/Prasarana: Lingkungan sekolah sebagai objek amatan, lembar observasi.

=== II. KOMPONEN INTI ===
1. CAPAIAN PEMBELAJARAN (CP):
Mengevaluasi dan menyusun teks laporan hasil observasi berdasarkan kaidah ilmiah objektif.

2. TUJUAN PEMBELAJARAN (TP):
1. Mengidentifikasi struktur teks LHO (pernyataan umum, deskripsi bagian, deskripsi manfaat).
2. Menemukan kalimat definisi dan kalimat deskripsi.
3. Menyusun teks LHO bertema lingkungan sekolah secara utuh.

3. PEMAHAMAN BERMAKNA:
Keterampilan menulis laporan berbasis fakta menanamkan kejujuran berpikir dan anti-hoaks.

=== III. LAMPIRAN ===
LKPD observasi lingkungan, pedoman penilaian teks LHO, glosarium, dan daftar pustaka resmi Kemendikbudristek.`
  },
  {
    id: 'matematika-smp-8-spldv',
    judul: 'Modul Ajar Matematika: Sistem Persamaan Linear Dua Variabel (SPLDV)',
    mataPelajaran: 'Matematika',
    kelas: 'Kelas 8 (SMP)',
    fase: 'Fase D (SMP Kelas 7-9)',
    topik: 'Penyelesaian Masalah SPLDV Kontekstual Metode Eliminasi & Substitusi',
    alokasiWaktu: '3 JP x 40 Menit (120 Menit)',
    modelPembelajaran: 'Problem Based Learning (PBL)',
    profilPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
    deskripsiSingkat: 'Modul Matematika SMP Kelas 8 Fase D: Memodelkan transaksi belanja di kantin/pasar ke bentuk SPLDV dan memecahkannya dengan metode gabungan eliminasi-substitusi.',
    isMandarinSpecial: false,
    dataParsed: {
      informasiUmum: {
        mataPelajaran: 'Matematika',
        kelasJenjang: 'Kelas 8 (SMP)',
        fase: 'Fase D (SMP Kelas 7-9)',
        alokasiWaktu: '3 JP x 40 Menit (120 Menit)',
        modelPembelajaran: 'Problem Based Learning (PBL)',
        profilPelajarPancasila: ['Bernalar Kritis', 'Gotong Royong', 'Mandiri'],
        kompetensiAwal: 'Peserta didik telah memahami konsep Persamaan Linear Satu Variabel (PLSV) dan koordinat Cartesius.',
        saranaPrasarana: 'Struk belanjaan kantin, Papan tulis, Lembar kerja kelompok, Alat tulis.'
      },
      komponenInti: {
        capaianPembelajaran: 'Elemen Aljabar: Peserta didik mampu merumuskan dan menyelesaikan sistem persamaan linear dua variabel menggunakan berbagai metode (grafik, substitusi, eliminasi).',
        tujuanPembelajaran: [
          'Peserta didik mampu membuat model matematika berupa SPLDV dari masalah kontekstual transaksi nyata.',
          'Peserta didik mampu menentukan himpunan penyelesaian SPLDV dengan metode eliminasi dan substitusi.',
          'Peserta didik mampu menafsirkan arti nilai x dan y dalam konteks permasalahan asal.'
        ],
        pemahamanBermakna: 'Aljabar bukan sekadar rumus x dan y, tetapi alat bantu penting untuk menghitung harga barang, keuntungan usaha, dan manajemen keuangan.',
        pertanyaanPemantik: [
          'Jika kalian membeli 2 buku dan 3 pensil seharga Rp 15.000, lalu teman kalian membeli 3 buku dan 1 pensil seharga Rp 12.000, bagaimana cara mengetahui harga 1 buku secara pasti?'
        ],
        kegiatanPembelajaran: {
          pendahuluan: ['Salam, doa, apersepsi studi kasus harga paket makanan hemat di resto cepat saji.'],
          inti: ['Orientasi masalah paket kantin, diskusi penyusunan model 2x + 3y = 15000, eksplorasi eliminasi variabel, presentasi solusi.'],
          penutup: ['Rangkuman langkah metode eliminasi-substitusi, kuis kilat, doa penutup.']
        },
        asesmen: {
          diagnostik: 'Menyelesaikan persamaan sederhana 2x = 10.',
          formatif: 'Observasi pemecahan masalah di lembar kerja kelompok.',
          sumatif: 'Tes tertulis 2 soal cerita pemodelan SPLDV.'
        },
        pengayaanDanRemedial: {
          pengayaan: 'Menyelesaikan masalah SPLDV dengan metode matriks sederhana atau Geogebra.',
          remedial: 'Latihan terbimbing mengganti variabel yang sudah diketahui nilainya.'
        }
      },
      lampiran: {
        lkpd: 'Lembar teka-teki kantin sekolah dan panduan step-by-step eliminasi.',
        bahanBacaan: 'Ringkasan metode substitusi, eliminasi, dan campuran pada SPLDV.',
        glosarium: 'SPLDV | Variabel | Koefisien | Konstanta | Eliminasi | Substitusi.',
        daftarPustaka: 'Buku Matematika SMP/MTs Kelas VIII Kurikulum Merdeka Kemendikbudristek.'
      }
    },
    kontenLengkap: `=== I. INFORMASI UMUM ===
Mata Pelajaran : Matematika
Kelas / Fase   : Kelas 8 (SMP) (Fase D (SMP Kelas 7-9))
Alokasi Waktu  : 3 JP x 40 Menit (120 Menit)
Model Belajar  : Problem Based Learning (PBL)
Profil Pancasila: Bernalar Kritis, Gotong Royong, Mandiri
Kompetensi Awal: Menguasai operasi hitung aljabar dan PLSV.
Sarana/Prasarana: Struk belanja kantin, proyektor, LKPD.

=== II. KOMPONEN INTI ===
1. CAPAIAN PEMBELAJARAN (CP):
Menyelesaikan sistem persamaan linear dua variabel (SPLDV) menggunakan berbagai strategi penyelesaian masalah kontekstual.

2. TUJUAN PEMBELAJARAN (TP):
1. Membuat model matematika dua variabel dari masalah kontekstual.
2. Menentukan nilai variabel x dan y menggunakan metode eliminasi dan substitusi.
3. Mengaplikasikan solusi dalam menentukan harga satuan barang.

3. PEMAHAMAN BERMAKNA:
Aljabar mempermudah perhitungan transaksi nyata dalam bisnis dan kehidupan sehari-hari.

=== III. LAMPIRAN ===
LKPD tantangan paket kantin, rangkuman metode SPLDV, glosarium, dan daftar pustaka.`
  }
];
