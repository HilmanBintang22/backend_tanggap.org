import prisma from '../config/database';

// Fungsi untuk membuat lead baru
export const createLead = async (data: any) => {
  return await prisma.lead.create({
    data,
  });
};

// Fungsi untuk mengambil semua data lead
export const getAllLeads = async () => {
  return await prisma.lead.findMany({
    orderBy: {
      createdAt: 'desc', // Mengurutkan dari yang paling baru
    },
  });
};