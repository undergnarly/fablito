"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Wand2, AlertTriangle, Upload, Mic, MicOff, User, Palette, FileText, X, Volume2, Trash2 } from "lucide-react"
import { createStoryAction } from "./actions"
import { useFormStatus, useActionState } from "react-dom"
import { useState, useEffect, useRef, useTransition } from "react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"
import { GenerationCost } from "@/components/coin-balance"
import { UpsellModal } from "@/components/upsell-modal"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SpeechRecognition } from "@/components/speech-recognition"

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

// Add submissionsHalted prop
interface CreateStoryFormProps {
  submissionsHalted?: boolean
}

function SubmitButton({ disabled, createText, creatingText }: { disabled?: boolean, createText: string, creatingText: string }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || disabled}
      className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all"
    >
      {pending ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {creatingText}
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <Sparkles className="mr-2 h-5 w-5" />
          {createText}
        </span>
      )}
    </Button>
  )
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

export default function CreateStoryForm({ submissionsHalted = false }: CreateStoryFormProps) {
  const { t, language } = useLanguage()
  const { user, canAfford, isAnonymous } = useAuth()

  // For anonymous users, fix page count at 5 (50 coins = exactly 1 story)
  const ANONYMOUS_PAGE_COUNT = 5

  // Upsell modal state
  const [showUpsellModal, setShowUpsellModal] = useState(false)

  // New form state
  const [childName, setChildName] = useState("")
  const [childGender, setChildGender] = useState<"boy" | "girl">("boy")
  const [childAge, setChildAge] = useState(5)
  const [pageCount, setPageCount] = useState(isAnonymous ? ANONYMOUS_PAGE_COUNT : 10)
  const [theme, setTheme] = useState("")
  const [storyLanguage, setStoryLanguage] = useState("en")
  const [illustrationStyle, setIllustrationStyle] = useState("watercolor")
  const [voiceStory, setVoiceStory] = useState<File | null>(null)
  const [textStory, setTextStory] = useState("")
  const [characterPhoto, setCharacterPhoto] = useState<File | null>(null)
  const [characterPhotoPreview, setCharacterPhotoPreview] = useState<string | null>(null)
  const [storyInputMode, setStoryInputMode] = useState<'none' | 'text' | 'voice'>('none')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [recognizedText, setRecognizedText] = useState("")
  const [isRecognizing, setIsRecognizing] = useState(false)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  // Auto-select story language based on interface language
  useEffect(() => {
    setStoryLanguage(language)
  }, [language])

  // Set page count for anonymous users
  useEffect(() => {
    if (isAnonymous) {
      setPageCount(ANONYMOUS_PAGE_COUNT)
    }
  }, [isAnonymous])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = storyLanguage === 'ru' ? 'ru-RU' : storyLanguage === 'kz' ? 'kk-KZ' : 'en-US'
        
        recognition.onresult = (event) => {
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

          if (finalTranscript) {
            setRecognizedText(prev => prev + finalTranscript)
          }
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsRecognizing(false)
        }

        recognition.onend = () => {
          setIsRecognizing(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [storyLanguage])
  
  // Legacy fields for compatibility
  const [promptValue, setPromptValue] = useState("")
  const [ageRange, setAgeRange] = useState([3, 8])
  
  const [errors, setErrors] = useState({
    childName: "",
    theme: "",
  })
  const [alphabetLettersCount, setAlphabetLettersCount] = useState(8)
  const [submitError, setSubmitError] = useState("")

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'voice-story.wav', { type: 'audio/wav' })
        setVoiceStory(audioFile)
        setAudioChunks([])
        stream.getTracks().forEach(track => track.stop())
        setStoryInputMode('voice')
      }

      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start speech recognition
      if (recognitionRef.current) {
        setIsRecognizing(true)
        setRecognizedText("")
        recognitionRef.current.start()
      }

      // Запуск таймера
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error(t.microphoneError, error)
      setSubmitError(t.microphonePermission)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        setIsRecognizing(false)
      }
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const deleteRecording = () => {
    setVoiceStory(null)
    setRecordingTime(0)
    setRecognizedText("")
    if (storyInputMode === 'voice') {
      setStoryInputMode('none')
    }
  }

  const enableTextMode = () => {
    setStoryInputMode('text')
    // Clear voice recording if it exists
    if (voiceStory) {
      setVoiceStory(null)
      setRecordingTime(0)
    }
  }

  const enableVoiceMode = () => {
    setStoryInputMode('voice')
    // Очистка текста если он был
    if (textStory) {
      setTextStory("")
    }
  }

  const clearStoryInput = () => {
    setStoryInputMode('none')
    setTextStory("")
    setVoiceStory(null)
    setRecordingTime(0)
  }

  // Handle character photo upload
  const handleCharacterPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(t.uploadImageFile)
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t.imageSizeLimit)
        return
      }
      setCharacterPhoto(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setCharacterPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCharacterPhoto = () => {
    setCharacterPhoto(null)
    setCharacterPhotoPreview(null)
  }

  // Recording time formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  // Fetch the alphabet letters count from the API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings?key=ALPHABET_LETTERS_COUNT")
        if (response.ok) {
          const data = await response.json()
          if (data.value !== undefined) {
            setAlphabetLettersCount(data.value)
          }
        }
      } catch (error) {
        console.error("Error fetching alphabet letters count:", error)
      }
    }

    fetchSettings()
  }, [])

  const handleAgeRangeChange = (value: number[]) => {
    setAgeRange(value)
  }

  const [isPending, startTransition] = useTransition()

  // Get actual page count (fixed for anonymous users)
  const actualPageCount = isAnonymous ? ANONYMOUS_PAGE_COUNT : pageCount
  const generationCost = actualPageCount * 10

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Don't submit if submissions are halted
    if (submissionsHalted) {
      return
    }

    // Check if user can afford the generation
    if (!canAfford(actualPageCount)) {
      setShowUpsellModal(true)
      return
    }

    // Validate form
    const newErrors = {
      childName: childName.trim() === "" ? t.heroNameRequired : "",
      theme: theme.trim() === "" ? t.storyThemeRequired : "",
    }

    setErrors(newErrors)

    // If no errors, submit the form
    if (Object.values(newErrors).every((error) => error === "")) {
      const formData = new FormData(e.currentTarget)
      setSubmitError("") // Clear previous errors

      startTransition(async () => {
        try {
          await createStoryAction(formData)
          // Redirect happens in server action
        } catch (error: any) {
          // NEXT_REDIRECT is expected - it's how Next.js handles redirects in server actions
          if (error?.digest?.includes('NEXT_REDIRECT')) {
            return
          }
          console.error("Error creating story:", error)
          setSubmitError(error instanceof Error ? error.message : "Failed to create story. Please try again.")
        }
      })
    }
  }

  // Show alert when submissions are halted
  if (submissionsHalted) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="border-2 border-destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>{t.submissionsHalted}</AlertTitle>
          <AlertDescription>
            {t.submissionsHaltedDesc}
          </AlertDescription>
        </Alert>

        <div className="p-6 border-2 border-muted rounded-xl bg-muted/30">
          <h3 className="text-lg font-medium mb-4">{t.whileYouWait}</h3>
          <p className="mb-4">{t.browseExistingStories}</p>
          <Button asChild className="w-full">
            <a href="/stories">{t.browseStories}</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Child Name */}
      <div className="space-y-2">
        <Label htmlFor="childName" className="text-lg font-semibold">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5 text-white" />
            {t.heroName}
          </span>
        </Label>
        <Input
          id="childName"
          name="childName"
          placeholder={t.heroNamePlaceholder}
          required
          aria-required="true"
          aria-invalid={errors.childName ? "true" : "false"}
          aria-describedby={errors.childName ? "childName-error" : undefined}
          className={`${errors.childName ? "border-red-400" : ""} text-xl py-6 px-4`}
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />
        {errors.childName && (
          <p id="childName-error" className="text-red-500 text-sm mt-1">
            {errors.childName}
          </p>
        )}
      </div>

      {/* Child Gender */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">
          {t.childGender || "Пол ребёнка"}
        </Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={childGender === "boy" ? "default" : "outline"}
            onClick={() => setChildGender("boy")}
            className={`flex-1 py-6 rounded-xl transition-all ${
              childGender === "boy"
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
                : "bg-white/10 border-white/30 text-white hover:bg-white/20"
            }`}
          >
            {t.boy || "Мальчик"}
          </Button>
          <Button
            type="button"
            variant={childGender === "girl" ? "default" : "outline"}
            onClick={() => setChildGender("girl")}
            className={`flex-1 py-6 rounded-xl transition-all ${
              childGender === "girl"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0"
                : "bg-white/10 border-white/30 text-white hover:bg-white/20"
            }`}
          >
            {t.girl || "Девочка"}
          </Button>
        </div>
      </div>

      {/* Child Age */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">
          {t.childAge}: {childAge} {t.childAgeYears}
        </Label>
        <Slider
          value={[childAge]}
          onValueChange={(value) => setChildAge(value[0])}
          max={12}
          min={2}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-white/70">
          <span>2 {t.years}</span>
          <span>12 {t.years}</span>
        </div>
      </div>

      {/* Page Count - Only shown for registered users */}
      {!isAnonymous && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold">
            {t.pageCount || "Number of pages"}: {pageCount}
          </Label>
          <Slider
            value={[pageCount]}
            onValueChange={(value) => setPageCount(value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-white/70">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      )}

      {/* Character Photo Upload */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">
          <span className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-white" />
            {t.characterPhoto || "Photo of your child"}
            <span className="text-sm text-white/70 font-normal">({t.optional})</span>
          </span>
        </Label>
        <p className="text-sm text-white/70">
          {t.characterPhotoDesc || "Upload a photo to create a character that looks like your child"}
        </p>
        <p className="text-xs text-white/50 flex items-center gap-1">
          <span>🔒</span>
          {t.photoPrivacyNotice || "All photos are stored privately and securely. No one has access to them."}
        </p>

        {!characterPhotoPreview ? (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-white/60" />
              <p className="mb-2 text-sm text-white/80">
                <span className="font-semibold">{t.clickToUpload || "Click to upload"}</span>
              </p>
              <p className="text-xs text-white/60">{t.imageFormats || "PNG, JPG up to 5MB"}</p>
            </div>
            <input
              type="file"
              name="characterPhoto"
              className="hidden"
              accept="image/*"
              onChange={handleCharacterPhotoChange}
            />
          </label>
        ) : (
          <div className="relative w-full">
            <div className="relative w-40 h-40 mx-auto rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
              <img
                src={characterPhotoPreview}
                alt="Character preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeCharacterPhoto}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-center mt-3 text-sm text-white/70">
              {t.photoUploaded || "Photo uploaded! The character will be based on this image."}
            </p>
          </div>
        )}
      </div>

      {submitError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">{t.error}</AlertTitle>
          <AlertDescription className="text-red-700">
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* Theme/Moral */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            {t.storyTheme}
          </span>
        </Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className={`border-2 ${errors.theme ? "border-red-400" : "border-white/30"} rounded-xl transition-all duration-200`}>
            <SelectValue placeholder={t.selectThemePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relationships-friendship">{t.relationshipsFriendship}</SelectItem>
            <SelectItem value="character-courage">{t.characterCourage}</SelectItem>
            <SelectItem value="responsibility">{t.responsibility}</SelectItem>
            <SelectItem value="family-care">{t.familyCare}</SelectItem>
            <SelectItem value="nature-world">{t.natureWorld}</SelectItem>
            <SelectItem value="learning-development">{t.learningDevelopment}</SelectItem>
            <SelectItem value="emotions-inner-world">{t.emotionsInnerWorld}</SelectItem>
          </SelectContent>
        </Select>
        {errors.theme && (
          <p id="theme-error" className="text-red-500 text-sm mt-1">
            {errors.theme}
          </p>
        )}
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">{t.storyLanguage}</Label>
        <Select value={storyLanguage} onValueChange={setStoryLanguage}>
          <SelectTrigger className="border-2 border-white/30 rounded-xl">
            <SelectValue placeholder={t.selectLanguagePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">{t.russian}</SelectItem>
            <SelectItem value="en">{t.english}</SelectItem>
            <SelectItem value="kz">{t.kazakh}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Illustration Style */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">
          <span className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-white" />
            {t.illustrationStyle}
          </span>
        </Label>
        <Select value={illustrationStyle} onValueChange={setIllustrationStyle}>
          <SelectTrigger className="border-2 border-white/30 rounded-xl transition-all duration-200">
            <SelectValue placeholder={t.selectStyle} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="watercolor">{t.watercolor}</SelectItem>
            <SelectItem value="cartoon">{t.cartoon}</SelectItem>
            <SelectItem value="realistic">{t.realistic}</SelectItem>
            <SelectItem value="fantasy">{t.fantasy}</SelectItem>
            <SelectItem value="minimalist">{t.minimalist}</SelectItem>
            <SelectItem value="anime">{t.anime}</SelectItem>
            <SelectItem value="handdrawn">{t.handdrawn}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Story Input Options */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">
          {t.addOwnStory} <span className="text-sm text-white/70">({t.optional})</span>
        </Label>
        
        {storyInputMode === 'none' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="h-24 border-2 border-dashed border-white/30 hover:border-white/50 transition-all"
              onClick={enableTextMode}
            >
              <div className="flex flex-col items-center space-y-2">
                <FileText className="h-8 w-8 text-white" />
                <span className="font-medium">{t.writeAsText}</span>
                <span className="text-sm text-white/70">{t.writeAsTextDesc}</span>
              </div>
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="h-24 border-2 border-dashed border-white/30 hover:border-white/50 transition-all"
              onClick={enableVoiceMode}
            >
              <div className="flex flex-col items-center space-y-2">
                <Mic className="h-8 w-8 text-white" />
                <span className="font-medium">{t.recordWithVoice}</span>
                <span className="text-sm text-white/70">{t.recordWithVoiceDesc}</span>
              </div>
            </Button>
          </div>
        )}

        {storyInputMode === 'text' && (
          <div className="border-2 border-white/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-white" />
                <span className="font-medium">{t.yourStory}</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearStoryInput}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder={t.yourStoryPlaceholder}
              value={textStory}
              onChange={(e) => setTextStory(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={1000}
            />
            
            {/* Speech Recognition Component */}
            <SpeechRecognition
              onTranscriptChange={(transcript) => {
                setTextStory(transcript)
              }}
              language={storyLanguage === 'ru' ? 'ru-RU' : storyLanguage === 'kz' ? 'kk-KZ' : 'en-US'}
              className="mt-2"
            />
            
            <div className="text-right text-sm text-white/70">
              {textStory.length}/1000 {t.charactersCount}
            </div>
          </div>
        )}

        {storyInputMode === 'voice' && (
          <div className="border-2 border-white/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-white" />
                <span className="font-medium">{t.voiceRecording}</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearStoryInput}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              {voiceStory ? (
                <div className="text-center space-y-3 w-full">
                  <div className="text-lg text-green-600 font-medium">✓ {t.audioRecorded} ({formatTime(recordingTime)})</div>
                  <div className="flex gap-2 justify-center">
                    <Button type="button" variant="outline" size="sm" onClick={deleteRecording}>
                      {t.delete}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleRecordingToggle}>
                      {t.reRecord}
                    </Button>
                  </div>
                  <audio controls className="w-full max-w-sm mx-auto">
                    <source src={URL.createObjectURL(voiceStory)} type="audio/wav" />
                    {t.audioNotSupported}
                  </audio>
                  
                  {/* Display recognized text */}
                  {recognizedText && (
                    <div className="mt-4 p-3 bg-muted rounded-md w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{t.recognizedText}:</span>
                      </div>
                      <p className="text-sm">{recognizedText}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTextStory(recognizedText)
                            setStoryInputMode('text')
                          }}
                        >
                          {t.useAsStoryText}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setRecognizedText("")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3">
                  {isRecording && (
                    <div className="text-center space-y-2">
                      <div className="text-lg font-medium text-red-600 animate-pulse">
                        🔴 {t.recording} {formatTime(recordingTime)}
                      </div>
                      {isRecognizing && (
                        <div className="text-sm text-blue-600 flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          {t.recognizingSpeech}
                        </div>
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg"
                    className="rounded-full"
                    onClick={handleRecordingToggle}
                  >
                    {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    {isRecording ? t.stopRecording : t.startRecording}
                  </Button>
                  <div className="text-sm text-white/70">
                    {isRecording ? t.tellYourStory : t.clickToStartRecording}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden fields for form data */}
      <input type="hidden" name="childAge" value={childAge} />
      <input type="hidden" name="childGender" value={childGender} />
      <input type="hidden" name="pageCount" value={actualPageCount} />
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="language" value={storyLanguage} />
      <input type="hidden" name="illustrationStyle" value={illustrationStyle} />
      <input type="hidden" name="textStory" value={textStory} />

      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="visibility" className="text-base">
            {t.privateStory}
          </Label>
          <p className="text-xs text-white/70">
            {t.privateStoryDesc}
          </p>
        </div>
        <Switch id="visibility" name="visibility" value="unlisted" aria-label="Make story private" />
      </div>

      {/* Generation cost display */}
      <GenerationCost pageCount={actualPageCount} userCoins={user?.coins} />

      <SubmitButton disabled={submissionsHalted} createText={t.createStory} creatingText={t.creatingStory} />

      {/* Upsell modal for insufficient coins */}
      <UpsellModal
        open={showUpsellModal}
        onOpenChange={setShowUpsellModal}
        requiredCoins={generationCost}
        userCoins={user?.coins || 0}
      />
    </form>
  )
}

