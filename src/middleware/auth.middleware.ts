import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-tanggap-org';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token akses tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau kedaluwarsa' });
    }

    (req as any).user = user; // Menyimpan data payload token ke req.user
    next();
  });
};

export const authenticateToken = verifyToken;

// Middleware opsional: jika ada token valid, pasang ke req.user; jika tidak ada, tetap lanjut (tidak 401)
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (!err && user) {
      (req as any).user = user;
    }
    next();
  });
};
