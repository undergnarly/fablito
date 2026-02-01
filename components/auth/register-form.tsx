"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, Key } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  referralCode?: string
  requireCode?: boolean
}

export function RegisterForm({ onSuccess, onSwitchToLogin, referralCode, requireCode }: RegisterFormProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    registrationCode: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear errors when user starts typing
    if (error) setError(null)
    if (name === 'password' && passwordErrors.length > 0) {
      setPasswordErrors([])
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.name.trim()) {
      errors.push(t.nameRequired)
    }

    if (!formData.email.trim()) {
      errors.push(t.emailRequired)
    }

    if (!formData.password) {
      errors.push(t.passwordRequired)
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push(t.passwordsDoNotMatch)
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setPasswordErrors([])

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          referralCode: referralCode,
          registrationCode: formData.registrationCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setPasswordErrors(data.details)
        } else {
          setError(data.error || t.registrationFailed)
        }
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
      setError(t.errorOccurred + ' ' + t.register.toLowerCase())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t.createAccount}</h2>
        <p className="text-white/60 text-sm">
          {t.joinUs}
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {passwordErrors.length > 0 && (
          <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-white/80">
              <User className="h-4 w-4" />
              {t.fullName}
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t.enterFullName}
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

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
              placeholder={t.createStrongPassword}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-white/80">
              <Lock className="h-4 w-4" />
              {t.confirmPassword}
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t.confirmYourPassword}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400 focus:ring-pink-400"
            />
          </div>

          {requireCode && (
            <div className="space-y-2">
              <Label htmlFor="registrationCode" className="flex items-center gap-2 text-white/80">
                <Key className="h-4 w-4" />
                {t.registrationCode || "Registration Code"}
              </Label>
              <Input
                id="registrationCode"
                name="registrationCode"
                type="text"
                placeholder={t.enterRegistrationCode || "Enter registration code"}
                value={formData.registrationCode}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-pink-400 focus:ring-pink-400"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.creatingAccount}
              </span>
            ) : (
              t.createAccount
            )}
          </Button>
        </form>

        {onSwitchToLogin && (
          <div className="text-center text-sm text-white/60">
            {t.alreadyHaveAccount}{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-pink-400 hover:text-pink-300 font-medium"
            >
              {t.signIn}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
