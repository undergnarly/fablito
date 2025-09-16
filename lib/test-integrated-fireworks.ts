/**
 * Test the integrated Fireworks AI image generator
 */

import { generateImageWithFireworks } from './fireworks-image-generator'

async function testIntegratedFireworks() {
  console.log('🚀 Testing integrated Fireworks AI generator...\n');

  const testPrompts = [
    "A friendly dragon reading a book in a library",
    "A magical unicorn in an enchanted forest", 
    "Children playing in a colorful playground"
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    const testStoryId = `test-story-${Date.now()}`;
    
    console.log(`--- Test ${i + 1}/${testPrompts.length} ---`);
    console.log(`Prompt: ${prompt}`);
    
    try {
      const startTime = performance.now();
      const imageUrl = await generateImageWithFireworks(prompt, testStoryId, i);
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
}

if (require.main === module) {
  testIntegratedFireworks().catch(console.error);
}

export { testIntegratedFireworks };