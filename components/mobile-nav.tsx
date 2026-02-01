"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Heart, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Stories",
      href: "/stories",
      icon: BookOpen,
    },
    {
      name: "Create",
      href: "/#create-story",
      icon: Plus,
      isAction: true,
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: Heart,
    },
    {
      name: "Profile",
      href: isAuthenticated ? "/user/profile" : "/auth",
      icon: User,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#6b2d9e]/95 backdrop-blur-lg border-t border-white/20 z-40 safe-area-pb">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                item.isAction
                  ? "text-white"
                  : isActive
                    ? "text-pink-400"
                    : "text-white/60"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.name}
            >
              {item.isAction ? (
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full -mt-4 shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
