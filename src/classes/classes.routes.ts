import { randomInt } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { Router, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
const classAdmins = [authenticateToken, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN')];

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

const generateClassCode = () => randomInt(0, 1_000_000).toString().padStart(6, '0');

const getUserId = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (typeof userId !== 'string' || userId.length === 0) {
    res.status(401).json({ success: false, message: 'Token tidak berisi identitas pengguna yang valid' });
    return null;
  }
  return userId;
};

router.post('/join', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ success: false, message: 'Kode kelas harus terdiri dari 6 angka' });
  }

  try {
    const classroom = await prisma.classroom.findUnique({ where: { code } });
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Kode kelas tidak ditemukan' });
    }

    const membership = await prisma.classMembership.upsert({
      where: {
        userId_classroomId: { userId, classroomId: classroom.id },
      },
      create: { userId, classroomId: classroom.id },
      update: {},
    });

    return res.status(200).json({
      success: true,
      message: `Berhasil bergabung ke ${classroom.name}`,
      data: {
        classroom: {
          id: classroom.id,
          name: classroom.name,
          schoolName: classroom.schoolName,
        },
        joinedAt: membership.joinedAt,
      },
    });
  } catch (error) {
    console.error('Gagal bergabung ke kelas:', error);
    return res.status(500).json({ success: false, message: 'Gagal bergabung ke kelas' });
  }
});

router.post('/', ...classAdmins, async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (req.body?.schoolName !== undefined && req.body.schoolName !== null && typeof req.body.schoolName !== 'string') {
    return res.status(400).json({ success: false, message: 'Nama sekolah harus berupa teks atau null' });
  }
  const schoolName =
    typeof req.body?.schoolName === 'string' ? req.body.schoolName.trim() || null : null;

  if (!name || name.length > 120 || (schoolName && schoolName.length > 160)) {
    return res.status(400).json({
      success: false,
      message: 'Nama kelas wajib diisi (maksimal 120 karakter); nama sekolah maksimal 160 karakter',
    });
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const classroom = await prisma.classroom.create({
        data: { name, schoolName, code: generateClassCode(), createdById: userId },
      });
      return res.status(201).json({
        success: true,
        message: 'Kelas berhasil dibuat',
        data: classroom,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) continue;
      console.error('Gagal membuat kelas:', error);
      return res.status(500).json({ success: false, message: 'Gagal membuat kelas' });
    }
  }

  return res.status(503).json({
    success: false,
    message: 'Tidak berhasil membuat kode kelas unik. Silakan coba kembali.',
  });
});

router.get('/manage', ...classAdmins, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { memberships: true } } },
    });
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error('Gagal mengambil daftar kelas:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar kelas' });
  }
});

router.post('/:id/regenerate-code', ...classAdmins, async (req: AuthenticatedRequest, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : '';
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID kelas tidak valid' });
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const classroom = await prisma.classroom.update({
        where: { id },
        data: { code: generateClassCode() },
      });
      return res.status(200).json({
        success: true,
        message: 'Kode kelas berhasil diperbarui',
        data: classroom,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) continue;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan' });
      }
      console.error('Gagal memperbarui kode kelas:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui kode kelas' });
    }
  }

  return res.status(503).json({
    success: false,
    message: 'Tidak berhasil membuat kode kelas unik. Silakan coba kembali.',
  });
});

router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const classrooms = await prisma.classroom.findMany({
      select: {
        id: true,
        name: true,
        schoolName: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ success: true, data: classrooms });
  } catch (error) {
    console.error('Gagal mengambil daftar kelas:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar kelas' });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id : '';
  if (!id) return res.status(400).json({ success: false, message: 'ID kelas tidak valid' });

  try {
    const classroom = await prisma.classroom.findFirst({
      where: { OR: [{ id }, { code: id }] },
      select: {
        id: true,
        name: true,
        schoolName: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    });
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: classroom });
  } catch (error) {
    console.error('Gagal mengambil detail kelas:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail kelas' });
  }
});

export default router;
