"use client"

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface RateLimitBadgeProps {
  remaining?: number
  limit?: number
  resetTime?: number
}

export function RateLimitBadge({ remaining = 20, limit = 20, resetTime }: RateLimitBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    if (!resetTime) return

    const updateTimer = () => {
      const now = Date.now()
      const diff = resetTime - now

      if (diff <= 0) {
        setTimeRemaining('00:00')
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [resetTime])

  const percentage = (remaining / limit) * 100
  const isLow = remaining <= 5
  const isMedium = remaining <= 10

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isLow
        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/30'
        : isMedium
        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30'
        : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30'
    }`}>
      <Clock className="h-3.5 w-3.5" />
      <span>
        {remaining}/{limit} requests left
      </span>
      {timeRemaining && (
        <span className="opacity-75">
          ({timeRemaining})
        </span>
      )}
      {isLow && <AlertTriangle className="h-3.5 w-3.5" />}
    </div>
  )
}
