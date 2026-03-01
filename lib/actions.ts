"use server"

import { OpenAI } from "openai"
import { rateLimit } from "./rate-limit"
import {
  validateGenerateNamesInput,
  validateTopic,
  validateDomain,
  validateDomainName,
  validateHandle,
} from "./validation"
import {
  checkAbuse,
  reportValidationError,
  reportSuspiciousActivity,
} from "./security"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const API_LAYER_KEY = process.env.API_LAYER_KEY

type GenerateNamesParams = {
  topic: string
  audience?: string
  tone?: string
  keywords?: string
  additionalInfo?: string
  nameLength?: number
  useAlliteration?: boolean
  useEmojis?: boolean
}

export async function generateNames({
  topic,
  audience = "",
  tone = "",
  keywords = "",
  additionalInfo = "",
  nameLength = 3,
  useAlliteration = false,
  useEmojis = false,
}: GenerateNamesParams) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit("generateNames")
    if (!rateLimitResult.success) {
      await reportSuspiciousActivity(
        "generateNames",
        "Rate limit exceeded",
        { topic: topic.slice(0, 50) }
      )
      throw new Error(rateLimitResult.error || "Rate limit exceeded")
    }

    // Validate and sanitize inputs
    const sanitized = validateGenerateNamesInput({
      topic,
      audience,
      tone,
      keywords,
      additionalInfo,
      nameLength,
      useAlliteration,
      useEmojis,
    })

    // Additional topic validation for extra security
    const validatedTopic = validateTopic(topic)

    // Abuse detection
    const abuseCheck = await checkAbuse("generateNames", validatedTopic)
    if (!abuseCheck.allowed) {
      await reportSuspiciousActivity(
        "generateNames",
        abuseCheck.reason || "Suspicious activity detected",
        { topic: validatedTopic.slice(0, 50) }
      )
      throw new Error(abuseCheck.reason || "Request blocked due to suspicious activity")
    }

    const lengthGuidance =
      sanitized.nameLength <= 2
        ? "short and concise"
        : sanitized.nameLength >= 4
        ? "longer and more descriptive"
        : "medium length"

    const alliterationGuidance = sanitized.useAlliteration
      ? "Use alliteration in the names when possible (words starting with the same sound)."
      : ""

    const emojiGuidance = sanitized.useEmojis
      ? "Include relevant emojis in some of the names."
      : "Do not include emojis in the names."

    const prompt = `
    Generate 6 creative and engaging newsletter names for a newsletter about "${sanitized.topic}".
    ${sanitized.audience ? `The target audience is: ${sanitized.audience}.` : ""}
    ${sanitized.tone ? `The preferred tone is: ${sanitized.tone}.` : ""}
    ${sanitized.keywords ? `Try to incorporate these keywords or phrases if possible: ${sanitized.keywords}.` : ""}
    ${sanitized.additionalInfo ? `Additional information: ${sanitized.additionalInfo}` : ""}

    The names should be ${lengthGuidance}.
    ${alliterationGuidance}
    ${emojiGuidance}

    For each newsletter name, provide:
    1. A name that is catchy, memorable, and relevant
    2. A brief description explaining the name and why it works well
    3. A category that best fits the name (e.g., Clever, Professional, Playful, Technical, Inspirational, etc.)

    Format the response as a JSON array with objects containing:
    {
      "id": "unique-id",
      "name": "Newsletter Name",
      "description": "Brief description of the name",
      "category": "Category"
    }
  `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative assistant that specializes in generating newsletter names." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Get the response text
    const text = response.choices[0].message.content || ""

    // Parse the JSON response
    const cleanedText = text.replace(/```json|```/g, "").trim()
    const names = JSON.parse(cleanedText)

    // Add isFavorite property to each name
    return names.map((name: any) => ({
      ...name,
      isFavorite: false,
    }))
  } catch (error) {
    if (error instanceof Error) {
      // Log validation or security errors
      if (
        error.message.includes("validation") ||
        error.message.includes("blocked") ||
        error.message.includes("Rate limit")
      ) {
        await reportValidationError("generateNames", "topic", topic)
      }

      console.error("Error generating names:", error)
      throw error
    }
    console.error("Error generating names:", error)
    throw new Error("Failed to generate newsletter names")
  }
}

export async function fetchExamples() {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit("fetchExamples")
    if (!rateLimitResult.success) {
      await reportSuspiciousActivity(
        "fetchExamples",
        "Rate limit exceeded"
      )
      throw new Error(rateLimitResult.error || "Rate limit exceeded")
    }

    // Abuse detection
    const abuseCheck = await checkAbuse("fetchExamples")
    if (!abuseCheck.allowed) {
      await reportSuspiciousActivity(
        "fetchExamples",
        abuseCheck.reason || "Suspicious activity detected"
      )
      throw new Error(abuseCheck.reason || "Request blocked due to suspicious activity")
    }

    const prompt = `
    Provide 8 real-world examples of successful newsletters from different industries.

    For each newsletter, include:
    1. The newsletter name
    2. A brief description of what the newsletter is about
    3. A fictional but realistic URL where someone could find the newsletter
    4. A category that best describes the newsletter (e.g., Tech, Finance, Health, Marketing, etc.)

    Format the response as a JSON array with objects containing:
    {
      "id": "unique-id",
      "name": "Newsletter Name",
      "description": "Brief description of the newsletter",
      "url": "https://example.com/newsletter",
      "category": "Category"
    }
  `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable assistant that provides information about successful newsletters.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Get the response text
    const text = response.choices[0].message.content || ""

    // Parse the JSON response
    const cleanedText = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanedText)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching examples:", error)
      throw error
    }
    console.error("Error fetching examples:", error)
    throw new Error("Failed to fetch newsletter examples")
  }
}

export async function checkDomainAvailability(name: string) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit("checkDomain")
    if (!rateLimitResult.success) {
      await reportSuspiciousActivity(
        "checkDomain",
        "Rate limit exceeded",
        { domain: name.slice(0, 50) }
      )
      throw new Error(rateLimitResult.error || "Rate limit exceeded")
    }

    // Validate domain name input (use validateDomainName for partial domains)
    const sanitizedDomainName = validateDomainName(name)

    // Abuse detection
    const abuseCheck = await checkAbuse("checkDomain", sanitizedDomainName)
    if (!abuseCheck.allowed) {
      await reportSuspiciousActivity(
        "checkDomain",
        abuseCheck.reason || "Suspicious domain pattern",
        { domain: sanitizedDomainName.slice(0, 50) }
      )
      throw new Error(abuseCheck.reason || "Request blocked due to suspicious activity")
    }

    if (!API_LAYER_KEY) {
      throw new Error("API Layer key not configured")
    }

    const domainToCheck = `${sanitizedDomainName}.com`
    const encodedDomain = encodeURIComponent(domainToCheck)

    const headers = new Headers()
    headers.append("apikey", API_LAYER_KEY)

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
      headers: headers,
    }

    const response = await fetch(
      `https://api.apilayer.com/whois/check?domain=${encodedDomain}`,
      requestOptions
    )

    if (!response.ok) {
      // Handle specific API errors gracefully
      if (response.status === 500) {
        // API internal error - likely upstream WHOIS server issue
        console.warn('API Layer service unavailable (500), returning unavailable')
        return {
          domain: domainToCheck,
          available: false,
          error: { message: 'Domain check service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' }
        }
      } else if (response.status === 429) {
        throw new Error('Too many domain check requests. Please try again later.')
      } else if (response.status >= 500) {
        // Other server errors - return safely as unavailable
        return {
          domain: domainToCheck,
          available: false,
          error: { message: 'Unable to check domain availability at this time', code: 'SERVICE_ERROR' }
        }
      }

      const errorBody = await response.text()
      throw new Error(`Domain check service error: ${response.status}`)
    }

    const data = await response.json()

    // Based on API Layer's actual response structure - adjust accordingly
    const available = data.result === "available" || data.available === true

    return { domain: domainToCheck, available }
  } catch (error) {
    if (error instanceof Error) {
      // Log validation or security errors
      if (
        error.message.includes("Invalid domain") ||
        error.message.includes("blocked") ||
        error.message.includes("Rate limit")
      ) {
        await reportValidationError("checkDomain", "domain", name)
      }

      console.error("Error checking domain:", error)
      throw error
    }
    console.error("Error checking domain:", error)
    throw new Error("Failed to check domain availability")
  }
}

export async function checkTLDAvailability(name: string, tld: string) {
  try {
    // Rate limiting (shared with checkDomain)
    const rateLimitResult = await rateLimit("checkDomain")
    if (!rateLimitResult.success) {
      await reportSuspiciousActivity(
        "checkDomain",
        "Rate limit exceeded",
        { domain: name.slice(0, 50), tld }
      )
      throw new Error(rateLimitResult.error || "Rate limit exceeded")
    }

    // Validate domain name input (use validateDomainName for partial domains)
    const sanitizedDomainName = validateDomainName(name)

    // Validate TLD
    if (typeof tld !== "string" || !tld.match(/^\.[a-z]{2,}$/i)) {
      await reportSuspiciousActivity(
        "checkDomain",
        "Invalid TLD format attempted",
        { tld, domain: sanitizedDomainName.slice(0, 50) }
      )
      throw new Error("Invalid TLD format")
    }

    const fullDomain = `${sanitizedDomainName}${tld}`

    // Abuse detection
    const abuseCheck = await checkAbuse("checkDomain", fullDomain)
    if (!abuseCheck.allowed) {
      await reportSuspiciousActivity(
        "checkDomain",
        abuseCheck.reason || "Suspicious domain pattern",
        { domain: fullDomain.slice(0, 50) }
      )
      throw new Error(abuseCheck.reason || "Request blocked due to suspicious activity")
    }

    if (!API_LAYER_KEY) {
      throw new Error("API Layer key not configured")
    }

    const domainToCheck = fullDomain
    const encodedDomain = encodeURIComponent(domainToCheck)

    const headers = new Headers()
    headers.append("apikey", API_LAYER_KEY)

    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow",
      headers: headers,
    }

    const response = await fetch(
      `https://api.apilayer.com/whois/check?domain=${encodedDomain}`,
      requestOptions
    )

    if (!response.ok) {
      // Handle specific API errors gracefully
      if (response.status === 500) {
        // API internal error - likely upstream WHOIS server issue
        console.warn('API Layer service unavailable (500), returning unavailable')
        return {
          domain: domainToCheck,
          available: false,
          error: { message: 'Domain check service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' }
        }
      } else if (response.status === 429) {
        throw new Error('Too many domain check requests. Please try again later.')
      } else if (response.status >= 500) {
        // Other server errors - return safely as unavailable
        return {
          domain: domainToCheck,
          available: false,
          error: { message: 'Unable to check domain availability at this time', code: 'SERVICE_ERROR' }
        }
      }

      const errorBody = await response.text()
      throw new Error(`Domain check service error: ${response.status}`)
    }

    const data = await response.json()
    const available = data.result === "available" || data.available === true

    return { domain: domainToCheck, available }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error checking domain:", error)
      throw error
    }
    console.error("Error checking domain:", error)
    throw new Error("Failed to check domain availability")
  }
}

type SocialMediaResult = {
  platform: string
  handle: string
  available: boolean
}

export async function checkSocialMediaHandles(handle: string): Promise<SocialMediaResult[]> {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit("checkSocialMedia")
    if (!rateLimitResult.success) {
      await reportSuspiciousActivity(
        "checkSocialMedia",
        "Rate limit exceeded",
        { handle: handle.slice(0, 50) }
      )
      throw new Error(rateLimitResult.error || "Rate limit exceeded")
    }

    // Validate handle input
    const sanitizedHandle = validateHandle(handle)

    // Abuse detection
    const abuseCheck = await checkAbuse("checkSocialMedia", sanitizedHandle)
    if (!abuseCheck.allowed) {
      await reportSuspiciousActivity(
        "checkSocialMedia",
        abuseCheck.reason || "Suspicious handle pattern",
        { handle: sanitizedHandle.slice(0, 50) }
      )
      throw new Error(abuseCheck.reason || "Request blocked due to suspicious activity")
    }

    if (!process.env.SERPER_API_KEY) {
      throw new Error("Serper API key not configured")
    }

    const platforms = [
      "twitter.com",
      "instagram.com",
      "facebook.com",
      "linkedin.com",
      "tiktok.com",
      "youtube.com",
    ]

    const results = await Promise.all(
      platforms.map(async (platform) => {
        const query = `site:${platform} "@${sanitizedHandle}"`

        try {
          const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
              "X-API-KEY": process.env.SERPER_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ q: query }),
          })

          if (!response.ok) {
            console.error(`Error checking ${platform}:`, await response.text())
            return {
              platform: platform.split(".")[0],
              handle: `@${sanitizedHandle}`,
              available: true, // Assume available on error
            }
          }

          const data = await response.json()
          const taken = data.organic?.some(
            (result: any) =>
              result.title?.toLowerCase().includes(sanitizedHandle.toLowerCase()) ||
              result.link?.includes(sanitizedHandle)
          )

          return {
            platform: platform.split(".")[0],
            handle: `@${sanitizedHandle}`,
            available: !taken,
          }
        } catch (error) {
          console.error(`Error checking ${platform}:`, error)
          return {
            platform: platform.split(".")[0],
            handle: `@${sanitizedHandle}`,
            available: true,
          }
        }
      })
    )

    return results
  } catch (error) {
    if (error instanceof Error) {
      // Log validation or security errors
      if (
        error.message.includes("Invalid handle") ||
        error.message.includes("blocked") ||
        error.message.includes("Rate limit")
      ) {
        await reportValidationError("checkSocialMedia", "handle", handle)
      }

      console.error("Error checking social media:", error)
      throw error
    }
    console.error("Error checking social media:", error)
    throw new Error("Failed to check social media availability")
  }
}
