
import { describe, it, expect, vi } from 'vitest';
import { deleteScanRecord } from '@/lib/firestore';

vi.mock('firebase/firestore');

describe('History - View Records', () => {
  it('should delete scan record successfully', async () => {
    const { deleteDoc } = await import('firebase/firestore');
    vi.mocked(deleteDoc).mockResolvedValue();

    await deleteScanRecord('record-123');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
