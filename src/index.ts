import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database';

// Import Routes
import leadRoutes from './lead/lead.routes';
import assessmentRoutes from './assessment/assessment.routes';
import journalRoutes from './journal/journal.routes';
import authRoutes from './auth/auth.routes';
import gamificationRoutes from './gamification/gamification.routes';
import simulationRoutes from './simulation/simulation.routes';
import classesRoutes from './classes/classes.routes';
import contentRoutes from './content/content.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck & Welcome Routes
app.get('/', async (_req, res) => {
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

app.get('/api', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Tanggap.org API v1 running',
    endpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/auth/me',
      'POST   /api/auth/forgot-password',
      'POST   /api/auth/reset-password',
      'GET    /api/leads',
      'POST   /api/leads',
      'PATCH  /api/leads/:id',
      'GET    /api/assessments',
      'POST   /api/assessments',
      'PATCH  /api/assessments/:id',
      'GET    /api/assessments/questions',
      'POST   /api/assessments/submit',
      'GET    /api/journals',
      'POST   /api/journals',
      'GET    /api/gamification/leaderboard',
      'GET    /api/gamification/me',
      'POST   /api/gamification/points',
      'GET    /api/simulations',
      'GET    /api/simulations/:id',
      'GET    /api/simulations/history/me',
      'POST   /api/simulations/submit',
      'POST   /api/simulations',
      'POST   /api/classes/join',
      'GET    /api/classes',
      'GET    /api/content/amigo',
      'GET    /api/content/toolkits',
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

// 404 Handler untuk rute yang tidak terdaftar
app.use((req, res) => {
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
