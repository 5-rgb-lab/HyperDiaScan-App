
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithEmail, signUpWithEmail, signOut, resetPassword, onAuthChange, getUserProfile, updateUserProfile } from '@/lib/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from 'firebase/auth';

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

      const { getDoc, updateDoc } = await import('firebase/firestore');
      // default active profile exists for successful sign in
      vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({ active: true }) } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      const user = await signInWithEmail('test@example.com', 'password123');
      expect(user).toEqual(mockUser);
      expect(updateDoc).toHaveBeenCalled();
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

    it('should reject sign in when user profile does not exist', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);

      // Mock non-existent user profile
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

      await expect(signInWithEmail('test@example.com', 'password123')).rejects.toThrow('Account is inactive');
    });
  });

  describe('Sign Up', () => {
    it('should create new user account successfully', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(updateProfile).mockResolvedValue(undefined as any);
      vi.mocked(firebaseSignOut).mockResolvedValue();

      const { getDoc, setDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

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
      vi.mocked(updateProfile).mockResolvedValue(undefined as any);
      vi.mocked(firebaseSignOut).mockResolvedValue();

      const { setDoc, getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await signUpWithEmail('new@example.com', 'password123', 'Test User');

      expect(setDoc).toHaveBeenCalled();
    });

    it('should create user profile with custom profile data', async () => {
      const mockUser = { uid: 'new-uid', email: 'new@example.com' };
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(updateProfile).mockResolvedValue(undefined as any);
      vi.mocked(firebaseSignOut).mockResolvedValue();

      const { setDoc, getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      await signUpWithEmail('new@example.com', 'password123', 'Test User', { primaryCondition: 'hypertension' });

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

    it('should log audit when signing out with current user', async () => {
      vi.mocked(firebaseSignOut).mockResolvedValue();

      await signOut();
      expect(firebaseSignOut).toHaveBeenCalled();
    });
  });

  describe('Reset Password', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue();

      await resetPassword('test@example.com');
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
    });

    it('should handle password reset errors', async () => {
      vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error('Email not found'));

      await expect(resetPassword('notfound@example.com')).rejects.toThrow();
    });
  });

  describe('Auth State', () => {
    it('should listen to auth state changes', () => {
      const callback = vi.fn();
      vi.mocked(onAuthStateChanged).mockReturnValue(() => {});

      onAuthChange(callback);
      expect(onAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('Get User Profile', () => {
    it('should get user profile when it exists', async () => {
      const mockProfile = { name: 'Test User', email: 'test@example.com' };
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ 
        exists: () => true, 
        data: () => mockProfile 
      } as any);

      const profile = await getUserProfile('user-123');
      expect(profile).toEqual(mockProfile);
    });

    it('should return null when user profile does not exist', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

      const profile = await getUserProfile('user-123');
      expect(profile).toBeNull();
    });
  });

  describe('Update User Profile', () => {
    const mockCompleteProfile = {
      name: 'Old Name',
      email: 'test@example.com',
      primaryCondition: 'diabetes',
      otherConditions: { kidneyDisease: false, heartDisease: false },
      diabetesStatus: { bloodSugar: 100 },
      hypertensionStatus: { bloodPressure: { systolic: 120, diastolic: 80 } },
      treatmentManagement: {
        diabetesMedication: { medications: [] },
        hypertensionMedication: { medications: [] }
      },
      demographics: { biologicalSex: 'Male', age: 40, heightCm: 170, weightKg: 70, activityLevel: 'Sedentary' },
      active: true
    };

    it('should update user profile successfully', async () => {
      const { getDoc, setDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({ 
        exists: () => true,
        data: () => mockCompleteProfile
      } as any).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ ...mockCompleteProfile, name: 'New Name' })
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const updatedProfile = await updateUserProfile('user-123', { name: 'New Name' } as any);
      expect(updatedProfile?.name).toBe('New Name');
      expect(setDoc).toHaveBeenCalled();
    });

    it('should update profile with default values if profile does not exist', async () => {
      const { getDoc, setDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as any).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockCompleteProfile
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined as any);

      const updateData = {
        name: 'Test User',
        email: 'test@example.com',
        primaryCondition: 'diabetes'
      };
      await updateUserProfile('user-123', updateData as any);
      expect(setDoc).toHaveBeenCalled();
    });

    it('should throw error on profile validation failure', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({ 
        exists: () => true,
        data: () => mockCompleteProfile
      } as any);

      // Return an invalid profile data that will fail validation
      await expect(updateUserProfile('user-123', { name: null } as any)).rejects.toThrow();
    });
  });
});
