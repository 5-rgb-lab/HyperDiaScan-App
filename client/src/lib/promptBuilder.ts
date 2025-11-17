import { AnalyzeFoodRequest, UserProfile } from '@shared/schema'

export function buildPrompt(nutrition: AnalyzeFoodRequest, user: UserProfile): string {
  // Calculate BMI safely
  const heightM = (user.demographics?.heightCm || 0) / 100
  const bmi = heightM > 0 && user.demographics?.weightKg ? user.demographics.weightKg / (heightM * heightM) : 0

  return `
You are a nutrition and health expert. 
Analyze if the following food is "Safe" or "Risky" for the user based on their full medical profile.

### USER PROFILE
Demographics:
- Name: ${user.name}
- Age: ${user.demographics?.age ?? 'unknown'} years
- Sex: ${user.demographics?.biologicalSex ?? 'unknown'}
- Height: ${user.demographics?.heightCm ?? 'unknown'} cm
- Weight: ${user.demographics?.weightKg ?? 'unknown'} kg
- BMI: ${bmi ? bmi.toFixed(1) : 'unknown'}
- Activity Level: ${user.demographics?.activityLevel ?? 'unknown'}

Medical Conditions:
- Primary Condition: ${user.primaryCondition}
- Other Conditions:
  - Kidney Disease: ${user.otherConditions?.kidneyDisease ? 'Yes' : 'No'}
  - Heart Disease: ${user.otherConditions?.heartDisease ? 'Yes' : 'No'}

${user.primaryCondition === 'diabetes' || user.primaryCondition === 'both' ? `
Diabetes Management:
- Blood Sugar Level: ${user.diabetesStatus?.bloodSugar ?? 'unknown'} mg/dL
- Medications: ${user.treatmentManagement?.diabetesMedication?.medications?.join(', ') || 'None'}` : ''}

${user.primaryCondition === 'hypertension' || user.primaryCondition === 'both' ? `
Hypertension Management:
- Blood Pressure: ${user.hypertensionStatus?.bloodPressure?.systolic ?? 'unknown'}/${user.hypertensionStatus?.bloodPressure?.diastolic ?? 'unknown'} mmHg
- Medications: ${user.treatmentManagement?.hypertensionMedication?.medications?.join(', ') || 'None'}` : ''}

### FOOD NUTRITION
- Food Name: ${nutrition.foodName || 'Unnamed Food'}
- Calories: ${nutrition.calories ?? 'unknown'} kcal
- Carbohydrates: ${nutrition.carbohydrates ?? 'unknown'} g
- Protein: ${nutrition.protein ?? 'unknown'} g
- Fat: ${nutrition.fat ?? 'unknown'} g
- Sodium: ${nutrition.sodium ?? 'unknown'} mg
- Fiber: ${nutrition.fiber ?? 'unknown'} g
- Total Sugars: ${nutrition.totalSugars ?? 'unknown'} g
- Added Sugars: ${nutrition.addedSugars ?? 'unknown'} g
- Saturated Fat: ${nutrition.saturatedFat ?? 'unknown'} g
- Trans Fat: ${nutrition.transFat ?? 'unknown'} g
- Potassium: ${nutrition.potassium ?? 'unknown'} mg
- Cholesterol: ${nutrition.cholesterol ?? 'unknown'} mg
- Serving Size: ${nutrition.servingSize ?? 'unspecified'}
- Servings / Container: ${nutrition.servingsPerContainer ?? 'unspecified'}

### TASK
Determine if this food is **Safe** or **Risky** for this user. 
Base your decision on:
1. Nutritional content vs medical conditions
2. Patient's current health metrics (BP, blood sugar if diabetic)
3. Overall health status (BMI, activity level)
4. Medication interactions if relevant

Respond **strictly in JSON** format like this:

{
  "prediction": "Safe" | "Risky",
  "reasoning": "Detailed explanation of how this food impacts the user's health condition based on their complete profile, medications, and current health status."
}
`
}

export function buildTipsPrompt(userProfile?: UserProfile, todaysScans: any[] = [], counts: { safe: number; risky: number } = { safe: 0, risky: 0 }): string {
  const userDemographics = userProfile?.demographics
  const bmiString = userDemographics ? (() => {
    try {
      const h = (userDemographics!.heightCm || 0) / 100
      return userDemographics!.weightKg && h > 0 ? (userDemographics!.weightKg / (h * h)).toFixed(1) : 'unknown'
    } catch { return 'unknown' }
  })() : 'unknown'

  const sampleScans = todaysScans.slice(0, 5).map((s, i) => {
    const pred = typeof s.prediction === 'string' ? s.prediction : s.prediction?.prediction || 'unknown'
    return `- ${s.foodName || 'Unnamed Food'}: ${pred}${s.prediction?.reasoning ? ` — ${String(s.prediction.reasoning).slice(0,120)}` : ''}`
  }).join('\n') || '- (no scans)'

  return `You are a practical, evidence-based nutrition and behavior-change coach.

Provide exactly 5 short (one-sentence) actionable health tips for this user based on their profile and today's food scans. Do NOT include explanations or extra commentary — respond strictly with a JSON array of 5 objects in the form [{"content":"..."}, ...].

### USER PROFILE
Name: ${userProfile?.name ?? 'unknown'}
- Age: ${userDemographics?.age ?? 'unknown'}
- Sex: ${userDemographics?.biologicalSex ?? 'unknown'}
- Height: ${userDemographics?.heightCm ?? 'unknown'} cm
- Weight: ${userDemographics?.weightKg ?? 'unknown'} kg
- BMI: ${bmiString}
- Activity Level: ${userDemographics?.activityLevel ?? 'unknown'}

Medical Conditions:
- Primary Condition: ${userProfile?.primaryCondition ?? 'unknown'}
- Other Conditions: KidneyDisease=${userProfile?.otherConditions?.kidneyDisease ? 'Yes' : 'No'}, HeartDisease=${userProfile?.otherConditions?.heartDisease ? 'Yes' : 'No'}

Medications:
- Diabetes meds: ${(userProfile?.treatmentManagement?.diabetesMedication?.medications || []).join(', ') || 'None'}
- Hypertension meds: ${(userProfile?.treatmentManagement?.hypertensionMedication?.medications || []).join(', ') || 'None'}

### TODAY'S SCANS SUMMARY
Total scans: ${todaysScans.length}
- Safe: ${counts.safe}
- Risky: ${counts.risky}

### TASK
Create 5 concise, actionable tips the user can apply today to reduce risk and improve dietary choices. Each tip should be personalized to the profile and today's scan summary.

Respond strictly as JSON: [{"content":"tip 1"}, {"content":"tip 2"}, {"content":"tip 3"}, {"content":"tip 4"}, {"content":"tip 5"}]
`
}

export function buildImagePrompt(user: UserProfile, fileName?: string): string {
  const heightM = (user.demographics?.heightCm || 0) / 100
  const bmi = heightM > 0 && user.demographics?.weightKg ? user.demographics.weightKg / (heightM * heightM) : 0

  return `You are a nutrition and health expert.
  First, extract and parse all nutritional information from the provided image.
  Then analyze if the food is “Safe” or “Risky” for the user based on their complete medical profile.

  USER PROFILE

  Demographics:
  Name: ${user.name}
  Age: ${user.demographics?.age ?? 'unknown'} years
  Sex: ${user.demographics?.biologicalSex ?? 'unknown'}
  Height: ${user.demographics?.heightCm ?? 'unknown'} cm
  Weight: ${user.demographics?.weightKg ?? 'unknown'} kg
  BMI: ${bmi ? bmi.toFixed(1) : 'unknown'}
  Activity Level: ${user.demographics?.activityLevel ?? 'unknown'}

  Medical Conditions:
  Primary Condition: ${user.primaryCondition}
  Other Conditions:
  Kidney Disease: ${user.otherConditions?.kidneyDisease ? 'Yes' : 'No'}
  Heart Disease: ${user.otherConditions?.heartDisease ? 'Yes' : 'No'}

  ${user.primaryCondition === 'diabetes' || user.primaryCondition === 'both' ? `
  Diabetes Management:
  Blood Sugar Level: ${user.diabetesStatus?.bloodSugar ?? 'unknown'} mg/dL
  Medications: ${user.treatmentManagement?.diabetesMedication?.medications?.join(', ') || 'None'}` : ''}

  ${user.primaryCondition === 'hypertension' || user.primaryCondition === 'both' ? `
  Hypertension Management:
  Blood Pressure: ${user.hypertensionStatus?.bloodPressure?.systolic ?? 'unknown'}/${user.hypertensionStatus?.bloodPressure?.diastolic ?? 'unknown'} mmHg
  Medications: ${user.treatmentManagement?.hypertensionMedication?.medications?.join(', ') || 'None'}` : ''}

  TASK

  1. Extract all nutrition facts from the uploaded image.
  2. Include these nutrients in the output JSON:

  - Food Name
  - Calories
  - Carbohydrates
  - Protein
  - Fat
  - Sodium
  - Fiber
  - Total Sugars
  - Added Sugars
  - Saturated Fat
  - Trans Fat
  - Cholesterol
  - Potassium
  - Serving Size
  - Servings Per Container

  3. Normalize units (g, mg, kcal).
  4. Analyze whether the food is “Safe” or “Risky” for this user based on:

  - Extracted nutrition
  - User’s full medical profile
  - Blood sugar / BP levels
  - BMI and activity level
  - Medication interactions
  - Condition-specific dietary restrictions

  5. If the image filename is provided, include it in the output under "sourceImage": "${fileName ?? ''}".

  Respond **strictly in JSON** with the following structure:

  {
    "prediction": "Safe" | "Risky",
    "reasoning": "Detailed explanation of how this food impacts the user's health condition based on their complete profile, medications, and current health status.",
    "nutritionFacts": {
      "foodName": "",
      "calories": "",
      "carbohydrates": "",
      "protein": "",
      "fat": "",
      "sodium": "",
      "fiber": "",
      "totalSugars": "",
      "addedSugars": "",
      "saturatedFat": "",
      "transFat": "",
      "potassium": "",
      "cholesterol": "",
      "servingSize": "",
      "servingsPerContainer": ""
    }
  }`;

}

