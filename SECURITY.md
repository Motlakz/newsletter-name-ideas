# API Security Documentation

This document outlines the security measures implemented to protect the Newsletter Name Ideas API and server actions.

## Overview

The API security implementation includes:
- ✅ Rate limiting
- ✅ Input validation and sanitization
- ✅ Abuse detection and prevention
- ✅ Security headers and CORS protection
- ✅ Attack pattern detection
- ✅ Comprehensive logging and monitoring

## Architecture

### Security Layers

1. **Middleware Layer** (`middleware.ts`)
   - Security headers
   - CORS configuration
   - CSP policies

2. **Rate Limiting** (`lib/rate-limit.ts`)
   - In-memory rate limiter
   - Per-action limits
   - IP-based tracking

3. **Input Validation** (`lib/validation.ts`)
   - Type checking
   - Sanitization
   - Attack pattern detection

4. **Abuse Detection** (`lib/security.ts`)
   - Behavioral analysis
   - Scoring system
   - Automatic blocking

5. **Protected Actions** (`lib/actions.ts`)
   - All server actions protected
   - Error handling
   - Security logging

## Rate Limiting

### Configuration

Rate limits are configured per action type:

| Action | Limit | Window | Description |
|--------|-------|--------|-------------|
| `generateNames` | 10 requests | 1 minute | AI name generation |
| `checkDomain` | 20 requests | 1 minute | Domain availability checks |
| `checkSocialMedia` | 15 requests | 1 minute | Social media handle verification |
| `fetchExamples` | 5 requests | 5 minutes | Newsletter examples |

### Response Headers

Rate limit information is returned in response headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)

### Implementation

```typescript
import { rateLimit } from '@/lib/rate-limit'

const result = await rateLimit('generateNames')
if (!result.success) {
  throw new Error(result.error)
}
```

## Input Validation

### Validation Rules

All user inputs are validated and sanitized:

#### Topic Validation
- Minimum 2 characters
- Maximum 200 characters
- No HTML/script tags
- No SQL injection patterns
- No XSS attack vectors

#### Domain Validation
- Standard domain format
- TLD validation
- Maximum 100 characters
- Lowercase output

#### Handle Validation
- Alphanumeric, underscores, hyphens only
- 3-30 characters
- Lowercase output

#### Name Length Parameter
- Integer between 1-5

### Attack Detection

The system detects and blocks:
- SQL injection attempts
- XSS attacks
- Path traversal
- Command injection
- LDAP injection

### Usage Example

```typescript
import { validateTopic, validateDomain, validateHandle } from '@/lib/validation'

const sanitizedTopic = validateTopic(userInput)
const sanitizedDomain = validateDomain(userDomain)
const sanitizedHandle = validateHandle(userHandle)
```

## Abuse Detection

### Scoring System

Abuse scores are calculated per IP and action:

| Score | Action |
|-------|--------|
| 0-24 | Normal - No action |
| 25-49 | Elevated - Log warning |
| 50-99 | Suspicious - Log warning |
| 100+ | Critical - Block requests |

### Score Factors

- High request rate: +25-50 points
- Failed attempts: +20-40 points
- Critical events: +100 points
- Suspicious patterns: +30 points

### Blocking

Requests are automatically blocked when:
- Abuse score ≥ 100
- Attack patterns detected
- Rate limits exceeded

### Monitoring

Track security events:
```typescript
import { getSecurityStats } from '@/lib/security'

const stats = getSecurityStats()
console.log('Total events:', stats.totalEvents)
console.log('Unique IPs:', stats.uniqueIPs)
console.log('Blocked attempts:', stats.blockedAttempts)
```

## Security Headers

### HTTP Headers

All responses include security headers:

```
X-DNS-Prefetch-Control: off
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: [CSP policy]
```

### Content Security Policy

CSP restricts resources to:
- Scripts: Same origin + CDN
- Styles: Same origin + Google Fonts
- Images: Same origin + data URLs
- Connect: Same origin + approved APIs
- Frames: None
- Objects: None

## Protected Server Actions

### All Actions Protected

1. **`generateNames`** - Newsletter name generation
   - Rate limited: 10/min
   - Input validation required
   - Abuse detection active

2. **`checkDomainAvailability`** - Domain checking
   - Rate limited: 20/min
   - Domain format validation
   - API key protection

3. **`checkTLDAvailability`** - TLD checking
   - Rate limited: 20/min
   - TLD validation
   - API key protection

4. **`checkSocialMediaHandles`** - Social media verification
   - Rate limited: 15/min
   - Handle format validation
   - API key protection

5. **`fetchExamples`** - Newsletter examples
   - Rate limited: 5/5min
   - Abuse detection active

## Error Handling

### Validation Errors

Validation errors include field information:
```typescript
{
  error: "Validation failed",
  field: "topic",
  message: "Topic must be at least 2 characters long"
}
```

### Rate Limit Errors

```typescript
{
  error: "Rate limit exceeded. Please try again later.",
  resetTime: "2025-01-01T12:00:00Z"
}
```

### Abuse Detection Errors

```typescript
{
  error: "Request blocked due to suspicious activity",
  reason: "High request rate detected"
}
```

## Monitoring and Logging

### Development Mode

Security events are logged to console:
```
[Security Event] {
  timestamp: 1234567890,
  ip: '192.168.1.1',
  action: 'generateNames',
  severity: 'low',
  details: { allowed: true }
}
```

### Production Mode

For production, implement:
1. External logging service (Sentry, LogRocket, etc.)
2. Alerting for critical events
3. Dashboard for monitoring
4. Automated IP banning

## Best Practices

### For Developers

1. **Always validate input** before processing
2. **Use rate limiting** on all actions
3. **Log security events** for analysis
4. **Monitor abuse scores** regularly
5. **Update security rules** as needed

### For Production

1. **Use Redis** for rate limiting (instead of in-memory)
2. **Implement IP banning** for repeat offenders
3. **Set up alerts** for critical security events
4. **Regular security audits** of logs
5. **CDN/WAF integration** for DDoS protection

### Example: Production Rate Limiter

Replace in-memory storage with Redis:

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function checkRateLimitRedis(key: string, config: RateLimitConfig) {
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, Math.ceil(config.interval / 1000))
  }

  if (current > config.maxRequests) {
    return { success: false, error: 'Rate limit exceeded' }
  }

  return { success: true, remaining: config.maxRequests - current }
}
```

## API Key Security

### Environment Variables

Store API keys in `.env`:
```
OPENAI_API_KEY=sk-...
API_LAYER_KEY=...
SERPER_API_KEY=...
```

### Key Rotation

Regularly rotate API keys:
1. Generate new keys
2. Update environment variables
3. Deploy with new keys
4. Revoke old keys

## Testing

### Test Rate Limiting

```typescript
// Test: Make 11 requests (limit is 10)
for (let i = 0; i < 11; i++) {
  const result = await generateNames({ topic: 'test' })
}
// Expected: Last request should fail with rate limit error
```

### Test Validation

```typescript
// Test: Invalid inputs
await generateNames({ topic: '<script>alert(1)</script>' })
// Expected: Validation error - "Invalid characters detected"

await generateNames({ topic: 'a' })
// Expected: Validation error - "Topic must be at least 2 characters"
```

### Test Abuse Detection

```typescript
// Test: Rapid requests from same IP
for (let i = 0; i < 150; i++) {
  await generateNames({ topic: 'test' })
}
// Expected: Abuse detection blocks requests
```

## Troubleshooting

### Issue: Legitimate users blocked

**Solution**: Adjust rate limits or implement allowlist
```typescript
const isAllowlisted = await checkAllowlist(ip)
if (isAllowlisted) return { allowed: true }
```

### Issue: High memory usage

**Solution**: Implement Redis or reduce retention period
```typescript
setInterval(() => {
  // Clean up entries older than 1 hour instead of 24 hours
}, 3600000)
```

### Issue: False positives in attack detection

**Solution**: Adjust attack pattern regexes in `lib/validation.ts`

## Support

For security issues or questions:
- Email: security@newsletternameideas.com
- GitHub Issues: [repository]/issues

## Changelog

### v1.0.0 (2025-01-01)
- Initial security implementation
- Rate limiting for all actions
- Input validation and sanitization
- Abuse detection and prevention
- Security headers and CORS
- Comprehensive logging
