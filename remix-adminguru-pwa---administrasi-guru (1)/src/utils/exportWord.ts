import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  PageBreak,
} from 'docx';
import * as fileSaverModule from 'file-saver';
import { db, type ModulAjarItem, type SoalItem, type ProtaProsemItem, type TeacherProfile } from '../db';

const saveAs = (fileSaverModule as any).saveAs || (fileSaverModule as any).default || fileSaverModule;

// Standard table border style
const standardBorder = {
  style: BorderStyle.SINGLE,
  size: 6,
  color: '999999',
};

const cellBorders = {
  top: standardBorder,
  bottom: standardBorder,
  left: standardBorder,
  right: standardBorder,
};

function getIndonesianDateString(cityName: string = 'Bandung') {
  const d = new Date();
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${cityName}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Ekspor Modul Ajar ke file Word (.docx)
 * Bisa dipanggil tanpa argumen untuk mengekspor semua modul di IndexedDB,
 * atau dengan 1 modul spesifik untuk dokumen lengkap.
 */
export async function exportModulAjarToWord(
  targetModul?: ModulAjarItem | ModulAjarItem[],
  profile?: TeacherProfile
) {
  let listModul: ModulAjarItem[] = [];

  if (!targetModul) {
    listModul = await db.modul_ajar.toArray();
  } else if (Array.isArray(targetModul)) {
    listModul = targetModul;
  } else {
    listModul = [targetModul];
  }

  if (!listModul || listModul.length === 0) {
    alert('Belum ada data Modul Ajar di database lokal untuk diekspor!');
    return;
  }

  // Jika satu modul diekspor, buat dokumen terstruktur lengkap Kurikulum Merdeka
  if (listModul.length === 1) {
    const modul = listModul[0];
    const kota = profile?.kotaKabupaten || 'Bandung';
    const paragraphs: (Paragraph | Table)[] = [];

    // Header Judul
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: 'MODUL AJAR KURIKULUM MERDEKA',
            bold: true,
            size: 28,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: (modul.topik || modul.judulModul || 'MODUL AJAR').toUpperCase(),
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `${(modul.satuanPendidikan || profile?.satuanPendidikan || 'SMP NEGERI 1 MERDEKA BELAJAR').toUpperCase()} - TAHUN AJARAN ${modul.tahunAjaran || profile?.tahunAjaranAktif || '2024/2025'}`,
            bold: true,
            size: 20,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    // I. INFORMASI UMUM
    paragraphs.push(
      createSectionHeader('I. INFORMASI UMUM'),
      createInfoTable([
        ['Nama Penyusun', modul.namaGuru || profile?.namaGuru || 'Guru Pengampu'],
        ['NIP', modul.nipGuru || profile?.nipGuru || '-'],
        ['Satuan Pendidikan', modul.satuanPendidikan || profile?.satuanPendidikan || '-'],
        ['Mata Pelajaran', modul.mataPelajaran || '-'],
        ['Fase / Kelas', modul.kelas || '-'],
        ['Alokasi Waktu', modul.alokasiWaktu || '2 JP'],
        [
          'Profil Pelajar Pancasila',
          modul.profilPelajarPancasila && modul.profilPelajarPancasila.length > 0
            ? modul.profilPelajarPancasila.join(', ')
            : 'Bernalar Kritis, Gotong Royong, Mandiri',
        ],
        ['Model Pembelajaran', modul.modelPembelajaran || 'Problem-Based Learning (PBL)'],
        ['Target Peserta Didik', modul.targetPesertaDidik || 'Peserta didik reguler / tipikal'],
      ]),
      new Paragraph({ spacing: { before: 180 } })
    );

    // II. KOMPONEN INTI
    paragraphs.push(createSectionHeader('II. KOMPONEN INTI'));

    if (modul.tujuanPembelajaran) {
      paragraphs.push(
        createSubHeader('A. Tujuan Pembelajaran (TP)'),
        ...splitToParagraphs(modul.tujuanPembelajaran)
      );
    }

    if (modul.pemahamanBermakna) {
      paragraphs.push(
        createSubHeader('B. Pemahaman Bermakna'),
        ...splitToParagraphs(modul.pemahamanBermakna)
      );
    }

    if (modul.pertanyaanPemantik) {
      paragraphs.push(
        createSubHeader('C. Pertanyaan Pemantik'),
        ...splitToParagraphs(modul.pertanyaanPemantik)
      );
    }

    paragraphs.push(
      createSubHeader('D. Langkah-Langkah Pembelajaran'),
      ...splitToParagraphs(modul.langkahPembelajaran || 'Belum diisi.')
    );

    if (modul.asesmen) {
      paragraphs.push(createSubHeader('E. Asesmen / Penilaian'));
      if (typeof modul.asesmen === 'string') {
        paragraphs.push(...splitToParagraphs(modul.asesmen));
      } else {
        paragraphs.push(
          createInfoTable([
            ['Asesmen Diagnostik', modul.asesmen.diagnostik || '-'],
            ['Asesmen Formatif', modul.asesmen.formatif || '-'],
            ['Asesmen Sumatif', modul.asesmen.sumatif || '-'],
          ])
        );
      }
    }

    // Tanda Tangan
    paragraphs.push(
      new Paragraph({ spacing: { before: 240 } }),
      createSignatureTable(
        kota,
        modul.namaKepalaSekolah || profile?.namaKepalaSekolah,
        modul.nipKepalaSekolah || profile?.nipKepalaSekolah,
        modul.namaGuru || profile?.namaGuru,
        modul.nipGuru || profile?.nipGuru
      )
    );

    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    const cleanName = (modul.topik || 'Modul_Ajar').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    saveAs(blob, `Modul_Ajar_${cleanName}_${new Date().toISOString().slice(0, 10)}.docx`);
    return;
  }

  // Jika ekspor koleksi seluruh modul ajar
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: 'DOKUMEN KUMPULAN MODUL AJAR / LESSON PLAN',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  ];

  listModul.forEach((modul, index) => {
    children.push(
      new Paragraph({
        text: `${index + 1}. Topik: ${modul.topik || modul.judulModul || 'Tanpa Judul'}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran', bold: true })] })],
                width: { size: 35, type: WidthType.PERCENTAGE },
                borders: cellBorders,
              }),
              new TableCell({
                children: [new Paragraph(modul.mataPelajaran || '-')],
                width: { size: 65, type: WidthType.PERCENTAGE },
                borders: cellBorders,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Kelas / Fase', bold: true })] })],
                borders: cellBorders,
              }),
              new TableCell({
                children: [new Paragraph(modul.kelas || '-')],
                borders: cellBorders,
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Alokasi Waktu', bold: true })] })],
                borders: cellBorders,
              }),
              new TableCell({
                children: [new Paragraph(modul.alokasiWaktu || '-')],
                borders: cellBorders,
              }),
            ],
          }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Langkah-Langkah Pembelajaran:', bold: true })],
        spacing: { before: 150, after: 50 },
      }),
      new Paragraph({
        text: modul.langkahPembelajaran || 'Belum diisi.',
        spacing: { after: 300 },
      })
    );
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Kumpulan_Modul_Ajar_${new Date().toISOString().slice(0, 10)}.docx`);
}

/**
 * Ekspor Bank Soal dari IndexedDB ke file .docx
 * Bisa dipanggil tanpa argumen untuk ekspor seluruh soal,
 * atau dengan array soal tertentu + opsi kop surat dan kunci jawaban.
 */
export async function exportBankSoalToWord(
  targetSoal?: SoalItem[],
  options?: {
    judulNaskah?: string;
    sekolah?: string;
    mataPelajaran?: string;
    faseKelas?: string;
    tahunAjaran?: string;
    semester?: string;
    includeKunciJawaban?: boolean;
    guru?: string;
    nipGuru?: string;
    kepalaSekolah?: string;
    nipKepalaSekolah?: string;
    kotaKabupaten?: string;
  }
) {
  let listSoal: SoalItem[] = [];

  if (!targetSoal || targetSoal.length === 0) {
    listSoal = await db.bank_soal.toArray();
  } else {
    listSoal = targetSoal;
  }

  if (!listSoal || listSoal.length === 0) {
    alert('Belum ada data Bank Soal di database lokal untuk diekspor!');
    return;
  }

  const opts = {
    judulNaskah: options?.judulNaskah || 'NASKAH BANK SOAL & PENILAIAN',
    sekolah: options?.sekolah || 'SMP NEGERI 1 MERDEKA BELAJAR',
    mataPelajaran: options?.mataPelajaran || listSoal[0]?.mataPelajaran || 'Semua Mata Pelajaran',
    faseKelas: options?.faseKelas || listSoal[0]?.kelas || listSoal[0]?.faseKelas || 'Semua Kelas',
    tahunAjaran: options?.tahunAjaran || '2024/2025',
    semester: options?.semester || 'Ganjil',
    includeKunciJawaban: options?.includeKunciJawaban ?? true,
    guru: options?.guru || 'Guru Pengampu Mata Pelajaran',
    nipGuru: options?.nipGuru || '---------------------------',
    kepalaSekolah: options?.kepalaSekolah || 'Kepala Sekolah',
    nipKepalaSekolah: options?.nipKepalaSekolah || '---------------------------',
    kotaKabupaten: options?.kotaKabupaten || 'Bandung',
  };

  const paragraphs: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: opts.sekolah.toUpperCase(),
          bold: true,
          size: 26,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: opts.judulNaskah.toUpperCase(),
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `TAHUN AJARAN ${opts.tahunAjaran}`,
          bold: true,
          size: 20,
          font: 'Times New Roman',
        }),
      ],
    }),
    // Tabel Identitas Soal
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran', bold: true })] })],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [new Paragraph(`: ${opts.mataPelajaran}`)],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Waktu / Durasi', bold: true })] })],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [new Paragraph(': 90 Menit')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Kelas / Fase', bold: true })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph(`: ${opts.faseKelas}`)],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Semester', bold: true })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph(`: ${opts.semester}`)],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({
          text: 'Petunjuk Umum:',
          bold: true,
          font: 'Times New Roman',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: '1. Berdoalah sebelum mengerjakan naskah soal.\n2. Tuliskan nama dan nomor peserta pada lembar jawaban.\n3. Periksa dan bacalah setiap butir soal dengan saksama sebelum menjawab.',
          font: 'Times New Roman',
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: '-----------------------------------------------------------------------------------------------------------',
          font: 'Courier New',
          size: 16,
        }),
      ],
    }),
  ];

  // Susun Daftar Butir Soal
  listSoal.forEach((soal, index) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({
            text: `${index + 1}. `,
            bold: true,
            font: 'Times New Roman',
            size: 22,
          }),
          new TextRun({
            text: soal.pertanyaan || '',
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      })
    );

    // Opsi Pilihan Ganda (A, B, C, D)
    const optionsArray = (soal.opsi && soal.opsi.length > 0) ? soal.opsi : (soal.pilihanJawaban || []);
    if (optionsArray && optionsArray.length > 0) {
      optionsArray.forEach((opt, idx) => {
        const optionText = opt.match(/^[A-E]\./i) ? opt : `${String.fromCharCode(65 + idx)}. ${opt}`;
        paragraphs.push(
          new Paragraph({
            indent: { left: convertInchesToTwip(0.4) },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: optionText,
                font: 'Times New Roman',
                size: 22,
              }),
            ],
          })
        );
      });
    } else {
      // Space jawaban uraian/essay
      paragraphs.push(
        new Paragraph({
          indent: { left: convertInchesToTwip(0.4) },
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: 'Jawaban: .....................................................................................................................................................',
              font: 'Times New Roman',
              size: 20,
              color: '888888',
            }),
          ],
        })
      );
    }
  });

  // Kunci Jawaban di Halaman Baru (opsional)
  if (opts.includeKunciJawaban) {
    paragraphs.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: 'KUNCI JAWABAN & PEDOMAN PENILAIAN',
            bold: true,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      })
    );

    const kunciRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
            children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })] })],
            width: { size: 8, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
            children: [new Paragraph({ children: [new TextRun({ text: 'Bentuk Soal', bold: true })] })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
            children: [new Paragraph({ children: [new TextRun({ text: 'Kunci Jawaban', bold: true })] })],
            width: { size: 32, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            borders: cellBorders,
            shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
            children: [new Paragraph({ children: [new TextRun({ text: 'Pembahasan / Rubrik', bold: true })] })],
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    listSoal.forEach((soal, idx) => {
      kunciRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}` })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: soal.bentukSoal || 'Pilihan Ganda' })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: soal.kunciJawaban || '-', bold: true, color: '2E7D32' })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: soal.pembahasan || '-' })] })],
            }),
          ],
        })
      );
    });

    paragraphs.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: kunciRows,
      })
    );
  }

  // Tanda Tangan
  paragraphs.push(
    new Paragraph({ spacing: { before: 240 } }),
    createSignatureTable(opts.kotaKabupaten, opts.kepalaSekolah, opts.nipKepalaSekolah, opts.guru, opts.nipGuru)
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Bank_Soal_${new Date().toISOString().slice(0, 10)}.docx`);
}

/**
 * Ekspor Program Tahunan (PROTA) ke Word (.docx)
 */
export async function exportProtaToWord(prota: ProtaProsemItem, profile?: TeacherProfile) {
  const kota = profile?.kotaKabupaten || 'Bandung';
  const paragraphs: (Paragraph | Table)[] = [];

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'PROGRAM TAHUNAN (PROTA)',
          bold: true,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `SATUAN PENDIDIKAN: ${(prota.satuanPendidikan || profile?.satuanPendidikan || 'SEKOLAH').toUpperCase()}`,
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `TAHUN AJARAN ${prota.tahunAjaran || '2024/2025'}`,
          bold: true,
          size: 22,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  paragraphs.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran', bold: true })] })],
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [new Paragraph(`: ${prota.mataPelajaran}`)],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ children: [new TextRun({ text: 'Kelas / Fase', bold: true })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph(`: ${prota.kelas || prota.faseKelas}`)],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 180 } })
  );

  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true })] })],
          width: { size: 6, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Elemen / CP', bold: true })] })],
          width: { size: 22, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tujuan Pembelajaran', bold: true })] })],
          width: { size: 38, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Materi Pokok', bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'JP', bold: true })] })],
          width: { size: 8, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Smt', bold: true })] })],
          width: { size: 6, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  let totalJP = 0;
  if (prota.daftarRincian && prota.daftarRincian.length > 0) {
    prota.daftarRincian.forEach((item, index) => {
      totalJP += Number(item.alokasiWaktu) || 0;
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}` })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph(item.elemen || '-')],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph(item.tujuanPembelajaran || '-')],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph(item.materiPokok || '-')],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${item.alokasiWaktu} JP` })] })],
            }),
            new TableCell({
              borders: cellBorders,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.semester || '-' })] })],
            }),
          ],
        })
      );
    });
  } else {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ borders: cellBorders, children: [new Paragraph('1')] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph('Umum')] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph(prota.materiPokok || '-')] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph(prota.materiPokok || '-')] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph(`${prota.alokasiWaktu || 0} JP`)] }),
          new TableCell({ borders: cellBorders, children: [new Paragraph(prota.semester || '1 Tahun')] }),
        ],
      })
    );
  }

  paragraphs.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    new Paragraph({ spacing: { before: 240 } }),
    createSignatureTable(
      kota,
      prota.namaKepalaSekolah || profile?.namaKepalaSekolah,
      prota.nipKepalaSekolah || profile?.nipKepalaSekolah,
      prota.namaGuru || profile?.namaGuru,
      prota.nipGuru || profile?.nipGuru
    )
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `PROTA_${prota.mataPelajaran.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.docx`);
}

/**
 * Ekspor Program Semester (PROSEM) ke Word (.docx)
 */
export async function exportProsemToWord(prosem: ProtaProsemItem, profile?: TeacherProfile) {
  const kota = profile?.kotaKabupaten || 'Bandung';
  const paragraphs: (Paragraph | Table)[] = [];

  const bulanList = prosem.semester === 'Genap'
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni']
    : ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: `PROGRAM SEMESTER (${(prosem.semester || 'GANJIL').toUpperCase()})`,
          bold: true,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `SATUAN PENDIDIKAN: ${(prosem.satuanPendidikan || profile?.satuanPendidikan || 'SEKOLAH').toUpperCase()}`,
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `TAHUN AJARAN ${prosem.tahunAjaran || '2024/2025'}`,
          bold: true,
          size: 22,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  const headerCells1: TableCell[] = [
    new TableCell({
      borders: cellBorders,
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      rowSpan: 2,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true })] })],
      width: { size: 5, type: WidthType.PERCENTAGE },
    }),
    new TableCell({
      borders: cellBorders,
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      rowSpan: 2,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Materi Pokok / ATP', bold: true })] })],
      width: { size: 35, type: WidthType.PERCENTAGE },
    }),
    new TableCell({
      borders: cellBorders,
      shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
      rowSpan: 2,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'JP', bold: true })] })],
      width: { size: 8, type: WidthType.PERCENTAGE },
    }),
  ];

  bulanList.forEach((bln) => {
    headerCells1.push(
      new TableCell({
        borders: cellBorders,
        shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
        columnSpan: 4,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: bln.substring(0, 3), bold: true })] })],
        width: { size: 8.5, type: WidthType.PERCENTAGE },
      })
    );
  });

  const headerCells2: TableCell[] = [];
  bulanList.forEach(() => {
    for (let w = 1; w <= 4; w++) {
      headerCells2.push(
        new TableCell({
          borders: cellBorders,
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${w}`, size: 16 })] })],
        })
      );
    }
  });

  const tableRows: TableRow[] = [
    new TableRow({ children: headerCells1 }),
    new TableRow({ children: headerCells2 }),
  ];

  if (prosem.daftarRincian && prosem.daftarRincian.length > 0) {
    prosem.daftarRincian.forEach((item, index) => {
      const rowCells: TableCell[] = [
        new TableCell({
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}` })] })],
        }),
        new TableCell({
          borders: cellBorders,
          children: [new Paragraph(item.materiPokok || item.tujuanPembelajaran || '-')],
        }),
        new TableCell({
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${item.alokasiWaktu}` })] })],
        }),
      ];

      bulanList.forEach((bln) => {
        const mingguan = item.alokasiBulan?.[bln] || [0, 0, 0, 0];
        for (let w = 0; w < 4; w++) {
          const val = mingguan[w] || 0;
          rowCells.push(
            new TableCell({
              borders: cellBorders,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: val > 0 ? `${val}` : '', bold: val > 0, size: 18 })],
                }),
              ],
            })
          );
        }
      });

      tableRows.push(new TableRow({ children: rowCells }));
    });
  }

  paragraphs.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    new Paragraph({ spacing: { before: 240 } }),
    createSignatureTable(
      kota,
      prosem.namaKepalaSekolah || profile?.namaKepalaSekolah,
      prosem.nipKepalaSekolah || profile?.nipKepalaSekolah,
      prosem.namaGuru || profile?.namaGuru,
      prosem.nipGuru || profile?.nipGuru
    )
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `PROSEM_${prosem.semester}_${prosem.mataPelajaran.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.docx`);
}

// --- Helper Functions ---

function createSectionHeader(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,
        font: 'Times New Roman',
      }),
    ],
  });
}

function createSubHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        font: 'Times New Roman',
      }),
    ],
  });
}

function splitToParagraphs(text?: string): Paragraph[] {
  if (!text) {
    return [
      new Paragraph({
        children: [new TextRun({ text: '-', italics: true, color: '666666' })],
        spacing: { after: 60 },
      }),
    ];
  }
  return text.split('\n').map(
    (line) =>
      new Paragraph({
        spacing: { after: 50 },
        indent: { left: convertInchesToTwip(0.2) },
        children: [
          new TextRun({
            text: line,
            size: 22,
            font: 'Times New Roman',
          }),
        ],
      })
  );
}

function createInfoTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, val]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true, size: 21, font: 'Times New Roman' })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: cellBorders,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `: ${val}`, size: 21, font: 'Times New Roman' })],
                }),
              ],
            }),
          ],
        })
    ),
  });
}

function createSignatureTable(
  kota?: string,
  kepalaSekolah?: string,
  nipKepalaSekolah?: string,
  guru?: string,
  nipGuru?: string
): Table {
  const dateStr = getIndonesianDateString(kota || 'Bandung');
  const ksName = kepalaSekolah || 'Drs. H. Ahmad Fauzi, M.Pd.';
  const ksNip = nipKepalaSekolah ? `NIP. ${nipKepalaSekolah}` : 'NIP. ........................................';
  const gName = guru || 'Siti Rahmawati, S.Pd.';
  const gNip = nipGuru ? `NIP. ${nipGuru}` : 'NIP. ........................................';

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Mengetahui,', size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
                children: [new TextRun({ text: 'Kepala Sekolah', bold: true, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: ksName, bold: true, underline: {}, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: ksNip, size: 20, font: 'Times New Roman' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: dateStr, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
                children: [new TextRun({ text: 'Guru Mata Pelajaran', bold: true, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: gName, bold: true, underline: {}, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: gNip, size: 20, font: 'Times New Roman' })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
