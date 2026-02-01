import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - Fablito",
  description: "Privacy Policy for Fablito",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-white hover:text-white/80 hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="magic-card rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-white/80">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
              <p>
                We collect information you provide directly, such as names for story characters
                and story preferences. If you upload photos, these are used solely to customize
                story illustrations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
              <p>
                Your information is used to generate personalized stories and images.
                We do not sell or share your personal information with third parties
                for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Storage</h2>
              <p>
                Stories and images are stored securely. You can request deletion of your
                content at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Cookies</h2>
              <p>
                We use essential cookies to maintain your session and preferences.
                No tracking or advertising cookies are used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Children's Privacy</h2>
              <p>
                Our service is designed for parents to create stories for their children.
                We do not knowingly collect personal information directly from children
                under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
              <p>
                For privacy-related questions, please contact us through our GitHub repository.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
