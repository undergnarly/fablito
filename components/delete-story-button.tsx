"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useFavorites } from "@/lib/favorites"

interface DeleteStoryButtonProps {
  storyId: string
  storyTitle: string
  onDelete?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DeleteStoryButton({ 
  storyId, 
  storyTitle, 
  onDelete,
  variant = "destructive",
  size = "sm",
  className = ""
}: DeleteStoryButtonProps) {
  const { t } = useLanguage()
  const { removeFavorite } = useFavorites()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      console.log(`[DELETE] Starting deletion of story ${storyId}`)
      
      const response = await fetch(`/api/story/${storyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete story')
      }

      const result = await response.json()
      console.log(`[DELETE] ✅ Story deleted successfully:`, result)

      // Отмечаем успешное удаление
      setIsSuccess(true)
      console.log('[DELETE] Story deleted successfully, setting up redirect')
      
      // Вызываем callback если предоставлен
      if (onDelete) {
        console.log('[DELETE] Calling onDelete callback')
        onDelete()
      }
      
      // Показываем сообщение и перенаправляем на страницу историй
      setTimeout(() => {
        console.log('[DELETE] Closing dialog and redirecting to /stories')
        setIsOpen(false)
        // Используем window.location для более надежного перенаправления
        window.location.href = '/stories'
      }, 1500) // Даем время показать сообщение об успехе

    } catch (error) {
      console.error(`[DELETE] Error deleting story:`, error)
      alert(`Ошибка при удалении истории: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`gap-2 ${className}`}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {size !== "icon" && (isDeleting ? "Удаление..." : "Удалить")}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSuccess ? "✅ История удалена!" : "Удалить историю?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSuccess ? (
              <span className="text-green-600">
                История "{storyTitle}" была успешно удалена. 
                <br />
                Переходим к каталогу историй...
              </span>
            ) : (
              <span>
                Вы уверены, что хотите удалить историю 
                <span className="font-semibold"> "{storyTitle}"</span>?
                <br />
                <span className="text-destructive">
                  Это действие нельзя отменить. История будет удалена навсегда.
                </span>
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          {!isSuccess && (
            <>
              <AlertDialogCancel disabled={isDeleting}>
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Удаление...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить историю
                  </>
                )}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteStoryButton

