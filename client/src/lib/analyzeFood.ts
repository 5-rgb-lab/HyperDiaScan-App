import { Client } from '@gradio/client'
import { AnalyzeFoodRequest, UserProfile, HealthPrediction } from '@shared/schema'
import { getUserScanHistory, updateUserHealthTips } from '@/lib/firestore'
import { buildPrompt, buildTipsPrompt } from '@/lib/promptBuilder'
import { parseLlmResponse } from '@/lib/parseLlm'
import { parseTipsFromLlm } from '@/lib/tipsParser'
import { fallbackAnalysis } from '@/lib/fallbackAnalysis'

// Gradio Space configuration — read from Vite env with process.env fallback
const SPACE_NAME = (import.meta.env?.VITE_GRADIO_SPACE_NAME as string)
const CLASSIFY_ENDPOINT = (import.meta.env?.VITE_GRADIO_CLASSIFY_ENDPOINT as string)
const HF_TOKEN = (import.meta.env?.VITE_HF_TOKEN as string)

// Normalize HF token string to the `hf_...` form expected by @gradio/client
const TOKEN: (`hf_${string}` | undefined) = HF_TOKEN
  ? (HF_TOKEN.startsWith('hf_') ? (HF_TOKEN as `hf_${string}`) : (`hf_${HF_TOKEN}` as `hf_${string}`))
  : undefined

try {
  console.debug('[analyzeFood] Connecting to Gradio space:', SPACE_NAME)
} catch (e) {}

export const analyzeFood = async (
  nutritionData: AnalyzeFoodRequest,
  userProfile: UserProfile
): Promise<HealthPrediction> => {
  try {
    // Lightweight validation warnings
    const missingProfileParts: string[] = []
    if (!userProfile.name) missingProfileParts.push('name')
    if (!userProfile.demographics || userProfile.demographics.age === undefined) missingProfileParts.push('demographics.age')
    if (!userProfile.primaryCondition) missingProfileParts.push('primaryCondition')
    if (userProfile.primaryCondition === 'diabetes' && !userProfile.diabetesStatus) missingProfileParts.push('diabetesStatus')
    if (userProfile.primaryCondition === 'hypertension' && !userProfile.hypertensionStatus) missingProfileParts.push('hypertensionStatus')
    if (missingProfileParts.length) console.warn('⚠️ Missing user profile fields before LLM request:', missingProfileParts)

    const missingNutrition: string[] = []
    if (nutritionData.calories === undefined) missingNutrition.push('calories')
    if (nutritionData.carbohydrates === undefined) missingNutrition.push('carbohydrates')
    if (nutritionData.sodium === undefined) missingNutrition.push('sodium')
    if (missingNutrition.length) console.warn('⚠️ Missing nutrition data fields:', missingNutrition)

    const prompt = buildPrompt(nutritionData, userProfile)

    let output: string
    try {
      const client = TOKEN ? await Client.connect(SPACE_NAME, { token: TOKEN }) : await Client.connect(SPACE_NAME)
      const result = await client.predict(CLASSIFY_ENDPOINT, { prompt })
      output = (result?.data as any)?.[0] || ''
    } catch (sendErr) {
      // MANUAL MODE: LLM send failed. Log error but use fallback silently.
      console.error('Error sending prompt to Gradio Space:', sendErr)
      console.warn('⚠️ Falling back to heuristic analysis for manual mode (send error)')
      return fallbackAnalysis(nutritionData)
    }

    return parseLlmResponse(String(output))
  } catch (error) {
    console.error('❌ Gradio Space call failed:', error)
    try {
      console.error('Attempted nutrition data:', JSON.stringify(nutritionData))
      console.error('Attempted userProfile:', JSON.stringify((userProfile as any) || {}, null, 2))
    } catch {}
    // MANUAL MODE: Use fallback logic with provided nutrition data.
    // Always return a valid assessment (Safe or Risky).
    console.warn('⚠️ Falling back to heuristic analysis for manual mode')
    return fallbackAnalysis(nutritionData)
  }
}

/**
 * Generate personalized daily health tips for a user using Gradio HYDRA Space based on today's scans.
 * - Fetches today's scans
 * - Counts safe vs risky
 * - Asks LLM for 5 short, actionable tips tailored to the user
 * - Saves tips to user's profile via `updateUserHealthTips`
 */
export async function generatePersonalizedDailyTips(userId: string, userProfile?: UserProfile): Promise<void> {
  try {
    const allScans = await getUserScanHistory(userId)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const todaysScans = allScans.filter((s) => new Date(s.timestamp) >= startOfDay)

    const counts = { safe: 0, risky: 0 }
    todaysScans.forEach((r) => {
      const raw = typeof r.prediction === 'string' ? r.prediction : r.prediction?.prediction || ''
      const val = String(raw).toLowerCase()
      if (val === 'safe') counts.safe++
      else if (val === 'risky') counts.risky++
    })

    const prompt = buildTipsPrompt(userProfile, todaysScans, counts)

    const client = TOKEN ? await Client.connect(SPACE_NAME, { token: TOKEN }) : await Client.connect(SPACE_NAME)
    const result = await client.predict(CLASSIFY_ENDPOINT, { prompt })

    const raw = String((result?.data as any)?.[0] || '')
    const tips = parseTipsFromLlm(raw)
    if (!tips || tips.length !== 5) {
      console.warn('⚠️ LLM did not return 5 tips; using default tips')
      const defaultTips = [
        { content: 'Choose lower-sodium options when possible.' },
        { content: 'Prefer whole foods and add vegetables to meals.' },
        { content: 'Watch portion sizes and consider splitting large portions.' },
        { content: 'Limit added sugars and sugary drinks.' },
        { content: 'Balance carbs with protein and fiber to slow absorption.' },
      ]
      await updateUserHealthTips(userId, defaultTips)
      return
    }

    await updateUserHealthTips(userId, tips)
  } catch (err) {
    console.error('Error generating personalized tips:', err)
  }
}
