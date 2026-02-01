import { NextRequest, NextResponse } from 'next/server'
import { listStories } from '@/lib/db'
import { detectLanguageFromStory } from '@/lib/language-detector'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const includeUnlisted = searchParams.get('includeUnlisted') === 'true'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const allStories = await listStories()

    if (!allStories || allStories.length === 0) {
      return NextResponse.json(includeUnlisted ? { stories: [], total: 0 } : [])
    }

    // Filter stories based on visibility
    let filteredStories = allStories
      .filter((story) => includeUnlisted || story.visibility !== "unlisted")
      .map((story) => {
        // Parse images to get preview image (only the first one for efficiency)
        let previewImage = null
        try {
          if (story.images) {
            const parsedImages = JSON.parse(story.images)
            previewImage = parsedImages[0] || null
          }
        } catch (error) {
          // Ignore parsing errors
        }

        // Return minimal data for list view (exclude heavy fields)
        const { storyContent, images, deletionToken, ...safeData } = story
        return {
          ...safeData,
          previewImage,
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

    const total = filteredStories.length

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedStories = filteredStories.slice(startIndex, startIndex + limit)

    // Return in appropriate format based on request type
    if (includeUnlisted) {
      return NextResponse.json({ stories: paginatedStories, total, page, limit })
    }
    return NextResponse.json(paginatedStories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}