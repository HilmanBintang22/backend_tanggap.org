import prisma from '../config/database';

export const findAllSimulations = async () => {
  return await prisma.simulation.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
};

export const findSimulationById = async (id: string) => {
  return await prisma.simulation.findUnique({
    where: { id },
  });
};

export const saveSimulationResult = async (userId: string, simulationId: string, score: number) => {
  return await prisma.simulationResult.create({
    data: {
      userId,
      simulationId,
      score,
      status: 'COMPLETED',
    },
  });
};

export const getUserSimulationResults = async (userId: string) => {
  return await prisma.simulationResult.findMany({
    where: { userId },
    include: { simulation: true },
    orderBy: { completedAt: 'desc' },
  });
};

export const createSimulation = async (data: {
  title: string;
  description?: string;
  category: string;
  duration: number;
  status?: string;
}) => {
  return await prisma.simulation.create({
    data,
  });
};