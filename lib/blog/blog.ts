"use server"

import fs from "fs"
import path from "path"
import { isAuthenticated } from "../admin-auth"

// In a real app, you would use a database
// This is a simplified version using the file system
const DATA_DIR = path.join(process.cwd(), "data")
const BLOG_FILE = path.join(DATA_DIR, "blog.json")

// Initialize the data directory and blog file if they don't exist
async function initBlogStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(BLOG_FILE)) {
      fs.writeFileSync(BLOG_FILE, JSON.stringify([]))
    }
  } catch (error) {
    console.error("Error initializing blog storage:", error)
  }
}

// Initialize on module load
initBlogStorage()

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  published: boolean
}

export async function getAllPosts(includeUnpublished = false) {
  try {
    if (!fs.existsSync(BLOG_FILE)) {
      await initBlogStorage()
      return []
    }

    const data = fs.readFileSync(BLOG_FILE, "utf8")
    const posts = JSON.parse(data) as BlogPost[]

    if (!includeUnpublished) {
      return posts.filter((post) => post.published)
    }

    return posts
  } catch (error) {
    console.error("Error getting blog posts:", error)
    return []
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const posts = await getAllPosts(await isAuthenticated())
    return posts.find((post) => post.slug === slug || post.id === slug)
  } catch (error) {
    console.error("Error getting blog post:", error)
    return null
  }
}

export async function createPost(post: Omit<BlogPost, "id" | "publishedAt" | "updatedAt">) {
  try {
    if (!(await isAuthenticated())) {
      return { success: false, error: "Unauthorized" }
    }

    const posts = await getAllPosts(true)

    // Check if slug already exists
    if (posts.some((p) => p.slug === post.slug)) {
      return { success: false, error: "Slug already exists" }
    }

    const now = new Date().toISOString()
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      publishedAt: now,
      updatedAt: now,
    }

    posts.push(newPost)
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2))

    return { success: true, post: newPost }
  } catch (error) {
    console.error("Error creating blog post:", error)
    return { success: false, error: "Failed to create post" }
  }
}

export async function updatePost(id: string, updates: Partial<Omit<BlogPost, "id" | "publishedAt">>) {
  try {
    if (!(await isAuthenticated())) {
      return { success: false, error: "Unauthorized" }
    }

    const posts = await getAllPosts(true)
    const postIndex = posts.findIndex((p) => p.id === id)

    if (postIndex === -1) {
      return { success: false, error: "Post not found" }
    }

    // Check if slug is being updated and already exists
    if (updates.slug && updates.slug !== posts[postIndex].slug) {
      if (posts.some((p) => p.slug === updates.slug)) {
        return { success: false, error: "Slug already exists" }
      }
    }

    const updatedPost: BlogPost = {
      ...posts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    posts[postIndex] = updatedPost
    fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2))

    return { success: true, post: updatedPost }
  } catch (error) {
    console.error("Error updating blog post:", error)
    return { success: false, error: "Failed to update post" }
  }
}

export async function deletePost(id: string) {
  try {
    if (!(await isAuthenticated())) {
      return { success: false, error: "Unauthorized" }
    }

    const posts = await getAllPosts(true)
    const filteredPosts = posts.filter((p) => p.id !== id)

    if (filteredPosts.length === posts.length) {
      return { success: false, error: "Post not found" }
    }

    fs.writeFileSync(BLOG_FILE, JSON.stringify(filteredPosts, null, 2))

    return { success: true }
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return { success: false, error: "Failed to delete post" }
  }
}
