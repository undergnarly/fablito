import { type NextRequest, NextResponse } from "next/server"
import { getStory, deleteStory } from "@/lib/db"
import { isKvAvailable } from "@/lib/settings"
import fs from 'fs'
import path from 'path'

// Временное хранение времени создания историй для симуляции
const storyStartTimes = new Map<string, number>()

// Путь для хранения сгенерированных историй в локальной разработке
const STORIES_DIR = path.join(process.cwd(), '.stories-cache')

// Убедимся что папка существует
if (!fs.existsSync(STORIES_DIR)) {
  fs.mkdirSync(STORIES_DIR, { recursive: true })
}

// Функция для сохранения сгенерированной истории в файл
export function saveGeneratedStory(storyId: string, storyData: any) {
  try {
    console.log(`[API] Saving generated story for ${storyId}`)
    console.log(`[API] Story title: ${storyData.title}`)
    
    const filePath = path.join(STORIES_DIR, `${storyId}.json`)
    fs.writeFileSync(filePath, JSON.stringify(storyData, null, 2), 'utf-8')
    
    console.log(`[API] ✅ Story ${storyId} saved to file: ${filePath}`)
  } catch (error) {
    console.error(`[API] Error saving story ${storyId}:`, error)
  }
}

// Функция для загрузки сгенерированной истории из файла
function loadGeneratedStory(storyId: string): any | null {
  try {
    const filePath = path.join(STORIES_DIR, `${storyId}.json`)
    if (fs.existsSync(filePath)) {
      const storyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      console.log(`[API] ✅ Story ${storyId} loaded from file`)
      return storyData
    }
    return null
  } catch (error) {
    console.error(`[API] Error loading story ${storyId}:`, error)
    return null
  }
}

export async function GET(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  const params = await _params
  try {
    const storyId = params.id
    console.log(`[API] GET request for story ID: "${storyId}", type: ${typeof storyId}`)

    if (!storyId || storyId === 'undefined' || storyId === 'null') {
      console.error(`[API] Invalid story ID received: "${storyId}"`)
      return NextResponse.json({ error: "Invalid story ID" }, { status: 404 })
    }

    // Get story data from KV, or return generated/mock data if KV is not available
    if (!isKvAvailable) {
      console.log(`[API] KV not available - checking for generated story ${storyId}`)
      
      // Сначала проверяем, есть ли реальная сгенерированная история в файле
      const savedStory = loadGeneratedStory(storyId)
      if (savedStory) {
        console.log(`[API] Found generated story for ${storyId}`)
        console.log(`[API] Returning story:`, savedStory.title || 'No title')
        return NextResponse.json(savedStory)
      }
      
      // Если нет сгенерированной истории, показываем статус генерации
      console.log(`[API] No generated story found for ${storyId}, showing generation status`)
      
      // Симулируем процесс генерации ТОЛЬКО для показа прогресса
      const now = Date.now()
      
      // Если это первый запрос для этой истории, сохраняем время начала
      if (!storyStartTimes.has(storyId)) {
        storyStartTimes.set(storyId, now)
      }
      
      const startTime = storyStartTimes.get(storyId)!
      const elapsed = now - startTime
      
      let status = "generating"
      let title = "🎆 Создаем Вашу Историю"
      
      // Показываем прогресс генерации
      if (elapsed > 3000) { // 3 секунды
        status = "generating_story"
        title = "🎆 Пишем Вашу Сказку"
      }
      if (elapsed > 8000) { // 8 секунд
        status = "generating_images"
        title = "🎨 Рисуем Иллюстрации"
      }
      
      // Простой статус без полного контента
      const generationStatus = {
        id: storyId,
        title,
        status,
        createdAt: new Date(startTime).toISOString(),
        prompt: "Генерируем персональную историю...",
        childName: "Ваш герой",
        visibility: "public",
        storyContent: null,
        images: null
      }
      
      console.log(`[API] Generation status: ${status}, elapsed: ${elapsed}ms`)
      return NextResponse.json(generationStatus)
    }

    // Get story data from KV
    const storyData = await getStory(storyId)

    if (!storyData) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Remove the deletion token from the response
    const { deletionToken, ...safeStoryData } = storyData

    return NextResponse.json(safeStoryData)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params: _params }: { params: Promise<{ id: string }> }) {
  try {
    const params = await _params
    const storyId = params.id
    const { searchParams } = new URL(request.url)
    const adminPassword = searchParams.get("adminPassword")

    console.log(`[DELETE] DELETE request for story ID: "${storyId}", type: ${typeof storyId}`)

    if (!storyId || storyId === 'undefined' || storyId === 'null') {
      console.error(`[DELETE] Invalid story ID received: "${storyId}"`)
      return NextResponse.json({ error: "Invalid story ID" }, { status: 404 })
    }

    console.log(`[DELETE] Attempting to delete story ${storyId}`)

    let storyData = null

    // Проверяем KV если доступно
    if (isKvAvailable) {
      try {
        storyData = await getStory(storyId)
        console.log(`[DELETE] Story from KV: ${storyData ? 'found' : 'not found'}`)
      } catch (error) {
        console.log(`[DELETE] Error getting story from KV:`, error)
      }
    }

    // Если не найдено в KV, проверяем файловый кеш
    if (!storyData) {
      console.log(`[DELETE] Checking file cache for story ${storyId}...`)
      try {
        const fs = require('fs')
        const path = require('path')
        const storiesCacheDir = path.join(process.cwd(), '.stories-cache')
        const filePath = path.join(storiesCacheDir, `${storyId}.json`)
        
        if (fs.existsSync(filePath)) {
          storyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          console.log(`[DELETE] ✅ Story ${storyId} found in file cache`)
        }
      } catch (error) {
        console.error(`[DELETE] Error loading story from file cache:`, error)
      }
    }

    if (!storyData) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Для admin операций всё ещё требуем пароль
    const isAdminOperation = adminPassword !== null
    if (isAdminOperation && adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Delete the story
    const deleteResult = await deleteStory(storyId)
    
    if (!deleteResult) {
      return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
    }

    console.log(`[DELETE] ✅ Story ${storyId} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ 
      error: "Failed to delete story", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

