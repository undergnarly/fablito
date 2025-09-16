import { NextRequest, NextResponse } from 'next/server'
import { getStory } from '@/lib/db'
import { exportStoryAsEbook } from '@/lib/ebook-generator'
import { isKvAvailable } from '@/lib/settings'
import fs from 'fs'
import path from 'path'

// Function to load generated story from file cache
function loadGeneratedStory(storyId: string): any | null {
  try {
    const storiesCacheDir = path.join(process.cwd(), '.stories-cache')
    const filePath = path.join(storiesCacheDir, `${storyId}.json`)
    if (fs.existsSync(filePath)) {
      const storyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      console.log(`[EXPORT] ✅ Story ${storyId} loaded from file`)
      return storyData
    }
    return null
  } catch (error) {
    console.error(`[EXPORT] Error loading story ${storyId}:`, error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'epub'
    const includeImages = url.searchParams.get('images') !== 'false'

    if (!['epub', 'pdf', 'html'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported: epub, pdf, html' },
        { status: 400 }
      )
    }

    console.log(`[EXPORT] Exporting story ${id} as ${format}`)

    // Получаем историю из базы данных или файлового кеша
    let storyData
    
    if (isKvAvailable) {
      try {
        storyData = await getStory(id)
        console.log(`[EXPORT] Story from KV: ${storyData ? 'found' : 'not found'}`)
      } catch (error) {
        console.log(`[EXPORT] Error getting story from KV:`, error)
        storyData = null
      }
    }
    
    // Если не найдено в KV или KV недоступно, проверяем файловый кеш
    if (!storyData) {
      console.log(`[EXPORT] Checking file cache for story ${id}...`)
      storyData = loadGeneratedStory(id)
      console.log(`[EXPORT] Story from file cache: ${storyData ? 'found' : 'not found'}`)
    }

    if (!storyData) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Парсим контент истории
    let storyContent
    try {
      storyContent = storyData.storyContent 
        ? JSON.parse(storyData.storyContent)
        : null
    } catch (error) {
      console.error(`[EXPORT] Error parsing story content:`, error)
      return NextResponse.json(
        { error: 'Invalid story content' },
        { status: 500 }
      )
    }

    if (!storyContent) {
      return NextResponse.json(
        { error: 'Story content not available' },
        { status: 404 }
      )
    }

    // Парсим изображения
    let images: string[] = []
    if (includeImages && storyData.images) {
      try {
        images = JSON.parse(storyData.images)
      } catch (error) {
        console.error(`[EXPORT] Error parsing images:`, error)
        images = []
      }
    }

    console.log(`[EXPORT] Story: ${storyContent.title}`)
    console.log(`[EXPORT] Pages: ${storyContent.pages?.length || 0}`)
    console.log(`[EXPORT] Images: ${images.length}`)

    // Экспортируем историю
    console.log(`[EXPORT] Starting export...`)
    const exportedContent = await exportStoryAsEbook(
      storyContent,
      images,
      { 
        format: format as 'epub' | 'pdf' | 'html',
        includeImages 
      }
    )
    console.log(`[EXPORT] Export completed, content length: ${exportedContent.length}`)

    // Определяем тип контента и заголовки
    let contentType: string
    let filename: string
    let disposition: string

    switch (format) {
      case 'epub':
        contentType = 'application/json'
        filename = `${storyContent.title.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_')}.epub-structure.json`
        disposition = 'attachment'
        break
      case 'pdf':
        contentType = 'text/html'
        filename = `${storyContent.title.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_')}.html`
        disposition = 'inline'
        break
      case 'html':
      default:
        contentType = 'text/html; charset=utf-8'
        filename = `${storyContent.title.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_')}.html`
        disposition = 'inline'
        break
    }

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    })

    if (format === 'html' || format === 'pdf') {
      // Для HTML и PDF возвращаем готовый контент
      // Конвертируем в UTF-8 байты для корректной работы с русскими символами
      const encoder = new TextEncoder()
      const bytes = encoder.encode(exportedContent)
      return new NextResponse(bytes, { headers })
    } else {
      // Для EPUB возвращаем JSON структуру
      return new NextResponse(exportedContent, { headers })
    }

  } catch (error) {
    console.error(`[EXPORT] Error exporting story:`, error)
    return NextResponse.json(
      { error: 'Failed to export story', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
