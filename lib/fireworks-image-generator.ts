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
    console.log(`[FIREWORKS-GEN] Saved image to: ${publicUrl}`)
    
    return publicUrl
  } catch (error) {
    console.error(`[FIREWORKS-GEN] Error saving image:`, error)
    throw error
  }
}

/**
 * Generate an image using Fireworks AI FLUX.1 [schnell] FP8 model
 * @param prompt The image prompt
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @returns The generated image URL
 */
export async function generateImageWithFireworks(
  prompt: string,
  storyId: string,
  pageIndex: number,
): Promise<string> {
  console.log(`[FIREWORKS-GEN] 🚀 Starting image generation for story ${storyId}, page ${pageIndex}`)
  console.log(`[FIREWORKS-GEN] 📝 Prompt: ${prompt}`)
  
  if (!process.env.FIREWORKS_API_KEY) {
    console.log(`[FIREWORKS-GEN] No API key found - returning placeholder`)
    return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
  }

  const FIREWORKS_IMAGE_URL = 'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image';
  const startTime = performance.now();
  
  try {
    const response = await fetch(FIREWORKS_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/png',
        'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `${prompt}. Colorful, vibrant, child-friendly, high quality, IDENTICAL character appearance, same face, same clothing, same accessories, consistent art style throughout entire story`,
        aspect_ratio: '1:1',
        guidance_scale: 3.5,
        num_inference_steps: 4,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`[FIREWORKS-GEN] ⚡ Generation completed in ${duration.toFixed(2)} seconds`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FIREWORKS-GEN] ❌ API Error: ${response.status} - ${errorText}`);
      throw new Error(`Fireworks API error: ${response.status}`);
    }

    // Get binary image data
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    console.log(`[FIREWORKS-GEN] ✅ Image generated successfully`);
    console.log(`[FIREWORKS-GEN] 📄 Image size: ${imageBuffer.byteLength} bytes`);

    if (base64Image && base64Image.length > 0) {
      // Create data URL and save locally
      const dataUrl = `data:image/png;base64,${base64Image}`;
      const imageUrl = await saveImageLocally(dataUrl, storyId, pageIndex);
      
      console.log(`[FIREWORKS-GEN] ✅ Successfully generated and saved image: ${imageUrl}`);
      return imageUrl;
    } else {
      throw new Error('No image data received');
    }

  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    console.error(`[FIREWORKS-GEN] ❌ Error after ${duration.toFixed(2)} seconds:`, error);
    
    // Return placeholder on error
    return `/api/placeholder?height=400&width=600&text=${encodeURIComponent(prompt.substring(0, 30))}`
  }
}