import { Suspense } from "react"
import { getAllPosts } from "@/lib/blog/blog"
import BlogContent from "./blog-content"

export default async function BlogPage() {
  // Pre-fetch posts on the server
  const posts = await getAllPosts()

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Learning Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Expert insights, guides, and best practices to help you create successful newsletters
          </p>
        </header>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading posts...</p>
            </div>
          }
        >
          <BlogContent initialPosts={posts} />
        </Suspense>
      </div>
    </div>
  )
}
