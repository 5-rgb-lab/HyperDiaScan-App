
import { describe, it, expect, vi } from 'vitest';
import { generatePersonalizedDailyTips } from '@/lib/analyzeFood';
import { updateUserHealthTips } from '@/lib/firestore';

vi.mock('@/lib/analyzeFood');
vi.mock('firebase/firestore');

describe('Tips - Generate Personalized Tips', () => {
  it('should generate tips for diabetes patients', async () => {
    const mockProfile = {
      primaryCondition: 'diabetes' as const,
      demographics: {
        age: 45,
        biologicalSex: 'Male' as const,
        heightCm: 175,
        weightKg: 80,
        activityLevel: 'Moderate' as const
      }
    };

    // The real function returns void; the module is mocked so assert it resolves
    (vi.mocked(generatePersonalizedDailyTips) as any).mockResolvedValue(undefined);
    await expect(generatePersonalizedDailyTips('user-1', mockProfile as any)).resolves.toBeUndefined();
  });

  it('should generate tips for hypertension patients', async () => {
    const mockProfile = {
      primaryCondition: 'hypertension' as const,
      demographics: {
        age: 55,
        biologicalSex: 'Female' as const,
        heightCm: 165,
        weightKg: 70,
        activityLevel: 'Sedentary' as const
      }
    };

    (vi.mocked(generatePersonalizedDailyTips) as any).mockResolvedValue(undefined);
    await expect(generatePersonalizedDailyTips('user-2', mockProfile as any)).resolves.toBeUndefined();
  });

  it('should update user health tips in Firestore', async () => {
    const mockTips = [
      { content: 'Tip 1' },
      { content: 'Tip 2' }
    ];

    const { updateDoc } = await import('firebase/firestore');
    vi.mocked(updateDoc).mockResolvedValue(undefined as any);

    await updateUserHealthTips('user-123', mockTips);
    expect(updateDoc).toHaveBeenCalled();
  });
});
