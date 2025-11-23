
import { describe, it, expect, vi } from 'vitest';
import { createAuthAuditLog, createScanAuditLog, createProfileAuditLog } from '@/admin/lib/auditLog';

vi.mock('firebase/firestore');

describe('Audit Logs', () => {
  it('should create auth audit log for login', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-123' } as any);

    await createAuthAuditLog(
      'user-123',
      'user.login',
      'User logged in',
      'success',
      { email: 'test@example.com' }
    );

    expect(addDoc).toHaveBeenCalled();
    const call = vi.mocked(addDoc).mock.calls[0];
    // second argument is the payload
    expect(call[1]).toEqual(expect.objectContaining({ category: 'auth', action: 'user.login', status: 'success' }));
  });

  it('should create scan audit log', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-456' } as any);

    await createScanAuditLog(
      'user-456',
      'scan.food',
      'Food scanned',
      'success',
      { foodName: 'Apple', condition: 'diabetes' }
    );

    expect(addDoc).toHaveBeenCalled();
    // Find the call that contains the scan category (mock may be called multiple times)
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1]);
    const found = calls.find(payload => payload && payload.category === 'scan');
    expect(found).toBeDefined();
    expect(found).toEqual(expect.objectContaining({ category: 'scan', action: 'scan.food' }));
  });

  it('should create profile audit log', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-789' } as any);

    await createProfileAuditLog(
      'user-789',
      'profile.update',
      'Profile updated',
      'success',
      { field: 'demographics' }
    );

    expect(addDoc).toHaveBeenCalled();
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1]);
    const found = calls.find(payload => payload && payload.category === 'profile');
    expect(found).toBeDefined();
    expect(found).toEqual(expect.objectContaining({ category: 'profile', action: 'profile.update' }));
  });
});
