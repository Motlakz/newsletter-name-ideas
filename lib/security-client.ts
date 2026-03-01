/**
 * Client-side security utilities for UI components
 */

export interface SecurityResponse {
  success: boolean
  severity?: 'low' | 'medium' | 'high' | 'critical'
  message?: string
  resetTime?: number
  remaining?: number
}

/**
 * Parse error from server action and extract security information
 */
export function parseSecurityError(error: unknown): SecurityResponse {
  if (error instanceof Error) {
    const message = error.message

    // Rate limit errors
    if (message.includes('Rate limit exceeded')) {
      return {
        success: false,
        severity: 'high',
        message: 'You have exceeded the rate limit. Please wait before trying again.',
      }
    }

    // Blocked errors
    if (message.includes('blocked') || message.includes('suspicious')) {
      return {
        success: false,
        severity: 'critical',
        message: message || 'Your request was blocked due to suspicious activity.',
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('Invalid')) {
      return {
        success: false,
        severity: 'medium',
        message: message || 'Invalid input provided.',
      }
    }

    // Other errors
    return {
      success: false,
      severity: 'low',
      message: message || 'An error occurred',
    }
  }

  return {
    success: false,
    severity: 'medium',
    message: 'An unknown error occurred',
  }
}

/**
 * Calculate reset time from rate limit headers or default
 */
export function calculateResetTime(seconds?: number): number {
  return Date.now() + (seconds || 60) * 1000
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}
