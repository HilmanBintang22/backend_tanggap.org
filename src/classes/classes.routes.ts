import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Daftar kode kelas yang valid (nantinya bisa disimpan di database)
// Format: { kode, nama, teacherId }
const CLASS_REGISTRY: Record<string, { name: string; school: string }> = {
  'SMAN1A': { name: 'Kelas XI IPA 1', school: 'SMA Negeri 1' },
  'SMAN1B': { name: 'Kelas XI IPS 1', school: 'SMA Negeri 1' },
  'DEMO01': { name: 'Kelas Demo', school: 'Tanggap.org Demo School' },
};

// POST /api/classes/join — Siswa bergabung ke kelas dengan kode OTP 6-digit
router.post('/join', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Kode kelas wajib diisi',
      });
    }

    const classData = CLASS_REGISTRY[code.toUpperCase()];

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: `Kode kelas "${code}" tidak ditemukan. Pastikan kode sudah benar.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Berhasil bergabung ke ${classData.name}`,
      data: {
        code: code.toUpperCase(),
        className: classData.name,
        school: classData.school,
        joinedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/classes — Daftar kelas yang tersedia (opsional)
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  const classes = Object.entries(CLASS_REGISTRY).map(([code, data]) => ({
    code,
    ...data,
  }));
  return res.status(200).json({ success: true, data: classes });
});

export default router;

