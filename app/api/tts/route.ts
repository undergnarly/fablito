import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'ru' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Map language codes to speech synthesis voices
    const languageMap: Record<string, string> = {
      'ru': 'ru-RU',
      'en': 'en-US', 
      'kz': 'kk-KZ'
    }

    const voiceLanguage = languageMap[language] || 'ru-RU'

    // For now, we'll return the text and language info
    // The actual TTS will be handled on the client side using Web Speech API
    return NextResponse.json({
      success: true,
      text,
      language: voiceLanguage,
      message: 'TTS request processed'
    })

  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

