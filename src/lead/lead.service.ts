import prisma from '../config/database';

export const createLead = async (data: any) => {
  return await prisma.lead.create({
    data: {
      name: data.schoolName,
      email: data.email,
      phone: data.phoneNumber || data.phone || null,
    },
  });
};

export const fetchAllLeads = async () => {
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const updateLeadStatus = async (id: string, status: string) => {
  return await prisma.lead.update({
    where: { id },
    data: { status },
  });
};
