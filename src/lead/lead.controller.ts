import { Request, Response } from 'express';
import * as leadService from './lead.service';
import { LEAD_STATUS_LABEL } from '../constants/labels';

// Mapping status inbound dari frontend (bahasa Indonesia) ke nilai DB
const STATUS_TO_DB: Record<string, string> = {
  'Menunggu ditinjau': 'NEW',
  'Sedang diproses': 'CONTACTED',
  'Disetujui': 'SENT',
  // Juga terima nilai asli DB langsung
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  SENT: 'SENT',
};

const translateLead = (lead: any) => ({
  ...lead,
  status: LEAD_STATUS_LABEL[lead.status] ?? lead.status,
});

// POST /api/leads
export const createLead = async (req: Request, res: Response) => {
  try {
    const { schoolName, contactName, email, phoneNumber, studentCount, address, notes } = req.body;

    if (!schoolName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama sekolah dan email wajib diisi',
      });
    }

    const newLead = await leadService.createLead({
      schoolName,
      contactName,
      email,
      phoneNumber,
      studentCount,
      address,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Pengajuan berhasil dikirim',
      data: translateLead(newLead),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan pengajuan',
      error: error.message,
    });
  }
};

// GET /api/leads
export const getLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await leadService.fetchAllLeads();
    return res.status(200).json({
      success: true,
      data: leads.map(translateLead),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengajuan',
      error: error.message,
    });
  }
};

// PATCH /api/leads/:id
export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const dbStatus = STATUS_TO_DB[status];
    if (!dbStatus) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Gunakan: "Menunggu ditinjau", "Sedang diproses", atau "Disetujui"`,
      });
    }

    const updated = await leadService.updateLeadStatus(Array.isArray(id) ? id[0] : id, dbStatus);
    return res.status(200).json({
      success: true,
      message: 'Status pengajuan berhasil diperbarui',
      data: translateLead(updated),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status',
      error: error.message,
    });
  }
};
