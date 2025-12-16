import { describe, it, expect } from 'vitest'
import { fallbackAnalysis } from '@/lib/fallbackAnalysis'
import { parseLlmResponse } from '@/lib/parseLlm'
import { parseTipsFromLlm } from '@/lib/tipsParser'

// Helper to fill default nutrition values
function makeNutrition(data: Partial<ReturnType<typeof fallbackAnalysis> extends { [key: string]: any } ? any : any>) {
  return {
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fat: 0,
    sodium: 0,
    fiber: 0,
    totalSugars: 0,
    condition: 'both' as const,
    addedSugars: 0,
    saturatedFat: 0,
    potassium: 0,
    servingSize: 'meal',
    ...data
  }
}

describe('fallbackAnalysis - main flows', () => {
  it('marks as Risky for high sodium/carbs for diabetes', () => {
    const out = fallbackAnalysis(
      makeNutrition({ condition: 'diabetes', sodium: 25, carbohydrates: 21 }),
      'reni'
    )
    expect(out.prediction).toBe('Risky')
  })

  it('returns Safe for low values', () => {
    const out = fallbackAnalysis(
      makeNutrition({ condition: 'both', sodium: 1, carbohydrates: 1 }),
      'reni'
    )
    expect(out.prediction).toBe('Safe')
  })

  it('grams: high carbs or sodium triggers risky', () => {
    const cases = [
      makeNutrition({ condition: 'diabetes', carbohydrates: 75, servingSize: 'meal' }),
      makeNutrition({ condition: 'both', sodium: 500 })
    ]
    cases.forEach(input => {
      const out = fallbackAnalysis(input, 'grams')
      expect(out.prediction).toBe('Risky')
    })
  })
})

describe('parseLlmResponse - main flows', () => {
  it('parses valid JSON correctly', () => {
    const output = '```json\n{ "prediction": "Safe", "reasoning": "ok"}\n```'
    const parsed = parseLlmResponse(output)
    expect(parsed.prediction).toBe('Safe')
  })

  it('falls back to Risky if text contains warning words', () => {
    const text = 'high sodium and not recommended for hypertension'
    const parsed = parseLlmResponse(text)
    expect(parsed.prediction).toBe('Risky')
  })

  it('falls back to Safe when text is fine', () => {
    const text = 'This food looks good for your diet'
    const parsed = parseLlmResponse(text)
    expect(parsed.prediction).toBe('Safe')
  })
})

describe('parseTipsFromLlm - main flows', () => {
  it('extracts tips from JSON string or wrapper', () => {
    const examples = [
      '[{"content":"x"},{"content":"y"}]',
      JSON.stringify({ response: '[{"content":"a"},{"content":"b"}]' })
    ]
    examples.forEach(txt => {
      const out = parseTipsFromLlm(txt)
      expect(out).toBeDefined()
      expect(out!.length).toBeGreaterThan(0)
    })
  })

  it('returns null if no tips found', () => {
    const out = parseTipsFromLlm('No tips here')
    expect(out).toBeNull()
  })
})
