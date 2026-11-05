import { Router } from 'express';
import * as controller from './assessment.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

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
