import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Pastikan secret key sesuai dengan yang biasa kamu pakai di project ini
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-tanggap-org';

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

  // Buat user baru di database
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role || Role.STUDENT,
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

  // Di sini nantinya bisa diintegrasikan dengan layanan pengiriman email (Nodemailer, dll)
  // Untuk saat ini kita kembalikan status sukses
  return true;
};

// Proses Reset Password dengan token baru
export const processResetPassword = async (token: string, newPassword: string) => {
  try {
    // Verifikasi token reset
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Perbarui password di database
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: hashedPassword },
    });

    return true;
  } catch (error) {
    throw new Error('Token reset tidak valid atau kedaluwarsa');
  }
};