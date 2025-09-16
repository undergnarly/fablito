'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateStoryForm from "@/app/create-story-form"
import { useLanguage } from "@/lib/language-context"

interface CreateStorySectionProps {
  submissionsHalted: boolean
}

export function CreateStorySection({ submissionsHalted }: CreateStorySectionProps) {
  const { t } = useLanguage()

  return (
    <section id="create-story" className="py-16 px-4 md:px-8 relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto">
        <Card className="relative border-2 border-primary/10 shadow-xl bg-white dark:bg-gray-800">
          {/* Временно убираем фоновый градиент для диагностики */}
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-2">
              {t.createStoryTitle}
            </CardTitle>
            <CardDescription className="text-lg">
              {t.createStoryDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateStoryForm submissionsHalted={submissionsHalted} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
