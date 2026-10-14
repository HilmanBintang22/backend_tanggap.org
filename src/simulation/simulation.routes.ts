import { Router } from 'express';
import * as controller from './simulation.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// Endpoint untuk semua user yang terautentikasi
router.get('/', authenticateToken, controller.getSimulations);
router.get('/history/me', authenticateToken, controller.getMyResults);
router.get('/:id', authenticateToken, controller.getSimulationById);
router.post('/submit', authenticateToken, controller.submitResult);

// Endpoint khusus Admin & Guru BK
router.post(
  '/',
  authenticateToken,
  authorizeRoles('TEACHER_BK', 'SCHOOL_ADMIN', 'SUPER_ADMIN'),
  controller.createSimulation
);

export default router;