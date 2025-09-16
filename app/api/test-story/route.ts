import { NextRequest, NextResponse } from 'next/server'
import { generateStoryInBackground } from '../../../lib/story-generator'

export async function POST(request: NextRequest) {
  try {
    console.log('[TEST-API] Starting test story generation...')
    
    const storyId = `test-${Date.now()}`
    const testParams = {
      childName: 'Сая',
      childAge: 5,
      theme: 'character-courage',
      style: { 
        language: 'ru' as const,
      },
      voiceStory: '',
      textStory: ''
    }
    
    console.log('[TEST-API] Story ID:', storyId)
    console.log('[TEST-API] Test parameters:', testParams)
    
    // Call the story generation function directly with correct parameters
    await generateStoryInBackground(storyId, testParams)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test story generation completed',
      storyId: storyId
    })
    
  } catch (error: any) {
    console.error('[TEST-API] Error in test story generation:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}