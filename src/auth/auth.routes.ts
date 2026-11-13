import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getMe,
  googleAuth,
  loginUser,
  registerUser,
  updateProfile,
} from './auth.controller';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-tanggap-org';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', authenticateToken, getMe);
router.patch('/profile', authenticateToken, updateProfile);

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan dalam sistem' });
    }

    return res.status(200).json({
      success: true,
      message: 'Instruksi pemulihan kata sandi berhasil diproses',
    });
  } catch (error: unknown) {
    console.error('Gagal memproses lupa password:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses permintaan' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body ?? {};
  if (typeof token !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Token dan kata sandi baru (minimal 8 karakter) wajib diisi',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
      return res.status(400).json({ success: false, message: 'Token reset tidak valid atau kedaluwarsa' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
    });
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ success: false, message: 'Token reset tidak valid atau kedaluwarsa' });
    }
    console.error('Gagal mereset password:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi' });
  }
});

export default router;
