"use client"

import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSecurity } from '@/context/SecurityContext'

export function SecurityWarning() {
  const { securityState, setSecurityState } = useSecurity()

  if (!securityState || securityState.severity !== 'medium') {
    return null
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/50 px-4 py-3">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Security Warning
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {securityState.message}
            </p>
            {securityState.resetTime && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Restrictions will be lifted at{' '}
                {new Date(securityState.resetTime).toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSecurityState(null)}
            className="flex-shrink-0 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
