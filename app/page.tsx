
import Link from "next/link"
import { ArrowRight, Sparkles, Globe, BarChart, BookOpen } from "lucide-react"
import { HeroSection } from "../components/hero-section"
import MockUp from "../components/mockup"
import { GlassCard, GlassCardContent } from "../components/ui/glass-card"
import { Button } from "../components/ui/button"
import PricingComponent from "../components/common/pricing"

export default function Home() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI-Powered Generation",
      description: "Create unique newsletter names tailored to your audience, tone, and content.",
      link: "/newsletter-name-generator",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Domain Checker",
      description: "Verify domain availability for your newsletter name instantly.",
      link: "/tools",
    },
    {
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Trend Analysis",
      description: "Discover what's working in the newsletter space with data-driven insights.",
      link: "/analytics",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "Learning Resources",
      description: "Access guides and templates to launch your newsletter successfully.",
      link: "/blog",
    },
  ]

  return (
    <>
      <HeroSection />
      <MockUp />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need for Newsletter Success</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive toolkit helps you create, launch, and grow your newsletter with professional tools and
              resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassCard key={index} className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <GlassCardContent>
                  <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button asChild variant="link" className="p-0 h-auto text-primary">
                    <Link href={feature.link} className="flex items-center gap-1">
                      Explore <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <PricingComponent />

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Name Your Newsletter?</h2>
            <p className="text-muted-foreground mb-8">
              Create a memorable, engaging newsletter name that resonates with your audience and reflects your content.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/newsletter-name-generator">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

