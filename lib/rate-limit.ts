import { headers } from 'next/headers'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  error?: string
}

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

/**
 * Get client identifier from headers
 */
async function getClientIdentifier(): Promise<string> {
  const headersList = await headers()

  // Try to get user's IP from various headers (Vercel / proxy headers)
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const cfConnectingIp = headersList.get('cf-connecting-ip')

  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'

  // Combine IP with user agent if available for more specific tracking
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Create a hash-like identifier
  return `${ip}-${userAgent.slice(0, 50)}`
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Clean up expired records
  if (record && record.resetTime < now) {
    rateLimitStore.delete(identifier)
  }

  const currentRecord = rateLimitStore.get(identifier)

  if (!currentRecord) {
    // First request in window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.interval,
    }
  }

  if (currentRecord.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
      error: 'Rate limit exceeded. Please try again later.',
    }
  }

  // Increment count
  currentRecord.count++
  rateLimitStore.set(identifier, currentRecord)

  return {
    success: true,
    remaining: config.maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  }
}

/**
 * Rate limit middleware for server actions
 */
export async function rateLimit(
  action: string,
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitResult> {
  // Default configurations for different actions
  const defaultConfigs: Record<string, RateLimitConfig> = {
    generateNames: {
      interval: 60000, // 1 minute
      maxRequests: 10, // 10 requests per minute
    },
    checkDomain: {
      interval: 60000, // 1 minute
      maxRequests: 20, // 20 requests per minute
    },
    checkSocialMedia: {
      interval: 60000, // 1 minute
      maxRequests: 15, // 15 requests per minute
    },
    fetchExamples: {
      interval: 300000, // 5 minutes
      maxRequests: 5, // 5 requests per 5 minutes
    },
    default: {
      interval: 60000, // 1 minute
      maxRequests: 20, // 20 requests per minute
    },
  }

  const config = {
    ...defaultConfigs[action] || defaultConfigs.default,
    ...customConfig,
  }

  const clientId = await getClientIdentifier()
  const actionKey = `${action}:${clientId}`

  return checkRateLimit(actionKey, config)
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.resetTime.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }
}

/**
 * Clear rate limit for a specific identifier (admin function)
 */
export function clearRateLimit(identifier: string): void {
  const keysToDelete: string[] = []
  for (const [key] of rateLimitStore.entries()) {
    if (key.includes(identifier)) {
      keysToDelete.push(key)
    }
  }
  keysToDelete.forEach(key => rateLimitStore.delete(key))
}

/**
 * Get current rate limit stats (for monitoring)
 */
export function getRateLimitStats(): { totalEntries: number; entries: Array<{ key: string; count: number; resetTime: number }> } {
  return {
    totalEntries: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, value]) => ({
      key,
      count: value.count,
      resetTime: value.resetTime,
    })),
  }
}
