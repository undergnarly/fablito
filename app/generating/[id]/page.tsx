"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, BookOpen, ImageIcon, Sparkles, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export default function GeneratingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useLanguage()
  const [status, setStatus] = useState<string>("generating")
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [imagesGenerated, setImagesGenerated] = useState<number>(0)
  const [notificationPermission, setNotificationPermission] = useState<string>("default")
  const [storyData, setStoryData] = useState<any>(null)
  const [notificationSent, setNotificationSent] = useState<boolean>(false)
  const [pagesCount, setPagesCount] = useState<number>(10)

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)

      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission)
        })
      }
    }
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/story/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch story status")
        }

        const data = await response.json()
        setStatus(data.status)
        setStoryData(data)

        // Get the pages count from the story content
        if (data.storyContent) {
          try {
            const content = JSON.parse(data.storyContent)
            if (content && content.pages) {
              setPagesCount(content.pages.length)
            }
          } catch (e) {
            console.error("Error parsing story content:", e)
          }
        }

        // Calculate progress based on status
        if (data.status === "generating") {
          setProgress(10)
        } else if (data.status === "generating_story") {
          setProgress(40)
        } else if (data.status === "generating_images") {
          // Check how many images have been generated so far
          let imageCount = 0
          if (data.images) {
            try {
              const images = JSON.parse(data.images)
              imageCount = images.length
              setImagesGenerated(imageCount)
            } catch (e) {
              console.error("Error parsing images:", e)
            }
          }

          // Calculate progress based on image generation
          const baseProgress = 40 // Story generation complete
          const imageProgress = 60 // Remaining progress for images

          // Calculate progress percentage
          const imageProgressPercentage = imageCount / pagesCount
          const totalProgress = baseProgress + imageProgress * imageProgressPercentage

          setProgress(totalProgress)
        } else if (data.status === "complete") {
          setProgress(100)

          // Send browser notification if permission granted and not already sent
          if (notificationPermission === "granted" && !notificationSent) {
            const notification = new Notification(t.storyReady, {
              body: `"${data.title}" is now ready to read!`,
              icon: "/favicon.ico",
            })

            notification.onclick = () => {
              window.focus()
              router.push(`/story/${id}`)
            }

            setNotificationSent(true)
          }

          // Redirect to the story page after a short delay
          setTimeout(() => {
            router.push(`/story/${id}`)
          }, 1500)
        } else if (data.status === "failed") {
          setError(data.error || "Story generation failed")
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      }
    }

    // Check status immediately
    checkStatus()

    // Then check every 3 seconds
    const interval = setInterval(checkStatus, 3000)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [id, router, notificationPermission, notificationSent, pagesCount])

  const getStatusMessage = () => {
    switch (status) {
      case "generating":
        return t.preparingStory
      case "generating_story":
        return t.writingStory
      case "generating_images":
        return `${t.drawingIllustrations} (${imagesGenerated}/${pagesCount} complete)...`
      case "complete":
        return t.storyReady
      case "failed":
        return t.somethingWentWrong
      default:
        return t.creatingYourStory
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "generating":
        return <Sparkles className="w-8 h-8 text-yellow-500" />
      case "generating_story":
        return <BookOpen className="w-8 h-8 text-blue-500" />
      case "generating_images":
        return <ImageIcon className="w-8 h-8 text-green-500" />
      case "complete":
        return <Sparkles className="w-8 h-8 text-primary" />
      default:
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />
    }
  }

  // Check if we can show a preview (story content exists)
  const canShowPreview = () => {
    return status === "generating_images" || status === "complete"
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#411369] via-[#5a1a8a] to-[#411369] p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md border border-white/20 shadow-2xl rounded-2xl bg-gradient-to-br from-[#A31CF5]/90 to-[#7b2cbf]/90 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {error ? (
              <div className="text-red-300">
                <h2 className="text-xl font-bold mb-2 text-white">{t.error}</h2>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-white/30 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">{getStatusIcon()}</div>
                </div>

                <div className="space-y-4 w-full">
                  <h2 className="text-xl font-bold text-white">{getStatusMessage()}</h2>
                  <Progress value={progress} className="h-2 bg-white/20" />
                  <p className="text-white/70 text-sm">
                    {t.generationTakesTime}
                  </p>
                </div>

                {canShowPreview() && (
                  <div className="w-full pt-4">
                    <Link href={`/story/${id}`}>
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full py-6">
                        <Eye className="mr-2 h-4 w-4" />
                        {t.viewStoryInProgress}
                      </Button>
                    </Link>
                    <p className="text-xs text-white/60 mt-2">
                      {t.storyStillGenerating}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

