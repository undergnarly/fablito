'use client'

import { LanguageFlag } from "@/components/language-flag"
import { detectLanguageFromStory } from "@/lib/language-detector"

interface DebugLanguageFlagProps {
  story: any
  index?: number
}

export function DebugLanguageFlag({ story, index = 0 }: DebugLanguageFlagProps) {
  // Detect language if not present
  const detectedLanguage = story.style?.language || detectLanguageFromStory(story)
  
  // Debug logging
  console.log(`Story ${index}:`, {
    id: story.id,
    title: story.title,
    style: story.style,
    hasStyle: !!story.style,
    originalLanguage: story.style?.language,
    detectedLanguage: detectedLanguage,
    finalLanguage: story.style?.language || detectedLanguage
  })

  if (!detectedLanguage) {
    console.warn(`Story ${story.id} (${story.title}) has no detectable language`)
    return null
  }

  return (
    <div className="absolute top-2 left-2">
      <LanguageFlag language={detectedLanguage} size="sm" />
    </div>
  )
}
