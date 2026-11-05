import { Router, Request, Response } from 'express';

const router = Router();

// Konten AMIGO (Aktivitas Manajemen Identitas, Growth mindset, dan Orientasi karir)
const AMIGO_CONTENT = [
  {
    id: '1',
    title: 'Mengenal Diri Sendiri Lewat Temperamen',
    category: 'Identitas',
    description: 'Panduan memahami 4 tipe temperamen dan bagaimana hal itu mempengaruhi cara kamu belajar, bergaul, dan menghadapi konflik.',
    duration: '15 menit',
    type: 'article',
  },
  {
    id: '2',
    title: 'Growth Mindset: Otak yang Bisa Berkembang',
    category: 'Growth Mindset',
    description: 'Pelajari ilmu di balik growth mindset dan cara melatih pola pikir yang mendukung perkembanganmu sebagai pelajar.',
    duration: '20 menit',
    type: 'article',
  },
  {
    id: '3',
    title: 'Eksplorasi Minat & Karir',
    category: 'Orientasi Karir',
    description: 'Temukan bidang karir yang sesuai dengan kepribadian dan minatmu melalui panduan eksplorasi terstruktur.',
    duration: '25 menit',
    type: 'interactive',
  },
  {
    id: '4',
    title: 'Mengelola Konflik dengan Empati',
    category: 'Sosial',
    description: 'Teknik-teknik praktis untuk memahami sudut pandang orang lain dan menyelesaikan konflik secara konstruktif.',
    duration: '18 menit',
    type: 'article',
  },
  {
    id: '5',
    title: 'Membangun Kepercayaan Diri',
    category: 'Identitas',
    description: 'Strategi berbasis psikologi untuk membangun rasa percaya diri yang sehat dan berkelanjutan.',
    duration: '12 menit',
    type: 'article',
  },
];

// Tracker unduhan toolkit dalam memori
const toolkitDownloads: Record<string, number> = {
  '1': 48,
  '2': 85,
  '3': 63,
  '4': 92,
};

// Konten Toolkit (Alat bantu praktis untuk siswa)
const TOOLKIT_CONTENT = [
  {
    id: '1',
    title: 'Template Refleksi Harian',
    category: 'Jurnal',
    description: 'Template terstruktur untuk menulis jurnal refleksi harian yang membantu proses pertumbuhan diri.',
    type: 'template',
    downloadUrl: null,
  },
  {
    id: '2',
    title: 'Kalkulator Gaya Belajar',
    category: 'Asesmen',
    description: 'Alat bantu interaktif untuk menemukan gaya belajar dominanmu (Visual, Auditori, atau Kinestetik).',
    type: 'interactive',
    downloadUrl: null,
  },
  {
    id: '3',
    title: 'Panduan Resolusi Konflik',
    category: 'Konflik',
    description: 'Langkah-langkah sistematis untuk menyelesaikan konflik antarpribadi secara damai dan konstruktif.',
    type: 'guide',
    downloadUrl: null,
  },
  {
    id: '4',
    title: 'Peta Karir Berdasarkan Temperamen',
    category: 'Karir',
    description: 'Infografis interaktif yang memetakan pilihan karir berdasarkan tipe temperamen.',
    type: 'infographic',
    downloadUrl: null,
  },
];

// GET /api/content/amigo — Publik (Bebas Akses tanpa Token)
router.get('/amigo', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    total: AMIGO_CONTENT.length,
    data: AMIGO_CONTENT,
  });
});

// GET /api/content/toolkits — Publik (Bebas Akses tanpa Token)
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
