"use client"

import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Coins, Sparkles, Check, Gift, CreditCard, ArrowLeft } from "lucide-react"
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
        // Redirect to Stripe checkout (real payment)
        window.location.href = data.url
      } else if (data.success) {
        // Simulation mode - coins added directly
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
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white hover:text-white/80 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
              {t.back}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-lobster)]">
            {t.subscriptionTitle}
          </h1>
          <p className="text-lg text-white/70">
            {t.subscriptionSubtitle}
          </p>
        </div>

        {/* Current balance */}
        {user && (
          <Card className="magic-card border-0 rounded-xl mb-8 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-white/70">{t.currentBalance}</p>
                  <p className="text-2xl font-bold text-yellow-300">{user.coins} {t.coinsLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/50">10 {t.coinsLabel} = 1 {t.perPage}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Free coins info */}
        <Card className="magic-card border-0 rounded-xl mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">{t.freeCoinsInfo}</h3>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{t.welcomeBonus}: 50 {t.coinsLabel}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{t.registrationBonus}: +50 {t.coinsLabel}</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Subscription plan */}
        <Card className="magic-card border-0 rounded-xl overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-pink-500/20 to-orange-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t.monthlyPlan}</h2>
                <p className="text-white/70">{t.monthlyPlanDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-yellow-300">3000</p>
                <p className="text-sm text-white/70">{t.coinsPerMonth}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-pink-300">300</p>
                <p className="text-sm text-white/70">{t.pagesPerMonth}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-300">~30</p>
                <p className="text-sm text-white/70">{t.booksPerMonth}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-white/70">/month</span>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full md:w-auto px-12 py-6 text-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    {t.subscribing}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 w-5 h-5" />
                    {t.subscribe}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
