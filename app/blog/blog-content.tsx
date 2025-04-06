"use client"

import { useState, useEffect, JSX } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Calendar, Tag, BookOpen, FileText, Layout } from "lucide-react"
import { GrResources } from "react-icons/gr"
import { getPexelsImage } from "@/lib/pexels/pexels"

type CategoryMapping = {
  [key: string]: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverImage?: string;
  tags: string[];
}

interface BlogContentProps {
  initialPosts: BlogPost[];
}

const categoryMappings: CategoryMapping = {
  learning: "Content",
  "best-practices": "Strategy",
  templates: "Design",
}

type CategoryIcons = {
  [key: string]: JSX.Element;
}

type CategoryTitles = {
  [key: string]: string;
}

export default function BlogContent({ initialPosts }: BlogContentProps) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const initialTab = categoryParam && Object.keys(categoryMappings).includes(categoryParam) ? categoryParam : "all"
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [coverImages, setCoverImages] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (categoryParam && Object.keys(categoryMappings).includes(categoryParam)) {
      setActiveTab(categoryParam)
    } else if (!categoryParam) {
      setActiveTab("all")
    }
  }, [categoryParam])

  useEffect(() => {
    const fetchCoverImages = async () => {
      const newCoverImages: {[key: string]: string} = { ...coverImages }
      
      for (const post of posts) {
        // Skip if post already has a cover image
        if (post.coverImage) continue;
        
        // Skip if we already have a cover image for this post in our state
        if (newCoverImages[post.id]) continue;
        
        try {
          const searchQuery = [post.category, ...post.tags].join(' ')
          const pexelsData = await getPexelsImage(searchQuery, post.slug)
          newCoverImages[post.id] = pexelsData.imageUrl
        } catch (error) {
          newCoverImages[post.id] = `https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`
        }
      }
      
      setCoverImages(newCoverImages)
    }

    // Only fetch cover images for posts that don't have them
    if (posts.some(post => !post.coverImage && !coverImages[post.id])) {
      fetchCoverImages()
    }
  }, [posts, coverImages])

  const getFilteredPosts = (category: string): BlogPost[] => {
    if (category === "all") return posts

    const mappedCategory = categoryMappings[category]
    return posts.filter(post => post.category === mappedCategory)
  }

  const renderPostCard = (post: BlogPost): JSX.Element => (
    <GlassCard key={post.id} className="transition-all duration-300 hover:shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        <div className="relative h-48 md:h-full">
          <Image
            src={post.coverImage || coverImages[post.id] || '/placeholder.svg'}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="md:col-span-2">
          <GlassCardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
              <Badge variant="outline" className="w-fit mb-2 md:mb-0 bg-primary/10 text-primary border-primary/20">
                {post.category}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.publishedAt).toLocaleDateString()}
              </div>
            </div>

            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
            </Link>

            <p className="text-muted-foreground mb-4">{post.excerpt}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <div key={tag} className="flex items-center text-xs text-muted-foreground">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </div>
              ))}
            </div>

            <Button asChild variant="link" className="p-0 h-auto text-primary">
              <Link href={`/blog/${post.slug}`} className="flex items-center gap-1">
                Read More <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </GlassCardContent>
        </div>
      </div>
    </GlassCard>
  )

  const categoryIcons: CategoryIcons = {
    all: <GrResources className="h-4 w-4 mr-2" />,
    learning: <BookOpen className="h-4 w-4 mr-2" />,
    "best-practices": <FileText className="h-4 w-4 mr-2" />,
    templates: <Layout className="h-4 w-4 mr-2" />,
  }

  const categoryTitles: CategoryTitles = {
    all: "All Resources",
    learning: "Learning Center",
    "best-practices": "Best Practices",
    templates: "Templates"
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          {Object.keys(categoryTitles).map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center">
              {categoryIcons[category]}
              {categoryTitles[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(categoryTitles).map((category) => (
          <TabsContent key={category} value={category}>
            <div className="mb-4">
              {getFilteredPosts(category).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg mb-4">No posts available in this category yet.</p>
                  <Button asChild>
                    <Link href="/">Return to Home</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {getFilteredPosts(category).map((post) => renderPostCard(post))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
