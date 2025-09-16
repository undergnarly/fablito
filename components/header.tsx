"use client"

import { BookOpen, LogIn, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
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
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-background focus:z-50"
      >
        Skip to main content
      </a>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">StoryBook</span>
        </Link>

        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-4 mr-auto ml-8" aria-label="Main navigation">
          <Link
            href="/"
            className={`text-sm ${pathname === "/" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            {t.home}
          </Link>
          <Link
            href="/stories"
            className={`text-sm ${pathname === "/stories" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={pathname === "/stories" ? "page" : undefined}
          >
            {t.stories}
          </Link>
          <Link
            href="/favorites"
            className={`text-sm ${pathname === "/favorites" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            aria-current={pathname === "/favorites" ? "page" : undefined}
          >
            {t.favorites}
          </Link>
          <Link href="/#create-story" className="text-sm text-muted-foreground hover:text-foreground">
            {t.createStoryButton}
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <ModeToggle />
          
          {/* Authentication buttons */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/user/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t.profile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/stories" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {t.myStories}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600">
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.login}</span>
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.signUp}</span>
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

