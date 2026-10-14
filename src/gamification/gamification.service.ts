import * as repo from './gamification.repository';

export const getLeaderboard = async () => {
  return await repo.findLeaderboard();
};

export const getUserStats = async (userId: string) => {
  const stats = await repo.findUserGamification(userId);
  if (!stats) throw new Error('Pengguna tidak ditemukan');
  return stats;
};

export const addPoints = async (userId: string, amount: number, reason: string) => {
  if (amount <= 0) throw new Error('Jumlah poin harus lebih besar dari 0');
  return await repo.addPointsToUser(userId, amount, reason);
};