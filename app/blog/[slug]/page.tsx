import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Tag, ArrowLeft } from "lucide-react"
import { getPostBySlug } from "@/lib/blog/blog"
import { getPexelsImage } from "@/lib/pexels/pexels"
import MarkdownContent from "@/components/common/markdown"

// Default fallback image that's guaranteed to exist
const FALLBACK_IMAGE = "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export async function generateMetadata({ params }: any) {
    const { slug } = await params
    const post = await getPostBySlug(slug)
    
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

export default async function BlogPostPage({ params }: any) {
    const { slug } = await params
    const post = await getPostBySlug(slug)
    if (!post) notFound()

    // fallback values
    let coverImage: string = post.coverImage || FALLBACK_IMAGE;
    let photographer = '';
    let photographerUrl = '';
    let imageAlt = post.title || 'Blog post image';

    // Only fetch a new image if the post doesn't have a cover image
    if (!post.coverImage) {
        try {
            // Create a more targeted search query combining category and tags
            const searchQuery = [post.category, ...post.tags.slice(0, 2)].filter(Boolean).join(' ');
            
            const pexelsData = await getPexelsImage(searchQuery, params.slug);
            
            coverImage = pexelsData.imageUrl;
            photographer = pexelsData.photographer;
            photographerUrl = pexelsData.photographerUrl;
            imageAlt = pexelsData.alt || imageAlt;
        } catch (error) {
            console.error('Failed to get Pexels image:', error);
            // Fallback already set in initialization
        }
    }

    // Clean the content to ensure proper formatting
    let cleanedContent = post.content;

    // If the content begins with the post title, remove it
    const titlePattern = new RegExp(`^# ${post.title}`, "i");
    if (titlePattern.test(cleanedContent)) {
        cleanedContent = cleanedContent.replace(titlePattern, "");
    }

    // Remove any metadata blocks at the beginning
    cleanedContent = cleanedContent.replace(/^(Tags|Category|Excerpt):.*?\n+/gim, "");

    // Ensure proper paragraph spacing
    cleanedContent = cleanedContent.replace(/\n\n+/g, "\n\n");

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header content - same as before */}
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
                                    Photo by <Link href={photographerUrl} className="underline" target="_blank" rel="noopener noreferrer">
                                        {photographer}
                                    </Link>
                                </div>
                            )}
                        </div>
                        <GlassCardContent className="p-8 prose dark:prose-invert max-w-none">
                            <MarkdownContent content={cleanedContent} />
                        </GlassCardContent>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
