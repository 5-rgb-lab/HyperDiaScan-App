import { AnalyzeFoodRequest, HealthPrediction } from '@shared/schema'

/**
 * Fallback analysis that supports both RENI (%) and grams units.
 * - If `unit === 'reni'` the function uses the existing RENI-based heuristics.
 * - If `unit === 'grams'` it uses the gram-based rules provided in the project.
 */
export function fallbackAnalysis(data: AnalyzeFoodRequest, unit: 'reni' | 'grams' = 'reni'): HealthPrediction {
  const {
    condition,
    sodium,
    carbohydrates,
    addedSugars,
    saturatedFat,
    calories,
    potassium,
    servingSize,
  } = data as any

  const reasons: string[] = []
  let isRisky = false

  if (unit === 'reni') {
    // RENI thresholds for limit nutrients (based on %RENI)
    const HIGH_THRESHOLD = 20 // ≥20% RENI is high
    const MODERATE_THRESHOLD = 10 // 10–19% RENI is moderate

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
      } else if (carbohydrates >= MODERATE_THRESHOLD && servingSize?.toLowerCase?.()?.includes('snack')) {
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

  // -------------------
  // Gram-based heuristics
  // -------------------
  // Thresholds (per-serving unless noted)
  const SODIUM_HIGH_PER_SERVING = 460 // mg (≈20% DV)
  const ADDED_SUGAR_HIGH_PER_SERVING = 10 // g
  const CARB_SNACK_MAX = 30 // g
  const CARB_MEAL_MAX = 60 // g
  const SAT_FAT_PERCENT_CALORIES_LIMIT = 10 // percent of calories (saturated fat)

  // Sodium
  if (typeof sodium === 'number') {
    if (sodium >= SODIUM_HIGH_PER_SERVING) {
      isRisky = true
      reasons.push(`High sodium per serving (${sodium} mg) — ≥${SODIUM_HIGH_PER_SERVING} mg is considered high`) 
    } else if ((condition === 'hypertension' || condition === 'both') && sodium > SODIUM_HIGH_PER_SERVING * 0.6) {
      // For hypertension patients, be more conservative
      reasons.push(`Elevated sodium per serving (${sodium} mg) — consider lower-sodium options for blood pressure control`)
    }
  }

  // Added sugars
  if (typeof addedSugars === 'number') {
    if (addedSugars > ADDED_SUGAR_HIGH_PER_SERVING) {
      isRisky = true
      reasons.push(`High added sugars per serving (${addedSugars} g) — >${ADDED_SUGAR_HIGH_PER_SERVING} g is high`) 
    }
  }

  // Carbohydrates (for diabetes)
  if ((condition === 'diabetes' || condition === 'both') && typeof carbohydrates === 'number') {
    const ss = (servingSize || '').toString().toLowerCase();
    const isSnack = ss.includes('snack') || ss.includes('snack-sized')

    if (isSnack) {
      if (carbohydrates > CARB_SNACK_MAX) {
        isRisky = true
        reasons.push(`High carbohydrate for a snack (${carbohydrates} g) — typical snack range is ${15}-${CARB_SNACK_MAX} g`) 
      }
    } else {
      if (carbohydrates > CARB_MEAL_MAX) {
        isRisky = true
        reasons.push(`High carbohydrate for a meal (${carbohydrates} g) — meals typically range ${30}-${CARB_MEAL_MAX} g`) 
      } else if (carbohydrates >= 30 && carbohydrates <= CARB_MEAL_MAX) {
        reasons.push(`Carbohydrates (${carbohydrates} g) are within a typical meal range (${30}-${CARB_MEAL_MAX} g). Monitor portion size based on blood sugar control.`)
      }
    }
  }

  // Saturated fat (estimate percent of calories if calories are provided)
  if (typeof saturatedFat === 'number') {
    if (typeof calories === 'number' && calories > 0) {
      const satCalories = saturatedFat * 9 // grams -> calories
      const pct = (satCalories / calories) * 100
      if (pct >= SAT_FAT_PERCENT_CALORIES_LIMIT) {
        isRisky = true
        reasons.push(`High saturated fat relative to calories (${pct.toFixed(0)}% of kcal) — aim for <${SAT_FAT_PERCENT_CALORIES_LIMIT}% of calories from saturated fat`)
      }
    } else {
      // Fallback threshold when calories missing: large saturated fat gram amounts
      if (saturatedFat >= 10) {
        isRisky = true
        reasons.push(`High saturated fat (${saturatedFat} g) — consider lower-saturated-fat options`)
      }
    }
  }

  // Potassium benefit
  if (typeof potassium === 'number' && potassium > 0) {
    reasons.push(`Contains ${potassium} mg potassium — beneficial for blood pressure when kidney function allows`)
  }

  if (isRisky) {
    return {
      prediction: 'Risky',
      reasoning: reasons.join('. '),
      healthTip: [
        { content: 'Choose lower-sodium alternatives and check serving sizes.' },
        { content: 'For diabetes, prefer lower-carbohydrate options or split portions.' },
        { content: 'Limit added sugars and high-saturated-fat foods.' },
        { content: 'Increase potassium-rich vegetables where appropriate.' },
        { content: 'Track daily intakes to stay within recommended limits.' },
      ],
    }
  }

  return {
    prediction: 'Safe',
    reasoning: `Within recommended limits for the provided grams-based heuristics: ${reasons.length ? reasons.join('. ') : 'no immediate concerns'}`,
    healthTip: [
      { content: 'Continue choosing balanced meals with vegetables and lean proteins.' },
      { content: 'Watch portion sizes and added sugars.' },
      { content: 'Prefer whole foods and minimize processed high-sodium items.' },
      { content: 'If you have hypertension, aim for lower-sodium choices overall.' },
      { content: 'Consult care team for individualized nutrient targets.' },
    ],
  }
}
