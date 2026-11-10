import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

// Middleware dasar
app.use(cors());
app.use(express.json());

// Endpoint Utama dengan prefix /api
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Tanggap.org Backend API',
  });
});

// Contoh Endpoint tambahan untuk data bantuan sosial
app.get('/api/bantuan', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Berhasil mengambil data penerima bantuan sosial',
    data: [], // Tempat data dari database Anda nanti
  });
});

export default app;