import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { firebaseAuth } from '../config/firebase';

const prisma = new PrismaClient();
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
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    if (!uid || !email) {
      return res.status(400).json({ success: false, message: 'Token Google tidak valid atau email tidak ditemukan' });
    }

    // Cari user berdasarkan googleId atau email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: uid },
          { email: email },
        ],
      },
    });

    // Jika user belum terdaftar, buat akun otomatis (Auto-register)
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || 'User Google',
          email: email,
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