/**
 * Input validation and sanitization utilities
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string')
  }

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Check length
  if (sanitized.length > maxLength) {
    throw new ValidationError(`Input exceeds maximum length of ${maxLength} characters`)
  }

  if (sanitized.length === 0) {
    throw new ValidationError('Input cannot be empty')
  }

  return sanitized
}

/**
 * Validate and sanitize newsletter topic/name input
 */
export function validateTopic(input: string): string {
  const sanitized = sanitizeString(input, 200)

  // Check for minimum length
  if (sanitized.length < 2) {
    throw new ValidationError('Topic must be at least 2 characters long', 'topic')
  }

  // Check for suspicious patterns (potential injection attempts)
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/i,
    /<embed/i,
    /<object/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      throw new ValidationError('Invalid characters detected in input', 'topic')
    }
  }

  return sanitized
}

/**
 * Validate domain name format (full domain with TLD)
 */
export function validateDomain(input: string): string {
  const sanitized = sanitizeString(input, 100)

  // Remove any protocol or path
  let cleanDomain = sanitized.replace(/^https?:\/\//, '').split('/')[0]

  // Remove www. prefix if present
  cleanDomain = cleanDomain.replace(/^www\./, '')

  // Validate domain format (requires at least one dot for TLD)
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

  if (!domainRegex.test(cleanDomain)) {
    throw new ValidationError('Invalid domain name format', 'domain')
  }

  return cleanDomain.toLowerCase()
}

/**
 * Validate domain name part only (without TLD)
 * Used when domain and TLD are validated separately
 */
export function validateDomainName(input: string): string {
  const sanitized = sanitizeString(input, 63)

  // Remove any protocol, path, or existing TLD
  let cleanName = sanitized
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('.')[0]
    .replace(/^www\./, '')

  // Remove any trailing dots
  cleanName = cleanName.replace(/\.+$/g, '')

  // Validate domain name format (alphanumeric, hyphens, no dots)
  const domainNameRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i

  if (!domainNameRegex.test(cleanName)) {
    throw new ValidationError('Invalid domain name format. Use only letters, numbers, and hyphens', 'domain')
  }

  // Check length constraints
  if (cleanName.length < 1) {
    throw new ValidationError('Domain name cannot be empty', 'domain')
  }

  if (cleanName.length > 63) {
    throw new ValidationError('Domain name cannot exceed 63 characters', 'domain')
  }

  return cleanName.toLowerCase()
}

/**
 * Validate social media handle
 */
export function validateHandle(input: string): string {
  const sanitized = sanitizeString(input, 50)

  // Remove @ if present
  let cleanHandle = sanitized.replace(/^@/, '')

  // Validate handle format (alphanumeric, underscores, hyphens)
  const handleRegex = /^[a-zA-Z0-9_]+$/

  if (!handleRegex.test(cleanHandle)) {
    throw new ValidationError('Invalid handle format. Use only letters, numbers, and underscores', 'handle')
  }

  if (cleanHandle.length < 3) {
    throw new ValidationError('Handle must be at least 3 characters long', 'handle')
  }

  if (cleanHandle.length > 30) {
    throw new ValidationError('Handle cannot exceed 30 characters', 'handle')
  }

  return cleanHandle.toLowerCase()
}

/**
 * Validate name length parameter
 */
export function validateNameLength(input: number): number {
  if (typeof input !== 'number') {
    throw new ValidationError('Name length must be a number', 'nameLength')
  }

  if (input < 1 || input > 5) {
    throw new ValidationError('Name length must be between 1 and 5', 'nameLength')
  }

  return Math.floor(input)
}

/**
 * Validate email address
 */
export function validateEmail(input: string): string {
  const sanitized = sanitizeString(input, 254)

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    throw new ValidationError('Invalid email address format', 'email')
  }

  return sanitized.toLowerCase()
}

/**
 * Sanitize array of keywords
 */
export function validateKeywords(input: string[]): string[] {
  if (!Array.isArray(input)) {
    throw new ValidationError('Keywords must be an array', 'keywords')
  }

  if (input.length > 10) {
    throw new ValidationError('Maximum 10 keywords allowed', 'keywords')
  }

  return input
    .filter(k => typeof k === 'string')
    .map(k => sanitizeString(k, 50))
    .filter(k => k.length > 0)
}

/**
 * Validate request size
 */
export function validateRequestSize(data: unknown, maxSizeInBytes: number = 1024 * 1024): void {
  const size = JSON.stringify(data).length

  if (size > maxSizeInBytes) {
    throw new ValidationError(`Request size exceeds maximum allowed size of ${maxSizeInBytes} bytes`)
  }
}

/**
 * Sanitize user input object
 */
export function sanitizeUserInput<T extends Record<string, unknown>>(
  input: T,
  schema: Record<keyof T, (value: unknown) => unknown>
): T {
  const result: Partial<T> = {}

  for (const [key, validator] of Object.entries(schema)) {
    if (key in input) {
      try {
        result[key as keyof T] = validator(input[key]) as T[keyof T]
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error
        }
        throw new ValidationError(`Validation failed for field: ${key}`, key)
      }
    }
  }

  return result as T
}

/**
 * Detect common attack patterns
 */
export function detectAttackPattern(input: string): boolean {
  const attackPatterns = [
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC)\b)/i,
    /[';"]\s*(OR|AND)\s*['"]/i,

    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,

    // Path traversal
    /\.\.[\/\\]/,

    // Command injection
    /[;&|`$()]/,

    // LDAP injection
    /[()=*,!]/,
  ]

  return attackPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate and sanitize all inputs for name generation
 */
export function validateGenerateNamesInput(data: {
  topic: string
  audience?: string
  tone?: string
  keywords?: string
  additionalInfo?: string
  nameLength?: number
  useAlliteration?: boolean
  useEmojis?: boolean
}): {
  topic: string
  audience?: string
  tone?: string
  keywords?: string
  additionalInfo?: string
  nameLength: number
  useAlliteration: boolean
  useEmojis: boolean
} {
  // Validate required fields
  const topic = validateTopic(data.topic)

  // Validate optional fields
  const audience = data.audience ? sanitizeString(data.audience, 200) : undefined
  const tone = data.tone ? sanitizeString(data.tone, 100) : undefined
  const keywords = data.keywords ? sanitizeString(data.keywords, 200) : undefined
  const additionalInfo = data.additionalInfo ? sanitizeString(data.additionalInfo, 500) : undefined

  // Validate parameters
  const nameLength = data.nameLength !== undefined ? validateNameLength(data.nameLength) : 3
  const useAlliteration = Boolean(data.useAlliteration)
  const useEmojis = Boolean(data.useEmojis)

  return {
    topic,
    audience,
    tone,
    keywords,
    additionalInfo,
    nameLength,
    useAlliteration,
    useEmojis,
  }
}
