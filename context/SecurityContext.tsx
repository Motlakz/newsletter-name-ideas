"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityState {
  severity: SecuritySeverity
  message: string
  isBlocked: boolean
  resetTime?: number
}

interface SecurityContextType {
  securityState: SecurityState | null
  setSecurityState: (state: SecurityState | null) => void
  isBlocked: boolean
  hasWarning: boolean
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [securityState, setSecurityState] = useState<SecurityState | null>(null)

  const isBlocked = securityState?.severity === 'high' || securityState?.severity === 'critical'
  const hasWarning = securityState?.severity === 'medium'

  return (
    <SecurityContext.Provider
      value={{
        securityState,
        setSecurityState,
        isBlocked,
        hasWarning,
      }}
    >
      {children}
    </SecurityContext.Provider>
  )
}

export function useSecurity() {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}
