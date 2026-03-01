"use client"

import { useSecurity } from '@/context/SecurityContext'
import { parseSecurityError, calculateResetTime, SecurityResponse } from '@/lib/security-client'
import { toast } from 'sonner'

interface UseSecurityActionOptions {
  showToast?: boolean
  resetTimeSeconds?: number
}

export function useSecurityAction(options: UseSecurityActionOptions = {}) {
  const { setSecurityState } = useSecurity()
  const { showToast = true, resetTimeSeconds = 60 } = options

  const execute = async <T,>(
    action: () => Promise<T>,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      const result = await action()
      return result
    } catch (error) {
      const security = parseSecurityError(error)

      // Set security state if severity is detected
      if (security.severity && security.severity !== 'low') {
        setSecurityState({
          severity: security.severity,
          message: security.message || 'An error occurred',
          isBlocked: security.severity === 'high' || security.severity === 'critical',
          resetTime: security.resetTime || calculateResetTime(resetTimeSeconds),
        })
      }

      // Show toast notification
      if (showToast && security.message) {
        const isError = security.severity === 'high' || security.severity === 'critical'
        toast.error(security.message, {
          duration: isError ? 10000 : 5000,
        })
      }

      // Call custom error handler
      if (onError && error instanceof Error) {
        onError(error)
      }

      return null
    }
  }

  return { execute }
}
