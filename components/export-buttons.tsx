"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Book, Printer } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface ExportButtonsProps {
  storyId: string
  storyTitle: string
}

export function ExportButtons({ storyId, storyTitle }: ExportButtonsProps) {
  const { t } = useLanguage()

  const handleExport = async (format: 'html' | 'epub' | 'pdf') => {
    try {
      console.log(`[EXPORT] Starting export of story ${storyId} as ${format}`)
      
      const exportUrl = `/api/story/${storyId}/export?format=${format}&images=true`
      
      if (format === 'html') {
        // Для HTML открываем в новой вкладке
        window.open(exportUrl, '_blank')
      } else {
        // Для EPUB и PDF скачиваем файл
        const response = await fetch(exportUrl)
        
        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `${storyTitle.replace(/[^a-zA-Z0-9а-яё\s]/gi, '')}.${format === 'epub' ? 'json' : 'html'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        console.log(`[EXPORT] Successfully exported story as ${format}`)
      }
    } catch (error) {
      console.error(`[EXPORT] Error exporting story:`, error)
      alert(`${t.exportError}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          {t.export}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport('html')} className="gap-2">
          <FileText className="w-4 h-4" />
          <div className="flex flex-col">
            <span>{t.webpageHtml}</span>
            <span className="text-xs text-muted-foreground">{t.openInBrowser}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2">
          <Printer className="w-4 h-4" />
          <div className="flex flex-col">
            <span>{t.pdfForPrint}</span>
            <span className="text-xs text-muted-foreground">{t.readyToPrint}</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport('epub')} className="gap-2">
          <Book className="w-4 h-4" />
          <div className="flex flex-col">
            <span>{t.ebookEpub}</span>
            <span className="text-xs text-muted-foreground">{t.ereaderFormat}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExportButtons

