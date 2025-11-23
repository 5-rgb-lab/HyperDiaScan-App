
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

    vi.mocked(generatePersonalizedDailyTips).mockResolvedValue([
      { content: 'Monitor your blood sugar regularly' },
      { content: 'Choose complex carbohydrates' },
      { content: 'Stay hydrated throughout the day' }
    ]);

    const tips = await generatePersonalizedDailyTips(mockProfile as any);
    expect(tips).toHaveLength(3);
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

    vi.mocked(generatePersonalizedDailyTips).mockResolvedValue([
      { content: 'Reduce sodium intake' },
      { content: 'Exercise regularly' },
      { content: 'Monitor blood pressure daily' }
    ]);

    const tips = await generatePersonalizedDailyTips(mockProfile as any);
    expect(tips.length).toBeGreaterThan(0);
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
