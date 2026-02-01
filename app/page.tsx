import { unstable_cache } from "next/cache"
import { listStories } from "@/lib/db"
import { getHomeSettings } from "./home-settings-provider"
import { HomeContent } from "@/components/home-content"
import { CreateStorySection } from "@/components/create-story-section"
import { detectLanguageFromStory } from "@/lib/language-detector"

export const maxDuration = 120

// Maximum stories to show on home page (to keep cache under 2MB limit)
const MAX_HOME_STORIES = 100

// Cache the stories for 30 seconds
const getStoriesWithCache = unstable_cache(
  async () => {
    const allStories = await listStories()

    if (!allStories || allStories.length === 0) {
      return []
    }

    // Filter out failed stories and unlisted stories first
    // Then sort by creation date (newest first)
    const filteredStories = allStories
      .filter((story) => story.status !== "failed")
      .filter((story) => story.visibility !== "unlisted")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_HOME_STORIES) // Limit to avoid cache overflow

    // Process stories for the response - only keep essential fields for home page
    return filteredStories.map((story) => {
      // Parse images with error handling - only get first image for preview
      let previewImage = null
      try {
        if (story.images) {
          const parsedImages = JSON.parse(story.images)
          previewImage = parsedImages[0] || null
        }
      } catch (error) {
        console.error(`Error parsing images for story ${story.id}:`, error)
      }

      // Return only essential fields for home page display
      return {
        id: story.id,
        title: story.title,
        childName: story.childName,
        childAge: story.childAge,
        status: story.status,
        visibility: story.visibility,
        createdAt: story.createdAt,
        previewImage,
        style: story.style || { language: detectLanguageFromStory(story) }
      }
    })
  },
  ["stories-list"],
  { revalidate: 30 }, // Revalidate every 30 seconds
)

export default async function Home() {
  const stories = await getStoriesWithCache()
  const settings = await getHomeSettings()

  return (
    <>
      <HomeContent stories={stories} />
      <CreateStorySection submissionsHalted={settings.SUBMISSIONS_HALTED} />
    </>
  )
}