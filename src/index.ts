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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/simulations', simulationRoutes);

// Healthcheck Route
app.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: 'Backend tanggap.org aktif & terhubung ke database!' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal terhubung ke database', details: error });
  }
});

// Jalankan server lokal jika bukan di environment Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
