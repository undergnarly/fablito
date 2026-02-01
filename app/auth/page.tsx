"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"
import { LoginForm } from "@/components/auth/login-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { ArrowLeft, Gift } from "lucide-react"

function AuthContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref")

  // If there's a referral code, default to register tab
  const [activeTab, setActiveTab] = useState(referralCode ? "register" : "login")
  const [requireCode, setRequireCode] = useState(false)

  useEffect(() => {
    fetch("/api/auth/registration-config")
      .then(res => res.json())
      .then(data => setRequireCode(data.requireCode))
      .catch(() => setRequireCode(false))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white glow-text font-logo">
            Fablito
          </h1>
        </div>

        {/* Referral banner */}
        {referralCode && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-white font-medium">{t.referralWelcome || "You've been invited!"}</p>
                <p className="text-sm text-white/70">{t.referralBonusInfo || "Register now and get bonus coins!"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="magic-card rounded-2xl p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                {t.login}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                {t.register}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <RegisterForm referralCode={referralCode || undefined} requireCode={requireCode} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад на главную
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
