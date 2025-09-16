/**
 * Test the main image generator with Fireworks AI as primary
 */

import { generateImage } from './image-generator'

async function testMainGenerator() {
  console.log('🚀 Testing main image generator (should use Fireworks AI)...\n');

  const testPrompts = [
    "A friendly elephant teaching children about letters",
    "A colorful rainbow over a magical castle",
    "Happy children reading books under a big tree"
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    const testStoryId = `main-test-${Date.now()}`;
    
    console.log(`--- Test ${i + 1}/${testPrompts.length} ---`);
    console.log(`Prompt: ${prompt}`);
    
    try {
      const startTime = performance.now();
      const imageUrl = await generateImage(
        prompt,
        testStoryId,
        i,
        [], // no previous images
        [] // no previous prompts
      );
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`✅ Success! Generated in ${duration.toFixed(2)}s`);
      console.log(`🖼️  Image URL: ${imageUrl}\n`);
      
    } catch (error) {
      console.error(`❌ Failed:`, error);
    }
    
    // Small delay between requests
    if (i < testPrompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('🎉 Main generator test completed!');
}

if (require.main === module) {
  testMainGenerator().catch(console.error);
}

export { testMainGenerator };