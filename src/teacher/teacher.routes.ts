import { Router } from 'express';
import * as controller from './teacher.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/teacher/dashboard-overview — Ringkasan dashboard Guru BK
router.get('/dashboard-overview', optionalAuth, controller.getDashboardOverview);

// GET /api/teacher/monitoring — Data monitoring perkembangan asesmen siswa
router.get('/monitoring', optionalAuth, controller.getStudentMonitoring);

// GET /api/teacher/report/summary — Ringkasan laporan konseling & rekomendasi
router.get('/report/summary', optionalAuth, controller.getReportSummary);

export default router;

