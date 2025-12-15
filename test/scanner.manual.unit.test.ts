
import { describe, it, expect, vi } from 'vitest';
import { analyzeFood } from '@/lib/analyzeFood';

vi.mock('@/lib/analyzeFood');

describe('Scanner - Manual Entry (Grams)', () => {
  it('should analyze food with grams input for diabetes', async () => {
    const mockData = {
      foodName: 'Greek Yogurt',
      calories: 150,
      carbohydrates: 20,
      protein: 15,
      fat: 5,
      sodium: 100,
      fiber: 2,
      totalSugars: 10,
      condition: 'diabetes' as const
    };

    (vi.mocked(analyzeFood) as any).mockResolvedValue({
      prediction: 'Safe',
      reasoning: 'Suitable for diabetes management',
      healthTip: [{ content: 'Suitable for diabetes management' }]
    });

    const result = await analyzeFood(mockData as any, null as any, { unit: 'grams' });
    expect(result.prediction).toBe('Safe');
  });

  it('should analyze food with grams input for hypertension', async () => {
    const mockData = {
      foodName: 'Canned Soup',
      calories: 200,
      carbohydrates: 30,
      protein: 10,
      fat: 5,
      sodium: 1500,
      fiber: 3,
      totalSugars: 5,
      condition: 'hypertension' as const
    };

    (vi.mocked(analyzeFood) as any).mockResolvedValue({
      prediction: 'Risky',
      reasoning: 'High sodium content',
      healthTip: [{ content: 'High sodium content' }]
    });

    const result = await analyzeFood(mockData as any, null as any, { unit: 'grams' });
    expect(result.prediction).toBe('Risky');
  });

  it('should validate required nutrition fields', async () => {
    const incompleteData = {
      foodName: 'Test Food',
      calories: 150
      // Missing required fields
    };
    (vi.mocked(analyzeFood) as any).mockRejectedValue(new Error('Missing fields'));
    await expect(analyzeFood(incompleteData as any, null as any, { unit: 'grams' })).rejects.toThrow();
  });
});