import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export const registerUser = async (data: any) => {
  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Buat user baru di database dengan role yang sudah dimapping ke enum Prisma
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: mapRoleToEnum(data.role),
      schoolName: data.schoolName || data.school || null,
    },
  });

  // Terbitkan token JWT agar setelah daftar langsung otomatis login
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user };
};

export const loginUser = async (data: any) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Email atau password salah');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user };
};

// Mengambil data user berdasarkan ID untuk endpoint /api/auth/me
export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

// Proses pemulihan kata sandi (Forgot Password)
export const processForgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Email tidak ditemukan dalam sistem');
  }

  return true;
};

// Proses Reset Password dengan token baru
export const processResetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: hashedPassword },
    });

    return true;
  } catch (error) {
    throw new Error('Token reset tidak valid atau kedaluwarsa');
  }
};
