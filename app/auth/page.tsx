"use client"

import { useState } from "react"
import { RegisterForm } from "@/components/auth/register-form"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export default function AuthPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.login}</TabsTrigger>
            <TabsTrigger value="register">{t.register}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register" className="mt-6">
            <RegisterForm />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← {t.back} to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
