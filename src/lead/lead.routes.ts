import { Request, Response, Router } from 'express';
import { createLead, getLeads, updateLeadStatus } from './lead.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// POST /api/leads — Menerima form dari Landing Page (tidak perlu token)
router.post('/', createLead);

// GET /api/leads — Daftar lead (terbuka untuk admin)
router.get('/', getLeads);

// PATCH /api/leads/:id — Update status lead (hanya admin)
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'),
  updateLeadStatus
);

export default router;
