import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ExternalLink, Loader } from "lucide-react"
import { fetchExamples } from "@/lib/actions"
import Link from "next/link"

export default async function ExamplesPage() {
  const examples = await fetchExamples().catch(() => [])

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Examples</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore real-world examples of successful newsletters across different industries
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {examples.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg mb-4">No examples available at the moment.</p>
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Examples
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {examples.map((example: any) => (
                  <Card key={example.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{example.name}</h3>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {example.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{example.description}</p>
                      <Link
                        href={example.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline text-sm flex items-center"
                      >
                        Visit Newsletter
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
