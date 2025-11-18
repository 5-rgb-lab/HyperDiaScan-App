import { HealthPrediction, NutritionData, healthPredictionSchema } from '@shared/schema'

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

/**
 * Parse LLM response from image OCR analysis.
 * Expected to include both nutrition facts and health prediction.
 * Returns HealthPrediction with attached nutritionData.
 */
export function parseImageLlmResponse(output: string): HealthPrediction & { nutritionData?: NutritionData } {
  const extractJson = (text: string): string | null => {
    const fenceJson = text.match(/```(?:json\n)?([\s\S]*?)```/i)
    if (fenceJson && fenceJson[1]) return fenceJson[1].trim()

    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) return objMatch[0]

    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.slice(firstBrace, lastBrace + 1)
    }

    return null
  }

  try {
    const jsonText = extractJson(output)
    if (!jsonText) throw new Error('No JSON found in image model response')

    let parsedJson: any
    try {
      parsedJson = JSON.parse(jsonText)
    } catch (err) {
      const sanitized = jsonText
        .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
        .replace(/,\s*([}\]])/g, '$1')
      parsedJson = JSON.parse(sanitized)
    }

    // If the model returned a full health prediction, use it; otherwise we'll
    // treat the JSON as nutrition-only and attach a minimal prediction so callers
    // (like analyzeImage) can perform a follow-up analysis.
    const hasPrediction = typeof parsedJson.prediction === 'string' && typeof parsedJson.reasoning === 'string'

    const healthTip = parsedJson.healthTip || getDefaultHealthTips(parsedJson.prediction === 'Risky')

    // Extract nutrition facts if present (support either a nested `nutritionFacts`
    // object or nutrition fields at the top level)
    const nutritionFacts = parsedJson.nutritionFacts || parsedJson
    const nutritionData: NutritionData = {
      calories: parseFloat(nutritionFacts.calories) || 0,
      carbohydrates: parseFloat(nutritionFacts.carbohydrates) || 0,
      protein: parseFloat(nutritionFacts.protein) || 0,
      fat: parseFloat(nutritionFacts.fat) || 0,
      sodium: parseFloat(nutritionFacts.sodium) || 0,
      fiber: parseFloat(nutritionFacts.fiber) || 0,
      totalSugars: parseFloat(nutritionFacts.totalSugars) || 0,
      addedSugars: parseFloat(nutritionFacts.addedSugars),
      saturatedFat: parseFloat(nutritionFacts.saturatedFat),
      transFat: parseFloat(nutritionFacts.transFat),
      potassium: parseFloat(nutritionFacts.potassium),
      cholesterol: parseFloat(nutritionFacts.cholesterol),
      servingSize: nutritionFacts.servingSize || '',
      servingsPerContainer: parseFloat(nutritionFacts.servingsPerContainer) || 0,
    }

    // If the parsed JSON included a full prediction, validate it. Otherwise
    // return a minimal placeholder prediction and include the nutrition data
    // so the caller can run the follow-up analysis.
    if (hasPrediction) {
      const prediction = healthPredictionSchema.parse({
        ...parsedJson,
        healthTip,
      })

      return {
        ...prediction,
        nutritionData,
      }
    }

    // Minimal placeholder prediction when only nutrition facts were returned
    const placeholder = {
      prediction: 'Safe' as const,
      reasoning: 'Nutrition facts extracted from image; follow-up analysis required.',
      healthTip: getDefaultHealthTips(false),
    }

    return {
      ...placeholder,
      nutritionData,
    }
  } catch (err) {
    console.warn('⚠️ Image LLM output parsing failed:', err)
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
