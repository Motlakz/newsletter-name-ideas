"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/glass-card"
import { isAuthenticated } from "@/lib/admin-auth"
import { createPost } from "@/lib/blog/blog"
import { Save, ArrowLeft } from "lucide-react"
import BlogPostForm from "@/components/common/blog-post-form"
import RichTextEditor from "@/components/common/rich-text-editor"

const categories = ["Strategy", "Design", "Growth", "Monetization", "Technology", "Content"]

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("Strategy")
  const [tags, setTags] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated()
      if (!authenticated) {
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // Generate slug from title
    if (title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, "-"),
      )
    }
  }, [title])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await createPost({
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tags.split(",").map((tag) => tag.trim()),
        coverImage: coverImage || undefined,
        published,
      })

      if (result.success) {
        router.push("/admin/dashboard")
      } else {
        setError(result.error || "Failed to create post")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-xl font-semibold">Post Details</h2>
            </GlassCardHeader>
            <BlogPostForm 
              title={title}
              setTitle={setTitle}
              slug={slug}
              setSlug={setSlug}
              coverImage={coverImage}
              setCoverImage={setCoverImage}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              category={category}
              setCategory={setCategory}
              tags={tags}
              setTags={setTags}
              published={published}
              setPublished={setPublished}
              categories={categories}
            />
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <h2 className="text-xl font-semibold">Content</h2>
            </GlassCardHeader>
            <GlassCardContent>
              <RichTextEditor 
                content={content} 
                onChange={setContent}
                placeholder="Write your blog post content here..."
              />
            </GlassCardContent>
            <GlassCardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Post"}
              </Button>
            </GlassCardFooter>
          </GlassCard>
        </div>
      </form>
    </div>
  )
}
