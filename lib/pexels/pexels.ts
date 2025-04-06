"use server"

export async function getPexelsImage(query: string, slug: string) {
    const apiKey = process.env.PEXELS_API_KEY
    if (!apiKey) {
        throw new Error('Pexels API key not configured')
    }

    try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`
        const response = await fetch(url, {
            headers: {
                Authorization: apiKey
            },
            next: { 
                revalidate: 3600, // Cache for 1 hour
                tags: [`pexels-${slug}`]
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch images')
        }

        const data = await response.json()
        if (data.photos.length === 0) {
            throw new Error('No images found')
        }

        // Select a random photo from the first 15 results
        const index = generateStableIndex(slug, data.photos.length)
        const photo = data.photos[index]

        return {
            imageUrl: photo.src.landscape || photo.src.large,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            alt: photo.alt || `Image related to ${query}`
        }
    } catch (error) {
        console.error('Pexels API error:', error)
        // Fallback to generic Pexels search
        return {
            imageUrl: `https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`,
            photographer: 'Pexels',
            photographerUrl: 'https://pexels.com',
            alt: 'Fallback image'
        }
    }
}

function generateStableIndex(slug: string, maxLength: number): number {
 // Simple hash function to convert slug to numeric hash
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = (hash << 5) - hash + slug.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % maxLength;
}
