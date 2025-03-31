import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { FileText, Video, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Learning Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tips, guides, and best practices to help you create a successful newsletter
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Naming Your Newsletter: Best Practices</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">The Psychology of Newsletter Names</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Learn how different naming patterns affect subscriber perception and engagement rates.
                </p>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read Article
                </Button>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Video: Naming Workshop</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Watch our 15-minute workshop on creating memorable newsletter names that stand out.
                </p>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Video
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Downloadable Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <h3 className="text-lg font-bold mb-3">Newsletter Launch Checklist</h3>
                <p className="text-muted-foreground mb-4">
                  A comprehensive checklist to ensure your newsletter launch is successful.
                </p>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <h3 className="text-lg font-bold mb-3">Newsletter Name Brainstorming Template</h3>
                <p className="text-muted-foreground mb-4">
                  A structured template to help you brainstorm and evaluate potential newsletter names.
                </p>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <GlassCardContent className="p-6">
                <h3 className="text-lg font-bold mb-3">Newsletter Metrics Guide</h3>
                <p className="text-muted-foreground mb-4">
                  Learn how to track and improve key performance metrics for your newsletter.
                </p>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10">
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>

          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6 mb-12">
            <GlassCard>
              <GlassCardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How important is my newsletter name?</h3>
                <p className="text-muted-foreground">
                  Your newsletter name is crucial as it's often the first impression subscribers have. A good name
                  should be memorable, reflect your content, and appeal to your target audience. Studies show
                  newsletters with clear, concise names tend to have higher open rates.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Should I include keywords in my newsletter name?</h3>
                <p className="text-muted-foreground">
                  Including relevant keywords can help with discoverability, especially if people are searching for
                  newsletters on your topic. However, prioritize creating a memorable, engaging name over keyword
                  stuffing. Balance is key.
                </p>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">How do I know if my newsletter name is already taken?</h3>
                <p className="text-muted-foreground">
                  Use our domain checker tool to see if the corresponding domain is available. Also search on major
                  newsletter platforms and social media to ensure your chosen name is unique. This helps avoid confusion
                  and potential trademark issues.
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>

          <div className="text-center">
            <Link href="/newsletter-name-generator">
              <Button className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all">
                Generate Your Newsletter Name
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

