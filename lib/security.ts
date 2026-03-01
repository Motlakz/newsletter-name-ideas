import { headers } from 'next/headers'
import { detectAttackPattern } from './validation'

interface SecurityEvent {
  timestamp: number
  ip: string
  userAgent: string
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: Record<string, unknown>
}

interface AbuseScore {
  score: number
  reasons: string[]
  shouldBlock: boolean
}

// In-memory abuse tracking (consider Redis for production)
const abuseStore = new Map<string, { score: number; events: SecurityEvent[]; lastReset: number }>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000

  for (const [key, data] of abuseStore.entries()) {
    // Remove entries older than 24 hours
    if (data.lastReset < now - dayInMs) {
      abuseStore.delete(key)
    } else {
      // Remove old events
      data.events = data.events.filter(event => event.timestamp > now - dayInMs)
    }
  }
}, 3600000) // Clean up every hour

/**
 * Get client IP and user agent
 */
async function getClientInfo(): Promise<{ ip: string; userAgent: string }> {
  const headersList = await headers()

  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const cfConnectingIp = headersList.get('cf-connecting-ip')

  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  return { ip, userAgent }
}

/**
 * Log security event
 */
function logSecurityEvent(event: SecurityEvent): void {
  const clientKey = `${event.ip}-${event.action}`

  const existing = abuseStore.get(clientKey)
  if (existing) {
    existing.events.push(event)
    existing.lastReset = Date.now()
  } else {
    abuseStore.set(clientKey, {
      score: 0,
      events: [event],
      lastReset: Date.now(),
    })
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Security Event]', event)
  }

  // In production, you'd send this to a logging service
  // await sendToLoggingService(event)
}

/**
 * Calculate abuse score for a client
 */
export function calculateAbuseScore(ip: string, action: string): AbuseScore {
  const clientKey = `${ip}-${action}`
  const data = abuseStore.get(clientKey)

  if (!data) {
    return { score: 0, reasons: [], shouldBlock: false }
  }

  const now = Date.now()
  const hourInMs = 60 * 60 * 1000
  const recentEvents = data.events.filter(e => e.timestamp > now - hourInMs)

  let score = 0
  const reasons: string[] = []

  // High rate of requests
  if (recentEvents.length > 100) {
    score += 50
    reasons.push('High request rate detected')
  } else if (recentEvents.length > 50) {
    score += 25
    reasons.push('Elevated request rate')
  }

  // Failed attempts (errors, validation failures)
  const failedAttempts = recentEvents.filter(e => e.severity === 'high').length
  if (failedAttempts > 10) {
    score += 40
    reasons.push('Multiple failed attempts detected')
  } else if (failedAttempts > 5) {
    score += 20
    reasons.push('Some failed attempts detected')
  }

  // Critical events
  const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length
  if (criticalEvents > 0) {
    score += 100
    reasons.push('Critical security events detected')
  }

  // Pattern detection
  const mediumEvents = recentEvents.filter(e => e.severity === 'medium').length
  if (mediumEvents > 20) {
    score += 30
    reasons.push('Suspicious activity pattern detected')
  }

  // Update score
  data.score = score

  // Should block if score is high
  const shouldBlock = score >= 100

  return { score, reasons, shouldBlock }
}

/**
 * Check if request should be blocked
 */
export async function checkAbuse(action: string, input?: string): Promise<{ allowed: boolean; reason?: string }> {
  const { ip, userAgent } = await getClientInfo()

  // Check if client is blocked
  const abuseScore = calculateAbuseScore(ip, action)

  if (abuseScore.shouldBlock) {
    logSecurityEvent({
      timestamp: Date.now(),
      ip,
      userAgent,
      action,
      severity: 'high',
      details: {
        blocked: true,
        reasons: abuseScore.reasons,
        score: abuseScore.score,
      },
    })

    return {
      allowed: false,
      reason: `Request blocked: ${abuseScore.reasons.join(', ')}`,
    }
  }

  // Check input for attack patterns
  if (input && detectAttackPattern(input)) {
    logSecurityEvent({
      timestamp: Date.now(),
      ip,
      userAgent,
      action,
      severity: 'critical',
      details: {
        reason: 'Attack pattern detected in input',
        inputPreview: input.slice(0, 100),
      },
    })

    return {
      allowed: false,
      reason: 'Invalid input detected',
    }
  }

  // Log successful request
  logSecurityEvent({
    timestamp: Date.now(),
    ip,
    userAgent,
    action,
    severity: 'low',
    details: { allowed: true },
  })

  return { allowed: true }
}

/**
 * Report failed validation
 */
export async function reportValidationError(action: string, field: string, value: string): Promise<void> {
  const { ip, userAgent } = await getClientInfo()

  logSecurityEvent({
    timestamp: Date.now(),
    ip,
    userAgent,
    action,
    severity: 'medium',
    details: {
      type: 'validation_error',
      field,
      valuePreview: value.slice(0, 100),
    },
  })
}

/**
 * Report suspicious activity
 */
export async function reportSuspiciousActivity(action: string, reason: string, details: Record<string, unknown> = {}): Promise<void> {
  const { ip, userAgent } = await getClientInfo()

  logSecurityEvent({
    timestamp: Date.now(),
    ip,
    userAgent,
    action,
    severity: 'high',
    details: {
      reason,
      ...details,
    },
  })
}

/**
 * Get security statistics
 */
export function getSecurityStats(): {
  totalEvents: number
  uniqueIPs: number
  blockedAttempts: number
  byAction: Record<string, number>
} {
  const allEvents: SecurityEvent[] = []
  const uniqueIPs = new Set<string>()
  let blockedAttempts = 0
  const byAction: Record<string, number> = {}

  for (const data of abuseStore.values()) {
    allEvents.push(...data.events)
  }

  for (const event of allEvents) {
    uniqueIPs.add(event.ip)
    byAction[event.action] = (byAction[event.action] || 0) + 1

    if (event.severity === 'high' || event.severity === 'critical') {
      blockedAttempts++
    }
  }

  return {
    totalEvents: allEvents.length,
    uniqueIPs: uniqueIPs.size,
    blockedAttempts,
    byAction,
  }
}

/**
 * Clear security events for a specific IP (admin function)
 */
export function clearSecurityEvents(ip: string): void {
  const keysToDelete: string[] = []

  for (const [key] of abuseStore.entries()) {
    if (key.startsWith(ip)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach(key => abuseStore.delete(key))
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  }
}
