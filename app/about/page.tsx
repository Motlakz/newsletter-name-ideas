import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Users, Lightbulb, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">About Newsletter Name Ideas</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your complete toolkit for crafting the perfect newsletter identity
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
            <GlassCard className="mb-12">
                <GlassCardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    <div className="md:w-1/2">
                        <div className="relative h-full min-h-[370px] rounded-lg overflow-hidden">
                        <Image
                            src="/newsletter_tools.png"
                            alt="Newsletter Creation Tools"
                            fill
                            className="object-cover"
                        />
                        </div>
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-2xl font-bold mb-4">Crafting Newsletter Success</h2>
                        <p className="text-muted-foreground mb-4">
                        Newsletter Name Ideas combines intelligent naming suggestions with comprehensive validation tools to help you create a memorable newsletter brand. Our platform checks domain availability, analyzes SEO potential, and verifies social media handles - ensuring your newsletter name is not just creative, but practically viable across all platforms.
                        </p>
                        <p className="text-muted-foreground">
                        Beyond naming, we provide a curated collection of resources, guides, and expert insights to support your newsletter journey from conception to growth, helping you build and nurture an engaged audience.
                        </p>
                    </div>
                    </div>
                </GlassCardContent>
            </GlassCard>

          <h2 className="text-2xl font-bold mb-6 text-center">Essential Tools for Newsletter Creators</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Naming Engine</h3>
                <p className="text-muted-foreground">
                  Generate distinctive newsletter names that align with your content theme, audience interests, and brand voice using our intelligent naming algorithm.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Validation Suite</h3>
                <p className="text-muted-foreground">
                  Instantly verify domain availability, assess SEO potential, and check social media handle availability across major platforms.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Growth Resources</h3>
                <p className="text-muted-foreground">
                  Access our library of expert guides, case studies, and best practices to help launch and scale your newsletter effectively.
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>

          <div className="text-center bg-muted/30 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Create Your Newsletter Identity</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join the community of successful newsletter creators who've launched their publications with our comprehensive toolkit.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/newsletter-name-generator" className="flex items-center">
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
