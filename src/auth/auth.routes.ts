import { Request, Response, Router } from 'express';
import * as controller from './auth.controller';
import { verifyToken } from './auth.middleware';

const router = Router();

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Terjadi kesalahan pada server';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await controller.registerUser(req.body);
    const { passwordHash, ...user } = result.user;

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { token: result.token, user },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errorMessage(error) });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await controller.loginUser(req.body);
    const { passwordHash, ...user } = result.user;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: { token: result.token, user },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errorMessage(error) });
  }
});

router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { id: string } }).user.id;
    const user = await controller.getUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const { passwordHash, ...publicUser } = user;
    return res.status(200).json({ success: true, data: publicUser });
  } catch (error) {
    return res.status(400).json({ success: false, message: errorMessage(error) });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    await controller.processForgotPassword(req.body.email);
    return res.status(200).json({
      success: true,
      message: 'Instruksi pemulihan kata sandi berhasil diproses',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errorMessage(error) });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    await controller.processResetPassword(req.body.token, req.body.newPassword);
    return res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: errorMessage(error) });
  }
});

export default router;