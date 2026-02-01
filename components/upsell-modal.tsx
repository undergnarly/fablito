"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"
import { Coins, UserPlus, Share2, Gift, Sparkles, Copy, Check } from "lucide-react"

interface UpsellModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requiredCoins: number
  userCoins: number
}

export function UpsellModal({ open, onOpenChange, requiredCoins, userCoins }: UpsellModalProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [copiedLink, setCopiedLink] = useState(false)

  const deficit = requiredCoins - userCoins

  const handleRegister = () => {
    onOpenChange(false)
    router.push("/auth/register")
  }

  const handleSubscribe = () => {
    onOpenChange(false)
    router.push("/subscription")
  }

  const copyReferralLink = () => {
    if (user?.referralCode) {
      const referralLink = `${window.location.origin}/auth/register?ref=${user.referralCode}`
      navigator.clipboard.writeText(referralLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coins className="h-6 w-6 text-yellow-500" />
            {t.notEnoughCoinsTitle || "Not Enough Coins"}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {t.notEnoughCoinsDesc || `You need ${requiredCoins} coins but only have ${userCoins}. Here's how to get more:`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current balance info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">{t.youHave}</span>
            <span className="font-bold text-yellow-600">{userCoins} {t.coinsLabel}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
            <span className="text-sm text-red-600 dark:text-red-400">{t.needed}</span>
            <span className="font-bold text-red-600 dark:text-red-400">{requiredCoins} {t.coinsLabel}</span>
          </div>

          <div className="border-t pt-4 space-y-3">
            {/* Option 1: Register */}
            {user?.isAnonymous && (
              <Button
                onClick={handleRegister}
                className="w-full h-auto py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <div className="flex items-center gap-3 w-full">
                  <UserPlus className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">{t.registerForBonus || "Register for free"}</div>
                    <div className="text-xs opacity-90">{t.getRegistrationBonus || "Get +50 bonus coins"}</div>
                  </div>
                  <Gift className="h-5 w-5 text-yellow-300" />
                </div>
              </Button>
            )}

            {/* Option 2: Subscribe */}
            <Button
              onClick={handleSubscribe}
              variant="outline"
              className="w-full h-auto py-4 border-2"
            >
              <div className="flex items-center gap-3 w-full">
                <Sparkles className="h-5 w-5 flex-shrink-0 text-purple-500" />
                <div className="text-left flex-1">
                  <div className="font-semibold">{t.getSubscription || "Get a subscription"}</div>
                  <div className="text-xs text-muted-foreground">{t.unlimitedStories || "Create unlimited stories"}</div>
                </div>
              </div>
            </Button>

            {/* Option 3: Referral (only for registered users) */}
            {!user?.isAnonymous && user?.referralCode && (
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">{t.inviteFriends || "Invite friends"}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.referralDescription || "Get 100 coins for each friend who registers with your link!"}
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${user.referralCode}`}
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralLink}
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
