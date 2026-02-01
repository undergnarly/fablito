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
  email: z.string().email().optional(), // Optional for anonymous users
  name: z.string().min(2).max(50),
  passwordHash: z.string().optional(), // Optional for anonymous users
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean().default(true),
  // Monetization fields
  coins: z.number().default(0), // Монетки для генерации
  isAnonymous: z.boolean().default(false), // Анонимный пользователь (гость)
  // Referral system
  referralCode: z.string().optional(), // Unique referral code for this user
  referredBy: z.string().optional(), // ID of user who referred this user
})

export type User = z.infer<typeof UserSchema>

// Transaction schema for coin history
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number(), // +50, -100, +3000, etc.
  type: z.enum(["welcome", "registration", "generation", "subscription", "refund", "referral"]),
  description: z.string().optional(),
  createdAt: z.string(),
})

export type Transaction = z.infer<typeof TransactionSchema>

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
  age: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  
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

  // Remove null/undefined values - Upstash Redis doesn't support null
  const cleanedData: Record<string, any> = {}
  for (const [key, value] of Object.entries(storyData)) {
    if (value !== null && value !== undefined) {
      cleanedData[key] = value
    }
  }

  await kv.hset(`story:${storyData.id}`, cleanedData)

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

  // Remove null/undefined values - Upstash Redis doesn't support null
  const cleanedData: Record<string, any> = {}
  for (const [key, value] of Object.entries(updatedData)) {
    if (value !== null && value !== undefined) {
      cleanedData[key] = value
    }
  }

  await kv.hset(`story:${id}`, cleanedData)

  return getStory(id)
}


/**
 * List all stories
 */
export async function listStories(limit = 100): Promise<Story[]> {
  // For local development without KV, read from file cache
  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const storiesCacheDir = path.join(process.cwd(), '.stories-cache')

      if (!fs.existsSync(storiesCacheDir)) {
        return []
      }

      const files = fs.readdirSync(storiesCacheDir).filter((file: string) => file.endsWith('.json'))

      const stories = files.slice(0, limit).map((file: string) => {
        try {
          const filePath = path.join(storiesCacheDir, file)
          const storyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

          // Ensure backward compatibility - add style field if missing
          if (!storyData.style) {
            const detectedLanguage = detectLanguageFromStory(storyData)
            storyData.style = { language: detectedLanguage }
          }

          return storyData
        } catch (error) {
          return null
        }
      }).filter(Boolean)

      stories.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
          processedData.storyContent = "{}"
        }
      }

      if (processedData.images !== undefined && typeof processedData.images !== "string") {
        try {
          processedData.images = JSON.stringify(processedData.images)
        } catch (e) {
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
      return result.success ? result.data : processedData as Story
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

/**
 * Create a new user
 */
export async function createUser(
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  referralCodeUsed?: string
): Promise<User> {
  const REFERRAL_BONUS = 100

  // Generate referral code for new user (only for non-anonymous users)
  const newUserReferralCode = !userData.isAnonymous ? generateReferralCode() : undefined

  // Find referrer if referral code provided
  let referrer: User | null = null
  if (referralCodeUsed && !userData.isAnonymous) {
    referrer = await getUserByReferralCode(referralCodeUsed)
    if (referrer) {
      console.log(`[DB] Found referrer: ${referrer.id} for new user`)
    }
  }

  const user: User = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    referralCode: newUserReferralCode,
    referredBy: referrer?.id,
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

      // Award referral bonus to referrer
      if (referrer) {
        await updateUserCoins(referrer.id, REFERRAL_BONUS, "referral", `Реферальный бонус за приглашение ${user.name}`)
        console.log(`[DB] ✅ Awarded ${REFERRAL_BONUS} coins to referrer ${referrer.id}`)
      }

      return user
    } catch (error) {
      console.error(`[DB] Error saving user to file cache:`, error)
      throw error
    }
  }

  try {
    const userKey = `user:${user.id}`

    // Only check/set email mapping if email is provided
    if (user.email) {
      const emailKey = `user:email:${user.email}`

      // Check if user with this email already exists
      const existingUser = await kv.get(emailKey)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      await kv.set(emailKey, user.id)
    }

    // Store referral code mapping
    if (newUserReferralCode) {
      await kv.set(`referral:${newUserReferralCode}`, user.id)
    }

    await kv.set(userKey, user)
    console.log(`[DB] ✅ User ${user.id} created successfully (email: ${user.email || 'none'})`)

    // Award referral bonus to referrer
    if (referrer) {
      await updateUserCoins(referrer.id, REFERRAL_BONUS, "referral", `Реферальный бонус за приглашение ${user.name}`)
      console.log(`[DB] ✅ Awarded ${REFERRAL_BONUS} coins to referrer ${referrer.id}`)
    }

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

/**
 * Update user data
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const user = await getUserById(id)
  if (!user) return null

  const updatedUser: User = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')
      const filePath = path.join(usersCacheDir, `${id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(updatedUser, null, 2))
      console.log(`[DB] ✅ User ${id} updated in file cache`)
      return updatedUser
    } catch (error) {
      console.error(`[DB] Error updating user in file cache:`, error)
      return null
    }
  }

  try {
    const userKey = `user:${id}`
    await kv.set(userKey, updatedUser)
    console.log(`[DB] ✅ User ${id} updated successfully`)
    return updatedUser
  } catch (error) {
    console.error(`[DB] Error updating user:`, error)
    return null
  }
}

/**
 * Get all users (for admin panel)
 */
export async function getAllUsers(): Promise<User[]> {
  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')

      if (!fs.existsSync(usersCacheDir)) {
        console.log('[DB] Users cache directory does not exist')
        return []
      }

      const files = fs.readdirSync(usersCacheDir).filter((f: string) => f.endsWith('.json'))
      console.log(`[DB] Found ${files.length} user files in cache`)
      const users: User[] = []

      for (const file of files) {
        try {
          const userData = JSON.parse(fs.readFileSync(path.join(usersCacheDir, file), 'utf8'))
          users.push(userData)
        } catch (e) {
          console.error(`[DB] Error reading user file ${file}:`, e)
        }
      }

      return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error(`[DB] Error getting all users from file cache:`, error)
      return []
    }
  }

  try {
    // Use SCAN instead of KEYS to avoid "too many keys" error
    const userKeys: string[] = []
    let cursor: string | number = "0"
    let iterations = 0
    const MAX_ITERATIONS = 100 // Safety limit to prevent infinite loops

    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: 'user:*', count: 100 })
      cursor = nextCursor
      iterations++

      // Filter to only include actual user keys (user:uuid format)
      // Exclude: user:email:*, user:uuid:transactions, referral:*, etc.
      for (const key of keys) {
        const parts = key.split(':')
        // Valid user key has exactly 2 parts: "user" and "uuid"
        if (parts.length === 2 && parts[0] === 'user') {
          userKeys.push(key)
        }
      }

      // Safety check to prevent infinite loop
      if (iterations >= MAX_ITERATIONS) {
        console.warn(`[DB] SCAN reached max iterations (${MAX_ITERATIONS}), stopping`)
        break
      }
    } while (String(cursor) !== "0")

    console.log(`[DB] Found ${userKeys.length} user keys via SCAN in ${iterations} iterations`)

    // Fetch users in batches to avoid overwhelming the connection
    const BATCH_SIZE = 50
    const users: User[] = []

    for (let i = 0; i < userKeys.length; i += BATCH_SIZE) {
      const batch = userKeys.slice(i, i + BATCH_SIZE)
      const userResults = await Promise.all(
        batch.map(async (key) => {
          try {
            return await kv.get(key) as User
          } catch (e) {
            console.error(`[DB] Error getting user for key ${key}:`, e)
            return null
          }
        })
      )

      for (const user of userResults) {
        if (user && user.id && user.name) {
          users.push(user)
        }
      }
    }

    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error(`[DB] Error getting all users:`, error)
    return []
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<boolean> {
  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')
      const filePath = path.join(usersCacheDir, `${id}.json`)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`[DB] ✅ User ${id} deleted from file cache`)
        return true
      }
      console.log(`[DB] User ${id} not found in file cache`)
      return false
    } catch (error) {
      console.error(`[DB] Error deleting user from file cache:`, error)
      return false
    }
  }

  try {
    // Get user first to find email for cleanup
    const user = await getUserById(id)
    if (!user) {
      console.log(`[DB] User ${id} not found`)
      return false
    }

    const userKey = `user:${id}`
    await kv.del(userKey)

    // Also delete email mapping if exists
    if (user.email) {
      const emailKey = `user:email:${user.email}`
      await kv.del(emailKey)
    }

    console.log(`[DB] ✅ User ${id} deleted successfully`)
    return true
  } catch (error) {
    console.error(`[DB] Error deleting user:`, error)
    return false
  }
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create anonymous user with welcome coins
 */
export async function createAnonymousUser(): Promise<User> {
  const WELCOME_COINS = 50 // Enough for exactly one 5-page story

  const user: User = {
    id: crypto.randomUUID(),
    name: "Гость",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    coins: WELCOME_COINS,
    isAnonymous: true,
  }

  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')

      if (!fs.existsSync(usersCacheDir)) {
        fs.mkdirSync(usersCacheDir, { recursive: true })
      }

      const filePath = path.join(usersCacheDir, `${user.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(user, null, 2))
      console.log(`[DB] ✅ Anonymous user ${user.id} created with ${WELCOME_COINS} coins`)

      // Add welcome transaction
      await addTransaction(user.id, WELCOME_COINS, "welcome", "Приветственный бонус")

      return user
    } catch (error) {
      console.error(`[DB] Error creating anonymous user:`, error)
      throw error
    }
  }

  try {
    const userKey = `user:${user.id}`
    await kv.set(userKey, user)
    console.log(`[DB] ✅ Anonymous user ${user.id} created with ${WELCOME_COINS} coins`)

    // Add welcome transaction
    await addTransaction(user.id, WELCOME_COINS, "welcome", "Приветственный бонус")

    return user
  } catch (error) {
    console.error(`[DB] Error creating anonymous user:`, error)
    throw error
  }
}

/**
 * Get user by referral code
 */
export async function getUserByReferralCode(referralCode: string): Promise<User | null> {
  if (!isKvAvailable) {
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
          const data = fs.readFileSync(filePath, 'utf-8')
          const user = JSON.parse(data)
          if (user.referralCode === referralCode) {
            return user
          }
        }
      }
      return null
    } catch (error) {
      console.error(`[DB] Error finding user by referral code:`, error)
      return null
    }
  }

  try {
    // Get referral code -> user id mapping
    const userId = await kv.get<string>(`referral:${referralCode}`)
    if (!userId) return null
    return getUserById(userId)
  } catch (error) {
    console.error(`[DB] Error finding user by referral code:`, error)
    return null
  }
}

/**
 * Convert anonymous user to registered user
 */
export async function convertAnonymousToUser(
  userId: string,
  email: string,
  name: string,
  passwordHash: string,
  referralCode?: string // Optional referral code from someone who invited this user
): Promise<User | null> {
  const REGISTRATION_BONUS = 50
  const REFERRAL_BONUS = 100

  const user = await getUserById(userId)
  if (!user || !user.isAnonymous) {
    console.error(`[DB] User ${userId} not found or not anonymous`)
    return null
  }

  // Check if email already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    console.error(`[DB] Email ${email} already exists`)
    return null
  }

  // Find referrer if referral code provided
  let referrer: User | null = null
  if (referralCode) {
    referrer = await getUserByReferralCode(referralCode)
    if (referrer) {
      console.log(`[DB] Found referrer: ${referrer.id} for new user ${userId}`)
    }
  }

  // Generate unique referral code for new user
  const newUserReferralCode = generateReferralCode()

  const updatedUser: User = {
    ...user,
    email,
    name,
    passwordHash,
    isAnonymous: false,
    coins: user.coins + REGISTRATION_BONUS,
    updatedAt: new Date().toISOString(),
    referralCode: newUserReferralCode,
    referredBy: referrer?.id,
  }

  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const usersCacheDir = path.join(process.cwd(), '.users-cache')
      const filePath = path.join(usersCacheDir, `${userId}.json`)
      fs.writeFileSync(filePath, JSON.stringify(updatedUser, null, 2))

      // Add registration bonus transaction
      await addTransaction(userId, REGISTRATION_BONUS, "registration", "Бонус за регистрацию")

      // Award referral bonus to referrer
      if (referrer) {
        await updateUserCoins(referrer.id, REFERRAL_BONUS, "referral", `Реферальный бонус за приглашение ${name}`)
        console.log(`[DB] ✅ Awarded ${REFERRAL_BONUS} coins to referrer ${referrer.id}`)
      }

      console.log(`[DB] ✅ Anonymous user ${userId} converted to registered user`)
      return updatedUser
    } catch (error) {
      console.error(`[DB] Error converting anonymous user:`, error)
      return null
    }
  }

  try {
    const userKey = `user:${userId}`
    const emailKey = `user:email:${email}`
    const referralKey = `referral:${newUserReferralCode}`

    await kv.set(userKey, updatedUser)
    await kv.set(emailKey, userId)
    await kv.set(referralKey, userId) // Map referral code to user id

    // Add registration bonus transaction
    await addTransaction(userId, REGISTRATION_BONUS, "registration", "Бонус за регистрацию")

    // Award referral bonus to referrer
    if (referrer) {
      await updateUserCoins(referrer.id, REFERRAL_BONUS, "referral", `Реферальный бонус за приглашение ${name}`)
      console.log(`[DB] ✅ Awarded ${REFERRAL_BONUS} coins to referrer ${referrer.id}`)
    }

    console.log(`[DB] ✅ Anonymous user ${userId} converted to registered user`)
    return updatedUser
  } catch (error) {
    console.error(`[DB] Error converting anonymous user:`, error)
    return null
  }
}

/**
 * Update user coins (add or subtract)
 */
export async function updateUserCoins(
  userId: string,
  amount: number,
  type: Transaction["type"],
  description?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const user = await getUserById(userId)
  if (!user) {
    return { success: false, newBalance: 0, error: "User not found" }
  }

  const newBalance = user.coins + amount

  // Check if user has enough coins for negative amounts
  if (newBalance < 0) {
    return { success: false, newBalance: user.coins, error: "Недостаточно монеток" }
  }

  const updated = await updateUser(userId, { coins: newBalance })
  if (!updated) {
    return { success: false, newBalance: user.coins, error: "Failed to update user" }
  }

  // Add transaction record
  await addTransaction(userId, amount, type, description)

  console.log(`[DB] ✅ User ${userId} coins updated: ${user.coins} -> ${newBalance} (${amount > 0 ? '+' : ''}${amount})`)
  return { success: true, newBalance }
}

/**
 * Add transaction record
 */
export async function addTransaction(
  userId: string,
  amount: number,
  type: Transaction["type"],
  description?: string
): Promise<Transaction> {
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    userId,
    amount,
    type,
    description,
    createdAt: new Date().toISOString(),
  }

  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const transactionsCacheDir = path.join(process.cwd(), '.transactions-cache')

      if (!fs.existsSync(transactionsCacheDir)) {
        fs.mkdirSync(transactionsCacheDir, { recursive: true })
      }

      const filePath = path.join(transactionsCacheDir, `${transaction.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(transaction, null, 2))
      return transaction
    } catch (error) {
      console.error(`[DB] Error saving transaction:`, error)
      throw error
    }
  }

  try {
    const transactionKey = `transaction:${transaction.id}`
    const userTransactionsKey = `user:${userId}:transactions`

    await kv.set(transactionKey, transaction)
    await kv.lpush(userTransactionsKey, transaction.id)

    return transaction
  } catch (error) {
    console.error(`[DB] Error adding transaction:`, error)
    throw error
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
  if (!isKvAvailable) {
    try {
      const fs = require('fs')
      const path = require('path')
      const transactionsCacheDir = path.join(process.cwd(), '.transactions-cache')

      if (!fs.existsSync(transactionsCacheDir)) {
        return []
      }

      const files = fs.readdirSync(transactionsCacheDir)
        .filter((file: string) => file.endsWith('.json'))

      const transactions: Transaction[] = []
      for (const file of files) {
        const filePath = path.join(transactionsCacheDir, file)
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (data.userId === userId) {
          transactions.push(data)
        }
      }

      return transactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error(`[DB] Error reading transactions:`, error)
      return []
    }
  }

  try {
    const userTransactionsKey = `user:${userId}:transactions`
    const transactionIds = await kv.lrange(userTransactionsKey, 0, limit - 1) as string[]

    if (!transactionIds || transactionIds.length === 0) {
      return []
    }

    const transactions: Transaction[] = []
    for (const id of transactionIds) {
      const transaction = await kv.get(`transaction:${id}`) as Transaction
      if (transaction) {
        transactions.push(transaction)
      }
    }

    return transactions
  } catch (error) {
    console.error(`[DB] Error getting user transactions:`, error)
    return []
  }
}

