import { Metadata } from "next"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { CustomTemplateSection } from "@/components/custom-template-section"
import {
  StructuredData,
  generateArticleData,
} from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Newsletter Naming Templates - Proven Formulas & Frameworks",
  description: "Discover proven newsletter naming templates and frameworks. Learn how to create catchy, memorable newsletter names using alliteration, wordplay, and professional patterns.",
  keywords: [
    "newsletter naming templates",
    "newsletter name formulas",
    "newsletter naming framework",
    "newsletter naming patterns",
    "how to name a newsletter",
    "newsletter naming guide",
    "creative newsletter names",
    "newsletter brand templates",
    "newsletter title ideas",
    "catchy newsletter titles",
    "catchy names for newsletters",
    "clever names for newsletters",
    "internal newsletter names",
    "newsletter title"
  ],
  openGraph: {
    title: "Newsletter Naming Templates - Proven Formulas & Frameworks",
    description: "Discover proven newsletter naming templates and frameworks. Learn how to create catchy, memorable newsletter names.",
    url: "https://newsletternameideas.com/templates",
    type: "article",
  },
  alternates: {
    canonical: "https://newsletternameideas.com/templates",
  },
}

export default function TemplatesPage() {
  const currentDate = new Date().toISOString()

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData
        data={generateArticleData({
          title: "Newsletter Naming Templates - Proven Formulas & Frameworks",
          description: "Discover proven newsletter naming templates and frameworks. Learn how to create catchy, memorable newsletter names using alliteration, wordplay, and professional patterns.",
          datePublished: "2025-01-01",
          dateModified: currentDate.split('T')[0],
        })}
      />

      <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Naming Templates</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Proven formulas and frameworks to help you create the perfect newsletter name
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Template Category 1 */}
            <GlassCard className="transition-all duration-300 hover:shadow-md">
              <GlassCardHeader>
                <h2 className="text-xl font-bold">Alliteration Formulas</h2>
                <p className="text-muted-foreground">Create catchy, memorable names using alliteration</p>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Adjective] + [Topic] + [Publication Type]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "Savvy Social Scoop"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Topic] + [Action] + [Frequency]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "Finance Facts Friday"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Alliterative Prefix] + [Industry Term]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "Marketing Mastery"</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Template Category 2 */}
            <GlassCard className="transition-all duration-300 hover:shadow-md">
              <GlassCardHeader>
                <h2 className="text-xl font-bold">The [Noun] Structure</h2>
                <p className="text-muted-foreground">
                  Simple, authoritative naming pattern
                </p>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">The + [Industry] + [Insider/Digest/Brief]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "The Tech Insider"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">The + [Adjective] + [Noun]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "The Daily Upside"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">The + [Metaphorical Term]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "The Hustle"</p>
                  </div>
                </div> 
              </GlassCardContent>
            </GlassCard>

            {/* Template Category 3 */}
            <GlassCard className="transition-all duration-300 hover:shadow-md">
              <GlassCardHeader>
                <h2 className="text-xl font-bold">Wordplay & Puns</h2>
                <p className="text-muted-foreground">Clever, memorable names using puns and wordplay</p>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Industry Term] + [Rhyming Word]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "Money Honey"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Word with Double Meaning]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "The Skimm" (skimming content)</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Portmanteau of Two Relevant Terms]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "Finimize" (Finance + Minimize)</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Template Category 4 */}
            <GlassCard className="transition-all duration-300 hover:shadow-md">
              <GlassCardHeader>
                <h2 className="text-xl font-bold">Emoji-enhanced Names</h2>
                <p className="text-muted-foreground">
                  Modern naming patterns that incorporate emojis for visual appeal
                </p>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Emoji] + [Short Name]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "💰 Money Matters"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Name] + [Relevant Emoji]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "Tech Today 💻"</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">[Emoji Bookends] + [Name] + [Emoji]</p>
                    <p className="text-sm text-muted-foreground mt-1">Example: "✨ Weekly Wisdom ✨"</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          <div className="mt-12 text-center">
            <CustomTemplateSection />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
