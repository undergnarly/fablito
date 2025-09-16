import { NextRequest, NextResponse } from 'next/server'
import { listStories } from '@/lib/db'
import { detectLanguageFromStory } from '@/lib/language-detector'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const allStories = await listStories()
    
    if (!allStories || allStories.length === 0) {
      return NextResponse.json([])
    }

    // Filter public stories and sort by creation date
    let filteredStories = allStories
      .filter((story) => story.visibility !== "unlisted")
      .map((story) => {
        // Parse images to get preview image
        let previewImage = null
        try {
          if (story.images) {
            const parsedImages = JSON.parse(story.images)
            previewImage = parsedImages[0] || null
            console.log(`[API] Story ${story.id} (${story.title}):`, {
              hasImages: !!story.images,
              imagesType: typeof story.images,
              parsedImagesLength: parsedImages.length,
              previewImage: previewImage
            })
          } else {
            console.log(`[API] Story ${story.id} (${story.title}): No images field`)
          }
        } catch (error) {
          console.error(`Error parsing images for story ${story.id}:`, error)
        }

        return {
          ...story,
          previewImage,
          // Ensure style information is preserved
          style: story.style || { language: detectLanguageFromStory(story) }
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply search filter if provided
    if (search) {
      const term = search.toLowerCase()
      filteredStories = filteredStories.filter(
        (story) =>
          story.title.toLowerCase().includes(term) || (story.prompt && story.prompt.toLowerCase().includes(term)),
      )
    }

    return NextResponse.json(filteredStories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}