import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as service from './gamification.service';

export const getLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leaderboard = await service.getLeaderboard();
    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const stats = await service.getUserStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addPoints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { amount, reason } = req.body;
    await service.addPoints(userId, amount, reason);
    res.json({ success: true, message: 'Poin berhasil ditambahkan' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};