import { Suspense } from "react"
import NewsletterGenerator from "@/components/newsletter-name-generator"
import { Loader } from "lucide-react"

export default function GeneratorPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Name Generator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create the perfect name for your newsletter with our AI-powered generator
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <NewsletterGenerator />
        </Suspense>
      </div>
    </div>
  )
}

