"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/glass-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAuthenticated } from "@/lib/admin-auth"
import { getPostBySlug, updatePost, type BlogPost } from "@/lib/blog"
import { Save, ArrowLeft } from "lucide-react"

const categories = ["Strategy", "Design", "Growth", "Monetization", "Technology", "Content"]

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("Strategy")
  const [tags, setTags] = useState("")
  const [published, setPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated()
      if (!authenticated) {
        router.push("/admin/login")
      } else {
        fetchPost()
      }
    }

    checkAuth()
  }, [router, id])

  const fetchPost = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would fetch by ID
      // For this demo, we'll fetch all posts and find by ID
      const allPosts = await getPostBySlug(id)

      if (allPosts) {
        setPost(allPosts)
        setTitle(allPosts.title)
        setSlug(allPosts.slug)
        setContent(allPosts.content)
        setExcerpt(allPosts.excerpt)
        setCategory(allPosts.category)
        setTags(allPosts.tags.join(", "))
        setPublished(allPosts.published)
      } else {
        setError("Post not found")
      }
    } catch (error) {
      setError("Failed to fetch post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      if (!post) {
        setError("Post not found")
        return
      }

      const result = await updatePost(post.id, {
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tags.split(",").map((tag) => tag.trim()),
        published,
      })

      if (result.success) {
        router.push("/admin/dashboard")
      } else {
        setError(result.error || "Failed to update post")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <Button onClick={() => router.push("/admin/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-xl font-semibold">Post Details</h2>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="published" checked={published} onCheckedChange={setPublished} />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-xl font-semibold">Content</h2>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="min-h-[400px] font-mono"
                />
              </div>
            </GlassCardContent>
            <GlassCardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </GlassCardFooter>
          </GlassCard>
        </div>
      </form>
    </div>
  )
}
