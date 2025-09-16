'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Sparkles, Wand2, ChevronRight } from "lucide-react"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { useLanguage } from "@/lib/language-context"
import { LanguageFlag } from "@/components/language-flag"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface Story {
  id: string
  title: string
  status: string
  createdAt: string
  childName?: string
  previewImage?: string
  style?: {
    language: 'ru' | 'en' | 'kz'
  }
}

interface HomeContentProps {
  stories: Story[]
}

export function HomeContent({ stories }: HomeContentProps) {
  const { t } = useLanguage()
  const { theme, resolvedTheme } = useTheme()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Determine which background image to use based on theme
  const backgroundImage = resolvedTheme === 'dark' 
    ? '/images/hero-background-night.png' 
    : '/images/hero-background-day.png'
  
  // Fallback gradient for when images don't load
  const fallbackGradient = resolvedTheme === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  
  // Reset image state when theme changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [resolvedTheme])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-bottom"
            style={{ 
              backgroundImage: imageError || !imageLoaded 
                ? fallbackGradient 
                : `url("${backgroundImage}"), ${fallbackGradient}`,
              backgroundSize: 'cover',
              backgroundPosition: 'bottom',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Hidden image to preload and detect errors */}
            <img
              src={backgroundImage}
              alt=""
              className="hidden"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12 relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-full shadow-lg relative z-10 animate-bounce-slow">
                <BookOpen size={60} className="text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">{t.heroTitle}</h1>
            <p className="text-xl md:text-2xl text-white max-w-2xl mb-8 drop-shadow-lg">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a href="#create-story" className="inline-block">
                <ShimmerButton
                  background="linear-gradient(to right, #9333ea, #ec4899)"
                  shimmerColor="rgba(255, 255, 255, 0.4)"
                  className="text-lg px-4 py-3 font-medium shadow-lg dark:text-foreground"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.createStoryButton}
                </ShimmerButton>
              </a>
              <Link href="/stories">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  {t.stories}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-4">
              {t.howItWorksTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-primary/10 relative">
                {/* Step number */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>

                <div className="pt-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{t.howItWorksStep1Title}</h3>
                  <p className="text-muted-foreground text-center">{t.howItWorksStep1Desc}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-primary/10 relative">
                {/* Step number */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>

                <div className="pt-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{t.howItWorksStep2Title}</h3>
                  <p className="text-muted-foreground text-center">{t.howItWorksStep2Desc}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-primary/10 relative">
                {/* Step number */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>

                <div className="pt-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{t.howItWorksStep3Title}</h3>
                  <p className="text-muted-foreground text-center">{t.howItWorksStep3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-16 px-4 md:px-8 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-4">
              {t.latestStoriesTitle}
            </h2>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">{t.noStoriesYet}</h3>
              <p className="text-muted-foreground mb-6">{t.createFirstStory}</p>
              <a href="#create-story">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t.createStoryButton}
                </Button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.slice(0, 6).map((story) => (
                <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 h-[400px] flex flex-col">
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Image at the top */}
                    {story.previewImage && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={story.previewImage}
                          alt={story.title}
                          className="object-cover w-full h-full"
                        />
                        
                        {/* Language flag */}
                        {story.style?.language && (
                          <div className="absolute top-2 left-2">
                            <LanguageFlag language={story.style.language} size="sm" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Text content below image */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{story.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {story.childName && `Starring ${story.childName} • `}
                          {formatDate(story.createdAt)}
                        </p>
                      </div>
                      
                      {/* Button at the bottom */}
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-muted-foreground capitalize">
                          {story.status === "generating" ? t.loading : ""}
                        </span>
                        <Link href={`/story/${story.id}`}>
                          <Button variant="outline" size="sm">
                            Read Story
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {stories.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/stories">
                <Button variant="outline" className="px-8 py-3">
                  View All Stories
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
