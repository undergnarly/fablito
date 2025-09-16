'use client'

import { cn } from "@/lib/utils"

interface LanguageFlagProps {
  language: 'ru' | 'en' | 'kz'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const languageFlags = {
  ru: '🇷🇺',
  en: '🇺🇸', 
  kz: '🇰🇿'
}

const languageNames = {
  ru: 'Русский',
  en: 'English',
  kz: 'Қазақша'
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

export function LanguageFlag({ language, size = 'md', className }: LanguageFlagProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm",
        sizeClasses[size],
        className
      )}
      title={languageNames[language]}
    >
      <span className="text-lg leading-none">{languageFlags[language]}</span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {language.toUpperCase()}
      </span>
    </div>
  )
}

