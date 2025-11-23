
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithEmail, signUpWithEmail, signOut } from '@/lib/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

vi.mock('firebase/auth');
vi.mock('firebase/firestore');
vi.mock('@/admin/lib/auditLog');
// Provide a small mock for our firebase wrapper so `auth.currentUser` exists during tests
vi.mock('@/lib/firebase', () => ({ auth: { currentUser: { uid: 'test-uid', email: 'test@example.com' } }, db: {} }));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Ensure the audit log helper (which may be mocked) returns a promise
  beforeEach(async () => {
    const { createAuthAuditLog } = await import('@/admin/lib/auditLog');
    if (createAuthAuditLog) vi.mocked(createAuthAuditLog).mockResolvedValue(undefined as any);
  });

  describe('Sign In', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

      const { getDoc } = await import('firebase/firestore');
      // default active profile exists for successful sign in
      vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ active: true }) } as any);

      const user = await signInWithEmail('test@example.com', 'password123');
      expect(user).toEqual(mockUser);
    });

    it('should reject sign in with invalid credentials', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('Invalid credentials'));

      await expect(signInWithEmail('wrong@example.com', 'wrongpass')).rejects.toThrow();
    });

    it('should reject sign in for inactive accounts', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

      // Mock inactive user profile
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ 
        exists: () => true, 
        data: () => ({ active: false }) 
      } as any);

      await expect(signInWithEmail('test@example.com', 'password123')).rejects.toThrow('Account is inactive');
    });
  });

  describe('Sign Up', () => {
    it('should create new user account successfully', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

      const user = await signUpWithEmail('new@example.com', 'password123', 'Test User');
      expect(user).toEqual(mockUser);
    });

    it('should reject sign up with existing email', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(new Error('Email already in use'));

      await expect(signUpWithEmail('existing@example.com', 'password123', 'Test User')).rejects.toThrow();
    });

    it('should create user profile on sign up', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

      const { setDoc, getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await signUpWithEmail('new@example.com', 'password123', 'Test User');

      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      vi.mocked(firebaseSignOut).mockResolvedValue();

      await signOut();
      expect(firebaseSignOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      vi.mocked(firebaseSignOut).mockRejectedValue(new Error('Sign out failed'));

      await expect(signOut()).rejects.toThrow();
    });
  });
});
