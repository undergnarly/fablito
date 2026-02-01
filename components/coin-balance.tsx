"use client"

import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/lib/language-context"
import { Coins, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CoinBalanceProps {
  showBuyButton?: boolean
  compact?: boolean
}

export function CoinBalance({ showBuyButton = true, compact = false }: CoinBalanceProps) {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <Coins className="h-4 w-4 animate-pulse" />
        <span className="text-sm">...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/30">
        <Coins className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-medium text-yellow-300">{user.coins}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-500/30">
        <Coins className="h-5 w-5 text-yellow-400" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-yellow-300">{user.coins}</span>
          <span className="text-xs text-yellow-400/70">{t.coinsLabel}</span>
        </div>
      </div>

      {showBuyButton && user.coins < 100 && (
        <Link href="/subscription">
          <Button
            size="sm"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {t.buyButton}
          </Button>
        </Link>
      )}
    </div>
  )
}

interface GenerationCostProps {
  pageCount: number
  userCoins?: number
}

export function GenerationCost({ pageCount, userCoins }: GenerationCostProps) {
  const { t } = useLanguage()
  const cost = pageCount * 10 // 10 coins per page
  const canAfford = userCoins !== undefined ? userCoins >= cost : true

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      canAfford
        ? "bg-green-500/10 border border-green-500/30"
        : "bg-red-500/10 border border-red-500/30"
    }`}>
      <Coins className={`h-5 w-5 ${canAfford ? "text-green-400" : "text-red-400"}`} />
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${canAfford ? "text-green-300" : "text-red-300"}`}>
          {t.generationCost}: {cost} {t.coinsLabel}
        </span>
        <span className="text-xs text-white/50">
          {pageCount} {t.pagesMultiplier}
        </span>
      </div>
      {!canAfford && userCoins !== undefined && (
        <span className="ml-auto text-xs text-red-400">
          {t.needMoreCoins} {cost - userCoins}
        </span>
      )}
    </div>
  )
}
