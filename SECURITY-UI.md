# Security UI Components - Usage Guide

This guide shows how to use the security blocking and warning system in your application.

## Setup

The security system is already integrated in your `app/layout.tsx`:
```tsx
<SecurityProvider>
  <SecurityWarning />
  <SecurityBlocker />
  {/* Your app content */}
</SecurityProvider>
```

## Components

### 1. **SecurityBlocker** - Full Page Block (High/Critical Severity)

Automatically displays when security state is `high` or `critical`. Blocks the entire UI.

**Features:**
- Full-screen overlay
- Cannot be dismissed
- Shows reset time countdown
- Provides retry options

### 2. **SecurityWarning** - Warning Banner (Medium Severity)

Automatically displays when security state is `medium`. Shows a dismissible banner.

**Features:**
- Top banner notification
- Can be dismissed
- Shows warning message
- Displays reset time

### 3. **GuardedComponent** - Conditional Component Blocking

Manually wrap components that should be disabled during warnings.

```tsx
import { GuardedComponent } from '@/components/security/guarded-component'

function MyComponent() {
  return (
    <GuardedComponent
      fallback={<div>Upgrade to continue</div>}
      showReason={true}
    >
      <YourProtectedContent />
    </GuardedComponent>
  )
}
```

### 4. **RateLimitBadge** - Display Remaining Quota

Show user's remaining requests:

```tsx
import { RateLimitBadge } from '@/components/security/rate-limit-badge'

<RateLimitBadge
  remaining={7}
  limit={20}
  resetTime={Date.now() + 60000}
/>
```

## Usage in Server Actions

### Method 1: Automatic via Error Handling

Server actions automatically set security state on errors:

```tsx
'use client'

import { generateNames } from '@/lib/actions'
import { useSecurity } from '@/context/SecurityContext'
import { parseSecurityError } from '@/lib/security-client'

function NewsletterGenerator() {
  const { setSecurityState } = useSecurity()

  const handleGenerate = async () => {
    try {
      const names = await generateNames({ topic: 'tech' })
      // Handle success
    } catch (error) {
      const security = parseSecurityError(error)

      if (!security.success && security.severity) {
        setSecurityState({
          severity: security.severity,
          message: security.message || 'An error occurred',
          isBlocked: security.severity === 'high' || security.severity === 'critical',
          resetTime: security.resetTime,
        })
      }
    }
  }

  return <button onClick={handleGenerate}>Generate</button>
}
```

### Method 2: Manual State Management

Or create a custom hook:

```tsx
'use client'

import { useSecurity } from '@/context/SecurityContext'
import { parseSecurityError, calculateResetTime } from '@/lib/security-client'

export function useSecurityAction() {
  const { setSecurityState } = useSecurity()

  const execute = async <T,>(
    action: () => Promise<T>,
    options?: { showToast?: boolean }
  ): Promise<T | null> => {
    try {
      return await action()
    } catch (error) {
      const security = parseSecurityError(error)

      if (security.severity) {
        setSecurityState({
          severity: security.severity,
          message: security.message || 'An error occurred',
          isBlocked: security.severity === 'high' || security.severity === 'critical',
          resetTime: security.resetTime || calculateResetTime(60),
        })
      }

      return null
    }
  }

  return { execute }
}
```

**Usage:**

```tsx
import { useSecurityAction } from '@/hooks/use-security-action'

function DomainChecker() {
  const { execute } = useSecurityAction()

  const checkDomain = async (domain: string) => {
    const result = await execute(() => checkDomainAvailability(domain))

    if (result) {
      // Handle success
    }
    // Error handling is automatic
  }

  return <button onClick={() => checkDomain('example.com')}>Check</button>
}
```

## Example: Newsletter Generator with Security

```tsx
'use client'

import { useState } from 'react'
import { useSecurity } from '@/context/SecurityContext'
import { generateNames } from '@/lib/actions'
import { parseSecurityError, calculateResetTime } from '@/lib/security-client'
import { RateLimitBadge } from '@/components/security/rate-limit-badge'
import { GuardedComponent } from '@/components/security/guarded-component'
import { Button } from '@/components/ui/button'

export function NewsletterGenerator() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [names, setNames] = useState([])
  const { setSecurityState, securityState } = useSecurity()

  const handleGenerate = async () => {
    setLoading(true)

    try {
      const result = await generateNames({ topic })
      setNames(result)
    } catch (error) {
      const security = parseSecurityError(error)

      if (security.severity) {
        setSecurityState({
          severity: security.severity,
          message: security.message || 'Failed to generate names',
          isBlocked: security.severity === 'high' || security.severity === 'critical',
          resetTime: calculateResetTime(60),
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Show rate limit badge */}
      {securityState?.resetTime && (
        <div className="mb-4">
          <RateLimitBadge
            remaining={5}
            limit={20}
            resetTime={securityState.resetTime}
          />
        </div>
      )}

      {/* Input field - disabled on warning */}
      <GuardedComponent
        fallback={
          <div className="p-4 border rounded bg-slate-50 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ⚠️ Too many attempts. Please wait before trying again.
            </p>
          </div>
        }
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your topic..."
          disabled={loading}
        />

        <Button onClick={handleGenerate} disabled={loading || !topic}>
          {loading ? 'Generating...' : 'Generate Names'}
        </Button>
      </GuardedComponent>

      {/* Results */}
      {names.length > 0 && (
        <div>
          <h3>Generated Names:</h3>
          <ul>
            {names.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

## Severity Levels

| Severity | Component | Behavior |
|----------|-----------|----------|
| **low** | None | Normal operation |
| **medium** | `SecurityWarning` | Warning banner, optional component blocking |
| **high** | `SecurityBlocker` | Full page block, must wait |
| **critical** | `SecurityBlocker` | Full page block, longer wait |

## Clearing Security State

Manually clear the security state:

```tsx
const { setSecurityState } = useSecurity()

// Clear warning/block
setSecurityState(null)

// Update to lower severity
setSecurityState({
  severity: 'low',
  message: 'Restrictions lifted',
  isBlocked: false,
})
```

## Custom Fallbacks

Provide custom fallback for guarded components:

```tsx
<GuardedComponent
  fallback={
    <div className="text-center p-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
      <Lock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
      <h3 className="font-semibold mb-2">Rate Limited</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Please wait before making more requests.
      </p>
      <Button onClick={() => setSecurityState(null)} className="mt-4">
        Dismiss
      </Button>
    </div>
  }
>
  <YourComponent />
</GuardedComponent>
```

## Best Practices

1. **Always handle errors** from server actions
2. **Show rate limit info** to users proactively
3. **Use GuardedComponent** for expensive operations
4. **Provide clear feedback** about why actions are blocked
5. **Set appropriate reset times** based on your rate limits
6. **Test all severity levels** during development

## Testing

```tsx
// Test blocker
setSecurityState({
  severity: 'high',
  message: 'Test block message',
  isBlocked: true,
  resetTime: Date.now() + 60000,
})

// Test warning
setSecurityState({
  severity: 'medium',
  message: 'Test warning message',
  isBlocked: false,
})

// Clear
setSecurityState(null)
```
