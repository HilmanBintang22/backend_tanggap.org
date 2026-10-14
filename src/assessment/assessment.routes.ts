import { Router } from 'express';
import * as controller from './assessment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, controller.createAssessment);
router.get('/', authenticateToken, controller.getAssessments);

export default router;