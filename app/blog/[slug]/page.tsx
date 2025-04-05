import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Tag, ArrowLeft } from "lucide-react"
import { getPostBySlug } from "@/lib/blog"
import type { Metadata } from "next"
import dynamic from "next/dynamic"

// Dynamically import ReactMarkdown to avoid SSR issues
const ReactMarkdown = dynamic(() => import("react-markdown"))

interface BlogPostPageProps {
    params: {
        slug: string
    }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await getPostBySlug(params.slug)

    if (!post) {
        notFound()
    }

    // Clean the content to ensure proper formatting
    let cleanedContent = post.content

    // If the content begins with the post title, remove it
    const titlePattern = new RegExp(`^# ${post.title}`, "i")
    if (titlePattern.test(cleanedContent)) {
        cleanedContent = cleanedContent.replace(titlePattern, "")
    }

    // Remove any metadata blocks at the beginning
    cleanedContent = cleanedContent.replace(/^(Tags|Category|Excerpt):.*?\n+/gim, "")

    // Ensure proper paragraph spacing
    cleanedContent = cleanedContent.replace(/\n\n+/g, "\n\n")

    // Generate a default cover image if none is provided
    const coverImage =
        post.coverImage ||
        `https://source.unsplash.com/random/1200x630/?${encodeURIComponent(post.category.toLowerCase())}+newsletter`

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
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
                    </div>

                    <GlassCard>
                        {/* Cover Image */}
                        <div className="w-full h-[300px] relative rounded-t-lg overflow-hidden">
                            <Image src={coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
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
