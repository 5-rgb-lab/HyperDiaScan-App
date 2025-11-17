import { Client } from '@gradio/client'
import { UserProfile, HealthPrediction } from '@shared/schema'
import { buildImagePrompt } from './promptBuilder'
import { parseLlmResponse } from './parseLlm'
import { fallbackAnalysis } from './fallbackAnalysis'

const SPACE_NAME = 'Eisk/HyperDiaSense'
const CLASSIFY_ENDPOINT = '/predict'

/**
 * Send an image file to the Gradio HYDRA space for OCR + classification.
 * This function attempts to include a prompt asking the model to extract nutrition
 * facts from the image and return a JSON containing nutrition values + prediction.
 */
export async function analyzeImageFile(file: File, userProfile?: UserProfile): Promise<HealthPrediction> {
  try {
    const prompt = buildImagePrompt(userProfile ?? ({} as any), file.name)

    let result
    try {
      const client = await Client.connect(SPACE_NAME)
      // Gradio predict may accept file blobs; pass as named arg 'image' where the Space expects it.
      result = await client.predict(CLASSIFY_ENDPOINT, { image: file, prompt })
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

    const parsed = parseLlmResponse(output)

    // If model returned explicit nutritionData, use it; otherwise fall back
    if ((parsed as any).nutritionData) {
      return parsed
    }

    // If parsing didn't yield nutrition but returned a reasoning/prediction, return it
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
