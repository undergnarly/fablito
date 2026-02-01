'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Wand2, ChevronRight, BookOpen } from "lucide-react"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { useLanguage } from "@/lib/language-context"
import { LanguageFlag } from "@/components/language-flag"

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen">
      {/* Fixed Hero Background - stays in place while scrolling */}
      <div className="fixed inset-0 h-[100svh] z-0">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-background" />
        {/* Minimal gradient only at bottom for smooth transition */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, rgba(65, 19, 105, 0.8) 90%, rgb(65, 19, 105) 100%)'
          }}
        />

        {/* Hero content - centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-4 md:space-y-6">
            {/* Title with custom font */}
            <h1
              className="text-6xl md:text-8xl lg:text-9xl text-white"
              style={{
                fontFamily: 'SuperJoyful, cursive',
                textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 8px 25px rgba(0,0,0,0.6), 0 12px 50px rgba(0,0,0,0.4), 0 0 80px rgba(163,28,245,0.5)'
              }}
            >
              Fablito
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white font-semibold max-w-sm md:max-w-2xl mx-auto"
               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 15px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.4)' }}>
              {t.heroSubtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto md:max-w-none">
              <a href="#create-story" className="block w-full md:w-auto">
                <ShimmerButton
                  background="linear-gradient(135deg, #ff6b35 0%, #e63946 100%)"
                  shimmerColor="rgba(255, 255, 255, 0.6)"
                  className="w-full h-14 md:h-16 text-base md:text-lg px-8 font-bold shadow-2xl active:scale-95 transition-transform"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.createStoryButton}
                </ShimmerButton>
              </a>
              <Link href="/stories" className="block w-full md:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 md:h-16 text-base md:text-lg px-8 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 active:scale-95 transition-all"
                >
                  {t.stories}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronRight className="h-6 w-6 text-white/50 rotate-90" />
          </div>
        </div>
      </div>

      {/* Spacer for hero height */}
      <div className="h-[100svh]" />

      {/* Content that slides over the hero */}
      <div className="relative z-10 bg-gradient-to-b from-[#411369] via-[#5a1a8a] to-[#411369] rounded-t-[2rem] md:rounded-t-[3rem] -mt-8">
        {/* Features Section */}
        <section className="py-12 md:py-20 px-4 md:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 glow-text">
              {t.howItWorksTitle}
            </h2>
            <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto">
              {t.howItWorksSubtitle}
            </p>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-4 md:gap-8 snap-x snap-mandatory md:snap-none scrollbar-hide">
            {/* Step 1 */}
            <div className="flex-shrink-0 w-[280px] md:w-auto snap-center magic-card rounded-2xl p-6 md:p-8 text-center">
              <div className="bg-white/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <Wand2 className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">{t.howItWorksStep1Title}</h3>
              <p className="text-white/80 text-sm md:text-base">{t.howItWorksStep1Desc}</p>
            </div>

            {/* Step 2 */}
            <div className="flex-shrink-0 w-[280px] md:w-auto snap-center magic-card rounded-2xl p-6 md:p-8 text-center">
              <div className="bg-white/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">{t.howItWorksStep2Title}</h3>
              <p className="text-white/80 text-sm md:text-base">{t.howItWorksStep2Desc}</p>
            </div>

            {/* Step 3 */}
            <div className="flex-shrink-0 w-[280px] md:w-auto snap-center magic-card rounded-2xl p-6 md:p-8 text-center">
              <div className="bg-white/20 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">{t.howItWorksStep3Title}</h3>
              <p className="text-white/80 text-sm md:text-base">{t.howItWorksStep3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 glow-text">
              {t.latestStoriesTitle}
            </h2>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12 md:py-16 magic-card rounded-2xl mx-auto max-w-md">
              <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-white/60 mx-auto mb-4 md:mb-6" />
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-3">{t.noStoriesYet}</h3>
              <p className="text-white/70 mb-6 md:mb-8 px-4">{t.createFirstStory}</p>
              <a href="#create-story">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-base md:text-lg px-6 md:px-8 py-5 md:py-6 rounded-full hover:opacity-90 active:scale-95 transition-all">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.createStoryButton}
                </Button>
              </a>
            </div>
          ) : (
            <>
              {/* Horizontal scroll on mobile */}
              <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 snap-x snap-mandatory md:snap-none scrollbar-hide">
                {stories.slice(0, 6).map((story) => (
                  <Card
                    key={story.id}
                    className="flex-shrink-0 w-[280px] md:w-auto snap-center group bg-gradient-to-br from-[#A31CF5]/90 to-[#7b2cbf]/90 border-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,107,157,0.5)] hover:border-pink-400/50 h-[380px] md:h-[420px] flex flex-col overflow-hidden"
                  >
                    <CardContent className="flex-1 flex flex-col p-0">
                      {/* Image */}
                      {story.previewImage && (
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={story.previewImage}
                            alt={story.title}
                            className="object-cover w-full h-full transition-all duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#A31CF5]/50 to-transparent" />

                          {/* Language flag */}
                          {story.style?.language && (
                            <div className="absolute top-3 left-3">
                              <LanguageFlag language={story.style.language} size="sm" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg md:text-xl mb-2 text-white line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-xs md:text-sm text-white/70">
                            {story.childName && `${story.childName} • `}
                            {formatDate(story.createdAt)}
                          </p>
                        </div>

                        {/* Button */}
                        <div className="flex justify-between items-center mt-3 md:mt-4">
                          <span className="text-xs md:text-sm text-white/60 capitalize">
                            {story.status === "generating" ? t.loading : ""}
                          </span>
                          <Link href={`/story/${story.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-full text-sm px-4 py-2 active:scale-95 transition-all"
                            >
                              Read
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {stories.length > 6 && (
                <div className="text-center mt-8 md:mt-12">
                  <Link href="/stories">
                    <Button
                      variant="outline"
                      className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full active:scale-95 transition-all"
                    >
                      View All Stories
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      </div>
    </div>
  )
}
