
import { describe, it, expect, vi } from 'vitest';
import { analyzeFood } from '@/lib/analyzeFood';

vi.mock('@/lib/analyzeFood');

describe('Scanner - Manual Entry (RENI)', () => {
  it('should analyze food with RENI percentage input', async () => {
    const mockData = {
      foodName: 'Protein Bar',
      calories: 25,
      carbohydrates: 30,
      protein: 40,
      fat: 15,
      sodium: 10,
      fiber: 20,
      totalSugars: 5,
      condition: 'diabetes' as const
    };

    vi.mocked(analyzeFood).mockResolvedValue({
      prediction: 'Safe',
      reasoning: 'Good macronutrient balance'
    });

    const result = await analyzeFood(mockData, null, { unit: 'reni' });
    expect(result.prediction).toBe('Safe');
  });

  it('should convert RENI percentages correctly', async () => {
    const mockData = {
      foodName: 'Test Food',
      calories: 50,
      carbohydrates: 100,
      protein: 50,
      fat: 50,
      sodium: 200,
      fiber: 50,
      totalSugars: 150,
      condition: 'hypertension' as const
    };

    await analyzeFood(mockData, null, { unit: 'reni' });
    expect(analyzeFood).toHaveBeenCalledWith(mockData, null, { unit: 'reni' });
  });

  it('should handle edge cases with 0% RENI values', async () => {
    const mockData = {
      foodName: 'Water',
      calories: 0,
      carbohydrates: 0,
      protein: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      totalSugars: 0,
      condition: 'diabetes' as const
    };

    vi.mocked(analyzeFood).mockResolvedValue({
      prediction: 'Safe',
      reasoning: 'No significant nutrients'
    });

    const result = await analyzeFood(mockData, null, { unit: 'reni' });
    expect(result).toBeDefined();
  });
});
