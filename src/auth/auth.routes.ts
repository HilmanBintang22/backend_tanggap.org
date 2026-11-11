import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-tanggap-org';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: Memetakan input role bahasa Indonesia / user input ke enum Role Prisma
export const mapRoleToEnum = (roleInput?: string): Role => {
  if (!roleInput) return Role.STUDENT;
  const normalized = roleInput.trim().toUpperCase().replace(/\s+/g, '_');

  if (normalized === 'SISWA' || normalized === 'STUDENT') return Role.STUDENT;
  if (
    normalized === 'GURU' ||
    normalized === 'GURU_BK' ||
    normalized === 'TEACHER' ||
    normalized === 'TEACHER_BK'
  ) {
    return Role.TEACHER_BK;
  }
  if (
    normalized === 'ADMIN' ||
    normalized === 'ADMIN_SEKOLAH' ||
    normalized === 'SCHOOL_ADMIN'
  ) {
    return Role.SCHOOL_ADMIN;
  }
  if (normalized === 'SUPER_ADMIN' || normalized === 'SUPERADMIN') {
    return Role.SUPER_ADMIN;
  }

  return Role.STUDENT;
};

// Helper: Bersihkan passwordHash dan format user untuk respons
export const sanitizeUser = (user: any, roleLabelMap?: any) => {
  if (!user) return null;
  const { passwordHash, ...u } = user;
  const finalRole = roleLabelMap ? (roleLabelMap[u.role] ?? u.role) : u.role;
  return { ...u, role: finalRole };
};

// --- Endpoint Handlers ---

const registerUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    let finalRole = mapRoleToEnum(data.role);
    let finalSchoolName = data.schoolName || data.school || null;

    const schoolLead = await prisma.lead.findFirst({
      where: {
        email: data.email,
        status: 'SENT',
      },
    });

    if (schoolLead) {
      finalRole = Role.TEACHER_BK;
      const leadAny: any = schoolLead;
      if (leadAny.schoolName || leadAny.school || leadAny.name) {
        finalSchoolName = leadAny.schoolName || leadAny.school || leadAny.name;
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: finalRole,
        schoolName: finalSchoolName,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user,
      data: { token, user },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Terjadi kesalahan' });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Email atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Email atau password salah' });
    }

    let currentRole = user.role;
    let currentSchoolName = user.schoolName;

    if (user.role === Role.STUDENT) {
      const schoolLead = await prisma.lead.findFirst({
        where: {
          email: user.email,
          status: 'SENT',
        },
      });

      if (schoolLead) {
        currentRole = Role.TEACHER_BK;
        const leadAny: any = schoolLead;
        if (leadAny.schoolName || leadAny.school || leadAny.name) {
          currentSchoolName = leadAny.schoolName || leadAny.school || leadAny.name;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: currentRole,
            schoolName: currentSchoolName,
          },
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: currentRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: updatedUser,
      data: { token, user: updatedUser },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Terjadi kesalahan' });
  }
};

// Handler Google OAuth
const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token Google tidak ditemukan' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Token Google tidak valid' });
    }

    const { email, name } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || 'User Google',
          email: email,
          passwordHash: '', // Kosong karena autentikasi via Google
          role: Role.STUDENT,
        },
      });
    }

    const appToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login Google berhasil',
      token: appToken,
      user,
      data: { token: appToken, user },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Autentikasi Google gagal: ' + error.message });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    return res.status(200).json({
      success: true,
      user,
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Terjadi kesalahan' });
  }
};

const processForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan dalam sistem' });
    }

    return res.status(200).json({
      success: true,
      message: 'Instruksi pemulihan kata sandi berhasil diproses',
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Terjadi kesalahan' });
  }
};

const processResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: 'Token reset tidak valid atau kedaluwarsa' });
  }
};

// --- Mapping ke Router ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth); // Endpoint baru untuk Google Login
router.get('/me', getUserById);
router.post('/forgot-password', processForgotPassword);
router.post('/reset-password', processResetPassword);

// WAJIB ADA: Ekspor default router agar bisa dibaca bersih di app.ts
export default router;