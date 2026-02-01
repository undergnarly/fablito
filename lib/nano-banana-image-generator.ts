import { GoogleGenAI, Modality } from "@google/genai"
import { uploadImageToBlob } from "./blob-storage"
import {
  buildImagePrompt,
  buildReferenceImagePrompt,
  type CharacterParams,
  type ImagePromptParams
} from "./image-prompt-utils"

/**
 * Parameters for image generation
 */
export interface ImageGenerationParams {
  sceneDescription: string
  character: CharacterParams
  style: string
  storyId: string
  pageIndex: number
  referenceImage?: string
  isChildPhoto?: boolean // True if referenceImage is an uploaded photo of the real child
}

/**
 * Generate an image using Nano Banana Pro (Google Gemini)
 *
 * Best practices implemented:
 * - Narrative descriptions instead of keyword lists
 * - Detailed style specifications for each illustration type
 * - Character consistency through detailed descriptions
 * - Reference image support for maintaining character appearance
 *
 * @param params Image generation parameters
 * @returns Object with image URL and base64 data (for use as reference)
 */
export async function generateImageWithNanoBanana(
  params: ImageGenerationParams
): Promise<{ imageUrl: string; base64Data: string }> {
  const { sceneDescription, character, style, storyId, pageIndex, referenceImage, isChildPhoto } = params

  console.log(`[NANO-BANANA] Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[NANO-BANANA] Character: ${character.name}, ${character.age}yo ${character.gender}`)
  console.log(`[NANO-BANANA] Style: ${style}`)
  console.log(`[NANO-BANANA] Has reference image: ${!!referenceImage}, Is child photo: ${!!isChildPhoto}`)

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    console.log(`[NANO-BANANA] No API key found - returning placeholder`)
    return {
      imageUrl: `/api/placeholder?height=400&width=600&text=${encodeURIComponent(sceneDescription.substring(0, 30))}`,
      base64Data: ""
    }
  }

  const startTime = performance.now()

  try {
    const client = new GoogleGenAI({ apiKey })

    // Build the content array
    const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = []

    // Build prompt parameters
    const promptParams: ImagePromptParams = {
      sceneDescription,
      character,
      style,
      isFirstImage: !referenceImage,
      isChildPhoto: isChildPhoto
    }

    if (referenceImage) {
      // Clean the base64 data (remove data URL prefix if present)
      const cleanBase64 = referenceImage.replace(/^data:image\/[a-z]+;base64,/, '')

      // Add reference image first
      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64
        }
      })

      // Build reference-based prompt
      const prompt = buildReferenceImagePrompt(promptParams)
      contents.push(prompt)
      console.log(`[NANO-BANANA] Reference prompt (first 500 chars): ${prompt.substring(0, 500)}...`)
    } else {
      // First image - build comprehensive prompt
      const prompt = buildImagePrompt(promptParams)
      contents.push(prompt)
      console.log(`[NANO-BANANA] First image prompt (first 500 chars): ${prompt.substring(0, 500)}...`)
    }

    // Generate image using Gemini
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
      imageUrl: `/api/placeholder?height=400&width=600&text=${encodeURIComponent(sceneDescription.substring(0, 30))}`,
      base64Data: ""
    }
  }
}

/**
 * Legacy function signature for backward compatibility
 * @deprecated Use generateImageWithNanoBanana with ImageGenerationParams instead
 */
export async function generateImageWithNanoBananaLegacy(
  prompt: string,
  storyId: string,
  pageIndex: number,
  referenceImage?: string,
): Promise<{ imageUrl: string; base64Data: string }> {
  // Extract character info from prompt if possible (legacy support)
  // This is a fallback - new code should use the proper params interface
  return generateImageWithNanoBanana({
    sceneDescription: prompt,
    character: {
      name: "Child",
      gender: "boy",
      age: 6
    },
    style: "watercolor",
    storyId,
    pageIndex,
    referenceImage
  })
}
