import { Request, Response } from 'express';
import * as assessmentService from './assessment.service';

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const data = await assessmentService.createNewAssessment(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssessments = async (req: Request, res: Response) => {
  try {
    const data = await assessmentService.fetchAllAssessments();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};