"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Edit, Trash, RefreshCw, LogOut, Eye, EyeOff, Calendar } from "lucide-react"
import { logout, isAuthenticated } from "@/lib/admin-auth"
import { getAllPosts, deletePost, updatePost, type BlogPost } from "@/lib/blog/blog"
import { generateBlogPost, scheduleWeeklyBlogPost } from "@/lib/blog/content-generator"

export default function AdminDashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("posts")

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated()
      if (!authenticated) {
        router.push("/admin/login")
      } else {
        fetchPosts()
      }
    }

    checkAuth()
  }, [router])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const allPosts = await getAllPosts(true)
      setPosts(allPosts)
    } catch (error) {
      setError("Failed to fetch posts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/admin/login")
  }

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const result = await deletePost(id)
        if (result.success) {
          setPosts(posts.filter((post) => post.id !== id))
        } else {
          setError(result.error || "Failed to delete post")
        }
      } catch (error) {
        setError("An error occurred while deleting the post")
      }
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const result = await updatePost(post.id, {
        published: !post.published,
      })

      if (result.success) {
        setPosts(posts.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p)))
      } else {
        setError(result.error || "Failed to update post")
      }
    } catch (error) {
      setError("An error occurred while updating the post")
    }
  }

  const handleGeneratePost = async () => {
    setIsGenerating(true)
    setError("")

    try {
      // Call the server action to generate a blog post
      const result = await generateBlogPost()

      if (result.success) {
        fetchPosts()
        alert("Blog post generated successfully! Check the Posts tab to review and publish it.")
      } else {
        setError(result.error || "Failed to generate post")
      }
    } catch (error) {
      setError("An error occurred while generating the post")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleWeekly = async () => {
    setIsScheduling(true)
    setError("")

    try {
      // Call the server action to schedule weekly blog post generation
      const result = await scheduleWeeklyBlogPost()

      if (result.success) {
        alert("Weekly blog post generation has been scheduled!")
      } else {
        setError(result.error || "Failed to schedule weekly post generation")
      }
    } catch (error) {
      setError("An error occurred while scheduling weekly post generation")
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto">
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Blog Posts</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchPosts} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4">No blog posts yet.</p>
              <Button asChild>
                <Link href="/admin/posts/new">Create Your First Post</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <GlassCard key={post.id}>
                  <GlassCardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{post.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {post.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={post.published ? "default" : "outline"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/10">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.slug}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/posts/edit/${post.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTogglePublish(post)}>
                        {post.published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="automation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <GlassCardHeader>
                <h2 className="text-xl font-semibold">Generate Blog Post</h2>
                <p className="text-muted-foreground">
                  Generate a new blog post using AI based on current newsletter trends
                </p>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                <p className="mb-4">
                  This will use AI to generate a comprehensive blog post about newsletter trends. The post will be saved
                  as a draft for you to review before publishing.
                </p>
                <Button
                  onClick={handleGeneratePost}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Blog Post
                    </>
                  )}
                </Button>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <h2 className="text-xl font-semibold">Schedule Weekly Posts</h2>
                <p className="text-muted-foreground">Automatically generate a new blog post every week</p>
              </GlassCardHeader>
              <GlassCardContent className="p-6">
                <p className="mb-4">
                  This will set up a weekly schedule to automatically generate blog posts about newsletter trends. All
                  posts will be saved as drafts for you to review before publishing.
                </p>
                <Button
                  onClick={handleScheduleWeekly}
                  disabled={isScheduling}
                  className="w-full bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90"
                >
                  {isScheduling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Weekly Posts
                    </>
                  )}
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
