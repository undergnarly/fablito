"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Share2, RefreshCw, Sparkles, Download, Facebook, Twitter, BookOpen, Maximize, Minimize, Volume2, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ALPHABET } from "@/lib/constants"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { TextToSpeech } from "@/components/text-to-speech"
import { detectLanguageFromStory } from "@/lib/language-detector"

interface StoryPage {
  text: string
  imagePrompt: string
}

interface StoryContent {
  title: string
  pages: StoryPage[]
  moral?: string
  style?: {
    language: 'ru' | 'en' | 'kz'
  }
}

interface StoryViewerProps {
  storyId: string
  storyContent: StoryContent
  images: string[]
  isGenerating?: boolean
}

export default function StoryViewer({ storyId, storyContent, images, isGenerating = false }: StoryViewerProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [currentPage, setCurrentPage] = useState<number>(0)
  
  // Safety check for story content
  if (!storyContent || !storyContent.pages || storyContent.pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <h3 className="text-lg font-semibold mb-2">История загружается...</h3>
          <p className="text-muted-foreground">Пожалуйста, подождите пока история создается.</p>
        </div>
      </div>
    )
  }

  // Определяем язык истории
  const storyLanguage = storyContent.style?.language || detectLanguageFromStory(storyContent)
  const [imageError, setImageError] = useState<boolean>(false)
  const [currentImages, setCurrentImages] = useState<string[]>(images)
  const [pageTransition, setPageTransition] = useState<"none" | "fade-out" | "fade-in">("none")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const storyUrl = typeof window !== "undefined" ? `${window.location.origin}/story/${storyId}` : ""
  const [showMoral, setShowMoral] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPlayingFullStory, setIsPlayingFullStory] = useState(false)
  const [autoPlayPage, setAutoPlayPage] = useState(false)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  // Refs for the story container to enable print functionality
  const storyContainerRef = useRef<HTMLDivElement>(null)

  // Fullscreen and zoom functions
  const toggleFullscreen = async () => {
    if (!fullscreenRef.current) return

    try {
      if (!isFullscreen) {
        if (fullscreenRef.current.requestFullscreen) {
          await fullscreenRef.current.requestFullscreen()
        } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
          await (fullscreenRef.current as any).webkitRequestFullscreen()
        } else if ((fullscreenRef.current as any).msRequestFullscreen) {
          await (fullscreenRef.current as any).msRequestFullscreen()
        }
        setIsFullscreen(true)

        // Try to lock orientation to landscape on mobile
        try {
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock('landscape')
          }
        } catch (e) {
          // Orientation lock not supported or not allowed
          console.log('Orientation lock not available')
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }

        // Unlock orientation when exiting fullscreen
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock()
          }
        } catch (e) {
          console.log('Orientation unlock not available')
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  // Функция для обработки текста полной истории для сказочного чтения
  const processStoryTextForFullReading = (text: string) => {
    let processedText = text
    
    // Добавляем паузы между страницами
    processedText = processedText.replace(/\.\s+/g, '. ')
    processedText = processedText.replace(/!\s+/g, '! ')
    processedText = processedText.replace(/\?\s+/g, '? ')
    
    // Добавляем паузы после запятых
    processedText = processedText.replace(/,/g, ', ')
    
    // Убираем лишние пробелы
    processedText = processedText.replace(/\s+/g, ' ').trim()
    
    return processedText
  }

  // Text-to-speech for full story
  const playFullStory = () => {
    if (!storyContent?.pages) return

    // Stop any current speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }

    // Обрабатываем текст для сказочного чтения
    const fullText = storyContent.pages.map(page => page.text).join(' ')
    const processedText = processStoryTextForFullReading(fullText)
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(processedText)
      
      // Set language
      const languageMap: Record<string, string> = {
        'ru': 'ru-RU',
        'en': 'en-US',
        'kz': 'kk-KZ'
      }
      
      const targetLanguage = languageMap[storyLanguage] || 'ru-RU'
      const voices = speechSynthesis.getVoices()
      const voice = voices.find(v => v.lang.startsWith(targetLanguage)) || voices[0]
      
      if (voice) {
        utterance.voice = voice
      }
      
      utterance.rate = 0.8
      utterance.pitch = 1.1
      utterance.volume = 1.0
      
      utterance.onstart = () => {
        setIsPlayingFullStory(true)
      }
      
      utterance.onend = () => {
        setIsPlayingFullStory(false)
      }
      
      utterance.onerror = () => {
        setIsPlayingFullStory(false)
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  const stopFullStory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsPlayingFullStory(false)
    }
  }

  // Auto-play current page
  const playCurrentPage = () => {
    if (!storyContent?.pages || !storyContent.pages[currentPage]) return

    // Stop any current speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }

    const pageText = storyContent.pages[currentPage].text
    const processedText = processStoryTextForFullReading(pageText)
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(processedText)
      
      // Set language
      const languageMap: Record<string, string> = {
        'ru': 'ru-RU',
        'en': 'en-US',
        'kz': 'kk-KZ'
      }
      
      const targetLanguage = languageMap[storyLanguage] || 'ru-RU'
      const voices = speechSynthesis.getVoices()
      const voice = voices.find(v => v.lang.startsWith(targetLanguage)) || voices[0]
      
      if (voice) {
        utterance.voice = voice
      }
      
      utterance.rate = 0.8
      utterance.pitch = 1.1
      utterance.volume = 1.0
      
      speechSynthesis.speak(utterance)
    }
  }

  // Listen for fullscreen changes and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for fullscreen toggle
      if (event.key === 'F11') {
        event.preventDefault()
        toggleFullscreen()
      }
      // Escape to exit fullscreen
      else if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen()
      }
      // Plus/Minus for zoom
      else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        handleZoomIn()
      }
      else if (event.key === '-') {
        event.preventDefault()
        handleZoomOut()
      }
      // 0 for reset zoom
      else if (event.key === '0') {
        event.preventDefault()
        resetZoom()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  // Auto-play page when currentPage changes and autoPlayPage is enabled
  useEffect(() => {
    if (autoPlayPage && storyContent?.pages && storyContent.pages[currentPage]) {
      // Small delay to allow page transition to complete
      const timer = setTimeout(() => {
        playCurrentPage()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [currentPage, autoPlayPage, storyContent])

  // If the story is still generating, periodically check for new images
  useEffect(() => {
    if (!isGenerating) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/story/${storyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.images) {
            const newImages = JSON.parse(data.images)
            setCurrentImages(newImages)
          }
        }
      } catch (error) {
        console.error("Error refreshing images:", error)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [isGenerating, storyId])

  // Update images when props change
  useEffect(() => {
    setCurrentImages(images)
  }, [images])

  const handleNextPage = () => {
    // Stop any current speech when changing pages
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    
    if (storyContent && currentPage < storyContent.pages.length - 1) {
      setPageTransition("fade-out")
      setTimeout(() => {
        setCurrentPage(currentPage + 1)
        setImageError(false)
        setPageTransition("fade-in")
        setTimeout(() => {
          setPageTransition("none")
        }, 300)
      }, 300)
    } else if (currentPage === storyContent.pages.length - 1 && storyContent.moral) {
      // Show moral when reaching the last page
      setShowMoral(true)
    }
  }

  const handlePrevPage = () => {
    // Stop any current speech when changing pages
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    
    if (currentPage > 0) {
      setPageTransition("fade-out")
      setTimeout(() => {
        setCurrentPage(currentPage - 1)
        setImageError(false)
        setPageTransition("fade-in")
        setTimeout(() => {
          setPageTransition("none")
        }, 300)
      }, 300)
    }
  }

  const handleShare = () => {
    // Use Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: storyContent.title,
          text: `Check out this ABC story: ${storyContent.title}`,
          url: window.location.href,
        })
        .catch((error) => {
          // Only log non-cancellation errors
          if (error.name !== 'AbortError') {
            console.error("Error sharing:", error)
          }
          // Fallback to copying the link
          copyLinkToClipboard()
        })
    } else {
      // Fallback for browsers that don't support Web Share API
      setShareDialogOpen(true)
    }
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied!",
      description: "Share this link with friends to show them your story",
    })
    setShareDialogOpen(false)
  }

  const refreshImages = async () => {
    try {
      const response = await fetch(`/api/story/${storyId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.images) {
          const newImages = JSON.parse(data.images)
          setCurrentImages(newImages)
          toast({
            title: "Images refreshed",
            description: "The latest images have been loaded",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh images",
        variant: "destructive",
      })
    }
  }

  // Print the story
  const printStory = () => {
    if (typeof window !== "undefined") {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${storyContent.title}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { text-align: center; color: #9333ea; }
            .page { page-break-after: always; margin-bottom: 30px; }
            .page-content { margin-top: 20px; font-size: 18px; line-height: 1.6; }
            .letter { font-size: 36px; font-weight: bold; color: #9333ea; }
            .moral { border-top: 1px solid #ddd; padding-top: 20px; font-style: italic; text-align: center; }
            .image-container { width: 100%; height: 400px; margin-bottom: 20px; text-align: center; }
            .image-container img { max-width: 100%; max-height: 400px; object-fit: contain; }
            @media print {
              .page { page-break-after: always; }
              .image-container img { max-width: 100%; max-height: 350px; }
            }
          </style>
        </head>
        <body>
          <h1>${storyContent.title}</h1>
          ${storyContent.pages
            .map(
              (page, index) => `
            <div class="page">
              <div class="image-container">
                <img src="${currentImages[index] || ""}" alt="Illustration for page ${index + 1}">
              </div>
              <div class="page-content">
                <span class="letter">${page.text.charAt(0)}</span>${page.text.substring(1)}
              </div>
            </div>
          `,
            )
            .join("")}
          ${
            storyContent.moral
              ? `
            <div class="moral">
              <h3>${t.moralOfTheStory}</h3>
              <p>${storyContent.moral}</p>
            </div>
          `
              : ""
          }
        </body>
        </html>
      `

        printWindow.document.open()
        printWindow.document.write(content)
        printWindow.document.close()

        // Wait for content to load then print
        printWindow.onload = () => {
          // Wait for images to load
          setTimeout(() => {
            printWindow.print()
          }, 1000)
        }
      }
    }
  }

  // Get the current letter (first character of the page text)
  const getCurrentLetter = () => {
    if (!storyContent || !storyContent.pages || !storyContent.pages[currentPage]) {
      return ALPHABET[currentPage % ALPHABET.length]
    }
    
    const text = storyContent.pages[currentPage].text
    if (text && text.length > 0 && ALPHABET.includes(text[0])) {
      return text[0]
    }
    return ALPHABET[currentPage % ALPHABET.length]
  }

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if the event target is an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.key === "ArrowRight" || e.key === " " || e.code === "Space") {
        e.preventDefault() // Prevent page scroll on space
        handleNextPage()
      } else if (e.key === "ArrowLeft") {
        handlePrevPage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage])

  // Handle URL hash for page navigation
  useEffect(() => {
    // Update URL hash when page changes
    window.location.hash = `page-${currentPage + 1}`

    // Listen for hash changes (browser back/forward)
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith("#page-")) {
        const pageNumber = Number.parseInt(hash.replace("#page-", ""), 10)
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= storyContent.pages.length) {
          setCurrentPage(pageNumber - 1)
        }
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [currentPage, storyContent.pages.length])

  // Check for hash on initial load
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith("#page-")) {
      const pageNumber = Number.parseInt(hash.replace("#page-", ""), 10)
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= storyContent.pages.length) {
        setCurrentPage(pageNumber - 1)
        setImageError(false)
      }
    }
  }, [storyContent.pages.length])

  const isLastPage = currentPage === storyContent.pages.length - 1

  return (
    <>
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={printStory}
          title={t.printOrSavePDF}
          className="relative overflow-hidden group bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
        >
          <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>

        {isGenerating && (
          <Button
            variant="outline"
            size="icon"
            onClick={refreshImages}
            title={t.refreshImages}
            className="relative overflow-hidden group bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 group-hover:animate-spin" />
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
          </Button>
        )}

        <Button variant="outline" size="icon" onClick={handleShare} className="relative overflow-hidden group bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
          <Share2 className="h-4 w-4" />
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>

        {/* Fullscreen Control */}
        <Button variant="outline" size="icon" onClick={toggleFullscreen} className="relative overflow-hidden group bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>

        {/* Full story audio */}
        <Button
          variant="outline"
          size="icon"
          onClick={isPlayingFullStory ? stopFullStory : playFullStory}
          className="relative overflow-hidden group bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          title={isPlayingFullStory ? t.stopAudio : t.listenFullStory}
        >
          <Volume2 className="h-4 w-4" />
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>

        {/* Auto-play page toggle */}
        <Button
          variant={autoPlayPage ? "default" : "outline"}
          size="icon"
          onClick={() => setAutoPlayPage(!autoPlayPage)}
          className={`relative overflow-hidden group ${autoPlayPage ? 'bg-pink-500 hover:bg-pink-600 text-white border-pink-500' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white'}`}
          title={autoPlayPage ? t.disableAutoPlay : t.enableAutoPlay}
        >
          <Play className="h-4 w-4" />
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
        </Button>
      </div>

      {/* Book Layout */}
      <div
        ref={fullscreenRef}
        className={`relative w-full mx-auto transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-black flex items-center justify-center p-4'
            : 'max-w-6xl'
        }`}
      >
        <div
          ref={storyContainerRef}
          className="relative w-full"
        >
        <div className={`book-container relative bg-white rounded-lg shadow-2xl overflow-hidden ${
          isFullscreen ? 'shadow-none border-2 border-white/20' : ''
        }`}>
          {/* Book spine shadow - hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 shadow-inner transform -translate-x-1/2 z-10"></div>

          {/* Mobile: vertical layout, Desktop: horizontal layout */}
          <div className="flex flex-col md:flex-row">
            {/* Image - full width on mobile, half on desktop */}
            <div className="w-full md:w-1/2 relative book-page">
              <div
                className={`relative aspect-[3/4] w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 transition-all duration-300 ${
                  pageTransition === "fade-out" ? "opacity-0" : pageTransition === "fade-in" ? "opacity-100" : ""
                }`}
              >
                {currentImages[currentPage] && !imageError ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={currentImages[currentPage] || "/api/placeholder?text=Иллюстрация загружается...&width=400&height=400"}
                      alt={`Illustration for "${storyContent.pages[currentPage].text.substring(0, 50)}..."`}
                      fill
                      className="object-cover"
                      onError={handleImageError}
                      unoptimized={currentImages[currentPage].startsWith("data:")}
                      priority={currentPage === 0}
                    />

                    {/* Decorative sparkles */}
                    <div className="absolute top-2 right-2 animate-float-slow opacity-70">
                      <Sparkles className="h-6 w-6 text-yellow-400 filter drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-pink-900/20 flex items-center justify-center">
                    {/* Beautiful placeholder illustration */}
                    <div className="text-center space-y-4">
                      {/* Illustration placeholder */}
                      <div className="relative">
                        {/* Book icon as placeholder */}
                        <div className="w-24 h-24 mx-auto relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl shadow-lg transform rotate-3 opacity-80"></div>
                          <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl shadow-md transform -rotate-2 opacity-90"></div>
                          <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                        
                        {/* Decorative sparkles */}
                        <div className="absolute -top-2 -right-2 animate-pulse">
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="absolute -bottom-1 -left-2 animate-pulse delay-500">
                          <Sparkles className="h-3 w-3 text-pink-400" />
                        </div>
                        <div className="absolute top-1/2 -right-4 animate-pulse delay-1000">
                          <Sparkles className="h-2 w-2 text-blue-400" />
                        </div>
                      </div>
                      
                      {/* Status text */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {imageError
                            ? "Изображение не загрузилось"
                            : isGenerating
                              ? "Иллюстрация создаётся..."
                              : "Волшебная иллюстрация"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {imageError
                            ? "Попробуйте обновить страницу"
                            : isGenerating
                              ? "Наш ИИ рисует иллюстрацию для этой страницы"
                              : "Представьте здесь красивую картинку к истории"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Background decorative elements */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-purple-300 rounded-full opacity-40 animate-bounce"></div>
                    <div className="absolute bottom-6 right-6 w-3 h-3 bg-pink-300 rounded-full opacity-40 animate-bounce delay-300"></div>
                    <div className="absolute top-1/3 right-8 w-1 h-1 bg-blue-300 rounded-full opacity-40 animate-bounce delay-700"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Text - full width on mobile, half on desktop */}
            <div className="w-full md:w-1/2 relative book-page bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
              <div
                className={`p-4 md:p-8 lg:p-10 h-full flex flex-col justify-center transition-all duration-300 ${
                  pageTransition === "fade-out" ? "opacity-0" : pageTransition === "fade-in" ? "opacity-100" : ""
                }`}
              >
                {/* Page content */}
                <div className="space-y-4 md:space-y-6">
                  <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-800" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6' }}>
                    {storyContent.pages[currentPage].text}
                  </p>

                  {/* Text-to-Speech controls */}
                  <div className="mt-2 md:mt-4">
                    <TextToSpeech
                      text={storyContent.pages[currentPage].text}
                      language={storyLanguage}
                      isStoryMode={true}
                    />
                  </div>

                  {/* Page number */}
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-gray-500 text-xs md:text-sm font-medium">
                    {currentPage + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Book navigation */}
          <div className="p-4 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 border-t border-purple-200 flex justify-between items-center">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              variant="outline"
              size="icon"
              className="group relative overflow-hidden bg-white/80 border-purple-300 text-purple-700 hover:bg-purple-100 disabled:opacity-50 w-12 h-12 rounded-full"
              aria-label={t.previousPageAria}
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Button>

            <div className="text-purple-600 font-medium text-lg">
              {currentPage + 1} / {storyContent.pages.length}
            </div>

            <Button
              onClick={handleNextPage}
              disabled={isLastPage && !storyContent.moral}
              size="icon"
              className={`group relative overflow-hidden w-12 h-12 rounded-full ${
                isLastPage
                  ? "bg-white/80 border border-purple-300 text-purple-700 hover:bg-purple-100"
                  : "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
              }`}
              aria-label={isLastPage ? t.endOfStoryAria : t.nextPageAria}
            >
              {isLastPage ? (
                storyContent.moral ? <Sparkles className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Moral Dialog */}
      {storyContent.moral && (
        <Dialog open={showMoral} onOpenChange={setShowMoral}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {t.moralOfTheStory}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t.whatWeCanLearn} "{storyContent.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 p-px rounded-full mb-4">
                <div className="bg-background dark:bg-gray-800 p-3 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-lg italic text-center">{storyContent.moral}</p>
              
              {/* Text-to-Speech for moral */}
              <div className="mt-4">
                <TextToSpeech 
                  text={storyContent.moral}
                  language={storyLanguage}
                  isStoryMode={true}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowMoral(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t.backToStory}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div aria-live="polite" className="sr-only">
        Page {currentPage + 1} of {storyContent.pages.length}, {storyContent.pages[currentPage].text}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this story</DialogTitle>
            <DialogDescription>Share this magical ABC story with friends and family</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4 justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`, "_blank")
                }
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this ABC story: ${storyContent.title}`)}&url=${encodeURIComponent(storyUrl)}`,
                    "_blank",
                  )
                }
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="grid w-full gap-2">
                <div className="flex items-center justify-between rounded-md border px-3 py-2 dark:border-gray-700 overflow-hidden">
                  <span className="text-sm text-muted-foreground truncate max-w-full">{storyUrl}</span>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3 flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={copyLinkToClipboard}
              >
                <span className="sr-only">Copy</span>
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

