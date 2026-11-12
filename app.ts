import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import prisma from './src/config/database';

// Import Routes (mengarah ke dalam folder src)
import leadRoutes from './src/lead/lead.routes';
import assessmentRoutes from './src/assessment/assessment.routes';
import journalRoutes from './src/journal/journal.routes';
import authRoutes from './src/auth/auth.routes';
import gamificationRoutes from './src/gamification/gamification.routes';
import simulationRoutes from './src/simulation/simulation.routes';
import classesRoutes from './src/classes/classes.routes';
import contentRoutes from './src/content/content.routes';
import teacherRoutes from './src/teacher/teacher.routes';
import adminRoutes from './src/admin/admin.routes';
import schoolsRoutes from './src/schools/schools.routes';

const app: Application = express();

// Middleware CORS (Batasi domain untuk produksi/Hostinger, atau biarkan terbuka jika masih tahap uji coba)
app.use(
  cors({
    origin: ['https://tanggap.org', 'https://www.tanggap.org', 'http://localhost:5173'],
    credentials: true,
  })
);

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
      'POST   /api/classes/join',
      'GET    /api/classes',
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

export default app;