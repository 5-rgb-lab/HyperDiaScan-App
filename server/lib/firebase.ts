import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK for server-side operations
let adminApp;

if (getApps().length === 0) {
  // In production, use service account credentials
  // For development, use project ID from environment
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'hyperdiascan';
  
  adminApp = initializeApp({
    projectId,
  });
} else {
  adminApp = getApps()[0];
}

export const db = getFirestore(adminApp);
export const auth = getAuth(adminApp);
export default adminApp;
