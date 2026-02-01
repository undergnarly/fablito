import { generateImageWithNanoBanana, type ImageGenerationParams } from "./nano-banana-image-generator"
import type { CharacterParams } from "./image-prompt-utils"

/**
 * Generate an image based on scene description using Nano Banana Pro (Google Gemini)
 *
 * @param params Image generation parameters including character details and style
 * @returns Object with image URL and base64 data (for use as reference)
 */
export async function generateImage(
  params: ImageGenerationParams
): Promise<{ imageUrl: string; base64Data: string }> {
  const { sceneDescription, character, style, storyId, pageIndex, referenceImage } = params

  console.log(`[IMAGE-GEN] Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[IMAGE-GEN] Scene: ${sceneDescription.substring(0, 100)}...`)
  console.log(`[IMAGE-GEN] Character: ${character.name}, ${character.age}yo ${character.gender}`)
  console.log(`[IMAGE-GEN] Style: ${style}`)
  console.log(`[IMAGE-GEN] Has reference image: ${!!referenceImage}`)

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  // Use Nano Banana Pro (Google Gemini) for image generation
  if (apiKey) {
    console.log(`[IMAGE-GEN] Using Nano Banana Pro (Gemini) for image generation`)
    return await generateImageWithNanoBanana(params)
  }

  // If Google API is not available, return error
  console.error(`[IMAGE-GEN] GOOGLE_API_KEY is required - no other generators allowed`)
  throw new Error("Google API key is required for image generation. Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.")
}

// Re-export types for convenience
export type { ImageGenerationParams, CharacterParams }
