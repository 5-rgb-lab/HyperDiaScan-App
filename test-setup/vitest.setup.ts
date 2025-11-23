// Vitest setup: mock firebase initialization so tests don't call real Firebase
import { vi } from 'vitest';

// Provide a lightweight mock for the firebase wrapper used across the client code.
// Any tests that need to override specific firebase functions can still import and
// mock the underlying firebase modules (e.g., 'firebase/firestore', 'firebase/auth').

vi.mock('@/lib/firebase', () => ({
  app: {},
  auth: { currentUser: null },
  db: {},
}));

// Also mock firebase/app/getAuth/getFirestore to be safe if code imports direct SDK
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => 'docRef'),
  onSnapshot: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
}));

export {};
