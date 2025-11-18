import { AnalyzeFoodRequest, UserProfile } from '@shared/schema'

export function buildPrompt(nutrition: AnalyzeFoodRequest, user: UserProfile): string {
  const heightM = user.demographics.heightCm / 100;
  const bmi = user.demographics.weightKg / (heightM * heightM);
  const diabetesInfo = user.primaryCondition === 'diabetes' || user.primaryCondition === 'both'
    ? `BS: ${user.diabetesStatus?.bloodSugar ?? 'unknown'} mg/dL`
    : '';
  const bpInfo = user.primaryCondition === 'hypertension' || user.primaryCondition === 'both'
    ? `BP: ${user.hypertensionStatus?.bloodPressure?.systolic ?? 'unknown'}/${user.hypertensionStatus?.bloodPressure?.diastolic ?? 'unknown'}`
    : '';

  return `Assess if this food is Safe or Risky for the user.

USER: ${user.name}, ${user.demographics.age}yo, BMI ${bmi.toFixed(1)}, ${user.primaryCondition}${user.otherConditions.kidneyDisease ? ', KD' : ''}${user.otherConditions.heartDisease ? ', HD' : ''}
${diabetesInfo ? `DM: ${diabetesInfo}` : ''}${bpInfo ? ` HT: ${bpInfo}` : ''}

FOOD: ${nutrition.foodName || 'Unnamed'} | Cal: ${nutrition.calories} | Carbs: ${nutrition.carbohydrates}g | Protein: ${nutrition.protein}g | Fat: ${nutrition.fat}g | Na: ${nutrition.sodium}mg | Sugars: ${nutrition.totalSugars ?? '?'}g | Fiber: ${nutrition.fiber}g

JSON: {"prediction": "Safe"|"Risky", "reasoning": "explain how this food impacts the user's ${user.primaryCondition} condition, blood levels${diabetesInfo ? ' (BS)' : ''}${bpInfo ? ' (BP)' : ''}, and BMI"}`
}


export function buildTipsPrompt(userProfile?: UserProfile, todaysScans: any[] = [], counts: { safe: number; risky: number } = { safe: 0, risky: 0 }): string {
  const userDemographics = userProfile?.demographics
  const bmiString = userDemographics
    ? userDemographics.weightKg && userDemographics.heightCm
      ? (userDemographics.weightKg / ((userDemographics.heightCm / 100) ** 2)).toFixed(1)
      : 'unknown'
    : 'unknown'

  return `Generate 5 short actionable health tips.

USER: ${userProfile?.name ?? 'unknown'}, ${userDemographics?.age ?? 'unknown'}yo, BMI ${bmiString}, ${userProfile?.primaryCondition ?? 'unknown'}
TODAY: ${counts.safe} safe, ${counts.risky} risky scans (${todaysScans.length} total)

Tips must address ${userProfile?.primaryCondition ?? 'their health'} and today's eating patterns. JSON: [{"content":"tip 1"}, {"content":"tip 2"}, {"content":"tip 3"}, {"content":"tip 4"}, {"content":"tip 5"}]`
}

export function buildImagePrompt(user: UserProfile, fileName?: string): string {
  return `Extract nutrition facts from the image as JSON. <image>`;
}



