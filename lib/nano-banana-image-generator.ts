import { GoogleGenAI, Modality } from "@google/genai"
import { uploadImageToBlob } from "./blob-storage"

/**
 * Generate an image using Nano Banana Pro (Google Gemini 3 Pro Image)
 * Supports reference images for character consistency
 *
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @param referenceImage Optional base64 reference image for character consistency
 * @returns Object with image URL and base64 data (for use as reference)
 */
export async function generateImageWithNanoBanana(
  prompt: string,
  storyId: string,
  pageIndex: number,
  referenceImage?: string,
): Promise<{ imageUrl: string; base64Data: string }> {
  console.log(`[NANO-BANANA] Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[NANO-BANANA] Prompt: ${prompt}`)
  console.log(`[NANO-BANANA] Has reference image: ${!!referenceImage}`)

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    console.log(`[NANO-BANANA] No API key found - returning placeholder`)
    return {
      imageUrl: `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`,
      base64Data: ""
    }
  }

  const startTime = performance.now()

  try {
    const client = new GoogleGenAI({ apiKey })

    // Build the content array
    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = []

    // If we have a reference image, add it first for character consistency
    if (referenceImage) {
      // Clean the base64 data (remove data URL prefix if present)
      const cleanBase64 = referenceImage.replace(/^data:image\/[a-z]+;base64,/, '')

      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64
        }
      })

      // Add instruction to maintain character consistency
      contents.push(
        `Using the character from the reference image above, create a new illustration: ${prompt}. ` +
        `CRITICAL: The main character must look EXACTLY the same as in the reference image - ` +
        `same face, same hair, same clothing, same accessories. Only change the scene and action.`
      )
    } else {
      // First image - just use the prompt with character consistency instructions
      contents.push(
        `${prompt}. Style: colorful, vibrant, child-friendly, high quality illustration. ` +
        `Create a memorable, distinctive character design that can be consistently reproduced.`
      )
    }

    // Generate image using Gemini 3 Pro Image (Nano Banana Pro)
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      }
    })

    const endTime = performance.now()
    const duration = (endTime - startTime) / 1000

    console.log(`[NANO-BANANA] Generation completed in ${duration.toFixed(2)} seconds`)

    // Extract image from response
    const candidates = response.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates in response')
    }

    const parts = candidates[0].content?.parts
    if (!parts) {
      throw new Error('No parts in response content')
    }

    // Find the image part
    let base64Image = ""
    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data
        break
      }
    }

    if (!base64Image) {
      throw new Error('No image data in response')
    }

    console.log(`[NANO-BANANA] Image generated successfully`)
    console.log(`[NANO-BANANA] Image data size: ${base64Image.length} characters`)

    // Upload image to Vercel Blob
    const dataUrl = `data:image/png;base64,${base64Image}`
    const imageUrl = await uploadImageToBlob(dataUrl, storyId, pageIndex)

    console.log(`[NANO-BANANA] Successfully generated and uploaded image: ${imageUrl}`)

    return {
      imageUrl,
      base64Data: base64Image
    }

  } catch (error) {
    const endTime = performance.now()
    const duration = (endTime - startTime) / 1000
    console.error(`[NANO-BANANA] Error after ${duration.toFixed(2)} seconds:`, error)

    // Return placeholder on error
    return {
      imageUrl: `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`,
      base64Data: ""
    }
  }
}
