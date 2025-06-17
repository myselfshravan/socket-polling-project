# Security Implementation Guide

## Authentication & Authorization

### JWT Implementation
```typescript
// Token Structure
interface JWTPayload {
  userId: string;
  role: 'teacher' | 'student';
  sessionId: string;
  exp: number;
  iat: number;
}

// Token Configuration
const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: '15m'
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: '7d'
  }
};
```

### Session Management
1. User Sessions:
   - Store active sessions in Redis
   - Track device information
   - Implement session revocation
   - Handle concurrent sessions

2. Session Invalidation:
   - On password change
   - On role change
   - After inactivity
   - On explicit logout

## API Security

### Rate Limiting
```typescript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Separate limits for specific endpoints
  endpoints: {
    '/api/auth/*': { max: 10 },
    '/api/polls/create': { max: 30 },
    '/api/polls/*/vote': { max: 60 }
  }
};
```

### Input Validation
1. Request Validation:
   - Sanitize all inputs
   - Validate data types
   - Check length limits
   - Validate content format

2. Response Validation:
   - Remove sensitive data
   - Consistent error format
   - Validate outgoing data

## WebSocket Security

### Connection Security
```typescript
// WebSocket Authentication Middleware
const wsAuth = (socket: Socket, next: Function) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};
```

### Event Security
1. Event Validation:
   - Validate event types
   - Check payload format
   - Verify permissions
   - Rate limit events

2. Room Management:
   - Validate room access
   - Track subscriptions
   - Clean up on disconnect

## Data Protection

### Database Security
```typescript
// MongoDB Security Configuration
const dbConfig = {
  ssl: true,
  sslValidate: true,
  sslCA: process.env.DB_CA_CERT,
  retryWrites: true,
  w: 'majority'
};
```

### Data Encryption
1. At Rest:
   - Hash user credentials
   - Encrypt sensitive data
   - Secure storage of keys

2. In Transit:
   - Use HTTPS only
   - WSS for WebSocket
   - Secure cookie flags

## Error Handling

### Security Error Responses
```typescript
enum SecurityError {
  INVALID_TOKEN = 'Invalid or expired token',
  UNAUTHORIZED = 'Unauthorized access',
  RATE_LIMITED = 'Too many requests',
  INVALID_SESSION = 'Invalid or expired session'
}

// Error Response Format
interface SecurityErrorResponse {
  error: SecurityError;
  message: string;
  code: number;
  requestId?: string;
}
```

### Logging Security Events
```typescript
interface SecurityLog {
  timestamp: Date;
  type: 'auth' | 'access' | 'error';
  userId?: string;
  action: string;
  details: object;
  ip: string;
  userAgent: string;
}
```

## CORS Configuration

```typescript
const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com']
    : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

## Security Headers

```typescript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

## Monitoring & Alerts

### Security Monitoring
1. Track Events:
   - Failed login attempts
   - Token invalidations
   - Rate limit hits
   - Unauthorized access

2. Alert Conditions:
   - Multiple failed logins
   - Suspicious IP activity
   - Token reuse attempts
   - Database access patterns

## Regular Security Tasks

1. Token Management:
   - Rotate JWT secrets
   - Clear expired sessions
   - Audit active sessions
   - Update security configs

2. Access Review:
   - Audit user roles
   - Review permissions
   - Check rate limits
   - Update CORS settings

3. Security Updates:
   - Update dependencies
   - Patch vulnerabilities
   - Review security logs
   - Test security measures