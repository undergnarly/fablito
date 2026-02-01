"use client"

import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ isLoading, message, fullScreen = false }: LoadingOverlayProps) {
  if (!isLoading) return null

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          {message && (
            <p className="text-lg text-foreground/80 animate-pulse">{message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && (
          <p className="text-sm text-foreground/70">{message}</p>
        )}
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md", message }: { size?: "sm" | "md" | "lg", message?: string }) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }[size]

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={`animate-spin ${sizeClass}`} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}
