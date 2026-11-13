import { Router } from 'express';
import * as controller from './assessment.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

router.get('/forms', (_req, res) => {
  const links = {
    kuesioner: process.env.GOOGLE_FORM_KUESIONER_URL?.trim(),
    preTest: process.env.GOOGLE_FORM_PRE_TEST_URL?.trim(),
    postTest: process.env.GOOGLE_FORM_POST_TEST_URL?.trim(),
  };
  const missing = Object.entries(links)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return res.status(503).json({
      success: false,
      message: `Tautan Google Form belum dikonfigurasi: ${missing.join(', ')}`,
    });
  }

  const invalid = Object.entries(links).some(([, value]) => {
    try {
      const url = new URL(value as string);
      return (
        url.protocol !== 'https:' ||
        !['docs.google.com', 'forms.gle'].includes(url.hostname)
      );
    } catch {
      return true;
    }
  });

  if (invalid) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi tautan Google Form harus berupa URL HTTPS Google Forms',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Tautan kuesioner berhasil diambil',
    data: links,
  });
});

// GET /api/assessments/questions — Ambil daftar 35 soal kuesioner (Public)
router.get('/questions', controller.getAssessmentQuestions);

// POST /api/assessments/submit — Submit 35 jawaban siswa (support token opsional agar tidak memblokir siswa)
router.post('/submit', optionalAuth, controller.submitAssessment);

// GET /api/assessments/results/:id — Detail riwayat hasil asesmen siswa
router.get('/results/:id', optionalAuth, controller.getAssessmentResult);

// GET /api/assessments — Daftar paket asesmen
router.get('/', optionalAuth, controller.getAssessments);

// POST /api/assessments — Buat paket asesmen baru (Admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'),
  controller.createAssessment
);

// PATCH /api/assessments/:id — Update status asesmen (Admin)
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'),
  controller.updateAssessmentStatus
);

export default router;
