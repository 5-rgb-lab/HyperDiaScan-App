import { AnalyzeFoodRequest, UserProfile, HealthPrediction, healthPredictionSchema } from "@shared/schema"

const LLM_URL = import.meta.env.VITE_LOCAL_LLM_URL || "http://localhost:11434/api/generate"

/**
 * Analyzes food safety using a local LLaMA model.
 * Combines nutrient data + user health profile to determine if food is "Safe" or "Risky".
 */
export const analyzeFood = async (
  nutritionData: AnalyzeFoodRequest,
  userProfile: UserProfile
): Promise<HealthPrediction> => {
  try {
    console.log("🧑 User Profile:", JSON.stringify(userProfile, null, 2))
    console.log("🍎 Nutrition Data:", JSON.stringify(nutritionData, null, 2))

    // Validate userProfile
    const missingProfileParts: string[] = []
    if (!userProfile.name) missingProfileParts.push("name")
    if (!userProfile.age && userProfile.age !== 0) missingProfileParts.push("age")
    if (!userProfile.demographics) missingProfileParts.push("demographics")
    if (!userProfile.primaryCondition) missingProfileParts.push("primaryCondition")
    if (!userProfile.primaryMedical) missingProfileParts.push("primaryMedical")
    if (!userProfile.diabetesStatus) missingProfileParts.push("diabetesStatus")
    if (!userProfile.hypertensionStatus) missingProfileParts.push("hypertensionStatus")
    if (!userProfile.nutrientTargets) missingProfileParts.push("nutrientTargets")
    
    // Log validation results
    if (missingProfileParts.length) {
      console.warn("⚠️ Missing user profile fields before LLM request:", missingProfileParts)
      console.warn("❌ User Profile Validation Failed - Details:", {
        missingFields: missingProfileParts,
        profileReceived: userProfile
      })
    } else {
      console.log("✅ User Profile Validation Passed")
    }

    // Validate nutrition data
    const missingNutrition: string[] = []
    if (nutritionData.calories === undefined) missingNutrition.push("calories")
    if (nutritionData.carbohydrates === undefined) missingNutrition.push("carbohydrates")
    if (nutritionData.sodium === undefined) missingNutrition.push("sodium")
    
    if (missingNutrition.length) {
      console.warn("⚠️ Missing nutrition data fields:", missingNutrition)
    }

    const prompt = buildPrompt(nutritionData, userProfile)
    console.log("🔍 Built Prompt (trimmed):", prompt.slice(0, 1000))

    const body: Record<string, any> = {
      model: import.meta.env.VITE_LLM_MODEL || "llama3.2",
      prompt,
      metadata: { userProfile },
      messages: [
        { role: "system", content: "You are a nutrition and health expert." },
        { role: "user", content: prompt },
        { role: "user", content: `USER_PROFILE_JSON: ${JSON.stringify(userProfile)}` },
      ],
      stream: false,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)

    let response: Response
    try {
      response = await fetch(LLM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      const error = await response.text()
      console.error("❌ Ollama Error Response:", error)
      console.error("Request details:", {
        url: LLM_URL,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`LLM error: ${error}`)
    }

    let result: any
    try {
      result = await response.json()
    } catch (err) {
      const text = await response.text().catch(() => "<unreadable body>")
      console.error("❌ Failed to parse JSON from LLM response.", {
        error: err,
        rawText: text,
        status: response.status,
        contentType: response.headers.get('content-type')
      })
      throw err
    }

    console.log("📥 Raw LLM Response:", result)

    const outputCandidates = [
      result.response,
      result.text,
      result.output?.[0]?.content,
      result.result?.content,
      result.choices?.[0]?.message?.content,
      result.choices?.[0]?.text,
      typeof result === "string" ? result : undefined,
    ]

    const output = outputCandidates.find(Boolean) || ""
    console.log("🧾 LLM Output (first non-empty):", String(output).slice(0, 1500))

    const parsed = parseLlmResponse(String(output))
    return parsed
  } catch (error) {
    console.error("❌ LLM call failed:", error)
    try {
      console.error("Attempted nutrition data:", JSON.stringify(nutritionData))
      console.error("Attempted userProfile:", JSON.stringify((userProfile as any) || {}, null, 2))
    } catch {}
    return fallbackAnalysis(nutritionData)
  }
}

/**
 * Builds structured LLM prompt with 5 health tips.
 */
function buildPrompt(nutrition: AnalyzeFoodRequest, user: UserProfile): string {
  return `
You are a nutrition and health expert. 
Analyze if the following food is "Safe" or "Risky" for the user based on their full medical profile.

### USER PROFILE
- Name: ${user.name}
- Age: ${user.age}
- Sex: ${user.demographics.biologicalSex}
- Height: ${user.demographics.heightCm} cm
- Weight: ${user.demographics.weightKg} kg
- Activity: ${user.demographics.activityLevel}
- Primary Condition: ${user.primaryCondition}
${user.primaryCondition === 'diabetes' || user.primaryCondition === 'both' ? `
- Diabetes Type: ${user.primaryMedical.diabetesType}
- Latest HbA1c: ${user.diabetesStatus.latestHbA1c}
- Daily Carb Limit: ${user.nutrientTargets.dailyCarbLimit}` : ''}
${user.primaryCondition === 'hypertension' || user.primaryCondition === 'both' ? `
- Hypertension Type: ${user.primaryMedical.hypertensionType}
- Blood Pressure: ${user.hypertensionStatus.currentBP.systolic}/${user.hypertensionStatus.currentBP.diastolic}
- Daily Sodium Limit: ${user.nutrientTargets.dailySodiumLimit}` : ''}
- Daily Calorie Target: ${user.nutrientTargets.dailyCalorieTarget}

### FOOD NUTRITION
- Food Name: ${nutrition.foodName || "Unnamed Food"}
- Calories: ${nutrition.calories} kcal
- Carbohydrates: ${nutrition.carbohydrates} g
- Protein: ${nutrition.protein} g
- Fat: ${nutrition.fat} g
- Sodium: ${nutrition.sodium} mg
- Fiber: ${nutrition.fiber} g
- Sugar: ${nutrition.sugar} g

### TASK
Determine if this food is **Safe** or **Risky** for this user. 
Base your decision on nutritional suitability and how user manage the condition (e.g., sodium for hypertension, carbs for diabetes).

Respond **strictly in JSON** format like this:

{
  "prediction": "Safe" | "Risky",
  "reasoning": "Explain how this food impacts the user's health condition based on their profile.",
  "healthTip": [
    { "content": "Short actionable tip 1" },
    { "content": "Short actionable tip 2" },
    { "content": "Short actionable tip 3" },
    { "content": "Short actionable tip 4" },
    { "content": "Short actionable tip 5" }
  ]
}
`
}

/**
 * Parses and validates model output with Zod.
 */
function parseLlmResponse(output: string): HealthPrediction {
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in model response")

    const parsedJson = JSON.parse(jsonMatch[0])
    return healthPredictionSchema.parse(parsedJson)
  } catch (err) {
    console.warn("⚠️ LLaMA output parsing failed, using heuristic fallback:", err)

    if (/risky/i.test(output)) {
      return {
        prediction: "Risky",
        reasoning: output.trim(),
        healthTip: [
          { content: "Choose lower-sodium or lower-sugar alternatives." },
          { content: "Avoid processed foods with hidden sodium." },
          { content: "Stay hydrated to help regulate blood pressure." },
          { content: "Pair carbs with protein or fiber to slow absorption." },
          { content: "Monitor portion sizes for better control." },
        ],
      }
    }

    return {
      prediction: "Safe",
      reasoning: output.trim(),
      healthTip: [
        { content: "Maintain balanced meals across the day." },
        { content: "Stay consistent with meal timing." },
        { content: "Include vegetables for fiber and nutrients." },
        { content: "Keep salt and sugar within daily limits." },
        { content: "Stay hydrated and active regularly." },
      ],
    }
  }
}

/**
 * Fallback if LLM is unreachable.
 */
function fallbackAnalysis(data: AnalyzeFoodRequest): HealthPrediction {
  const { condition, sodium, carbohydrates, calories } = data

  if (condition === "hypertension") {
    if (sodium > 600)
      return {
        prediction: "Risky",
        reasoning: `High sodium (${sodium}mg) not ideal for hypertension.`,
        healthTip: [
          { content: "Opt for low-sodium foods or fresh ingredients." },
          { content: "Use herbs or spices instead of salt." },
          { content: "Avoid processed snacks and canned foods." },
          { content: "Check labels for sodium content." },
          { content: "Monitor blood pressure after salty meals." },
        ],
      }

    return {
      prediction: "Safe",
      reasoning: `Sodium within safe range (${sodium}mg).`,
      healthTip: [
        { content: "Maintain current sodium intake." },
        { content: "Balance meals with potassium-rich foods." },
        { content: "Continue monitoring blood pressure." },
        { content: "Stay hydrated throughout the day." },
        { content: "Include regular physical activity." },
      ],
    }
  }

  if (carbohydrates > 45 || calories > 400)
    return {
      prediction: "Risky",
      reasoning: `High carbohydrate or calorie content.`,
      healthTip: [
        { content: "Prefer smaller portions or half-servings." },
        { content: "Combine carbs with fiber-rich foods." },
        { content: "Avoid sugary beverages with the meal." },
        { content: "Track total daily carbohydrate intake." },
        { content: "Include lean protein for balance." },
      ],
    }

  return {
    prediction: "Safe",
    reasoning: `Carbs and calories are within moderate range.`,
    healthTip: [
      { content: "Keep portion sizes steady." },
      { content: "Add vegetables for more fiber." },
      { content: "Stay hydrated to support digestion." },
      { content: "Limit processed carbs when possible." },
      { content: "Continue consistent meal patterns." },
    ],
  }
}
