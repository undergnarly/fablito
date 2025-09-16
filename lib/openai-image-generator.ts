import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

/**
 * Save image to local file system
 */
async function saveImageLocally(imageUrl: string, storyId: string, pageIndex: number): Promise<string> {
  try {
    // Create images directory if it doesn't exist
    const imagesDir = join(process.cwd(), 'public', 'generated-images')
    await mkdir(imagesDir, { recursive: true })
    
    // Generate filename
    const filename = `${storyId}-page-${pageIndex}-${Date.now()}.png`
    const filepath = join(imagesDir, filename)
    
    // Download image from URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`)
    }
    
    const buffer = await imageResponse.arrayBuffer()
    
    // Write file
    await writeFile(filepath, Buffer.from(buffer))
    
    // Return public URL
    const publicUrl = `/generated-images/${filename}`
    console.log(`[OPENAI-SAVE] Saved image to: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error(`[OPENAI-SAVE] Error saving image:`, error)
    throw error
  }
}

/**
 * Generate an image using OpenAI DALL-E
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @returns The generated image URL
 */
export async function generateImageWithOpenAI(
  prompt: string,
  storyId: string,
  pageIndex: number,
): Promise<string> {
  console.log(`[OPENAI-GEN] 🚀 Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[OPENAI-GEN] 📝 Prompt: ${prompt}`)
  
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log(`[OPENAI-GEN] ❌ OpenAI API Key not found`)
      return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
    }
    
    // Enhance prompt for children's book illustration
    const enhancedPrompt = `${prompt}, children's book illustration style, colorful, child-friendly, detailed, high quality, whimsical`
    
    console.log(`[OPENAI-GEN] Enhanced prompt: ${enhancedPrompt}`)
    
    const startTime = Date.now()
    
    // OpenAI DALL-E API request
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      })
    })
    
    const endTime = Date.now()
    console.log(`[OPENAI-GEN] API request completed in ${endTime - startTime}ms`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[OPENAI-GEN] API Error: ${response.status}`, errorText)
      return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
    }
    
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const image = data.data[0]
      const imageUrl = image.url
      
      console.log(`[OPENAI-GEN] Image generated, URL: ${imageUrl}`)
      console.log(`[OPENAI-GEN] Revised prompt: ${image.revised_prompt}`)
      
      if (imageUrl) {
        try {
          // Save image to local file system
          const localImageUrl = await saveImageLocally(imageUrl, storyId, pageIndex)
          
          console.log(`[OPENAI-GEN] ✅ Successfully generated and saved image: ${localImageUrl}`)
          return localImageUrl
        } catch (error) {
          console.error(`[OPENAI-GEN] Error saving image locally:`, error)
          // Fallback to original URL if local saving fails
          console.log(`[OPENAI-GEN] Falling back to original URL`)
          return imageUrl
        }
      }
    } else {
      console.log(`[OPENAI-GEN] ❌ No images in response`)
    }
    
    // Fallback if no image generated
    return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
    
  } catch (error) {
    console.error(`[OPENAI-GEN] Error generating image:`, error)
    // Return a placeholder image if generation fails
    return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
  }
}

