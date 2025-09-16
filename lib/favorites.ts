"use client"

import { useState, useEffect } from "react"

export interface FavoriteStory {
  id: string
  title: string
  createdAt: string
  previewImage?: string
  style?: {
    language: 'ru' | 'en' | 'kz'
  }
}

// Hook to manage favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStory[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("abc-story-favorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (e) {
        console.error("Error parsing favorites:", e)
        setFavorites([])
      }
    }
    setLoaded(true)
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("abc-story-favorites", JSON.stringify(favorites))
    }
  }, [favorites, loaded])

  // Add a story to favorites
  const addFavorite = (story: FavoriteStory) => {
    setFavorites((prev) => {
      // Check if already in favorites
      if (prev.some((fav) => fav.id === story.id)) {
        return prev
      }
      return [...prev, story]
    })
  }

  // Remove a story from favorites
  const removeFavorite = (storyId: string) => {
    setFavorites((prev) => prev.filter((story) => story.id !== storyId))
  }

  // Check if a story is in favorites
  const isFavorite = (storyId: string) => {
    return favorites.some((story) => story.id === storyId)
  }

  // Clean up favorites by removing stories that no longer exist
  const cleanupFavorites = async (existingStoryIds: string[]) => {
    setFavorites((prev) => {
      const cleanedFavorites = prev.filter((favorite) => 
        existingStoryIds.includes(favorite.id)
      )
      
      // Only update if there were changes
      if (cleanedFavorites.length !== prev.length) {
        console.log(`[FAVORITES] Cleaned up ${prev.length - cleanedFavorites.length} non-existent stories from favorites`)
        return cleanedFavorites
      }
      
      return prev
    })
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    cleanupFavorites,
    loaded,
  }
}

