import { Router } from 'express';
import * as controller from './admin.controller';
import { optionalAuth } from '../middleware/auth.middleware'; // Atau gunakan middleware auth/admin khusus jika ada

const router = Router();

// GET /api/admin/dashboard-stats — Statistik utama platform untuk admin
router.get('/dashboard-stats', optionalAuth, controller.getDashboardStats);

// GET /api/admin/monitoring-assessment — Monitoring seluruh asesmen dan partisipasi
router.get('/monitoring-assessment', optionalAuth, controller.getMonitoringAssessment);

// --- TAMBAHAN UNTUK POIN 2: MANAJEMEN PENGGUNA (ADMIN) ---

// GET /api/admin/users — Mendapatkan daftar seluruh user untuk Dashboard Admin
router.get('/users', optionalAuth, controller.getAllUsers);

// PATCH /api/admin/users/:id/role — Mengubah role user tertentu
router.patch('/users/:id/role', optionalAuth, controller.updateUserRole);

export default router;