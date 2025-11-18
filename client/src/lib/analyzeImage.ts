import { Client } from '@gradio/client'
import { UserProfile, HealthPrediction } from '@shared/schema'
import { buildImagePrompt } from './promptBuilder'
import { parseImageLlmResponse } from './parseImageLlm'
import { parseLlmResponse } from './parseLlm'
import { fallbackAnalysis } from './fallbackAnalysis'
import { analyzeFood } from './analyzeFood'

// Read configuration from Vite environment variables with sensible fallbacks
const SPACE_NAME = 'Eisk/HyperDiaSense-OCR'
const CLASSIFY_ENDPOINT = '/extract_nutrition_label'
const HF_TOKEN = (import.meta.env?.VITE_HF_TOKEN as string)
// Normalize HF token type for @gradio/client which expects token strings beginning with 'hf_'
const TOKEN: (`hf_${string}` | undefined) = HF_TOKEN
  ? (HF_TOKEN.startsWith('hf_') ? (HF_TOKEN as `hf_${string}`) : (`hf_${HF_TOKEN}` as `hf_${string}`))
  : undefined



/**
 * Send an image file to the Gradio HyperDiaSense space for OCR + classification.
 * Uses parseImageLlmResponse to extract nutrition facts and health prediction.
 */
export async function analyzeImageFile(file: File, userProfile?: UserProfile): Promise<HealthPrediction & { nutritionData?: any }> {
  try {

    let result
    try {
      // Connect to the Gradio Space. If the space is private, pass the HF token.
      // The @gradio/client `Client.connect` accepts an options object as a second arg
      // with an `hfToken` field for private spaces.
      const client = TOKEN ? await Client.connect(SPACE_NAME, { token: TOKEN }) : await Client.connect(SPACE_NAME)
      result = await client.predict(CLASSIFY_ENDPOINT, { image: file})
    } catch (sendErr) {
      // IMAGE MODE: LLM send failed. Do NOT use fallback. Return error message instead.
      console.error('Error sending image to Gradio Space:', sendErr)
      return {
        prediction: 'Risky',
        reasoning: `Error: Unable to connect to the nutrition analysis service. Please switch to manual mode and try entering the text directly. (${sendErr instanceof Error ? sendErr.message : 'Unknown error'})`,
        healthTip: [{ content: 'Switch to manual mode to enter nutritional values directly.' }],
      }
    }

    const output = String((result?.data as any)?.[0] || '')

    // Use image-specific parser that extracts nutrition facts
    const parsed = parseImageLlmResponse(output)

    // If we have nutrition data, call analyzeFood to perform the manual analysis
    const nutrition = (parsed as any).nutritionData || null
    if (nutrition) {
      const toNumber = (v: any): number | null => {
        if (v === undefined || v === null || v === '') return null
        const cleaned = String(v).replace(/[^0-9.\-]/g, '')
        const n = Number(cleaned)
        return Number.isFinite(n) ? n : null
      }

      const analyzeReq: any = {
        calories: toNumber(nutrition.calories),
        carbohydrates: toNumber(nutrition.carbohydrates),
        protein: toNumber(nutrition.protein),
        fat: toNumber(nutrition.fat),
        sodium: toNumber(nutrition.sodium),
        fiber: toNumber(nutrition.fiber),
        totalSugars: toNumber(nutrition.totalSugars),
        addedSugars: toNumber(nutrition.addedSugars),
        saturatedFat: toNumber(nutrition.saturatedFat),
        transFat: toNumber(nutrition.transFat),
        potassium: toNumber(nutrition.potassium),
        cholesterol: toNumber(nutrition.cholesterol),
        servingSize: nutrition.servingSize ?? '',
        servingsPerContainer: toNumber(nutrition.servingsPerContainer),
        foodName: String(nutrition.foodName || '').trim(),
        condition: (userProfile as any)?.primaryCondition || 'both',
      }

      try {
        const final = await analyzeFood(analyzeReq, userProfile ?? ({} as any))
        return {
          ...final,
          nutritionData: nutrition,
        }
      } catch (err2) {
        console.error('Error running analyzeFood for parsed nutrition:', err2)
        return {
          prediction: 'Risky',
          reasoning: `Error: Unable to complete nutrition analysis. Please switch to manual mode and try entering the text directly. (${err2 instanceof Error ? err2.message : 'Unknown error'})`,
          healthTip: [{ content: 'Switch to manual mode to enter nutritional values directly.' }],
        }
      }
    }

    // If nutrition extraction failed, return parsed result (likely a textual HealthPrediction or fallback)
    return parsed
  } catch (err) {
    console.error('Error analyzing image via Gradio:', err)
    // IMAGE MODE: Do NOT use fallback. Return error message instead.
    // User should switch to manual mode.
    return {
      prediction: 'Risky',
      reasoning: 'Error: The nutrition could not be analyzed. Please switch to manual mode and try entering the text directly.',
      healthTip: [{ content: 'Switch to manual mode to enter nutritional values directly.' }],
    }
  }
}
