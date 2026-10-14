import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as service from './simulation.service';

export const getSimulations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const simulations = await service.getAvailableSimulations();
    res.json({ success: true, data: simulations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSimulationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const simulation = await service.getSimulationDetails(req.params.id as string);
    res.json({ success: true, data: simulation });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const submitResult = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { simulationId, score } = req.body;
    
    const result = await service.submitSimulationResult(userId, simulationId, score);
    res.status(201).json({ success: true, message: 'Hasil simulasi berhasil disimpan', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyResults = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const history = await service.getUserHistory(userId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSimulation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const simulation = await service.createNewSimulation(req.body);
    res.status(201).json({ success: true, message: 'Simulasi berhasil dibuat', data: simulation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};