import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getStory } from "@/lib/db"
import { notFound } from "next/navigation"
import StoryViewer from "./story-viewer"
import { FavoriteButton } from "./favorite-button"
import { generateOgImageUrl } from "@/lib/og-helpers"
import { VisibilityToggle } from "./visibility-toggle"
import { ExportButtons } from "@/components/export-buttons"
import { DeleteStoryButton } from "@/components/delete-story-button"
import { checkAdminAuth } from "@/app/admin/actions"
import { isKvAvailable } from "@/lib/settings"
import { translations } from "@/lib/i18n"

// Use Russian as default for server component
const t = translations.ru

export async function generateMetadata({ params }: { params: { id: string } }) {
  
  //const storyData = await getStory(params.id)
  // Next.js 15 Dynamic APIs are Asynchronous. https://nextjs.org/docs/messages/sync-dynamic-apis
  const { id } = await params
  
  // If KV is not available, return default metadata
  if (!isKvAvailable) {
    return {
      title: "🎆 Персональная История",
      description: "Волшебная персонализированная история для детей",
    }
  }
  
  const storyData = await getStory(id)

  if (!storyData) {
    return {
      title: "Story Not Found",
      description: "The requested story could not be found.",
    }
  }

  let storyContent = null
  let images = []

  try {
    if (storyData.storyContent) {
      storyContent = JSON.parse(storyData.storyContent)
    }

    if (storyData.images) {
      images = JSON.parse(storyData.images)
    }
  } catch (error) {
    console.error("Error parsing story data:", error)
  }

  // Get the first image if available
  const previewImage = images && images.length > 0 ? images[0] : null

  // Create the OG image URL
  const title = storyContent?.title || storyData.title
  const subtitle = `An alphabet story for ages ${storyData.age}`

  // Base URL for OpenGraph image - always use production URL for OG images
  const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://v0-story-maker.vercel.app"

  // Create the OG image URL with parameters
  // const ogImageUrl = new URL(`${baseUrl}/api/og`)
  // ogImageUrl.searchParams.append('title', title)
  // ogImageUrl.searchParams.append('subtitle', subtitle)
  // ogImageUrl.searchParams.append('type', 'story')

  // // Only add image if we have a valid URL (not a data URL)
  // if (previewImage && !previewImage.startsWith('data:')) {
  //   ogImageUrl.searchParams.append('image', previewImage)
  // }

  // Use the helper function
  const ogImageUrl = generateOgImageUrl({
    title: title,
    subtitle: `for ages ${storyData.age}`,
    imageUrl: previewImage,
    type: "story",
  })

  return {
    title: title,
    description: `Read "${title}", an AI-generated alphabet story for ages ${storyData.age}.`,
    openGraph: {
      title: title,
      description: `Read "${title}", an AI-generated alphabet story for ages ${storyData.age}.`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: `Read "${title}", an AI-generated alphabet story for ages ${storyData.age}.`,
      images: [ogImageUrl],
    },
  }
}

export default async function StoryPage({
  params: _params,
}: {
  params: Promise<{ id: string }>
}) {
  const params = await _params
  console.log(`[PAGE] StoryPage called with ID: "${params.id}", type: ${typeof params.id}`)
  
  // Check for invalid story ID
  if (!params.id || params.id === 'undefined' || params.id === 'null') {
    console.error(`[PAGE] Invalid story ID: "${params.id}"`)
    return notFound()
  }
  
  // If KV is not available, fetch from API storage
  if (!isKvAvailable) {
    console.log(`[PAGE] KV not available, fetching story ${params.id} from API`)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/story/${params.id}`, {
        cache: 'no-store' // Prevent caching to get real-time updates
      })
      
      if (!response.ok) {
        console.log(`[PAGE] API response not ok: ${response.status}`)
        return notFound()
      }
      
      const storyData = await response.json()
      console.log(`[PAGE] Retrieved story from API:`, storyData.title || 'No title')
      
      // Parse the story content and images with error handling
      let storyContent = null
      let images = []

      try {
        if (storyData.storyContent) {
          storyContent = JSON.parse(storyData.storyContent)
        }
      } catch (error) {
        console.error("Error parsing story content:", error)
      }

      try {
        if (storyData.images) {
          const parsedImages = JSON.parse(storyData.images)
          // Convert from array of objects to array of URLs
          images = parsedImages.map((img: any) => img.url || img)
        }
      } catch (error) {
        console.error("Error parsing images:", error)
      }

      // Get the first image as preview image
      const previewImage = images && images.length > 0 ? images[0] : null

      const isAdmin = await checkAdminAuth()

      return (
        <main className="min-h-screen bg-background pt-20">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <Button variant="ghost" className="gap-2 text-white hover:text-white/80 hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
              </Link>
              <div className="flex gap-2">
                <ExportButtons storyId={storyData.id} storyTitle={storyData.title} />
                <FavoriteButton 
                  storyId={storyData.id} 
                  storyTitle={storyData.title}
                  createdAt={storyData.createdAt}
                  previewImage={previewImage}
                  style={storyData.style}
                />
                <DeleteStoryButton storyId={storyData.id} storyTitle={storyData.title} />
                {isAdmin && (
                  <VisibilityToggle 
                    storyId={storyData.id} 
                    currentVisibility={storyData.visibility || 'public'} 
                  />
                )}
              </div>
            </div>

            {/* Story Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white glow-text mb-4">
                {storyData.title}
              </h1>
              <p className="text-lg text-white/70">
                {storyData.childName ? `Персональная история для ${storyData.childName}` : 'Персональная детская история'}
              </p>
            </div>

            {/* Client component for interactive story viewing */}
            <StoryViewer 
              storyId={storyData.id}
              storyContent={storyContent} 
              images={images} 
              isGenerating={storyData.status !== "complete"}
            />
          </div>
        </main>
      )
    } catch (error) {
      console.error(`[PAGE] Error fetching story from API:`, error)
      return notFound()
    }
  }
  
  // Server-side data fetching with KV
  const storyData = await getStory(params.id)

  if (!storyData) {
    notFound()
  }

  // Parse the story content and images with error handling
  let storyContent = null
  let images = []

  try {
    if (storyData.storyContent) {
      storyContent = JSON.parse(storyData.storyContent)
    }
  } catch (error) {
    console.error("Error parsing story content:", error)
  }

  try {
    if (storyData.images) {
      const parsedImages = JSON.parse(storyData.images)
      // Convert from array of objects to array of URLs
      images = parsedImages.map((img: any) => img.url || img)
    }
  } catch (error) {
    console.error("Error parsing images:", error)
  }

  // If the story is still in initial generation phase (no content yet)
  if (storyData.status === "generating" || (storyData.status === "generating_story" && !storyContent)) {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-background p-2 pt-20 md:p-4 md:pt-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/stories">
              <Button variant="ghost" className="group text-white hover:text-white/80 hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">{t.backToStories}</span>
              </Button>
            </Link>
          </div>

          <Card className="magic-card border-0 rounded-xl">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-6">
                <Loader2 className="h-12 w-12 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">{t.creatingYourStory}</h2>
              <p className="mb-6 text-white/70">{t.generationTakesTime}</p>
              <Link href={`/generating/${params.id}`}>
                <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition-all duration-300 text-white font-semibold">
                  {t.viewStoryInProgress}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // If the story failed to generate
  if (storyData.status === "failed") {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-background p-4 pt-20 md:p-8 md:pt-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/stories">
              <Button variant="ghost" className="group text-white hover:text-white/80 hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">{t.backToStories}</span>
              </Button>
            </Link>
          </div>

          <Card className="magic-card border-0 rounded-xl">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2 text-red-300">{t.somethingWentWrong}</h2>
              <p className="text-white/70">{t.createFirstStory}</p>
              {storyData.error && <p className="mt-2 text-sm bg-red-500/20 p-2 rounded text-red-300">{t.error}: {storyData.error}</p>}
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // If storyContent is missing or invalid
  if (!storyContent || !storyContent.title || !storyContent.pages) {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-background p-4 pt-20 md:p-8 md:pt-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link href="/stories">
              <Button variant="ghost" className="group text-white hover:text-white/80 hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">{t.backToStories}</span>
              </Button>
            </Link>
          </div>

          <Card className="magic-card border-0 rounded-xl">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2 text-red-300">{t.somethingWentWrong}</h2>
              <p className="text-white/70">{t.createFirstStory}</p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Show a banner if the story is still generating
  const isGenerating = storyData.status === "generating_story"

  // Get the first image as preview image
  const previewImage = images && images.length > 0 ? images[0] : null

  // Add this after the story title and age display
  const isAdmin = await checkAdminAuth()

  return (
    <main
      id="main-content"
      className="min-h-screen bg-background p-2 pt-20 md:p-4 md:pt-20"
    >
      <div className="max-w-4xl mx-auto">
        {isGenerating && (
          <Card className="magic-card border-0 rounded-xl mb-4">
            <div className="p-4 text-center text-yellow-300 flex items-center justify-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <p>
                {t.storyStillGenerating}{" "}
                <Link href={`/generating/${params.id}`} className="underline font-medium text-pink-400 hover:text-pink-300">
                  {t.viewStoryInProgress}
                </Link>
              </p>
            </div>
          </Card>
        )}

        <div className="text-center mb-4 relative">
          <div className="absolute right-0 top-0">
            <FavoriteButton
              storyId={params.id}
              storyTitle={storyContent.title}
              createdAt={storyData.createdAt}
              previewImage={previewImage}
              style={storyData.style}
            />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white glow-text mb-2">
            {storyContent.title}
          </h1>
          <p className="text-white/60 text-sm md:text-base">История для возраста {storyData.age}</p>
          {isAdmin && (
            <div className="mt-2">
              <VisibilityToggle storyId={params.id} initialVisibility={storyData.visibility || "public"} />
            </div>
          )}
        </div>

        {/* Client component for interactive story viewing */}
        <StoryViewer storyId={params.id} storyContent={storyContent} images={images} isGenerating={isGenerating} />

        {/* Back button - below the book */}
        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" className="group text-white hover:text-white/80 hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">{t.backToHome}</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

