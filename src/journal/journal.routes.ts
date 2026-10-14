import { Router } from 'express';
import * as controller from './journal.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Endpoint dilindungi middleware JWT
router.post('/', authenticateToken, controller.createJournal);
router.get('/', authenticateToken, controller.getJournals);

export default router;