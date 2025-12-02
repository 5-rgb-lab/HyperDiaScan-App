
import { describe, it, expect, vi } from 'vitest';
import { saveScanRecord } from '@/lib/firestore';

vi.mock('firebase/firestore');

describe('History - Save Records', () => {
  it('should save scan record successfully', async () => {
    const mockRecord = {
      foodName: 'Apple',
      condition: 'diabetes' as const,
      prediction: 'Safe' as const,
      nutritionData: {
        calories: 95,
        carbohydrates: 25,
        protein: 0.5,
        fat: 0.3,
        sodium: 2,
        fiber: 4,
        totalSugars: 19
      }
    };

    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'record-123' } as any);

    const recordId = await saveScanRecord('test-user', mockRecord as any);
    expect(recordId).toBe('record-123');
  });

  it('should include timestamp when saving record', async () => {
    const mockRecord = {
      userId: 'test-user',
      foodName: 'Banana',
      condition: 'hypertension' as const,
      prediction: 'safe' as const,
      nutritionData: {
        calories: 105,
        carbohydrates: 27,
        protein: 1.3,
        fat: 0.4,
        sodium: 1,
        fiber: 3,
        totalSugars: 14
      }
    };

    const { addDoc } = await import('firebase/firestore');
    await saveScanRecord('test-user', mockRecord as any);

    expect(addDoc).toHaveBeenCalled();
    const call = vi.mocked(addDoc).mock.calls[0];
    const payload = call[1] as any;
    expect(payload).toBeDefined();
    expect(typeof payload.timestamp).toBe('string');
  });

  it('should handle save errors gracefully', async () => {
    const mockRecord = {
      foodName: 'Orange',
      condition: 'diabetes' as const,
      prediction: 'Safe' as const,
      nutritionData: {} as any
    };

    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

    await expect(saveScanRecord('test-user', mockRecord as any)).rejects.toThrow();
  });
});
