"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t.loginFailed)
        return
      }

      // Success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError(t.errorOccurred + ' ' + t.login.toLowerCase())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
          <LogIn className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t.welcomeBack}</h2>
        <p className="text-white/60 text-sm">
          Войдите, чтобы продолжить создавать волшебные истории
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-white/80">
              <Mail className="h-4 w-4" />
              {t.email}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.enterEmail}
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-white/80">
              <Lock className="h-4 w-4" />
              {t.password}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t.enterPassword}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.signingIn}
              </span>
            ) : (
              t.signIn
            )}
          </Button>
        </form>

        {onSwitchToRegister && (
          <div className="text-center text-sm text-white/60">
            {t.dontHaveAccount}{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-pink-400 hover:text-pink-300 font-medium"
            >
              {t.signUp}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
