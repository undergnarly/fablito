'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft, Loader2, Sparkles, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchSection } from "./client-components"
import { DeleteStoryButton } from "@/components/delete-story-button"
import { useLanguage } from "@/lib/language-context"
import { LanguageFlag } from "@/components/language-flag"

// Stories interface
interface Story {
  id: string
  title: string
  createdAt: string
  previewImage?: string
  prompt?: string
  visibility: string
  style?: {
    language: 'ru' | 'en' | 'kz'
  }
}


export default function StoriesPage() {
  const { t } = useLanguage()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Safe useSearchParams with error handling
  let searchTerm = ""
  try {
    const searchParams = useSearchParams()
    searchTerm = searchParams?.get("search") || ""
  } catch (err) {
    console.error('Error with useSearchParams:', err)
    searchTerm = ""
  }
  
  // Debug logging
  console.log('StoriesPage render:', { searchTerm, loading, error, storiesCount: stories.length })

  // Function to refresh stories after deletion
  const refreshStories = async () => {
    try {
      setLoading(true)
      setError(null)
      const updatedStories = await fetchStories(searchTerm)
      setStories(updatedStories)
      setLoading(false)
    } catch (err) {
      console.error('Error refreshing stories:', err)
      setError('Failed to refresh stories')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load stories when search term changes
    setLoading(true)
    setError(null)
    
    console.log('Loading stories with search term:', searchTerm)
    
    fetchStories(searchTerm)
      .then(stories => {
        console.log('Stories loaded successfully:', stories.length)
        setStories(stories)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading stories:', err)
        setError('Failed to load stories: ' + err.message)
        setLoading(false)
      })
  }, [searchTerm])

  // Fetch stories function for client side
  async function fetchStories(search?: string): Promise<Story[]> {
    const url = search ? `/api/stories?search=${encodeURIComponent(search)}` : '/api/stories'
    console.log('Fetching stories from URL:', url)
    
    const response = await fetch(url)
    console.log('Response status:', response.status, response.ok)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const stories = await response.json()
    console.log('Parsed stories:', stories.length, 'stories')
    return stories
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90">

      <div className="max-w-6xl mx-auto px-4 py-12 md:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
              <Button variant="ghost" className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-medium">
                  {t.backToHome}
                </span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/#create-story">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                <Sparkles className="mr-2 h-4 w-4" />
                {t.createNewStory}
              </Button>
            </Link>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md mb-6 relative z-10">
              <BookOpen size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            {t.allStories}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t.browseAllStories}</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search stories..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => {
                    // Simple search without URL updates for now
                    console.log('Search term changed:', e.target.value)
                  }}
                />
                <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                  🔍
                </div>
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {stories.length === 0
                    ? `No stories found for "${searchTerm}"`
                    : `Found ${stories.length} ${stories.length === 1 ? "story" : "stories"} for "${searchTerm}"`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Display Section */}
        {error && (
          <Card className="relative overflow-hidden border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4 text-red-800 dark:text-red-200">
                Something went wrong!
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-6">
                We encountered an error while trying to load the stories.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    fetchStories(searchTerm)
                      .then(stories => {
                        setStories(stories)
                        setLoading(false)
                      })
                      .catch(err => {
                        console.error('Error loading stories:', err)
                        setError('Failed to load stories')
                        setLoading(false)
                      })
                  }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300"
                >
                  <Loader2 className="mr-2 h-4 w-4" />
                  Try again
                </Button>
                <Link href="/">
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                    Go to homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading Display Section */}
        {loading && !error && (
          <Card className="relative overflow-hidden border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30">
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-4">Loading stories...</h2>
              <p className="text-muted-foreground">Please wait while we fetch your stories.</p>
            </CardContent>
          </Card>
        )}

        {/* Stories Display Section */}
        {!loading && !error && stories.length === 0 ? (
          <Card className="relative overflow-hidden border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30">
            <CardContent className="pt-6 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Sparkles className="h-12 w-12 text-primary/30" />
                  <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-4">
                {searchTerm ? `${t.noStoriesFound} "${searchTerm}"` : t.noStoriesYet}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try a different search term or browse all stories."
                  : t.createFirstStory}
              </p>
              {searchTerm ? (
                <Link href="/stories">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                    View All Stories
                  </Button>
                </Link>
              ) : (
                <Link href="/#create-story">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                    Create Your First Story
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : !loading && !error && stories.length > 0 && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <TabsTrigger value="all">{t.allStories}</TabsTrigger>
              <TabsTrigger value="recent">{t.recent}</TabsTrigger>
              <TabsTrigger value="popular">{t.popular}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, index) => (
                  <div
                    className="block"
                    key={story.id}
                  >
                    <Card className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 animate-in fade-in duration-500 h-[400px] flex flex-col">
                      <CardContent className="flex-1 flex flex-col p-0">
                        {/* Image at the top */}
                        {story.previewImage ? (
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <Image
                              src={story.previewImage}
                              alt={story.title}
                              fill
                              className="object-cover"
                              priority={index < 3}
                              onError={(e) => {
                                console.error(`Failed to load image for story ${story.id}:`, story.previewImage)
                              }}
                            />
                            
                            {/* Language flag */}
                            {story.style?.language && (
                              <div className="absolute top-2 left-2">
                                <LanguageFlag language={story.style.language} size="sm" />
                              </div>
                            )}

                            {/* Age badge */}
                            {story.age && (
                              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                Ages {story.age}
                              </div>
                            )}

                            {/* Status overlay */}
                            {story.status !== "complete" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                                  {story.status === "failed" ? "Failed" : "Generating..."}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Text content below image */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{story.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {story.childName && `Starring ${story.childName} • `}
                              Created on {formatDate(story.createdAt)}
                            </p>
                            {story.prompt && (
                              <p className="text-sm line-clamp-2 text-muted-foreground">{story.prompt}</p>
                            )}
                          </div>
                          
                          {/* Button at the bottom */}
                          <div className="mt-4">
                            {story.status === "complete" ? (
                              <Link href={`/story/${story.id}`} className="w-full">
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                                  Read Story
                                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                              </Link>
                            ) : story.status === "failed" ? (
                              <Button disabled className="w-full bg-red-500">
                                Generation Failed
                              </Button>
                            ) : (
                              <Link href={`/generating/${story.id}`} className="w-full">
                                <Button variant="outline" className="w-full group">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  View Progress
                                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.slice(0, 6).map((story, index) => (
                  <Card key={story.id} className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 animate-in fade-in duration-500 h-[400px] flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="text-xl line-clamp-2">{story.title}</CardTitle>
                      <CardDescription>
                        {story.childName && `Starring ${story.childName} • `}
                        Created on {formatDate(story.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3 flex-1">
                        {story.previewImage ? (
                          <div className="aspect-video relative overflow-hidden rounded-md">
                            <Image
                              src={story.previewImage}
                              alt={story.title}
                              fill
                              className="object-cover"
                              priority={index < 3}
                              onError={(e) => {
                                console.error(`Failed to load image for story ${story.id}:`, story.previewImage)
                              }}
                            />
                            
                            {/* Language flag */}
                            {story.style?.language && (
                              <div className="absolute top-2 left-2">
                                <LanguageFlag language={story.style.language} size="sm" />
                              </div>
                            )}

                            {/* Age badge */}
                            {story.age && (
                              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                Ages {story.age}
                              </div>
                            )}

                            {/* Status overlay */}
                            {story.status !== "complete" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                                  {story.status === "failed" ? "Failed" : "Generating..."}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        {story.status === "complete" ? (
                          <Link href={`/story/${story.id}`} className="w-full">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                              Read Story
                              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/generating/${story.id}`} className="w-full">
                            <Button variant="outline" className="w-full group">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              View Progress
                              <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                            </Button>
                          </Link>
                        )}
                        <DeleteStoryButton 
                          storyId={story.id} 
                          storyTitle={story.title}
                          onDelete={refreshStories}
                          variant="outline"
                          size="sm"
                          className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* For now, we'll just show the same stories but could be sorted by popularity metrics in the future */}
                {stories
                  .slice()
                  .sort(() => Math.random() - 0.5)
                  .map((story, index) => (
                    <Card key={story.id} className="relative overflow-hidden border border-primary/20 dark:bg-gradient-to-b dark:from-background dark:to-accent/30 animate-in fade-in duration-500 h-[400px] flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-xl line-clamp-2">{story.title}</CardTitle>
                        <CardDescription>
                          {story.childName && `Starring ${story.childName} • `}
                          Created on {formatDate(story.createdAt)}
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
                              />
                              
                              {/* Language flag */}
                              {story.style?.language && (
                                <div className="absolute top-2 left-2">
                                  <LanguageFlag language={story.style.language} size="sm" />
                                </div>
                              )}

                              {/* Age badge */}
                              {story.age && (
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                  Ages {story.age}
                                </div>
                              )}

                              {/* Status overlay */}
                              {story.status !== "complete" && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                  <div className="bg-white px-3 py-1 rounded-full text-sm font-medium">
                                    {story.status === "failed" ? "Failed" : "Generating..."}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          {story.status === "complete" ? (
                            <Link href={`/story/${story.id}`} className="w-full">
                              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 group">
                                Read Story
                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/generating/${story.id}`} className="w-full">
                              <Button variant="outline" className="w-full group">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                View Progress
                                <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

