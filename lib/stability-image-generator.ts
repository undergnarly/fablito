import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

/**
 * Save image to local file system
 */
async function saveImageLocally(base64Data: string, storyId: string, pageIndex: number): Promise<string> {
  try {
    // Create images directory if it doesn't exist
    const imagesDir = join(process.cwd(), 'public', 'generated-images')
    await mkdir(imagesDir, { recursive: true })
    
    // Generate filename
    const filename = `${storyId}-page-${pageIndex}-${Date.now()}.png`
    const filepath = join(imagesDir, filename)
    
    // Convert base64 to buffer
    const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
    const buffer = Buffer.from(base64Content, 'base64')
    
    // Write file
    await writeFile(filepath, buffer)
    
    // Return public URL
    const publicUrl = `/generated-images/${filename}`
    console.log(`[STABILITY-SAVE] Saved image to: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error(`[STABILITY-SAVE] Error saving image:`, error)
    throw error
  }
}

/**
 * Generate an image using Stability AI
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @returns The generated image URL
 */
export async function generateImageWithStability(
  prompt: string,
  storyId: string,
  pageIndex: number,
): Promise<string> {
  console.log(`[STABILITY-GEN] 🚀 Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[STABILITY-GEN] 📝 Prompt: ${prompt}`)
  
  try {
    // Check if API key is available
    if (!process.env.STABILITY_API_KEY) {
      console.log(`[STABILITY-GEN] ❌ Stability API Key not found`)
      return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
    }
    
    // Enhance prompt for children's book illustration
    const enhancedPrompt = `${prompt}, children's book illustration style, colorful, child-friendly, detailed, high quality`
    
    console.log(`[STABILITY-GEN] Enhanced prompt: ${enhancedPrompt}`)
    
    const startTime = Date.now()
    
    // Stability AI API request
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: enhancedPrompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: 'illustration'
      })
    })
    
    const endTime = Date.now()
    console.log(`[STABILITY-GEN] API request completed in ${endTime - startTime}ms`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[STABILITY-GEN] API Error: ${response.status}`, errorText)
      return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
    }
    
    const data = await response.json()
    
    if (data.artifacts && data.artifacts.length > 0) {
      const image = data.artifacts[0]
      const base64Image = image.base64
      
      console.log(`[STABILITY-GEN] Image generated, size: ${base64Image.length} characters`)
      console.log(`[STABILITY-GEN] Finish reason: ${image.finishReason}`)
      
      if (image.finishReason === 'SUCCESS' && base64Image) {
        const dataUrl = `data:image/png;base64,${base64Image}`
        
        try {
          // Save image to local file system
          const imageUrl = await saveImageLocally(dataUrl, storyId, pageIndex)
          
          console.log(`[STABILITY-GEN] ✅ Successfully generated and saved image: ${imageUrl}`)
          return imageUrl
        } catch (error) {
          console.error(`[STABILITY-GEN] Error saving image locally:`, error)
          // Fallback to data URL if local saving fails
          console.log(`[STABILITY-GEN] Falling back to data URL`)
          return dataUrl
        }
      } else {
        console.log(`[STABILITY-GEN] ❌ Image generation failed, reason: ${image.finishReason}`)
      }
    } else {
      console.log(`[STABILITY-GEN] ❌ No images in response`)
    }
    
    // Fallback if no image generated
    return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
    
  } catch (error) {
    console.error(`[STABILITY-GEN] Error generating image:`, error)
    // Return a placeholder image if generation fails
    return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
  }
}

