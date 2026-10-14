import prisma from '../config/database';

export const createJournal = async (data: any) => {
  return await prisma.journal.create({ data });
};

export const getAllJournals = async () => {
  return await prisma.journal.findMany({
    orderBy: { createdAt: 'desc' },
  });
};