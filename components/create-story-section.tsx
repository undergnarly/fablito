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
    <section id="create-story" className="py-12 md:py-20 pb-8 px-4 md:px-8 relative bg-[#411369]">
      <div className="max-w-4xl mx-auto">
        <Card className="magic-card border-white/20 shadow-2xl overflow-hidden">
          <CardHeader className="text-center relative z-10 pb-2 md:pb-4">
            <CardTitle className="text-2xl md:text-4xl font-bold text-white mb-2 glow-text">
              {t.createStoryTitle}
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-white/70">
              {t.createStoryDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <CreateStoryForm submissionsHalted={submissionsHalted} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
