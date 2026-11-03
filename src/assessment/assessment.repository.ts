import prisma from '../config/database';

export const createAssessment = async (data: any) => {
  return await prisma.assessment.create({
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category || 'Temperamen',
      status: 'DRAFT',
    },
  });
};

export const getAllAssessments = async () => {
  return await prisma.assessment.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const updateAssessmentStatus = async (id: string, status: string) => {
  return await prisma.assessment.update({
    where: { id },
    data: { status },
  });
};
