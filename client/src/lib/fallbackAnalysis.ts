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

  if (sodium >= 460) {
    isRisky = true
    reasons.push(`High sodium content (${sodium}mg) exceeds 20% DV per serving`)
  }

  if (condition === 'diabetes' || condition === 'both') {
    if (carbohydrates > 60) {
      isRisky = true
      reasons.push(`Carbohydrate content (${carbohydrates}g) exceeds recommended meal range of 30-60g`)
    } else if (carbohydrates > 30 && servingSize?.toLowerCase().includes('snack')) {
      isRisky = true
      reasons.push(`Carbohydrate content (${carbohydrates}g) exceeds recommended snack range of 15-30g`)
    }
  }

  if (addedSugars && addedSugars > 10) {
    isRisky = true
    reasons.push(`High added sugars (${addedSugars}g) exceeds 10g per serving threshold`)
  }

  if (saturatedFat && calories) {
    const satFatCalories = saturatedFat * 9
    const satFatPercentage = (satFatCalories / calories) * 100
    if (satFatPercentage > 10) {
      isRisky = true
      reasons.push(`Saturated fat (${saturatedFat}g) exceeds 10% of calories`)
    }
  }

  if (condition === 'hypertension' || condition === 'both') {
    if (sodium > 1500 / 3) {
      isRisky = true
      reasons.push(`Sodium content (${sodium}mg) exceeds recommended per-meal limit for hypertension`)
    }
  }

  if (potassium) {
    reasons.push(`Contains ${potassium}mg potassium (beneficial for blood pressure control if no kidney issues)`)
  }

  if (isRisky) {
    return {
      prediction: 'Risky',
      reasoning: reasons.join('. '),
      healthTip: [
        { content: 'Choose lower-sodium alternatives when available.' },
        { content: condition?.includes('diabetes') ? 'Monitor total carbohydrates carefully.' : 'Watch portion sizes.' },
        { content: 'Consider splitting portions for better nutrient management.' },
        { content: 'Balance with fiber-rich vegetables when possible.' },
        { content: 'Track daily totals of key nutrients (sodium, carbs, sugars).' },
      ],
    }
  }

  return {
    prediction: 'Safe',
    reasoning: `Within recommended limits: ${reasons.length ? reasons.join('. ') : 'all nutrient levels acceptable'}`,
    healthTip: [
      { content: 'Continue monitoring portion sizes.' },
      { content: 'Maintain balanced nutrient intake across meals.' },
      { content: 'Include variety in your diet for complete nutrition.' },
      { content: 'Stay hydrated throughout the day.' },
      { content: 'Regular physical activity supports healthy metabolism.' },
    ],
  }
}
