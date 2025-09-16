/**
 * Test Fireworks AI integration in the actual application
 * This test will create a story through the app's API
 */

async function testAppIntegration() {
  console.log('🚀 Testing Fireworks AI integration in the application...\n');

  const testStoryParams = {
    childName: "Alex",
    childAge: 6,
    theme: "relationshipsFriendship",
    style: {
      language: "en" as const,
      illustration: "colorful cartoon style"
    },
    textStory: "A short story about friendship and helping others"
  };

  try {
    console.log('📝 Creating story with parameters:', testStoryParams);
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3001/api/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testStoryParams)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Story created successfully!');
    console.log(`📚 Story ID: ${data.id}`);
    console.log(`📖 Title: ${data.title}`);
    console.log(`📄 Pages: ${data.pages?.length || 0}`);
    
    // Check if the story has images
    if (data.pages && data.pages.length > 0) {
      console.log('\n🖼️  Image generation status:');
      data.pages.forEach((page: any, index: number) => {
        const hasImage = page.imageUrl && !page.imageUrl.includes('placeholder');
        console.log(`   Page ${index + 1}: ${hasImage ? '✅ Image generated' : '⏳ Placeholder'}`);
        if (hasImage) {
          console.log(`      URL: ${page.imageUrl}`);
        }
      });
    }

    return data;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

if (require.main === module) {
  testAppIntegration().catch(console.error);
}

export { testAppIntegration };