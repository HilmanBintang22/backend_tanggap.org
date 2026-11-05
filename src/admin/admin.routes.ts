import { Router } from 'express';
import * as controller from './admin.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/admin/dashboard-stats — Statistik utama platform untuk admin
router.get('/dashboard-stats', optionalAuth, controller.getDashboardStats);

// GET /api/admin/monitoring-assessment — Monitoring seluruh asesmen dan partisipasi
router.get('/monitoring-assessment', optionalAuth, controller.getMonitoringAssessment);

export default router;

