import { Request, Response } from 'express';
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

export const registerUser = async (req: Request, res: Response) => {
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
      // Menggunakan any atau mengarah ke property opsional yang ada di model Lead
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

    return res.status(201).json({ success: true, token, user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
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

    return res.status(200).json({ success: true, token, user: updatedUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
    });
    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};