/**
 * Test script for Fireworks AI image generation
 * Uses FLUX.1 [schnell] FP8 model for fast image generation
 */

interface FireworksImageResponse {
  id: string;
  base64: string[];
  finishReason: string;
  seed: number;
}

const FIREWORKS_API_KEY = 'fw_3ZbQfcem6qYLA94p7di3CLA5';
const FIREWORKS_IMAGE_URL = 'https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image';

async function testFireworksImageGeneration(prompt: string): Promise<string> {
  console.log(`🚀 Testing Fireworks AI image generation`);
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`⏰ Start time: ${new Date().toISOString()}`);
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(FIREWORKS_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/png',
        'Authorization': `Bearer ${FIREWORKS_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        aspect_ratio: '1:1',
        guidance_scale: 3.5,
        num_inference_steps: 4,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`⚡ Generation completed in ${duration.toFixed(2)} seconds`);
    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      throw new Error(`Fireworks API error: ${response.status}`);
    }

    // Get binary image data
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    console.log(`✅ Image generated successfully`);
    console.log(`📄 Image size: ${imageBuffer.byteLength} bytes`);
    console.log(`📄 Base64 length: ${base64Image.length} characters`);

    if (base64Image && base64Image.length > 0) {
      // Return base64 with data URL prefix
      return `data:image/png;base64,${base64Image}`;
    } else {
      throw new Error('No image data received');
    }

  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    console.error(`❌ Error after ${duration.toFixed(2)} seconds:`, error);
    throw error;
  }
}

async function saveBase64Image(base64Data: string, filename: string = 'test-image.png'): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Create buffer from base64
  const buffer = Buffer.from(base64Content, 'base64');
  
  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'test-images');
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save file
  const filepath = path.join(outputDir, filename);
  await fs.writeFile(filepath, buffer);
  
  console.log(`💾 Image saved to: ${filepath}`);
  console.log(`🔗 Public URL: /test-images/${filename}`);
}

// Test function to run multiple speed tests
async function runSpeedTests() {
  const testPrompts = [
    "A cute cartoon cat sitting in a garden",
    "A futuristic city skyline at sunset",
    "A magical forest with glowing mushrooms",
    "A steampunk robot reading a book",
    "A peaceful mountain lake reflection"
  ];

  console.log('🧪 Starting Fireworks AI speed tests...\n');

  const results: Array<{prompt: string, duration: number, success: boolean}> = [];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n--- Test ${i + 1}/${testPrompts.length} ---`);
    
    try {
      const startTime = performance.now();
      const base64Image = await testFireworksImageGeneration(prompt);
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;

      // Save the image
      await saveBase64Image(base64Image, `test-${i + 1}-${Date.now()}.png`);
      
      results.push({ prompt, duration, success: true });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error);
      results.push({ prompt, duration: 0, success: false });
    }
  }

  // Print summary
  console.log('\n📊 SPEED TEST SUMMARY:');
  console.log('========================');
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => r.success === false);
  
  console.log(`✅ Successful: ${successfulTests.length}/${results.length}`);
  console.log(`❌ Failed: ${failedTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
    const minDuration = Math.min(...successfulTests.map(r => r.duration));
    const maxDuration = Math.max(...successfulTests.map(r => r.duration));
    
    console.log(`⚡ Average speed: ${avgDuration.toFixed(2)}s`);
    console.log(`🏃 Fastest: ${minDuration.toFixed(2)}s`);
    console.log(`🐌 Slowest: ${maxDuration.toFixed(2)}s`);
  }
}

// Run if called directly
if (require.main === module) {
  runSpeedTests().catch(console.error);
}

export { testFireworksImageGeneration, saveBase64Image, runSpeedTests };