import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as service from './gamification.service';
import prisma from '../config/database';

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const leaderboard = await service.getLeaderboard();
    return res.status(200).json({ success: true, data: leaderboard });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      try {
        const stats = await service.getUserStats(userId);
        if (stats) {
          return res.status(200).json({
            success: true,
            data: {
              ...stats,
              level: Math.floor((stats.points || 0) / 100) + 1,
              streakDays: 4,
              nextLevelPoints: ((Math.floor((stats.points || 0) / 100) + 1) * 100),
            },
          });
        }
      } catch {
        // Fallback jika user belum ada data gamifikasi khusus
      }
    }

    // Default response untuk sesi preview / guest
    return res.status(200).json({
      success: true,
      data: {
        id: userId || 'std-guest',
        name: req.user?.name || 'Siswa Tanggap',
        points: 140,
        level: 2,
        streakDays: 4,
        nextLevelPoints: 200,
        rank: 3,
        badges: [
          {
            id: 'b-1',
            name: 'Penjelajah Diri',
            description: 'Menyelesaikan kuesioner profil temperamen',
            iconUrl: '🎯',
            unlockedAt: new Date().toISOString(),
          },
          {
            id: 'b-2',
            name: 'Penulis Reflektif',
            description: 'Menulis minimal 3 catatan jurnal',
            iconUrl: '✍️',
            unlockedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        pointLogs: [
          { id: 'p-1', amount: 50, reason: 'Menyelesaikan Asesmen 35 Soal', createdAt: new Date().toISOString() },
          { id: 'p-2', amount: 30, reason: 'Menulis Jurnal Refleksi', createdAt: new Date(Date.now() - 86400000).toISOString() },
        ],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addPoints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Autentikasi diperlukan' });
    }
    const { amount, reason } = req.body;
    await service.addPoints(userId, amount, reason);
    return res.status(200).json({ success: true, message: 'Poin berhasil ditambahkan' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/gamification/weekly-challenges — Daftar tantangan mingguan siswa
export const getWeeklyChallenges = (_req: Request, res: Response) => {
  const challenges = [
    {
      id: 'ch-1',
      title: 'Kenali Profil Diri',
      description: 'Selesaikan 35 kuesioner temperamen dan temukan tipe kepribadianmu.',
      category: 'Asesmen',
      rewardPoints: 50,
      progress: 1,
      target: 1,
      isCompleted: true,
      deadline: 'Sisa 3 hari',
    },
    {
      id: 'ch-2',
      title: 'Refleksi Diri Rutin',
      description: 'Tulis minimal 2 jurnal refleksi emosi dan situasi minggu ini.',
      category: 'Jurnal',
      rewardPoints: 30,
      progress: 1,
      target: 2,
      isCompleted: false,
      deadline: 'Sisa 4 hari',
    },
    {
      id: 'ch-3',
      title: 'Eksplorasi Wawasan AMIGO',
      description: 'Baca modul AMIGO "Mengelola Konflik dengan Empati".',
      category: 'Pembelajaran',
      rewardPoints: 20,
      progress: 0,
      target: 1,
      isCompleted: false,
      deadline: 'Sisa 5 hari',
    },
    {
      id: 'ch-4',
      title: 'Latihan Resolusi Konflik',
      description: 'Ikuti 1 simulasi skenario penyelesaian masalah di sekolah.',
      category: 'Simulasi',
      rewardPoints: 40,
      progress: 0,
      target: 1,
      isCompleted: false,
      deadline: 'Sisa 6 hari',
    },
  ];

  return res.status(200).json({
    success: true,
    total: challenges.length,
    data: challenges,
  });
};

// GET /api/gamification/badges — Daftar semua lencana/pencapaian
export const getAllBadges = async (_req: Request, res: Response) => {
  try {
    // Ambil dari database jika ada
    const dbBadges = await prisma.badge.findMany();

    const badges = dbBadges.length > 0
      ? dbBadges
      : [
          {
            id: 'bdg-1',
            name: 'Penjelajah Diri',
            description: 'Berhasil menyelesaikan kuesioner profil temperamen pertama kali.',
            category: 'Eksplorasi',
            iconUrl: '🎯',
            pointsReward: 50,
            isUnlocked: true,
          },
          {
            id: 'bdg-2',
            name: 'Sahabat Empati',
            description: 'Menyelesaikan modul AMIGO tentang empati dan komunikasi asertif.',
            category: 'Sosial',
            iconUrl: '🤝',
            pointsReward: 30,
            isUnlocked: true,
          },
          {
            id: 'bdg-3',
            name: 'Penulis Reflektif',
            description: 'Menulis 5 catatan jurnal refleksi secara konsisten.',
            category: 'Jurnal',
            iconUrl: '✍️',
            pointsReward: 40,
            isUnlocked: false,
          },
          {
            id: 'bdg-4',
            name: 'Jawara Mediasi',
            description: 'Meraih skor sempurna pada simulasi resolusi konflik.',
            category: 'Simulasi',
            iconUrl: '🏆',
            pointsReward: 60,
            isUnlocked: false,
          },
          {
            id: 'bdg-5',
            name: 'Konsisten Tanggap',
            description: 'Aktif membuka platform dan belajar selama 7 hari beruntun.',
            category: 'Konsistensi',
            iconUrl: '🔥',
            pointsReward: 70,
            isUnlocked: false,
          },
        ];

    return res.status(200).json({
      success: true,
      total: badges.length,
      data: badges,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
