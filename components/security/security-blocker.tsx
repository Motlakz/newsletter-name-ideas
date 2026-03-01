"use client"

import { AlertCircle, Lock, RefreshCw } from 'lucide-react'
import { useSecurity } from '@/context/SecurityContext'
import { Button } from '../ui/button'

export function SecurityBlocker() {
  const { securityState } = useSecurity()

  if (!securityState || (securityState.severity !== 'high' && securityState.severity !== 'critical')) {
    return null
  }

  const isCritical = securityState.severity === 'critical'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 dark:bg-black/90 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
        {/* Icon */}
        <div className={`mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center ${
          isCritical
            ? 'bg-red-100 dark:bg-red-900/20'
            : 'bg-orange-100 dark:bg-orange-900/20'
        }`}>
          {isCritical ? (
            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
          ) : (
            <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          )}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold mb-3 ${
          isCritical
            ? 'text-red-900 dark:text-red-100'
            : 'text-orange-900 dark:text-orange-100'
        }`}>
          {isCritical ? 'Access Blocked' : 'Request Limit Exceeded'}
        </h2>

        {/* Message */}
        <p className={`text-sm mb-6 ${
          isCritical
            ? 'text-red-700 dark:text-red-300'
            : 'text-orange-700 dark:text-orange-300'
        }`}>
          {securityState.message}
        </p>

        {/* Reset Time */}
        {securityState.resetTime && (
          <div className={`mb-6 p-4 rounded-lg ${
            isCritical
              ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30'
              : 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30'
          }`}>
            <p className="text-xs font-medium mb-1">
              You can retry at:
            </p>
            <p className={`text-sm font-semibold ${
              isCritical
                ? 'text-red-900 dark:text-red-100'
                : 'text-orange-900 dark:text-orange-100'
            }`}>
              {new Date(securityState.resetTime).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Time remaining: {Math.max(0, Math.ceil((securityState.resetTime - Date.now()) / 1000 / 60))} minutes
            </p>
          </div>
        )}

        {/* Info Text */}
        <div className="text-left bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            <strong>Why am I seeing this?</strong>
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Too many requests from your location</li>
            <li>• Suspicious activity detected</li>
            <li>• Invalid input patterns detected</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.location.reload()}
            className={`flex-1 ${
              isCritical
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex-1"
          >
            Go to Homepage
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          If you believe this is an error, please{' '}
          <a href="mailto:contact@newsletternameideas.com" className="underline hover:text-slate-700 dark:hover:text-slate-300">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
