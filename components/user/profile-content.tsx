"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Shield } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/hooks/use-auth"

export function ProfileContent() {
  const { t } = useLanguage()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.loading}</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.profile}</h1>
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.profile}</h1>
          <p className="text-muted-foreground">{t.manageYourStories}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t.personalInformation}
            </CardTitle>
            <CardDescription>
              {t.accountDetails}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.fullName}</p>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.memberSince}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t.status}</p>
                <p className="text-sm text-muted-foreground">
                  {user.isActive ? t.active : t.inactive}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

