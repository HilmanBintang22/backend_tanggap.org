import { Router } from 'express';
import { createLead, getLeads } from './lead.controller';

const router = Router();

// Route untuk menerima form (baik dari Web/Frontend maupun Google Form Webhook)
router.post('/', createLead);

// Route untuk mengambil daftar lead
router.get('/', getLeads);

export default router;