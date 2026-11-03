import { Router, Request, Response } from 'express';
import * as controller from './assessment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// GET /api/assessments/questions — Ambil daftar 35 soal kuesioner (tidak butuh login)
router.get('/questions', controller.getAssessmentQuestions);

// POST /api/assessments/submit — Submit 35 jawaban siswa & hitung skor temperamen
router.post('/submit', authenticateToken, controller.submitAssessment);

// GET /api/assessments — Daftar paket asesmen
router.get('/', authenticateToken, controller.getAssessments);

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
