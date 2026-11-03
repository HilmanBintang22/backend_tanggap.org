import { Request, Response } from 'express';
import * as leadService from './lead.service';

export const createLead = async (req: Request, res: Response) => {
  try {
    const { schoolName, contactName, email, phoneNumber, studentCount, address, notes } = req.body;

    // Validasi input wajib
    if (!schoolName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama sekolah dan email wajib diisi',
      });
    }

    // Teruskan data ke service menggunakan createLead (bukan createNewLead)
    const newLead = await leadService.createLead({
      schoolName,
      contactName,
      email,
      phoneNumber,
      studentCount,
      address,
      notes
    });
    
    return res.status(201).json({
      success: true,
      message: 'Lead berhasil ditambahkan',
      data: newLead,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan lead',
      error: error.message,
    });
  }
};

export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await leadService.fetchAllLeads();
    
    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data lead',
      error: error.message,
    });
  }
};