'use client'

import { GithubIcon, Twitter } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer
      className="w-full py-12 pb-24 md:pb-12 border-t border-white/10 bg-[#2d0f47] relative z-10"
      role="contentinfo"
    >
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white font-logo">Fablito</span>
            </div>
            <p className="text-sm text-white/70">
              {t.footerDescription}
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-base font-medium text-white">{t.explore}</h3>
            <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
              {t.home}
            </Link>
            <Link href="/stories" className="text-sm text-white/70 hover:text-white transition-colors">
              {t.browseStories}
            </Link>
            <Link
              href="/#create-story"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {t.createStory}
            </Link>
            <Link href="/favorites" className="text-sm text-white/70 hover:text-white transition-colors">
              {t.myFavorites}
            </Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-base font-medium text-white">{t.connect}</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com/vercel" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubIcon className="h-5 w-5 text-white/70 hover:text-white" />
              </Link>
              <Link href="https://x.com/v0" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <Twitter className="h-5 w-5 text-white/70 hover:text-white" />
              </Link>
            </div>
            <div className="flex space-x-4 mt-4">
              <Link href="/privacy" className="text-xs text-white/70 hover:text-white transition-colors">
                {t.privacyPolicy}
              </Link>
              <Link href="/terms" className="text-xs text-white/70 hover:text-white transition-colors">
                {t.termsOfService}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

