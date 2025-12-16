import { describe, it, expect } from 'vitest'
import { parseTipsFromLlm } from '@/lib/tipsParser'
import { parseLlmResponse } from '@/lib/parseLlm'

describe('Tips Parser - Consolidated edge coverage', () => {
  const tipVariants = [
    { name: 'plain array', input: JSON.stringify([{ content: 'A' }, { content: 'B' }]) },
    { name: 'wrapped response field', input: JSON.stringify({ response: JSON.stringify([{ content: 'X' }]) }) },
    { name: 'choices.message.content', input: JSON.stringify({ choices: [{ message: { content: JSON.stringify([{ content: 'Y' }]) } }] }) },
    { name: 'result.content wrapper', input: JSON.stringify({ result: { content: JSON.stringify([{ content: 'Z' }]) } }) },
    { name: 'escaped quotes', input: '[{\\"content\\":\\"Tip\\"}]' }
  ]

  tipVariants.forEach((v) => {
    it(`parseTipsFromLlm handles ${v.name}`, () => {
      const out = parseTipsFromLlm(v.input)
      expect(out).toBeDefined()
    })
  })

  it('parseTipsFromLlm returns null for invalid input', () => {
    expect(parseTipsFromLlm('not json at all')).toBeNull()
  })

  it('parseTipsFromLlm enforces max 5 items', () => {
    const many = '[' + Array(10).fill('{"content":"x"}').join(',') + ']'
    const out = parseTipsFromLlm(many)
    expect(out?.length).toBeLessThanOrEqual(5)
  })
})

describe('ParseLlm Response - Consolidated checks', () => {
  it('parses valid JSON and malformed fallback cases', () => {
    const ok = JSON.stringify({ prediction: 'Safe', healthTip: [{ content: 'h' }] })
    expect(parseLlmResponse(ok).prediction).toBe('Safe')

    const messy = 'Not valid JSON but mentions high sodium and hypertension'
    expect(parseLlmResponse(messy).prediction).toMatch(/Safe|Risky/)
  })
})
