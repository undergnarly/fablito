import "server-only"
import { kv } from "@vercel/kv"
import { z } from "zod"
import crypto from "crypto"
import { detectLanguageFromStory } from "./language-detector"

// Check if KV is available for local development
const isKvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && 
  process.env.KV_REST_API_URL !== "your_kv_rest_api_url_here" && 
  process.env.KV_REST_API_TOKEN !== "your_kv_rest_api_token_here" &&
  process.env.KV_REST_API_URL !== "https://your-kv-url" && 
  process.env.KV_REST_API_TOKEN !== "your-kv-token"

// Story page schema
export const StoryPageSchema = z.object({
  text: z.string(),
  imagePrompt: z.string(),
})

// Story content schema
export const StoryContentSchema = z.object({
  title: z.string(),
  pages: z.array(StoryPageSchema),
  moral: z.string().optional(),
})

// New style options
export const StyleOptionsSchema = z.object({
  language: z.enum(["ru", "en", "kz"]),
})

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  passwordHash: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean().default(true),
})

// Story schema with new fields
export const StorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  
  // New required fields
  childName: z.string(), // Имя ребёнка
  childAge: z.number().min(2).max(12), // Возраст ребёнка
  theme: z.string(), // Тема/мораль сказки
  style: StyleOptionsSchema, // Стиль иллюстраций и язык
  voiceStory: z.string().optional(), // URL аудио-записи истории (blob storage)
  textStory: z.string().optional(), // Текстовая версия истории от пользователя
  
  // Legacy fields (для совместимости)
  prompt: z.string().optional(),
  age: z.string().optional(),
  
  status: z.enum(["generating", "generating_story", "generating_images", "complete", "failed"]),
  visibility: z.enum(["public", "unlisted"]).default("public"),
  storyContent: z.string().optional(), // This is a JSON string
  images: z.string().optional(), // This is a JSON string
  characterReference: z.string().optional(), // Base64 of first image for character consistency
  createdAt: z.string(),
  completedAt: z.string().optional(),
  deletionToken: z.string(),
  error: z.string().optional(),
})

export type Story = z.infer<typeof StorySchema>
export type StoryContent = z.infer<typeof StoryContentSchema>
export type StoryPage = z.infer<typeof StoryPageSchema>
export type StyleOptions = z.infer<typeof StyleOptionsSchema>

// CRUD operations for stories

/**
 * Create a new story
 */
export async function createStory(storyData: Partial<Story>): Promise<Story> {
  // For local development without KV, return mock story without saving
  if (!isKvAvailable) {
    console.log("[DB] KV not available - returning mock story without saving to database")
    return {
      ...storyData,
      id: storyData.id || crypto.randomUUID(),
      createdAt: storyData.createdAt || new Date().toISOString(),
      status: storyData.status || "generating"
    } as Story
  }

  if (!storyData.id) {
    console.error(`[DB] Error: Story ID is required`)
    throw new Error("Story ID is required")
  }

  // Ensure storyContent is a string if provided
  if (storyData.storyContent !== undefined) {
    if (typeof storyData.storyContent !== "string") {
      try {
        storyData.storyContent = JSON.stringify(storyData.storyContent)
      } catch (error) {
        console.error(`[DB] Error stringifying storyContent:`, error)
        storyData.storyContent = "{}"
      }
    }
  }

  // Ensure images is a string if provided
  if (storyData.images !== undefined) {
    if (typeof storyData.images !== "string") {
      try {
        storyData.images = JSON.stringify(storyData.images)
      } catch (error) {
        console.error(`[DB] Error stringifying images:`, error)
        storyData.images = "[]"
      }
    }
  }

  await kv.hset(`story:${storyData.id}`, storyData)

  return storyData as Story
}

/**
 * Get a story by ID
 */
export async function getStory(id: string): Promise<Story | null> {
  // For local development without KV, return null (no stories available)
  if (!isKvAvailable) {
    console.log("[DB] KV not available - no stories can be retrieved")
    return null
  }

  try {
    const storyData = await kv.hgetall(`story:${id}`)

    if (!storyData) {
      return null
    }

    // Clone the data to avoid modifying the original
    const processedData = { ...storyData }

    // Ensure data consistency before validation
  if (processedData.storyContent !== undefined && typeof processedData.storyContent !== "string") {
    try {
      processedData.storyContent = JSON.stringify(processedData.storyContent)
    } catch (e) {
      console.error(`[DB] Error stringifying storyContent:`, e)
      processedData.storyContent = "{}"
    }
  }

  if (processedData.images !== undefined && typeof processedData.images !== "string") {
    try {
      processedData.images = JSON.stringify(processedData.images)
    } catch (e) {
      console.error(`[DB] Error stringifying images:`, e)
      processedData.images = "[]"
    }
  }

    // Use safeParse instead of parse to avoid exceptions
    const result = StorySchema.safeParse(processedData)

    if (result.success) {
      // Return the validated data
      return result.data
    } else {
      // Log validation errors
      console.error(`[DB] Story validation failed:`, result.error)
      // Return the processed data as a fallback
      return processedData as Story
    }
  } catch (error) {
    console.error("[DB] Error getting story:", error)
    return null
  }
}

/**
 * Update a story
 */
export async function updateStory(id: string, data: Partial<Story>): Promise<Story | null> {
  // For local development without KV, return mock updated story
  if (!isKvAvailable) {
    console.log(`[DB] KV not available - returning mock updated story for ID: ${id}`)
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    } as Story
  }

  const storyExists = await kv.exists(`story:${id}`)

  if (!storyExists) {
    return null
  }

  // Create a copy of the data to avoid modifying the original
  const updatedData = { ...data }

  // Ensure storyContent is a string if provided
  if (updatedData.storyContent !== undefined) {
    if (typeof updatedData.storyContent !== "string") {
      try {
        updatedData.storyContent = JSON.stringify(updatedData.storyContent)
      } catch (error) {
        console.error(`[DB] Error stringifying storyContent:`, error)
        // If stringification fails, set to empty object string
        updatedData.storyContent = "{}"
      }
    }
  }

  // Ensure images is a string if provided
  if (updatedData.images !== undefined) {
    if (typeof updatedData.images !== "string") {
      try {
        updatedData.images = JSON.stringify(updatedData.images)
      } catch (error) {
        console.error(`[DB] Error stringifying images:`, error)
        // If stringification fails, set to empty array string
        updatedData.images = "[]"
      }
    }
  }

  await kv.hset(`story:${id}`, updatedData)

  return getStory(id)
}


/**
 * List all stories
 */
export async function listStories(limit = 100): Promise<Story[]> {
  // For local development without KV, read from file cache
  if (!isKvAvailable) {
    console.log("[DB] KV not available - reading stories from file cache")
    try {
      const fs = require('fs')
      const path = require('path')
      const storiesCacheDir = path.join(process.cwd(), '.stories-cache')
      
      if (!fs.existsSync(storiesCacheDir)) {
        console.log("[DB] Stories cache directory not found")
        return []
      }
      
      const files = fs.readdirSync(storiesCacheDir).filter((file: string) => file.endsWith('.json'))
      console.log(`[DB] Found ${files.length} stories in cache`)
      
      const stories = files.slice(0, limit).map((file: string) => {
        try {
          const filePath = path.join(storiesCacheDir, file)
          const storyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
          
          // Ensure backward compatibility - add style field if missing
          if (!storyData.style) {
            const detectedLanguage = detectLanguageFromStory(storyData)
            storyData.style = { language: detectedLanguage }
          }
          
          // Debug logging for images
          console.log(`[DB] Story ${storyData.id} (${storyData.title}):`, {
            hasImages: !!storyData.images,
            imagesType: typeof storyData.images,
            imagesValue: storyData.images ? storyData.images.substring(0, 100) + '...' : null
          })
          
          return storyData
        } catch (error) {
          console.error(`[DB] Error reading story file ${file}:`, error)
          return null
        }
      }).filter(Boolean)
      
      // Сортируем по дате создания (новые сначала)
      stories.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      console.log(`[DB] Successfully loaded ${stories.length} stories from cache`)
      return stories
    } catch (error) {
      console.error("[DB] Error reading stories from file cache:", error)
      return []
    }
  }

  try {
    const storyKeys = await kv.keys("story:*")

    if (!storyKeys || storyKeys.length === 0) {
      return []
    }

    const stories = await Promise.all(
    storyKeys.slice(0, limit).map(async (key) => {
      const storyData = await kv.hgetall(key)

      if (!storyData) return null

      // Clone the data to avoid modifying the original
      const processedData = { ...storyData }

      // Ensure data consistency before validation
      if (processedData.storyContent !== undefined && typeof processedData.storyContent !== "string") {
        try {
          processedData.storyContent = JSON.stringify(processedData.storyContent)
        } catch (e) {
          console.error(`[DB] Error stringifying storyContent:`, e)
          processedData.storyContent = "{}"
        }
      }

      if (processedData.images !== undefined && typeof processedData.images !== "string") {
        try {
          processedData.images = JSON.stringify(processedData.images)
        } catch (e) {
          console.error(`[DB] Error stringifying images:`, e)
          processedData.images = "[]"
        }
      }

      // Ensure backward compatibility - add style field if missing
      if (!processedData.style) {
        const detectedLanguage = detectLanguageFromStory(processedData)
        processedData.style = { language: detectedLanguage }
      }

      // Use safeParse instead of assuming the data is valid
      const result = StorySchema.safeParse(processedData)

      if (result.success) {
        return result.data
      } else {
        console.error(`[DB] Story validation failed for ${key}:`, result.error)
        return processedData as Story
      }
    }),
  )

  //return stories.filter(Boolean)

  // 방법 1: 타입 서술어 사용
  //return stories.filter((story): story is Story => story !== null);

  // 방법 2: 더 간결한 방식으로 null 체크
    return stories.filter((story): story is Story => Boolean(story));
  } catch (error) {
    console.error("[DB] Error listing stories:", error)
    return []
  }
}

/**
 * Delete a story by ID
 */
export async function deleteStory(id: string): Promise<boolean> {
  // For local development without KV, delete from file cache
  if (!isKvAvailable) {
    console.log(`[DB] KV not available - deleting story ${id} from file cache`)
    try {
      const fs = require('fs')
      const path = require('path')
      const storiesCacheDir = path.join(process.cwd(), '.stories-cache')
      const filePath = path.join(storiesCacheDir, `${id}.json`)
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`[DB] ✅ Story ${id} deleted from file cache`)
        return true
      } else {
        console.log(`[DB] ⚠️  Story ${id} not found in file cache`)
        return false
      }
    } catch (error) {
      console.error(`[DB] Error deleting story ${id} from file cache:`, error)
      return false
    }
  }

  try {
    const storyKey = `story:${id}`
    const exists = await kv.exists(storyKey)
    
    if (!exists) {
      console.log(`[DB] Story ${id} not found`)
      return false
    }
    
    await kv.del(storyKey)
    console.log(`[DB] ✅ Story ${id} deleted successfully`)
    return true
  } catch (error) {
    console.error(`[DB] Error deleting story ${id}:`, error)
    return false
  }
}

// User management functions
export type User = z.infer<typeof UserSchema>

/**
 * Create a new user
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const user: User = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (!isKvAvailable) {
    // For local development, save to file cache
    console.log(`[DB] KV not available - saving user to file cache`)
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')
      
      if (!fs.existsSync(usersCacheDir)) {
        fs.mkdirSync(usersCacheDir, { recursive: true })
      }
      
      const filePath = path.join(usersCacheDir, `${user.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(user, null, 2))
      console.log(`[DB] ✅ User ${user.id} saved to file cache`)
      return user
    } catch (error) {
      console.error(`[DB] Error saving user to file cache:`, error)
      throw error
    }
  }

  try {
    const userKey = `user:${user.id}`
    const emailKey = `user:email:${user.email}`
    
    // Check if user with this email already exists
    const existingUser = await kv.get(emailKey)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    
    await kv.set(userKey, user)
    await kv.set(emailKey, user.id)
    console.log(`[DB] ✅ User ${user.id} created successfully`)
    return user
  } catch (error) {
    console.error(`[DB] Error creating user:`, error)
    throw error
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isKvAvailable) {
    // For local development, search in file cache
    console.log(`[DB] KV not available - searching user in file cache`)
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')
      
      if (!fs.existsSync(usersCacheDir)) {
        return null
      }
      
      const files = fs.readdirSync(usersCacheDir)
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(usersCacheDir, file)
          const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          if (userData.email === email) {
            return userData as User
          }
        }
      }
      return null
    } catch (error) {
      console.error(`[DB] Error searching user in file cache:`, error)
      return null
    }
  }

  try {
    const emailKey = `user:email:${email}`
    const userId = await kv.get(emailKey) as string
    
    if (!userId) {
      return null
    }
    
    const userKey = `user:${userId}`
    const user = await kv.get(userKey) as User
    return user
  } catch (error) {
    console.error(`[DB] Error getting user by email:`, error)
    return null
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  if (!isKvAvailable) {
    // For local development, read from file cache
    console.log(`[DB] KV not available - reading user from file cache`)
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')
      const filePath = path.join(usersCacheDir, `${id}.json`)
      
      if (fs.existsSync(filePath)) {
        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        return userData as User
      }
      return null
    } catch (error) {
      console.error(`[DB] Error reading user from file cache:`, error)
      return null
    }
  }

  try {
    const userKey = `user:${id}`
    const user = await kv.get(userKey) as User
    return user
  } catch (error) {
    console.error(`[DB] Error getting user by ID:`, error)
    return null
  }
}

