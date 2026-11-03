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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck & Welcome Routes
app.get('/', async (req, res) => {
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

app.get('/api', async (req, res) => {
  res.json({
    status: 'success',
    message: 'Tanggap.org API v1 running',
    endpoints: [
      '/api/auth',
      '/api/leads',
      '/api/assessments',
      '/api/journals',
      '/api/gamification',
      '/api/simulations',
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
