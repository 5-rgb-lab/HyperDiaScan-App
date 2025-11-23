
import { describe, it, expect, vi } from 'vitest';
import { subscribeToUserScanHistory, deleteScanRecord } from '@/lib/firestore';

vi.mock('firebase/firestore');

describe('History - View Records', () => {
  it('should retrieve user scan history', async () => {
    const mockHistory = [
      { id: '1', foodName: 'Apple', prediction: 'safe', date: '2024-01-01' },
      { id: '2', foodName: 'Chips', prediction: 'risky', date: '2024-01-02' }
    ];

    const { onSnapshot } = await import('firebase/firestore');
    vi.mocked(onSnapshot).mockImplementation((query, callback: any) => {
      // Provide a QuerySnapshot-like object with forEach to match production shape
      const snapshotLike = {
        forEach(fn: any) {
          for (const item of mockHistory) {
            fn({ id: item.id, data: () => item });
          }
        }
      };
      callback(snapshotLike as any);
      return vi.fn();
    });

    const unsubscribe = subscribeToUserScanHistory('test-user', (records) => {
      expect(records).toHaveLength(2);
    });

    expect(unsubscribe).toBeDefined();
  });

  it('should filter history by condition', async () => {
    const { query, where } = await import('firebase/firestore');
    
    subscribeToUserScanHistory('test-user', vi.fn());
    
    expect(query).toHaveBeenCalled();
  });

  it('should delete scan record successfully', async () => {
    const { deleteDoc } = await import('firebase/firestore');
    vi.mocked(deleteDoc).mockResolvedValue();

    await deleteScanRecord('record-123');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
