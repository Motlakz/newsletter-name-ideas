"use server"

import { OpenAI } from "openai"
import { createPost } from "./blog"
import { isAuthenticated } from "./admin-auth"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Function to fetch news about newsletters and email marketing
async function fetchNewsletterNews() {
    try {
        // In a real app, you would use a proper news API
        // This is a simplified version that simulates fetching news
        const topics = [
            "newsletter trends",
            "email marketing best practices",
            "newsletter design",
            "newsletter monetization",
            "audience growth strategies",
            "newsletter platforms",
            "content strategy for newsletters",
            "newsletter analytics",
        ]

        // Randomly select a topic
        const topic = topics[Math.floor(Math.random() * topics.length)]

        return {
            topic,
            query: `Latest trends and insights about ${topic}`,
        }
    } catch (error) {
        console.error("Error fetching newsletter news:", error)
        throw new Error("Failed to fetch newsletter news")
    }
}

// Server action to generate a blog post using OpenAI
export async function generateBlogPost() {
    try {
        if (!(await isAuthenticated())) {
            return { success: false, error: "Unauthorized" }
        }

        // Fetch news about newsletters
        const { topic } = await fetchNewsletterNews()

        // Generate a blog post using OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                    "You are a newsletter expert who writes informative and engaging blog posts about newsletter creation, marketing, and growth strategies.",
                },
                {
                    role: "user",
                    content: `Write a comprehensive blog post about "${topic}".
                    Include the following sections:
                        1. Introduction
                        2. Current trends
                        3. Best practices
                        4. Case studies or examples
                        5. Actionable tips
                        6. Conclusion
                    
                    Format the content with Markdown. Make it informative, engaging, and around 1000-1500 words.
                    
                    Also provide:
                        - A catchy title (not preceded by # or ##, just provide the plain title)
                        - A brief excerpt (2-3 sentences)
                        - Up to 5 relevant tags (as a comma-separated list without hashtags, e.g., "email marketing, design, trends")
                        - A suggested category (one of: Strategy, Design, Growth, Monetization, Technology, Content)
                        
                    Format your response like this:
                    TITLE: Your title here
                    EXCERPT: Your excerpt here
                    TAGS: tag1, tag2, tag3, tag4, tag5
                    CATEGORY: Category
                        
                    CONTENT:
                    <The full blog post content in Markdown format, starting directly with the introduction, NOT including a title header>`,
                },
            ],
            temperature: 0.7,
            max_tokens: 3000,
        })

        // Extract the generated content
        const fullContent = response.choices[0].message.content || ""

        // Parse the formatted response
        const titleMatch = fullContent.match(/TITLE:\s*(.+)/i)
        const excerptMatch = fullContent.match(/EXCERPT:\s*(.+(?:\n.+)*)/i)
        const tagsMatch = fullContent.match(/TAGS:\s*(.+)/i)
        const categoryMatch = fullContent.match(/CATEGORY:\s*(.+)/i)
        const contentMatch = fullContent.match(/CONTENT:\s*(.+(?:\n.+)*)/is)

        // Extract the parts
        const title = titleMatch ? titleMatch[1].trim() : `Latest Insights on ${topic}`
        const excerpt = excerptMatch ? excerptMatch[1].trim() : ""
        const tagString = tagsMatch ? tagsMatch[1].trim() : `newsletter, email marketing, ${topic}`
        const category = categoryMatch ? categoryMatch[1].trim() : "Strategy"
        let content = contentMatch ? contentMatch[1].trim() : fullContent

        // Clean the content to ensure it starts properly
        content = content.replace(/^#+\s*.*?$/m, "").trim()

        // Generate a slug from the title
        const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

        // Parse tags
        const tags = tagString.split(",").map((tag) => tag.trim())

        // Create a new blog post
        const result = await createPost({
            title,
            slug,
            content,
            excerpt: excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt,
            category,
            tags,
            published: false, // Set to false so admin can review before publishing
        })

        return result
    } catch (error) {

        console.error("Error generating blog post:", error)
        return { success: false, error: "Failed to generate blog post" }
    }
}

// Server action to schedule weekly blog post generation
export async function scheduleWeeklyBlogPost() {
    try {
        if (!(await isAuthenticated())) {
        return { success: false, error: "Unauthorized" }
        }

        // This is a placeholder for demonstration purposes
        // In a real app, you would implement a proper scheduling mechanism
        console.log("Scheduled weekly blog post generation")
        return { success: true, message: "Weekly blog post generation scheduled" }
    } catch (error) {
        console.error("Error scheduling weekly blog post generation:", error)
        return { success: false, error: "Failed to schedule weekly blog post generation" }
    }
}
