// @ts-ignore 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthAuditLog, createScanAuditLog, createProfileAuditLog, createHistoryAuditLog, createAuditLog } from '@/admin/lib/auditLog';

vi.mock('firebase/firestore');

describe('Audit Logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.category === 'scan');
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
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.category === 'profile');
    expect(found).toBeDefined();
    expect(found).toEqual(expect.objectContaining({ category: 'profile', action: 'profile.update' }));
  });

  it('should create history audit log', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-hist-1' } as any);

    await createHistoryAuditLog(
      'user-hist-1',
      'history.saved',
      'History saved',
      'success',
      { recordId: 'rec-123' }
    );

    expect(addDoc).toHaveBeenCalled();
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.action === 'history.saved');
    expect(found).toBeDefined();
  });

  it('should handle createAuditLog error gracefully', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

    const result = await createAuditLog({
      userId: 'user-error',
      category: 'auth',
      action: 'user.logout',
      description: 'Test error',
      status: 'error'
    });

    expect(result).toBe(false);
  });

  it('should create audit log with error status and error severity', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-error' } as any);

    await createAuditLog({
      userId: 'user-err-123',
      category: 'system',
      action: 'system.error',
      description: 'System error occurred',
      status: 'error',
      severity: 'error'
    });

    expect(addDoc).toHaveBeenCalled();
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.status === 'error');
    expect(found?.severity).toBe('error');
  });

  it('should create history delete audit log', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-delete' } as any);

    await createHistoryAuditLog(
      'user-del',
      'history.deleted',
      'History item deleted',
      'success'
    );

    expect(addDoc).toHaveBeenCalled();
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.action === 'history.deleted');
    expect(found).toBeDefined();
  });

  it('should create profile create audit log', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-create' } as any);

    await createProfileAuditLog(
      'user-create',
      'profile.create',
      'Profile created',
      'success'
    );

    expect(addDoc).toHaveBeenCalled();
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.action === 'profile.create');
    expect(found).toBeDefined();
  });

  it('should create scan saved audit log', async () => {
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'log-saved' } as any);

    await createScanAuditLog(
      'user-saved',
      'scan.saved',
      'Scan saved to history',
      'success'
    );

    expect(addDoc).toHaveBeenCalled();
    const calls = vi.mocked(addDoc).mock.calls.map(c => c[1] as any);
    const found = calls.find((payload: any) => payload && payload.action === 'scan.saved');
    expect(found).toBeDefined();
  });
});
