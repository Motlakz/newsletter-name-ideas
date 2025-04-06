import { notFound } from "next/navigation"
import { getPostBySlug } from "@/lib/blog/blog"
import { getPexelsImage } from "@/lib/pexels/pexels"
import { Metadata } from "next"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Tag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"

const ReactMarkdown = dynamic(() => import("react-markdown"))

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"

// ✅ Correct param typing for generateMetadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    }
  }

  return {
    title: `${post.title} | Newsletter Learning Center`,
    description: post.excerpt,
  }
}

// ✅ Correct param typing for the route handler
export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)

  if (!post) notFound()

  let coverImage = post.coverImage || FALLBACK_IMAGE
  let photographer = ""
  let photographerUrl = ""
  let imageAlt = post.title || "Blog post image"

  if (!post.coverImage) {
    try {
      const searchQuery = [post.category, ...post.tags.slice(0, 2)].join(" ")
      const pexelsData = await getPexelsImage(searchQuery, params.slug)
      coverImage = pexelsData.imageUrl
      photographer = pexelsData.photographer
      photographerUrl = pexelsData.photographerUrl
      imageAlt = pexelsData.alt || imageAlt
    } catch (err) {
      console.error("Pexels image error:", err)
    }
  }

  let cleanedContent = post.content

  const titlePattern = new RegExp(`^# ${post.title}`, "i")
  if (titlePattern.test(cleanedContent)) {
    cleanedContent = cleanedContent.replace(titlePattern, "")
  }

  cleanedContent = cleanedContent
    .replace(/^(Tags|Category|Excerpt):.*?\n+/gim, "")
    .replace(/\n\n+/g, "\n\n")

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {post.category}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <div key={tag} className="flex items-center text-sm text-muted-foreground">
                <Tag className="h-4 w-4 mr-1" />
                {tag}
              </div>
            ))}
          </div>

          <p className="text-muted-foreground mb-4">{post.excerpt}</p>

          <GlassCard>
            <div className="w-full h-[300px] relative rounded-t-lg overflow-hidden mb-8">
              <Image
                src={coverImage}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              {photographer && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Photo by{" "}
                  <Link href={photographerUrl} className="underline" target="_blank">
                    {photographer}
                  </Link>
                </div>
              )}
            </div>

            <GlassCardContent className="p-8 prose dark:prose-invert max-w-none">
              <ReactMarkdown>{cleanedContent}</ReactMarkdown>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
