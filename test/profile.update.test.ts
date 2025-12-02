
import { describe, it, expect, vi } from 'vitest';
import { updateUserProfile, getUserProfile } from '@/lib/auth';

vi.mock('firebase/firestore');

describe('Profile - Update User Profile', () => {
  it('should update user demographics', async () => {
    const mockProfile = {
      name: 'John Doe',
      email: 'john@example.com',
      primaryCondition: 'diabetes' as const,
      demographics: {
        age: 40,
        biologicalSex: 'Male' as const,
        heightCm: 180,
        weightKg: 85,
        activityLevel: 'Moderate' as const
      },
      otherConditions: { kidneyDisease: false, heartDisease: false },
      diabetesStatus: { bloodSugar: 120 },
      hypertensionStatus: { bloodPressure: { systolic: 120, diastolic: 80 } },
      treatmentManagement: {
        diabetesMedication: { medications: [] },
        hypertensionMedication: { medications: [] }
      }
    };

    const { setDoc, getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => mockProfile
    } as any);

    const updated = await updateUserProfile('user-123', mockProfile as any);
    expect(updated).toBeDefined();
  });

  it('should update medical conditions', async () => {
    const mockProfile = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      primaryCondition: 'hypertension' as const,
      otherConditions: { kidneyDisease: true, heartDisease: false },
      demographics: {
        age: 50,
        biologicalSex: 'Female' as const,
        heightCm: 165,
        weightKg: 65,
        activityLevel: 'Lightly Active' as const
      },
      diabetesStatus: { bloodSugar: 90 },
      hypertensionStatus: { bloodPressure: { systolic: 140, diastolic: 90 } },
      treatmentManagement: {
        diabetesMedication: { medications: [] },
        hypertensionMedication: { medications: ['ACE inhibitors'] }
      }
    };

    await updateUserProfile('user-456', mockProfile as any);
    const { setDoc } = await import('firebase/firestore');
    expect(setDoc).toHaveBeenCalled();
  });

  it('should retrieve user profile', async () => {
    const { getDoc } = await import('firebase/firestore');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Test User' })
    } as any);

    const profile = await getUserProfile('user-789');
    expect(profile).toBeDefined();
  });
});
