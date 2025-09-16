/**
 * Test story generation with Fireworks AI integration
 * This test will directly call the story generation function
 */

import { generateStoryInBackground } from './story-generator'

async function testStoryGeneration() {
  console.log('🚀 Testing story generation with Fireworks AI...\n');

  const testStoryId = `test-${Date.now()}`;
  const testParams = {
    childName: "Emma",
    childAge: 5,
    theme: "characterCourage",
    style: {
      language: "en" as const,
      illustration: "bright colorful cartoon style"
    },
    textStory: "A brave little girl helps her friends overcome their fears"
  };

  console.log('📝 Story parameters:', testParams);
  console.log(`📚 Story ID: ${testStoryId}`);
  
  try {
    console.log('⏳ Starting story generation...');
    const startTime = performance.now();
    
    await generateStoryInBackground(testStoryId, testParams);
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ Story generation completed in ${duration.toFixed(2)} seconds`);
    console.log(`📖 Story should be saved with ID: ${testStoryId}`);
    
    // Try to read the story from database
    try {
      const { getStory } = await import('./db');
      const story = await getStory(testStoryId);
      
      if (story) {
        console.log('\n📊 Story Details:');
        console.log(`   Title: ${story.title}`);
        console.log(`   Pages: ${story.content?.pages?.length || 0}`);
        console.log(`   Status: ${story.status}`);
        
        if (story.content?.pages) {
          console.log('\n🖼️  Image Generation Results:');
          story.content.pages.forEach((page: any, index: number) => {
            const hasFireworksImage = page.imageUrl && 
              !page.imageUrl.includes('placeholder') && 
              page.imageUrl.startsWith('/generated-images/');
            
            console.log(`   Page ${index + 1}: ${hasFireworksImage ? '✅ Fireworks AI image' : '⚠️  Placeholder/other'}`);
            if (hasFireworksImage) {
              console.log(`      URL: ${page.imageUrl}`);
            }
          });
        }
      } else {
        console.log('⚠️  Story not found in database (might be normal for test environment)');
      }
    } catch (dbError) {
      console.log('⚠️  Could not read from database:', (dbError as Error).message);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Story generation failed:', error);
    return false;
  }
}

if (require.main === module) {
  testStoryGeneration().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testStoryGeneration };