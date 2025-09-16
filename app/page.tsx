import { unstable_cache } from "next/cache"
import { listStories } from "@/lib/db"
import { getHomeSettings } from "./home-settings-provider"
import { HomeContent } from "@/components/home-content"
import { CreateStorySection } from "@/components/create-story-section"
import { detectLanguageFromStory } from "@/lib/language-detector"

export const maxDuration = 120

// Cache the stories for 30 seconds
const getStoriesWithCache = unstable_cache(
  async () => {
    const allStories = await listStories()

    if (!allStories || allStories.length === 0) {
      return []
    }

    // Process stories for the response
    const processedStories = allStories.map((story) => {
      // Remove sensitive data but keep style information
      const { deletionToken, storyContent, images, ...safeStoryData } = story

      // Parse images with error handling
      let previewImage = null
      try {
        if (images) {
          const parsedImages = JSON.parse(images)
          previewImage = parsedImages[0] || null
        }
      } catch (error) {
        console.error(`Error parsing images for story ${story.id}:`, error)
      }

      return {
        ...safeStoryData,
        previewImage,
        // Ensure style information is preserved
        style: story.style || { language: detectLanguageFromStory(story) }
      }
    })

    // Filter out failed stories and unlisted stories
    // Then sort by creation date (newest first)
    return processedStories
      .filter((story) => story.status !== "failed")
      .filter((story) => story.visibility !== "unlisted")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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