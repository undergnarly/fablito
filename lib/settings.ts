import { kv } from "@vercel/kv"

// Default settings
const DEFAULT_SETTINGS = {
  ALPHABET_LETTERS_COUNT: 2, // Ограничиваем до 2 страниц для быстрого тестирования
  SUBMISSIONS_HALTED: false,
  REGISTRATION_CODE: "", // Кодовое слово для регистрации (пустое = регистрация открыта)
  ANONYMOUS_COINS: 50, // Монеты для анонимных пользователей
  REGISTRATION_COINS: 100, // Монеты при регистрации
}

// Type for app settings
export type AppSettings = typeof DEFAULT_SETTINGS

// Проверяем, доступен ли KV для локальной разработки
export const isKvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && 
  process.env.KV_REST_API_URL !== "your_kv_rest_api_url_here" && 
  process.env.KV_REST_API_TOKEN !== "your_kv_rest_api_token_here" &&
  process.env.KV_REST_API_URL !== "https://your-kv-url" && 
  process.env.KV_REST_API_TOKEN !== "your-kv-token"

/**
 * Get a specific setting from KV storage
 * @param key The setting key
 * @returns The setting value
 */
export async function getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
  // Для локальной разработки без KV возвращаем значения по умолчанию
  if (!isKvAvailable) {
    return DEFAULT_SETTINGS[key]
  }

  try {
    // Try to get the setting from KV
    const value = await kv.get(`settings:${key}`)

    // If the setting doesn't exist, return the default value
    if (value === null) {
      return DEFAULT_SETTINGS[key]
    }

    return value as AppSettings[K]
  } catch (error) {
    console.error(`[SETTINGS] Error getting setting ${key}:`, error)
    // Return default value in case of error
    return DEFAULT_SETTINGS[key]
  }
}

/**
 * Update a setting in KV storage
 * @param key The setting key
 * @param value The new value
 * @returns True if successful
 */
export async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<boolean> {
  // Для локальной разработки без KV возвращаем true
  if (!isKvAvailable) {
    return true
  }

  try {
    await kv.set(`settings:${key}`, value)
    return true
  } catch (error) {
    console.error(`[SETTINGS] Error updating setting ${key}:`, error)
    return false
  }
}

/**
 * Get all settings
 * @returns All settings
 */
export async function getAllSettings(): Promise<AppSettings> {
  const settings = { ...DEFAULT_SETTINGS }

  try {
    // Get all setting keys
    const keys = Object.keys(DEFAULT_SETTINGS) as Array<keyof AppSettings>

    // Get each setting value
    for (const key of keys) {
      settings[key] = await getSetting(key)
    }

    return settings
  } catch (error) {
    console.error("[SETTINGS] Error getting all settings:", error)
    return DEFAULT_SETTINGS
  }
}

