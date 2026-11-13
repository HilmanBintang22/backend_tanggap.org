import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const getFirebaseAuth = () => {
  const serviceAccountPath = resolve(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ?? 'firebase-service-account.json'
  );

  if (!getApps().length && !existsSync(serviceAccountPath)) {
    throw new Error(
      'Firebase service account tidak ditemukan. Atur GOOGLE_APPLICATION_CREDENTIALS ke path file kredensial.'
    );
  }

  const firebaseApp =
    getApps()[0] ??
    initializeApp({
      credential: cert(serviceAccountPath),
    });

  return getAuth(firebaseApp);
};