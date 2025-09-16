'use client'

import { useLanguage } from '@/lib/language-context'
import { Language } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  kz: 'Қазақша'
}

const languageFlags: Record<Language, string> = {
  en: '🇺🇸',
  ru: '🇷🇺',
  kz: '🇰🇿'
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageFlags[language]} {languageNames[language]}</span>
          <span className="sm:hidden">{languageFlags[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languageNames).map(([lang, name]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang as Language)}
            className={language === lang ? 'bg-accent' : ''}
          >
            <span className="mr-2">{languageFlags[lang as Language]}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

