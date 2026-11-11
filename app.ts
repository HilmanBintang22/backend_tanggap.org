import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './src/config/database';

// Import Routes (masuk ke dalam folder src)
import { default as leadRoutes } from './src/lead/lead.routes';
import { default as assessmentRoutes } from './src/assessment/assessment.routes';
import { default as journalRoutes } from './src/journal/journal.routes';
import { default as authRoutes } from './src/auth/auth.routes';
import { default as gamificationRoutes } from './src/gamification/gamification.routes';
import { default as simulationRoutes } from './src/simulation/simulation.routes';
import { default as classesRoutes } from './src/classes/classes.routes';
import { default as contentRoutes } from './src/content/content.routes';
import { default as teacherRoutes } from './src/teacher/teacher.routes';
import { default as adminRoutes } from './src/admin/admin.routes';
import { default as schoolsRoutes } from './src/schools/schools.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck & Welcome Routes
app.get('/', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'success',
      message: 'Backend tanggap.org aktif & terhubung ke database!',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal terhubung ke database', details: error });
  }
});

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Tanggap.org API v1 running',
    endpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/auth/me',
      'GET    /api/assessments/questions',
      'POST   /api/assessments/submit',
      'GET    /api/assessments/results/:id',
      // ... dan endpoint lainnya
    ],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schools', schoolsRoutes);

// 404 Handler untuk rute yang tidak terdaftar
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Rute '${req.method} ${req.originalUrl}' tidak ditemukan`,
  });
});

// Jalankan server lokal jika bukan di environment Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;