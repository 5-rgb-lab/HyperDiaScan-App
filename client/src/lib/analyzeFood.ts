import { AnalyzeFoodRequest, UserProfile, HealthPrediction, healthPredictionSchema } from "@shared/schema"

// You can change this if you’re using LM Studio, Ollama, or a local API gateway
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
    const prompt = buildPrompt(nutritionData, userProfile)

    console.log("🔍 Sending to LLaMA:", prompt)

    const response = await fetch(LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2", // 👈 change this to your model name (e.g., "llama3:8b" or "med-llama")
        prompt,
        stream: false,
      }),
    })

    if (!response.ok) throw new Error(`LLM error: ${response.statusText}`)

    const result = await response.json()
    const output = result.response || result.text || ""

    console.log("🧾 LLaMA Output:", output)

    // Parse and validate with Zod
    const parsed = parseLlmResponse(output)

    return parsed
  } catch (error) {
    console.error("❌ LLaMA unavailable, using fallback:", error)
    return fallbackAnalysis(nutritionData)
  }
}

/**
 * Builds a structured and informative prompt for the local LLaMA model.
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
- Diabetes Type: ${user.primaryMedical.diabetesType}
- Hypertension Type: ${user.primaryMedical.hypertensionType}
- Latest HbA1c: ${user.diabetesStatus.latestHbA1c}
- Blood Pressure: ${user.hypertensionStatus.currentBP.systolic}/${user.hypertensionStatus.currentBP.diastolic}
- Daily Calorie Target: ${user.nutrientTargets.dailyCalorieTarget}
- Daily Sodium Limit: ${user.nutrientTargets.dailySodiumLimit}
- Daily Carb Limit: ${user.nutrientTargets.dailyCarbLimit}

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
Base your decision on nutritional suitability and disease management (e.g., sodium for hypertension, carbs for diabetes).

Respond **strictly in JSON** format like this:

{
  "prediction": "Safe" | "Risky",
  "reasoning": "brief explanation"
}
`
}

/**
 * Safely parses and validates model output using Zod schema.
 */
function parseLlmResponse(output: string): HealthPrediction {
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in model response")

    const parsedJson = JSON.parse(jsonMatch[0])
    return healthPredictionSchema.parse(parsedJson)
  } catch (err) {
    console.warn("⚠️ LLaMA output parsing failed, fallback to heuristic:", err)

    // Fallback heuristic if model output isn't valid JSON
    if (/risky/i.test(output)) {
      return { prediction: "Risky", reasoning: output.trim() }
    }
    return { prediction: "Safe", reasoning: output.trim() }
  }
}

/**
 * Simple local fallback if LLaMA is unreachable.
 */
function fallbackAnalysis(data: AnalyzeFoodRequest): HealthPrediction {
  const { condition, sodium, carbohydrates, calories } = data

  if (condition === "hypertension") {
    if (sodium > 600)
      return { prediction: "Risky", reasoning: `High sodium (${sodium}mg) not ideal for hypertension.` }
    return { prediction: "Safe", reasoning: `Sodium within safe range (${sodium}mg).` }
  }

  // Diabetes
  if (carbohydrates > 45 || calories > 400)
    return { prediction: "Risky", reasoning: `High carbohydrate or calorie content.` }
  return { prediction: "Safe", reasoning: `Carbs and calories are within moderate range.` }
}
