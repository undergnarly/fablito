'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateStoryForm from "@/app/create-story-form"
import { useLanguage } from "@/lib/language-context"
import { Sparkles } from "lucide-react"

interface CreateStorySectionProps {
  submissionsHalted: boolean
}

export function CreateStorySection({ submissionsHalted }: CreateStorySectionProps) {
  const { t } = useLanguage()

  return (
    <section id="create-story" className="py-20 px-4 md:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <Card className="magic-card border-white/20 shadow-2xl overflow-hidden">
          <CardHeader className="text-center relative z-10 pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-3 glow-text">
              {t.createStoryTitle}
            </CardTitle>
            <CardDescription className="text-lg text-white/80">
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
