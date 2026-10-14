import * as repo from './simulation.repository';

export const getAvailableSimulations = async () => {
  return await repo.findAllSimulations();
};

export const getSimulationDetails = async (id: string) => {
  const simulation = await repo.findSimulationById(id);
  if (!simulation) throw new Error('Simulasi tidak ditemukan');
  return simulation;
};

export const submitSimulationResult = async (userId: string, simulationId: string, score: number) => {
  if (score < 0 || score > 100) throw new Error('Skor harus berada di antara 0 dan 100');
  
  const simulation = await repo.findSimulationById(simulationId);
  if (!simulation) throw new Error('Simulasi tidak ditemukan');

  return await repo.saveSimulationResult(userId, simulationId, score);
};

export const getUserHistory = async (userId: string) => {
  return await repo.getUserSimulationResults(userId);
};

export const createNewSimulation = async (data: {
  title: string;
  description?: string;
  category: string;
  duration: number;
  status?: string;
}) => {
  if (!data.title || !data.category || !data.duration) {
    throw new Error('Title, category, dan duration wajib diisi');
  }
  return await repo.createSimulation(data);
};