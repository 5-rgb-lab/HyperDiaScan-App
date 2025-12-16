import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveScanRecord } from '@/lib/firestore';
import * as firestore from 'firebase/firestore';

// Mock only the functions you need
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db: any, name: string) => ({ path: name })),
  addDoc: vi.fn()
}));

describe('History - Save Records', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    // Mock addDoc to return a document reference with an id
    vi.mocked(firestore.addDoc).mockResolvedValue({ id: 'mock-id' } as any);

    const result = await saveScanRecord('test-user', mockRecord as any);

    expect(firestore.addDoc).toHaveBeenCalled();
    expect(result).toBe('mock-id');

    const call = vi.mocked(firestore.addDoc).mock.calls[0];
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

    vi.mocked(firestore.addDoc).mockRejectedValue(new Error('Firestore error'));

    await expect(saveScanRecord('test-user', mockRecord as any)).rejects.toThrow();
  });
});
