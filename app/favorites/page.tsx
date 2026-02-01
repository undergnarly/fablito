"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Heart } from "lucide-react"
import Image from "next/image"
import { useFavorites, type FavoriteStory } from "@/lib/favorites"
import { useToast } from "@/hooks/use-toast"
import { LanguageFlag } from "@/components/language-flag"

export default function FavoritesPage() {
  const { favorites, removeFavorite, cleanupFavorites, loaded } = useFavorites()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Clean up favorites when component mounts
  useEffect(() => {
    if (loaded && favorites.length > 0) {
      const cleanupFavoritesAsync = async () => {
        try {
          // Fetch all existing stories
          const response = await fetch('/api/stories')
          if (response.ok) {
            const stories = await response.json()
            const existingStoryIds = stories.map((story: any) => story.id)
            await cleanupFavorites(existingStoryIds)
          }
        } catch (error) {
          console.error('Error cleaning up favorites:', error)
        }
      }
      
      cleanupFavoritesAsync()
    }
  }, [loaded, cleanupFavorites])

  const handleRemoveFavorite = (story: FavoriteStory) => {
    removeFavorite(story.id)
    toast({
      title: "Removed from favorites",
      description: `"${story.title}" has been removed from your favorites`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="group text-white hover:text-white/80 hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-primary/10 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1 max-w-sm">
                <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-primary/10 rounded"></div>
                  <div className="h-4 bg-primary/10 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                Back to Home
              </span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="bg-background p-4 rounded-full shadow-md mb-6 relative z-10">
              <Heart size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white glow-text mb-4">
            My Favorite Stories
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">Stories you've saved for easy access</p>
        </div>

        {favorites.length === 0 ? (
          <Card className="border border-white/20 shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-xl bg-white/10 backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Heart className="h-12 w-12 text-pink-400/50" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4 text-white">No Favorites Yet</h2>
              <p className="text-white/70 mb-6">You haven't added any stories to your favorites yet.</p>
              <Link href="/stories">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  Browse Stories
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((story, index) => (
              <Card
                key={story.id}
                className="border border-white/20 shadow-lg overflow-hidden rounded-xl transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/10 backdrop-blur-sm h-[400px] flex flex-col"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animation: "fadeIn 0.5s ease-out forwards",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-xl line-clamp-2 text-white">{story.title}</CardTitle>
                  <CardDescription className="text-white/60">
                    {story.childName && `Starring ${story.childName} • `}
                    Added on {formatDate(story.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3 flex-1">
                    {story.previewImage ? (
                      <div className="aspect-video relative overflow-hidden rounded-md">
                        <Image
                          src={story.previewImage || "/api/placeholder?text=Изображение&width=400&height=400"}
                          alt={story.title}
                          fill
                          className="object-cover"
                          priority={index < 3}
                        />
                        
                        {/* Language flag */}
                        {story.style?.language && (
                          <div className="absolute top-2 left-2">
                            <LanguageFlag language={story.style.language} size="sm" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-white/10 rounded-md flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Link href={`/story/${story.id}`} className="flex-1 mr-2">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                        Read Story
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveFavorite(story)}
                      className="flex-shrink-0 border-white/20 bg-white/10 text-pink-400 hover:bg-white/20"
                    >
                      <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

