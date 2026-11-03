import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createLead = async (data: any) => {
  return await prisma.lead.create({
    data: {
      name: data.schoolName,                       // Memetakan schoolName dari frontend ke kolom 'name' di schema
      email: data.email,                           // Memetakan email
      phone: data.phoneNumber || data.phone || '', // Memetakan nomor telepon (mendukung phoneNumber maupun phone)
    },
  });
};

export const fetchAllLeads = async () => {
  return await prisma.lead.findMany();
};