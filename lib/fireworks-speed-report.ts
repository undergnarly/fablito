/**
 * Fireworks AI Speed Performance Report
 * Run comprehensive speed tests and generate performance report
 */

import { generateImageWithFireworks } from './fireworks-image-generator'

interface SpeedTestResult {
  prompt: string;
  duration: number;
  imageSize: number;
  success: boolean;
  error?: string;
}

const TEST_PROMPTS = [
  "A magical unicorn in rainbow colors",
  "Children playing in a sunny garden",
  "A friendly robot helping in the kitchen", 
  "A beautiful butterfly on colorful flowers",
  "A cozy library with books and reading chairs",
  "A space rocket flying among stars",
  "A happy family of elephants",
  "A castle on top of a mountain",
  "A cute puppy learning to read",
  "A colorful hot air balloon in the sky"
];

async function runSpeedReport(): Promise<void> {
  console.log('🚀 FIREWORKS AI SPEED PERFORMANCE REPORT');
  console.log('=' .repeat(50));
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`🧪 Number of tests: ${TEST_PROMPTS.length}`);
  console.log(`🔑 API Key: ${process.env.FIREWORKS_API_KEY ? '✅ Available' : '❌ Missing'}`);
  console.log('');

  const results: SpeedTestResult[] = [];
  let totalStartTime = performance.now();

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    const storyId = `speed-test-${Date.now()}-${i}`;
    
    console.log(`[${i + 1}/${TEST_PROMPTS.length}] Testing: "${prompt}"`);
    
    try {
      const startTime = performance.now();
      const imageUrl = await generateImageWithFireworks(prompt, storyId, i);
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      // Try to estimate image size from URL (if it's a local file)
      let imageSize = 0;
      if (imageUrl.startsWith('/generated-images/')) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const fullPath = path.join(process.cwd(), 'public', imageUrl);
          const stats = await fs.stat(fullPath);
          imageSize = stats.size;
        } catch (e) {
          // Ignore size check errors
        }
      }
      
      results.push({
        prompt,
        duration,
        imageSize,
        success: true
      });
      
      console.log(`    ✅ Generated in ${duration.toFixed(2)}s (${(imageSize / 1024).toFixed(1)}KB)`);
      
    } catch (error) {
      results.push({
        prompt,
        duration: 0,
        imageSize: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      console.log(`    ❌ Failed: ${error}`);
    }
    
    // Small delay between requests
    if (i < TEST_PROMPTS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  const totalEndTime = performance.now();
  const totalDuration = (totalEndTime - totalStartTime) / 1000;

  // Generate report
  console.log('');
  console.log('📊 PERFORMANCE SUMMARY');
  console.log('=' .repeat(30));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful generations: ${successful.length}/${results.length}`);
  console.log(`❌ Failed generations: ${failed.length}/${results.length}`);
  console.log(`📈 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);

  if (successful.length > 0) {
    const durations = successful.map(r => r.duration);
    const sizes = successful.map(r => r.imageSize).filter(s => s > 0);
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    const avgSize = sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;
    const minSize = sizes.length > 0 ? Math.min(...sizes) : 0;
    const maxSize = sizes.length > 0 ? Math.max(...sizes) : 0;

    console.log('');
    console.log('⚡ SPEED METRICS:');
    console.log(`   Average: ${avgDuration.toFixed(2)}s`);
    console.log(`   Fastest: ${minDuration.toFixed(2)}s`);
    console.log(`   Slowest: ${maxDuration.toFixed(2)}s`);
    console.log(`   Total time: ${totalDuration.toFixed(2)}s`);

    if (sizes.length > 0) {
      console.log('');
      console.log('📏 IMAGE SIZE METRICS:');
      console.log(`   Average: ${(avgSize / 1024).toFixed(1)}KB`);
      console.log(`   Smallest: ${(minSize / 1024).toFixed(1)}KB`);
      console.log(`   Largest: ${(maxSize / 1024).toFixed(1)}KB`);
    }

    // Performance rating
    const rating = avgDuration < 1 ? 'EXCELLENT' :
                   avgDuration < 2 ? 'VERY GOOD' :
                   avgDuration < 3 ? 'GOOD' :
                   avgDuration < 5 ? 'ACCEPTABLE' : 'NEEDS IMPROVEMENT';

    console.log('');
    console.log('🏆 PERFORMANCE RATING:', rating);
    
    if (avgDuration < 2) {
      console.log('🎉 Fireworks AI performs exceptionally well for real-time applications!');
    }
  }

  if (failed.length > 0) {
    console.log('');
    console.log('❌ FAILURES:');
    failed.forEach((result, index) => {
      console.log(`   ${index + 1}. "${result.prompt}" - ${result.error}`);
    });
  }

  console.log('');
  console.log('=' .repeat(50));
  console.log('✅ Speed report completed!');
}

if (require.main === module) {
  runSpeedReport().catch(console.error);
}

export { runSpeedReport };