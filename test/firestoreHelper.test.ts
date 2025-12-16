import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('firebase/firestore')
vi.mock('@/lib/firebase', () => ({ db: {} }))

/* ---------------------- Firestore Helpers ---------------------- */

describe('Firestore helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('saveScanRecord calls addDoc and updateDoc and returns id', async () => {
    const { addDoc, updateDoc, doc } = await import('firebase/firestore')
    vi.mocked(addDoc).mockResolvedValue({ id: 'r1' } as any)
    vi.mocked(updateDoc).mockResolvedValue(undefined as any)
    vi.mocked(doc).mockReturnValue('userDoc' as any)

    const { saveScanRecord } = await import('@/lib/firestore')

    const id = await saveScanRecord(
      'user-1',
      { foodName: 'Test', condition: 'diabetes', prediction: 'Safe', nutritionData: {} } as any
    )

    expect(id).toBe('r1')
    expect(addDoc).toHaveBeenCalled()
    expect(updateDoc).toHaveBeenCalled()
  })

  it('saveScanRecord continues when image conversion fails', async () => {
    class ErrorFileReader {
      onload: any
      onerror: any
      readAsDataURL() {
        this.onerror(new Error('fail'))
      }
    }
    vi.stubGlobal('FileReader', ErrorFileReader as any)

    const { addDoc, updateDoc } = await import('firebase/firestore')
    vi.mocked(addDoc).mockResolvedValue({ id: 'r2' } as any)
    vi.mocked(updateDoc).mockResolvedValue(undefined as any)

    const { saveScanRecord } = await import('@/lib/firestore')
    const id = await saveScanRecord('user-1', { condition: 'diabetes' } as any, {} as File)

    expect(id).toBe('r2')
  })

  it('saveScanRecord logs updateDoc error but still resolves', async () => {
    const { addDoc, updateDoc } = await import('firebase/firestore')
    vi.mocked(addDoc).mockResolvedValue({ id: 'r3' } as any)
    vi.mocked(updateDoc).mockRejectedValue(new Error('update failed'))

    const { saveScanRecord } = await import('@/lib/firestore')
    await expect(saveScanRecord('user-1', { condition: 'diabetes' } as any)).resolves.toBe('r3')
  })

  it('getUserScanHistory returns parsed docs', async () => {
    const { getDocs } = await import('firebase/firestore')
    const fakeDocs = [
      { id: 'a', data: () => ({ foodName: 'A' }) },
      { id: 'b', data: () => ({ foodName: 'B' }) }
    ]
    vi.mocked(getDocs).mockResolvedValue({ forEach: (cb: any) => fakeDocs.forEach(cb) } as any)

    const { getUserScanHistory } = await import('@/lib/firestore')
    const res = await getUserScanHistory('user-1')

    expect(res.length).toBe(2)
    expect(res[0].id).toBe('a')
  })

  it('getAllScanHistory returns parsed docs', async () => {
    const { getDocs } = await import('firebase/firestore')
    vi.mocked(getDocs).mockResolvedValue({
      forEach: (cb: any) => cb({ id: 'x', data: () => ({}) })
    } as any)

    const { getAllScanHistory } = await import('@/lib/firestore')
    const res = await getAllScanHistory()

    expect(res[0].id).toBe('x')
  })

  it('deleteScanRecord throws when deleteDoc fails', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    vi.mocked(deleteDoc).mockRejectedValue(new Error('delete failed'))

    const { deleteScanRecord } = await import('@/lib/firestore')
    await expect(deleteScanRecord('bad-id')).rejects.toThrow()
  })

  it('getScanRecordsByCondition filters by condition', async () => {
    const { getDocs } = await import('firebase/firestore')
    vi.mocked(getDocs).mockResolvedValue({
      forEach: (cb: any) => cb({ id: 'c1', data: () => ({ condition: 'diabetes' }) })
    } as any)

    const { getScanRecordsByCondition } = await import('@/lib/firestore')
    const res = await getScanRecordsByCondition('user-1', 'diabetes')

    expect(res[0].id).toBe('c1')
  })

  it('subscribeToUserScanHistory calls onUpdate and returns unsubscribe', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementation((q: any, cb: any) => {
      cb({ forEach: (fn: any) => fn({ id: 's1', data: () => ({}) }) })
      return () => {}
    })

    const { subscribeToUserScanHistory } = await import('@/lib/firestore')
    const onUpdate = vi.fn()
    const unsub = subscribeToUserScanHistory('user-1', onUpdate)

    expect(typeof unsub).toBe('function')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('subscribeToUserProfile handles exists, missing, and error', async () => {
    const { onSnapshot } = await import('firebase/firestore')

    vi.mocked(onSnapshot).mockImplementationOnce((r: any, cb: any) => {
      cb({ exists: () => true, data: () => ({ name: 'A' }) })
      return () => {}
    })

    vi.mocked(onSnapshot).mockImplementationOnce((r: any, cb: any) => {
      cb({ exists: () => false })
      return () => {}
    })

    vi.mocked(onSnapshot).mockImplementationOnce((r: any, _cb: any, err: any) => {
      err(new Error('snap failed'))
      return () => {}
    })

    const { subscribeToUserProfile } = await import('@/lib/firestore')

    const fn1 = vi.fn()
    subscribeToUserProfile('u1', fn1)
    expect(fn1).toHaveBeenCalledWith({ name: 'A' })

    const fn2 = vi.fn()
    subscribeToUserProfile('u2', fn2)
    expect(fn2).toHaveBeenCalledWith(undefined)

    const fn3 = vi.fn()
    subscribeToUserProfile('u3', fn3)
    expect(fn3).toHaveBeenCalledWith(undefined)
  })

  it('updateUserHealthTips calls updateDoc', async () => {
    const { updateDoc, doc } = await import('firebase/firestore')
    vi.mocked(updateDoc).mockResolvedValue(undefined as any)
    vi.mocked(doc).mockReturnValue('userRef' as any)

    const { updateUserHealthTips } = await import('@/lib/firestore')
    await updateUserHealthTips('user-42', [{ content: 'tip' }])

    expect(updateDoc).toHaveBeenCalled()
  })
})

/* ------------------ Extra Branch Coverage ------------------ */

import { fallbackAnalysis } from '@/lib/fallbackAnalysis'
import { parseTipsFromLlm } from '@/lib/tipsParser'

describe('FallbackAnalysis and TipsParser branches', () => {
  it('flags high saturated fat relative to calories', () => {
    const res = fallbackAnalysis({ saturatedFat: 10, calories: 100 } as any, 'grams')
    expect(res.prediction).toBe('Risky')
    expect(res.reasoning).toContain('High saturated fat')
  })

  it('flags snack carbohydrate threshold', () => {
    const res = fallbackAnalysis(
      { condition: 'diabetes', carbohydrates: 35, servingSize: 'Snack-sized portion' } as any,
      'grams'
    )
    expect(res.prediction).toBe('Risky')
  })

  it('parseTipsFromLlm handles valid and invalid content', () => {
    const valid = JSON.stringify({
      choices: [{ message: { content: '[{"content":"A"}]' } }]
    })
    expect(parseTipsFromLlm(valid)?.length).toBe(1)
    expect(parseTipsFromLlm('no tips')).toBeNull()
  })
})
