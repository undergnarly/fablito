'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface TextToSpeechProps {
  text: string
  language?: 'ru' | 'en' | 'kz'
  className?: string
  isStoryMode?: boolean // Специальный режим для сказок
}

export function TextToSpeech({ text, language = 'ru', className = '', isStoryMode = false }: TextToSpeechProps) {
  const { t } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Отладочная информация
  console.log(`[TextToSpeech] Component props:`, {
    language,
    isStoryMode,
    textLength: text?.length,
    textPreview: text?.substring(0, 50) + '...'
  })

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
      loadVoices()
    }
  }, [])

  // Load available voices
  const loadVoices = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      
      // Select appropriate voice based on language
      const languageMap: Record<string, string> = {
        'ru': 'ru-RU',
        'en': 'en-US',
        'kz': 'kk-KZ'
      }
      
      const targetLanguage = languageMap[language] || 'ru-RU'
      
      // Для сказок предпочитаем женские голоса
      let preferredVoice = null
      if (isStoryMode) {
        // Сначала ищем женские голоса для целевого языка
        preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith(targetLanguage) && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('woman') ||
           voice.name.toLowerCase().includes('женский') ||
           voice.name.toLowerCase().includes('женщина'))
        )
        
        // Если не нашли женский голос, берем любой для целевого языка
        if (!preferredVoice) {
          preferredVoice = availableVoices.find(voice => 
            voice.lang.startsWith(targetLanguage)
          )
        }
      } else {
        // Обычный выбор голоса
        preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith(targetLanguage)
        )
      }
      
      // Fallback на русский или первый доступный
      if (!preferredVoice) {
        preferredVoice = availableVoices.find(voice => 
          voice.lang.startsWith('ru')
        ) || availableVoices[0]
      }
      
      setSelectedVoice(preferredVoice)
    }
  }

  // Load voices when they become available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices
      loadVoices()
    }
  }, [language])

  // Функция для обработки текста сказки
  const processStoryText = (text: string) => {
    if (!isStoryMode) return text
    
    // Добавляем паузы и интонацию для сказок
    let processedText = text
    
    // Добавляем паузы после точек и восклицательных знаков
    processedText = processedText.replace(/\./g, '. ')
    processedText = processedText.replace(/!/g, '! ')
    processedText = processedText.replace(/\?/g, '? ')
    
    // Добавляем паузы после запятых
    processedText = processedText.replace(/,/g, ', ')
    
    // Убираем лишние пробелы
    processedText = processedText.replace(/\s+/g, ' ').trim()
    
    return processedText
  }

  const speak = () => {
    if (!isSupported || !text) return

    // Stop any current speech
    speechSynthesis.cancel()

    const processedText = processStoryText(text)
    const utterance = new SpeechSynthesisUtterance(processedText)
    utteranceRef.current = utterance
    setCurrentUtterance(utterance)

      // Set voice
      if (selectedVoice) {
        utterance.voice = selectedVoice
        console.log(`[TextToSpeech] Using voice:`, {
          name: selectedVoice.name,
          lang: selectedVoice.lang,
          language: language
        })
      } else {
        console.log(`[TextToSpeech] No voice selected for language:`, language)
      }

    // Set speech parameters based on mode
    if (isStoryMode) {
      // Специальные настройки для чтения сказок
      utterance.rate = 0.7 // Еще медленнее для сказок
      utterance.pitch = 1.2 // Более высокий тон для сказочного голоса
      utterance.volume = 1.0
    } else {
      // Обычные настройки
      utterance.rate = 0.8 // Slower for children
      utterance.pitch = 1.1 // Slightly higher pitch
      utterance.volume = 1.0
    }

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }

    // Start speaking
    speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentUtterance(null)
  }

  const togglePlayPause = () => {
    if (isPlaying && !isPaused) {
      pause()
    } else if (isPaused) {
      resume()
    } else {
      speak()
    }
  }

  if (!isSupported) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {t.audioNotSupported}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlayPause}
        disabled={!text}
        className="flex items-center gap-2 bg-purple-600/90 hover:bg-purple-700 border-purple-500 text-white"
      >
        {isPlaying && !isPaused ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isPlaying && !isPaused ? t.pause : isPaused ? t.resume : t.listen}
      </Button>

      {isPlaying && (
        <Button
          variant="outline"
          size="sm"
          onClick={stop}
          className="flex items-center gap-2 bg-purple-600/90 hover:bg-purple-700 border-purple-500 text-white"
        >
          <VolumeX className="h-4 w-4" />
          {t.stop}
        </Button>
      )}

      {selectedVoice && (
        <div className="text-xs text-purple-700">
          {selectedVoice.lang}
        </div>
      )}
    </div>
  )
}
