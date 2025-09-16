import { generateImageWithFireworks } from "./fireworks-image-generator"


/**
 * Generate an image based on a prompt using Fireworks AI only
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @param previousImages Optional array of previous images to maintain consistency
 * @param previousPrompts Optional array of previous prompts corresponding to the images
 * @returns The generated image URL
 */
export async function generateImage(
  prompt: string,
  storyId: string,
  pageIndex: number,
  previousImages: string[] = [],
  previousPrompts: string[] = [],
): Promise<string> {
  console.log(`[IMAGE-GEN] 🚀 Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[IMAGE-GEN] 📝 Prompt: ${prompt}`)
  
  // Use ONLY Fireworks AI for image generation
  if (process.env.FIREWORKS_API_KEY) {
    console.log(`[IMAGE-GEN] Using Fireworks AI FLUX.1 for image generation`)
    return await generateImageWithFireworks(prompt, storyId, pageIndex)
  }
  
  // If Fireworks AI is not available, return error instead of fallbacks
  console.error(`[IMAGE-GEN] ❌ FIREWORKS_API_KEY is required - no other generators allowed`)
  throw new Error("Fireworks AI is required for image generation. Please set FIREWORKS_API_KEY.")
}

