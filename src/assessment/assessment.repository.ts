import prisma from '../config/database';

export const createAssessment = async (data: any) => {
  return await prisma.assessment.create({ data });
};

export const getAllAssessments = async () => {
  return await prisma.assessment.findMany({
    orderBy: { createdAt: 'desc' },
  });
};