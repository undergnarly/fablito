"use client"

import { useState } from "react"
import { RegisterForm } from "@/components/auth/register-form"
import { LoginForm } from "@/components/auth/login-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function AuthPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-pink-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white glow-text" style={{ fontFamily: 'SuperJoyful, sans-serif' }}>
            Fablito
          </h1>
          <p className="text-white/60 mt-2">Волшебные истории для детей</p>
        </div>

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
              <RegisterForm />
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
