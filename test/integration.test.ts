
import { describe, it, expect, vi } from 'vitest';
import { signUpWithEmail, signInWithEmail } from '@/lib/auth';
import { analyzeFood } from '@/lib/analyzeFood';
import { saveScanRecord } from '@/lib/firestore';

vi.mock('firebase/auth');
vi.mock('firebase/firestore');
vi.mock('@/lib/analyzeFood');
vi.mock('@/admin/lib/auditLog');

describe('Integration Tests', () => {
  it('should complete full user journey: signup -> login -> scan -> save', async () => {
    // Sign up
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'new-user', email: 'test@example.com' }
    } as any);
    const { getDoc, setDoc } = await import('firebase/firestore');
    // Simulate no existing profile so createUserProfile will write a new document
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    vi.mocked(setDoc).mockResolvedValue(undefined as any);

    await signUpWithEmail('test@example.com', 'password123', 'Test User');

    // Login
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'new-user', email: 'test@example.com' }
    } as any);

    // Mock getDoc for active profile check during sign in
    const { getDoc: getDoc2 } = await import('firebase/firestore');
    vi.mocked(getDoc2).mockResolvedValue({ exists: () => true, data: () => ({ active: true }) } as any);

    // Ensure audit log helper (mocked module) returns a promise so .catch works
    const { createAuthAuditLog } = await import('@/admin/lib/auditLog');
    if (createAuthAuditLog) (vi.mocked(createAuthAuditLog) as any).mockResolvedValue(undefined as any);

    await signInWithEmail('test@example.com', 'password123');

    // Scan food (mocked)
    (vi.mocked(analyzeFood) as any).mockResolvedValue({
      prediction: 'Safe',
      reasoning: 'Good choice',
      healthTip: [{ content: 'Good choice' }]
    });

    const analysis = await analyzeFood({
      foodName: 'Apple',
      calories: 95,
      carbohydrates: 25,
      protein: 0.5,
      fat: 0.3,
      sodium: 2,
      fiber: 4,
      totalSugars: 19,
      condition: 'diabetes'
    } as any, null as any);

    expect(analysis.prediction).toBe('Safe');

    // Save record
    const { addDoc } = await import('firebase/firestore');
    vi.mocked(addDoc).mockResolvedValue({ id: 'record-123' } as any);

    const recordId = await saveScanRecord('new-user', {
      foodName: 'Apple',
      condition: 'diabetes',
      prediction: 'Safe',
      nutritionData: {
        calories: 95,
        carbohydrates: 25,
        protein: 0.5,
        fat: 0.3,
        sodium: 2,
        fiber: 4,
        totalSugars: 19
      }
    } as any);

    expect(recordId).toBe('record-123');
  });
});
