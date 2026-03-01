"use client"

import { useSecurity } from '@/context/SecurityContext'
import { Lock } from 'lucide-react'

interface GuardedComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showReason?: boolean
}

export function GuardedComponent({
  children,
  fallback,
  showReason = true,
}: GuardedComponentProps) {
  const { securityState, hasWarning } = useSecurity()

  // If there's a medium severity warning, show warning state
  if (hasWarning) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
              Temporarily Restricted
            </p>
            {showReason && securityState && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {securityState.message}
              </p>
            )}
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    )
  }

  // Otherwise, render normally
  return <>{children}</>
}
