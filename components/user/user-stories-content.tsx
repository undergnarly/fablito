"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"

export function UserStoriesContent() {
  const { t } = useLanguage()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.loading}</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.myStories}</h1>
            <p className="text-muted-foreground">Please log in to view your stories</p>
          </div>
        </div>
      </div>
    )
  }

  // TODO: Implement user-specific stories filtering
  // For now, show a placeholder

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.myStories}</h1>
            <p className="text-muted-foreground">{t.manageYourStories}</p>
          </div>
          <Button asChild>
            <Link href="/#create-story" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t.createNewStory}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t.myStories}
            </CardTitle>
            <CardDescription>
              Stories you've created will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noStoriesYet}</h3>
              <p className="text-muted-foreground mb-4">
                {t.startCreating}
              </p>
              <Button asChild>
                <Link href="/#create-story">{t.createYourFirstStory}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

