import { describe, it, expect } from 'vitest'
import { buildPrompt, buildTipsPrompt, buildImagePrompt } from '@/lib/promptBuilder'
import { parseLlmResponse } from '@/lib/parseLlm'
import { fallbackAnalysis } from '@/lib/fallbackAnalysis'
import { parseTipsFromLlm } from '@/lib/tipsParser'

// Minimal user profile shape matching shared schema expectations
const sampleUser: any = {
  name: 'Test User',
  demographics: { age: 35, heightCm: 170, weightKg: 70 },
  primaryCondition: 'diabetes',
  otherConditions: { kidneyDisease: false, heartDisease: false },
  diabetesStatus: { bloodSugar: 110 },
  hypertensionStatus: { bloodPressure: { systolic: 120, diastolic: 80 } },
}

describe('Coverage helpers for Buildprompt', () => {
  it('buildPrompt returns a string for grams and reni modes and includes units', () => {
    const nutrition = {
      foodName: 'Apple',
      calories: 95,
      carbohydrates: 25,
      protein: 0.5,
      fat: 0.3,
      sodium: 2,
      fiber: 4,
      totalSugars: 19,
      units: { calories: 'kcal', sodium: 'mg' }
    }

    const gramsPrompt = buildPrompt(nutrition as any, sampleUser as any, 'grams')
    expect(typeof gramsPrompt).toBe('string')
    expect(gramsPrompt).toContain('FOOD DATA')
    expect(gramsPrompt).toContain('Calories: 95')

    const reniPrompt = buildPrompt(nutrition as any, sampleUser as any, 'reni')
    expect(reniPrompt).toContain('RENI-BASED')
    expect(reniPrompt).toContain('FOOD DATA (RENI-BASED)')
  })

  it('buildTipsPrompt and buildImagePrompt produce non-empty prompts', () => {
    const tips = buildTipsPrompt(sampleUser as any, [], { safe: 2, risky: 1 })
    expect(tips).toContain('Generate 5 short actionable health tips')

    const img = buildImagePrompt(sampleUser as any, 'photo.jpg')
    expect(img).toContain('<image>')
  })
  // parseLlmResponse, fallbackAnalysis and parseTipsFromLlm are covered in fallback.test.ts
})
