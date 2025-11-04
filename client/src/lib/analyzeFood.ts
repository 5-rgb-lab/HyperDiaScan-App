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
    // Validate we have complete user profile data
    console.log("🧑 User Profile:", JSON.stringify(userProfile, null, 2));

    // Quick validation: list missing top-level profile pieces so we can debug why
    const missingProfileParts: string[] = []
    if (!userProfile.name) missingProfileParts.push("name")
    if (!userProfile.age && userProfile.age !== 0) missingProfileParts.push("age")
    if (!userProfile.demographics) missingProfileParts.push("demographics")
    if (!userProfile.primaryCondition) missingProfileParts.push("primaryCondition")
    if (!userProfile.primaryMedical) missingProfileParts.push("primaryMedical")
    if (!userProfile.diabetesStatus) missingProfileParts.push("diabetesStatus")
    if (!userProfile.hypertensionStatus) missingProfileParts.push("hypertensionStatus")
    if (!userProfile.nutrientTargets) missingProfileParts.push("nutrientTargets")
    if (missingProfileParts.length) {
      console.warn("⚠️ Missing user profile fields before LLM request:", missingProfileParts)
    }

    const prompt = buildPrompt(nutritionData, userProfile)
    console.log("🔍 Built Prompt (trimmed):", prompt.slice(0, 1000))

    // Include both the textual prompt and the structured user profile in the POST body.
    // Some local LLM gateways (or dev setups) ignore long prompts or expect structured fields,
    // so sending the profile explicitly as `metadata` helps diagnose/ensure it's transmitted.
    const body: Record<string, any> = {
      model: import.meta.env.VITE_LLM_MODEL || "llama3.2",
      prompt,
      metadata: { userProfile },
      // Also provide a messages array for compatibility with message-based endpoints
      messages: [
        { role: "system", content: "You are a nutrition and health expert." },
        { role: "user", content: prompt },
        { role: "user", content: `USER_PROFILE_JSON: ${JSON.stringify(userProfile)}` },
      ],
      stream: false,
    }

    console.log("📡 Request to LLM (keys):", Object.keys(body))

    // Add a small timeout using AbortController so we don't hang forever
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000) // 20s

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
      const error = await response.text();
      console.error("❌ Ollama Error Response:", error);
      throw new Error(`LLM error: ${error}`);
    }

    let result: any
    try {
      result = await response.json()
    } catch (err) {
      const text = await response.text().catch(() => "<unreadable body>")
      console.error("❌ Failed to parse JSON from LLM response. Raw text:", text)
      throw err
    }

    console.log("📥 Raw LLM Response:", result)

    // LLM gateways return different shapes. Try several common locations for the text.
    const outputCandidates = [
      result.response,
      result.text,
      result.output?.[0]?.content,
      result.result?.content,
      // Ollama sometimes nests under 'choices' with 'message.content'
      result.choices?.[0]?.message?.content,
      result.choices?.[0]?.text,
      typeof result === "string" ? result : undefined,
    ]

    const output = outputCandidates.find(Boolean) || ""
    console.log("🧾 LLM Output (first non-empty):", String(output).slice(0, 1500))

    // Parse and validate with Zod
    const parsed = parseLlmResponse(String(output))

    return parsed
  } catch (error) {
    // Helpful debug output when something fails: show what we attempted to send
    try {
      console.error("❌ LLM call failed:", error)
      console.error("Attempted nutrition data:", JSON.stringify(nutritionData))
      // userProfile may be undefined or partially missing; log defensively
      // (avoid crashing during logging)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error("Attempted userProfile:", JSON.stringify((userProfile as any) || {}, null, 2))
    } catch (e) {
      // ignore logging errors
    }

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
  "reasoning": "Explain how will this food impact the user's health condition based on their profile."
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
