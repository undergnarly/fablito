"use client"

import { LogIn, LogOut, User, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-background focus:z-50"
      >
        Skip to main content
      </a>
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
        >
          <BookOpen className="h-4 w-4 text-white" />
          <span className="font-semibold text-white text-sm">Fablito</span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Auth section */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                      {user?.name}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/user/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        {t.profile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/stories" className="flex items-center gap-2 cursor-pointer">
                        <BookOpen className="h-4 w-4" />
                        {t.myStories}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 text-red-500 cursor-pointer focus:text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  asChild
                  className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-4"
                >
                  <Link href="/auth" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{t.signUp}</span>
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
