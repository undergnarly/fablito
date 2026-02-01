import { updateStory } from "@/lib/db"
import { isKvAvailable } from "@/lib/settings"
import type { StoryContent } from "@/lib/db"
import z from "zod"

const storySchema = z.object({
  title: z.string(),
  pages: z.array(
    z
      .object({
        chapter: z.string(), // Changed from "letter" to "chapter" for more flexibility
        text: z.string(),
        imagePrompt: z.string(),
      })
      .required(),
  ),
  moral: z.string(),
})

// New story parameters interface
interface StoryParams {
  childName: string
  childGender?: "boy" | "girl"
  childAge: number
  pageCount?: number
  theme: string
  style: {
    language: "ru" | "en" | "kz"
    illustration: string
  }
  textStory?: string
}

// Theme mapping for better story generation
export function getThemeDescription(theme: string, language: string): string {
  const themes: Record<string, Record<string, string>> = {
    'relationshipsFriendship': {
      'ru': 'дружба и отношения между людьми',
      'en': 'friendship and relationships between people',
      'kz': 'достық және адамдар арасындағы қарым-қатынас'
    },
    'characterCourage': {
      'ru': 'характер и смелость',
      'en': 'character and courage',
      'kz': 'мінез және батылдық'
    },
    'responsibility': {
      'ru': 'ответственность',
      'en': 'responsibility',
      'kz': 'жауапкершілік'
    },
    'familyCare': {
      'ru': 'семья и забота',
      'en': 'family and care',
      'kz': 'отбасы және қамқорлық'
    },
    'natureWorld': {
      'ru': 'природа и мир вокруг',
      'en': 'nature and the world around',
      'kz': 'табиғат және қоршаған әлем'
    },
    'learningDevelopment': {
      'ru': 'учёба и развитие',
      'en': 'learning and development',
      'kz': 'оқу және даму'
    },
    'emotionsInnerWorld': {
      'ru': 'эмоции и внутренний мир',
      'en': 'emotions and inner world',
      'kz': 'эмоциялар және ішкі әлем'
    }
  }
  
  return themes[theme]?.[language] || theme
}

// Age-appropriate language guidelines
// ВАЖНО: Максимум 1-2 коротких предложения на страницу для удобства чтения на мобильных устройствах
export function getAgeAppropriateGuidelines(age: number): string {
  if (age >= 3 && age <= 5) {
    return `AGE 3-5 YEARS:
- Use very simple sentences (3-6 words each)
- Include repetition and predictable patterns
- Focus on basic emotions and actions
- Use familiar concepts (family, animals, toys)
- CRITICAL: Maximum 1-2 SHORT sentences per page (for mobile reading)`
  } else if (age >= 6 && age <= 8) {
    return `AGE 6-8 YEARS:
- Use simple sentences (5-10 words each)
- Include light humor and gentle challenges
- Introduce problem-solving concepts
- Can include mild adventure elements
- CRITICAL: Maximum 1-2 sentences per page (for mobile reading)`
  } else if (age >= 9 && age <= 12) {
    return `AGE 9-12 YEARS:
- Use moderate sentences and age-appropriate vocabulary
- Include deeper moral concepts
- Can handle more complex plot structures
- Include character development and growth
- CRITICAL: Maximum 2 sentences per page (for mobile reading)`
  } else {
    return `GENERAL GUIDELINES:
- Age-appropriate language and concepts
- Clear moral teachings
- Engaging adventure elements
- CRITICAL: Maximum 1-2 sentences per page (for mobile reading)`
  }
}

/**
 * Generate a story in the background
 * This function is called after the response is sent to the client
 */
export async function generateStoryInBackground(storyId: string, params: StoryParams) {
  const pageCount = params.pageCount || 10
  console.log(`[STORY-GEN] Starting story generation for ID: ${storyId}`)
  console.log(`[STORY-GEN] Child: ${params.childName}, Age: ${params.childAge}, Pages: ${pageCount}`)
  console.log(`[STORY-GEN] Theme: ${params.theme}`)
    console.log(`[STORY-GEN] Language: ${params.style.language}`)
  console.log(`[STORY-GEN] KV Available: ${isKvAvailable}`)
  
  console.log(`[STORY-GEN] 🚀 Запускаем РЕАЛЬНУЮ AI генерацию истории...`)
  
  try {
    // Update status to indicate generation has started
    console.log(`[STORY-GEN] Updating story status to 'generating_story'`)
    await updateStory(storyId, {
      status: "generating_story",
    })

    // Generate the story content using OpenAI
    console.log(`[STORY-GEN] Starting story content generation with OpenAI GPT-4o...`)
    console.log(`[STORY-GEN] OpenAI API Key available: ${process.env.OPENAI_API_KEY ? 'YES' : 'NO'}`)
    
    let generatedStory: any
    try {
      console.log(`[STORY-GEN] Calling OpenAI GPT-4o API...`)
      const startTime = Date.now()
      
      // Добавляем таймаут для предотвращения зависания
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Story generation timeout after 60 seconds')), 60000)
      )
      
      // Use OpenAI for text generation as fallback
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required')
      }

      const generatePromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: `CRITICAL: Create a story with EXACTLY ${pageCount} pages. Not more, not less. The "pages" array must contain exactly ${pageCount} items.

Create a personalized children's story for ${params.childName}, a ${params.childAge}-year-old ${params.childGender === 'girl' ? 'girl' : 'boy'}.

STORY PARAMETERS:
- NUMBER OF PAGES: EXACTLY ${pageCount} pages (this is mandatory!)
- Main Character: ${params.childName} (${params.childAge} years old ${params.childGender === 'girl' ? 'girl' : 'boy'})
- Theme/Moral: ${getThemeDescription(params.theme, params.style.language)}
- Story Type: High-quality children's fairy tale with adventure and moral lesson
- Language: ${params.style.language === 'ru' ? 'Russian' : params.style.language === 'en' ? 'English' : 'Kazakh'}
${params.textStory ? `- Parent's Story Idea: ${params.textStory}` : ''}

AGE-APPROPRIATE COMPLEXITY:
${getAgeAppropriateGuidelines(params.childAge)}

STORY STRUCTURE (${pageCount} pages):
${pageCount <= 3 ?
`1. INTRODUCTION (1 page): Meet ${params.childName} and the adventure
2. ADVENTURE (${pageCount - 2} pages): ${params.childName}'s journey
3. CONCLUSION (1 page): Lesson learned and moral` :
pageCount <= 5 ?
`1. INTRODUCTION (1 page): Meet ${params.childName} and the problem
2. ADVENTURE (${pageCount - 2} pages): ${params.childName} faces challenges
3. CONCLUSION (1 page): Problem solved with moral lesson` :
`1. INTRODUCTION (2 pages): Meet ${params.childName} and the problem/adventure
2. ADVENTURE/CHALLENGES (${pageCount - 3} pages): ${params.childName} faces multiple challenges or experiences
3. RESOLUTION (1 page): Problem solved, lesson learned`}

STORY REQUIREMENTS:
- Feature ${params.childName} as the main character in EVERY scene
- Write exclusively in ${params.style.language === 'ru' ? 'Russian' : params.style.language === 'en' ? 'English' : 'Kazakh'} language
- Include a memorable repeating phrase/refrain that appears 2-3 times throughout the story
- Use age-appropriate vocabulary, sentence structure, and themes for ${params.childAge}-year-olds
- Build towards teaching the moral lesson: "${getThemeDescription(params.theme, params.style.language)}"
- Each page should follow the age complexity guidelines above
- Include emotions, character development, and moral growth
- Create a magical, engaging fairy tale atmosphere
- Use vivid descriptions that children can visualize
- Include dialogue and interactions with other characters
- Make ${params.childName} brave, kind, and relatable

CRITICAL TEXT LENGTH REQUIREMENT (FOR MOBILE READING):
- Each page MUST have ONLY 1-2 SHORT sentences
- Maximum 20-30 words per page
- 80% of users read on mobile phones - text must fit on small screens
- Break longer ideas into multiple pages
- Keep each page text brief and impactful

${params.textStory ? 
  `PARENT'S STORY INSPIRATION:
The parent provided this story idea: "${params.textStory}"
Use this as inspiration but expand it into a full structured children's story featuring ${params.childName}.` :
  `STORY TYPE:
Create an original adventure/tale that teaches "${params.theme}" - it can be:
- A magical adventure
- A problem-solving journey  
- A tale about friendship/kindness
- Any story that naturally teaches the moral`
}

STORY WITH ILLUSTRATIONS:
Create engaging text content AND detailed image prompts for each page.
Illustration Style: ${params.style.illustration}
Each page should include both compelling text and a vivid image description that matches the ${params.style.illustration} style.

CHARACTER CONSISTENCY REQUIREMENTS:
- ${params.childName} is a ${params.childGender === 'girl' ? 'girl' : 'boy'}, ${params.childAge} years old
- ${params.childName} must look EXACTLY the same in every single image (same age, face, hair, clothing, accessories)
- ${params.childName} must wear the SAME outfit throughout the entire story - do not change clothing between pages
- Use ${params.childGender === 'girl' ? 'she/her' : 'he/him'} pronouns for ${params.childName}
- Maintain consistent ${params.style.illustration} art style throughout all illustrations
- Describe ${params.childName}'s EXACT physical appearance and clothing in detail for each image prompt
- CRITICAL: The character's appearance, clothing, and style must be identical across all ${pageCount} pages
- Do not vary the character's outfit, hairstyle, or physical features between scenes

TITLE GENERATION:
Create an engaging, magical title that reflects ${params.childName}'s adventure and the theme "${getThemeDescription(params.theme, params.style.language)}". Make it sound like a classic fairy tale.

QUALITY REQUIREMENTS:
- Ensure the story flows naturally and engages young readers
- Each page should end with curiosity or excitement for the next page
- Include rich emotions and character development
- Make the story memorable and meaningful
- The moral should emerge naturally from the story, not be forced
- Create a story that parents will enjoy reading repeatedly
- Perfect for a ${params.childAge}-year-old child's attention span and comprehension level

INSTRUCTIONS FOR AI:
You are an expert children's story creator specializing in personalized, age-appropriate narratives. Your stories must:

1. PERSONALIZATION: Feature the named child as the protagonist in every scene
2. AGE ADAPTATION: Adjust vocabulary, sentence length, and complexity based on the child's age  
3. EDUCATIONAL VALUE: Seamlessly weave in the specified moral/theme
4. STRUCTURE: Follow the ${pageCount}-page structure with clear introduction, adventure, resolution, and moral
5. LANGUAGE: Write exclusively in the specified language with perfect grammar
6. REPETITION: Include a memorable phrase that repeats 2-3 times throughout the story
7. IMAGERY: Ensure every scene can be visualized for illustration purposes
8. EMOTIONAL ENGAGEMENT: Include age-appropriate emotions and character development

Create stories that parents will love reading with their children and that children will remember fondly.

FINAL REMINDER: Each page text MUST be 1-2 short sentences only (20-30 words max). This is for mobile phone reading.

Return your response as JSON with this exact structure (REMEMBER: exactly ${pageCount} pages in the array!):
      {
        "title": "Story title here",
        "pages": [
          {
            "chapter": "Page 1",
            "text": "One or two short sentences only. Maximum 20-30 words.",
            "imagePrompt": "Detailed image description for page 1"
          }
          // ... repeat for EXACTLY ${pageCount} pages total
        ],
        "moral": "The moral lesson of the story"
      }`
          }],
          response_format: { type: 'json_object' }
        })
      })
      
      // Используем Promise.race для таймаута  
      const response = await Promise.race([generatePromise, timeoutPromise])
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      const result = await response.json()
      const responseText = result.choices[0].message.content
      
      const endTime = Date.now()
      console.log(`[STORY-GEN] OpenAI API call completed in ${endTime - startTime}ms`)
      console.log(`[STORY-GEN] Raw response:`, responseText.substring(0, 500) + '...')
      
      // Parse JSON response
      generatedStory = JSON.parse(responseText)
      
    } catch (error) {
      console.error(`[STORY-GEN] Error generating story with OpenAI:`, error)
      
      // Если произошел таймаут или другая ошибка, создаем fallback историю
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log(`[STORY-GEN] ⚠️  Timeout occurred, creating fallback story...`)
        
        // Создаем простую fallback историю
        generatedStory = {
          object: {
            title: `${params.childName} и волшебное приключение`,
            pages: [
              { chapter: "1", text: `Жил-был ${params.childName}. ${params.childName} любил приключения.` },
              { chapter: "2", text: `Однажды ${params.childName} нашел волшебную дверь.` },
              { chapter: "3", text: `За дверью был удивительный мир полный чудес.` },
              { chapter: "4", text: `${params.childName} встретил доброго друга.` },
              { chapter: "5", text: `Вместе они отправились в путешествие.` },
              { chapter: "6", text: `По пути им встретились трудности.` },
              { chapter: "7", text: `${params.childName} проявил смелость и доброту.` },
              { chapter: "8", text: `Друзья помогли друг другу.` },
              { chapter: "9", text: `${params.childName} понял важный урок.` },
              { chapter: "10", text: `И с тех пор ${params.childName} всегда помнил о дружбе и доброте!` }
            ],
            moral: `${getThemeDescription(params.theme, params.style.language)} - важная часть жизни.`
          }
        }
        console.log(`[STORY-GEN] ✅ Fallback story created successfully`)
      } else {
        console.error(`[STORY-GEN] Error details:`, {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        })
        throw new Error(`Error generating story with OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    // Format the story for our application
    console.log(`[STORY-GEN] Formatting story content...`)
    // Add detailed debugging
    console.log(`[STORY-GEN] Raw generatedStory:`, JSON.stringify(generatedStory, null, 2))
    console.log(`[STORY-GEN] generatedStory type:`, typeof generatedStory)
    console.log(`[STORY-GEN] generatedStory keys:`, Object.keys(generatedStory || {}))
    
    // Debug pages specifically
    console.log(`[STORY-GEN] generatedStory.pages:`, generatedStory.pages)
    console.log(`[STORY-GEN] generatedStory.pages type:`, typeof generatedStory.pages)
    console.log(`[STORY-GEN] generatedStory.pages length:`, generatedStory.pages?.length)
    
    const story: StoryContent = {
      // OpenAI returns data directly, not in object wrapper
      title: generatedStory.title || `${params.childName}'s Adventure`,
      pages: generatedStory.pages?.map((page: any) => ({
        text: page.text,
        imagePrompt: page.imagePrompt,
      })) || [],
      moral: generatedStory.moral || "Every story teaches us something valuable about life and friendship!",
    }
    
    console.log(`[STORY-GEN] Final story object - Title: "${story.title}", Pages: ${story.pages?.length || 0}`)
    console.log(`[STORY-GEN] Story pages:`, story.pages)

    // Stringify the story content before updating
    const storyContentString = JSON.stringify(story)
    console.log(`[STORY-GEN] Story content formatted, length: ${storyContentString.length} characters`)

    // Start image generation
    console.log(`[STORY-GEN] Text generation complete, starting image generation`)
    await updateStory(storyId, {
      status: "generating_images",
      title: story.title,
      storyContent: storyContentString,
    })

    // Generate images for each page with timeout (limit to first 3 for faster testing)
    console.log(`[STORY-GEN] About to check story.pages for image generation`)
    console.log(`[STORY-GEN] story object:`, story)
    console.log(`[STORY-GEN] story.pages:`, story.pages)
    console.log(`[STORY-GEN] story.pages type:`, typeof story.pages)
    
    if (!story.pages || !Array.isArray(story.pages)) {
      console.error(`[STORY-GEN] ❌ story.pages is not a valid array:`, story.pages)
      throw new Error("Story pages is not a valid array")
    }
    
    const maxImages = story.pages.length // Generate all images
    console.log(`[STORY-GEN] Generating ${maxImages} illustrations with character consistency...`)
    const images: string[] = []
    let characterReference: string | undefined = undefined // Base64 of first image for consistency

    for (let i = 0; i < maxImages; i++) {
      const page = story.pages[i]
      console.log(`[STORY-GEN] Generating image ${i + 1}/${story.pages.length}: ${page.imagePrompt}`)
      console.log(`[STORY-GEN] Using character reference: ${characterReference ? 'YES' : 'NO (first image)'}`)

      try {
        const { generateImage } = await import("./image-generator")

        // Build the prompt with character consistency instructions
        const fullPrompt = `${page.imagePrompt}. Style: ${params.style.illustration}. Character: ${params.childName} (${params.childAge} years old). CRITICAL: Consistent character appearance throughout entire story.`

        // Add timeout for image generation (2 minutes per image)
        const imagePromise = generateImage(
          fullPrompt,
          storyId,
          i,
          characterReference // Pass reference image for pages 2+
        )

        const timeoutPromise = new Promise<{ imageUrl: string; base64Data: string }>((_, reject) => {
          setTimeout(() => reject(new Error('Image generation timeout after 2 minutes')), 120000)
        })

        const result = await Promise.race([imagePromise, timeoutPromise])
        images.push(result.imageUrl)

        // Save the first image's base64 as character reference for subsequent pages
        if (i === 0 && result.base64Data) {
          characterReference = result.base64Data
          console.log(`[STORY-GEN] ✅ Character reference saved (${result.base64Data.length} chars)`)

          // Also save to story for potential future use
          await updateStory(storyId, {
            characterReference: result.base64Data
          })
        }

        console.log(`[STORY-GEN] ✅ Image ${i + 1} generated: ${result.imageUrl}`)
      } catch (error) {
        console.error(`[STORY-GEN] ❌ Error generating image ${i + 1}:`, error)
        // Use placeholder for failed images
        const placeholderUrl = `/api/placeholder?height=400&width=600&text=${encodeURIComponent(page.imagePrompt.substring(0, 30))}`
        images.push(placeholderUrl)
        console.log(`[STORY-GEN] 🔄 Using placeholder for image ${i + 1}: ${placeholderUrl}`)
      }
    }

    // Add placeholders for remaining images
    for (let i = maxImages; i < story.pages.length; i++) {
      const page = story.pages[i]
      const placeholderUrl = `/api/placeholder?height=400&width=600&text=${encodeURIComponent(page.imagePrompt.substring(0, 30))}`
      images.push(placeholderUrl)
      console.log(`[STORY-GEN] 🔄 Added placeholder for image ${i + 1}: ${placeholderUrl}`)
    }

    const imagesString = JSON.stringify(images)
    console.log(`[STORY-GEN] All images processed: ${images.length} images (${maxImages} generated, ${story.pages.length - maxImages} placeholders)`)

    if (isKvAvailable) {
      await updateStory(storyId, {
        status: "complete",
        title: story.title,
        storyContent: storyContentString,
        images: imagesString,
        completedAt: new Date().toISOString(),
      })
    } else {
      // Для локальной разработки сохраняем в memory storage
      try {
        const { saveGeneratedStory } = await import('../app/api/story/[id]/route')
        const completeStory = {
          id: storyId,
          title: story.title,
          status: "complete",
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          storyContent: storyContentString,
          images: imagesString,
          childName: params.childName,
          childAge: params.childAge,
          theme: params.theme,
          visibility: "public"
        }
        console.log(`[STORY-GEN] Saving story ${storyId} to memory storage...`)
        console.log(`[STORY-GEN] Story data:`, { 
          id: storyId, 
          title: story.title, 
          status: "complete",
          childName: params.childName 
        })
        saveGeneratedStory(storyId, completeStory)
        console.log(`[STORY-GEN] ✅ Story ${storyId} saved to memory storage successfully!`)
      } catch (error) {
        console.error(`[STORY-GEN] Error saving to memory storage:`, error)
      }
    }
    
    console.log(`[STORY-GEN] Story generation completed successfully for ID: ${storyId}`)
  } catch (error) {
    console.error(`[STORY-GEN] Error in overall story generation process:`, error)
    console.error(`[STORY-GEN] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    // Update status to indicate failure
    console.log(`[STORY-GEN] Updating story status to 'failed'`)
    await updateStory(storyId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

