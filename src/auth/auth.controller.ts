import { Request, Response } from 'express';
import { Gender, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getFirebaseAuth } from '../config/firebase';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-tanggap-org';

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

// Helper: Menghapus passwordHash dari objek user sebelum dikirim sebagai response
const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body;
    const genderValues = Object.values(Gender);
    if (data.gender != null && !genderValues.includes(data.gender)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus LAKI_LAKI atau PEREMPUAN',
      });
    }

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
        gender: data.gender ?? null,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = sanitizeUser(user);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: safeUser,
      data: { token, user: safeUser },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body;
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
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

    const safeUser = sanitizeUser(updatedUser);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: safeUser,
      data: { token, user: safeUser },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

// Handler Autentikasi Google OAuth menggunakan Firebase Admin SDK
export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Firebase ID Token tidak ditemukan' });
    }

    // Verifikasi Firebase ID Token
    if (typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Firebase ID Token harus berupa teks' });
    }

    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    const { uid, email, name, email_verified: emailVerified } = decodedToken;

    if (!uid || !email || !emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Token Google tidak valid atau email belum terverifikasi',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { googleId: uid } });

    if (user && user.email.toLowerCase() !== normalizedEmail) {
      return res.status(409).json({
        success: false,
        message: 'Akun Google ini sudah terhubung ke akun pengguna lain',
      });
    }

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    }

    if (user?.googleId && user.googleId !== uid) {
      return res.status(409).json({
        success: false,
        message: 'Email ini sudah terhubung ke akun Google lain',
      });
    }

    // Jika user belum terdaftar, buat akun otomatis (Auto-register)
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: typeof name === 'string' && name.trim() ? name.trim() : 'User Google',
          email: normalizedEmail,
          passwordHash: null, // Kosong karena menggunakan login Google
          googleId: uid,      // Menyimpan Firebase UID
          role: Role.STUDENT,
        },
      });
    } else if (!user.googleId) {
      // Jika user sebelumnya sudah terdaftar manual dengan email yang sama, hubungkan googleId-nya
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: uid },
      });
    }

    const appToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: 'Login Google berhasil',
      token: appToken,
      user: safeUser,
      data: { token: appToken, user: safeUser },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return res.status(500).json({ success: false, message: 'Autentikasi Google gagal: ' + errorMessage });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const safeUser = sanitizeUser(user);
    return res.status(200).json({ success: true, data: safeUser });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  if (typeof userId !== 'string' || userId.length === 0) {
    return res.status(401).json({ success: false, message: 'Token tidak berisi identitas pengguna yang valid' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: 'Data profil berhasil diambil',
      user: safeUser,
      data: safeUser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;
  if (typeof userId !== 'string' || userId.length === 0) {
    return res.status(401).json({ success: false, message: 'Token tidak berisi identitas pengguna yang valid' });
  }

  const { name, schoolName, gender } = req.body ?? {};
  const data: Prisma.UserUpdateInput = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Nama harus berupa teks dengan panjang 1 sampai 120 karakter',
      });
    }
    data.name = name.trim();
  }

  if (schoolName !== undefined) {
    if (schoolName !== null && typeof schoolName !== 'string') {
      return res.status(400).json({ success: false, message: 'Nama sekolah harus berupa teks atau null' });
    }
    data.schoolName = typeof schoolName === 'string' ? schoolName.trim() || null : null;
  }

  if (gender !== undefined) {
    if (gender !== null && !Object.values(Gender).includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus LAKI_LAKI, PEREMPUAN, atau null',
      });
    }
    data.gender = gender;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, message: 'Tidak ada perubahan profil yang dikirim' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    const safeUser = sanitizeUser(user);
    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: safeUser,
      data: safeUser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};