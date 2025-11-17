import { HealthPrediction, healthPredictionSchema } from '@shared/schema'

function getDefaultHealthTips(isRisky: boolean) {
  if (isRisky) {
    return [
      { content: 'Choose lower-sodium or lower-sugar alternatives.' },
      { content: 'Avoid processed foods with hidden sodium.' },
      { content: 'Stay hydrated to help regulate blood pressure.' },
      { content: 'Pair carbs with protein or fiber to slow absorption.' },
      { content: 'Monitor portion sizes for better control.' },
    ]
  }

  return [
    { content: 'Maintain balanced meals across the day.' },
    { content: 'Stay consistent with meal timing.' },
    { content: 'Include vegetables for fiber and nutrients.' },
    { content: 'Keep salt and sugar within daily limits.' },
    { content: 'Stay hydrated and active regularly.' },
  ]
}

export function parseLlmResponse(output: string): HealthPrediction {
  // Try several strategies to extract JSON from a noisy LLM output.
  const extractJson = (text: string): string | null => {
    const fenceJson = text.match(/```(?:json\n)?([\s\S]*?)```/i)
    if (fenceJson && fenceJson[1]) return fenceJson[1].trim()

    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) return objMatch[0]

    const arrMatch = text.match(/\[[\s\S]*\]/)
    if (arrMatch) return arrMatch[0]

    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.slice(firstBrace, lastBrace + 1)
    }

    return null
  }

  try {
    const jsonText = extractJson(output)
    if (!jsonText) throw new Error('No JSON found in model response')

    let parsedJson: any
    try {
      parsedJson = JSON.parse(jsonText)
    } catch (err) {
      const sanitized = jsonText
        .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
        .replace(/,\s*([}\]])/g, '$1')
      parsedJson = JSON.parse(sanitized)
    }

    const healthTip = parsedJson.healthTip || getDefaultHealthTips(parsedJson.prediction === 'Risky')

    return healthPredictionSchema.parse({
      ...parsedJson,
      healthTip,
    })
  } catch (err) {
    console.warn('⚠️ LLaMA output parsing failed, using heuristic fallback:', err)
    const lowered = output.toLowerCase()

    if (/risky|not recommended|avoid|high sodium|high sugar|high carbohydrate/.test(lowered)) {
      return {
        prediction: 'Risky',
        reasoning: output.trim(),
        healthTip: getDefaultHealthTips(true),
      }
    }

    return {
      prediction: 'Safe',
      reasoning: output.trim(),
      healthTip: getDefaultHealthTips(false),
    }
  }
}
