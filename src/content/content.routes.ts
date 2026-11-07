import { Router, Request, Response } from 'express';

const router = Router();

// Data AMIGO Board Game (Rules, 4 Langkah Bermain, & videoUrl)
const AMIGO_BOARDGAME = {
  id: 'amigo-boardgame',
  title: 'Board Game AMIGO (Aktivitas Mediasi & Resolusi Konflik Siswa)',
  subtitle: 'Media Pembelajaran Interaktif Resolusi Konflik Teman Sebaya',
  description:
    'Media pembelajaran interaktif berbasis board game untuk melatih empati, komunikasi asertif, dan mediasi konflik teman sebaya di sekolah.',
  videoUrl: 'https://www.youtube.com/embed/amigo-boardgame-tutorial',
  playerCount: '4 - 6 Siswa',
  estimatedDuration: '45 - 60 Menit',
  components: [
    'Papan Permainan AMIGO',
    '35 Kartu Skenario Kasus Konflik Nyata di Sekolah',
    'Kartu Profil 4 Temperamen (Sanguinis, Koleris, Melankolis, Phlegmatis)',
    'Kartu Aksi Komunikasi Asertif & Mediasi',
    'Lembar Kesepakatan Damai & Papan Skor Perdamaian',
  ],
  rules: [
    'Bentuk kelompok 4-6 siswa dipandu oleh 1 mediator sebaya atau Guru BK.',
    'Ambil kartu skenario kasus konflik yang terjadi di lingkungan sekolah.',
    'Gunakan kartu perspektif & temperamen untuk memahami sudut pandang lawan bicara.',
    'Raih kesepakatan damai (win-win solution) sebelum timer permainan habis.',
  ],
  steps: [
    {
      step: 1,
      title: 'Pengenalan Kasus (Case Identification)',
      description: 'Pemain mengambil kartu skenario konflik nyata dan membaca narasi kejadian secara bergantian.',
      objective: 'Memahami kronologi dan mengidentifikasi isu utama pemicu konflik.',
    },
    {
      step: 2,
      title: 'Eksplorasi Perspektif & Emosi (Empathy Mapping)',
      description: 'Menganalisis emosi dan motif tersembunyi dari masing-masing pihak menggunakan kartu 4 temperamen.',
      objective: 'Melatih empati dan memahami sudut pandang pihak yang berselisih.',
    },
    {
      step: 3,
      title: 'Perumusan Solusi Asertif (Action Options)',
      description: 'Menyusun alternatif solusi menang-menang (win-win solution) dengan kartu aksi komunikasi asertif.',
      objective: 'Mencegah eskalasi konflik dan menemukan titik temu yang adil.',
    },
    {
      step: 4,
      title: 'Kesepakatan & Resolusi Damai (Resolution Agreement)',
      description: 'Menyepakati rencana tindak lanjut bersama dan menandatangani formulir komitmen damai kelompok.',
      objective: 'Membangun komitmen nyata perilaku positif dan anti-bullying di sekolah.',
    },
  ],
};

// Tracker unduhan toolkit dalam memori
const toolkitDownloads: Record<string, number> = {
  '1': 64,
  '2': 112,
  '3': 88,
  '4': 95,
};

// Konten Toolkit dengan kategori 'Bimbingan dan Konseling (BK)' & 'Mediasi Mandiri' + metadata dokumen
const TOOLKIT_CONTENT = [
  {
    id: '1',
    title: 'Modul Panduan Bimbingan Konseling (BK): Penanganan Kasus Bullying & Mediasi',
    category: 'Bimbingan dan Konseling (BK)',
    description:
      'Panduan komprehensif bagi Guru BK dalam melakukan asesmen dini, konseling individual, dan intervensi kelompok di lingkungan sekolah.',
    format: 'PDF',
    pages: '28 halaman',
    pageCount: 28,
    fileSize: '3.4 MB',
    author: 'Tim Ahli Psikologi Tanggap.org',
    downloadUrl: '/downloads/modul-bk-mediasi.pdf',
    previewUrl: '/preview/modul-bk-mediasi.pdf',
    type: 'guide',
  },
  {
    id: '2',
    title: 'Lembar Kerja Mediasi Mandiri Antar Siswa (Peer Mediation Worksheet)',
    category: 'Mediasi Mandiri',
    description:
      'Template kerja mandiri bagi siswa untuk menganalisis konflik pribadi, mengenali pemicu emosi, dan merumuskan solusi damai mandiri.',
    format: 'PDF',
    pages: '12 halaman',
    pageCount: 12,
    fileSize: '1.8 MB',
    author: 'Divisi Edukasi Tanggap.org',
    downloadUrl: '/downloads/lembar-mediasi-mandiri.pdf',
    previewUrl: '/preview/lembar-mediasi-mandiri.pdf',
    type: 'template',
  },
  {
    id: '3',
    title: 'Formulir Refleksi Harian Siswa & Pengendalian Emosi',
    category: 'Bimbingan dan Konseling (BK)',
    description:
      'Instrumen refleksi mingguan terstruktur untuk memantau mood siswa dan melatih kesadaran diri (self-awareness).',
    format: 'DOCX',
    pages: '8 halaman',
    pageCount: 8,
    fileSize: '1.2 MB',
    author: 'Tanggap BK Support',
    downloadUrl: '/downloads/formulir-refleksi-harian.docx',
    previewUrl: '/preview/formulir-refleksi-harian.docx',
    type: 'template',
  },
  {
    id: '4',
    title: 'Pedoman Praktis 5 Langkah Mediasi Mandiri Teman Sebaya',
    category: 'Mediasi Mandiri',
    description:
      'Panduan saku praktis langkah demi langkah untuk menyelesaikan kesalahpahaman antarteman di kelas secara konstruktif.',
    format: 'PDF',
    pages: '16 halaman',
    pageCount: 16,
    fileSize: '2.1 MB',
    author: 'Fasilitator Sebangku',
    downloadUrl: '/downloads/pedoman-mediasi-mandiri.pdf',
    previewUrl: '/preview/pedoman-mediasi-mandiri.pdf',
    type: 'guide',
  },
];

// GET /api/content/amigo — Publik (Mengembalikan Data AMIGO Board Game: rules, 4 steps, & videoUrl)
router.get('/amigo', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: AMIGO_BOARDGAME,
    // Root level aliases untuk kompatibilitas frontend
    videoUrl: AMIGO_BOARDGAME.videoUrl,
    rules: AMIGO_BOARDGAME.rules,
    steps: AMIGO_BOARDGAME.steps,
    title: AMIGO_BOARDGAME.title,
    description: AMIGO_BOARDGAME.description,
  });
});

// GET /api/content/toolkits — Publik (Kategori BK & Mediasi Mandiri + metadata format, pages, fileSize)
router.get('/toolkits', (_req: Request, res: Response) => {
  const data = TOOLKIT_CONTENT.map((item) => ({
    ...item,
    downloads: toolkitDownloads[item.id] || 0,
  }));

  return res.status(200).json({
    success: true,
    total: data.length,
    data,
  });
});

// GET /api/content/toolkits/:id — Detail spesifik 1 toolkit beserta metadata dokumen
router.get('/toolkits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const toolkitId = Array.isArray(id) ? id[0] : id;

  const item = TOOLKIT_CONTENT.find((t) => t.id === toolkitId);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: `Toolkit dengan ID #${toolkitId} tidak ditemukan`,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      ...item,
      downloads: toolkitDownloads[item.id] || 0,
    },
  });
});

// POST /api/content/toolkits/:id/download — Mencatat unduhan toolkit (Download Counter)
router.post('/toolkits/:id/download', (req: Request, res: Response) => {
  const { id } = req.params;
  const toolkitId = Array.isArray(id) ? id[0] : id;

  toolkitDownloads[toolkitId] = (toolkitDownloads[toolkitId] || 0) + 1;
  const item = TOOLKIT_CONTENT.find((t) => t.id === toolkitId);

  return res.status(200).json({
    success: true,
    message: 'Unduhan berhasil dicatat',
    data: {
      id: toolkitId,
      title: item?.title || `Toolkit #${toolkitId}`,
      downloads: toolkitDownloads[toolkitId],
    },
  });
});

export default router;
