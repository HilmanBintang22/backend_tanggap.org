import { Router } from 'express';
import * as controller from './gamification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/leaderboard', authenticateToken, controller.getLeaderboard);
router.get('/me', authenticateToken, controller.getUserStats);
router.post('/points', authenticateToken, controller.addPoints);

export default router;