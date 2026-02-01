"use client"

import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Coins, Sparkles, Check, CreditCard, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SubscriptionPage() {
  const { t } = useLanguage()
  const { user, isLoading, refreshUser } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.success) {
        await refreshUser()
        alert(`${data.coinsAdded} ${t.coinsLabel} added! New balance: ${data.newBalance}`)
      } else if (data.error) {
        alert(data.message || data.error)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription process')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-48 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">
            {t.subscriptionTitle}
          </h1>
          <p className="text-white/60">
            {t.subscriptionSubtitle}
          </p>
        </div>

        {/* Current balance */}
        {user && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wide">{t.currentBalance}</p>
                    <p className="text-xl font-semibold text-white">{user.coins} <span className="text-sm font-normal text-white/60">{t.coinsLabel}</span></p>
                  </div>
                </div>
                <div className="text-right text-xs text-white/40">
                  10 {t.coinsLabel} = 1 {t.perPage}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Free tier info */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/10">
                {t.freeCoinsInfo}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-white/70">
                <Check className="w-4 h-4 text-white/50" />
                <span>{t.welcomeBonus}: 500 {t.coinsLabel}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="bg-white/10 my-6" />

        {/* Subscription plan */}
        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">{t.monthlyPlan}</CardTitle>
                  <CardDescription className="text-white/50">{t.monthlyPlanDesc}</CardDescription>
                </div>
              </div>
              <Badge className="bg-white/10 text-white/80 hover:bg-white/10">Pro</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-white">3000</p>
                <p className="text-xs text-white/50">{t.coinsPerMonth}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-white">300</p>
                <p className="text-xs text-white/50">{t.pagesPerMonth}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-white">~30</p>
                <p className="text-xs text-white/50">{t.booksPerMonth}</p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-semibold text-white">$9.99</span>
                <span className="text-white/50 ml-1">/month</span>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="bg-white text-black hover:bg-white/90 font-medium px-6"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                    {t.subscribing}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 w-4 h-4" />
                    {t.subscribe}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-white/40 mt-6">
          Cancel anytime. No commitment required.
        </p>
      </div>
    </main>
  )
}
