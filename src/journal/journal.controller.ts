import { Request, Response } from 'express';
import * as journalService from './journal.service';

export const createJournal = async (req: Request, res: Response) => {
  try {
    const data = await journalService.createNewJournal(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJournals = async (req: Request, res: Response) => {
  try {
    const data = await journalService.fetchAllJournals();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};