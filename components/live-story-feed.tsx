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

  // Initialize with first few stories
  useEffect(() => {
    if (stories.length === 0) return

    const initialCount = Math.min(5, stories.length)
    const initialStories = stories.slice(0, initialCount).map((story, index) => ({
      ...story,
      displayTime: 20 + index * 10,
      isNew: false
    }))
    setVisibleStories(initialStories)
    setCurrentIndex(initialCount)
  }, [stories])

  // Add new story every 5-15 seconds
  useEffect(() => {
    if (stories.length === 0) return

    const maxVisible = 20

    const addNewStory = () => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= stories.length) {
          setVisibleStories([{
            ...stories[0],
            displayTime: 0,
            isNew: true
          }])
          return 1
        }
        return nextIndex
      })

      setVisibleStories(prev => {
        const storyToAdd = stories[currentIndex % stories.length]

        const alreadyVisible = prev.some(s => s.id === storyToAdd.id)
        if (alreadyVisible) {
          return prev.map(s => ({ ...s, isNew: false }))
        }

        const newStory: VisibleStory = {
          ...storyToAdd,
          displayTime: 0,
          isNew: true
        }

        const updated = [newStory, ...prev.map(s => ({ ...s, isNew: false }))]
        return updated.slice(0, maxVisible)
      })
    }

    const getRandomInterval = () => Math.floor(Math.random() * 10000) + 5000

    let timeoutId: NodeJS.Timeout

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        addNewStory()
        scheduleNext()
      }, getRandomInterval())
    }

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
          isNew: story.displayTime < 3
        }))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (stories.length === 0) return null

  // Calculate opacity based on index (first 3 fully visible, then fade)
  const getOpacity = (index: number) => {
    if (index < 3) return 1
    if (index === 3) return 0.5
    if (index === 4) return 0.25
    return 0.1
  }

  return (
    <div className="w-full max-w-[calc(100vw-2rem)] md:max-w-2xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
          <span
            className="text-sm md:text-base font-medium text-white uppercase tracking-wide"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)' }}
          >
            {language === 'ru' ? 'Создаётся прямо сейчас' : language === 'kz' ? 'Қазір жасалуда' : 'Creating now'}
          </span>
        </div>
      </div>

      {/* Stories feed */}
      <div className="relative overflow-hidden">
        {/* Gradient fade on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-[#411369] via-[#411369]/80 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {visibleStories.map((story, index) => (
            <Link
              key={`${story.id}-${story.displayTime}`}
              href={`/story/${story.id}`}
              className="flex-shrink-0 group relative"
              style={{
                opacity: getOpacity(index),
                transition: 'opacity 0.5s ease-out'
              }}
            >
              {/* Card */}
              <div
                className={`
                  relative rounded-xl overflow-hidden
                  w-[100px] md:w-[130px] lg:w-[150px]
                  bg-white/10 backdrop-blur-sm
                  border border-white/20
                  transition-all duration-500
                  group-hover:border-white/40 group-hover:bg-white/15
                  ${story.isNew ? 'ring-2 ring-orange-400/70 shadow-[0_0_30px_rgba(251,146,60,0.5)]' : ''}
                `}
              >
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

                  {/* New badge - orange */}
                  {story.isNew && (
                    <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 flex items-center gap-0.5 bg-orange-500 text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                      <Sparkles className="w-2 h-2 md:w-2.5 md:h-2.5" />
                      NEW
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 md:bottom-2 md:left-2 md:right-2">
                    <p className="text-[9px] md:text-[11px] text-white/90 truncate font-medium mb-0.5">
                      {story.title}
                    </p>
                    <p className={`
                      text-[8px] md:text-[10px]
                      ${story.displayTime < 10 ? 'text-orange-300' : 'text-white/50'}
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
