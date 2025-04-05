"use server"

import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const API_LAYER_KEY = process.env.API_LAYER_KEY;

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
    const lengthGuidance =
      nameLength <= 2 ? "short and concise" : nameLength >= 4 ? "longer and more descriptive" : "medium length"

    const alliterationGuidance = useAlliteration
      ? "Use alliteration in the names when possible (words starting with the same sound)."
      : ""

    const emojiGuidance = useEmojis
      ? "Include relevant emojis in some of the names."
      : "Do not include emojis in the names."

    const prompt = `
    Generate 6 creative and engaging newsletter names for a newsletter about "${topic}".
    ${audience ? `The target audience is: ${audience}.` : ""}
    ${tone ? `The preferred tone is: ${tone}.` : ""}
    ${keywords ? `Try to incorporate these keywords or phrases if possible: ${keywords}.` : ""}
    ${additionalInfo ? `Additional information: ${additionalInfo}` : ""}
    
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
    console.error("Error generating names:", error)
    throw new Error("Failed to generate newsletter names")
  }
}

export async function fetchExamples() {
  try {
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
    console.error("Error fetching examples:", error)
    throw new Error("Failed to fetch newsletter examples")
  }
}

export async function checkDomainAvailability(name: string) {
  try {
    if (!API_LAYER_KEY) throw new Error("API Layer key not configured");

    const domainToCheck = `${name.replace(/\.com$/, "")}.com`;
    const encodedDomain = encodeURIComponent(domainToCheck);

    const headers = new Headers();
    headers.append("apikey", API_LAYER_KEY);

    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow',
      headers: headers
    };

    const response = await fetch(
      `https://api.apilayer.com/whois/check?domain=${encodedDomain}`,
      requestOptions
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    
    // Based on API Layer's actual response structure - adjust accordingly
    const available = data.result === 'available' || data.available === true;

    return { domain: domainToCheck, available };
  } catch (error) {
    console.error("Error checking domain:", error);
    throw new Error("Failed to check domain availability");
  }
}

export async function checkTLDAvailability(name: string, tld: string) {
  try {
    if (!API_LAYER_KEY) throw new Error("API Layer key not configured");
    
    const domainToCheck = `${name}${tld}`;
    const encodedDomain = encodeURIComponent(domainToCheck);

    const headers = new Headers();
    headers.append("apikey", API_LAYER_KEY);

    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow',
      headers: headers
    };

    const response = await fetch(
      `https://api.apilayer.com/whois/check?domain=${encodedDomain}`,
      requestOptions
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const available = data.result === 'available' || data.available === true;

    return { domain: domainToCheck, available };
  } catch (error) {
    console.error("Error checking domain:", error);
    throw new Error("Failed to check domain availability");
  }
}

type SocialMediaResult = {
  platform: string
  handle: string
  available: boolean
}

export async function checkSocialMediaHandles(handle: string): Promise<SocialMediaResult[]> {
  try {
    if (!process.env.SERPER_API_KEY) {
      throw new Error("Serper API key not configured");
    }

    const platforms = [
      'twitter.com',
      'instagram.com',
      'facebook.com',
      'linkedin.com',
      'tiktok.com',
      'youtube.com'
    ];

    const results = await Promise.all(
      platforms.map(async (platform) => {
        const query = `site:${platform} "@${handle}"`;
        
        try {
          const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': process.env.SERPER_API_KEY!,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query })
          });

          if (!response.ok) {
            console.error(`Error checking ${platform}:`, await response.text());
            return {
              platform: platform.split('.')[0],
              handle: `@${handle}`,
              available: true // Assume available on error
            };
          }

          const data = await response.json();
          const taken = data.organic?.some((result: any) => 
            result.title?.toLowerCase().includes(handle.toLowerCase()) ||
            result.link?.includes(handle)
          );

          return {
            platform: platform.split('.')[0],
            handle: `@${handle}`,
            available: !taken
          };
        } catch (error) {
          console.error(`Error checking ${platform}:`, error);
          return {
            platform: platform.split('.')[0],
            handle: `@${handle}`,
            available: true
          };
        }
      })
    );

    return results;
  } catch (error) {
    console.error("Error checking social media:", error);
    throw new Error("Failed to check social media availability");
  }
}
