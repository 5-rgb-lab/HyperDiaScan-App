import { AnalyzeFoodRequest, HealthPrediction } from '@shared/schema'

export function fallbackAnalysis(data: AnalyzeFoodRequest): HealthPrediction {
  const {
    condition,
    sodium,
    carbohydrates,
    addedSugars,
    saturatedFat,
    calories,
    potassium,
    servingSize,
  } = data

  const reasons: string[] = []
  let isRisky = false

  // RENI thresholds for limit nutrients (based on %RENI)
  const HIGH_THRESHOLD = 20 // ≥20% RENI is high
  const MODERATE_THRESHOLD = 10 // 10–19% RENI is moderate
  const LOW_THRESHOLD = 5 // ≤5% RENI is low

  // Sodium check
  if (sodium >= HIGH_THRESHOLD) {
    isRisky = true
    reasons.push(`High sodium content (${sodium}% RENI) exceeds 20% RENI per serving`)
  }

  // Carbohydrates check for diabetes
  if (condition === 'diabetes' || condition === 'both') {
    if (carbohydrates >= HIGH_THRESHOLD) {
      isRisky = true
      reasons.push(`High carbohydrate content (${carbohydrates}% RENI) may impact blood sugar`)
    } else if (carbohydrates >= MODERATE_THRESHOLD && servingSize?.toLowerCase().includes('snack')) {
      isRisky = true
      reasons.push(`Moderate carbohydrate content (${carbohydrates}% RENI) exceeds snack recommendation`)
    }
  }

  // Added sugars check
  if (addedSugars && addedSugars >= HIGH_THRESHOLD) {
    isRisky = true
    reasons.push(`High added sugars (${addedSugars}% RENI) exceeds recommended limit`)
  }

  // Saturated fat check
  if (saturatedFat && saturatedFat >= HIGH_THRESHOLD) {
    isRisky = true
    reasons.push(`Saturated fat (${saturatedFat}% RENI) exceeds 20% RENI per serving`)
  }

  // Hypertension-specific sodium check
  if (condition === 'hypertension' || condition === 'both') {
    if (sodium >= HIGH_THRESHOLD) {
      isRisky = true
      reasons.push(`Sodium content (${sodium}% RENI) exceeds recommended limit for hypertension`)
    }
  }

  // Potassium benefit
  if (potassium && potassium > 0) {
    reasons.push(`Contains ${potassium}% RENI potassium (beneficial for blood pressure control if no kidney issues)`)
  }

  if (isRisky) {
    return {
      prediction: 'Risky',
      reasoning: reasons.join('. '),
      healthTip: [
        { content: 'Choose lower-sodium alternatives when available.' },
        { content: condition?.includes('diabetes') ? 'Monitor carbohydrate intake carefully.' : 'Watch portion sizes.' },
        { content: 'Balance meals with fiber-rich vegetables when possible.' },
        { content: 'Consider splitting portions for better nutrient management.' },
        { content: 'Track daily totals of key nutrients (sodium, carbs, sugars).' },
      ],
    }
  }

  return {
    prediction: 'Safe',
    reasoning: `Within recommended RENI limits: ${reasons.length ? reasons.join('. ') : 'all nutrient levels acceptable'}`,
    healthTip: [
      { content: 'Continue monitoring portion sizes.' },
      { content: 'Maintain balanced nutrient intake across meals.' },
      { content: 'Include variety in your diet for complete nutrition.' },
      { content: 'Stay hydrated throughout the day.' },
      { content: 'Regular physical activity supports healthy metabolism.' },
    ],
  }
}
