import { Request, Response, Router } from 'express';
import * as controller from './auth.controller';
import { verifyToken } from './auth.middleware';
import { ROLE_LABEL } from '../constants/labels';

const router = Router();

const errMsg = (error: unknown) =>
  error instanceof Error ? error.message : 'Terjadi kesalahan pada server';

// Helper: bersihkan passwordHash dan terjemahkan role
const sanitizeUser = (user: any) => {
  const { passwordHash, ...u } = user;
  return { ...u, role: ROLE_LABEL[u.role] ?? u.role };
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await controller.registerUser(req.body);
    const user = sanitizeUser(result.user);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token: result.token,
      user,
      // Backward-compat: data juga disertakan
      data: { token: result.token, user },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errMsg(error) });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await controller.loginUser(req.body);
    const user = sanitizeUser(result.user);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token: result.token,
      user,
      data: { token: result.token, user },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errMsg(error) });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rawUser = await controller.getUserById(userId);

    if (!rawUser) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = sanitizeUser(rawUser);
    return res.status(200).json({
      success: true,
      user,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errMsg(error) });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    await controller.processForgotPassword(req.body.email);
    return res.status(200).json({
      success: true,
      message: 'Instruksi pemulihan kata sandi berhasil diproses',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errMsg(error) });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    await controller.processResetPassword(req.body.token, req.body.newPassword);
    return res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errMsg(error) });
  }
});

export default router;
