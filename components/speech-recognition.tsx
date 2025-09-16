"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, Trash2, Upload, FileAudio } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SpeechRecognitionProps {
  onTranscriptChange: (transcript: string) => void
  language?: string
  className?: string
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

export function SpeechRecognition({ 
  onTranscriptChange, 
  language = 'ru-RU',
  className = '' 
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check browser support and initialize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        
        // Configure recognition
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = language
        
        // Add language-specific settings
        if (language === 'kk-KZ') {
          // Kazakh language support - fallback to Russian if not available
          recognitionInstance.lang = 'ru-RU'
        }

        // Handle results
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            } else {
              interimTranscript += result[0].transcript
            }
          }

          const fullTranscript = transcript + finalTranscript
          if (finalTranscript) {
            setTranscript(fullTranscript)
            onTranscriptChange(fullTranscript)
          }
        }

        // Handle errors
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          
          let errorMessage = ''
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'Речь не обнаружена. Попробуйте говорить громче.'
              break
            case 'audio-capture':
              errorMessage = 'Не удалось получить доступ к микрофону. Проверьте разрешения.'
              break
            case 'not-allowed':
              errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.'
              break
            case 'network':
              errorMessage = 'Ошибка сети. Проверьте подключение к интернету.'
              break
            case 'language-not-supported':
              errorMessage = 'Выбранный язык не поддерживается.'
              break
            default:
              errorMessage = `Ошибка распознавания: ${event.error}`
          }
          
          setError(errorMessage)
          setIsListening(false)
        }

        // Handle end
        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      } else {
        setIsSupported(false)
        setError('Распознавание речи не поддерживается в этом браузере')
      }
    }
  }, [language, transcript, onTranscriptChange])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setError('')
      setIsListening(true)
      recognition.start()
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition, isListening])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    onTranscriptChange('')
    setError('')
  }, [onTranscriptChange])

  // Handle audio file upload and recognition
  const handleAudioUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      setError('Пожалуйста, выберите аудиофайл')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Create audio element and play the file
      const audio = new Audio()
      const audioUrl = URL.createObjectURL(file)
      audio.src = audioUrl

      // Start recognition when audio starts playing
      audio.onplay = () => {
        if (recognition && !isListening) {
          setIsListening(true)
          recognition.start()
        }
      }

      // Stop recognition when audio ends
      audio.onended = () => {
        if (recognition && isListening) {
          recognition.stop()
          setIsListening(false)
        }
        URL.revokeObjectURL(audioUrl)
        setIsProcessing(false)
      }

      // Play the audio
      await audio.play()
    } catch (error) {
      console.error('Error processing audio file:', error)
      setError('Ошибка при обработке аудиофайла')
      setIsProcessing(false)
    }
  }, [recognition, isListening])

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  if (!isSupported) {
    return (
      <Alert className={className}>
        <AlertDescription>
          Распознавание речи не поддерживается в вашем браузере. 
          Попробуйте использовать Chrome или Edge.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={toggleListening}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              Остановить
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Начать запись
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileUpload}
          disabled={isProcessing || isListening}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Загрузить аудио
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="hidden"
        />

        {transcript && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearTranscript}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </Button>
        )}

        {(isListening || isProcessing) && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {isProcessing ? 'Обрабатываю аудио...' : 'Слушаю...'}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transcript && (
        <div className="p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="h-4 w-4" />
            <span className="text-sm font-medium">Распознанный текст:</span>
          </div>
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  )
}

