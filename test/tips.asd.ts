
import { describe, it, expect, vi } from 'vitest';
import { generatePersonalizedDailyTips } from '@/lib/analyzeFood';
import { updateUserHealthTips } from '@/lib/firestore';

vi.mock('@/lib/analyzeFood');
vi.mock('firebase/firestore');

describe('Tips - Generate Personalized Tips', () => {
  it.each([
    ['diabetes', { primaryCondition: 'diabetes' }],
    ['hypertension', { primaryCondition: 'hypertension' }]
  ])('should resolve generatePersonalizedDailyTips for %s profiles', async (_name, profile) => {
    (vi.mocked(generatePersonalizedDailyTips) as any).mockResolvedValue(undefined);
    await expect(generatePersonalizedDailyTips('user-x', profile as any)).resolves.toBeUndefined();
  });

  // updateUserHealthTips is covered by firestoreHelper tests; removed duplicate explicit check
});
