/**
 * Language detection utility for stories
 */

export type Language = 'ru' | 'en' | 'kz'

/**
 * Detect language based on text content
 */
export function detectLanguageFromText(text: string): Language {
  if (!text || typeof text !== 'string') {
    return 'en' // Default fallback
  }

  const lowerText = text.toLowerCase()

  // Kazakh language indicators
  const kazakhIndicators = [
    'қ', 'ғ', 'ң', 'ү', 'ұ', 'ө', 'і', 'ә', 'һ', // Kazakh specific letters
    'батыр', 'қыран', 'тау', 'ертегі', 'бала', 'ата', 'ана', 'достық', 'қоршаған',
    'әлем', 'табиғат', 'отбасы', 'қамқорлық', 'оқу', 'даму', 'эмоция', 'ішкі',
    'мен', 'сен', 'ол', 'біз', 'сіз', 'олар', 'болды', 'болмады', 'бар', 'жоқ',
    'қалай', 'қашан', 'қайда', 'не', 'кім', 'неге', 'қандай', 'қанша',
    'кішкентай', 'батыл', 'ертегі', 'қызықты', 'қуанышты', 'махаббат', 'қорғау',
    'қауіпсіздік', 'қуаныш', 'мақтаныш', 'қайғы', 'қорқыныш', 'ашу', 'қуаныш',
    'сүйікті', 'жақсы', 'жаман', 'үлкен', 'кіші', 'жаңа', 'ескі', 'жақын', 'алыс'
  ]

  // Russian language indicators
  const russianIndicators = [
    'я', 'ю', 'ё', 'ь', 'ъ', 'ы', 'э', // Russian specific letters
    'история', 'сказка', 'ребенок', 'мальчик', 'девочка', 'мама', 'папа', 'бабушка', 'дедушка',
    'дружба', 'помощь', 'семья', 'забота', 'природа', 'мир', 'учение', 'развитие',
    'эмоции', 'внутренний', 'я', 'ты', 'он', 'она', 'мы', 'вы', 'они', 'был', 'была',
    'было', 'были', 'есть', 'нет', 'как', 'когда', 'где', 'что', 'кто', 'почему',
    'какой', 'сколько', 'волшебный', 'горы', 'сая', 'приключение', 'путешествие'
  ]

  // English language indicators
  const englishIndicators = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'story', 'adventure', 'child', 'boy', 'girl', 'mother', 'father', 'family',
    'friendship', 'help', 'nature', 'world', 'learning', 'development', 'emotions',
    'i', 'you', 'he', 'she', 'we', 'they', 'was', 'were', 'is', 'are', 'have', 'has',
    'how', 'when', 'where', 'what', 'who', 'why', 'which', 'how many'
  ]

  // Count matches for each language
  let kazakhCount = 0
  let russianCount = 0
  let englishCount = 0

  // Check for Kazakh indicators
  for (const indicator of kazakhIndicators) {
    if (lowerText.includes(indicator)) {
      kazakhCount++
    }
  }

  // Check for Russian indicators
  for (const indicator of russianIndicators) {
    if (lowerText.includes(indicator)) {
      russianCount++
    }
  }

  // Check for English indicators
  for (const indicator of englishIndicators) {
    if (lowerText.includes(indicator)) {
      englishCount++
    }
  }

  // Return the language with the highest count
  if (kazakhCount > russianCount && kazakhCount > englishCount) {
    return 'kz'
  } else if (russianCount > englishCount) {
    return 'ru'
  } else {
    return 'en'
  }
}

/**
 * Detect language from story content
 */
export function detectLanguageFromStory(story: any): Language {
  // If story already has language defined, use it
  if (story.style?.language) {
    return story.style.language
  }

  // Try to detect from title
  if (story.title) {
    const titleLanguage = detectLanguageFromText(story.title)
    if (titleLanguage !== 'en') { // If not default English, likely correct
      return titleLanguage
    }
  }

  // Try to detect from story content
  if (story.storyContent) {
    try {
      const content = typeof story.storyContent === 'string' 
        ? JSON.parse(story.storyContent) 
        : story.storyContent
      
      if (content.title) {
        const titleLanguage = detectLanguageFromText(content.title)
        if (titleLanguage !== 'en') {
          return titleLanguage
        }
      }

      // Check first few pages of content
      if (content.pages && Array.isArray(content.pages)) {
        const sampleText = content.pages
          .slice(0, 3) // Check first 3 pages
          .map((page: any) => page.text || '')
          .join(' ')
        
        if (sampleText) {
          return detectLanguageFromText(sampleText)
        }
      }
    } catch (error) {
      console.error('Error parsing story content for language detection:', error)
    }
  }

  // Try to detect from prompt
  if (story.prompt) {
    return detectLanguageFromText(story.prompt)
  }

  // Default fallback
  return 'en'
}
