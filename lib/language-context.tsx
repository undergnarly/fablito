'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, useTranslation, Translations } from './i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

// Detect browser language and map to supported languages
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const browserLang = navigator.language || (navigator as any).userLanguage || 'en'
  const langCode = browserLang.toLowerCase().split('-')[0]

  // Map browser language to supported languages
  if (langCode === 'ru') return 'ru'
  if (langCode === 'kk' || langCode === 'kz') return 'kz'

  // Default to English for all other languages
  return 'en'
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')

  // Load language from localStorage or detect from browser on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['en', 'ru', 'kz'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Auto-detect browser language if no saved preference
      const detectedLang = detectBrowserLanguage()
      setLanguageState(detectedLang)
      localStorage.setItem('language', detectedLang)
    }
  }, [])
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }
  
  const t = useTranslation(language)
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

