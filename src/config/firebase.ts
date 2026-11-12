import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { resolve } from 'node:path';

const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  resolve(process.cwd(), 'firebase-service-account.json');

const firebaseApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(serviceAccountPath),
  });

export const firebaseAuth = getAuth(firebaseApp);