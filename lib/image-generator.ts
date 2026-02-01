import { generateImageWithNanoBanana } from "./nano-banana-image-generator"

/**
 * Generate an image based on a prompt using Nano Banana Pro (Google Gemini 3 Pro Image)
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @param referenceImage Optional base64 reference image for character consistency
 * @returns Object with image URL and base64 data (for use as reference)
 */
export async function generateImage(
  prompt: string,
  storyId: string,
  pageIndex: number,
  referenceImage?: string,
): Promise<{ imageUrl: string; base64Data: string }> {
  console.log(`[IMAGE-GEN] Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[IMAGE-GEN] Prompt: ${prompt}`)
  console.log(`[IMAGE-GEN] Has reference image: ${!!referenceImage}`)

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  // Use Nano Banana Pro (Google Gemini) for image generation
  if (apiKey) {
    console.log(`[IMAGE-GEN] Using Nano Banana Pro (Gemini 3 Pro Image) for image generation`)
    return await generateImageWithNanoBanana(prompt, storyId, pageIndex, referenceImage)
  }

  // If Google API is not available, return error
  console.error(`[IMAGE-GEN] GOOGLE_API_KEY is required - no other generators allowed`)
  throw new Error("Google API key is required for image generation. Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.")
}
