import { Router } from 'express';
import * as controller from './gamification.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/gamification/leaderboard — Peringkat poin siswa
router.get('/leaderboard', optionalAuth, controller.getLeaderboard);

// GET /api/gamification/weekly-challenges — Tantangan mingguan siswa (dengan related & period)
router.get('/weekly-challenges', optionalAuth, controller.getWeeklyChallenges);

// GET /api/gamification/badges — Daftar semua badge yang tersedia
router.get('/badges', optionalAuth, controller.getAllBadges);

// GET /api/gamification/my-badges — Daftar badge milik siswa
router.get('/my-badges', optionalAuth, controller.getMyBadges);

// GET /api/gamification/my-stats — Statistik progres gamifikasi siswa (alias untuk /me)
router.get('/my-stats', optionalAuth, controller.getUserStats);

// GET /api/gamification/me — Statistik progres gamifikasi siswa
router.get('/me', optionalAuth, controller.getUserStats);

// POST /api/gamification/points — Tambah poin siswa (butuh token)
router.post('/points', authenticateToken, controller.addPoints);

export default router;
