import prisma from '../config/database';

export const findLeaderboard = async (limit: number = 10) => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      schoolName: true,
      points: true,
    },
    orderBy: {
      points: 'desc',
    },
    take: limit,
  });
};

export const findUserGamification = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      points: true,
      badges: {
        include: {
          badge: true,
        },
      },
      pointLogs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
};

export const addPointsToUser = async (userId: string, amount: number, reason: string) => {
  return await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    }),
    prisma.pointLog.create({
      data: {
        userId,
        amount,
        reason,
      },
    }),
  ]);
};