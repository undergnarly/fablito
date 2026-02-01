'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BookOpen, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface Story {
  id: string
  title: string
  previewImage?: string
  childName?: string
  createdAt: string
}

interface LiveStoryFeedProps {
  stories: Story[]
}

interface VisibleStory extends Story {
  displayTime: number // seconds since "appeared"
  isNew: boolean
}

export function LiveStoryFeed({ stories }: LiveStoryFeedProps) {
  const { t, language } = useLanguage()
  const [visibleStories, setVisibleStories] = useState<VisibleStory[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Format relative time
  const formatRelativeTime = useCallback((seconds: number): string => {
    if (seconds < 5) {
      return language === 'ru' ? 'только что' : language === 'kz' ? 'жаңа ғана' : 'just now'
    }
    if (seconds < 60) {
      if (language === 'ru') {
        const lastDigit = seconds % 10
        const lastTwoDigits = seconds % 100
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${seconds} секунд назад`
        if (lastDigit === 1) return `${seconds} секунду назад`
        if (lastDigit >= 2 && lastDigit <= 4) return `${seconds} секунды назад`
        return `${seconds} секунд назад`
      }
      if (language === 'kz') return `${seconds} секунд бұрын`
      return `${seconds}s ago`
    }
    const minutes = Math.floor(seconds / 60)
    if (language === 'ru') {
      const lastDigit = minutes % 10
      const lastTwoDigits = minutes % 100
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${minutes} минут назад`
      if (lastDigit === 1) return `${minutes} минуту назад`
      if (lastDigit >= 2 && lastDigit <= 4) return `${minutes} минуты назад`
      return `${minutes} минут назад`
    }
    if (language === 'kz') return `${minutes} минут бұрын`
    return `${minutes}m ago`
  }, [language])

  // Initialize with first 2-3 stories
  useEffect(() => {
    if (stories.length === 0) return

    const initialStories = stories.slice(0, 3).map((story, index) => ({
      ...story,
      displayTime: 30 + index * 15, // Stagger initial times
      isNew: false
    }))
    setVisibleStories(initialStories)
    setCurrentIndex(3)
  }, [stories])

  // Add new story every 3-7 seconds
  useEffect(() => {
    if (stories.length === 0) return

    const addNewStory = () => {
      setVisibleStories(prev => {
        const storyToAdd = stories[currentIndex % stories.length]

        // Check if this story is already visible
        const alreadyVisible = prev.some(s => s.id === storyToAdd.id)
        if (alreadyVisible) {
          // Just update times and remove oldest if needed
          return prev.map(s => ({ ...s, isNew: false }))
        }

        const newStory: VisibleStory = {
          ...storyToAdd,
          displayTime: 0,
          isNew: true
        }

        // Keep max 8 stories visible, remove oldest
        const updated = [newStory, ...prev.map(s => ({ ...s, isNew: false }))]
        return updated.slice(0, 8)
      })

      setCurrentIndex(prev => prev + 1)
    }

    // Random interval between 3-7 seconds
    const getRandomInterval = () => Math.floor(Math.random() * 4000) + 3000

    let timeoutId: NodeJS.Timeout

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        addNewStory()
        scheduleNext()
      }, getRandomInterval())
    }

    // Start after initial delay
    timeoutId = setTimeout(() => {
      addNewStory()
      scheduleNext()
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [stories, currentIndex])

  // Update display times every second
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleStories(prev =>
        prev.map(story => ({
          ...story,
          displayTime: story.displayTime + 1,
          isNew: story.displayTime < 3 // Keep "new" effect for 3 seconds
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (stories.length === 0) return null

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-white/60 uppercase tracking-wider">
            {language === 'ru' ? 'Создаётся прямо сейчас' : language === 'kz' ? 'Қазір жасалуда' : 'Creating now'}
          </span>
        </div>
      </div>

      {/* Stories feed - horizontal scroll */}
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {visibleStories.map((story) => (
            <Link
              key={`${story.id}-${story.displayTime}`}
              href={`/story/${story.id}`}
              className={`
                flex-shrink-0 snap-start
                group relative
                w-[140px] md:w-[160px]
                transition-all duration-500 ease-out
                ${story.isNew ? 'animate-slide-in scale-105' : 'scale-100'}
              `}
            >
              {/* Card */}
              <div className={`
                relative rounded-xl overflow-hidden
                bg-white/10 backdrop-blur-sm
                border border-white/20
                transition-all duration-300
                group-hover:border-white/40 group-hover:bg-white/15
                ${story.isNew ? 'ring-2 ring-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]' : ''}
              `}>
                {/* Image */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  {story.previewImage ? (
                    <img
                      src={story.previewImage}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/50" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* New badge */}
                  {story.isNew && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" />
                      NEW
                    </div>
                  )}

                  {/* Time badge */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[10px] md:text-xs text-white/90 truncate font-medium mb-0.5">
                      {story.title}
                    </p>
                    <p className={`
                      text-[9px] md:text-[10px]
                      ${story.displayTime < 10 ? 'text-green-300' : 'text-white/60'}
                      transition-colors duration-300
                    `}>
                      {formatRelativeTime(story.displayTime)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
