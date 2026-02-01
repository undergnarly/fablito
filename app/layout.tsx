import type { Metadata } from "next"
import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

// Base URL for OpenGraph image
const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://fablito.app"

// Create the OG image URL with parameters
const ogImageUrl = new URL(`${baseUrl}/api/og`)
ogImageUrl.searchParams.append("title", "Fablito")
ogImageUrl.searchParams.append("subtitle", "Create magical personalized stories for your child with AI")
ogImageUrl.searchParams.append("type", "home")

export const metadata: Metadata = {
  title: {
    default: "Fablito - Magical AI Stories for Kids",
    template: "%s | Fablito",
  },
  description:
    "Create magical personalized storybooks for your child with AI. Beautiful illustrations and engaging stories that make your kid the hero.",
  keywords: ["children's stories", "personalized books", "AI stories", "bedtime stories", "kids", "fairy tales", "educational"],
  authors: [{ name: "Fablito Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fablito.app",
    title: "Fablito - Magical AI Stories for Kids",
    description: "Create magical personalized storybooks for your child with AI",
    siteName: "Fablito",
    images: [
      {
        url: ogImageUrl.toString(),
        width: 1200,
        height: 630,
        alt: "Fablito - Magical Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fablito - Magical AI Stories for Kids",
    description: "Create magical personalized storybooks for your child with AI",
    images: [ogImageUrl.toString()],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rum+Raisin&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          "dark:bg-gradient-to-b dark:from-black dark:to-black/95"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <Header />
            <MobileNav />
            <main id="main-content" className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
